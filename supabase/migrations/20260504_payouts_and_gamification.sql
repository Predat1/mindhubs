
-- 1. Table des demandes de retrait
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id       UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  amount_fcfa     INTEGER NOT NULL CHECK (amount_fcfa >= 5000), -- Minimum 5000 FCFA
  method          TEXT NOT NULL CHECK (method IN ('wave', 'orange_money', 'mtn_money', 'moov_money', 'bank_transfer')),
  phone_number    TEXT,
  bank_details    JSONB, -- Pour virement bancaire
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  admin_notes     TEXT,
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Système de Gamification (Onboarding)
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS onboarding_progress JSONB DEFAULT '{"avatar": false, "description": false, "first_product": false, "payout_method": false, "completed": false}';

-- 3. Historique des bonus (Crédits gratuits)
CREATE TABLE IF NOT EXISTS public.bonus_rewards (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id    UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  reward_type  TEXT NOT NULL, -- 'onboarding_complete', 'first_sale', etc.
  amount       INTEGER NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, reward_type)
);

-- RLS
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors view own payouts" ON public.payout_requests FOR SELECT TO authenticated USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));
CREATE POLICY "Vendors create own payouts" ON public.payout_requests FOR INSERT TO authenticated WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));
