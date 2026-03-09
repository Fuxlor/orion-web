import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { QuickstartSection } from "@/components/landing/QuickstartSection";
import { Footer } from "@/components/landing/Footer";

export const dynamic = 'force-static';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--page-bg)]">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <QuickstartSection />
      </main>
      <Footer />
    </div>
  );
}
