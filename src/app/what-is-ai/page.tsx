import { Navbar } from "@/components/Navbar";
import { WhatIsAIPage } from "@/components/WhatIsAIPage";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "What is AI? — Article",
  description:
    "No math, no jargon, no homework. A plain-English scroll through what AI actually is — in five ideas.",
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
