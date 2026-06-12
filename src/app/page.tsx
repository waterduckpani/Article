import { Navbar } from "@/components/Navbar";
import { Ticker } from "@/components/Ticker";
import { Hero } from "@/components/Hero";
import { Archive } from "@/components/Archive";
import { WhatIsAI } from "@/components/WhatIsAI";
import { EmailSignup } from "@/components/EmailSignup";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Ticker />
      <Hero />
      <Archive />
      <WhatIsAI />
      <EmailSignup />
      <Footer />
    </main>
  );
}
