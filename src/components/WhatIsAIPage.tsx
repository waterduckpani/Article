"use client";
import { useEffect, useRef, useState } from "react";

// ─── geometry ──────────────────────────────────────────────────
// Container height (px) == SVG viewBox height so y-coords map 1-to-1.
// Path snakes between x=300 (left stops) and x=500 (right stops)
// inside an 800-unit-wide viewBox. Cards fill the outer 33% on each
// side, leaving ~65 px of gap that connector dashes bridge.
const VB_H = 2400;

const PATH_D = [
  "M 400 60",
  "C 400 200, 300 250, 300 400",
  "C 300 550, 500 600, 500 800",
  "C 500 950, 300 1000, 300 1200",
  "C 300 1350, 500 1400, 500 1600",
  "C 500 1750, 300 1800, 300 2000",
  "C 300 2120, 400 2160, 400 2200",
].join(" ");

const STOPS = [
  { x: 300, y: 400,  side: "left"  as const },
  { x: 500, y: 800,  side: "right" as const },
  { x: 300, y: 1200, side: "left"  as const },
  { x: 500, y: 1600, side: "right" as const },
  { x: 300, y: 2000, side: "left"  as const },
];

const CONCEPTS = [
  {
    num: "01",
    title: "A very good guesser",
    body: `At its core, AI just predicts the next word. "The sky is ___" → "blue." Then it keeps guessing, one word at a time. That's literally how it works.`,
    bg: "#E0A53F",
    fg: "#031926",
  },
  {
    num: "02",
    title: "It read everything",
    body: "To learn those patterns, it consumed the whole internet — books, Wikipedia, Reddit, source code, news. Trillions of words, processed in months.",
    bg: "#031926",
    fg: "#F4E9CD",
  },
  {
    num: "03",
    title: "But it doesn't understand",
    body: `No comprehension is happening. It just knows "blue" tends to follow "sky is" — so it uses that. Pure pattern matching at superhuman scale. No meaning.`,
    bg: "#468189",
    fg: "#F4E9CD",
  },
  {
    num: "04",
    title: "The confident liar",
    body: "There's no built-in uncertainty signal. It generates text whether it's accurate or not. Ask about an obscure fact — total confidence, possibly wrong.",
    bg: "#9E2A2B",
    fg: "#F4E9CD",
  },
  {
    num: "05",
    title: "A tool, not a mind",
    body: `A calculator doesn't "know" math — it computes. AI doesn't "know" anything — it generates. Draft, explore, brainstorm with it. Verify what matters.`,
    bg: "#2D6A4F",
    fg: "#F4E9CD",
  },
];

