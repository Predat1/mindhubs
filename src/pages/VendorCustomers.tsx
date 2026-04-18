import { useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { useVendorProducts } from "@/hooks/useVendors";
import { useVendorOrders } from "@/hooks/useVendorOrders";
import { Search, Mail, Phone, Users } from "lucide-react";

interface CustomerSummary {
  email: string;
  name: string;
  phone: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
}

const VendorCustomersInner = ({ vendorId, shopName, shopUrl }: { vendorId: string; shopName: string; shopUrl: string }) => {
  const { data: products = [] } = useVendorProducts(vendorId);
  const { data: orders = [], isLoading } = useVendorOrders(products.map((p) => p.id));
  const [search, setSearch] = useState("");

  const customers = useMemo<CustomerSummary[]>(() => {
    const map = new Map<string, CustomerSummary>();
    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      const existing = map.get(o.customer_email);
      if (existing) {
        existing.orders += 1;
        existing.totalSpent += o.vendor_revenue;
        if (new Date(o.created_at) > new Date(existing.lastOrder)) existing.lastOrder = o.created_at;
      } else {
        map.set(o.customer_email, {
          email: o.customer_email,
          name: o.customer_name,
          phone: o.customer_phone,
          orders: 1,
          totalSpent: o.vendor_revenue,
          lastOrder: o.created_at,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  const filtered = customers.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout variant="vendor" title="Clients" shopName={shopName} shopUrl={shopUrl}>
      <SEO title="Clients — Vendeur" description="Vos clients" path="/dashboard/customers" />

      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Vos clients</h2>
          <p className="mt-1 text-sm text-muted-foreground">{customers.length} client{customers.length > 1 ? "s" : ""} unique{customers.length > 1 ? "s" : ""}.</p>
        </div>

        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un client…" className="pl-9" />
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
            <Users className="mx-auto mb-3 text-muted-foreground" size={36} />
            <p className="text-sm text-muted-foreground">Aucun client pour l'instant.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <div key={c.email} className="rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-foreground">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-muted/40 p-2">
                    <p className="text-base font-bold text-foreground">{c.orders}</p>
                    <p className="text-[10px] uppercase text-muted-foreground">Commandes</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-2">
                    <p className="text-base font-bold text-foreground">{c.totalSpent.toLocaleString()}</p>
                    <p className="text-[10px] uppercase text-muted-foreground">CFA dépensés</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <a href={`mailto:${c.email}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                    <Mail size={12} /> Email
                  </a>
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                      <Phone size={12} /> Appeler
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const VendorCustomers = () => (
  <VendorGuard>
    {(vendor) => <VendorCustomersInner vendorId={vendor.id} shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`} />}
  </VendorGuard>
);

export default VendorCustomers;
