import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, Spline_Sans_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { PageLoader } from "@/components/PageLoader";
import { NewsletterPopup } from "@/components/NewsletterPopup";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://articlenews.co";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "variable",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

const splineMono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Article",
  url: SITE_URL,
  description: "The free daily AI newsletter that explains what's actually happening — in plain English, in 5 minutes.",
  publisher: {
    "@type": "Organization",
    name: "Article",
    url: SITE_URL,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/vault?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Article — The Free Daily AI Newsletter, In Plain English",
    template: "%s | Article",
  },
  description:
    "The free daily AI newsletter that explains what's actually happening — in plain English, in 5 minutes. No jargon, no hype. Join thousands of readers.",
  keywords: [
    "AI newsletter",
    "AI newsletter free",
    "AI news",
    "artificial intelligence news",
    "AI explained",
    "AI news daily",
    "AI for beginners",
    "AI explained for non-techies",
    "AI news plain English",
    "what is AI",
    "AI updates today",
    "machine learning news",
    "ChatGPT news",
    "OpenAI news",
  ],
  authors: [{ name: "Article" }],
  creator: "Article",
  publisher: "Article",
  openGraph: {
    title: "Article — The Free Daily AI Newsletter, In Plain English",
    description:
      "The free daily AI newsletter that explains what's actually happening — in plain English, in 5 minutes. No jargon, no hype.",
    url: SITE_URL,
    siteName: "Article",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Article — The Free Daily AI Newsletter, In Plain English",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Article — The Free Daily AI Newsletter, In Plain English",
    description: "The free daily AI newsletter. AI news in plain English, in 5 minutes. No jargon, no hype.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bricolage.variable} ${hanken.variable} ${splineMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <PageLoader />
        <div className="page-reveal">{children}</div>
        <NewsletterPopup />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
