

# Générateur de Créatives Publicitaires IA pour Vendeurs

## Objectif

Ajouter un outil "Studio Pub Facebook" qui permet aux vendeurs de générer automatiquement des **créatives publicitaires images** optimisées conversion, accompagnées de **textes publicitaires** (primary text, headlines, descriptions) et de **recommandations de ciblage Facebook Ads**, à partir de n'importe quel produit publié de leur catalogue.

## Parcours utilisateur

```text
1. Vendeur publie un produit
   └─> Toast/CTA "🚀 Créer une pub Facebook" apparaît après publication

2. Page "Studio Pub" (/dashboard/ads-studio)
   ├─ Sélection produit (dropdown du catalogue vendeur)
   ├─ Choix angles marketing (multi-select : Bénéfice, Urgence, 
   │  Preuve sociale, Avant/Après, Storytelling, Problème/Solution)
   ├─ Choix formats (multi-select : Carré 1:1 feed, Story 9:16, 
   │  Paysage 16:9, Portrait 4:5)
   └─ Bouton "Générer mon kit publicitaire complet"

3. Résultats (kit complet par angle)
   ├─ Créatives images (1 par format × angle sélectionné)
   ├─ Textes pubs : Primary text, 5 Headlines, 3 Descriptions
   ├─ Lien produit (deeplink /produit/:id, copiable)
   ├─ Ciblage recommandé : âge, genre, intérêts FB, comportements, 
   │  pays africains francophones cibles
   └─ Actions : Télécharger image, Copier texte, Copier ciblage,
      Régénérer une variante
```

## Fonctionnalités clés

### A. Génération de créatives images
- Pour chaque combinaison **angle × format**, génère une image publicitaire avec :
  - Image produit en avant
  - Texte d'accroche court intégré (overlay)
  - Couleurs Black & Gold de la marque
  - Composition optimisée par format (Story = vertical, etc.)
- Modèle : `google/gemini-3-pro-image-preview` (qualité supérieure pour pubs)
- Edit mode : utilise l'image produit existante comme base

### B. Génération du copywriting
- Modèle : `google/gemini-3-flash-preview`
- Prompt analyse le produit (titre, description, prix, catégorie, key_features)
- Sortie structurée (tool calling) :
  - 1 Primary text (≤125 caractères, scroll-stopper)
  - 5 Headlines courtes (≤40 caractères)
  - 3 Descriptions (≤30 caractères)
  - 1 CTA recommandé (Acheter, En savoir plus, Inscription...)

### C. Recommandations de ciblage Facebook Ads
- Sortie structurée :
  - Tranche d'âge (ex: 25-45)
  - Genre (Hommes / Femmes / Tous)
  - Localisation (pays africains francophones suggérés selon catégorie)
  - Centres d'intérêt FB (5-8 intérêts pertinents)
  - Comportements (acheteurs en ligne, mobile, etc.)
  - Budget journalier suggéré (low / mid / high)
  - Type de campagne FB recommandé (Conversions, Trafic, Engagement)

### D. Persistance et historique
- Table `ad_creatives` : sauvegarde chaque kit généré (rejouable, partageable)
- Le vendeur retrouve ses kits passés dans la page Studio Pub

## Implémentation technique

### 1. Base de données (migration)
Nouvelle table `public.ad_creatives` :
- `id`, `vendor_id`, `product_id`, `angle`, `format`
- `image_url` (stockée dans bucket `product-images/ads/`)
- `copy_data` jsonb (primary_text, headlines, descriptions, cta)
- `targeting_data` jsonb (âge, genre, intérêts, etc.)
- `created_at`
- RLS : vendeur lit/écrit uniquement ses propres créatives

### 2. Edge functions (3 nouvelles)
| Function | Modèle | Rôle |
|---|---|---|
| `generate-ad-creative` | gemini-3-pro-image-preview | Génère 1 image pub (angle + format) |
| `generate-ad-copy` | gemini-3-flash-preview + tool calling | Génère textes pubs structurés |
| `generate-ad-targeting` | gemini-3-flash-preview + tool calling | Génère ciblage FB structuré |

Chaque function : CORS, validation Zod, gestion 429/402, stockage image dans bucket Supabase pour `generate-ad-creative`.

### 3. Pages et composants
- `src/pages/VendorAdsStudio.tsx` — page principale, intégrée dans le sidebar
- `src/components/ads/AdKitCard.tsx` — affichage d'un kit (image + textes + ciblage)
- `src/components/ads/AdCreativeGenerator.tsx` — formulaire de génération
- `src/components/ads/PostPublishAdPrompt.tsx` — modal "Créer une pub" après publication produit
- `src/hooks/useAdCreatives.ts` — fetch/sauvegarde des kits

### 4. Intégrations existantes
- Hook into `VendorProductForm.tsx` après `handleSave({status:"published"})` → toast avec CTA "🚀 Créer une publicité"
- Ajout de l'item "Studio Pub" dans `DashboardLayout.tsx` sidebar (icône `Megaphone` ou `Sparkles`, badge "Nouveau ✨")
- Route `/dashboard/ads-studio` dans `App.tsx`

## Design (cohérent Black & Gold)

- Hero avec gradient gold + halo "aurora"
- Cards `.card-premium` pour chaque kit généré
- Badges colorés par angle (Bénéfice = vert, Urgence = rouge, etc.)
- Aperçu image avec ratio exact selon format (mockup Facebook feed/story)
- Boutons "Copier" avec feedback toast
- Loading states avec skeleton + animation gold pulse pendant génération

## Livraison

| Étape | Contenu |
|---|---|
| 1. Migration DB | Table `ad_creatives` + RLS + storage path |
| 2. Edge functions | `generate-ad-creative`, `generate-ad-copy`, `generate-ad-targeting` |
| 3. Hooks | `useAdCreatives` (CRUD + génération) |
| 4. Page Studio Pub | Formulaire + résultats + historique |
| 5. Sidebar + route | Entrée "Studio Pub" avec badge Nouveau |
| 6. Hook post-publication | Modal/toast CTA après publication produit |

