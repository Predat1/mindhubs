# Plan : Upload images produits, popup amélioré et admin optimisé

## Constats actuels

1. **BuyPopup** : Le popup actuel est fonctionnel mais basique -- il n'est pas vraiment "plein écran immersif" comme demandé. Il reste une petite carte centrée (`max-w-md`). et stylé 
2. **Admin - Images produits** : Actuellement on ne peut qu'entrer une URL d'image manuellement. Pas d'upload de fichier.
3. **Admin - UX** : Le panel fonctionne mais manque de polish (pas de preview d'image, pas d'upload, formulaires denses).

## Changements prévus

### 1. Storage bucket pour les images produits

Creer un bucket `product-images` dans le storage pour permettre l'upload d'images directement depuis l'admin.

**Migration SQL :**

- Creer le bucket `product-images` (public)
- RLS : lecture publique, upload/delete pour admins uniquement

### 2. Upload d'images dans le formulaire produit (Admin)

**Fichier modifie : `src/pages/Admin.tsx**`

- Remplacer le champ "URL de l'image" par un composant d'upload avec drag & drop
- Preview de l'image actuelle dans le formulaire
- Upload vers le bucket `product-images` via le SDK Storage
- Generer automatiquement l'URL publique apres upload
- Conserver l'option de coller une URL externe en fallback

### 3. Popup d'achat vraiment plein ecran

**Fichier modifie : `src/components/BuyPopup.tsx**`

- Passer le popup en vrai plein ecran (`w-full h-full` ou `max-w-2xl` large)
- Layout split : image a gauche (ou en haut sur mobile), infos + CTAs a droite
- Ajouter un compteur de personnes qui consultent ("X personnes regardent ce produit")
- Boutons plus grands et plus impactants
- Animation d'entree plus fluide (scale from center)

### 4. Ameliorations globales du panel Admin

**Fichier modifie : `src/pages/Admin.tsx**`

- Preview d'image dans la table produits (plus grande, avec fallback)
- Preview d'image dans le formulaire d'edition
- Meilleur espacement et typographie dans les formulaires
- Badge "lien de paiement" plus visible dans la liste produits
- Indicateur visuel pour les produits sans image

## Details techniques


| Element           | Fichier                       | Action                                             |
| ----------------- | ----------------------------- | -------------------------------------------------- |
| Bucket storage    | Migration SQL                 | Creer bucket + RLS                                 |
| Upload images     | `src/pages/Admin.tsx`         | Composant upload + preview dans formulaire produit |
| Popup plein ecran | `src/components/BuyPopup.tsx` | Redesign layout split immersif                     |
| Admin UX          | `src/pages/Admin.tsx`         | Previews, espacement, polish global                |
