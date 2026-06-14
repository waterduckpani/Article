import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { render } from "@react-email/render";
import WelcomeEmail from "../../../../emails/welcome";

export async function POST(req: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const body = await req.json();
    const email = (body?.email ?? "").trim().toLowerCase();

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const { error: dbError } = await supabaseAdmin
      .from("subscribers")
      .insert({ email });

    if (dbError) {
      if (dbError.code === "23505") {
        return NextResponse.json(
          { error: "You're already subscribed." },
          { status: 409 }
        );
      }
      console.error("Supabase insert error:", dbError.message);
      return NextResponse.json({ error: "Could not save your email." }, { status: 500 });
    }

    const html = await render(WelcomeEmail());

    const { error: emailError } = await resend.emails.send({
      from: "Article <hello@articlenews.co>",
      to: email,
      subject: "You're in — your first edition lands tomorrow morning.",
      html,
    });

    if (emailError) {
      console.error("Resend error:", emailError.message);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Subscribe route error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
