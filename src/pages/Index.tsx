import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import LogoMarquee from "@/components/LogoMarquee";
import DiscoverySection from "@/components/DiscoverySection";
import TrustLogosSection from "@/components/TrustLogosSection";
import TrustFeaturesSection from "@/components/TrustFeaturesSection";
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
        description="MindHub : plateforme N°1 de formations digitales premium en Afrique francophone. E-books, kits business, marketing digital, IA créative. Paiement unique, accès illimité à vie. +2 000 étudiants formés au Bénin, Sénégal, Côte d'Ivoire."
        path="/"
        keywords="formations digitales Afrique, e-books business Afrique, formation en ligne Bénin, Sénégal, Côte d'Ivoire, marketing digital Afrique, business en ligne Afrique, MindHub, formation premium, gagner argent en ligne, vendre produits digitaux, e-commerce Afrique, mobile money"
        faq={[
          { question: "Qu'est-ce que MindHub ?", answer: "MindHub est la plateforme N°1 de formations digitales premium en Afrique francophone. Nous proposons des e-books, kits business, et outils IA créatifs pour entrepreneurs africains." },
          { question: "Comment acheter sur MindHub ?", answer: "Choisissez votre formation, ajoutez-la au panier et payez par Mobile Money (MTN, Moov, Orange Money, Wave) ou carte bancaire. Accès instantané et illimité à vie." },
          { question: "MindHub est-il disponible dans mon pays ?", answer: "MindHub est disponible dans toute l'Afrique francophone : Bénin, Sénégal, Côte d'Ivoire, Cameroun, Togo, Burkina Faso, Gabon, Mali, RD Congo, et plus." },
          { question: "Les formations sont-elles en français ?", answer: "Oui, toutes nos formations sont 100% en français, créées par des experts francophones pour le marché africain." },
        ]}
      />
      <Navbar />
      <HeroSection />
      <LogoMarquee />
      <DiscoverySection />
      <StatsBar />
      <TrustLogosSection />
      <TrustFeaturesSection />
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
