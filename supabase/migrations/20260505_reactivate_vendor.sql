-- Réactivation du compte vendeur mobifranck94@gmail.com
DO $$
DECLARE
    v_user_id UUID;
    v_vendor_id UUID;
BEGIN
    -- 1. Trouver le user_id via l'email
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'mobifranck94@gmail.com';

    IF v_user_id IS NOT NULL THEN
        -- 2. Vérifier si le compte vendeur existe, sinon le créer
        SELECT id INTO v_vendor_id FROM vendors WHERE user_id = v_user_id;

        IF v_vendor_id IS NULL THEN
            INSERT INTO vendors (user_id, username, shop_name)
            VALUES (v_user_id, 'mobifranck', 'Boutique Franck')
            RETURNING id INTO v_vendor_id;
        END IF;

        -- 3. S'assurer que la souscription est ACTIVE
        INSERT INTO vendor_subscriptions (vendor_id, plan, status)
        VALUES (v_vendor_id, 'free', 'active')
        ON CONFLICT (vendor_id) DO UPDATE
        SET status = 'active', plan = GREATEST(vendor_subscriptions.plan, 'free');

        -- 4. S'assurer qu'il a un solde de crédits (initialiser à 50 si 0)
        INSERT INTO vendor_credits (vendor_id, balance)
        VALUES (v_vendor_id, 50)
        ON CONFLICT (vendor_id) DO NOTHING;
        
    END IF;
END $$;
