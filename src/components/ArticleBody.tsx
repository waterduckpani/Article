"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ArticleSource } from "@/lib/supabase";

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

function renderBlocks(content: string) {
  const blocks = content.split(/\n\n+/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

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

    const isHook = i === 0;
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

export function ArticleBody({ content, sources }: { content: string; sources: ArticleSource[] }) {
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
          padding: "72px 32px 24px",
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
        {sources.length > 0 && (
          <Block delay={0}>
            <div
              style={{
                marginTop: 64,
                paddingTop: 32,
                borderTop: "2px solid rgba(3,25,38,.1)",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  color: "#468189",
                  marginBottom: 16,
                }}
              >
                Sources
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {sources.map((s, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#E0A53F", flexShrink: 0, display: "inline-block" }} />
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-link"
                      style={{ fontSize: 13, fontWeight: 600 }}
                    >
                      {s.name} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Block>
        )}

        {/* Back nav */}
        <Block delay={0}>
          <div style={{ marginTop: 64, marginBottom: 32 }}>
            <Button href="/" variant="primary">← Back to all stories</Button>
          </div>
        </Block>
      </div>

      <div style={{ height: 80 }} />
    </>
  );
}
