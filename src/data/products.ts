import courseAnglais from "@/assets/course-anglais.jpg";
import kitAgriculture from "@/assets/kit-agriculture.png";
import kitFiscalite from "@/assets/kit-fiscalite.png";
import progicielBudget from "@/assets/progiciel-budget.png";
import kitLogistique from "@/assets/kit-logistique.png";
import premiersClients from "@/assets/premiers-clients.png";
import demarreMaintenantImg from "@/assets/demarre-maintenant.png";

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
  imageUrls?: string[];
  keyFeatures?: string[];
  vendorId?: string;
  product_type?: "file" | "course" | "service" | "coaching";
  video_url?: string;
}

export const allProducts: Product[] = [
  {
    id: "anglais",
    title: "Apprendre Et Parler L'Anglais En 365 Jours",
    image: courseAnglais,
    oldPrice: "60.000 FCFA",
    price: "5.000 FCFA",
    category: "Formations",
    rating: 4.5,
    description: "Pack Formation : Apprendre & Parler l'Anglais en 365 Jours\n\nDéveloppez votre niveau d'anglais pas à pas, de débutant à avancé, grâce à un programme complet, moderne et facile à suivre. Ce pack a été conçu pour vous aider à parler, écrire, lire et comprendre l'anglais de A à Z, même si vous partez de zéro.\n\n**Pourquoi cette formation est faite pour vous ?**\n\nAujourd'hui, l'anglais est indispensable : voyages, études, opportunités professionnelles, business en ligne, immigration, concours, examens internationaux…\nAvec cette formation, vous disposez de tout le contenu nécessaire pour devenir bilingue, sans stress et à votre rythme.\n\n**Contenu complet du pack**\n\n1. 50 Modules progressifs et faciles à comprendre\n2. 300 Vidéos explicatives\n3. 400 Audios pour améliorer votre prononciation\n4. 250 fichiers PDF téléchargeables\n5. Pack IELTS complet\n6. Pack TOEFL & TOEIC\n\n**Une formation adaptée aux réalités africaines**\n\nExplications simples et accessibles\nContenu téléchargeable (idéal pour les connexions limitées)\nApprentissage flexible : à votre rythme, depuis votre téléphone ou votre ordinateur\nSupport clair et compréhensible pour tous les niveaux\n\n**Résultats que vous pouvez atteindre**\n\nTenir une conversation fluide en anglais\nLire et comprendre des textes, documents et vidéos\nÉcrire correctement en anglais\nRéussir le TOEFL, TOEIC ou IELTS\nAméliorer vos opportunités professionnelles et académiques\n\n**Bonus inclus**\n\nProgramme structuré sur 365 jours\nConseils pour booster votre mémoire\nAccès permanent aux fichiers (téléchargement illimité)",
    paymentLink: "https://nhvjjgbn.mychariow.shop/prd_k42o8e/checkout",
    product_type: "course",
  },
  {
    id: "kit-agriculture",
    title: "Kit Agriculture & Élevage – Pack Agropastoral",
    image: kitAgriculture,
    oldPrice: "50.000 FCFA",
    price: "7.500 FCFA",
    category: "Kits",
    rating: 4.7,
    description: "**PACK AGROPASTORAL**\n\nEbooks + Vidéos + Business Plans + Guides Techniques + Recettes + Formation Complète\n\n+ de 250 RESSOURCES documents et 56 vidéos\n\n**EN QUOI CONSISTE CE PACK :**\n\nVous rêvez de lancer une activité agricole rentable ? Vous voulez transformer vos connaissances en profits ? Vous cherchez des modèles prêts à utiliser pour obtenir un financement ? Ou vous souhaitez simplement apprendre l'agriculture et l'élevage de manière moderne et structurée ?\n\nLe PACK AGROPASTORAL est exactement ce qu'il vous faut.\n\nIl s'agit d'une compilation unique en Afrique, réunissant :\n- des business plans professionnels (34 modèles prêts à l'emploi)\n- des ebooks agricoles premium\n- des guides techniques complets\n- des formations vidéo pratiques filmées sur le terrain\n- des modules sur la nutrition, la transformation, l'économie agricole\n- des fiches techniques\n- des outils professionnels pour monter une ferme moderne\n\n**MODULE 1 — BUSINESS PLANS (34 DOCUMENTS COMPLETS)**\n\nPoulets de Chair, Pondeuses, Embouche Ovine, Embouche Porcine, Pisciculture hors sol, Riziculture, Production d'attiéké, Cultures maraîchères, Projet Ferme Intégrée, et bien plus.\n\n**MODULE 2 — ÉCONOMIE AGRICOLE (4 DOCUMENTS STRATÉGIQUES)**\n\nCréation de coopérative, Marketing agricole, Exportation bio, Finance rurale.\n\n**MODULE 3 — GESTION DU SOL, DE L'EAU & ENVIRONNEMENT (6 GUIDES)**\n\nCompost, collecte d'eau, fertilité durable, lutte contre l'érosion.\n\n**MODULE 4 — RECETTES & ALIMENTATION SAINE (14 EBOOKS)**\n\n35 recettes healthy, plans detox, alimentation anti-inflammatoire, 80 recettes de cuisine.\n\n**MODULE 5 — PRODUCTION ANIMALE (39 EBOOKS + VIDÉOS)**\n\nPoulets, porcs, pintades, poissons, escargots, lapins, cailles, abeilles, bovins et plus.\n\n**MODULE 6 — PRODUCTION VÉGÉTALE (51 EBOOKS + 56 VIDÉOS)**\n\nPastèque, maïs, chou, banane plantain, champignons, tomate, piment, concombre, pommes de terre, fraise, agrumes et plus.\n\n**MODULE 7 — TRAITEMENT ALIMENTAIRE (8 DOCUMENTS)**\n\nConservation des fruits & légumes, poisson, viande, fabrication d'aliments de sevrage, stockage professionnel.\n\n**À QUI EST DESTINÉ CE PACK ?**\n\nDébutants, exploitants agricoles, agripreneurs, porteurs de projets, formateurs, coopératives, ONG, étudiants en agronomie, investisseurs agro-business.",
    paymentLink: "https://nhvjjgbn.mychariow.shop/prd_d5lkj6/checkout",
  },
  {
    id: "kit-fiscalite",
    title: "Kit Fiscalité – Expert Comptabilité & Gestion Fiscale",
    image: kitFiscalite,
    oldPrice: "50.000 FCFA",
    price: "7.500 FCFA",
    category: "Kits",
    rating: 4.6,
    description: "**KIT FISCALITÉ : DEVENEZ UN EXPERT EN COMPTABILITÉ ET GESTION FISCALE !**\n\nLa solution complète pour maîtriser la fiscalité et la comptabilité d'entreprise.\n\nQue vous soyez fiscaliste, comptable, chef d'entreprise, consultant, ou responsable administratif, le Kit Fiscalité a été conçu pour vous offrir tous les outils essentiels afin de gérer, analyser et optimiser efficacement la fiscalité et la comptabilité d'une entreprise.\n\n**LES AVANTAGES CLÉS**\n\n- Gagnez un temps considérable grâce à des outils prêts à l'emploi\n- Renforcez votre expertise fiscale et comptable\n- Sécurisez vos déclarations et états financiers\n- Accompagnez efficacement vos clients ou votre entreprise\n- Réduisez les risques d'erreurs fiscales et comptables\n\n**CE QUE CONTIENT LE KIT**\n\n**Formations Vidéo Complètes**\nVidéos pédagogiques claires, cas pratiques et démonstrations concrètes.\n\n**Documents et Modèles Professionnels Modifiables**\nContrats, lettres, modèles de déclarations fiscales, fichiers Excel et Word personnalisables.\n\n**Supports de Cours Structurés**\nPrésentations PowerPoint, fiches pratiques et guides détaillés.\n\n**Livres Numériques (Ebooks) de Référence**\nBibliothèque complète dédiée à la fiscalité et à la comptabilité.\n\n**Logiciel FRP – États Comptables et Fiscaux**\nGénération automatisée de rapports comptables et fiscaux.\n\n**Liasse Fiscale SYSCOHADA Révisée – DGI**\nPréparation et génération des liasses fiscales selon les normes SYSCOHADA.\n\n**Bonus Exclusif : Pack États Financiers**\nBilans comptables, comptes de résultat, annexes et documents financiers essentiels.\n\n**POURQUOI CHOISIR CE KIT ?**\n\nAccès immédiat après achat, contenu 100% pratique, outils professionnels utilisés dans le monde réel, mises à jour régulières. Convient aux professionnels, entrepreneurs et étudiants.",
    paymentLink: "https://nhvjjgbn.mychariow.shop/prd_gnidyo/checkout",
  },
  {
    id: "progiciel-budget",
    title: "Progiciel de Gestion de Budget",
    image: progicielBudget,
    oldPrice: "30.000 FCFA",
    price: "5.000 FCFA",
    category: "Logiciels",
    rating: 4.8,
    description: "**Progiciel Gestion De Budget – Votre Argent, Mieux Organisé, Jour Après Jour**\n\nDécouvrez l'application de gestion de budget la plus complète, moderne et intuitive, conçue spécialement pour vous aider à reprendre le contrôle total de vos finances personnelles.\nAvec une interface claire, rapide et facile à utiliser, ce progiciel vous accompagne au quotidien pour gérer vos revenus, maîtriser vos dépenses et planifier votre avenir financier.\n\n**1. Gérez vos revenus en toute simplicité**\n\nEnregistrez tous vos types de revenus :\n- Salaire\n- Revenus commerciaux\n- Revenus d'investissements\n- Revenus secondaires\n- Primes, bonus, cashback\n- Et bien plus encore…\n\nChaque entrée est enregistrée avec une précision totale, associée à une méthode de paiement, une catégorie et une date. Votre tableau de bord vous affiche en un coup d'œil le total de vos revenus du mois.\n\n**2. Suivez vos dépenses et maîtrisez votre argent**\n\nL'application vous aide à suivre TOUTES vos dépenses grâce à des catégories parfaitement organisées :\n- Besoins vitaux (nourriture, transport, logement, santé…)\n- Loisirs & divertissements\n- Épargnes et tontines\n- Business et investissements\n- Famille & enfants\n- Transfert d'argent\n- Frais scolaires\n- Dépenses personnelles\n- Et toutes les catégories dont vous avez besoin…\n\nChaque dépense inclut sa méthode de paiement, sa catégorie et ses détails.\nVous savez exactement où va votre argent, et comment optimiser vos finances.\n\n**3. Planification intelligente des dépenses**\n\nPlanifiez vos dépenses récurrentes ou occasionnelles :\n- Règlement du loyer\n- Abonnements\n- Échéances scolaires\n- Cotisations\n- Factures\n- Paiements Momo / mobile money\n- Etc.\n\nL'application vous envoie automatiquement une notification 24h avant chaque dépense planifiée.\nVous ne manquez plus jamais une échéance.\n\n**4. Budget mensuel automatique + historique complet**\n\nChaque mois, votre budget repart à zéro automatiquement :\n- Revenus du mois\n- Dépenses du mois\n- Solde positif ou négatif\n- Statistiques détaillées\n- Méthodes de paiement utilisées\n\nUn menu Historique vous permet de retrouver tous vos mois passés, avec :\n- le total des revenus\n- le total des dépenses\n- votre solde\n- toutes les opérations du mois sélectionné\n\nVous pouvez enfin analyser clairement votre progression financière.\n\n**5. Gestion avancée des méthodes de paiement**\n\nL'utilisateur peut ajouter et gérer toutes ses méthodes de paiement :\n- Espèces\n- Mobile Money (MTN, Moov… avec numéro, opérateur, etc.)\n- Carte bancaire (banque + derniers chiffres)\n- Virement bancaire\n- Paiement en ligne\n- Et autres options personnalisées\n\nChaque revenu ou dépense doit être associé à une méthode de paiement.\nL'application s'adapte à votre réalité financière.\n\n**6. Système d'activation 100% sécurisé**\n\nAprès inscription :\n- L'utilisateur accède uniquement à son tableau de bord\n- Données personnelles sécurisées et chiffrées\n- Compte personnel et sécurisé\n- Compte activé pour 365 jours\n\nUn système professionnel comme dans les grandes applications SaaS.\n\n**7. Authentification professionnelle & meilleure sécurité**\n\n- Vérification email\n- Données totalement isolées et sécurisées\n- Optimisation de la vitesse et du chargement\n- Gestion moderne de session\n\nVotre application reste rapide et fluide même après des heures ou jours d'utilisation.\n\n**8. Interface moderne, responsive et facile à utiliser**\n\nConçue pour tous types d'utilisateurs :\n- Entrepreneurs\n- Familles\n- Étudiants\n- Employés\n- Traders\n- Toute personne souhaitant maîtriser ses finances\n\nL'application fonctionne parfaitement sur : Smartphone, Tablette, Ordinateur, iPhone / Android.\nVous accédez à votre budget partout, 24/7.\n\n**Pourquoi choisir ce Progiciel ?**\n\n- Simple à utiliser\n- Ultra complet\n- Sécurisé\n- Compatible mobile\n- Automatisé\n- Adapté au quotidien en Afrique\n- Parfait pour gérer toutes vos dépenses et vos revenus\n- Idéal pour ceux qui veulent reprendre le contrôle de leurs finances\n\n**Commencez dès aujourd'hui**\n\nDès votre achat, vous recevez :\n- Votre accès immédiat à la plateforme\n- Votre tableau de bord personnalisé\n- Vos outils de gestion financière\n- Votre historique et vos alertes activés\n\nPrenez en main votre vie financière et commencez à gérer votre argent comme un professionnel.",
    paymentLink: "https://nhvjjgbn.mychariow.shop/prd_0n68hs/checkout",
  },
  {
    id: "kit-logistique",
    title: "4 Kits Transport, Logistiques et Outils de Gestion",
    image: kitLogistique,
    oldPrice: "50.000 FCFA",
    price: "7.500 FCFA",
    category: "Kits",
    rating: 4.7,
    description: "**4 KITS LOGISTIQUE ET OUTILS DE GESTION**\n\n4 Kits Logistiques & Outils de Gestion Essentiels est une collection d'outils essentiels pour les professionnels de la logistique, du transport et de la gestion de projet. Ce pack contient des fichiers Word et Excel, tous modifiables et personnalisables selon les besoins spécifiques de chaque utilisateur, ainsi que des documents PDF pour approfondir les connaissances en gestion logistique et management.\n\n**Contenu détaillé :**\n\n**WORD**\nLes fichiers Word incluent des modèles pour faciliter la communication et la gestion opérationnelle : lettres d'acceptation, accusés de réception, avis d'annulation, de notification, de réception, de rejet, de renvoi, de déclaration ; bons de réception et de confirmation ; demandes ; rejets partiels ; lettres de renonciation ; contrats ; conventions ; présentations d'excuses, etc.\n\n**EXCEL**\nLes outils Excel fournissent des solutions pour gérer et suivre les opérations logistiques : logiciels de gestion ; applications de gestion et de suivi ; budgets ; générateurs ; gestion de stock ; gestionnaires ; plannings ; modèles ; registres ; réservations ; tableaux de bord ; planificateurs ; macro de lettrage MYRMIDON, etc.\n\n**PDF**\nEn format PDF, le pack propose des ressources variées : cours, gestion de stocks, outils, guides, logistique, management, négociation, etc.\n\n**1. Kit Transport et Logistique Complet**\n\nModules principaux :\n- Documents Numériques\n- Logiciel Complet de Gestion de Stocks\n- Outils de Gestion de Stocks\n- Progiciels de Gestion de Stocks\n- Projet MYRMIDON LETTRAGE\n\nSections supplémentaires :\n- Achats et Approvisionnement\n- Acquisition, Location et Vente d'Équipement\n- Logistique – Documents Numériques\n- Ventes et Expéditions de Marchandises\n\n**2. Kit GTL pour les Professionnels**\n\nModules principaux :\n- Documents et Cours en Logistique\n- Logiciel de Suivi des Stocks\n- Outils et Applications pour Gestion de la Chaîne d'Approvisionnement\n- Fiches Techniques pour le Transport et la Logistique\n- Support de Planification Logistique\n\n**3. Kit 60 Applications Excel Indispensables de Gestion**\n\n- absences-et-heures-supp\n- Budget réalisé – exemple\n- Bulletin de Paie complet projet\n- Croisements\n- Entretien véhicules\n- État des résultats prévisionnel mensuel\n- État des résultats prévisionnel trimestriel\n- État mensuel de compte de créances\n- Facture de vente\n- Facture pro forma\n- Feuille de trésorerie journalière\n- Fichier REMPLI vente budget\n- Gestion d'hôtel\n- Gestion de caisse\n- Gestion des associations\n- Gestion des bars\n- Gestion des loyers\n- Gestion des restaurants\n- Gestion et suivi carburant kilométrage\n- Gestion des dépenses\n- Gestion heures travail\n- Grille d'amortissement\n- Grille d'analyse de rentabilité du magasin de l'entreprise\n- Inventaire bar\n- Liasse fiscale Sys Normal SYSCOHADA révisé DGI-BF\n- Location costumes vierge\n- Logiciel 2 états financiers\n- Logiciel de facturation\n- Logiciel de gestion des stocks\n- Logiciel de montage de plan financier sur 5 ans\n- Logiciel de paie Excel\n- modèle-excel-agence-immobilière\n- Notes scolaires\n\nProgiciels et Outils :\n- PLAN COMPTABLE – Syscohada révisé\n- Plan de financement\n- Planning_interventions_machines\n- Progiciel – COMPTABILITÉ ASSOCIATION\n- Progiciel – ANALYSE FINANCIÈRE\n- Progiciel – COMPTABILITÉ BUDGET domestique\n- Progiciel – BUDGET PRÉVISIONNEL\n- Progiciel – BUDGET RÉALISÉ exemple\n- Progiciel – COMPTABILITÉ GÉNÉRALE\n- Progiciel – diagramme de Gantt pour la gestion de projets\n- Progiciel – GESTION DE STOCK\n- Progiciel – GESTION DE STOCK PRO\n- Progiciel – gestion anniversaire\n- Progiciel – GESTIONNAIRE DU BUDGET\n- Progiciel – GESTION DES RH\n- Projections financières 3 ans\n- Projections financières 12 mois\n- Rapport des dépenses annuelles vendeurs\n- Rapprochement bancaire au format Excel\n- Restaurant – Création d'affiches de menus\n- simulateur_amort_dégressif\n- Suivi horaires\n- Suivi projets\n\n**4. Kit Gestion Suivi-Évaluation de Projet**\n\n- Budget de projet\n- Diagramme de Gantt Agile\n- Fiche de réflexion idées\n- Gestion de projet – Modèle rempli\n- Gestion Portefeuille Projets – Modèle rempli\n- Liste des tâches\n- Logiciel de montage de plan financier sur 3 et 5 ans\n- Modèle de diagramme de Gantt pour les projets\n- Modèle de gestion de projet – Vierge\n- Modèle de suivi de projet\n- Planificateur de projet\n- Présentation d'un plan de développement\n- Présentation de projet scientifique\n\nSupports numériques :\n- 49 idées de business lancer depuis chez soi\n- Apprentissage par projet\n- Concevoir et lancer un projet\n- Corpus des connaissances en management de projet\n- Gestion de projet par étapes – Analyse des besoins\n- Gestion des risques\n- Guide pratique pour étudier la faisabilité de projet\n- Le kit du chef de projet",
    paymentLink: "https://nhvjjgbn.mychariow.shop/prd_c91xnz/checkout",
  },
  {
    id: "premiers-clients",
    title: "PREMIERS CLIENTS SANS BUDGET",
    image: premiersClients,
    oldPrice: "15.000 FCFA",
    price: "5.000 FCFA",
    category: "Business",
    rating: 4.8,
    description: "Tu n'as jamais eu de client en ligne ? Découvre comment trouver tes 10 premiers clients en moins de 30 jours sans dépenser un centime et uniquement avec ton téléphone grâce au guide PREMIERS CLIENTS SANS BUDGET.\n\nBeaucoup postent sans jamais vendre, regardent des vidéos sans résultats, et veulent gagner de l'argent en ligne sans savoir par où commencer. Le résultat ? 0 client, 0 revenu, frustration totale.\n\nAvec ce guide simple, réaliste et spécialement conçu pour l'Afrique, tu vas apprendre à :\n\n- Trouver tes premiers clients même en partant de zéro\n- Utiliser WhatsApp comme une machine à vendre\n- Communiquer efficacement avec tes prospects pour les convaincre\n- Vendre sans avoir besoin d'être un expert\n\n**Ce que tu obtiens avec PREMIERS CLIENTS SANS BUDGET :**\n\n**📘 Guide principal**\n\n- Stratégies pour attirer et convertir des clients sans budget\n- Techniques pour exploiter WhatsApp et générer des ventes\n- Conseils pour transformer tes échanges en revenus\n\n**📩 Bonus 1 – Scripts WhatsApp**\n\nDes messages prêts à envoyer pour :\n- Contacter tes prospects efficacement\n- Relancer sans être insistant\n- Convertir tes contacts en clients\n\nTu copies, tu envoies, tu encaisses.\n\n**📅 Bonus 2 – Plan d'action 30 jours**\n\nUn programme précis pour :\n- Jour 1 à 7 : Trouver tes premiers prospects\n- Jour 8 à 15 : Générer des conversations qualitatives\n- Jour 16 à 30 : Convertir ces prospects en clients fidèles\n\nTu sais exactement quoi faire chaque jour.\n\n**🎯 Bonus 3 – Méthode Groupes & Réseaux**\n\n- Identifier des clients dans les groupes Facebook\n- Attirer des prospects sans dépenser en publicité\n- Transformer des inconnus en acheteurs\n\n**Pour qui est conçu le guide PREMIERS CLIENTS SANS BUDGET ?**\n\n- Toi qui es en Afrique et veux gagner de l'argent en ligne\n- Sans budget à investir\n- Sans expérience préalable\n- Avec seulement un téléphone en main\n\n**Ce guide n'est pas pour toi si :**\n\n- Tu veux devenir riche sans effort\n- Tu refuses de contacter tes prospects\n- Tu n'es pas prêt à passer à l'action\n\nDes jeunes comme toi ont déjà utilisé PREMIERS CLIENTS SANS BUDGET pour :\n\n- Trouver leurs premiers clients rapidement\n- Gagner leurs premiers 10 000 / 50 000 / 100 000 FCFA\n- Lancer leur activité en ligne sans investir d'argent\n\nCe n'est pas une théorie, c'est une méthode pratique qui marche sur le terrain.\n\nLe véritable problème, ce n'est pas ton téléphone. C'est de ne pas encore disposer de la bonne méthode.\n\nAvec PREMIERS CLIENTS SANS BUDGET, tu as maintenant la solution pour démarrer.",
    paymentLink: "https://nhvjjgbn.mychariow.shop/prd_64t1hp/checkout",
  },
  {
    id: "demarre-maintenant",
    title: "Le plan exact pour lancer ton business en ligne en Afrique en 30 jours",
    image: demarreMaintenantImg,
    oldPrice: "15.000 FCFA",
    price: "5.000 FCFA",
    category: "Business",
    rating: 4.9,
    description: "**🔥 DÉMARRE MAINTENANT**\n\nLe plan exact pour lancer ton business en ligne en Afrique en 30 jours\n\nSans expérience. Sans capital. Depuis ton téléphone.\n\n❌ Tu regardes des vidéos business depuis des mois…\n❌ Tu lis des conseils partout…\n❌ Mais tu n'as toujours gagné aucun franc en ligne\n\nTu n'es pas le problème.\n\n👉 Le vrai problème, c'est que personne ne t'a donné une méthode claire, adaptée à ta réalité en Afrique.\n\n**💡 IMAGINE PLUTÔT :**\n\n- Savoir exactement quoi faire chaque jour\n- Lancer ton activité depuis ton téléphone\n- Faire ta première vente en ligne en moins de 30 jours\n\n**📘 Voici la solution :**\n\nDÉMARRE MAINTENANT – Un guide complet + plan d'action qui te montre étape par étape comment :\n\n- Trouver une idée rentable même sans expérience\n- Créer un produit ou service que les gens veulent vraiment\n- Vendre avec WhatsApp, Facebook et TikTok\n- Encaisser avec Mobile Money (MTN, Orange, Wave…)\n- Obtenir tes premiers clients sans publicité\n\n**🎯 CE QUE TU VAS APPRENDRE :**\n\n- Les 4 modèles de business qui marchent en Afrique\n- Comment créer une offre irrésistible\n- Le script exact pour vendre sur WhatsApp\n- Comment trouver tes premiers clients gratuitement\n- Le plan 7 jours pour lancer rapidement\n\n**🎁 BONUS INCLUS :**\n\n🔥 Scripts WhatsApp prêts à copier-coller\n🔥 Modèles de pages de vente\n🔥 Plan d'action 30 jours étape par étape\n\n**⚠️ Pourquoi ce prix ?**\n\nParce que le but n'est pas juste de vendre… c'est de t'aider à faire tes premiers revenus rapidement.\n\n**🚨 IMPORTANT :**\n\nCe guide n'est PAS pour tout le monde.\n\n❌ Si tu veux devenir riche sans rien faire\n❌ Si tu cherches encore \"la méthode magique\"\n\nPasse ton chemin.\n\n✅ Par contre, il est pour toi si :\n\n- Tu veux vraiment passer à l'action\n- Tu es prêt à travailler 30 minutes par jour\n- Tu veux changer ta situation financière\n\n🔥 Des centaines de jeunes africains commencent déjà.\n\nLa seule question : Est-ce que tu continues à regarder… ou tu passes enfin à l'action ?",
    paymentLink: "https://nhvjjgbn.mychariow.shop/prd_2354xd/checkout",
  },
];

export const featuredProductIds = ["anglais", "kit-agriculture", "kit-fiscalite", "progiciel-budget", "kit-logistique", "premiers-clients", "demarre-maintenant"];

export const categories: Category[] = ["Tous", "Business", "Formations", "Kits", "Livres", "Logiciels", "Packs Enfants"];

export const getProductById = (id: string) => allProducts.find(p => p.id === id);
export const getFeaturedProducts = () => allProducts.filter(p => featuredProductIds.includes(p.id));
export const getSimilarProducts = (currentId: string, count = 4) =>
  allProducts.filter(p => p.id !== currentId).slice(0, count);
