import { useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { useVendorProducts } from "@/hooks/useVendors";
import { useVendorOrders, useVendorProductStats } from "@/hooks/useVendorOrders";
import { Eye, ShoppingCart, TrendingUp, Target } from "lucide-react";

const VendorAnalyticsInner = ({ vendorId, shopName, shopUrl }: { vendorId: string; shopName: string; shopUrl: string }) => {
  const { data: products = [] } = useVendorProducts(vendorId);
  const productIds = products.map((p) => p.id);
  const { data: stats = [] } = useVendorProductStats(productIds);
  const { data: orders = [] } = useVendorOrders(productIds);

  const totals = useMemo(() => {
    const views = (stats as unknown as Array<{ total_views: number | null }>).reduce((s, r) => s + (r.total_views ?? 0), 0);
    const purchases = (stats as unknown as Array<{ total_purchases: number | null }>).reduce((s, r) => s + (r.total_purchases ?? 0), 0);
    const conv = views > 0 ? ((purchases / views) * 100).toFixed(2) : "0.00";
    const validOrders = orders.filter((o) => o.status !== "cancelled").length;
    return { views, purchases, conv, validOrders };
  }, [stats, orders]);

  const productPerf = useMemo(() => {
    const map: Record<string, { views: number; purchases: number }> = {};
    (stats as unknown as Array<{ product_id: string; total_views: number | null; total_purchases: number | null }>).forEach((s) => {
      map[s.product_id] = { views: s.total_views ?? 0, purchases: s.total_purchases ?? 0 };
    });
    return products
      .map((p) => ({
        ...p,
        views: map[p.id]?.views ?? 0,
        purchases: map[p.id]?.purchases ?? 0,
        conv: (map[p.id]?.views ?? 0) > 0 ? (((map[p.id]?.purchases ?? 0) / map[p.id].views) * 100).toFixed(1) : "0.0",
      }))
      .sort((a, b) => b.views - a.views);
  }, [products, stats]);

  return (
    <DashboardLayout variant="vendor" title="Analytiques" shopName={shopName} shopUrl={shopUrl}>
      <SEO title="Analytiques — Vendeur" description="Performance" path="/dashboard/analytics" />

      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Analytiques</h2>
          <p className="mt-1 text-sm text-muted-foreground">Performance détaillée de chaque produit.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Eye, label: "Vues totales", value: totals.views.toLocaleString(), color: "bg-blue-500/15 text-blue-600" },
            { icon: ShoppingCart, label: "Achats trackés", value: totals.purchases.toLocaleString(), color: "bg-green-500/15 text-green-600" },
            { icon: TrendingUp, label: "Commandes", value: totals.validOrders.toLocaleString(), color: "bg-primary/15 text-primary" },
            { icon: Target, label: "Taux de conversion", value: `${totals.conv}%`, color: "bg-accent/20 text-accent" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-5">
              <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border p-5">
            <h3 className="text-base font-bold text-foreground">Performance par produit</h3>
            <p className="text-xs text-muted-foreground">Trié par nombre de vues.</p>
          </div>
          {productPerf.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Aucun produit.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Produit</th>
                    <th className="px-4 py-3 text-right">Vues</th>
                    <th className="px-4 py-3 text-right">Achats</th>
                    <th className="px-4 py-3 text-right">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {productPerf.map((p) => (
                    <tr key={p.id} className="border-t border-border hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.title} className="h-10 w-10 rounded-lg object-cover" />
                          <p className="line-clamp-1 font-semibold text-foreground">{p.title}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">{p.views.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">{p.purchases.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{p.conv}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

const VendorAnalytics = () => (
  <VendorGuard>
    {(vendor) => <VendorAnalyticsInner vendorId={vendor.id} shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`} />}
  </VendorGuard>
);

export default VendorAnalytics;
