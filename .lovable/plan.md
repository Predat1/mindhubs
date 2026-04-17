

# Plan : Transformation en Marketplace Multi-Vendeurs

Transformation de MIND✦HUB d'une boutique mono-vendeur en marketplace multi-vendeurs, par étapes incrémentales sans casser l'existant.

---

## Phase 1 — Fondation Vendeur (URGENT)

### 1.1 Base de données

**Nouveau rôle `vendor`** ajouté à l'enum `app_role` existant (`admin`, `moderator`, `user`, **`vendor`**).

**Nouvelle table `vendors`** (boutiques) :
- `id` (uuid)
- `user_id` (uuid, FK vers auth.users)
- `username` (text, unique, pour URL `/store/:username`)
- `shop_name` (text)
- `description` (text)
- `avatar_url` (text)
- `verified` (boolean) — pour badge "Vendeur vérifié"
- `created_at`

**Modification table `products`** :
- Ajout `vendor_id` (uuid, nullable au début pour ne pas casser les produits existants qui resteront sous le compte admin)

**RLS** :
- Vendors peuvent lire/modifier UNIQUEMENT leurs propres produits
- Admin garde contrôle total
- Lecture publique des vendors et produits

### 1.2 Page `/become-a-seller`

Formulaire d'inscription vendeur (signup + création boutique en une étape) :
- Nom boutique
- Username (slug pour URL)
- Email + mot de passe
- Description courte

À la soumission : crée le compte auth → assigne rôle `vendor` → crée ligne `vendors`.

### 1.3 Bouton "Devenir vendeur"

Ajout dans `Navbar.tsx` (desktop + mobile) → lien vers `/become-a-seller`.

---

## Phase 2 — Boutiques Vendeurs

### 2.1 Page `/store/:username`

Nouveau fichier `src/pages/VendorStore.tsx` :
- Header boutique (nom, avatar, description, badge vérifié)
- Stats simples (nb produits, note moyenne)
- Grille de tous les produits du vendeur (réutilise `ProductCard`)

### 2.2 Affichage vendeur sur produits

Sur `ProductCard` et `ProductDetail.tsx` :
- "Vendu par **[nom boutique]**" (lien cliquable vers `/store/:username`)
- Badge vendeur vérifié si applicable

### 2.3 Section "Produits du même vendeur"

Sur `ProductDetail.tsx`, sous la fiche : carrousel des autres produits du même vendeur.

---

## Phase 3 — Dashboard Vendeur

### 3.1 Page `/dashboard`

Nouveau fichier `src/pages/VendorDashboard.tsx`, accessible uniquement aux users avec rôle `vendor` :
- Stats : nb produits, vues totales, achats totaux (via `product_stats` existant)
- Liste de SES produits avec actions Modifier/Supprimer
- Bouton "Ajouter un produit"
- Lien "Voir ma boutique publique"

### 3.2 Page `/dashboard/new-product` & `/dashboard/edit-product/:id`

Formulaire produit (réutilise la logique de `Admin.tsx`) :
- Titre, description, catégorie
- Prix, ancien prix
- Upload image (bucket `product-images` existant)
- Lien de paiement externe (Paystack, etc.)
- Caractéristiques clés

À la création : `vendor_id` = vendor courant automatiquement.

---

## Phase 4 — Améliorations UX

- Lien "Mon Dashboard" dans le menu user (`MonCompte`) si rôle vendor
- Badge "Vendeur" sur les profils
- Mise à jour `Boutique.tsx` : filtre optionnel par vendeur

---

## Architecture Technique

| Élément | Fichier | Action |
|---|---|---|
| Migration SQL | `supabase/migrations/` | Nouvelle migration : enum `vendor`, table `vendors`, colonne `products.vendor_id`, RLS |
| Hook vendeurs | `src/hooks/useVendors.ts` | NEW — `useVendor(username)`, `useVendorProducts(vendorId)`, `useCurrentVendor()` |
| Hook rôle | `src/hooks/useAdminRole.ts` | EDIT — ajouter `useIsVendor()` |
| Inscription vendeur | `src/pages/BecomeSeller.tsx` | NEW |
| Boutique publique | `src/pages/VendorStore.tsx` | NEW |
| Dashboard | `src/pages/VendorDashboard.tsx` | NEW |
| Formulaire produit vendeur | `src/pages/VendorProductForm.tsx` | NEW (create + edit) |
| Routes | `src/App.tsx` | EDIT — ajouter 4 routes |
| Navbar | `src/components/Navbar.tsx` | EDIT — bouton "Devenir vendeur" + lien Dashboard si vendor |
| ProductCard | `src/components/ProductCard.tsx` | EDIT — affichage nom vendeur |
| ProductDetail | `src/pages/ProductDetail.tsx` | EDIT — bloc vendeur + "Produits du même vendeur" |
| Types Supabase | `src/integrations/supabase/types.ts` | Auto-régénéré |

**Note sur les produits existants** : ils resteront avec `vendor_id = NULL` et continueront à s'afficher comme avant (vendus par "MIND✦HUB" par défaut). Aucune rupture.

**Paiements** : aucun changement — chaque vendeur fournit son propre lien externe (existant : champ `payment_link`).

**Livraison/téléchargement** (point 7 du brief) : reporté à une phase ultérieure pour ne pas surcharger ce lot. À traiter quand les premiers vendeurs seront actifs.

---

## Ce qui sera livré dans CE lot

✅ Phases 1, 2, 3 (fondation complète + dashboard fonctionnel)
✅ Bouton "Devenir vendeur" visible
✅ Flow complet testable : inscription vendeur → ajout produit → boutique publique visible

⏳ Reporté : système de téléchargement automatique post-achat, badges avancés, page `/thank-you` dédiée — à faire après validation du flow vendeur de base.

