"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";

const editions = [
  { issue: "183", date: "Jun 11", cat: "The Big Story", title: "The week AI learned to say “I don’t know”" },
  { issue: "182", date: "Jun 10", cat: "Everyday",      title: "Your group chat has a new member" },
  { issue: "181", date: "Jun 09", cat: "We Tried It",   title: "We asked five AIs to plan a birthday party" },
  { issue: "180", date: "Jun 08", cat: "At Work",       title: "The quiet rise of the AI co-pilot" },
  { issue: "179", date: "Jun 07", cat: "Explainer",     title: "What a trillion-word library taught a machine" },
  { issue: "178", date: "Jun 06", cat: "Big Question",  title: "Can a computer actually be creative?" },
];

export function Archive() {
  const [hover, setHover] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const [demoHover, setDemoHover] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const n = editions.length;

  // Trigger entrance when section scrolls into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // After cards have entered, briefly demo the fan-out to hint interactivity
  useEffect(() => {
    if (!inView) return;
    const t1 = setTimeout(() => setDemoHover(2), editions.length * 100 + 400);
    const t2 = setTimeout(() => setDemoHover(null), editions.length * 100 + 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [inView]);

  const activeHover = hover !== null ? hover : demoHover;

  return (
    <section
      ref={sectionRef}
      id="archive"
      style={{ padding: "74px 56px 84px", background: "#F4E9CD", borderTop: "1px solid rgba(3,25,38,.1)" }}
    >
      {/* Header */}
      <div
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(28px)",
          transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.2,0.8,0.2,1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 6,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 800,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "#468189",
              marginBottom: 14,
            }}
          >
            Every edition we&#39;ve sent
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 60,
              lineHeight: 0.95,
              letterSpacing: "-.025em",
              margin: 0,
              color: "#031926",
            }}
          >
            The Archive
          </h2>
        </div>
        <Button variant="primary" size="sm" href="#">
          Browse all 184 →
        </Button>
      </div>

      <p
        style={{
          fontSize: 13.5,
          color: "#468189",
          fontWeight: 600,
          letterSpacing: ".02em",
          margin: "14px 0 0",
          opacity: inView ? 1 : 0,
          transition: "opacity 0.7s ease 100ms",
        }}
      >
        Hover a spread to pull it from the stack.
      </p>

      {/* Fan-out deck */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          padding: "64px 0 24px",
          perspective: 1400,
        }}
      >
        {editions.map((e, i) => {
          const base = (i - (n - 1) / 2) * 4;
          let tx = 0, ty = 0, rot = base, scale = 1, z = i + 1;
          let shadow = "0 24px 44px -30px rgba(3,25,38,.55)";

          if (activeHover !== null) {
            if (i === activeHover) {
              rot = 0; ty = -30; scale = 1.07; z = 100;
              shadow = "0 50px 80px -34px rgba(3,25,38,.7)";
            } else {
              tx = (i < activeHover ? -1 : 1) * 52;
              ty = 14;
              scale = 0.96;
            }
          }

          return (
            <div
              key={e.issue}
              style={{
                marginLeft: i === 0 ? 0 : -74,
                zIndex: z,
                position: "relative",
                opacity: inView ? 1 : 0,
                transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`,
                transition: inView
                  ? `opacity 0.5s ease ${i * 90}ms, transform 0.5s cubic-bezier(.2,.85,.25,1)`
                  : `opacity 0.5s ease ${i * 90}ms`,
                filter: `drop-shadow(${shadow})`,
              }}
            >
              <article
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                style={{
                  width: 282,
                  height: 368,
                  background: "#FBF5E4",
                  border: "2px solid #031926",
                  borderRadius: 6,
                  padding: 24,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 800,
                      fontSize: 20,
                      letterSpacing: "-.02em",
                    }}
                  >
                    Article
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#468189",
                    }}
                  >
                    No.{e.issue}
                  </span>
                </div>

                <div
                  style={{
                    display: "inline-block",
                    alignSelf: "flex-start",
                    background: "#9DBEBB",
                    color: "#031926",
                    padding: "4px 10px",
                    borderRadius: 40,
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: ".1em",
                    textTransform: "uppercase",
                    margin: "18px 0 12px",
                  }}
                >
                  {e.cat}
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: 26,
                    lineHeight: 1.04,
                    letterSpacing: "-.02em",
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {e.title}
                </h3>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 14,
                    borderTop: "2px solid #031926",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "#468189",
                  }}
                >
                  <span>{e.date} 2026</span>
                  <span style={{ color: "#031926", fontWeight: 600 }}>
                    Read →
                  </span>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </section>
  );
}
