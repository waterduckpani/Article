import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArchivePage } from "@/components/ArchivePage";
import { getAllArticles } from "@/lib/supabase";

export const revalidate = 3600;

export const metadata = {
  title: "Archive — Article",
  description: "Every AI story we've ever published.",
};

export default async function Archive() {
  const articles = await getAllArticles();

  return (
    <>
      <Navbar />
      <main style={{ background: "#F4E9CD", minHeight: "100vh" }}>

        {/* Page header */}
        <div className="page-hero-header" style={{
          background: "#031926",
          position: "relative",
          overflow: "hidden",
        }}>
          <div aria-hidden style={{
            position: "absolute",
            top: -40,
            right: -20,
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: 340,
            lineHeight: 0.85,
            color: "rgba(70,129,137,.07)",
            userSelect: "none",
            pointerEvents: "none",
            letterSpacing: "-.05em",
          }}>
            A
          </div>

          <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1, padding: "0 0" }}>
            <a
              href="/"
              className="nav-link"
              style={{
                display: "inline-block",
                marginBottom: 48,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "#468189",
              }}
            >
              ← Home
            </a>

            <div style={{
              fontSize: 12.5,
              fontWeight: 800,
              letterSpacing: ".2em",
              textTransform: "uppercase",
              color: "#468189",
              marginBottom: 20,
            }}>
              Every edition we&#39;ve sent
            </div>

            <h1 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(52px, 7vw, 88px)",
              lineHeight: 0.95,
              letterSpacing: "-.03em",
              color: "#F4E9CD",
              margin: "0 0 24px",
            }}>
              The Archive
            </h1>

            <p style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: "#77ACA2",
              maxWidth: "36em",
              margin: 0,
            }}>
              {articles.length} stories and counting.
              Every AI conversation that mattered, explained like a smart friend would.
            </p>
          </div>
        </div>

        {/* Filter + grid */}
        <div style={{ paddingTop: "clamp(32px, 5vw, 56px)" }}>
          <ArchivePage articles={articles} />
        </div>

      </main>
      <Footer />
    </>
  );
}
