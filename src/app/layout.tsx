import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, Spline_Sans_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Loader } from "@/components/Loader";

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
  title: "Article — AI, in plain English",
  description:
    "Every morning we read the entire AI world so you don't have to — then explain what actually matters, like a smart friend who happens to know this stuff.",
  openGraph: {
    title: "Article — AI, in plain English",
    description: "The daily AI edition. No jargon. No hype. No homework.",
    type: "website",
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
        <Loader />
        <div className="page-reveal">{children}</div>
        <SpeedInsights />
      </body>
    </html>
  );
}
