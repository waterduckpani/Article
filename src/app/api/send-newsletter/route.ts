import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { render } from "@react-email/render";
import NewsletterEmail, { type NewsletterArticle } from "../../../../emails/newsletter";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

const BATCH_SIZE = 100;

function todayLabel(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { data: articlesData, error: articlesError } = await supabaseAdmin
      .from("articles")
      .select("id, slug, plain_title, plain_summary, category, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(6);

    if (articlesError) {
      console.error("Failed to fetch articles:", articlesError.message);
      return NextResponse.json({ error: "Failed to fetch articles." }, { status: 500 });
    }

    const articles = (articlesData ?? []) as NewsletterArticle[];

    if (articles.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: "No articles to send." });
    }

    const { data: subscribersData, error: subscribersError } = await supabaseAdmin
      .from("subscribers")
      .select("email")
      .eq("active", true);

    if (subscribersError) {
      console.error("Failed to fetch subscribers:", subscribersError.message);
      return NextResponse.json({ error: "Failed to fetch subscribers." }, { status: 500 });
    }

    const subscribers: { email: string }[] = subscribersData ?? [];

    if (subscribers.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: "No active subscribers." });
    }

    const subject = `${articles[0].plain_title} — and more from Article`;
    const date = todayLabel();
    const html = await render(NewsletterEmail({ articles, date }));

    let sent = 0;

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);

      const { error: batchError } = await resend.batch.send(
        batch.map(({ email }) => ({
          from: "Article <hello@articlenews.co>",
          to: email,
          subject,
          html,
        }))
      );

      if (batchError) {
        console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} error:`, batchError.message);
      } else {
        sent += batch.length;
      }
    }

    return NextResponse.json({ ok: true, sent });
  } catch (err) {
    console.error("Send newsletter route error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
