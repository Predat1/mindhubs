

# Plan : Témoignages dynamiques, popup plein écran et checkout simplifié

## 1. Témoignages dynamiques en base de données

Créer une table `testimonials` dans la base pour stocker les avis clients et les afficher dynamiquement dans la section "Ils nous ont fait confiance".

**Table SQL :**
- `id` (uuid, PK), `name` (text), `handle` (text), `avatar_initials` (text), `content` (text), `likes` (int), `retweets` (int), `replies` (int), `verified` (boolean), `created_at` (timestamptz)
- RLS : lecture publique (anon + authenticated), écriture admin uniquement
- Pré-remplir avec les 6 témoignages existants via INSERT

**Fichiers modifiés :**
- `src/components/TrustLogosSection.tsx` : fetch depuis la base via React Query au lieu du tableau hardcodé

---

## 2. Popup d'achat plein écran

Remplacer le petit popup actuel par une overlay plein écran immersive avec :
- Image du produit en grand
- Titre, prix barré + prix actuel, badge urgence
- 2 boutons larges : "Ajouter au panier" et "Acheter maintenant"
- Animation d'entrée (scale + fade)
- Bouton fermer (X) en haut à droite

**Fichier modifié :** `src/components/BuyPopup.tsx`

---

## 3. Réduire le parcours de paiement

Fusionner les 3 étapes du checkout en une seule page : le récapitulatif des produits + le formulaire d'informations + le bouton de confirmation, le tout visible sur un seul écran sans navigation entre étapes.

**Fichier modifié :** `src/pages/Checkout.tsx`

---

## Détails techniques

| Élément | Fichier | Action |
|---|---|---|
| Table `testimonials` | Migration SQL | Créer table + RLS + seed data |
| Fetch témoignages | `TrustLogosSection.tsx` | React Query + supabase client |
| Hook témoignages | `src/hooks/useTestimonials.ts` | Nouveau hook React Query |
| Popup plein écran | `BuyPopup.tsx` | Redesign complet fullscreen |
| Checkout 1 page | `Checkout.tsx` | Fusionner les 3 étapes en 1 |

