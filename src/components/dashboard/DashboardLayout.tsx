import { useState, useMemo, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, ShoppingBag, Package, Users, DollarSign, BarChart3, Megaphone,
  Sparkles, Settings, HelpCircle, LogOut, Search, Bell, Plus, ExternalLink,
  Menu, ChevronDown, Store, MessageSquare, ShieldCheck, Sun, Moon, Zap, Info,
  Factory,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { useCurrentVendor, useVendorProducts } from "@/hooks/useVendors";
import { useVendorOrders } from "@/hooks/useVendorOrders";

export type BadgeVariant = "new" | "hot" | "count";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: BadgeVariant;
  badgeTooltip?: string;
  group?: "main" | "growth" | "system";
};

interface DashboardLayoutProps {
  variant: "vendor" | "admin";
  title?: string;
  shopName?: string;
  shopUrl?: string;
  children: ReactNode;
}

export const VENDOR_NAV: SidebarItem[] = [
  { label: "Accueil", href: "/dashboard", icon: Home, group: "main" },
  { label: "Ventes", href: "/dashboard/sales", icon: ShoppingBag, group: "main" },
  { label: "Produits", href: "/dashboard/products", icon: Package, group: "main" },
  { label: "Clients", href: "/dashboard/customers", icon: Users, group: "main" },
  { label: "Revenus", href: "/dashboard/revenue", icon: DollarSign, group: "main" },
  { label: "Analytiques", href: "/dashboard/analytics", icon: BarChart3, group: "growth" },
  { label: "Marketing", href: "/dashboard/marketing", icon: Megaphone, group: "growth" },
  { label: "Studio Pub", href: "/dashboard/ads-studio", icon: Zap, group: "growth", badge: "Nouveau", badgeVariant: "new", badgeTooltip: "Générez des créatives Facebook Ads + ciblage par IA." },
  { label: "AI Factory", href: "/dashboard/factory", icon: Factory, group: "growth", badge: "Premium", badgeVariant: "hot", badgeTooltip: "L'usine à produits digitaux : passez de l'idée au profit en 15 minutes." },
  { label: "Affiliation", href: "/dashboard/affiliation", icon: Sparkles, group: "growth" },
  { label: "Paramètres", href: "/dashboard/settings", icon: Settings, group: "system" },
];

export const ADMIN_NAV: SidebarItem[] = [
  { label: "Accueil", href: "/admin", icon: Home, group: "main" },
  { label: "Commandes", href: "/admin?tab=orders", icon: ShoppingBag, group: "main" },
  { label: "Produits", href: "/admin?tab=products", icon: Package, group: "main" },
  { label: "Témoignages", href: "/admin?tab=testimonials", icon: MessageSquare, group: "main" },
  { label: "Vendeurs", href: "/admin?tab=vendors", icon: Store, group: "main" },
  { label: "Sécurité & rôles", href: "/admin?tab=security", icon: ShieldCheck, group: "system" },
  { label: "Analytiques", href: "/admin?tab=analytics", icon: BarChart3, group: "growth" },
  { label: "Paramètres", href: "/admin?tab=settings", icon: Settings, group: "system" },
];

const GROUP_LABELS: Record<string, string> = {
  main: "Pilotage",
  growth: "Croissance",
  system: "Système",
};

const BADGE_LEGEND: { variant: BadgeVariant; label: string; description: string }[] = [
  { variant: "new", label: "Nouveau", description: "Section ou produit ajouté récemment (≤ 7 jours)." },
  { variant: "hot", label: "Hot", description: "Forte activité en cours — opportunité à saisir." },
  { variant: "count", label: "Compteur", description: "Nombre d'éléments à traiter (ex: commandes en attente)." },
];

const badgeStyles = (variant?: BadgeVariant) =>
  variant === "hot"
    ? "bg-gradient-to-r from-destructive to-accent text-destructive-foreground shadow-[0_0_10px_hsl(var(--destructive)/0.4)]"
    : variant === "new"
    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
    : "bg-foreground text-background";

