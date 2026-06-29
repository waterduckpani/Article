-- View tracking for the Vault's "Popular" sort.
-- Run this once in the Supabase SQL editor (or via the CLI) against production.

-- 1. Per-article view counter. Backfills existing rows to 0.
alter table public.articles
  add column if not exists view_count integer not null default 0;

-- 2. Atomic increment. Runs as the function owner so the public API route can
--    bump the counter through a single RPC without a broad UPDATE policy.
create or replace function public.increment_article_views(article_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.articles
     set view_count = view_count + 1
   where id = article_id
     and status = 'published';
$$;

-- Allow the anon/auth roles to call the RPC (the function body is the only
-- write path it exposes).
grant execute on function public.increment_article_views(uuid) to anon, authenticated;
