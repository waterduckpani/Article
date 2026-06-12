import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";
import { createHash } from "crypto";
import OpenAI from "openai";
import ws from "ws";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { realtime: { transport: ws } }
);

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const MODEL = "google/gemini-flash-1.5";

const RSS_FEEDS = [
  { url: "https://www.technologyreview.com/feed/", name: "MIT Tech Review" },
  { url: "https://thegradient.pub/rss/", name: "The Gradient" },
  { url: "https://feeds.reuters.com/reuters/technologyNews", name: "Reuters Technology" },
  { url: "https://arstechnica.com/tag/ai/feed/", name: "Ars Technica AI" },
  { url: "https://deepmind.google/blog/rss.xml", name: "Google DeepMind" },
];

const parser = new Parser();

async function fetchArticles() {
  const articles: { url: string; title: string; content: string; sourceName: string; publishedAt: string }[] = [];

  for (const feed of RSS_FEEDS) {
    try {
      const result = await parser.parseURL(feed.url);
      for (const item of result.items.slice(0, 10)) {
        if (!item.link || !item.title) continue;
        articles.push({
          url: item.link,
          title: item.title,
          content: item.contentSnippet || item.summary || item.title,
          sourceName: feed.name,
          publishedAt: item.pubDate || new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error(`Failed to fetch feed: ${feed.name}`, err);
    }
  }

  return articles;
}

function hashArticle(url: string, title: string) {
  return createHash("sha256").update(`${url}::${title}`).digest("hex");
}

async function isDuplicate(hash: string, url: string) {
  const { data } = await supabase
    .from("articles")
    .select("id")
    .or(`content_hash.eq.${hash},source_url.eq.${url}`)
    .maybeSingle();
  return !!data;
}

async function summarize(title: string, content: string) {
  const res = await openrouter.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are an AI news writer for a general audience with no technical background. Rewrite the article in plain, clear English. Avoid jargon. Keep it under 150 words. Return JSON: { plain_title: string, plain_summary: string, category: string }",
      },
      {
        role: "user",
        content: `Title: ${title}\n\nContent: ${content}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = res.choices[0].message.content ?? "{}";
  return JSON.parse(raw) as { plain_title: string; plain_summary: string; category: string };
}

async function qualityCheck(plain_title: string, plain_summary: string) {
  const res = await openrouter.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are a content quality checker for an AI news site. Evaluate the article. Return JSON: { is_ai_related: boolean, quality_score: number (1-10), rejection_reason: string | null }. Reject (score < 7) if: not about AI, opinion/clickbait, unclear, or too vague.",
      },
      {
        role: "user",
        content: `Title: ${plain_title}\n\nSummary: ${plain_summary}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = res.choices[0].message.content ?? "{}";
  return JSON.parse(raw) as {
    is_ai_related: boolean;
    quality_score: number;
    rejection_reason: string | null;
  };
}

async function run() {
  console.log("Starting ingestion...");
  const articles = await fetchArticles();
  console.log(`Fetched ${articles.length} articles from feeds`);

  let published = 0;
  let rejected = 0;
  let skipped = 0;

  for (const article of articles) {
    const hash = hashArticle(article.url, article.title);

    if (await isDuplicate(hash, article.url)) {
      skipped++;
      continue;
    }

    let summary, quality;

    try {
      summary = await summarize(article.title, article.content);
      quality = await qualityCheck(summary.plain_title, summary.plain_summary);
    } catch (err) {
      console.error(`LLM error for: ${article.title}`, err);
      continue;
    }

    const status =
      quality.is_ai_related && quality.quality_score >= 7 ? "published" : "rejected";

    await supabase.from("articles").insert({
      source_url: article.url,
      source_name: article.sourceName,
      original_title: article.title,
      published_at: article.publishedAt,
      content_hash: hash,
      plain_title: summary.plain_title,
      plain_summary: summary.plain_summary,
      category: summary.category,
      quality_score: quality.quality_score,
      is_ai_related: quality.is_ai_related,
      status,
      rejection_reason: quality.rejection_reason,
    });

    status === "published" ? published++ : rejected++;
    console.log(`[${status.toUpperCase()}] ${summary.plain_title}`);
  }

  console.log(`Done. Published: ${published} | Rejected: ${rejected} | Skipped (duplicate): ${skipped}`);
}

run().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
