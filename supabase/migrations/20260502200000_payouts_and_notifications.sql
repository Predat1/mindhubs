-- 1. Table des demandes de retrait (Payouts)
-- WHY: Permet aux vendeurs de réclamer leurs gains de manière structurée.
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount >= 1000), -- Minimum 1000 FCFA pour éviter les micro-transactions
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'rejected')),
  payment_method TEXT NOT NULL, -- 'Orange Money', 'Wave', 'MTN', 'Virement'
  payment_details TEXT NOT NULL, -- Numéro de téléphone ou RIB
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Table des notifications vendeurs
-- WHY: Engagement et rétention. Le vendeur doit savoir quand il se passe quelque chose.
CREATE TABLE IF NOT EXISTS public.vendor_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sale', 'system', 'payout', 'subscription')),
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. RLS pour la sécurité
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors manage own payouts" ON public.payout_requests
  FOR ALL TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Vendors read own notifications" ON public.vendor_notifications
  FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

CREATE POLICY "Admins manage all payouts" ON public.payout_requests
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- 4. Trigger automatique : Notification de vente
-- WHY: Automatisation totale. Dès qu'une commande est confirmée, le vendeur reçoit une notification in-app.
CREATE OR REPLACE FUNCTION public.notify_vendor_on_sale()
RETURNS TRIGGER AS $$
DECLARE
  v_item JSONB;
  v_product_id UUID;
  v_vendor_id UUID;
  v_product_title TEXT;
BEGIN
  -- NEW est la commande. On boucle sur les articles car une commande peut grouper plusieurs produits.
  FOR v_item IN SELECT * FROM jsonb_array_elements(NEW.items)
  LOOP
    v_product_id := (v_item->>'id')::UUID;
    SELECT vendor_id, title INTO v_vendor_id, v_product_title FROM products WHERE id = v_product_id;
    
    IF v_vendor_id IS NOT NULL THEN
      INSERT INTO vendor_notifications (vendor_id, title, message, type, link)
      VALUES (
        v_vendor_id, 
        'Nouvelle vente ! 🎉', 
        'Vous avez vendu "' || v_product_title || '" pour ' || (v_item->>'price') || '.',
        'sale',
        '/dashboard/sales'
      );
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Déclenchement quand le statut passe à 'confirmed' (paiement validé)
DROP TRIGGER IF EXISTS trigger_notify_sale ON public.orders;
CREATE TRIGGER trigger_notify_sale
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed' AND OLD.status != 'confirmed')
  EXECUTE FUNCTION public.notify_vendor_on_sale();
