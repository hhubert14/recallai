import { Header } from "./(landing)/Header";
import { HeroSection } from "./(landing)/HeroSection";
import { HowItWorksSection } from "./(landing)/HowItWorksSection";
import { FeaturesSection } from "./(landing)/FeaturesSection";
import { CTASection } from "./(landing)/CTASection";
import { Footer } from "./(landing)/Footer";

export default function Home() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
