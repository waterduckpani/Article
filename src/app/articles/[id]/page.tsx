import { notFound } from "next/navigation";
import { getArticleById, getAdjacentArticles } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArticleBody } from "@/components/ArticleBody";
import { Button } from "@/components/ui/Button";
import type { ArticleSource, AdjacentArticle } from "@/lib/supabase";

export const revalidate = 3600;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  const { prev, next } = await getAdjacentArticles(id, article.published_at);

  const content = article.content ?? article.plain_summary;
  const sources: ArticleSource[] = article.sources ?? (article.source_url && !article.source_url.startsWith("article:") ? [{ url: article.source_url, name: article.source_name }] : []);
  const mins = readingTime(content);

  return (
    <>
      <Navbar />
      <main style={{ background: "#F4E9CD", minHeight: "100vh" }}>

        {/* Dark hero header */}
        <div
          style={{
            background: "#031926",
            padding: "120px 32px 80px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Giant decorative letter */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: -40,
              right: -20,
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 340,
              lineHeight: 0.85,
              color: "rgba(70,129,137,.07)",
              userSelect: "none",
              pointerEvents: "none",
              letterSpacing: "-.05em",
            }}
          >
            A
          </div>

          <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
            {/* Back link + prev/next */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48 }}>
              <a
                href="/"
                className="nav-link"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "#468189",
                }}
              >
                ← All stories
              </a>
              <div style={{ display: "flex", gap: 12 }}>
                {prev && (
                  <a
                    href={`/articles/${prev.id}`}
                    className="nav-link"
                    style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: ".1em", color: "#468189" }}
                    title={prev.plain_title}
                  >
                    ← Prev
                  </a>
                )}
                {prev && next && <span style={{ color: "#2a4348", opacity: 0.4 }}>·</span>}
                {next && (
                  <a
                    href={`/articles/${next.id}`}
                    className="nav-link"
                    style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: ".1em", color: "#468189" }}
                    title={next.plain_title}
                  >
                    Next →
                  </a>
                )}
              </div>
            </div>

            {/* Category */}
            <div style={{ marginBottom: 24 }}>
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
                {article.category}
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(36px, 5vw, 64px)",
                lineHeight: 1.04,
                letterSpacing: "-.03em",
                color: "#F4E9CD",
                margin: "0 0 28px",
              }}
            >
              {article.plain_title}
            </h1>

            {/* Teaser */}
            <p
              style={{
                fontSize: 19,
                lineHeight: 1.72,
                color: "#77ACA2",
                margin: "0 0 40px",
                maxWidth: "38em",
              }}
            >
              {article.plain_summary}
            </p>

            {/* Meta row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                fontWeight: 500,
                color: "#468189",
                letterSpacing: ".06em",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  background: "rgba(70,129,137,.15)",
                  border: "1px solid rgba(70,129,137,.25)",
                  borderRadius: 4,
                  padding: "4px 10px",
                  fontWeight: 700,
                  color: "#77ACA2",
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  fontSize: 10,
                }}
              >
                Article
              </span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{formatDate(article.published_at)}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{mins} min read</span>
            </div>
          </div>
        </div>

        {/* Article body — client component for animations */}
        <ArticleBody content={content} sources={sources} prev={prev} next={next} />

      </main>
      <Footer />
    </>
  );
}
