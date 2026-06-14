import { Navbar } from "@/components/Navbar";
import { WhatIsAIPage } from "@/components/WhatIsAIPage";
import { Footer } from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://article.news";

export const metadata = {
  title: "What is AI? A Plain-English Guide",
  description:
    "What is artificial intelligence, really? No math, no jargon, no homework — a plain-English explanation of AI in five ideas.",
  keywords: ["what is AI", "artificial intelligence explained", "AI for beginners", "what is artificial intelligence"],
  alternates: { canonical: `${SITE_URL}/what-is-ai` },
  openGraph: {
    title: "What is AI? A Plain-English Guide",
    description: "No math, no jargon, no homework — AI explained simply in five ideas.",
    url: `${SITE_URL}/what-is-ai`,
    siteName: "Article",
    type: "article",
  },
};

export default function WhatIsAIRoute() {
  return (
    <>
      <Navbar />
      <WhatIsAIPage />
      <Footer />
    </>
  );
}
