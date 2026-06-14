"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

type Status = "loading" | "ok" | "err" | "duplicate" | "no-consent" | null;

export function EmailSignup() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) { setStatus("no-consent"); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setStatus("err");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setStatus("ok");
      } else if (res.status === 409) {
        setStatus("duplicate");
      } else {
        setStatus("err");
      }
    } catch {
      setStatus("err");
    }
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
              if (status === "err") setStatus(null);
            }}
            placeholder="you@example.com"
            aria-label="Email address"
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
          <Button variant="secondary" type="submit" style={{ opacity: status === "loading" ? 0.7 : 1 }}>
            {status === "loading" ? "Joining…" : "Join free"}
          </Button>
        </form>

        {/* GDPR consent */}
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            marginTop: 18,
            cursor: "pointer",
            maxWidth: 520,
            margin: "18px auto 0",
          }}
        >
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (status === "no-consent") setStatus(null);
            }}
            style={{ marginTop: 3, accentColor: "#E0A53F", flexShrink: 0, width: 16, height: 16 }}
          />
          <span style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(244,233,205,.6)" }}>
            I agree to receive Article's daily newsletter. You can unsubscribe at any time. We handle your data in accordance with our{" "}
            <a href="/privacy" style={{ color: "#9DBEBB", textDecoration: "underline" }}>
              Privacy Policy
            </a>
            .
          </span>
        </label>

        <div
          style={{
            minHeight: 28,
            marginTop: 16,
            fontSize: 14.5,
            fontWeight: 700,
          }}
        >
          {status === "ok" && (
            <span style={{ color: "#9DBEBB" }}>
              You&#39;re in. Check your inbox for a welcome note. ✦
            </span>
          )}
          {status === "duplicate" && (
            <span style={{ color: "#9DBEBB" }}>
              You&#39;re already subscribed — see you tomorrow morning.
            </span>
          )}
          {status === "err" && (
            <span style={{ color: "#E0A53F" }}>
              Hmm — something went wrong. Try again in a moment.
            </span>
          )}
          {status === "no-consent" && (
            <span style={{ color: "#E0A53F" }}>
              Please tick the box above to continue.
            </span>
          )}
        </div>
      </RevealOnScroll>
    </section>
  );
}
