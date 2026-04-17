import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { useVendor, useVendorProducts } from "@/hooks/useVendors";
import { Store, BadgeCheck, Package } from "lucide-react";

const VendorStore = () => {
  const { username } = useParams<{ username: string }>();
  const { data: vendor, isLoading } = useVendor(username);
  const { data: products = [] } = useVendorProducts(vendor?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32"><div className="stat-card h-48 rounded-2xl animate-pulse" /></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32 text-center">
          <h1 className="text-2xl font-bold text-foreground">Boutique introuvable</h1>
          <Link to="/boutique" className="text-primary underline mt-4 inline-block text-sm">Retour à la boutique</Link>
        </div>
        <FooterSection />
      </div>
    );
  }

  const initials = vendor.shop_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${vendor.shop_name} — Boutique MindHub`} description={vendor.description || `Découvrez les produits de ${vendor.shop_name}.`} path={`/store/${vendor.username}`} />
      <Navbar />

      <section className="container mx-auto px-4 pt-28 sm:pt-32 pb-8">
        <AnimateOnScroll>
          <div className="stat-card rounded-2xl p-5 sm:p-8 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground shrink-0 overflow-hidden">
                {vendor.avatar_url ? <img src={vendor.avatar_url} alt={vendor.shop_name} className="w-full h-full object-cover" /> : initials}
              </div>
              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground">{vendor.shop_name}</h1>
                  {vendor.verified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-semibold">
                      <BadgeCheck size={12} /> Vérifié
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">@{vendor.username}</p>
                {vendor.description && <p className="text-sm text-muted-foreground max-w-2xl">{vendor.description}</p>}
                <div className="flex items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Package size={12} /> {products.length} produit{products.length > 1 ? "s" : ""}</span>
                  <span className="inline-flex items-center gap-1.5"><Store size={12} /> Membre depuis {new Date(vendor.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span>
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-base sm:text-lg font-bold text-foreground mb-6">Produits de la boutique</h2>
          {products.length === 0 ? (
            <div className="stat-card rounded-xl p-8 text-center text-sm text-muted-foreground">
              Aucun produit pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.map((p, i) => (
                <AnimateOnScroll key={p.id} delay={i * 60}>
                  <ProductCard product={p} />
                </AnimateOnScroll>
              ))}
            </div>
          )}
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default VendorStore;
