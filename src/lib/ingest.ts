import ws from "ws";
import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";
import { createHash } from "crypto";
import OpenAI from "openai";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { realtime: { transport: ws as any } }
);

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const SUMMARIZER_MODEL = "google/gemini-2.5-pro";

const RSS_FEEDS = [
  { url: "https://www.technologyreview.com/feed/", name: "MIT Tech Review" },
  { url: "https://thegradient.pub/rss/", name: "The Gradient" },
  { url: "https://techcrunch.com/category/artificial-intelligence/feed/", name: "TechCrunch AI" },
  { url: "https://venturebeat.com/category/ai/feed/", name: "VentureBeat AI" },
  { url: "https://arstechnica.com/tag/ai/feed/", name: "Ars Technica AI" },
  { url: "https://deepmind.google/blog/rss.xml", name: "Google DeepMind" },
];

type RawArticle = {
  url: string;
  title: string;
  content: string;
  sourceName: string;
  publishedAt: string;
};

type Cluster = {
  topic: string;
  indices: number[];
};

type WrittenArticle = {
  plain_title: string;
  plain_summary: string;
  content: string;
  category: string;
};

const parser = new Parser();

async function fetchArticles(): Promise<RawArticle[]> {
  const articles: RawArticle[] = [];
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

async function getAlreadyUsedUrls(): Promise<Set<string>> {
  const { data } = await supabase
    .from("articles")
    .select("sources, source_url")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(300);

  const used = new Set<string>();
  for (const row of data ?? []) {
    const sources = (row.sources as Array<{ url: string }>) ?? [];
    sources.forEach((s) => used.add(s.url));
    if (row.source_url) used.add(row.source_url);
  }
  return used;
}

async function clusterArticles(articles: RawArticle[]): Promise<Cluster[]> {
  const res = await openrouter.chat.completions.create({
    model: SUMMARIZER_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are an editor grouping AI news articles into story clusters for a newsletter. Group the following articles into 3 to 5 distinct topic clusters. Each article can only appear in one cluster. Only include articles that are genuinely about AI, ML, robotics, or closely related technology. Return JSON: { clusters: Array<{ topic: string, indices: number[] }> }",
      },
      {
        role: "user",
        content: articles.map((a, i) => `${i}: ${a.title} (${a.sourceName})`).join("\n"),
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = JSON.parse(res.choices[0].message.content ?? "{}");
  return (raw.clusters ?? []) as Cluster[];
}

async function writeArticle(topic: string, sources: RawArticle[]): Promise<WrittenArticle> {
  const sourceText = sources
    .map((s) => `Source: ${s.sourceName}\nTitle: ${s.title}\nContent: ${s.content}`)
    .join("\n\n---\n\n");

  const res = await openrouter.chat.completions.create({
    model: SUMMARIZER_MODEL,
    messages: [
      {
        role: "system",
        content: `You are a writer for Article — a newsletter that makes AI genuinely fun to read for anyone, including curious teenagers.

Write an original, standalone article about the given topic using the provided source material for facts. Do NOT write a summary of the sources — write your own piece inspired by them.

Style guide:
- Open with a vivid hook or analogy that pulls the reader in immediately (e.g. "Imagine your autocorrect went to university…")
- Use everyday language. If you must use a tech term, explain it in one casual phrase right after.
- Be warm, a little playful, and genuinely curious — like a brilliant friend explaining something fascinating
- Write 4–6 paragraphs, 350–500 words total for the content field
- You may use a subhead (## Subhead text) to break up the piece if it helps
- Close with a punchy sentence on why this matters right now

plain_summary: 60–80 word teaser that makes someone want to read the full thing.
plain_title: short magazine-style headline — curious, not clickbait, makes you lean in.

Categories (pick one): "The Big Story", "Everyday AI", "Explainer", "At Work", "We Tried It", "Big Question", "Just In"

Return JSON: { plain_title: string, plain_summary: string, content: string, category: string }`,
      },
      {
        role: "user",
        content: `Topic: ${topic}\n\nSource material:\n\n${sourceText}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = res.choices[0].message.content ?? "{}";
  return JSON.parse(raw) as WrittenArticle;
}

function clusterHash(urls: string[]): string {
  return createHash("sha256").update([...urls].sort().join("::")).digest("hex");
}

async function isDuplicate(hash: string): Promise<boolean> {
  const { data } = await supabase
    .from("articles")
    .select("id")
    .eq("content_hash", hash)
    .maybeSingle();
  return !!data;
}

async function run() {
  console.log("Starting ingestion...");
  const allArticles = await fetchArticles();
  console.log(`Fetched ${allArticles.length} articles from feeds`);

  const usedUrls = await getAlreadyUsedUrls();
  const newArticles = allArticles.filter((a) => !usedUrls.has(a.url));
  console.log(`New (unused) articles: ${newArticles.length}`);

  if (newArticles.length < 3) {
    console.log("Not enough new articles to write. Skipping.");
    return;
  }

  let clusters: Cluster[];
  try {
    clusters = await clusterArticles(newArticles);
    console.log(`Got ${clusters.length} topic clusters`);
  } catch (err) {
    console.error("Clustering failed:", err);
    return;
  }

  let published = 0;

  for (const cluster of clusters) {
    const clusterSources = cluster.indices
      .filter((i) => i >= 0 && i < newArticles.length)
      .map((i) => newArticles[i]);

    if (clusterSources.length === 0) continue;

    const hash = clusterHash(clusterSources.map((s) => s.url));

    if (await isDuplicate(hash)) {
      console.log(`[SKIP] Already processed: ${cluster.topic}`);
      continue;
    }

    let article: WrittenArticle;
    try {
      article = await writeArticle(cluster.topic, clusterSources);
    } catch (err) {
      console.error(`Failed to write article for "${cluster.topic}":`, err);
      continue;
    }

    if (!article.plain_title || !article.plain_summary || !article.content) {
      console.error(`Incomplete LLM response for "${cluster.topic}":`, article);
      continue;
    }

    const sourcesJson = clusterSources.map((s) => ({ url: s.url, name: s.sourceName }));

    const { error } = await supabase.from("articles").insert({
      source_url: `article:${hash}`,
      source_name: clusterSources.map((s) => s.sourceName).join(", "),
      original_title: cluster.topic,
      published_at: clusterSources[0]?.publishedAt ?? new Date().toISOString(),
      content_hash: hash,
      plain_title: article.plain_title,
      plain_summary: article.plain_summary,
      content: article.content,
      sources: sourcesJson,
      category: article.category,
      quality_score: 8,
      is_ai_related: true,
      status: "published",
      rejection_reason: null,
    });

    if (error) {
      console.error(`DB insert failed for "${article.plain_title}":`, error.message);
      continue;
    }

    published++;
    console.log(`[PUBLISHED] ${article.plain_title}`);
  }

  console.log(`Done. Published: ${published} new articles.`);
}

run().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
