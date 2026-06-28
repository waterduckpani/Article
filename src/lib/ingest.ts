import ws from "ws";
import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";
import { createHash, randomUUID } from "crypto";
import OpenAI from "openai";

function generateSlug(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-$/, "");
  return `${base}-${id.slice(0, 6)}`;
}

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

// Single source of truth for the categories the writer may pick.
// "The Big Story" is NOT here — it is assigned automatically by the election
// stage (see run()). "We Tried It" is intentionally excluded: this pipeline
// only rewrites RSS sources and never does hands-on testing, so it can never
// honestly earn that label.
const CATEGORY_GUIDE: { name: string; when: string }[] = [
  {
    name: "Everyday AI",
    when: "Choose this when the story is about how AI shows up in ordinary life — the apps, tools, and habits regular people actually touch, and the small everyday decisions AI is starting to shape.",
  },
  {
    name: "Explainer",
    when: "Choose this when the heart of the piece is teaching how something works from the ground up, rather than reporting a fresh event. Best for \"what is this / how does this actually work\" stories a complete beginner could learn from.",
  },
  {
    name: "At Work",
    when: "Choose this when the story is mainly about jobs, careers, and workplaces — how AI changes the work people do and what it means for their livelihoods.",
  },
  {
    name: "Big Question",
    when: "Choose this when the story is really about the harder questions AI raises — ethics, power, safety, fairness, and what it means for society.",
  },
  {
    name: "Just In",
    when: "Choose this when the piece is breaking or very recent news whose main value is that it just happened. This is also the default when the story is news-driven and doesn't clearly fit another category.",
  },
];

const WRITER_CATEGORY_NAMES = CATEGORY_GUIDE.map((c) => c.name);
const CATEGORY_BLOCK = CATEGORY_GUIDE.map((c) => `- "${c.name}" — ${c.when}`).join("\n");

// Coerce whatever the model returns into a known category so the value never
// drifts (e.g. "Everyday" -> "Everyday AI"). Anything unrecognised falls back
// to "Just In" rather than being stored raw and disappearing from category pages.
function normalizeCategory(raw: string | undefined | null): string {
  const lower = (raw ?? "").trim().toLowerCase();
  for (const name of WRITER_CATEGORY_NAMES) {
    if (lower === name.toLowerCase()) return name;
  }
  if (lower === "everyday" || lower === "everyday-ai" || lower === "everydayai") return "Everyday AI";
  if (lower === "explainers") return "Explainer";
  return "Just In";
}

