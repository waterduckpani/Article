"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"ok" | "err" | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
    setStatus(ok ? "ok" : "err");
  }

  return (
    <section id="signup" className="signup-section">
      <RevealOnScroll>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 800,
            letterSpacing: ".22em",
            textTransform: "uppercase",
            color: "#E0A53F",
            marginBottom: 22,
          }}
        >
          The daily edition
        </div>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(36px, 5.5vw, 58px)",
            lineHeight: 1.02,
            letterSpacing: "-.025em",
            margin: "0 auto 18px",
            maxWidth: "14em",
          }}
        >
          Get tomorrow&#39;s edition before your coffee.
        </h2>

        <p
          style={{
            fontSize: 18,
            lineHeight: 1.6,
            color: "rgba(244,233,205,.72)",
            maxWidth: "34em",
            margin: "0 auto 40px",
          }}
        >
          One email each morning. Five minutes to read. Genuinely useful.
          Unsubscribe anytime — no hard feelings.
        </p>

        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setStatus(null);
            }}
            placeholder="you@example.com"
            style={{
              flex: 1,
              background: "#0d2935",
              border: `1px solid ${status === "err" ? "#E0A53F" : "rgba(157,190,187,.35)"}`,
              color: "#F4E9CD",
              padding: "16px 20px",
              borderRadius: 40,
              fontSize: 16,
              fontFamily: "var(--font-body)",
              outline: "none",
              transition: "border-color 0.2s ease",
            }}
          />
          <Button variant="secondary" type="submit">
            Join free
          </Button>
        </form>

        <div
          style={{
            minHeight: 28,
            marginTop: 20,
            fontSize: 14.5,
            fontWeight: 700,
          }}
        >
          {status === "ok" && (
            <span style={{ color: "#9DBEBB" }}>
              You&#39;re in. Check your inbox to confirm. ✦
            </span>
          )}
          {status === "err" && (
            <span style={{ color: "#E0A53F" }}>
              Hmm — that doesn&#39;t look like an email address yet.
            </span>
          )}
        </div>
      </RevealOnScroll>
    </section>
  );
}
