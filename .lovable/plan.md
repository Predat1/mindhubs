

# Plan : Amélioration complète du panel Admin

## Améliorations prioritaires

### 1. Recherche dans les onglets
Ajouter une barre de recherche en haut de chaque onglet (Produits, Témoignages, Commandes) qui filtre en temps réel par titre/nom/email.

**Fichier modifié :** `src/pages/Admin.tsx`

### 2. Export CSV des commandes
Bouton "Exporter CSV" dans l'onglet Commandes qui génère un fichier CSV téléchargeable avec toutes les colonnes (client, email, téléphone, total, statut, date, produits).

**Fichier modifié :** `src/pages/Admin.tsx`

### 3. Graphique de revenus sur le dashboard
Ajouter un mini-graphique en barres montrant les revenus des 7 derniers jours directement sur le dashboard stats, en utilisant Recharts (déjà disponible via shadcn/ui chart).

**Fichier modifié :** `src/pages/Admin.tsx`

### 4. Bouton dupliquer un produit
Ajouter un bouton "Dupliquer" à côté de Modifier/Supprimer dans la table produits. Pré-remplit le formulaire avec les données du produit existant + un nouvel ID.

**Fichier modifié :** `src/pages/Admin.tsx`

### 5. Modal de confirmation stylé
Remplacer les `confirm()` natifs par un dialog stylé (AlertDialog de shadcn) pour les suppressions de produits, témoignages et commandes.

**Fichier modifié :** `src/pages/Admin.tsx`

### 6. Lien "Voir sur le site"
Ajouter un bouton œil/lien dans chaque ligne produit qui ouvre `/produit/:id` dans un nouvel onglet.

**Fichier modifié :** `src/pages/Admin.tsx`

### 7. Compteur "nouvelles commandes" sur l'onglet
Afficher un badge rouge sur l'onglet Commandes quand il y a des commandes en statut "pending".

**Fichier modifié :** `src/pages/Admin.tsx`

## Détails techniques

| Élément | Action |
|---|---|
| Recherche | State `searchQuery` + `.filter()` sur les données |
| Export CSV | Fonction JS `downloadCSV()` avec `Blob` + `URL.createObjectURL` |
| Graphique | `recharts` BarChart avec données groupées par jour depuis `orders` |
| Dupliquer | `openEditProduct(p)` avec `isNew=true` et ID modifié |
| AlertDialog | Import `AlertDialog` de shadcn, remplacer 3 `confirm()` |
| Voir sur site | `<a href="/produit/${id}" target="_blank">` |
| Badge commandes | `orders.filter(o => o.status === "pending").length` affiché en badge |

Tout se passe dans `src/pages/Admin.tsx`. Aucune migration SQL nécessaire.

