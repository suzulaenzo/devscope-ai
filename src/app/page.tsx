import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { TrustBar } from "@/components/landing/trust-bar";
import { Features } from "@/components/landing/features";
import { AnalysisPreview } from "@/components/landing/analysis-preview";
import { Stats } from "@/components/landing/stats";
import { Pricing } from "@/components/landing/pricing";
import { Cta } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <TrustBar />
      <Features />
      <AnalysisPreview />
      <Stats />
      <Pricing />
      <Cta />
      <Footer />
    </main>
  );
}
