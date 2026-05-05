-- REPARATION FORCEE DU COMPTE mobifranck94@gmail.com
DO $$
DECLARE
    v_user_id UUID;
    v_vendor_id UUID;
BEGIN
    -- 1. Récupérer le user_id actuel de Supabase Auth
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'mobifranck94@gmail.com';

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Utilisateur non trouvé avec cet email.';
        RETURN;
    END IF;

    -- 2. Supprimer les entrées orphelines ou en doublon si nécessaire
    -- (Optionnel, mais utile si des tests ont pollué la base)
    
    -- 3. S'assurer que le profil vendeur existe et est rattaché au BON user_id
    INSERT INTO vendors (user_id, username, shop_name, verified)
    VALUES (v_user_id, 'mobifranck94', 'Boutique Franck', true)
    ON CONFLICT (user_id) DO UPDATE
    SET username = 'mobifranck94', verified = true;

    SELECT id INTO v_vendor_id FROM vendors WHERE user_id = v_user_id;

    -- 4. Forcer la souscription ELITE pour débloquer TOUT (pour être sûr que ça marche)
    INSERT INTO vendor_subscriptions (vendor_id, plan, status)
    VALUES (v_vendor_id, 'elite', 'active')
    ON CONFLICT (vendor_id) DO UPDATE
    SET plan = 'elite', status = 'active', updated_at = now();

    -- 5. S'assurer que les crédits sont là
    INSERT INTO vendor_credits (vendor_id, balance, total_earned)
    VALUES (v_vendor_id, 100000, 100000)
    ON CONFLICT (vendor_id) DO UPDATE
    SET balance = vendor_credits.balance + 100000;

    -- 6. Ajouter le rôle Admin dans les métadonnées de l'utilisateur si c'est Franck
    UPDATE auth.users 
    SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb,
        raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
    WHERE id = v_user_id;

    RAISE NOTICE 'Compte mobifranck94 réactivé avec succès en mode ELITE/ADMIN.';
END $$;
