import { Header, HeroSection, FeaturesSection, PricingSection, QuickstartSection, Footer } from "@/components/landing/index";

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
