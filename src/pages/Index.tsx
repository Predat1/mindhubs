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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <CoursesSection />
      <TrustLogosSection />
      <ExpertiseSection />
      <GoogleReviewsSection />
      <NewsletterSection />
      <HelpSection />
      <FooterSection />
    </div>
  );
};

export default Index;
