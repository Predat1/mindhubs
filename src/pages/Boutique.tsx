import { useState } from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

import courseExcel from "@/assets/course-excel.jpg";
import courseContrats from "@/assets/course-contrats.jpg";
import courseBusinessAfrica from "@/assets/course-business-africa.jpg";
import courseFournisseurs from "@/assets/course-fournisseurs.jpg";
import courseBusinessPlan from "@/assets/course-business-plan.jpg";
import courseDessinsAnimes from "@/assets/course-dessins-animes.jpg";
import courseAudit from "@/assets/course-audit.jpg";
import courseMarketing from "@/assets/course-marketing.jpg";
import courseRh from "@/assets/course-rh.jpg";
import courseLogistique from "@/assets/course-logistique.jpg";
import courseGestion from "@/assets/course-gestion.jpg";
import courseLivres from "@/assets/course-livres.jpg";
import courseAnglais from "@/assets/course-anglais.jpg";
import courseEloquence from "@/assets/course-eloquence.jpg";
import courseSmma from "@/assets/course-smma.jpg";
import courseBlog from "@/assets/course-blog.jpg";
import courseYoutube from "@/assets/course-youtube.jpg";
import courseAffiliation from "@/assets/course-affiliation.jpg";
import courseEcommerce from "@/assets/course-ecommerce.jpg";
import courseAi from "@/assets/course-ai.jpg";

type Category = "Tous" | "Business" | "Formations" | "Kits" | "Livres" | "Logiciels" | "Packs Enfants";

interface Product {
  title: string;
  image: string;
  oldPrice: string;
  price: string;
  category: Category;
  rating?: number;
}

const products: Product[] = [
  { title: "100 progiciels Excel professionnels", image: courseExcel, oldPrice: "100 $", price: "10 $", category: "Logiciels" },
  { title: "1300 modèles de contrats et actes juridiques", image: courseContrats, oldPrice: "200 $", price: "20 $", category: "Business" },
  { title: "150 meilleures idées de business à développer en Afrique", image: courseBusinessAfrica, oldPrice: "80 $", price: "12 $", category: "Business" },
  { title: "200 contacts de fournisseurs chinois fiables", image: courseFournisseurs, oldPrice: "100 $", price: "10 $", category: "Business" },
  { title: "200 modèles de plan d'affaire", image: courseBusinessPlan, oldPrice: "130 $", price: "24 $", category: "Business" },
  { title: "250 dessins animés pour apprendre l'anglais et l'informatique", image: courseDessinsAnimes, oldPrice: "100 $", price: "10 $", category: "Packs Enfants" },
  { title: "3 Kits Audit, Comptabilité et Business Plan", image: courseAudit, oldPrice: "150 $", price: "15 $", category: "Kits" },
  { title: "3 Kits Marketing et Relation Client", image: courseMarketing, oldPrice: "150 $", price: "15 $", category: "Kits" },
  { title: "4 Kits Ressources Humaines et Management", image: courseRh, oldPrice: "150 $", price: "15 $", category: "Kits" },
  { title: "4 Kits Transport, Logistiques et Outils de Gestion", image: courseLogistique, oldPrice: "150 $", price: "15 $", category: "Kits" },
  { title: "5 Kits Gestion et Administration", image: courseGestion, oldPrice: "150 $", price: "15 $", category: "Kits" },
  { title: "50 livres de réussite et de richesse", image: courseLivres, oldPrice: "30 $", price: "4 $", category: "Livres" },
  { title: "Apprendre et parler l'anglais", image: courseAnglais, oldPrice: "120 $", price: "10 $", category: "Formations", rating: 4.5 },
  { title: "Apprenez à parler avec éloquence", image: courseEloquence, oldPrice: "70 $", price: "10 $", category: "Formations", rating: 5 },
  { title: "Créez votre agence SMMA : gagnez 1000€ par mois", image: courseSmma, oldPrice: "30 $", price: "10 $", category: "Formations" },
  { title: "Création de blog rentable et automatisé", image: courseBlog, oldPrice: "80 $", price: "10 $", category: "Formations" },
  { title: "Gagnez de l'argent sur YouTube", image: courseYoutube, oldPrice: "80 $", price: "10 $", category: "Formations" },
  { title: "Réussir dans l'affiliation : 1000€ par mois", image: courseAffiliation, oldPrice: "80 $", price: "10 $", category: "Formations" },
  { title: "Créez votre boutique en ligne et boostez vos ventes", image: courseEcommerce, oldPrice: "80 $", price: "10 $", category: "Formations" },
  { title: "Formation complète intelligence artificielle", image: courseAi, oldPrice: "60 $", price: "10 $", category: "Formations" },
];

const categories: Category[] = ["Tous", "Business", "Formations", "Kits", "Livres", "Logiciels", "Packs Enfants"];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1 text-xs text-muted-foreground">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? "text-accent fill-accent" : i < rating ? "text-accent fill-accent opacity-50" : "text-muted-foreground"}`} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
    <span className="ml-1">Note {rating.toFixed(2)} sur 5</span>
  </div>
);

const Boutique = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("Tous");

  const filtered = activeCategory === "Tous"
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-16">
        <div className="relative py-20 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent" />
          <h1 className="relative text-4xl md:text-5xl font-bold text-foreground">
            Nos Packs Et Formations
          </h1>
        </div>
      </section>

      {/* Title Card */}
      <section className="container mx-auto px-4 -mt-6 mb-12">
        <div className="stat-card rounded-2xl py-12 px-8 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Tous Nos Packs Et Formations
          </h2>
        </div>
      </section>

      {/* Category Filter */}
      <section className="container mx-auto px-4 mb-10">
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${
                activeCategory === cat
                  ? "btn-primary-brand border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <div key={product.title} className="course-card rounded-xl overflow-hidden">
              <div className="relative">
                <span className="absolute top-3 left-3 badge-purple text-xs font-semibold px-3 py-1 rounded-full z-10">
                  Promo !
                </span>
                <img
                  src={product.image}
                  alt={product.title}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="w-full h-52 object-cover"
                />
              </div>
              <div className="p-4 space-y-3">
                <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
                  {product.title}
                </h3>
                {product.rating && <StarRating rating={product.rating} />}
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground line-through text-sm">
                    {product.oldPrice}
                  </span>
                  <span className="text-accent font-bold text-lg">{product.price}</span>
                </div>
                <button className="w-full btn-primary-brand py-2.5 rounded-lg font-semibold text-sm">
                  ACHETER MAINTENANT
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default Boutique;
