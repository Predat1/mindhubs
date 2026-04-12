import courseAnglais from "@/assets/course-anglais.jpg";
import kitAgriculture from "@/assets/kit-agriculture.png";
import kitFiscalite from "@/assets/kit-fiscalite.png";
import progicielBudget from "@/assets/progiciel-budget.png";
import kitLogistique from "@/assets/kit-logistique.png";

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
  {
    id: "kit-agriculture",
    title: "Kit Agriculture & Élevage – Pack Agropastoral",
    image: kitAgriculture,
    oldPrice: "50.000 CFA",
    price: "7.500 CFA",
    category: "Kits",
    rating: 4.7,
    description: "**PACK AGROPASTORAL**\n\nEbooks + Vidéos + Business Plans + Guides Techniques + Recettes + Formation Complète\n\n+ de 250 RESSOURCES documents et 56 vidéos\n\n**EN QUOI CONSISTE CE PACK :**\n\nVous rêvez de lancer une activité agricole rentable ? Vous voulez transformer vos connaissances en profits ? Vous cherchez des modèles prêts à utiliser pour obtenir un financement ? Ou vous souhaitez simplement apprendre l'agriculture et l'élevage de manière moderne et structurée ?\n\nLe PACK AGROPASTORAL est exactement ce qu'il vous faut.\n\nIl s'agit d'une compilation unique en Afrique, réunissant :\n- des business plans professionnels (34 modèles prêts à l'emploi)\n- des ebooks agricoles premium\n- des guides techniques complets\n- des formations vidéo pratiques filmées sur le terrain\n- des modules sur la nutrition, la transformation, l'économie agricole\n- des fiches techniques\n- des outils professionnels pour monter une ferme moderne\n\n**MODULE 1 — BUSINESS PLANS (34 DOCUMENTS COMPLETS)**\n\nPoulets de Chair, Pondeuses, Embouche Ovine, Embouche Porcine, Pisciculture hors sol, Riziculture, Production d'attiéké, Cultures maraîchères, Projet Ferme Intégrée, et bien plus.\n\n**MODULE 2 — ÉCONOMIE AGRICOLE (4 DOCUMENTS STRATÉGIQUES)**\n\nCréation de coopérative, Marketing agricole, Exportation bio, Finance rurale.\n\n**MODULE 3 — GESTION DU SOL, DE L'EAU & ENVIRONNEMENT (6 GUIDES)**\n\nCompost, collecte d'eau, fertilité durable, lutte contre l'érosion.\n\n**MODULE 4 — RECETTES & ALIMENTATION SAINE (14 EBOOKS)**\n\n35 recettes healthy, plans detox, alimentation anti-inflammatoire, 80 recettes de cuisine.\n\n**MODULE 5 — PRODUCTION ANIMALE (39 EBOOKS + VIDÉOS)**\n\nPoulets, porcs, pintades, poissons, escargots, lapins, cailles, abeilles, bovins et plus.\n\n**MODULE 6 — PRODUCTION VÉGÉTALE (51 EBOOKS + 56 VIDÉOS)**\n\nPastèque, maïs, chou, banane plantain, champignons, tomate, piment, concombre, pommes de terre, fraise, agrumes et plus.\n\n**MODULE 7 — TRAITEMENT ALIMENTAIRE (8 DOCUMENTS)**\n\nConservation des fruits & légumes, poisson, viande, fabrication d'aliments de sevrage, stockage professionnel.\n\n**À QUI EST DESTINÉ CE PACK ?**\n\nDébutants, exploitants agricoles, agripreneurs, porteurs de projets, formateurs, coopératives, ONG, étudiants en agronomie, investisseurs agro-business.",
    paymentLink: "https://nhvjjgbn.mychariow.shop/prd_d5lkj6/checkout",
  },
  {
    id: "kit-fiscalite",
    title: "Kit Fiscalité – Expert Comptabilité & Gestion Fiscale",
    image: kitFiscalite,
    oldPrice: "50.000 CFA",
    price: "7.500 CFA",
    category: "Kits",
    rating: 4.6,
    description: "**KIT FISCALITÉ : DEVENEZ UN EXPERT EN COMPTABILITÉ ET GESTION FISCALE !**\n\nLa solution complète pour maîtriser la fiscalité et la comptabilité d'entreprise.\n\nQue vous soyez fiscaliste, comptable, chef d'entreprise, consultant, ou responsable administratif, le Kit Fiscalité a été conçu pour vous offrir tous les outils essentiels afin de gérer, analyser et optimiser efficacement la fiscalité et la comptabilité d'une entreprise.\n\n**LES AVANTAGES CLÉS**\n\n- Gagnez un temps considérable grâce à des outils prêts à l'emploi\n- Renforcez votre expertise fiscale et comptable\n- Sécurisez vos déclarations et états financiers\n- Accompagnez efficacement vos clients ou votre entreprise\n- Réduisez les risques d'erreurs fiscales et comptables\n\n**CE QUE CONTIENT LE KIT**\n\n**Formations Vidéo Complètes**\nVidéos pédagogiques claires, cas pratiques et démonstrations concrètes.\n\n**Documents et Modèles Professionnels Modifiables**\nContrats, lettres, modèles de déclarations fiscales, fichiers Excel et Word personnalisables.\n\n**Supports de Cours Structurés**\nPrésentations PowerPoint, fiches pratiques et guides détaillés.\n\n**Livres Numériques (Ebooks) de Référence**\nBibliothèque complète dédiée à la fiscalité et à la comptabilité.\n\n**Logiciel FRP – États Comptables et Fiscaux**\nGénération automatisée de rapports comptables et fiscaux.\n\n**Liasse Fiscale SYSCOHADA Révisée – DGI**\nPréparation et génération des liasses fiscales selon les normes SYSCOHADA.\n\n**Bonus Exclusif : Pack États Financiers**\nBilans comptables, comptes de résultat, annexes et documents financiers essentiels.\n\n**POURQUOI CHOISIR CE KIT ?**\n\nAccès immédiat après achat, contenu 100% pratique, outils professionnels utilisés dans le monde réel, mises à jour régulières. Convient aux professionnels, entrepreneurs et étudiants.",
    paymentLink: "https://nhvjjgbn.mychariow.shop/prd_gnidyo/checkout",
  },
];

export const featuredProductIds = ["anglais", "kit-agriculture", "kit-fiscalite"];

export const categories: Category[] = ["Tous", "Business", "Formations", "Kits", "Livres", "Logiciels", "Packs Enfants"];

export const getProductById = (id: string) => allProducts.find(p => p.id === id);
export const getFeaturedProducts = () => allProducts.filter(p => featuredProductIds.includes(p.id));
export const getSimilarProducts = (currentId: string, count = 4) =>
  allProducts.filter(p => p.id !== currentId).slice(0, count);
