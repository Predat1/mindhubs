# Plan : Optimisation conversion — Page Produit & Admin Panel

## A. Page Produit (Frontend) — 7 améliorations

### 1. Barre de pourcentage de réduction

Afficher un badge bien visible avec le % de réduction calculé (ex: "-60%")  pour créer l'urgence.

### 2. Compte à rebours promotionnel

Mini timer animé "Offre expire dans X:XX:XX" au-dessus du bouton d'achat. Se remet à zéro toutes les 24h pour maintenir la pression.

### 3. Section garantie & confiance

Ajouter un bloc avec icônes : "Livraison instantanée", "Paiement sécurisé (Mobile Money)", "Satisfaction Garantie", "Support WhatsApp 24/7". Rassure avant l'achat.

### 4. Galerie d'images avec carousel

Remplacer l'image unique par un carousel (embla, déjà installé) permettant de montrer plusieurs visuels du produit. L'admin pourra uploader plusieurs images.

### 5. Onglet Avis clients

Ajouter un onglet "Avis" à côté de "Description" affichant des avis (depuis la table testimonials ou des avis générés par produit). Renforce la preuve sociale directement sur la page.

### 6. Section "Ce que tu vas recevoir"

Bloc visuel résumant les livrables clés (guide PDF, bonus, plan d'action, scripts) avec des icônes, extrait automatiquement de la description ou saisi manuellement.

### 7. CTA flottant amélioré

Le sticky CTA mobile affiche aussi le % de réduction et un mini compteur. Sur desktop, ajouter un sticky sidebar CTA qui reste visible au scroll.

---

## B. Admin Panel — 5 améliorations conversion

### 1. Champ "images multiples" sur le formulaire produit

Permettre d'uploader plusieurs images par produit (stockées en JSON dans un nouveau champ `gallery` ou une colonne `image_urls jsonb`). Alimentera le carousel frontend.

### 2. Aperçu live du produit

Bouton "Prévisualiser" dans le formulaire d'édition qui ouvre un mini-rendu de la page produit telle qu'elle apparaîtra côté client, directement dans l'admin.

### 3. Champ "Points clés" / "Livrables"

Nouveau champ texte structuré (ou liste) dans le formulaire produit pour saisir les livrables/bonus. Affiché dans la section "Ce que tu vas recevoir" sur la page produit.

### 4. Dashboard taux de conversion

Ajouter dans le dashboard : taux de conversion (commandes / vues produit), produit le plus vendu, et revenu moyen par commande. Aide à piloter les ventes.

### 5. Notifications commandes en temps réel

Activer Supabase Realtime sur la table `orders` pour recevoir un toast/notification dans l'admin dès qu'une nouvelle commande arrive, sans rafraîchir.

---

## Détails techniques


| Element                         | Fichiers modifiés                       | Migration SQL                                                      |
| ------------------------------- | --------------------------------------- | ------------------------------------------------------------------ |
| Badge réduction + barre urgence | `ProductDetail.tsx`                     | Non                                                                |
| Countdown timer                 | `ProductDetail.tsx` (nouveau composant) | Non                                                                |
| Bloc garantie/confiance         | `ProductDetail.tsx`                     | Non                                                                |
| Carousel images                 | `ProductDetail.tsx`, `ProductCard.tsx`  | Oui — ajout colonne `image_urls jsonb default '[]'` sur `products` |
| Onglet Avis                     | `ProductDetail.tsx`                     | Non (utilise testimonials existants)                               |
| Section livrables               | `ProductDetail.tsx`                     | Oui — ajout colonne `key_features text[]` sur `products`           |
| CTA desktop sticky              | `StickyProductCTA.tsx`                  | Non                                                                |
| Multi-upload admin              | `Admin.tsx`                             | Même migration que carousel                                        |
| Preview live admin              | `Admin.tsx`                             | Non                                                                |
| Champ livrables admin           | `Admin.tsx`                             | Même migration que livrables                                       |
| Dashboard conversion            | `Admin.tsx`                             | Non                                                                |
| Realtime commandes              | `Admin.tsx`                             | Migration `ALTER PUBLICATION supabase_realtime ADD TABLE orders`   |


**1 migration SQL** avec :

```sql
ALTER TABLE products ADD COLUMN image_urls jsonb DEFAULT '[]';
ALTER TABLE products ADD COLUMN key_features text[] DEFAULT '{}';
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
```

Total : ~3 fichiers modifiés, 1 composant créé, 1 migration.