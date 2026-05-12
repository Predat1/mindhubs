-- Attribution manuelle de crédits par email
DO $$
DECLARE
    v_vendor_id UUID;
BEGIN
    -- Trouver le vendor_id via l'email de l'utilisateur
    SELECT v.id INTO v_vendor_id
    FROM vendors v
    JOIN auth.users u ON v.user_id = u.id
    WHERE u.email = 'mobifranck94@gmail.com';

    IF v_vendor_id IS NOT NULL THEN
        -- Utiliser la fonction existante pour ajouter les crédits
        PERFORM public.grant_credits(
            v_vendor_id,
            100000,
            'Recharge Admin manuelle (mobifranck94)',
            'bonus'
        );
    END IF;
END $$;
