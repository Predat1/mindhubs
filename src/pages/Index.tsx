import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import LogoMarquee from "@/components/LogoMarquee";
import DiscoverySection from "@/components/DiscoverySection";
import TrustLogosSection from "@/components/TrustLogosSection";
import PopularProductsSection from "@/components/PopularProductsSection";
import NewProductsSection from "@/components/NewProductsSection";
import ExpertiseSection from "@/components/ExpertiseSection";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";
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
        description="MindHub : la plateforme N°1 de formations digitales en Afrique. E-books, kits business, marketing digital. Paiement unique, accès illimité à vie. +500 étudiants formés."
        path="/"
        keywords="formations digitales, e-books, formation en ligne Afrique, marketing digital, business en ligne, MindHub, formation premium, compétences digitales"
      />
      <Navbar />
      <HeroSection />
      <LogoMarquee />
      <DiscoverySection />
      <PopularProductsSection />
      <StatsBar />
      <TrustLogosSection />
      <NewProductsSection />
      <ExpertiseSection />
      <GoogleReviewsSection />
      <RecentlyViewedSection />
      <FAQSection />
      <NewsletterSection />
      <HelpSection />
      <FooterSection />
    </div>
  );
};

export default Index;
