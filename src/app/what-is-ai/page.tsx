import { Navbar } from "@/components/Navbar";
import { WhatIsAIPage } from "@/components/WhatIsAIPage";
import { Footer } from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://articlenews.co";

export const metadata = {
  title: "What is AI? A Plain-English Guide for Beginners",
  description:
    "What is artificial intelligence, really? No math, no jargon, no prior knowledge needed — a plain-English guide to AI in five ideas. Start here if you're new.",
  keywords: ["what is AI", "what is artificial intelligence", "artificial intelligence explained", "AI for beginners", "AI explained simply", "AI plain English", "how does AI work"],
  alternates: { canonical: `${SITE_URL}/what-is-ai` },
  openGraph: {
    title: "What is AI? A Plain-English Guide for Beginners",
    description: "No math, no jargon, no prior knowledge needed — AI explained simply in five ideas.",
    url: `${SITE_URL}/what-is-ai`,
    siteName: "Article",
    type: "article",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "What is AI? — Article" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "What is AI? A Plain-English Guide for Beginners",
    description: "No math, no jargon — AI explained simply in five ideas.",
    images: ["/og-image.png"],
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
