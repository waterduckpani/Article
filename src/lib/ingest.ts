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

const SUMMARIZER_MODEL = "google/gemini-3.1-flash-lite";

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

type PendingArticle = {
  article: WrittenArticle;
  hash: string;
  sourcesJson: Array<{ url: string; name: string; title: string }>;
  sourceCount: number;
  publishedAt: string;
  sourceName: string;
  originalTitle: string;
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

Write an original, standalone article using the provided source material for facts. Do NOT summarise the sources — write your own piece.

FIXED FORMAT — content must have EXACTLY these 6 blocks separated by \\n\\n:

1. HOOK: One vivid analogy or scenario that pulls the reader in (2–3 sentences). Start with "Imagine…" or a scene-setting opener.
2. WHAT'S HAPPENING: Plain-English explanation of the actual news or topic (2–3 sentences). No jargon — if you use a tech term, explain it in one casual phrase.
3. ## [A short, punchy subheading for the next section]
4. THE DETAIL: Go deeper — what's interesting, surprising, or clever about this (3–4 sentences). This is where you can have fun with comparisons.
5. WHY IT MATTERS: Real-world impact — who does this affect and how? Keep it grounded and relatable (2–3 sentences).
6. THE BOTTOM LINE: One or two punchy closing sentences. End on something memorable.

Tone: warm, playful, genuinely curious — like a brilliant friend explaining something fascinating. Never dry or condescending.

plain_title: short magazine-style headline, curious and clickable, not a news wire headline.
plain_summary: 60–80 word teaser pulling from the hook + why it matters. Makes someone want to click.

Categories (pick one): "Everyday AI", "Explainer", "At Work", "We Tried It", "Big Question", "Just In"

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

const FRESHNESS_HOURS = 24;

async function run() {
  console.log("Starting ingestion...");
  const allArticles = await fetchArticles();
  console.log(`Fetched ${allArticles.length} articles from feeds`);

  const cutoff = Date.now() - FRESHNESS_HOURS * 60 * 60 * 1000;
  const freshArticles = allArticles.filter((a) => {
    const t = new Date(a.publishedAt).getTime();
    return !isNaN(t) && t >= cutoff;
  });
  console.log(`Fresh (last ${FRESHNESS_HOURS}h): ${freshArticles.length} of ${allArticles.length}`);

  const usedUrls = await getAlreadyUsedUrls();
  const newArticles = freshArticles.filter((a) => !usedUrls.has(a.url));
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

  // Stage 1: write all articles (category assigned by LLM, excluding "The Big Story")
  const pending: PendingArticle[] = [];

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

    pending.push({
      article,
      hash,
      sourcesJson: clusterSources.map((s) => ({ url: s.url, name: s.sourceName, title: s.title })),
      sourceCount: clusterSources.length,
      publishedAt: clusterSources[0]?.publishedAt ?? new Date().toISOString(),
      sourceName: clusterSources.map((s) => s.sourceName).join(", "),
      originalTitle: cluster.topic,
    });
  }

  if (pending.length === 0) {
    console.log("No new articles to publish.");
    return;
  }

  // Stage 2: elect The Big Story — the cluster backed by the most source articles
  const bigStoryIdx = pending.reduce(
    (best, p, i) => p.sourceCount > pending[best].sourceCount ? i : best,
    0
  );
  console.log(`Big story elected: "${pending[bigStoryIdx].article.plain_title}" (${pending[bigStoryIdx].sourceCount} sources)`);

  // Stage 3: insert all with correct categories
  let published = 0;

  for (let i = 0; i < pending.length; i++) {
    const { article, hash, sourcesJson, publishedAt, sourceName, originalTitle } = pending[i];
    const category = i === bigStoryIdx ? "The Big Story" : article.category;

    const { error } = await supabase.from("articles").insert({
      source_url: `article:${hash}`,
      source_name: sourceName,
      original_title: originalTitle,
      published_at: publishedAt,
      content_hash: hash,
      plain_title: article.plain_title,
      plain_summary: article.plain_summary,
      content: article.content,
      sources: sourcesJson,
      category,
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
    console.log(`[PUBLISHED] ${article.plain_title} [${category}]`);
  }

  console.log(`Done. Published: ${published} new articles.`);
}

run().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
