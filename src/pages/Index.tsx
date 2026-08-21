import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DiscoverySection from "@/components/DiscoverySection";
import TrustFeaturesSection from "@/components/TrustFeaturesSection";
import CommercePathsSection from "@/components/CommercePathsSection";
import FAQSection from "@/components/FAQSection";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Marketplace de produits digitaux et formations"
        description="Découvrez des formations, ebooks, logiciels et ressources numériques proposés par MindHubs et ses vendeurs. Achetez, apprenez et développez vos projets depuis une marketplace pensée pour l'Afrique francophone."
        path="/"
        keywords="formations digitales Afrique, e-books business Afrique, formation en ligne Bénin, Sénégal, Côte d'Ivoire, marketing digital Afrique, business en ligne Afrique, MindHubs, formation premium, vendre produits digitaux, e-commerce Afrique, mobile money"
        faq={[
          { question: "Qu'est-ce que MindHubs ?", answer: "MindHubs est une marketplace de produits et formations digitales pour les acheteurs et les vendeurs francophones." },
          { question: "Comment acheter sur MindHubs ?", answer: "Choisissez un produit, ajoutez-le au panier et payez par Mobile Money (MTN, Moov, Orange Money, Wave) ou carte bancaire. L'accès est disponible après confirmation de la commande." },
          { question: "MindHubs est-il disponible dans mon pays ?", answer: "MindHubs est disponible dans toute l'Afrique francophone : Bénin, Sénégal, Côte d'Ivoire, Cameroun, Togo, Burkina Faso, Gabon, Mali, RD Congo, et plus." },
          { question: "Les formations sont-elles en français ?", answer: "Oui, toutes nos formations sont 100% en français, créées par des experts francophones pour le marché africain." },
        ]}
      />
      <Navbar />
      <HeroSection />
      <DiscoverySection />
      <TrustFeaturesSection />
      <CommercePathsSection />
      <FAQSection />
      <section className="border-t border-border py-16 sm:py-20">
        <div className="container mx-auto flex max-w-4xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Prêt à commencer ?</p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">Votre prochaine étape commence ici.</h2>
          </div>
          <Link to="/boutique" className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5">
            Explorer la marketplace <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
      <FooterSection />
    </div>
  );
};

export default Index;
