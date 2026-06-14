import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Article — AI News, Explained Simply";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#031926",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 100px",
          position: "relative",
        }}
      >
        {/* Decorative giant A */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -20,
            fontSize: 600,
            fontWeight: 900,
            color: "rgba(70,129,137,0.06)",
            lineHeight: 1,
          }}
        >
          A
        </div>

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              background: "#E0A53F",
              color: "#031926",
              padding: "8px 20px",
              borderRadius: 40,
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            AI Newsletter
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#F4E9CD",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            maxWidth: 800,
          }}
        >
          Article
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#77ACA2",
            marginTop: 24,
            lineHeight: 1.5,
            maxWidth: 700,
          }}
        >
          AI news explained in plain English. No jargon, no hype — just what actually matters.
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 100,
            fontSize: 18,
            color: "#468189",
            letterSpacing: "0.1em",
            fontFamily: "monospace",
          }}
        >
          article.news
        </div>
      </div>
    ),
    { ...size }
  );
}
