
-- Fix RLS for vendor_subscriptions to allow vendors to initialize their subscription during onboarding
DROP POLICY IF EXISTS "Vendors can initialize their own subscription" ON public.vendor_subscriptions;
CREATE POLICY "Vendors can initialize their own subscription"
  ON public.vendor_subscriptions FOR INSERT TO authenticated
  WITH CHECK (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

-- Also allow vendors to update their own subscription if it's pending (to add payment reference for example)
DROP POLICY IF EXISTS "Vendors can update their own pending subscription" ON public.vendor_subscriptions;
CREATE POLICY "Vendors can update their own pending subscription"
  ON public.vendor_subscriptions FOR UPDATE TO authenticated
  USING (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()))
  WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid()));

-- Fix RLS for vendor_credits to allow initialization
DROP POLICY IF EXISTS "Vendors can initialize their own credits" ON public.vendor_credits;
CREATE POLICY "Vendors can initialize their own credits"
  ON public.vendor_credits FOR INSERT TO authenticated
  WITH CHECK (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  );
