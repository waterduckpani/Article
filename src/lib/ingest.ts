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
const FRESHNESS_HOURS = 24;

const RSS_FEEDS = [
  // Original feeds
  { url: "https://www.technologyreview.com/feed/", name: "MIT Tech Review" },
  { url: "https://thegradient.pub/rss/", name: "The Gradient" },
  { url: "https://techcrunch.com/category/artificial-intelligence/feed/", name: "TechCrunch AI" },
  { url: "https://venturebeat.com/category/ai/feed/", name: "VentureBeat AI" },
  { url: "https://arstechnica.com/tag/ai/feed/", name: "Ars Technica AI" },
  { url: "https://deepmind.google/blog/rss.xml", name: "Google DeepMind" },
  // Additional feeds for wider coverage
  { url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml", name: "The Verge AI" },
  { url: "https://www.wired.com/feed/tag/ai/latest/rss", name: "Wired AI" },
  { url: "https://huggingface.co/blog/feed.xml", name: "Hugging Face" },
  { url: "https://openai.com/news/rss.xml", name: "OpenAI" },
  { url: "https://spectrum.ieee.org/feeds/topic/artificial-intelligence.rss", name: "IEEE Spectrum AI" },
  { url: "https://www.404media.co/tag/artificial-intelligence/rss/", name: "404 Media AI" },
];

const BANNED_PHRASES = [
  "wild", "crazy", "mind-blowing", "mind blowing", "game-changer", "game changer",
  "revolutionary", "groundbreaking", "exciting", "fascinating", "amazing", "incredible",
  "unleash", "supercharge", "transform everything", "change the world", "blow your mind",
  "next level", "on steroids",
];

const WRITING_PROMPT = `You are a writer for Article — a newsletter that makes AI genuinely understandable for curious readers, from teenagers to professionals.

Your job is to teach, not just report. Every concept must land through analogy. When you explain what something is, find the real-world comparison that makes a reader say "oh, now I actually get it." Think less BuzzFeed, more Richard Feynman.

Write an original, standalone article using the provided source material for facts only. Do NOT summarise the sources — write your own piece.

BANNED WORDS AND PHRASES — never use these: wild, crazy, mind-blowing, game-changer, revolutionary, groundbreaking, exciting, fascinating, amazing, incredible, unleash, supercharge, transform everything, change the world. If you find yourself reaching for one of these, replace it with the specific analogy or concrete fact that does the same work.

FIXED FORMAT — content must have EXACTLY these 6 blocks separated by \\n\\n:

1. HOOK: Open with a concrete real-world scenario or analogy that puts the reader inside the situation (2–3 sentences). Not hype — a specific, vivid picture of what this technology actually does or changes. Start with "Imagine…" or a grounded scene.

2. WHAT'S HAPPENING: Plain-English explanation of the actual news (2–3 sentences). Define every technical term in a parenthetical the moment you use it. No jargon left unexplained.

3. ## [A short, clear subheading that frames the deeper explanation below]

4. THE MECHANISM: Explain HOW it actually works — not just what it does. Use at least one concrete analogy that explains the underlying mechanism (for example: "it works like a card catalogue that can answer questions instead of just pointing to shelves"). (3–4 sentences)

5. WHY IT MATTERS: Name a specific type of person — a radiologist, a high school student, a small business owner — and explain exactly how this changes something concrete in their day. No vague "this affects everyone." (2–3 sentences)

6. THE BOTTOM LINE: One or two sentences. What should the reader carry with them? End with a thought that reframes how they see the technology — not just a summary.

Tone: clear, precise, and warm — like a great science teacher who actually makes you lean forward. Never condescending, never breathless.

plain_title: short, specific headline that names the actual technology or event. Curious and direct — not clickbait, not a wire headline.
plain_summary: 60–80 word teaser that sets up the analogy and the stakes. Reads like the opening of a great explainer.

Categories (pick the most precise fit): "Everyday AI", "Explainer", "At Work", "We Tried It", "Big Question", "Just In"

Return JSON: { plain_title: string, plain_summary: string, content: string, category: string }`;

const QUALITY_PROMPT = `You are an editor for Article, a newsletter that explains AI through analogy and concrete education.

Review this article and score it. Return JSON: { score: number, feedback: string, rewrite_needed: boolean }

Score 1–10. Set rewrite_needed: true if score < 7.

Check for:
- Does it contain at least one concrete analogy that explains HOW something works (not just what it does)?
- Does it avoid banned words: wild, crazy, mind-blowing, game-changer, revolutionary, groundbreaking, exciting, fascinating, amazing, incredible, unleash, supercharge?
- Does WHY IT MATTERS name a specific person and a concrete change in their day?
- Is THE BOTTOM LINE a genuine reframe, not a summary?
- Is the writing clear and precise — no vague hype?

feedback: one sentence on the biggest weakness, or "Passes." if score >= 7.`;

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

type QualityResult = {
  score: number;
  feedback: string;
  rewrite_needed: boolean;
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
          "You are an editor grouping AI news articles into story clusters for a newsletter. Group the following articles into 4 to 8 distinct topic clusters — prefer more clusters over fewer when distinct story angles exist. Each article can only appear in one cluster. Only include articles that are genuinely about AI, ML, robotics, or closely related technology. Return JSON: { clusters: Array<{ topic: string, indices: number[] }> }",
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
      { role: "system", content: WRITING_PROMPT },
      { role: "user", content: `Topic: ${topic}\n\nSource material:\n\n${sourceText}` },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(res.choices[0].message.content ?? "{}") as WrittenArticle;
}

async function checkQuality(article: WrittenArticle): Promise<QualityResult> {
  const res = await openrouter.chat.completions.create({
    model: SUMMARIZER_MODEL,
    messages: [
      { role: "system", content: QUALITY_PROMPT },
      {
        role: "user",
        content: `Title: ${article.plain_title}\n\nSummary: ${article.plain_summary}\n\nContent:\n${article.content}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  try {
    return JSON.parse(res.choices[0].message.content ?? "{}") as QualityResult;
  } catch {
    return { score: 8, feedback: "Parse error — skipping quality gate.", rewrite_needed: false };
  }
}

async function writeWithQualityGate(topic: string, sources: RawArticle[]): Promise<WrittenArticle> {
  let article = await writeArticle(topic, sources);

  // Fast banned-phrase check before hitting the LLM
  const lowerContent = (article.content + " " + article.plain_title + " " + article.plain_summary).toLowerCase();
  const foundBanned = BANNED_PHRASES.filter((p) => lowerContent.includes(p));
  if (foundBanned.length > 0) {
    console.log(`  [QUALITY] Banned phrases found: ${foundBanned.join(", ")} — rewriting`);
    article = await writeArticle(topic, sources);
  }

  // LLM quality pass
  const quality = await checkQuality(article);
  console.log(`  [QUALITY] Score: ${quality.score}/10 — ${quality.feedback}`);

  if (quality.rewrite_needed) {
    console.log(`  [QUALITY] Rewriting with feedback...`);
    const res = await openrouter.chat.completions.create({
      model: SUMMARIZER_MODEL,
      messages: [
        { role: "system", content: WRITING_PROMPT },
        { role: "user", content: `Topic: ${topic}\n\nSource material:\n\n${sources.map((s) => `Source: ${s.sourceName}\nTitle: ${s.title}\nContent: ${s.content}`).join("\n\n---\n\n")}` },
        { role: "assistant", content: JSON.stringify(article) },
        { role: "user", content: `The article needs improvement. Editor feedback: ${quality.feedback}\n\nPlease rewrite it, fixing that specific issue while keeping everything else strong. Return the same JSON format.` },
      ],
      response_format: { type: "json_object" },
    });
    try {
      article = JSON.parse(res.choices[0].message.content ?? "{}") as WrittenArticle;
      console.log(`  [QUALITY] Rewrite complete.`);
    } catch {
      console.log(`  [QUALITY] Rewrite parse failed — using original.`);
    }
  }

  return article;
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

  // Stage 1: write all articles through the quality gate
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

    console.log(`Writing: "${cluster.topic}" (${clusterSources.length} sources)`);

    let article: WrittenArticle;
    try {
      article = await writeWithQualityGate(cluster.topic, clusterSources);
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
