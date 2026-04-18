import { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { useVendorProducts } from "@/hooks/useVendors";
import { useVendorOrders, type VendorOrder } from "@/hooks/useVendorOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingBag, Eye, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "En attente", cls: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400" },
  confirmed: { label: "Confirmée", cls: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  delivered: { label: "Livrée", cls: "bg-green-500/15 text-green-700 dark:text-green-400" },
  cancelled: { label: "Annulée", cls: "bg-destructive/15 text-destructive" },
};

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const VendorSalesInner = ({ vendorId, shopName, shopUrl }: { vendorId: string; shopName: string; shopUrl: string }) => {
  const { data: products = [] } = useVendorProducts(vendorId);
  const productIds = products.map((p) => p.id);
  const { data: orders = [], isLoading } = useVendorOrders(productIds);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<VendorOrder | null>(null);

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        if (statusFilter !== "all" && o.status !== statusFilter) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          o.customer_name?.toLowerCase().includes(q) ||
          o.customer_email?.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q)
        );
      }),
    [orders, search, statusFilter]
  );

  return (
    <DashboardLayout variant="vendor" title="Ventes" shopName={shopName} shopUrl={shopUrl}>
      <SEO title="Ventes — Vendeur" description="Suivi des ventes" path="/dashboard/sales" />

      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Vos ventes</h2>
          <p className="mt-1 text-sm text-muted-foreground">{orders.length} commande{orders.length > 1 ? "s" : ""} liée{orders.length > 1 ? "s" : ""} à vos produits.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par client, email ou ID…"
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {[
              { v: "all", l: "Toutes" },
              { v: "pending", l: "En attente" },
              { v: "confirmed", l: "Confirmées" },
              { v: "delivered", l: "Livrées" },
              { v: "cancelled", l: "Annulées" },
            ].map((s) => (
              <button
                key={s.v}
                onClick={() => setStatusFilter(s.v)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  statusFilter === s.v
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.l}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Chargement…</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="mx-auto mb-3 text-muted-foreground" size={32} />
              <p className="text-sm text-muted-foreground">Aucune vente pour le moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Commande</th>
                    <th className="px-4 py-3 text-left">Client</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                    <th className="px-4 py-3 text-right">Vos revenus</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-4 py-3 font-mono text-xs text-foreground">#{o.id.slice(0, 8)}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{o.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(o.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${STATUS_LABEL[o.status]?.cls}`}>
                          {STATUS_LABEL[o.status]?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">{o.vendor_revenue.toLocaleString()} CFA</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(o)}>
                          <Eye size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
            <DialogDescription>#{selected?.id.slice(0, 8)} • {selected && formatDate(selected.created_at)}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="rounded-lg bg-muted/40 p-3">
                <p className="font-semibold text-foreground">{selected.customer_name}</p>
                <p className="text-xs text-muted-foreground">{selected.customer_email}</p>
                <p className="text-xs text-muted-foreground">{selected.customer_phone}</p>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Vos produits dans cette commande</p>
                <div className="space-y-2">
                  {selected.vendor_items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-lg border border-border p-2">
                      {it.image && <img src={it.image} alt="" className="h-10 w-10 rounded-md object-cover" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-foreground">{it.title}</p>
                        <p className="text-[10px] text-muted-foreground">Qté {it.quantity ?? 1}</p>
                      </div>
                      <p className="text-xs font-bold text-foreground">{it.price}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">Vos revenus sur cette commande</span>
                <span className="text-lg font-bold text-foreground">{selected.vendor_revenue.toLocaleString()} CFA</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

const VendorSales = () => (
  <VendorGuard>
    {(vendor) => <VendorSalesInner vendorId={vendor.id} shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`} />}
  </VendorGuard>
);

export default VendorSales;
