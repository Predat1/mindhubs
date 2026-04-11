import courseSmma from "@/assets/course-smma.jpg";
import courseBlog from "@/assets/course-blog.jpg";
import courseYoutube from "@/assets/course-youtube.jpg";
import courseAffiliation from "@/assets/course-affiliation.jpg";
import courseEcommerce from "@/assets/course-ecommerce.jpg";
import courseAi from "@/assets/course-ai.jpg";
import courseChien from "@/assets/course-chien.jpg";
import courseEloquence from "@/assets/course-eloquence.jpg";
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

export type Category = "Tous" | "Business" | "Formations" | "Kits" | "Livres" | "Logiciels" | "Packs Enfants";

export interface Product {
  id: string;
  title: string;
  image: string;
  oldPrice: string;
  price: string;
  category: Category;
  rating?: number;
  tag?: string;
  description?: string;
  paymentLink?: string;
}

export const allProducts: Product[] = [
  { id: "anglais", title: "Apprendre Et Parler L'Anglais En 365 Jours", image: courseAnglais, oldPrice: "60.000 CFA", price: "5.000 CFA", category: "Formations", rating: 4.5, description: "Pack Formation : Apprendre & Parler l'Anglais en 365 Jours\n\nDéveloppez votre niveau d'anglais pas à pas, de débutant à avancé, grâce à un programme complet, moderne et facile à suivre.\n\n**Contenu complet du pack**\n\n1. 50 Modules progressifs\n2. 300 Vidéos explicatives\n3. 400 Audios pour la prononciation\n4. 250 fichiers PDF téléchargeables\n5. Pack IELTS complet\n6. Pack TOEFL & TOEIC\n\nBonus : Programme structuré sur 365 jours, Accès permanent aux fichiers.", paymentLink: "https://nhvjjgbn.mychariow.shop/prd_k42o8e/checkout" },
  { id: "ai", title: "Formation Complète Intelligence Artificielle", image: courseAi, oldPrice: "30.000 CFA", price: "5.000 CFA", category: "Formations", description: "Maîtrisez les outils d'intelligence artificielle les plus puissants. Apprenez à utiliser ChatGPT, Midjourney et d'autres outils IA pour booster votre productivité." },
  { id: "smma", title: "Créez Votre Agence SMMA : Gagnez 1000€ Par Mois", image: courseSmma, oldPrice: "15.000 CFA", price: "5.000 CFA", category: "Formations", description: "Notre formation complète vous guide à travers chaque étape pour créer et développer votre agence SMMA rentable. Apprenez les stratégies de prospection, la gestion client, et les techniques de marketing digital pour atteindre vos premiers 1000€ par mois." },
  { id: "ecommerce", title: "Créez Facilement Votre Boutique En Ligne Et Boostez Vos Ventes", image: courseEcommerce, oldPrice: "40.000 CFA", price: "5.000 CFA", category: "Formations", description: "Apprenez à créer votre boutique en ligne de A à Z. Cette formation couvre le choix de plateforme, la mise en place des produits, les stratégies de vente et le marketing digital." },
  { id: "affiliation", title: "Réussir Dans L'affiliation : La Méthode Pour Générer 1000€ Par Mois", image: courseAffiliation, oldPrice: "40.000 CFA", price: "5.000 CFA", category: "Formations", description: "Maîtrisez l'art du marketing d'affiliation et générez des revenus passifs. Apprenez à choisir les bons programmes, créer du contenu qui convertit, et automatiser vos revenus." },
  { id: "blog", title: "Formation Sur La Création De Blog Rentable Et Automatisé", image: courseBlog, oldPrice: "40.000 CFA", price: "5.000 CFA", category: "Formations", description: "Notre formation en quatre vidéos vous guide à travers chaque étape du processus, du lancement de votre blog à sa monétisation efficace." },
  { id: "youtube", title: "Gagnez De L'argent Sur YouTube", image: courseYoutube, oldPrice: "40.000 CFA", price: "5.000 CFA", category: "Formations", description: "Découvrez comment créer et monétiser une chaîne YouTube rentable. Cette formation couvre la création de contenu, l'optimisation SEO YouTube, et les stratégies de monétisation." },
  { id: "livres", title: "50 Livres De Réussite Et De Richesse", image: courseLivres, oldPrice: "15.000 CFA", price: "2.000 CFA", category: "Livres", description: "Une collection de 50 livres essentiels sur le développement personnel et la réussite financière. Des classiques incontournables pour transformer votre mindset." },
  { id: "business-africa", title: "150 Meilleures Idées De Business À Développer En Afrique", image: courseBusinessAfrica, oldPrice: "40.000 CFA", price: "6.000 CFA", category: "Business", description: "Guide complet des 150 meilleures opportunités de business en Afrique. Chaque idée est détaillée avec un plan d'action et les ressources nécessaires." },
  { id: "contrats", title: "1300 Modèles De Contrats Et Actes Juridiques", image: courseContrats, oldPrice: "100.000 CFA", price: "10.000 CFA", category: "Business", description: "Collection complète de 1300 modèles de contrats et documents juridiques prêts à personnaliser pour votre activité professionnelle." },
  { id: "excel", title: "100 Progiciels Excel Professionnels", image: courseExcel, oldPrice: "50.000 CFA", price: "5.000 CFA", category: "Logiciels", description: "Pack de 100 progiciels Excel prêts à l'emploi pour gérer votre entreprise : comptabilité, facturation, gestion de stock, tableaux de bord et plus encore." },
  { id: "eloquence", title: "Apprenez À Parler Avec Éloquence", image: courseEloquence, oldPrice: "35.000 CFA", price: "5.000 CFA", category: "Formations", rating: 5, description: "Maîtrisez l'art de la prise de parole en public. Techniques de rhétorique, gestion du stress et exercices pratiques pour devenir un orateur convaincant." },
  { id: "business-plan", title: "200 Modèles De Plan D'affaire", image: courseBusinessPlan, oldPrice: "65.000 CFA", price: "12.000 CFA", category: "Business", description: "200 modèles de business plan professionnels prêts à personnaliser. Parfaits pour la recherche de financement ou le lancement de votre entreprise." },
  { id: "fournisseurs", title: "200 Contacts De Fournisseurs Chinois Fiables", image: courseFournisseurs, oldPrice: "50.000 CFA", price: "5.000 CFA", category: "Business", description: "Liste vérifiée de 200 fournisseurs chinois fiables avec leurs coordonnées complètes, spécialités et conditions de commande." },
  { id: "dessins-animes", title: "250 Dessins Animés Pour Apprendre L'anglais Et L'informatique", image: courseDessinsAnimes, oldPrice: "50.000 CFA", price: "5.000 CFA", category: "Packs Enfants", description: "Collection de 250 dessins animés éducatifs pour aider vos enfants à apprendre l'anglais et l'informatique de manière ludique." },
  { id: "audit", title: "3 Kits Audit, Comptabilité Et Business Plan", image: courseAudit, oldPrice: "75.000 CFA", price: "7.500 CFA", category: "Kits", description: "Pack professionnel contenant 3 kits complets pour l'audit, la comptabilité et la création de business plans." },
  { id: "marketing", title: "3 Kits Marketing Et Relation Client", image: courseMarketing, oldPrice: "75.000 CFA", price: "7.500 CFA", category: "Kits", description: "Pack de 3 kits marketing pour gérer votre relation client, vos campagnes et votre stratégie commerciale." },
  { id: "rh", title: "4 Kits Ressources Humaines Et Management", image: courseRh, oldPrice: "75.000 CFA", price: "7.500 CFA", category: "Kits", description: "Pack complet de 4 kits pour la gestion des ressources humaines : recrutement, évaluation, formation et gestion administrative." },
  { id: "logistique", title: "4 Kits Transport, Logistiques Et Outils De Gestion", image: courseLogistique, oldPrice: "75.000 CFA", price: "7.500 CFA", category: "Kits", description: "Pack de 4 kits professionnels pour la gestion du transport, de la logistique et des opérations." },
  { id: "gestion", title: "5 Kits Gestion Et Administration", image: courseGestion, oldPrice: "75.000 CFA", price: "7.500 CFA", category: "Kits", description: "Pack de 5 kits pour la gestion administrative complète de votre entreprise." },
  { id: "chien", title: "Apprenez À Dresser Efficacement Votre Chien", image: courseChien, oldPrice: "30.000 CFA", price: "5.000 CFA", category: "Formations", description: "Formation complète sur le dressage canin. Techniques positives pour éduquer votre chien efficacement et renforcer votre lien." },
];

// Featured products for homepage (top ranked)
export const featuredProductIds = ["anglais", "ai", "smma", "ecommerce", "affiliation", "blog", "youtube", "livres"];

export const categories: Category[] = ["Tous", "Business", "Formations", "Kits", "Livres", "Logiciels", "Packs Enfants"];

export const getProductById = (id: string) => allProducts.find(p => p.id === id);
export const getFeaturedProducts = () => allProducts.filter(p => featuredProductIds.includes(p.id));
export const getSimilarProducts = (currentId: string, count = 4) =>
  allProducts.filter(p => p.id !== currentId).slice(0, count);
