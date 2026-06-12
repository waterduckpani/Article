import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleById } from "@/lib/supabase";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import type { ArticleSource } from "@/lib/supabase";

export const revalidate = 3600;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function renderContent(content: string) {
  return content.split(/\n\n+/).map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2
          key={i}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 22,
            letterSpacing: "-.02em",
            color: "#031926",
            margin: "40px 0 12px",
          }}
        >
          {block.replace(/^## /, "")}
        </h2>
      );
    }
    return (
      <p
        key={i}
        style={{
          fontSize: 18,
          lineHeight: 1.82,
          color: "#1a3540",
          margin: "0 0 24px",
        }}
      >
        {block.trim()}
      </p>
    );
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleById(id);
  if (!article) notFound();

  const content = article.content ?? article.plain_summary;
  const sources: ArticleSource[] = article.sources ?? (article.source_url ? [{ url: article.source_url, name: article.source_name }] : []);

  return (
    <>
      <Navbar />
      <main style={{ background: "#F4E9CD", minHeight: "100vh" }}>
        {/* Header */}
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 32px 0" }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: ".1em",
              textTransform: "uppercase",
              color: "#468189",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 40,
            }}
          >
            ← Back
          </Link>

          <div
            style={{
              display: "inline-block",
              background: "#9DBEBB",
              color: "#031926",
              padding: "5px 14px",
              borderRadius: 40,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            {article.category}
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 52,
              lineHeight: 1.05,
              letterSpacing: "-.03em",
              color: "#031926",
              margin: "0 0 24px",
            }}
          >
            {article.plain_title}
          </h1>

          <p
            style={{
              fontSize: 20,
              lineHeight: 1.7,
              color: "#468189",
              fontWeight: 500,
              margin: "0 0 32px",
            }}
          >
            {article.plain_summary}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              paddingBottom: 32,
              borderBottom: "2px solid rgba(3,25,38,.12)",
              marginBottom: 48,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 500,
              color: "#77ACA2",
              letterSpacing: ".06em",
            }}
          >
            <span>Article</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{formatDate(article.published_at)}</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 32px" }}>
          {renderContent(content)}
        </div>

        {/* Sources */}
        {sources.length > 0 && (
          <div
            style={{
              maxWidth: 720,
              margin: "48px auto 0",
              padding: "24px 32px 32px",
              borderTop: "1px solid rgba(3,25,38,.12)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".15em",
                textTransform: "uppercase",
                color: "#468189",
                marginBottom: 12,
              }}
            >
              Sources
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              {sources.map((s, i) => (
                <li key={i}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 13,
                      color: "#468189",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    {s.name} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ height: 80 }} />
      </main>
      <Footer />
    </>
  );
}
