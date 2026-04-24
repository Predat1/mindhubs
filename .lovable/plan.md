

# Refonte UI/UX Authentification + Résolution des conflits

## Conflits identifiés

1. **Pas de Google Sign-In** alors que la mémoire projet le recommande par défaut. Les utilisateurs n'ont qu'une seule option (email/password).
2. **`signUp` ne gère pas le cas "email déjà utilisé"** clairement (message brut Supabase peu lisible en français).
3. **Pas de validation visuelle du mot de passe** (force, critères) → confusion à l'inscription.
4. **Toast d'inscription affirme "Vérifiez votre email"** mais aucun écran d'attente n'existe → l'utilisateur reste bloqué sur le formulaire sans feedback clair.
5. **`/reset-password` ne vérifie pas que la session de récupération est valide** : si on accède à la page sans token, on peut quand même soumettre (et ça change le mot de passe d'un utilisateur connecté par hasard).
6. **Aucun indicateur de session active dans la Navbar** : impossible de savoir d'un coup d'œil si l'on est connecté.
7. **Pas de protection des routes vendor** côté `MonCompte` (uniquement gardé via `VendorGuard` sur les pages dashboard, pas d'orientation depuis le compte).

## Améliorations UI/UX

### A. Page `MonCompte` (auth)
- **Ajout du bouton "Continuer avec Google"** (haut du formulaire, avant les champs email/password) avec séparateur "ou".
- **Onglets segmentés** (Connexion / Inscription) au lieu du toggle texte en bas.
- **Indicateur de force du mot de passe** lors de l'inscription (faible / moyen / fort, barre colorée).
- **Critères live** sous le champ password (✓ 6+ caractères, ✓ 1 chiffre, ✓ 1 majuscule).
- **Messages d'erreur traduits** en français (mapping des erreurs Supabase courantes).
- **Écran "Vérifiez votre email"** après inscription (au lieu de juste un toast) avec bouton "Renvoyer l'email".
- **Animation aurora-glow** sur la card auth pour cohérence Black & Gold.
- **Logo/icône Mind✦Hub** centré au-dessus de la card pour identité visuelle.

### B. Page `ResetPassword`
- **Vérifier le token recovery** : si pas de session de récupération valide, afficher un message d'erreur + lien vers "Demander un nouveau lien".
- **Indicateur de force** identique à l'inscription.
- **Confirmation du mot de passe** (2 champs avec validation).
- **Auto-déconnexion** après reset pour forcer une nouvelle connexion sécurisée.

### C. Vue connectée (`MonCompte` logged-in)
- **Section "Sécurité"** avec : changer mot de passe, dernière connexion, statut email vérifié.
- **Bouton "Devenir vendeur"** visible si l'utilisateur n'est pas vendor (CTA vers `/become-a-seller`).
- **Bouton "Mon dashboard vendeur"** si l'utilisateur EST vendor (CTA vers `/dashboard`).

### D. Navbar
- **Avatar utilisateur** (initiales sur fond gold) à la place du lien "Mon compte" quand connecté, avec dropdown : Mon compte / Mon dashboard / Déconnexion.

## Implémentation technique

### 1. `AuthContext.tsx`
- Ajout de `signInWithGoogle()` utilisant `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } })`.
- Helper `translateAuthError(error)` qui mappe les codes d'erreur Supabase courants vers du français lisible.
- Ajout de `resendConfirmation(email)` pour le bouton "Renvoyer l'email".

### 2. `MonCompte.tsx`
- Refonte des onglets via composant `Tabs` de shadcn.
- Bouton Google avec icône SVG (déjà présent dans `src/assets/logos/google.svg`).
- Composant interne `PasswordStrength` (barre + critères).
- Nouveau state `mode: "login" | "register" | "forgot" | "check-email"` avec écran dédié.
- Section Sécurité dans la vue logged-in + lien conditionnel vendor.

### 3. `ResetPassword.tsx`
- Hook `useEffect` qui vérifie via `supabase.auth.getSession()` la présence du token recovery, sinon `setError("invalid_session")`.
- Champ "Confirmer le mot de passe" + validation match.
- Composant `PasswordStrength` partagé.
- `signOut()` après update + redirection `/mon-compte`.

### 4. `Navbar.tsx`
- Détection de `user` via `useAuth()`.
- Composant `UserMenu` (DropdownMenu shadcn) avec avatar initiales + items.

### 5. Nouveau composant partagé
- `src/components/auth/PasswordStrength.tsx` (barre + 4 critères live).
- `src/components/auth/GoogleButton.tsx` (bouton stylisé réutilisable).

## Fichiers modifiés

| Fichier | Action |
|---|---|
| `src/contexts/AuthContext.tsx` | Ajout Google + translateAuthError + resendConfirmation |
| `src/pages/MonCompte.tsx` | Refonte complète UI auth + section sécurité |
| `src/pages/ResetPassword.tsx` | Validation token + confirmation password |
| `src/components/Navbar.tsx` | Avatar dropdown utilisateur |
| `src/components/auth/PasswordStrength.tsx` | Nouveau composant |
| `src/components/auth/GoogleButton.tsx` | Nouveau composant |

## Notes

- Google OAuth est géré nativement par Lovable Cloud (pas besoin de configurer des credentials).
- Aucune migration DB nécessaire.
- Toutes les nouvelles fonctionnalités respectent le thème Black & Gold existant.

