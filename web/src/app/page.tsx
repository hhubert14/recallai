import { Header } from "./(landing)/Header";
import { HeroSection } from "./(landing)/HeroSection";
import { HowItWorksSection } from "./(landing)/HowItWorksSection";
import { FeaturesSection } from "./(landing)/FeaturesSection";
import { WhatsNewSection } from "./(landing)/WhatsNewSection";
import { CTASection } from "./(landing)/CTASection";
import { Footer } from "./(landing)/Footer";
import { AnnouncementBanner } from "./(landing)/components/AnnouncementBanner";

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
