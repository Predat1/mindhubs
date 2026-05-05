-- Optimisation globale des performances de la base de données

-- Index sur les produits pour les filtres et le tri
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at_desc ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_is_lms ON public.products(is_lms) WHERE is_lms = true;

-- Index sur les vendeurs pour les recherches de boutique
CREATE INDEX IF NOT EXISTS idx_vendors_username ON public.vendors(username);

-- Index sur les commandes pour le dashboard
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Index sur les items de commande pour les statistiques
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
