"use client";
import { useState, useEffect } from "react";
import type { Article } from "@/lib/supabase";

const FALLBACK = [
  "A new tool turns your doodles into finished art",
  "Doctors use AI to read scans faster — they still have the final say",
  "Why your inbox suddenly writes better than you do",
  "Schools are rewriting homework for the chatbot age",
  "The four AI words everyone used this week, explained",
  "Grandma's recipes, now read aloud in her own voice",
];

export function Ticker({ articles }: { articles: Article[] }) {
  const headlines = articles.length > 0 ? articles.map((a) => a.plain_title) : FALLBACK;
  const [tick, setTick] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setTick((prev) => (prev + 1) % headlines.length);
      setAnimKey((prev) => prev + 1);
    }, 2900);
    return () => clearInterval(t);
  }, [headlines.length]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "#031926",
        color: "#F4E9CD",
        padding: "0 56px",
        height: 64,
        gap: 28,
      }}
    >
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
          {headlines[tick]}
        </div>
      </div>

      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#77ACA2", flexShrink: 0 }}>
        {String(tick + 1).padStart(2, "0")} / {String(headlines.length).padStart(2, "0")}
      </div>
    </div>
  );
}