const renderBadge = (badge: string, variant: BadgeVariant | undefined, tooltip?: string) => {
  const node = (
    <span
      className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide cursor-help ${badgeStyles(variant)}`}
    >
      {badge}
    </span>
  );
  if (!tooltip) return node;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{node}</TooltipTrigger>
      <TooltipContent side="right" className="max-w-[220px] text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
};

/** Compute live, data-driven badges for the vendor nav. */
const useVendorLiveBadges = (enabled: boolean) => {
  const { data: vendor } = useCurrentVendor();
  const { data: products = [] } = useVendorProducts(enabled ? vendor?.id : undefined);
  const productIds = useMemo(() => products.map((p) => p.id), [products]);
  const { data: orders = [] } = useVendorOrders(enabled ? productIds : []);

  return useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentProductsCount = (products as any[]).filter(
      (p) => p.created_at && new Date(p.created_at).getTime() > sevenDaysAgo,
    ).length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const recentOrders = orders.filter(
      (o) => new Date(o.created_at).getTime() > sevenDaysAgo,
    ).length;

    const map: Record<string, { badge: string; variant: BadgeVariant; tooltip: string }> = {};
    if (pendingOrders > 0) {
      map["/dashboard/sales"] = {
        badge: String(pendingOrders),
        variant: "count",
        tooltip: `${pendingOrders} commande${pendingOrders > 1 ? "s" : ""} en attente de confirmation.`,
      };
    }
    if (recentProductsCount > 0) {
      map["/dashboard/products"] = {
        badge: "Nouveau",
        variant: "new",
        tooltip: `${recentProductsCount} produit${recentProductsCount > 1 ? "s" : ""} ajouté${recentProductsCount > 1 ? "s" : ""} ces 7 derniers jours.`,
      };
    }
    if (recentOrders >= 5) {
      map["/dashboard/revenue"] = {
        badge: "Hot",
        variant: "hot",
        tooltip: `${recentOrders} ventes ces 7 derniers jours — votre boutique est en feu 🔥`,
      };
    }
    map["/dashboard/marketing"] = map["/dashboard/marketing"] ?? {
      badge: "Nouveau",
      variant: "new",
      tooltip: "Nouvelle section : campagnes, codes promo et automation.",
    };
    map["/dashboard/affiliation"] = map["/dashboard/affiliation"] ?? {
      badge: "Hot",
      variant: "hot",
      tooltip: "Programme d'affiliation premium — recrutez des ambassadeurs.",
    };
    return map;
  }, [products, orders]);
};

const DashboardLayout = ({ variant, title, shopName, shopUrl, children }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const baseItems = variant === "vendor" ? VENDOR_NAV : ADMIN_NAV;
  const liveBadges = useVendorLiveBadges(variant === "vendor");
  const items: SidebarItem[] = useMemo(
    () =>
      baseItems.map((it) => {
        const live = liveBadges[it.href];
        if (live) {
          return { ...it, badge: live.badge, badgeVariant: live.variant, badgeTooltip: live.tooltip };
        }
        return it;
      }),
    [baseItems, liveBadges],
  );

  const initials = (user?.email ?? "U").slice(0, 2).toUpperCase();
  const fullPath = location.pathname + location.search;
  const currentItem = items.find((i) => fullPath === i.href);
  const pageTitle = title ?? currentItem?.label ?? "Aperçu";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const groupedItems = items.reduce<Record<string, SidebarItem[]>>((acc, item) => {
    const g = item.group ?? "main";
    (acc[g] ??= []).push(item);
    return acc;
  }, {});

  const Sidebar = (
    <aside className="relative flex h-full w-[260px] shrink-0 flex-col border-r border-border/80 bg-gradient-to-b from-card via-card to-background/40 overflow-hidden backdrop-blur-xl">
      {/* Decorative ambient glows */}
      <div className="pointer-events-none absolute -top-32 -left-16 h-56 w-56 rounded-full bg-primary/10 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-1/3 -right-16 h-56 w-56 rounded-full bg-accent/10 blur-[80px]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

      {/* Brand */}
      <div className="relative flex h-16 items-center gap-2 border-b border-border/50 px-5">
        <Link to="/" className="group flex items-center gap-1.5 text-base font-bold tracking-tight transition">
          <span className="text-foreground group-hover:text-primary transition-colors">MIND</span>
          <span className="text-gradient-brand animate-pulse drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]">✦</span>
          <span className="text-accent group-hover:text-primary transition-colors">HUB</span>
        </Link>
        <span className="ml-auto rounded-md border border-primary/30 bg-gradient-to-r from-primary/15 to-accent/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary shadow-[0_0_10px_hsl(var(--primary)/0.15)]">
          {variant === "admin" ? "Admin" : "Pro"}
        </span>
      </div>

      {/* Shop selector */}
      {shopName && (
        <button
          onClick={() => shopUrl && navigate(shopUrl)}
          className="group relative mx-3 mt-3 flex items-center gap-2.5 rounded-xl border border-border/70 bg-background/50 p-2.5 text-left transition-all hover:border-primary/50 hover:bg-background hover:shadow-[0_4px_24px_-4px_hsl(var(--primary)/0.25)] hover:-translate-y-px"
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground shadow-md ring-1 ring-primary/20">
            {shopName.slice(0, 2).toUpperCase()}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500 shadow-[0_0_6px_hsl(142_76%_45%/0.6)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">{shopName}</p>
            <p className="truncate text-[10px] text-muted-foreground flex items-center gap-1">
              <span className="inline-block h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
              En ligne
            </p>
          </div>
          <ChevronDown size={14} className="text-muted-foreground transition-transform group-hover:translate-y-0.5 group-hover:text-primary" />
        </button>
      )}

      {/* Quick action */}
      {variant === "vendor" && (
        <div className="px-3 mt-3">
          <Button
            asChild
            size="sm"
            className="group relative w-full overflow-hidden bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] text-primary-foreground shadow-md hover:shadow-[0_0_24px_hsl(var(--primary)/0.45)] hover:bg-[position:100%_0] transition-all duration-500"
          >
            <Link to="/dashboard/products/new" onClick={() => setMobileOpen(false)}>
              <Plus size={14} className="mr-1 transition-transform group-hover:rotate-90" />
              Nouveau produit
            </Link>
          </Button>
        </div>
      )}

      {/* Nav */}
      <nav className="relative flex-1 space-y-5 overflow-y-auto px-3 py-4 mt-2 [scrollbar-width:thin] [scrollbar-color:hsl(var(--border))_transparent]">
        {Object.entries(groupedItems).map(([group, groupItems], idx) => (
          <div key={group} className="relative">
            {idx > 0 && (
              <div className="absolute -top-2.5 left-3 right-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            )}
            <div className="px-3 mb-2 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60">
                {GROUP_LABELS[group] ?? group}
              </p>
              {idx === 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="rounded-full p-0.5 text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition"
                      aria-label="Légende des badges"
                    >
                      <Info size={11} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent side="right" align="start" className="w-64 p-3">
                    <p className="text-xs font-semibold mb-2 text-foreground">Légende des badges</p>
                    <ul className="space-y-2">
                      {BADGE_LEGEND.map((b) => (
                        <li key={b.variant} className="flex items-start gap-2">
                          <span className={`mt-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${badgeStyles(b.variant)}`}>
                            {b.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground leading-snug">
                            {b.description}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 pt-2 border-t border-border text-[10px] text-muted-foreground/80">
                      Les badges sont mis à jour automatiquement selon vos données en temps réel.
                    </p>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <div className="space-y-0.5">
              {groupItems.map((item) => {
                const Icon = item.icon;
                const active = fullPath === item.href;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                      active
                        ? "bg-gradient-to-r from-primary/20 via-accent/10 to-transparent text-foreground font-semibold shadow-[inset_0_1px_0_hsl(var(--primary)/0.15)]"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:translate-x-0.5"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full bg-gradient-to-b from-primary to-accent shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
                    )}
                    <span
                      className={`relative flex h-7 w-7 items-center justify-center rounded-md transition-all ${
                        active
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground/80 group-hover:bg-muted group-hover:text-foreground"
                      }`}
                    >
                      <Icon
                        size={15}
                        className={`transition-transform duration-200 ${
                          active ? "scale-110" : "group-hover:scale-110"
                        }`}
                      />
                    </span>
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && renderBadge(item.badge, item.badgeVariant, item.badgeTooltip)}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="relative space-y-0.5 border-t border-border/50 p-3 bg-background/30">
        <Link
          to="/faq"
          className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <HelpCircle size={15} className="transition-transform group-hover:rotate-12" />
          Centre d'aide
        </Link>
        <button
          onClick={handleSignOut}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut size={15} className="transition-transform group-hover:-translate-x-0.5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
        {/* Desktop sidebar */}
        <div className="hidden md:block sticky top-0 h-screen">{Sidebar}</div>

        {/* Mobile sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in">
            <div
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative animate-slide-in-right">{Sidebar}</div>
          </div>
        )}

        {/* Main */}
        <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
          {/* Topbar */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-3 backdrop-blur-xl sm:gap-3 sm:px-6">
            <button
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={18} />
            </button>

            <div className="min-w-0 flex flex-col">
              <h1 className="truncate text-base font-bold text-foreground sm:text-lg leading-tight">
                {pageTitle}
              </h1>
              <p className="hidden sm:block text-[10px] text-muted-foreground">
                {variant === "admin" ? "Espace administration" : "Tableau de bord vendeur"}
              </p>
            </div>

            {/* Search */}
            <div className="relative ml-auto hidden max-w-md flex-1 sm:flex">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher…"
                className="w-full rounded-full border border-border bg-muted/40 py-2 pl-9 pr-12 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                ⌘K
              </kbd>
            </div>

            <div className="ml-auto flex items-center gap-1.5 sm:ml-0 sm:gap-2">
              {shopUrl && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex border-border/60 hover:border-primary/40 hover:bg-primary/5">
                      <Link to={shopUrl}>
                        <ExternalLink size={14} className="mr-1" /> Ma boutique
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Voir la boutique publique</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleTheme}
                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    aria-label="Changer le thème"
                  >
                    {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{theme === "dark" ? "Mode clair" : "Mode sombre"}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="relative rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
                    <Bell size={16} />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive ring-2 ring-background animate-pulse" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground shadow-md ring-2 ring-background hover:ring-primary/30 transition">
                    {initials}
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-emerald-500" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{user?.email}</TooltipContent>
              </Tooltip>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 animate-fade-in [scrollbar-width:thin] [scrollbar-color:hsl(var(--border))_transparent]">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DashboardLayout;
