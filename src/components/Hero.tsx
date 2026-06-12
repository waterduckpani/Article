import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import type { Article } from "@/lib/supabase";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).toUpperCase();
}

export function Hero({ article }: { article: Article | null }) {
  const title = article?.plain_title ?? "Your phone just learned to plan your week";
  const summary = article?.plain_summary ?? "Apple and Google quietly switched on assistants that book appointments and draft replies. We lived with both for a week.";
  const category = article?.category ?? "The Big Story";
  const date = article ? formatDate(article.published_at) : "12 JUN 2026";
  const href = article ? `/articles/${article.id}` : "/archive";

  return (
    <section style={{ background: "#F4E9CD", padding: "100px 64px 120px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "3fr 2fr",
          gap: 88,
          alignItems: "center",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        {/* Left: headline + CTAs */}
        <RevealOnScroll delay={0}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 800,
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: "#468189",
              marginBottom: 32,
            }}
          >
            Today, in five minutes
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 92,
              lineHeight: 1.0,
              letterSpacing: "-.03em",
              color: "#031926",
              margin: "0 0 36px",
            }}
          >
            AI news that talks like a person.
          </h1>
          <p
            style={{
              fontSize: 20,
              lineHeight: 1.78,
              color: "#3a565b",
              maxWidth: "28em",
              margin: "0 0 48px",
            }}
          >
            No jargon, no hype — just the five minutes that actually matter,
            explained like a smart friend would.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Button variant="primary" href={href}>
              Read today&#39;s edition →
            </Button>
            <a href="#whatis" className="nav-link" style={{ fontSize: 15, fontWeight: 700 }}>
              New here? Start simple
            </a>
          </div>
        </RevealOnScroll>

        {/* Right: Latest article card */}
        <RevealOnScroll delay={120}>
          <div className="edition-stack" id="today">
            <a href={href} className="edition-card-new" style={{
              background: "#FBF6E6",
              border: "1px solid rgba(3,25,38,.1)",
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 44px 90px -54px rgba(3,25,38,.45)",
              display: "block",
              textDecoration: "none",
              color: "inherit",
            }}>
              {/* Masthead */}
              <div style={{
                position: "relative",
                background: "#031926",
                padding: "28px 28px 26px",
                overflow: "hidden",
                minHeight: 196,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}>
                <div aria-hidden style={{
                  position: "absolute",
                  top: -18,
                  left: -6,
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: 148,
                  lineHeight: 0.88,
                  letterSpacing: "-.05em",
                  color: "rgba(70,129,137,.15)",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}>
                  NEW
                </div>

                <div style={{ position: "absolute", top: 18, right: 18, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500, color: "#77ACA2", letterSpacing: ".1em", textTransform: "uppercase" }}>
                    {date}
                  </span>
                </div>

                <div style={{
                  position: "absolute",
                  top: 18,
                  left: 18,
                  background: "#E0A53F",
                  color: "#031926",
                  padding: "5px 12px",
                  borderRadius: 40,
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                }}>
                  {category}
                </div>

                <h3 style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 24,
                  lineHeight: 1.12,
                  letterSpacing: "-.02em",
                  color: "#F4E9CD",
                  margin: 0,
                  position: "relative",
                  zIndex: 1,
                }}>
                  {title}
                </h3>
              </div>

              {/* Card body */}
              <div style={{ padding: "22px 28px 26px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    fontSize: 11.5,
                    fontWeight: 800,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "#468189",
                  }}>
                    <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#E0A53F", display: "inline-block", flexShrink: 0 }} />
                    Latest Story
                  </span>
                </div>

                <p style={{ fontSize: 15.5, lineHeight: 1.68, color: "#3a565b", margin: 0 }}>
                  {summary}
                </p>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 20,
                  marginTop: 20,
                  borderTop: "1px solid rgba(3,25,38,.1)",
                }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, fontWeight: 500, letterSpacing: ".08em", color: "#77ACA2" }}>
                    {(article?.source_name ?? "Article").split(",")[0].trim()}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 800, color: "#468189" }}>
                    Read the story →
                  </span>
                </div>
              </div>
            </a>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
