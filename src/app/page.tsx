import { Navbar } from "@/components/Navbar";
import { Ticker } from "@/components/Ticker";
import { Hero } from "@/components/Hero";
import { Archive } from "@/components/Archive";
import { WhatIsAI } from "@/components/WhatIsAI";
import { EmailSignup } from "@/components/EmailSignup";
import { Footer } from "@/components/Footer";
import { getPublishedArticles } from "@/lib/supabase";

export const revalidate = 3600; // re-fetch at most once per hour

export default async function Home() {
  const articles = await getPublishedArticles(20);
  const latest = articles[0] ?? null;

  return (
    <main>
      <Navbar />
      <Ticker articles={articles} />
      <Hero article={latest} />
      <Archive articles={articles} />
      <WhatIsAI />
      <EmailSignup />
      <Footer />
    </main>
  );
}
