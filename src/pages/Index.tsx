import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import CoursesSection from "@/components/CoursesSection";
import TrustLogosSection from "@/components/TrustLogosSection";
import ExpertiseSection from "@/components/ExpertiseSection";
import VideoTestimonialsSection from "@/components/VideoTestimonialsSection";
import GoogleReviewsSection from "@/components/GoogleReviewsSection";
import NewsletterSection from "@/components/NewsletterSection";
import HelpSection from "@/components/HelpSection";
import FooterSection from "@/components/FooterSection";
import StickyMobileCTA from "@/components/StickyMobileCTA";
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
      <StatsBar />
      <CoursesSection />
      <TrustLogosSection />
      <ExpertiseSection />
      <VideoTestimonialsSection />
      <GoogleReviewsSection />
      <NewsletterSection />
      <HelpSection />
      <FooterSection />
      <StickyMobileCTA />
    </div>
  );
};

export default Index;
