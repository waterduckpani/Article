import { Navbar } from "@/components/Navbar";
import { Ticker } from "@/components/Ticker";
import { Hero } from "@/components/Hero";
import { Archive } from "@/components/Archive";
import { WhatIsAI } from "@/components/WhatIsAI";
import { EmailSignup } from "@/components/EmailSignup";
import { Footer } from "@/components/Footer";
import { getPublishedArticles } from "@/lib/supabase";

export const revalidate = 3600;

export default async function Home() {
  const articles = await getPublishedArticles(20);
  const bigStories = articles.filter((a) => a.category === "The Big Story");
  const latest = bigStories[0] ?? articles[0] ?? null;

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
