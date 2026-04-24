import { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { useVendorProducts } from "@/hooks/useVendors";
import { useVendorOrders, type VendorOrder } from "@/hooks/useVendorOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, ShoppingBag, Eye, Clock, CheckCircle2, Truck, XCircle,
  TrendingUp, Users, Package, Copy, Phone, Mail, ChevronRight,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

const STATUS_CONFIG: Record<OrderStatus, { label: string; cls: string; icon: typeof Clock; dot: string }> = {
  pending: {
    label: "En attente",
    cls: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
    icon: Clock,
    dot: "bg-yellow-500",
  },
  confirmed: {
    label: "Confirmée",
    cls: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    icon: CheckCircle2,
    dot: "bg-blue-500",
  },
  delivered: {
    label: "Livrée",
    cls: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
    icon: Truck,
    dot: "bg-green-500",
  },
  cancelled: {
    label: "Annulée",
    cls: "bg-destructive/15 text-destructive border-destructive/30",
    icon: XCircle,
    dot: "bg-destructive",
  },
};

const STATUS_ORDER: OrderStatus[] = ["pending", "confirmed", "delivered", "cancelled"];

const formatDate = (s: string) =>
  new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const formatTime = (s: string) =>
  new Date(s).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${cfg.cls}`}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
};

const KpiCard = ({ icon: Icon, label, value, accent }: { icon: typeof Clock; label: string; value: string; accent: string }) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <div className="flex items-center justify-between">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
        <Icon size={16} />
      </div>
    </div>
    <p className="mt-3 text-xs text-muted-foreground">{label}</p>
    <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
  </div>
);

const VendorSalesInner = ({ vendorId, shopName, shopUrl }: { vendorId: string; shopName: string; shopUrl: string }) => {
  const { data: products = [] } = useVendorProducts(vendorId);
  const productIds = products.map((p) => p.id);
  const { data: orders = [], isLoading } = useVendorOrders(productIds);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<VendorOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // KPIs
  const kpis = useMemo(() => {
    const pending = orders.filter((o) => o.status === "pending").length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const revenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.vendor_revenue, 0);
    const uniqueCustomers = new Set(orders.map((o) => o.customer_email)).size;
    return { pending, delivered, revenue, uniqueCustomers };
  }, [orders]);

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

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);
    setUpdatingId(null);

    if (error) {
      toast.error("Impossible de mettre à jour", { description: error.message });
      return;
    }
    toast.success(`Commande ${STATUS_CONFIG[newStatus].label.toLowerCase()}`);
    queryClient.invalidateQueries({ queryKey: ["vendor-all-orders"] });
    if (selected?.id === orderId) {
      setSelected({ ...selected, status: newStatus });
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("ID copié");
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    STATUS_ORDER.forEach((s) => (c[s] = orders.filter((o) => o.status === s).length));
    return c;
  }, [orders]);

  return (
    <DashboardLayout variant="vendor" title="Ventes" shopName={shopName} shopUrl={shopUrl}>
      <SEO title="Ventes — Vendeur" description="Suivi des ventes" path="/dashboard/sales" />

      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Vos ventes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {orders.length} commande{orders.length > 1 ? "s" : ""} liée{orders.length > 1 ? "s" : ""} à vos produits.
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard
            icon={TrendingUp}
            label="Revenus (hors annulées)"
            value={`${kpis.revenue.toLocaleString()} FCFA`}
            accent="bg-primary/15 text-primary"
          />
          <KpiCard
            icon={Clock}
            label="En attente"
            value={String(kpis.pending)}
            accent="bg-yellow-500/15 text-yellow-700 dark:text-yellow-400"
          />
          <KpiCard
            icon={Truck}
            label="Livrées"
            value={String(kpis.delivered)}
            accent="bg-green-500/15 text-green-700 dark:text-green-400"
          />
          <KpiCard
            icon={Users}
            label="Clients uniques"
            value={String(kpis.uniqueCustomers)}
            accent="bg-blue-500/15 text-blue-700 dark:text-blue-400"
          />
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
                className={`group inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition ${
                  statusFilter === s.v
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {s.l}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                    statusFilter === s.v
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {counts[s.v] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-10 w-10 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 rounded bg-muted" />
                    <div className="h-2 w-1/4 rounded bg-muted" />
                  </div>
                  <div className="h-8 w-24 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="text-muted-foreground" size={20} />
              </div>
              <p className="text-sm font-semibold text-foreground">Aucune vente trouvée</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {search || statusFilter !== "all"
                  ? "Essayez d'ajuster vos filtres."
                  : "Vos prochaines commandes apparaîtront ici."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
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
                      <tr key={o.id} className="border-t border-border transition hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <button
                            onClick={() => copyId(o.id)}
                            className="group inline-flex items-center gap-1 font-mono text-xs text-foreground hover:text-primary"
                            title="Copier l'ID"
                          >
                            #{o.id.slice(0, 8)}
                            <Copy size={10} className="opacity-0 transition group-hover:opacity-100" />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-foreground">{o.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          <p>{formatDate(o.created_at)}</p>
                          <p className="text-xs">{formatTime(o.created_at)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            value={o.status}
                            onValueChange={(v) => updateStatus(o.id, v as OrderStatus)}
                            disabled={updatingId === o.id}
                          >
                            <SelectTrigger className="h-8 w-[140px] border-border text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_ORDER.map((s) => {
                                const Icon = STATUS_CONFIG[s].icon;
                                return (
                                  <SelectItem key={s} value={s}>
                                    <span className="inline-flex items-center gap-2">
                                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
                                      <Icon size={11} />
                                      {STATUS_CONFIG[s].label}
                                    </span>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-foreground">
                          {o.vendor_revenue.toLocaleString()} FCFA
                        </td>
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

              {/* Mobile cards */}
              <div className="divide-y divide-border md:hidden">
                {filtered.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setSelected(o)}
                    className="flex w-full items-center gap-3 p-4 text-left transition active:bg-muted/40"
                  >
                    <div className={`h-10 w-1 shrink-0 rounded-full ${STATUS_CONFIG[o.status].dot}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">{o.customer_name}</p>
                        <p className="shrink-0 text-sm font-bold text-foreground">
                          {o.vendor_revenue.toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <StatusBadge status={o.status} />
                          <span className="truncate text-[10px] text-muted-foreground">
                            {formatDate(o.created_at)}
                          </span>
                        </div>
                        <ChevronRight size={14} className="shrink-0 text-muted-foreground" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order details dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Commande
              <button
                onClick={() => selected && copyId(selected.id)}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground hover:text-foreground"
              >
                #{selected?.id.slice(0, 8)}
                <Copy size={10} />
              </button>
            </DialogTitle>
            <DialogDescription>
              {selected && `${formatDate(selected.created_at)} • ${formatTime(selected.created_at)}`}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              {/* Status update */}
              <div className="rounded-xl border border-border p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Statut de la commande
                </p>
                <div className="flex items-center gap-2">
                  <Select
                    value={selected.status}
                    onValueChange={(v) => updateStatus(selected.id, v as OrderStatus)}
                    disabled={updatingId === selected.id}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_ORDER.map((s) => {
                        const Icon = STATUS_CONFIG[s].icon;
                        return (
                          <SelectItem key={s} value={s}>
                            <span className="inline-flex items-center gap-2">
                              <Icon size={12} />
                              {STATUS_CONFIG[s].label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Customer */}
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="font-semibold text-foreground">{selected.customer_name}</p>
                <div className="mt-2 space-y-1.5">
                  <a
                    href={`mailto:${selected.customer_email}`}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
                  >
                    <Mail size={11} /> {selected.customer_email}
                  </a>
                  <a
                    href={`tel:${selected.customer_phone}`}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
                  >
                    <Phone size={11} /> {selected.customer_phone}
                  </a>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Package size={11} />
                  Vos produits dans cette commande
                </p>
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

              {/* Total */}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">Vos revenus sur cette commande</span>
                <span className="text-lg font-bold text-foreground">
                  {selected.vendor_revenue.toLocaleString()} FCFA
                </span>
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
