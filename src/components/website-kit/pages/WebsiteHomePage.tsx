import { HeroSection } from '../sections/HeroSection';
import { FeaturesGrid } from '../sections/FeaturesGrid';
import { SocialProof } from '../sections/SocialProof';
import { HowItWorksSection } from '../sections/HowItWorksSection';
import { CTASection } from '../sections/CTASection';

export const WebsiteHomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Grid */}
      <FeaturesGrid />
      
      {/* Social Proof / Testimonials */}
      <SocialProof />
      
      {/* How It Works */}
      <HowItWorksSection />
      
      {/* CTA Section */}
      <CTASection />
    </div>
  );
};
