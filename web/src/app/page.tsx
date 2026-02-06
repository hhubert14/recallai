import { Header } from "./(landing)/_components/Header";
import { HeroSection } from "./(landing)/_components/HeroSection";
import { HowItWorksSection } from "./(landing)/_components/HowItWorksSection";
import { FeaturesSection } from "./(landing)/_components/FeaturesSection";
import { WhatsNewSection } from "./(landing)/_components/WhatsNewSection";
import { CTASection } from "./(landing)/_components/CTASection";
import { Footer } from "./(landing)/_components/Footer";
import { AnnouncementBanner } from "./(landing)/_components/components/AnnouncementBanner";

export default function Home() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <AnnouncementBanner />
      <Header />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <WhatsNewSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
