import { createClient } from "@supabase/supabase-js";

export type ArticleSource = {
  url: string;
  name: string;
  title?: string;
};

export type Article = {
  id: string;
  source_url: string;
  source_name: string;
  plain_title: string;
  plain_summary: string;
  content: string | null;
  sources: ArticleSource[] | null;
  category: string;
  quality_score: number;
  published_at: string;
  created_at: string;
};

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getPublishedArticles(limit = 20): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("id, source_url, source_name, plain_title, plain_summary, content, sources, category, quality_score, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch articles:", error.message);
    return [];
  }

  return data ?? [];
}

export async function getAllArticles(limit = 500): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("id, source_url, source_name, plain_title, plain_summary, content, sources, category, quality_score, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch all articles:", error.message);
    return [];
  }

  return data ?? [];
}

export type AdjacentArticle = Pick<Article, "id" | "plain_title" | "published_at">;

export async function getAdjacentArticles(
  id: string,
  publishedAt: string
): Promise<{ prev: AdjacentArticle | null; next: AdjacentArticle | null }> {
  const [prevRes, nextRes] = await Promise.all([
    supabase
      .from("articles")
      .select("id, plain_title, published_at")
      .eq("status", "published")
      .neq("id", id)
      .lt("published_at", publishedAt)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("articles")
      .select("id, plain_title, published_at")
      .eq("status", "published")
      .neq("id", id)
      .gt("published_at", publishedAt)
      .order("published_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    prev: (prevRes.data as AdjacentArticle | null) ?? null,
    next: (nextRes.data as AdjacentArticle | null) ?? null,
  };
}

export async function getArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from("articles")
    .select("id, source_url, source_name, plain_title, plain_summary, content, sources, category, quality_score, published_at, created_at")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch article:", error.message);
    return null;
  }

  return data;
}
