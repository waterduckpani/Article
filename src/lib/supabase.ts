import { createClient } from "@supabase/supabase-js";

export type Article = {
  id: string;
  source_url: string;
  source_name: string;
  plain_title: string;
  plain_summary: string;
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
    .select("id, source_url, source_name, plain_title, plain_summary, category, quality_score, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch articles:", error.message);
    return [];
  }

  return data ?? [];
}
