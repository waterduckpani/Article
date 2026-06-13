"use client";
import { useState, useEffect } from "react";
import type { Article } from "@/lib/supabase";

const FALLBACK: Pick<Article, "id" | "plain_title">[] = [
  { id: "", plain_title: "A new tool turns your doodles into finished art" },
  { id: "", plain_title: "Doctors use AI to read scans faster — they still have the final say" },
  { id: "", plain_title: "Why your inbox suddenly writes better than you do" },
  { id: "", plain_title: "Schools are rewriting homework for the chatbot age" },
  { id: "", plain_title: "The four AI words everyone used this week, explained" },
  { id: "", plain_title: "Grandma's recipes, now read aloud in her own voice" },
];

export function Ticker({ articles }: { articles: Article[] }) {
  const items = (articles.length > 0 ? articles.slice(0, 8) : FALLBACK).map((a) => ({
    id: a.id,
    title: a.plain_title,
  }));

  const [tick, setTick] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setTick((prev) => (prev + 1) % items.length);
      setAnimKey((prev) => prev + 1);
    }, 2900);
    return () => clearInterval(t);
  }, [items.length]);

  const current = items[tick];
  const href = current.id ? `/articles/${current.id}` : null;

  return (
    <div className="ticker-inner">
      {/* Label */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: "#E0A53F",
            animation: "blink 1.4s steps(1) infinite",
            display: "block",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: ".2em",
            textTransform: "uppercase",
            color: "#9DBEBB",
          }}
        >
          On the wire
        </span>
      </div>

      <div style={{ width: 1, height: 28, background: "rgba(157,190,187,.3)", flexShrink: 0 }} />

      {/* Headline */}
      <div style={{ flex: 1, height: 32, overflow: "hidden", position: "relative" }}>
        <div
          key={animKey}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: 21,
            letterSpacing: "-.01em",
            color: "#F4E9CD",
            animation: "flipIn .6s cubic-bezier(.2,.8,.2,1)",
          }}
        >
          {current.title}
        </div>
      </div>

      {/* Read link */}
      {href && (
        <a
          href={href}
          key={`link-${tick}`}
          style={{
            flexShrink: 0,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            color: "#E0A53F",
            textDecoration: "none",
            border: "1px solid rgba(224,165,63,.35)",
            borderRadius: 4,
            padding: "5px 12px",
            transition: "background 0.2s ease, color 0.2s ease",
            animation: "flipIn .6s cubic-bezier(.2,.8,.2,1)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "#E0A53F";
            (e.currentTarget as HTMLAnchorElement).style.color = "#031926";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            (e.currentTarget as HTMLAnchorElement).style.color = "#E0A53F";
          }}
        >
          Read →
        </a>
      )}

      {/* Counter */}
      <div className="ticker-counter" style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#77ACA2", flexShrink: 0 }}>
        {String(tick + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
      </div>
    </div>
  );
}
