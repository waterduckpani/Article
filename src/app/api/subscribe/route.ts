import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { render } from "@react-email/render";
import WelcomeEmail from "../../../../emails/welcome";
import { cleanFirstName } from "@/lib/personalize";

// Mark this device as subscribed via a server-set cookie. Unlike localStorage
// (which iOS Safari's ITP wipes after 7 days), a cookie set in the HTTP
// response persists for its full lifetime, so the popup stays suppressed.
function withSubscribedCookie(res: NextResponse): NextResponse {
  res.cookies.set("article_subscribed", "1", {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    // Not httpOnly: the client popup reads this to decide whether to show.
  });
  return res;
}

export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const body = await req.json();
    const email = (body?.email ?? "").trim().toLowerCase();
    const firstName = cleanFirstName(body?.name);

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const { error: dbError } = await supabaseAdmin
      .from("subscribers")
      .insert({ email, first_name: firstName });

    if (dbError) {
      if (dbError.code === "23505") {
        // Already on the list — still mark the device so the popup stops.
        return withSubscribedCookie(
          NextResponse.json({ error: "You're already subscribed." }, { status: 409 })
        );
      }
      console.error("Supabase insert error:", dbError.message);
      return NextResponse.json({ error: "Could not save your email." }, { status: 500 });
    }

    const html = await render(WelcomeEmail({ firstName }));

    const { error: emailError } = await resend.emails.send({
      from: "Article <hello@articlenews.co>",
      to: email,
      subject: "You're in — your first edition lands tomorrow morning.",
      html,
    });

    if (emailError) {
      console.error("Resend error:", emailError.message);
    }

    return withSubscribedCookie(NextResponse.json({ ok: true }, { status: 200 }));
  } catch (err) {
    console.error("Subscribe route error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
