"use client";
import { useEffect, useState } from "react";

type Phase = "enter" | "hold" | "exit" | "done";

export function Loader() {
  const [phase, setPhase] = useState<Phase>("enter");

  useEffect(() => {
    // Tiny tick so the "enter" styles paint first, then transition to "hold"
    const t0 = setTimeout(() => setPhase("hold"), 60);
    const t1 = setTimeout(() => setPhase("exit"), 1900);
    const t2 = setTimeout(() => setPhase("done"), 2600);
    return () => [t0, t1, t2].forEach(clearTimeout);
  }, []);

  if (phase === "done") return null;

  const exiting  = phase === "exit";
  const entering = phase === "enter";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#031926",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: exiting ? "none" : "all",
        transform: exiting ? "translateY(-100%)" : "translateY(0)",
        transition: exiting
          ? "transform 0.7s cubic-bezier(0.76, 0, 0.24, 1)"
          : "none",
        // paper grain to match the site
        isolation: "isolate",
      }}
    >
      {/* grain overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          mixBlendMode: "screen",
          opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* top rule */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "rgba(244,233,205,.08)",
        }}
      />

      {/* wordmark */}
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "clamp(52px, 9vw, 88px)",
          letterSpacing: "-.035em",
          color: "#F4E9CD",
          opacity: entering ? 0 : 1,
          transform: entering ? "translateY(22px)" : "translateY(0)",
          transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.2,0.8,0.2,1)",
          lineHeight: 1,
        }}
      >
        Article
      </div>

      {/* subtitle */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: ".2em",
          textTransform: "uppercase",
          color: "#468189",
          marginTop: 16,
          opacity: entering ? 0 : 1,
          transform: entering ? "translateY(14px)" : "translateY(0)",
          transition:
            "opacity 0.7s ease 0.14s, transform 0.7s cubic-bezier(0.2,0.8,0.2,1) 0.14s",
        }}
      >
        AI / in plain english
      </div>

      {/* thin divider */}
      <div
        style={{
          width: "clamp(120px, 20vw, 240px)",
          height: 1,
          background: "rgba(244,233,205,.12)",
          margin: "32px 0 0",
          opacity: entering ? 0 : 1,
          transition: "opacity 0.6s ease 0.26s",
        }}
      />

      {/* tagline */}
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "rgba(244,233,205,.35)",
          marginTop: 16,
          letterSpacing: ".02em",
          opacity: entering ? 0 : 1,
          transition: "opacity 0.6s ease 0.34s",
        }}
      >
        Every morning. Plain English. No homework.
      </div>

      {/* amber progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: "rgba(244,233,205,.07)",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "#E0A53F",
            width: 0,
            animation: !entering
              ? "loaderProgress 1.76s cubic-bezier(0.4,0,0.55,1) 0.2s forwards"
              : "none",
          }}
        />
      </div>

      <style>{`
        @keyframes loaderProgress {
          0%   { width: 0% }
          100% { width: 100% }
        }
      `}</style>
    </div>
  );
}
