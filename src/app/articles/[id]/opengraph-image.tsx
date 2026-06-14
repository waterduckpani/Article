import { ImageResponse } from "next/og";
import { getArticleBySlug, getArticleById } from "@/lib/supabase";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = UUID_REGEX.test(id)
    ? await getArticleById(id)
    : await getArticleBySlug(id);

  const title = article?.plain_title ?? "Article — AI News, Explained Simply";
  const category = article?.category ?? "AI News";

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

        {/* Category pill */}
        <div
          style={{
            display: "flex",
            marginBottom: 36,
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
            {category}
          </div>
        </div>

        {/* Article title */}
        <div
          style={{
            fontSize: title.length > 60 ? 52 : 64,
            fontWeight: 900,
            color: "#F4E9CD",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            maxWidth: 900,
          }}
        >
          {title}
        </div>

        {/* Brand */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 100,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#F4E9CD",
              letterSpacing: "-0.02em",
            }}
          >
            Article
          </div>
          <div
            style={{
              width: 1,
              height: 20,
              background: "rgba(157,190,187,0.3)",
            }}
          />
          <div
            style={{
              fontSize: 14,
              color: "#468189",
              letterSpacing: "0.1em",
              fontFamily: "monospace",
            }}
          >
            articlenews.co
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
