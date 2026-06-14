"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ArticleSource, AdjacentArticle } from "@/lib/supabase";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Block({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s cubic-bezier(0.2,0.8,0.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop;
      const total = doc.scrollHeight - doc.clientHeight;
      setPct(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: "rgba(3,25,38,.08)",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: "linear-gradient(90deg, #468189, #E0A53F)",
          transition: "width 0.1s linear",
        }}
      />
    </div>
  );
}

function SourcesSection({ sources }: { sources: ArticleSource[] }) {
  // Group by source name
  const grouped = sources.reduce<Record<string, ArticleSource[]>>((acc, s) => {
    (acc[s.name] = acc[s.name] || []).push(s);
    return acc;
  }, {});
  const groups = Object.entries(grouped);

  const [open, setOpen] = useState<string | null>(null);

  return (
    <Block delay={0}>
      <div style={{ marginTop: 64, paddingTop: 32, borderTop: "2px solid rgba(3,25,38,.1)" }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: ".2em",
          textTransform: "uppercase",
          color: "#468189",
          marginBottom: 16,
        }}>
          Sources
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {groups.map(([name, items]) => {
            const isOpen = open === name;
            return (
              <div key={name} style={{ border: "1px solid rgba(3,25,38,.1)", borderRadius: 8, overflow: "hidden" }}>
                {/* Header row */}
                <button
                  onClick={() => setOpen(isOpen ? null : name)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: isOpen ? "rgba(3,25,38,.04)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#031926" }}>{name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: ".1em",
                      color: "#77ACA2",
                    }}>
                      {items.length} {items.length === 1 ? "article" : "articles"}
                    </span>
                    <span style={{
                      fontSize: 11,
                      color: "#468189",
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.25s ease",
                      display: "inline-block",
                    }}>
                      ▾
                    </span>
                  </div>
                </button>

                {/* Dropdown articles */}
                <div style={{
                  maxHeight: isOpen ? 400 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.3s cubic-bezier(0.2,0.8,0.2,1)",
                }}>
                  <div style={{ borderTop: "1px solid rgba(3,25,38,.08)", padding: "8px 0" }}>
                    {items.map((s, i) => (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-link"
                        style={{
                          display: "block",
                          padding: "8px 16px",
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#2a4348",
                        }}
                      >
                        {s.title || s.url} ↗
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Block>
  );
}

const SECTION_LABEL_RE = /^(HOOK|WHAT'S HAPPENING|THE MECHANISM|WHY IT MATTERS|THE BOTTOM LINE)\s+/;

function renderBlocks(content: string) {
  const blocks = content.split(/\n\n+/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("### ")) {
      return (
        <Block key={i} delay={i * 60}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: "#468189",
            margin: "32px 0 8px",
          }}>
            {trimmed.replace(/^### /, "")}
          </div>
        </Block>
      );
    }

    if (trimmed.startsWith("## ")) {
      return (
        <Block key={i} delay={i * 60}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: "-.02em",
              color: "#031926",
              margin: "52px 0 16px",
              paddingTop: 52,
              borderTop: "2px solid rgba(3,25,38,.08)",
            }}
          >
            {trimmed.replace(/^## /, "")}
          </h2>
        </Block>
      );
    }

    const labelMatch = trimmed.match(SECTION_LABEL_RE);
    const isHook = i === 0;

    if (labelMatch) {
      const label = labelMatch[1];
      const body = trimmed.slice(labelMatch[0].length);
      return (
        <Block key={i} delay={i * 60}>
          <div style={{ margin: "0 0 28px" }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              color: "#468189",
              marginBottom: 8,
            }}>
              {label}
            </div>
            <p style={{ fontSize: 18, lineHeight: 1.82, color: "#1a3540", margin: 0, fontWeight: 400 }}>
              {body}
            </p>
          </div>
        </Block>
      );
    }

    return (
      <Block key={i} delay={i * 60}>
        <p
          style={{
            fontSize: isHook ? 20 : 18,
            lineHeight: isHook ? 1.85 : 1.82,
            color: isHook ? "#031926" : "#1a3540",
            margin: "0 0 28px",
            fontWeight: isHook ? 500 : 400,
          }}
        >
          {trimmed}
        </p>
      </Block>
    );
  });
}

export function ArticleBody({
  content,
  sources,
  prev,
  next,
}: {
  content: string;
  sources: ArticleSource[];
  prev?: AdjacentArticle | null;
  next?: AdjacentArticle | null;
}) {
  const { ref: bodyRef, inView: bodyInView } = useInView(0.05);

  return (
    <>
      <ReadingProgress />

      {/* Content */}
      <div
        ref={bodyRef}
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "72px clamp(16px, 4vw, 32px) 24px",
          opacity: bodyInView ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      >
        {/* Decorative rule */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 56,
          }}
        >
          <div style={{ flex: 1, height: 1, background: "rgba(3,25,38,.12)" }} />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 18,
              color: "#E0A53F",
              letterSpacing: "-.02em",
            }}
          >
            Article
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(3,25,38,.12)" }} />
        </div>

        {/* Article body */}
        <div>{renderBlocks(content)}</div>

        {/* Sources */}
        {sources.length > 0 && <SourcesSection sources={sources} />}

        {/* Bottom nav */}
        {(prev || next) && (
          <Block delay={0}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginTop: 64,
              paddingTop: 28,
              borderTop: "1px solid rgba(3,25,38,.12)",
            }}>
              {prev ? (
                <a
                  href={`/articles/${prev.slug ?? prev.id}`}
                  className="nav-link"
                  style={{ display: "flex", flexDirection: "column", gap: 5, maxWidth: "44%", textDecoration: "none" }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#77ACA2" }}>
                    ← Previous
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.25, color: "#031926", letterSpacing: "-.01em" }}>
                    {prev.plain_title}
                  </span>
                </a>
              ) : <div />}
              {next ? (
                <a
                  href={`/articles/${next.slug ?? next.id}`}
                  className="nav-link"
                  style={{ display: "flex", flexDirection: "column", gap: 5, maxWidth: "44%", textDecoration: "none", alignItems: "flex-end", textAlign: "right" }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: "#77ACA2" }}>
                    Next →
                  </span>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, lineHeight: 1.25, color: "#031926", letterSpacing: "-.01em" }}>
                    {next.plain_title}
                  </span>
                </a>
              ) : <div />}
            </div>
          </Block>
        )}

        <Block delay={0}>
          <div style={{ marginTop: 32, marginBottom: 32 }}>
            <Button href="/" variant="primary">← Back to all stories</Button>
          </div>
        </Block>
      </div>

      <div style={{ height: 80 }} />
    </>
  );
}
