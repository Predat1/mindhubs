CREATE TABLE public.global_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'new_product'
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.global_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Global notifications are viewable by everyone"
  ON public.global_notifications FOR SELECT
  USING (true);

-- Admins can insert/update/delete global notifications
CREATE POLICY "Admins can manage global notifications"
  ON public.global_notifications FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable real-time for global notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.global_notifications;

-- Trigger to create notification on new published product
CREATE OR REPLACE FUNCTION public.handle_new_product_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- We only notify on INSERT, or UPDATE if status changes from draft to published.
  IF (TG_OP = 'INSERT' AND NEW.status = 'published') OR
     (TG_OP = 'UPDATE' AND OLD.status != 'published' AND NEW.status = 'published') THEN
    
    INSERT INTO public.global_notifications (title, message, type, link)
    VALUES (
      'Nouveau Produit Disponible !',
      'Découvrez "' || NEW.title || '", fraîchement ajouté sur la plateforme.',
      'new_product',
      '/produit/' || NEW.id
    );
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_product_published
  AFTER INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_product_notification();