const WRITING_PROMPT = `You are the writer for Article, a newsletter that helps everyday people genuinely understand AI. You will be given source material: one or more news articles written by tech journalists for an industry audience. Your job is NOT to summarise them. Your job is to take the facts buried inside that insider writing and rebuild the whole story for a completely different reader.

────────────────────────────────────────────
THE CORE CHALLENGE — READ THIS TWICE
────────────────────────────────────────────
The source was written for people who already speak the language of tech. It assumes the reader knows what a model is, what training means, why an export ban matters, what "open-source weights" are. Your reader knows none of that.

So you cannot just rephrase the source. If you follow its sentence structure and swap a few words, you will leak its assumptions and lose your reader. You must do something harder:

1. EXTRACT — Strip the source down to its actual facts. What literally happened? Who did what? What is genuinely new? Ignore the journalist's framing, their jargon, their assumed context. Pull out only the bare, verifiable facts.

2. UNDERSTAND — Work out WHY each fact matters and HOW the underlying thing actually works. The source often states something without explaining the mechanism ("they fine-tuned open-source models"). You must understand it well enough to explain the mechanism from scratch, because your reader needs the how, not just the what.

3. REBUILD — Write a brand-new article from those facts, in your own structure, for your own reader. The source is your fact sheet, never your template. If your paragraph order mirrors the source's paragraph order, you're doing it wrong — you're summarising, not rebuilding.

A good test: someone who read the original tech article and then reads yours should feel like yours explained things the original never bothered to. You are not the source's echo. You are the translator who actually shows their work.

────────────────────────────────────────────
YOUR READER
────────────────────────────────────────────
A normal, curious person. They've used ChatGPT or talked to an AI assistant — so they know AI exists and roughly what it can do. But they have never read about how any of it works or followed the AI industry. They know the surface, not what's underneath.

This cuts both ways:
- DON'T explain what ChatGPT is or that AI can write text and answer questions — they know. Treating them as clueless is patronising.
- DO explain everything under the hood they've never had reason to learn: what a "model" really is, why AI confidently makes things up, what "training" actually involves, why one company's AI differs from another's, why any of today's news is a big deal.

Fill in the why behind the things they've already touched.

────────────────────────────────────────────
VOICE
────────────────────────────────────────────
A warm, sharp friend explaining something genuinely interesting over coffee. The reader should feel in-the-know, never lectured. They finish thinking "oh — THAT'S what's actually going on."

- Clear, conversational sentences. One idea per sentence where you can manage it.
- No sentence should need re-reading.
- Assume strong general intelligence, zero technical AI background.
- Simplify boldly. Better to be slightly incomplete and fully understood than precise and impenetrable. Never get the core fact wrong — but when there's a choice, always take the simpler explanation.

────────────────────────────────────────────
HANDLING JARGON FROM THE SOURCE
────────────────────────────────────────────
The source will be full of terms your reader won't know. For every one, you have three choices, in order of preference:

1. Explain it in plain words the first time it appears, inline: "a large language model — the engine behind tools like ChatGPT".
2. Replace it with what it actually does, and drop the term entirely: instead of "they used open-source weights", write "they started from a freely available version of the AI that anyone is allowed to download and adapt".
3. Cut it, if it's not load-bearing for the reader's understanding.

Never pass a term through unexplained just because the source used it. Terms that ALWAYS need handling on first use: model, dataset, API, open-source, weights, fine-tune, training, algorithm, neural network, parameters, inference, token, prompt, frontier, architecture, benchmark, and any named hypothesis or technical theory.

────────────────────────────────────────────
ANALOGIES
────────────────────────────────────────────
Your sharpest tool for turning an insider fact into a normal-person understanding. Reach for the everyday: librarians, recipes, apprentices, a keen intern, autocomplete, sorting mail. Use them where they genuinely unlock an idea — not as a decorative opening ritual. One analogy that truly lands beats three that gesture.

────────────────────────────────────────────
ACCURACY GUARDRAILS
────────────────────────────────────────────
- Use ONLY facts present in the source material. Do not invent details, numbers, names, or quotes.
- If the source is thin on how something works, explain the general mechanism from established knowledge — but never fabricate specifics about THIS event that aren't in the source.
- If something in the source is genuinely uncertain or speculative, say so plainly. Don't smooth it into false confidence.
- Don't let simplification tip into being wrong. The core fact is sacred; only the explanation around it gets simplified.

────────────────────────────────────────────
BANNED WORDS
────────────────────────────────────────────
Hype: wild, crazy, mind-blowing, game-changer, revolutionary, groundbreaking, exciting, fascinating, amazing, incredible, unleash, supercharge, transform everything, change the world.

Insider filler used bare: leverage, ecosystem, paradigm, stakeholders, proprietary, scalable, robust.

Replace any banned word with the specific fact or concrete detail that does its job better.

────────────────────────────────────────────
STRUCTURE — five blocks, each separated by a blank line
────────────────────────────────────────────
1. HOOK — One or two sentences that make a normal person care. Lead with the human stakes or the surprising-but-true fact, not the company or the tech. No "In a world where…" and no "Imagine…".

2. WHAT'S HAPPENING — The plain-English account of what actually occurred, built from the extracted facts. Define every term inline as it appears. This is reporting, rebuilt — not a summary of the source.

3. ## [A short, plain subheading specific to this story]

4. HOW IT WORKS — The part the source probably skipped. Explain the mechanism underneath the news: not just that it happened, but how the thing actually functions, in everyday terms. This block is where you earn the reader's trust.

5. WHY IT MATTERS — What this means for the reader and the wider world. Concrete, honest, no hype. End with something that actually lands — a reframe, a question worth sitting with, or a clear implication. Not a summary.

HOW TO LABEL THE BLOCKS (this controls how the page renders — follow exactly):
- Separate every block with a blank line.
- Write the HOOK as plain prose with NO label in front of it.
- Begin blocks 2, 4 and 5 with their label in capital letters exactly as written — WHAT'S HAPPENING, HOW IT WORKS, WHY IT MATTERS — followed by the text on the same line.
- Write block 3 as a Markdown subheading beginning with "## ".

────────────────────────────────────────────
ALSO RETURN
────────────────────────────────────────────
plain_title: short, specific, curious — not clickbait, not a wire headline. Written for someone scrolling who's never heard of this.

plain_summary: 60–80 word teaser that makes a curious person want the full piece, while already teaching them one real thing.

category: pick exactly one — choose the single best fit:
${CATEGORY_BLOCK}
Do NOT choose "The Big Story" — that label is assigned automatically to the day's single most important piece. If nothing fits cleanly, choose "Just In".

Return JSON: { plain_title: string, plain_summary: string, content: string, category: string }`;

