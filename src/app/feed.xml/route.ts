import { getAllArticles } from "@/lib/supabase";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://articlenews.co";

export const revalidate = 3600;

export async function GET() {
  const articles = await getAllArticles(50);

  const items = articles
    .map((a) => {
      const url = `${SITE_URL}/articles/${a.slug ?? a.id}`;
      return `
    <item>
      <title><![CDATA[${a.plain_title}]]></title>
      <description><![CDATA[${a.plain_summary}]]></description>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(a.published_at).toUTCString()}</pubDate>
      <category><![CDATA[${a.category}]]></category>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Article — AI News, Explained Simply</title>
    <link>${SITE_URL}</link>
    <description>Daily AI news explained in plain English. No jargon, no hype — just what actually matters.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
