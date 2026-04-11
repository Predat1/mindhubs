

# Plan : Historique commandes Mon Compte + Admin amélioré

## 1. Historique de commandes dans Mon Compte

Ajouter une section "Mes achats" qui affiche les commandes de l'utilisateur connecté depuis la base de données, avec statut, date, produits commandés et montant. Inclure une section "Produits similaires" suggérant des produits basés sur les catégories des achats passés.

**Fichier modifié :** `src/pages/MonCompte.tsx`
- Fetch des commandes via `supabase.from("orders").select("*").eq("user_id", user.id)`
- Afficher chaque commande avec badge de statut coloré, liste des produits, et total
- Section "Produits recommandés" en bas avec des produits de catégories similaires via `useProducts()`
- Mettre à jour les stats (nombre d'achats, nombre de formations)

## 2. Amélioration globale du panel Admin

**Fichier modifié :** `src/pages/Admin.tsx`
- La gestion des témoignages (CRUD) est déjà en place
- Le champ `payment_link` est déjà dans le formulaire produit
- Améliorations : meilleur dashboard avec stats de revenus, commandes récentes en aperçu rapide, filtrage par statut dans l'onglet commandes, design plus aéré

## Détails techniques

| Fichier | Action |
|---|---|
| `src/pages/MonCompte.tsx` | Fetch commandes user, affichage historique, produits similaires |
| `src/pages/Admin.tsx` | Dashboard amélioré, filtre commandes, UX globale |

Pas de migration SQL nécessaire : les tables et RLS sont déjà en place (les users peuvent voir leurs propres commandes via la policy existante `auth.uid() = user_id`).

