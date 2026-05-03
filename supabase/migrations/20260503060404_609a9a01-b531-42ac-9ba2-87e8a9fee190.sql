
-- Table des plans tarifaires
CREATE TABLE public.plan_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan TEXT NOT NULL UNIQUE,
  max_products INTEGER NOT NULL DEFAULT 1,
  monthly_credits INTEGER NOT NULL DEFAULT 0,
  commission_rate NUMERIC(4,2) NOT NULL DEFAULT 0.10,
  price_fcfa_monthly INTEGER NOT NULL DEFAULT 0,
  price_fcfa_yearly INTEGER NOT NULL DEFAULT 0,
  ads_studio BOOLEAN NOT NULL DEFAULT false,
  creator_lab_full BOOLEAN NOT NULL DEFAULT false,
  priority_placement BOOLEAN NOT NULL DEFAULT false,
  whatsapp_support BOOLEAN NOT NULL DEFAULT false,
  badge TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les plans
CREATE POLICY "Plans are publicly readable"
  ON public.plan_limits FOR SELECT
  USING (true);

-- Insertion des 4 plans
INSERT INTO public.plan_limits (plan, max_products, monthly_credits, commission_rate, price_fcfa_monthly, price_fcfa_yearly, ads_studio, creator_lab_full, priority_placement, whatsapp_support, badge) VALUES
  ('free',    1,  50,  0.10, 0,      0,      false, false, false, false, NULL),
  ('starter', 5,  200, 0.08, 4900,   49000,  false, false, false, false, NULL),
  ('pro',    20,  800, 0.05, 14900,  149000, true,  true,  true,  false, 'Populaire'),
  ('elite',  -1, 3000, 0.03, 39900,  399000, true,  true,  true,  true,  'Premium');
