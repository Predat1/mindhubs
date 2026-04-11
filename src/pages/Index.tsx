import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import DiscoverySection from "@/components/DiscoverySection";
import TrustLogosSection from "@/components/TrustLogosSection";
import ExpertiseSection from "@/components/ExpertiseSection";
import VideoTestimonialsSection from "@/components/VideoTestimonialsSection";
import GoogleReviewsSection from "@/components/GoogleReviewsSection";
import FAQSection from "@/components/FAQSection";
import NewsletterSection from "@/components/NewsletterSection";
import HelpSection from "@/components/HelpSection";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Formations Digitales Premium"
        description="Accédez à des formations digitales premium et transformez votre avenir professionnel. Paiement unique, accès illimité à vie."
        path="/"
      />
      <Navbar />
      <HeroSection />
      <DiscoverySection />
      <StatsBar />
      <TrustLogosSection />
      <ExpertiseSection />
      <VideoTestimonialsSection />
      <GoogleReviewsSection />
      <FAQSection />
      <NewsletterSection />
      <HelpSection />
      <FooterSection />
    </div>
  );
};

export default Index;