const QUALITY_PROMPT = `You are the editor for Article, a newsletter that helps everyday people with zero technical background genuinely understand AI. You are the gate that keeps articles from reading like they were written for an industry audience.

Picture the reader: a curious person who has used ChatGPT but has never read about how AI works or followed the industry. They are smart but have no technical AI background. Judge the article entirely through their eyes.

Review this article and score it. Return JSON: { score: number, feedback: string, rewrite_needed: boolean, is_relevant: boolean }

FIRST — set is_relevant: false (and rewrite_needed: false) if the article is NOT genuinely about AI, machine learning, robotics, or closely related technology. Finance, business strategy, investing, space exploration, or general tech news that does not involve AI are NOT relevant. If is_relevant is false, skip all other checks.

Score 1–10. Set rewrite_needed: true if score < 7.

THE TWO CHECKS THAT MATTER MOST (a failure on either caps the score at 5):
- READING LEVEL: Could the reader above get through every sentence once, without re-reading and without hitting an idea they can't follow? If any sentence assumes industry context they don't have, it fails here.
- JARGON: Is every technical term either explained in plain words the first time it appears, or replaced with what it actually does? Terms like model, training, weights, fine-tune, open-source, API, dataset, parameters, inference, token, prompt, neural network, benchmark, frontier, architecture must NEVER be left hanging. One unexplained term left to fend for itself is a failure.

THEN check:
- Does it explain HOW the thing actually works — the mechanism the source probably skipped — not just what happened?
- Does it rebuild the story for this reader, rather than rephrasing the source's structure and leaking its assumptions?
- Does it avoid talking down? It should NOT explain what ChatGPT is or that AI can answer questions — the reader knows the surface. Patronising the reader is a fault too.
- Does it make the stakes concrete — for a real type of person, in a real situation?
- Does the opening make a normal person care without "Imagine…" or "In a world where…", and does the ending leave them with something real, not a summary?
- Does it avoid banned hype (wild, crazy, mind-blowing, game-changer, revolutionary, groundbreaking, exciting, fascinating, amazing, incredible, unleash, supercharge) and bare insider filler (leverage, ecosystem, paradigm, stakeholders, proprietary, scalable, robust)?

feedback: one sentence naming the single biggest barrier to a beginner understanding this — point to the specific term or sentence — or "Passes." if score >= 7.`;

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
  is_relevant: boolean;
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
    return { score: 8, feedback: "Parse error — skipping quality gate.", rewrite_needed: false, is_relevant: true };
  }
}

async function writeWithQualityGate(topic: string, sources: RawArticle[]): Promise<WrittenArticle | null> {
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

  if (quality.is_relevant === false) {
    console.log(`  [QUALITY] Article is not AI-related — skipping.`);
    return null;
  }

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

    let article: WrittenArticle | null;
    try {
      article = await writeWithQualityGate(cluster.topic, clusterSources);
    } catch (err) {
      console.error(`Failed to write article for "${cluster.topic}":`, err);
      continue;
    }

    if (!article) continue;

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

  // Stage 2: elect The Big Story — ask the LLM which story has the most real-world impact
  let bigStoryIdx = 0;
  try {
    const candidates = pending.map((p, i) =>
      `${i}: ${p.article.plain_title}\n   ${p.article.plain_summary}`
    ).join("\n\n");

    const electionRes = await openrouter.chat.completions.create({
      model: SUMMARIZER_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are the editor of Article, an AI newsletter. Given a list of today's stories, pick the single most important one to be 'The Big Story' — the one with the broadest real-world impact, the most significant shift in how AI affects everyday people, or the highest stakes for society. Ignore hype. Prefer concrete consequences over announcements. Return JSON: { index: number, reason: string }",
        },
        { role: "user", content: candidates },
      ],
      response_format: { type: "json_object" },
    });

    const election = JSON.parse(electionRes.choices[0].message.content ?? "{}");
    if (typeof election.index === "number" && election.index >= 0 && election.index < pending.length) {
      bigStoryIdx = election.index;
      console.log(`Big story elected: "${pending[bigStoryIdx].article.plain_title}" — ${election.reason}`);
    } else {
      throw new Error("Invalid election index");
    }
  } catch (err) {
    // Fall back to most-sourced story if LLM election fails
    console.warn("Big story election failed, falling back to source count:", err);
    bigStoryIdx = pending.reduce(
      (best, p, i) => p.sourceCount > pending[best].sourceCount ? i : best,
      0
    );
    console.log(`Big story elected (fallback): "${pending[bigStoryIdx].article.plain_title}" (${pending[bigStoryIdx].sourceCount} sources)`);
  }

  // Stage 3: insert all with correct categories
  let published = 0;

  for (let i = 0; i < pending.length; i++) {
    const { article, hash, sourcesJson, publishedAt, sourceName, originalTitle } = pending[i];
    const category = i === bigStoryIdx ? "The Big Story" : normalizeCategory(article.category);

    const newId = randomUUID();
    const slug = generateSlug(article.plain_title, newId);

    const { error } = await supabase.from("articles").insert({
      id: newId,
      slug,
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