// ─── component ─────────────────────────────────────────────────
export function WhatIsAIPage() {
  const containerRef   = useRef<HTMLDivElement>(null);
  const pathRef        = useRef<SVGPathElement>(null);
  const fracsRef       = useRef<number[]>([]);   // path-length fractions at each stop
  const [active, setActive] = useState([false, false, false, false, false]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const total = path.getTotalLength();
    path.style.strokeDasharray  = `${total}`;
    path.style.strokeDashoffset = `${total}`;

    // Binary-search actual path length at which the path first crosses each stop's y.
    // This gives true sync between path drawing and card activation.
    fracsRef.current = STOPS.map(stop => {
      let lo = 0, hi = total;
      for (let k = 0; k < 64; k++) {
        const mid = (lo + hi) / 2;
        const pt  = path.getPointAtLength(mid);
        if (pt.y < stop.y) lo = mid; else hi = mid;
      }
      return ((lo + hi) / 2) / total;
    });

    const onScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect  = container.getBoundingClientRect();
      const range = container.offsetHeight - window.innerHeight;
      const p     = Math.max(0, Math.min(1, -rect.top / range));

      path.style.strokeDashoffset = `${total * (1 - p)}`;
      setActive(fracsRef.current.map(f => p >= f));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#F4E9CD", color: "#031926", fontFamily: "var(--font-body)" }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "80px 20px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {[700, 500, 320].map(d => (
          <div key={d} aria-hidden="true" style={{
            position: "absolute", width: d, height: d, borderRadius: "50%",
            border: "1px solid rgba(3,25,38,.055)",
            top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            pointerEvents: "none",
          }} />
        ))}

        <div style={{
          fontSize: 11, fontWeight: 800, letterSpacing: ".22em",
          textTransform: "uppercase", color: "#468189", marginBottom: 28,
        }}>
          No math · No jargon · No homework
        </div>

        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "clamp(60px,10vw,124px)", lineHeight: 0.9,
          letterSpacing: "-.04em", color: "#031926", margin: "0 0 44px",
        }}>
          What even<br />is AI?
        </h1>

        {/* typewriter demo */}
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "clamp(14px,1.6vw,18px)",
          color: "#2a4348", maxWidth: 460, marginBottom: 60, lineHeight: 1.7,
          background: "rgba(3,25,38,.05)", padding: "18px 24px",
          borderRadius: 10, border: "1px solid rgba(3,25,38,.09)", textAlign: "left",
        }}>
          <span style={{ opacity: 0.4, fontSize: "0.75em", letterSpacing: ".1em",
            textTransform: "uppercase", display: "block", marginBottom: 8 }}>
            AI completes your sentence:
          </span>
          &ldquo;AI is&nbsp;
          <span style={{
            color: "#E0A53F", fontWeight: 700,
            display: "inline-block", overflow: "hidden",
            whiteSpace: "nowrap", verticalAlign: "bottom",
            animation: "typeIn 2s steps(26,end) 1s forwards", width: 0,
          }}>
            a very good guesser.&rdquo;
          </span>
        </div>

        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 6, color: "rgba(3,25,38,.3)", fontSize: 13, fontWeight: 600,
          letterSpacing: ".05em",
        }}>
          Scroll to learn how
          <span style={{ animation: "nudge 1.4s ease-in-out infinite", display: "block" }}>↓</span>
        </div>
      </section>

      {/* ── SCROLL JOURNEY (desktop) ─────────────────────── */}
      <section
        ref={containerRef}
        className="whatis-journey"
        style={{
          position: "relative",
          height: VB_H,
          width: "100%",
          borderTop: "2px solid #031926",
          borderBottom: "2px solid #031926",
          overflow: "hidden",
        }}
      >
        {/* large faint background numbers */}
        {STOPS.map((stop, i) => (
          <div key={i} aria-hidden="true" style={{
            position: "absolute",
            top: stop.y - 140,
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 280,
            lineHeight: 1,
            color: "rgba(3,25,38,.035)",
            letterSpacing: "-.05em",
            userSelect: "none",
            pointerEvents: "none",
            zIndex: 0,
          }}>
            {CONCEPTS[i].num}
          </div>
        ))}

        {/* journey label */}
        <div style={{
          position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)",
          fontSize: 10, fontWeight: 700, letterSpacing: ".2em",
          textTransform: "uppercase", color: "rgba(3,25,38,.22)",
          whiteSpace: "nowrap", zIndex: 3,
        }}>
          Five ideas · five minutes
        </div>

        {/* SVG path */}
        <svg
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}
          viewBox={`0 0 800 ${VB_H}`}
          preserveAspectRatio="none"
          fill="none"
        >
          {/* ghost trail */}
          <path d={PATH_D} stroke="rgba(3,25,38,.08)" strokeWidth="2" />

          {/* drawing path */}
          <path ref={pathRef} d={PATH_D} stroke="#E0A53F" strokeWidth="3" strokeLinecap="round" />

          {/* connector dashes: card-edge → stop dot */}
          {STOPS.map((stop, i) => {
            const isLeft = stop.side === "left";
            // card edge in SVG units (800 wide): left card right=264, right card left=536
            const cardEdge = isLeft ? 264 : 536;
            const dotEdge  = isLeft ? stop.x - 14 : stop.x + 14;
            return (
              <line
                key={i}
                x1={isLeft ? cardEdge : dotEdge}
                y1={stop.y}
                x2={isLeft ? dotEdge  : cardEdge}
                y2={stop.y}
                stroke={active[i] ? "#E0A53F" : "rgba(3,25,38,.15)"}
                strokeWidth="1.5"
                strokeDasharray="4 3"
                style={{ transition: "stroke 0.5s ease" }}
              />
            );
          })}

          {/* stop nodes */}
          {STOPS.map((stop, i) => (
            <g key={i}>
              <circle cx={stop.x} cy={stop.y} r={14}
                fill="transparent"
                stroke={active[i] ? "#E0A53F" : "rgba(3,25,38,.12)"}
                strokeWidth="1.5"
                style={{ transition: "stroke 0.5s ease" }}
              />
              <circle cx={stop.x} cy={stop.y} r={5}
                fill={active[i] ? "#E0A53F" : "rgba(3,25,38,.18)"}
                style={{ transition: "fill 0.4s ease" }}
              />
            </g>
          ))}
        </svg>

        {/* concept cards */}
        {CONCEPTS.map((c, i) => {
          const stop   = STOPS[i];
          const on     = active[i];
          const isLeft = stop.side === "left";
          return (
            <div key={i} style={{
              position: "absolute",
              top: stop.y - 110,
              // 33% wide, flush to outer edge with 2% inset
              ...(isLeft
                ? { left: "2%", width: "31%" }
                : { right: "2%", width: "31%" }),
              background: c.bg,
              color: c.fg,
              borderRadius: 14,
              padding: "24px 26px",
              opacity: on ? 1 : 0,
              transform: on
                ? "translateX(0) scale(1)"
                : `translateX(${isLeft ? "-24px" : "24px"}) scale(0.97)`,
              transition: "opacity 0.55s ease, transform 0.55s cubic-bezier(0.2,0.8,0.2,1), box-shadow 0.4s ease",
              boxShadow: on ? "0 10px 40px rgba(3,25,38,.14)" : "none",
              zIndex: 2,
            }}>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
                opacity: 0.45, letterSpacing: ".12em", textTransform: "uppercase",
                marginBottom: 10,
              }}>
                {c.num} / 05
              </div>
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 800,
                fontSize: 21, letterSpacing: "-.02em", lineHeight: 1.15, marginBottom: 12,
              }}>
                {c.title}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0, opacity: 0.84 }}>
                {c.body}
              </p>
            </div>
          );
        })}
      </section>

      {/* ── MOBILE JOURNEY (stacked cards, no SVG) ───────── */}
      <div className="whatis-journey-mobile">
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: ".2em",
          textTransform: "uppercase", color: "rgba(3,25,38,.22)",
          textAlign: "center", marginBottom: 8,
        }}>
          Five ideas · five minutes
        </div>
        {CONCEPTS.map((c, i) => (
          <div key={i} style={{
            background: c.bg,
            color: c.fg,
            borderRadius: 14,
            padding: "24px 24px",
            boxShadow: "0 6px 24px rgba(3,25,38,.1)",
          }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
              opacity: 0.45, letterSpacing: ".12em", textTransform: "uppercase",
              marginBottom: 10,
            }}>
              {c.num} / 05
            </div>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: 21, letterSpacing: "-.02em", lineHeight: 1.15, marginBottom: 12,
            }}>
              {c.title}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.65, margin: 0, opacity: 0.84 }}>
              {c.body}
            </p>
          </div>
        ))}
      </div>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{
        minHeight: "55vh", display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "80px clamp(20px, 5vw, 56px)", textAlign: "center",
        background: "#031926", color: "#F4E9CD",
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: ".2em",
          textTransform: "uppercase", color: "#468189", marginBottom: 20,
        }}>
          Now you&rsquo;ve got the basics
        </div>
        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "clamp(40px,6vw,72px)", lineHeight: 0.95,
          letterSpacing: "-.03em", margin: "0 0 24px",
        }}>
          Stay updated<br />every morning.
        </h2>
        <p style={{
          fontSize: 17, lineHeight: 1.65, maxWidth: 440,
          margin: "0 0 40px", color: "rgba(244,233,205,.62)",
        }}>
          Article covers AI daily — in plain English, no jargon, no hype.
          Five minutes and you&rsquo;ll know what matters.
        </p>
        <a href="/#signup" style={{
          display: "inline-block", background: "#E0A53F", color: "#031926",
          padding: "16px 36px", borderRadius: 8, fontWeight: 800,
          fontSize: 15, letterSpacing: ".02em", textDecoration: "none",
        }}>
          Get the daily edition →
        </a>
      </section>

      <style>{`
        @keyframes typeIn { to { width: 26ch; } }
        @keyframes nudge {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(7px); }
        }
      `}</style>
    </div>
  );
}
