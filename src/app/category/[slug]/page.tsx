import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticlesByCategory } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://articlenews.co";

const CATEGORIES: Record<string, string> = {
  "the-big-story": "The Big Story",
  "everyday-ai": "Everyday AI",
  "explainer": "Explainer",
  "at-work": "At Work",
  "we-tried-it": "We Tried It",
  "big-question": "Big Question",
  "just-in": "Just In",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "the-big-story": "The day's most important AI development, explained in full. No noise — just the story that actually matters, and why it does.",
  "everyday-ai": "How AI is changing ordinary life — apps, tools, habits, and the small decisions that add up. Practical and jargon-free.",
  "explainer": "New to AI? Our Explainers break down complex ideas from scratch — no math, no prior knowledge needed. Plain English only.",
  "at-work": "AI in the workplace: how it's changing jobs, workflows, and what it means for your career. Real talk, no hype.",
  "we-tried-it": "We test AI tools so you don't have to. Hands-on reviews, honest takes, and no sponsored fluff.",
  "big-question": "The harder questions about AI — ethics, power, what it all means for society. Thoughtful, not alarmist.",
  "just-in": "Breaking AI news, explained fast. The latest developments before anyone else has had time to make sense of them.",
};

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = CATEGORIES[slug];
  if (!name) return {};
  const description = CATEGORY_DESCRIPTIONS[slug] ?? `Browse all Article stories filed under ${name}. Daily AI news explained in plain English.`;
  return {
    title: `${name} — Article`,
    description,
    alternates: { canonical: `${SITE_URL}/category/${slug}` },
    openGraph: {
      title: `${name} — Article`,
      description,
      url: `${SITE_URL}/category/${slug}`,
      siteName: "Article",
      type: "website",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: `${name} — Article` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — Article`,
      description,
      images: ["/og-image.png"],
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categoryName = CATEGORIES[slug];
  if (!categoryName) notFound();

  const articles = await getArticlesByCategory(categoryName);

  return (
    <>
      <Navbar />
      <main style={{ background: "#F4E9CD", minHeight: "100vh" }}>
        <div style={{ background: "#031926", padding: "80px 24px 64px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <a
              href="/"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "#468189",
                textDecoration: "none",
                display: "inline-block",
                marginBottom: 32,
              }}
            >
              ← All stories
            </a>
            <div style={{ marginBottom: 16 }}>
              <span
                style={{
                  background: "#E0A53F",
                  color: "#031926",
                  padding: "6px 16px",
                  borderRadius: 40,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                }}
              >
                {categoryName}
              </span>
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(32px, 4vw, 52px)",
                lineHeight: 1.06,
                letterSpacing: "-.03em",
                color: "#F4E9CD",
                margin: "16px 0 0",
              }}
            >
              {categoryName}
            </h1>
          </div>
        </div>

        <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>
          {articles.length === 0 ? (
            <p style={{ color: "#4a6872", fontFamily: "var(--font-body)" }}>No articles yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {articles.map((article, i) => (
                <a
                  key={article.id}
                  href={`/articles/${article.slug ?? article.id}`}
                  style={{
                    display: "block",
                    padding: "28px 0",
                    borderBottom: "1px solid rgba(3,25,38,.1)",
                    textDecoration: "none",
                    borderTop: i === 0 ? "1px solid rgba(3,25,38,.1)" : undefined,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: ".1em",
                      color: "#77ACA2",
                      textTransform: "uppercase",
                      marginBottom: 10,
                    }}
                  >
                    {formatDate(article.published_at)}
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 22,
                      lineHeight: 1.2,
                      letterSpacing: "-.02em",
                      color: "#031926",
                      margin: "0 0 10px",
                    }}
                  >
                    {article.plain_title}
                  </h2>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: "#4a6872",
                      margin: 0,
                    }}
                  >
                    {article.plain_summary}
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
