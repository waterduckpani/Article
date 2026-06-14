import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, Spline_Sans_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { PageLoader } from "@/components/PageLoader";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Article — AI News, Explained Simply",
    template: "%s | Article",
  },
  description:
    "Daily AI news explained in plain English. Every morning we cover the stories that actually matter — no jargon, no hype, no homework.",
  keywords: [
    "AI news",
    "artificial intelligence news",
    "AI newsletter",
    "AI news daily",
    "AI explained",
    "AI updates today",
    "machine learning news",
    "ChatGPT news",
    "OpenAI news",
    "AI articles",
  ],
  authors: [{ name: "Article" }],
  creator: "Article",
  publisher: "Article",
  openGraph: {
    title: "Article — AI News, Explained Simply",
    description:
      "Daily AI news explained in plain English. No jargon, no hype — just what actually matters.",
    url: SITE_URL,
    siteName: "Article",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Article — AI News, Explained Simply",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Article — AI News, Explained Simply",
    description: "Daily AI news explained in plain English. No jargon, no hype.",
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
        <PageLoader />
        <div className="page-reveal">{children}</div>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
