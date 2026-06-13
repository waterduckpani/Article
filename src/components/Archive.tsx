"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import type { Article } from "@/lib/supabase";

const FALLBACK = [
  { id: "1", source_url: "#", plain_title: "The week AI learned to say it doesn't know", category: "The Big Story", published_at: "2026-06-11T00:00:00Z", source_name: "Article" },
  { id: "2", source_url: "#", plain_title: "Your group chat has a new member", category: "Everyday", published_at: "2026-06-10T00:00:00Z", source_name: "Article" },
  { id: "3", source_url: "#", plain_title: "We asked five AIs to plan a birthday party", category: "We Tried It", published_at: "2026-06-09T00:00:00Z", source_name: "Article" },
  { id: "4", source_url: "#", plain_title: "The quiet rise of the AI co-pilot", category: "At Work", published_at: "2026-06-08T00:00:00Z", source_name: "Article" },
  { id: "5", source_url: "#", plain_title: "What a trillion-word library taught a machine", category: "Explainer", published_at: "2026-06-07T00:00:00Z", source_name: "Article" },
  { id: "6", source_url: "#", plain_title: "Can a computer actually be creative?", category: "Big Question", published_at: "2026-06-06T00:00:00Z", source_name: "Article" },
];

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase();
}

type CardArticle = Pick<Article, "id" | "source_url" | "plain_title" | "category" | "published_at" | "source_name">;

function MobileCard({ e }: { e: CardArticle }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);
  const href = e.source_url === "#" ? "#" : `/articles/${e.id}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      className={`archive-mobile-flip${visible ? " archive-mobile-flip-in" : ""}`}
      style={{
        background: "#FBF5E4",
        border: "2px solid #031926",
        borderRadius: 6,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        minHeight: 280,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, letterSpacing: "-.02em" }}>
          Article
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, color: "#468189" }}>
          {e.source_name?.split(",")[0]?.trim() || "Article"}
        </span>
      </div>

      <div style={{
        display: "inline-block",
        alignSelf: "flex-start",
        background: "#9DBEBB",
        color: "#031926",
        padding: "4px 10px",
        borderRadius: 40,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: ".1em",
        textTransform: "uppercase",
        margin: "16px 0 12px",
      }}>
        {e.category}
      </div>

      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, lineHeight: 1.1, letterSpacing: "-.02em", margin: "0 0 auto", flex: 1 }}>
        {e.plain_title}
      </h3>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 14,
        marginTop: 16,
        borderTop: "2px solid #031926",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        fontWeight: 500,
        color: "#468189",
      }}>
        <span>{formatShortDate(e.published_at)}</span>
        <span style={{ color: "#031926", fontWeight: 600 }}>Read →</span>
      </div>
    </a>
  );
}

export function Archive({ articles }: { articles: Article[] }) {
  const editions: CardArticle[] = articles.length >= 3 ? articles.slice(0, 6) : FALLBACK;
  const n = editions.length;

  const [hover, setHover] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const [demoHover, setDemoHover] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const t1 = setTimeout(() => setDemoHover(2), n * 100 + 400);
    const t2 = setTimeout(() => setDemoHover(null), n * 100 + 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [inView, n]);

  const activeHover = hover !== null ? hover : demoHover;

  return (
    <section ref={sectionRef} id="archive" className="archive-section">
      {/* Header */}
      <div
        className="archive-header"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(28px)",
          transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.2,0.8,0.2,1)",
        }}
      >
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "#468189", marginBottom: 14 }}>
            Every edition we&#39;ve sent
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(40px, 6vw, 60px)", lineHeight: 0.95, letterSpacing: "-.025em", margin: 0, color: "#031926" }}>
            The Archive
          </h2>
        </div>
        <Button variant="primary" size="sm" href="/archive">
          Browse all {articles.length} →
        </Button>
      </div>

      <p style={{
        fontSize: 13.5,
        color: "#468189",
        fontWeight: 600,
        letterSpacing: ".02em",
        margin: "14px 0 0",
        opacity: inView ? 1 : 0,
        transition: "opacity 0.7s ease 100ms",
      }}>
        Hover a spread to pull it from the stack.
      </p>

      {/* Fan-out deck — hidden on mobile via CSS */}
      <div className="archive-deck-fan">
        {editions.map((e, i) => {
          const base = (i - (n - 1) / 2) * 4;
          let tx = 0, ty = 0, rot = base, scale = 1, z = i + 1;
          let shadow = "0 24px 44px -30px rgba(3,25,38,.55)";

          if (activeHover !== null) {
            if (i === activeHover) {
              rot = 0; ty = -30; scale = 1.07; z = 100;
              shadow = "0 50px 80px -34px rgba(3,25,38,.7)";
            } else {
              tx = (i < activeHover ? -1 : 1) * 52;
              ty = 14;
              scale = 0.96;
            }
          }

          return (
            <div
              key={e.id}
              style={{
                marginLeft: i === 0 ? 0 : -74,
                zIndex: z,
                position: "relative",
                opacity: inView ? 1 : 0,
                transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`,
                transition: inView
                  ? `opacity 0.5s ease ${i * 90}ms, transform 0.5s cubic-bezier(.2,.85,.25,1)`
                  : `opacity 0.5s ease ${i * 90}ms`,
                filter: `drop-shadow(${shadow})`,
              }}
            >
              <a
                href={e.source_url === "#" ? "#" : `/articles/${e.id}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{
                  width: 282,
                  height: 368,
                  background: "#FBF5E4",
                  border: "2px solid #031926",
                  borderRadius: 6,
                  padding: 24,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, letterSpacing: "-.02em" }}>
                    Article
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, color: "#468189" }}>
                    {e.source_name?.split(",")[0]?.trim() || "Article"}
                  </span>
                </div>

                <div style={{
                  display: "inline-block",
                  alignSelf: "flex-start",
                  background: "#9DBEBB",
                  color: "#031926",
                  padding: "4px 10px",
                  borderRadius: 40,
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  margin: "18px 0 12px",
                }}>
                  {e.category}
                </div>

                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, lineHeight: 1.04, letterSpacing: "-.02em", margin: 0, flex: 1 }}>
                  {e.plain_title}
                </h3>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 14,
                  borderTop: "2px solid #031926",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#468189",
                }}>
                  <span>{formatShortDate(e.published_at)}</span>
                  <span style={{ color: "#031926", fontWeight: 600 }}>Read →</span>
                </div>
              </a>
            </div>
          );
        })}
      </div>

      {/* Mobile card grid — shown only on mobile via CSS */}
      <div className="archive-deck-mobile">
        {editions.map((e) => (
          <MobileCard key={e.id} e={e} />
        ))}
      </div>
    </section>
  );
}
