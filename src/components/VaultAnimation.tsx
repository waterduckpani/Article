"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Phase = "in" | "spin" | "unlock" | "open" | "fade" | "done";

function r(n: number) {
  return parseFloat(n.toFixed(4));
}

function VaultOverlay() {
  const [phase, setPhase] = useState<Phase>("in");

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase("spin"), 350),
      setTimeout(() => setPhase("unlock"), 1950),
      setTimeout(() => setPhase("open"), 2350),
      setTimeout(() => setPhase("fade"), 2950),
      setTimeout(() => setPhase("done"), 3500),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  if (phase === "done") return null;

  const isSpin = phase !== "in";
  const isUnlocked = phase === "unlock" || phase === "open" || phase === "fade";
  const isOpen = phase === "open" || phase === "fade";
  const isFade = phase === "fade";

  return (
    <div
      onClick={() => setPhase("done")}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#031926",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        cursor: "pointer",
        opacity: isFade ? 0 : 1,
        transition: isFade ? "opacity 0.55s ease" : "opacity 0.2s ease",
        pointerEvents: isFade ? "none" : "all",
      }}
    >
      {/* Scan-line texture */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(70,129,137,.04) 3px, rgba(70,129,137,.04) 4px)",
        pointerEvents: "none",
      }} />

      {/* Header label */}
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: ".28em",
        textTransform: "uppercase",
        color: "#468189",
        marginBottom: 36,
        opacity: isSpin ? 1 : 0,
        transform: isSpin ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        position: "relative",
      }}>
        Accessing the vault
      </div>

      {/* Door — scales toward viewer on open */}
      <div style={{ position: "relative" }}>
        <div style={{
          transform: isOpen ? "scale(1.9)" : "scale(1)",
          opacity: isOpen ? 0 : 1,
          transition: isOpen ? "transform 0.55s cubic-bezier(.4,0,.2,1), opacity 0.45s ease 0.1s" : "none",
        }}>
          <svg
            width="280"
            height="360"
            viewBox="0 0 280 360"
            overflow="visible"
            style={{
              display: "block",
              opacity: isSpin ? 1 : 0,
              transform: isSpin ? "scale(1)" : "scale(0.88)",
              transition: "opacity 0.4s ease, transform 0.4s cubic-bezier(.2,.8,.2,1)",
            }}
          >
            {/* Drop shadow */}
            <rect x="6" y="6" width="274" height="354" rx="10" fill="rgba(0,0,0,0.45)" />
            {/* Door body */}
            <rect x="0" y="0" width="274" height="354" rx="10" fill="#132d3d" stroke="#77ACA2" strokeWidth="3" />
            {/* Hinge plates */}
            <rect x="-7" y="58" width="14" height="30" rx="4" fill="#2a4a5e" stroke="#468189" strokeWidth="1.5" />
            <rect x="-7" y="263" width="14" height="30" rx="4" fill="#2a4a5e" stroke="#468189" strokeWidth="1.5" />
            {/* Inner inset panel */}
            <rect x="18" y="18" width="238" height="318" rx="7" fill="#0a2030" stroke="#468189" strokeWidth="1.5" />

            {/* Corner rivets */}
            {([32, 242] as number[]).flatMap((x) =>
              ([32, 322] as number[]).filter((y) => y <= 348).map((y) => (
                <g key={`${x}-${y}`}>
                  <circle cx={x} cy={y} r="7.5" fill="#1e3d50" stroke="#468189" strokeWidth="1.5" />
                  <circle cx={x} cy={y} r="3" fill="#77ACA2" />
                </g>
              ))
            )}

            {/* Brand text */}
            <text x="137" y="57" fill="#2a4a5e" fontSize="11"
              fontFamily="var(--font-display)" fontWeight="800"
              textAnchor="middle" letterSpacing="4">
              ARTICLE
            </text>

            {/* Bolts — retract on unlock */}
            {([92, 152, 212, 272] as number[]).map((y, i) =>
              y <= 348 ? (
                <g key={i} style={{
                  transform: isUnlocked ? `translateX(${40 + i * 5}px)` : "translateX(0)",
                  transition: `transform 0.22s cubic-bezier(.6,0,.8,1) ${i * 45}ms`,
                }}>
                  <rect x="238" y={y - 13} width="50" height="26" rx="6" fill="#9DBEBB" />
                  <rect x="238" y={y - 13} width="50" height="26" rx="6" fill="none" stroke="#77ACA2" strokeWidth="1.5" />
                  <line x1="244" y1={y - 5} x2="264" y2={y - 5} stroke="#468189" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="244" y1={y + 5} x2="264" y2={y + 5} stroke="#468189" strokeWidth="1.5" strokeLinecap="round" />
                  <rect x="282" y={y - 9} width="6" height="18" rx="3" fill="#77ACA2" />
                </g>
              ) : null
            )}

            {/* Combination dial */}
            <g transform="translate(127, 185)">
              <circle cx="0" cy="0" r="70" fill="#081c28" stroke="#77ACA2" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="58" fill="#132d3d" />
              {/* Fixed indicator arrow */}
              <polygon points="0,-62 -5,-72 5,-72" fill="#E0A53F" />

              {/* Spinning group — coordinates rounded to avoid SSR/client float diff */}
              <g
                className={isSpin && !isUnlocked ? "vault-dial-spinning" : ""}
                style={{ transformOrigin: "0px 0px" }}
              >
                {Array.from({ length: 40 }, (_, i) => {
                  const ang = (i / 40) * 2 * Math.PI - Math.PI / 2;
                  const isMajor = i % 8 === 0;
                  const isMed = i % 4 === 0;
                  const inner = 44;
                  const outer = isMajor ? 56 : isMed ? 52 : 48;
                  const cos = Math.cos(ang);
                  const sin = Math.sin(ang);
                  return (
                    <line
                      key={i}
                      x1={r(inner * cos)} y1={r(inner * sin)}
                      x2={r(outer * cos)} y2={r(outer * sin)}
                      stroke={isMajor ? "#9DBEBB" : "#468189"}
                      strokeWidth={isMajor ? 2.5 : isMed ? 1.5 : 1}
                      strokeLinecap="round"
                    />
                  );
                })}

                {([0, 10, 20, 30] as number[]).map((num, i) => {
                  const ang = (i / 4) * 2 * Math.PI - Math.PI / 2;
                  const rad = 34;
                  return (
                    <text key={i}
                      x={r(rad * Math.cos(ang))} y={r(rad * Math.sin(ang))}
                      fill="#468189" fontSize="9.5"
                      fontFamily="var(--font-mono)" fontWeight="700"
                      textAnchor="middle" dominantBaseline="central">
                      {num}
                    </text>
                  );
                })}

                <line x1="0" y1="0" x2="0" y2="-38" stroke="#E0A53F" strokeWidth="3.5" strokeLinecap="round" />
              </g>

              {/* Static center hub */}
              <circle cx="0" cy="0" r="14" fill="#468189" stroke="#F4E9CD" strokeWidth="2" />
              <circle cx="0" cy="0" r="6" fill="#031926" />
            </g>

            {/* Handle */}
            <rect x="95" y="300" width="84" height="16" rx="8" fill="#1e3d50" stroke="#77ACA2" strokeWidth="1.5" />
            <rect x="127" y="296" width="20" height="24" rx="4" fill="#2a4a5e" stroke="#77ACA2" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Status + skip */}
      <div style={{ marginTop: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: ".22em",
          textTransform: "uppercase",
          color: "#9DBEBB",
          opacity: isUnlocked ? 1 : 0,
          transition: "opacity 0.35s ease",
          minHeight: 18,
        }}>
          Access granted
        </div>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "#2a4a5e",
          letterSpacing: ".12em",
          opacity: isSpin ? 1 : 0,
          transition: "opacity 0.3s ease 0.5s",
        }}>
          click to skip
        </div>
      </div>
    </div>
  );
}

export function VaultAnimation() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(<VaultOverlay />, document.body);
}
