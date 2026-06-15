"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { hasSubscribed, markSubscribed } from "@/lib/subscription";

type Status = "idle" | "loading" | "ok" | "err" | "duplicate";

export function NewsletterPopup() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false); // in DOM
  const [visible, setVisible] = useState(false); // slid in
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-runs on first load and on every route change.
  useEffect(() => {
    // Don't pester people who've already joined (via either form).
    if (hasSubscribed()) return;
    // Don't show it overlapping the big signup section on the homepage.
    setStatus("idle");
    setName("");
    setEmail("");
    setMounted(true);

    // A beat after the page settles, glide in from the right.
    const delay = pathname === "/" ? 4200 : 1400;
    enterTimer.current = setTimeout(() => setVisible(true), delay);

    return () => {
      if (enterTimer.current) clearTimeout(enterTimer.current);
      if (exitTimer.current) clearTimeout(exitTimer.current);
      setVisible(false);
    };
  }, [pathname]);

  function dismiss() {
    setVisible(false);
    if (exitTimer.current) clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(() => setMounted(false), 450);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setStatus("err");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });
      if (res.ok || res.status === 409) {
        setStatus(res.ok ? "ok" : "duplicate");
        markSubscribed();
        // Linger on the happy state, then slide away.
        exitTimer.current = setTimeout(dismiss, 2600);
      } else {
        setStatus("err");
      }
    } catch {
      setStatus("err");
    }
  }

  if (!mounted) return null;

  const joined = status === "ok" || status === "duplicate";

  return (
    <div
      className={`np-card ${visible ? "np-card-in" : ""}`}
      role="dialog"
      aria-label="Subscribe to the Article newsletter"
    >
      <button className="np-close" onClick={dismiss} aria-label="Dismiss">
        ✕
      </button>

      {joined ? (
        <div className="np-done">
          <div className="np-done-mark">✦</div>
          <p className="np-done-text">
            {status === "ok"
              ? "You're in. Check your inbox for a hello. ✦"
              : "Already on the list — see you in the morning. ☕"}
          </p>
        </div>
      ) : (
        <>
          <div className="np-kicker">Psst — one thing ☕</div>
          <h3 className="np-title">Want the smart version of the AI news?</h3>
          <p className="np-body">
            One short email each morning. Five minutes, zero jargon, genuinely
            useful. No spam — pinky promise.
          </p>

          <form onSubmit={handleSubmit} className="np-form">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First name (optional)"
              aria-label="First name (optional)"
              className="np-input"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "err") setStatus("idle");
              }}
              placeholder="you@example.com"
              aria-label="Email address"
              className="np-input"
              style={{
                borderColor: status === "err" ? "#E0A53F" : "rgba(157,190,187,.35)",
              }}
            />
            <button type="submit" className="np-submit" disabled={status === "loading"}>
              {status === "loading" ? "Joining…" : "Join free →"}
            </button>
          </form>

          <div className="np-status">
            {status === "err" && "Hmm — that email looks off. Try again?"}
          </div>

          <button className="np-later" onClick={dismiss}>
            Maybe later
          </button>
        </>
      )}
    </div>
  );
}
