import { LandingNav } from "./components/LandingNav";
import { HeroSection } from "./components/HeroSection";
import { SocialProofBar } from "./components/SocialProofBar";
import { FeaturesSection } from "./components/FeaturesSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { CTASection } from "./components/CTASection";
import { FooterSection } from "./components/FooterSection";

export function LandingPage() {
  return (
    <>
      <LandingNav />
      <HeroSection />
      <SocialProofBar />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <FooterSection />
    </>
  );
}
