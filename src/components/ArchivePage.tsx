"use client";
import { useState, useMemo } from "react";
import type { Article } from "@/lib/supabase";

type SortKey = "newest" | "oldest" | "popular";
type MatchType = "title" | "article" | "both";

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase();
}

function ArchiveCard({ article, matchType }: { article: Article; matchType?: MatchType }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={`/articles/${article.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 282,
        minHeight: 368,
        background: "#FBF5E4",
        border: "2px solid #031926",
        borderRadius: 6,
        padding: 24,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 24px 48px -20px rgba(3,25,38,.5)"
          : "0 8px 20px -12px rgba(3,25,38,.3)",
        transition: "transform 0.28s cubic-bezier(.2,.85,.25,1), box-shadow 0.28s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, letterSpacing: "-.02em" }}>
          Article
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, color: "#468189" }}>
          {article.source_name?.split(",")[0]?.trim() || "Article"}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", margin: "18px 0 12px" }}>
        <div style={{
          display: "inline-block",
          background: "#9DBEBB",
          color: "#031926",
          padding: "4px 10px",
          borderRadius: 40,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: ".1em",
          textTransform: "uppercase",
        }}>
          {article.category}
        </div>
        {matchType && (
          <div style={{
            display: "inline-block",
            background: "#E0A53F",
            color: "#031926",
            padding: "4px 10px",
            borderRadius: 40,
            fontSize: 9.5,
            fontWeight: 800,
            letterSpacing: ".08em",
            textTransform: "uppercase",
          }}>
            {matchType === "both" ? "Title + Article" : matchType === "title" ? "Title match" : "Article match"}
          </div>
        )}
      </div>

      <h3 style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 24,
        lineHeight: 1.08,
        letterSpacing: "-.02em",
        margin: "0 0 12px",
        flex: 1,
      }}>
        {article.plain_title}
      </h3>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 14,
        borderTop: "2px solid #031926",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        fontWeight: 500,
        color: "#468189",
      }}>
        <span>{formatShortDate(article.published_at)}</span>
        <span style={{ color: "#031926", fontWeight: 600 }}>Read →</span>
      </div>
    </a>
  );
}

const SORT_LABELS: Record<SortKey, string> = {
  newest: "Newest",
  oldest: "Oldest",
  popular: "Popular",
};

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function getMatchType(article: Article, query: string): MatchType | null {
  if (!query) return null;
  const q = normalize(query);
  const inTitle = normalize(article.plain_title).includes(q);
  const inBody = normalize((article.plain_summary ?? "") + " " + (article.content ?? "")).includes(q);
  if (inTitle && inBody) return "both";
  if (inTitle) return "title";
  if (inBody) return "article";
  return null;
}

export function ArchivePage({ articles }: { articles: Article[] }) {
  const [sort, setSort] = useState<SortKey>("newest");
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");

  const categories = useMemo(() => {
    const cats = Array.from(new Set(articles.map((a) => a.category).filter(Boolean))).sort();
    return ["All", ...cats];
  }, [articles]);

  const sorted = useMemo(() => {
    let result = [...articles];
    if (activeCategory !== "All") {
      result = result.filter((a) => a.category === activeCategory);
    }
    if (query.trim().length >= 2) {
      result = result.filter((a) => getMatchType(a, query.trim()) !== null);
    }
    if (sort === "newest") {
      result.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    } else if (sort === "oldest") {
      result.sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime());
    } else {
      result.sort((a, b) => (b.quality_score ?? 0) - (a.quality_score ?? 0));
    }
    return result;
  }, [articles, sort, activeCategory, query]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 56px 100px" }}>

      {/* Search bar */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ position: "relative", maxWidth: 540 }}>
          <span style={{
            position: "absolute",
            left: 18,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: 14,
            color: "#468189",
            pointerEvents: "none",
          }}>
            ⌕
          </span>
          <input
            type="text"
            placeholder="Search titles and articles…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 18px 14px 42px",
              borderRadius: 10,
              border: "2px solid rgba(3,25,38,.18)",
              background: "transparent",
              fontFamily: "var(--font-body)",
              fontSize: 15,
              fontWeight: 500,
              color: "#031926",
              outline: "none",
              transition: "border-color 0.18s ease",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#468189")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(3,25,38,.18)")}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 16,
                color: "#77ACA2",
                lineHeight: 1,
                padding: 4,
              }}
            >
              ×
            </button>
          )}
        </div>
        {query.trim().length >= 2 && (
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#77ACA2", marginTop: 8, letterSpacing: ".06em" }}>
            {sorted.length} {sorted.length === 1 ? "match" : "matches"} — badges show whether search hit the title or article body
          </p>
        )}
      </div>

      {/* Controls bar */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        alignItems: "flex-start",
        marginBottom: 52,
        paddingTop: 8,
      }}>

        {/* Sort */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "#77ACA2",
          }}>
            Sort
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {(Object.keys(SORT_LABELS) as SortKey[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 40,
                  border: sort === s ? "2px solid #031926" : "2px solid rgba(3,25,38,.18)",
                  background: sort === s ? "#031926" : "transparent",
                  color: sort === s ? "#F4E9CD" : "#3a565b",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: ".02em",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                {SORT_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "#77ACA2",
          }}>
            Category
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 40,
                  border: activeCategory === cat ? "2px solid #468189" : "2px solid rgba(3,25,38,.18)",
                  background: activeCategory === cat ? "#468189" : "transparent",
                  color: activeCategory === cat ? "#F4E9CD" : "#3a565b",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: ".02em",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        <div style={{
          marginLeft: "auto",
          alignSelf: "flex-end",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 600,
          color: "#77ACA2",
          letterSpacing: ".06em",
          paddingBottom: 2,
        }}>
          {sorted.length} {sorted.length === 1 ? "story" : "stories"}
        </div>
      </div>

      {/* Grid */}
      {sorted.length > 0 ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(282px, 1fr))",
          gap: 28,
          alignItems: "start",
        }}>
          {sorted.map((article) => (
            <ArchiveCard
              key={article.id}
              article={article}
              matchType={query.trim().length >= 2 ? (getMatchType(article, query.trim()) ?? undefined) : undefined}
            />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: "center",
          padding: "80px 0",
          fontFamily: "var(--font-display)",
          fontSize: 28,
          fontWeight: 700,
          color: "#9DBEBB",
          letterSpacing: "-.02em",
        }}>
          No stories in this category yet.
        </div>
      )}
    </div>
  );
}
