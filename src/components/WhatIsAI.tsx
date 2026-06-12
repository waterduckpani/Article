import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const concepts = [
  {
    num: "01",
    title: "It's a very good guesser",
    body: "Like autocomplete, but for full sentences, ideas, and code. It predicts what comes next — very, very well.",
  },
  {
    num: "02",
    title: "It learned by reading a lot",
    body: "Trillions of words — books, websites, code — consumed in months. The patterns it absorbed became its understanding.",
  },
  {
    num: "03",
    title: "It can be wrong, confidently",
    body: "No built-in doubt switch. It generates plausible text, not verified truth. Knowing this is your superpower.",
  },
];

export function WhatIsAI() {
  return (
    <section
      id="whatis"
      style={{ background: "#E0A53F", color: "#031926", padding: "90px 56px" }}
    >
      {/* Thin editorial rule at top */}
      <div
        style={{
          width: "100%",
          height: 2,
          background: "rgba(3,25,38,.15)",
          marginBottom: 72,
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 72,
          alignItems: "start",
        }}
      >
        {/* Left: text */}
        <RevealOnScroll delay={0}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: ".22em",
              textTransform: "uppercase",
              color: "rgba(3,25,38,.6)",
              marginBottom: 20,
            }}
          >
            Never read about this before?
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 64,
              lineHeight: 0.95,
              letterSpacing: "-.03em",
              margin: "0 0 24px",
            }}
          >
            What even<br />is AI?
          </h2>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.65,
              maxWidth: "28em",
              margin: "0 0 36px",
              color: "#1a2e2e",
            }}
          >
            Think of it as a very, very good guesser. We start right there —
            then build up, one plain-English idea at a time. No math. No
            buzzwords. Just enough to feel at home in any conversation about it.
          </p>
          <Button variant="primary" href="/what-is-ai">
            Start from the very beginning →
          </Button>
        </RevealOnScroll>

        {/* Right: concept cards with stagger */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {concepts.map((c, i) => (
            <RevealOnScroll key={c.num} delay={i * 110}>
              <div
                className="concept-card"
                style={{
                  background: "#F4E9CD",
                  border: "2px solid #031926",
                  borderRadius: 12,
                  padding: "24px 28px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 14,
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#468189",
                      flexShrink: 0,
                    }}
                  >
                    {c.num}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 20,
                      letterSpacing: "-.015em",
                      color: "#031926",
                      lineHeight: 1.1,
                    }}
                  >
                    {c.title}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 14.5,
                    lineHeight: 1.6,
                    color: "#2a4348",
                    margin: 0,
                    paddingLeft: 30,
                  }}
                >
                  {c.body}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
