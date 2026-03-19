import { Header, HeroSection, FeaturesSection, TerminalDemoSection, PricingSection, CTASection, Footer } from "@/components/landing/index";

export const dynamic = 'force-static';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0d0f16" }}>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TerminalDemoSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
