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
  {
    id: "anglais",
    title: "Apprendre Et Parler L'Anglais En 365 Jours",
    image: courseAnglais,
    oldPrice: "60.000 CFA",
    price: "5.000 CFA",
    category: "Formations",
    rating: 4.5,
    description: "Pack Formation : Apprendre & Parler l'Anglais en 365 Jours\n\nDéveloppez votre niveau d'anglais pas à pas, de débutant à avancé, grâce à un programme complet, moderne et facile à suivre. Ce pack a été conçu pour vous aider à parler, écrire, lire et comprendre l'anglais de A à Z, même si vous partez de zéro.\n\n**Pourquoi cette formation est faite pour vous ?**\n\nAujourd'hui, l'anglais est indispensable : voyages, études, opportunités professionnelles, business en ligne, immigration, concours, examens internationaux…\nAvec cette formation, vous disposez de tout le contenu nécessaire pour devenir bilingue, sans stress et à votre rythme.\n\n**Contenu complet du pack**\n\n1. 50 Modules progressifs et faciles à comprendre\n2. 300 Vidéos explicatives\n3. 400 Audios pour améliorer votre prononciation\n4. 250 fichiers PDF téléchargeables\n5. Pack IELTS complet\n6. Pack TOEFL & TOEIC\n\n**Une formation adaptée aux réalités africaines**\n\nExplications simples et accessibles\nContenu téléchargeable (idéal pour les connexions limitées)\nApprentissage flexible : à votre rythme, depuis votre téléphone ou votre ordinateur\nSupport clair et compréhensible pour tous les niveaux\n\n**Résultats que vous pouvez atteindre**\n\nTenir une conversation fluide en anglais\nLire et comprendre des textes, documents et vidéos\nÉcrire correctement en anglais\nRéussir le TOEFL, TOEIC ou IELTS\nAméliorer vos opportunités professionnelles et académiques\n\n**Bonus inclus**\n\nProgramme structuré sur 365 jours\nConseils pour booster votre mémoire\nAccès permanent aux fichiers (téléchargement illimité)",
    paymentLink: "https://nhvjjgbn.mychariow.shop/prd_k42o8e/checkout",
  },
];

export const featuredProductIds = ["anglais"];

export const categories: Category[] = ["Tous", "Business", "Formations", "Kits", "Livres", "Logiciels", "Packs Enfants"];

export const getProductById = (id: string) => allProducts.find(p => p.id === id);
export const getFeaturedProducts = () => allProducts.filter(p => featuredProductIds.includes(p.id));
export const getSimilarProducts = (currentId: string, count = 4) =>
  allProducts.filter(p => p.id !== currentId).slice(0, count);
