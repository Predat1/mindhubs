import { useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { useVendorProducts } from "@/hooks/useVendors";
import { useVendorOrders } from "@/hooks/useVendorOrders";
import { DollarSign, TrendingUp, ShoppingBag, Calendar } from "lucide-react";

const VendorRevenueInner = ({ vendorId, shopName, shopUrl }: { vendorId: string; shopName: string; shopUrl: string }) => {
  const { data: products = [] } = useVendorProducts(vendorId);
  const { data: orders = [], isLoading } = useVendorOrders(products.map((p) => p.id));

  const stats = useMemo(() => {
    const valid = orders.filter((o) => o.status !== "cancelled");
    const now = Date.now();
    const day = 24 * 3600 * 1000;
    const total = valid.reduce((s, o) => s + o.vendor_revenue, 0);
    const last7 = valid.filter((o) => now - new Date(o.created_at).getTime() < 7 * day).reduce((s, o) => s + o.vendor_revenue, 0);
    const last30 = valid.filter((o) => now - new Date(o.created_at).getTime() < 30 * day).reduce((s, o) => s + o.vendor_revenue, 0);
    const avg = valid.length > 0 ? Math.round(total / valid.length) : 0;

    // Daily breakdown for last 14 days
    const days: { date: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const start = now - i * day;
      const end = start + day;
      const dayLabel = new Date(start).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      const value = valid
        .filter((o) => {
          const t = new Date(o.created_at).getTime();
          return t >= start - day && t < end - day;
        })
        .reduce((s, o) => s + o.vendor_revenue, 0);
      days.push({ date: dayLabel, value });
    }
    const maxDay = Math.max(...days.map((d) => d.value), 1);

    return { total, last7, last30, avg, days, maxDay, count: valid.length };
  }, [orders]);

  return (
    <DashboardLayout variant="vendor" title="Revenus" shopName={shopName} shopUrl={shopUrl}>
      <SEO title="Revenus — Vendeur" description="Vos revenus" path="/dashboard/revenue" />

      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Revenus</h2>
          <p className="mt-1 text-sm text-muted-foreground">Performance financière de votre boutique.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: DollarSign, label: "Revenu total", value: `${stats.total.toLocaleString()} CFA` },
            { icon: Calendar, label: "30 derniers jours", value: `${stats.last30.toLocaleString()} CFA` },
            { icon: TrendingUp, label: "7 derniers jours", value: `${stats.last7.toLocaleString()} CFA` },
            { icon: ShoppingBag, label: "Panier moyen", value: `${stats.avg.toLocaleString()} CFA` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon size={18} />
              </div>
              <p className="text-xl font-bold text-foreground sm:text-2xl">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h3 className="text-base font-bold text-foreground">Revenus des 14 derniers jours</h3>
          <p className="text-xs text-muted-foreground">Évolution quotidienne en CFA.</p>

          {isLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Chargement…</div>
          ) : (
            <div className="mt-6 flex h-48 items-end gap-1 sm:gap-2">
              {stats.days.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-primary to-accent transition-all hover:opacity-80"
                    style={{ height: `${(d.value / stats.maxDay) * 100}%`, minHeight: d.value > 0 ? "4px" : "0" }}
                    title={`${d.value.toLocaleString()} CFA`}
                  />
                  <span className="text-[9px] text-muted-foreground">{d.date}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

const VendorRevenue = () => (
  <VendorGuard>
    {(vendor) => <VendorRevenueInner vendorId={vendor.id} shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`} />}
  </VendorGuard>
);

export default VendorRevenue;
