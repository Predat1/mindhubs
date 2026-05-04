import { useState, useMemo, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, ShoppingBag, Package, Users, DollarSign, BarChart3, Megaphone,
  Sparkles, Settings, HelpCircle, LogOut, Search, Bell, Plus, ExternalLink,
  Menu, ChevronDown, Store, MessageSquare, ShieldCheck, Sun, Moon, Zap, Info,
  Factory, CreditCard, Video,
} from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { VendorNotificationBell } from "@/components/dashboard/VendorNotificationBell";
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
  { label: "Creator Lab", href: "/dashboard/creator-lab", icon: Sparkles, group: "growth", badge: "Hot", badgeVariant: "hot", badgeTooltip: "Découvrez, validez et créez vos produits avec l'IA." },
  { label: "Marketing", href: "/dashboard/marketing", icon: Megaphone, group: "growth" },
  { label: "Studio Pub", href: "/dashboard/ads-studio", icon: Zap, group: "growth", badge: "Nouveau", badgeVariant: "new", badgeTooltip: "Générez des créatives Facebook Ads + ciblage par IA." },
  { label: "Cinema Studio", href: "/dashboard/cinema-studio", icon: Video, group: "growth", badge: "VIP", badgeVariant: "hot", badgeTooltip: "Générez des vidéos ultra-réalistes (Sora, Veo, Kling, Avatars)." },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare, group: "main", badge: "2", badgeVariant: "count" },
  { label: "Abonnement", href: "/dashboard/abonnement", icon: CreditCard, group: "system" },
  { label: "Retraits", href: "/dashboard/payouts", icon: DollarSign, group: "system" },
  { label: "Profil & Boutique", href: "/dashboard/settings", icon: Settings, group: "system" },
];

export const ADMIN_NAV: SidebarItem[] = [
  { label: "Accueil", href: "/admin", icon: Home, group: "main" },
  { label: "Commandes", href: "/admin?tab=orders", icon: ShoppingBag, group: "main" },
  { label: "Produits", href: "/admin?tab=products", icon: Package, group: "main" },
  { label: "Vendeurs", href: "/admin?tab=vendors", icon: Store, group: "main" },
  { label: "Abonnements", href: "/admin?tab=subscriptions", icon: CreditCard, group: "main" },
  { label: "Utilisateurs", href: "/admin?tab=users", icon: Users, group: "main" },
  { label: "API Manager", href: "/admin?tab=api-manager", icon: Zap, group: "system", badge: "Power", badgeVariant: "hot" },
  { label: "Logs d'audit", href: "/admin?tab=logs", icon: Info, group: "system" },
  { label: "Sécurité", href: "/admin?tab=security", icon: ShieldCheck, group: "system" },
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
  const productIds = useMemo(() => (Array.isArray(products) ? products.map((p) => p.id) : []), [products]);
  const { data: orders = [] } = useVendorOrders(enabled && productIds.length > 0 ? vendor?.id : undefined, productIds);

  return useMemo(() => {
    const map: Record<string, { badge: string; variant: BadgeVariant; tooltip: string }> = {};
    if (!enabled || !Array.isArray(products) || !Array.isArray(orders)) return map;

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentProductsCount = products.filter(
      (p) => (p as any).created_at && new Date((p as any).created_at).getTime() > sevenDaysAgo,
    ).length;
    const pendingOrders = orders.filter((o) => o && o.status === "pending").length;
    const recentOrders = orders.filter(
      (o) => o && o.created_at && new Date(o.created_at).getTime() > sevenDaysAgo,
    ).length;

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
    
    // Static badge for new sections
    map["/dashboard/marketing"] = map["/dashboard/marketing"] ?? {
      badge: "Nouveau",
      variant: "new",
      tooltip: "Nouvelle section : campagnes, codes promo et automation.",
    };
    
    return map;
  }, [enabled, products, orders]);
};

const DashboardLayout = ({ variant, title, shopName, shopUrl, children }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // New state for collapse
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentVendor } = useCurrentVendor();

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
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const Sidebar = (
    <aside 
      className={`relative flex h-full flex-col border-r border-border/80 bg-gradient-to-b from-card via-card to-background/40 overflow-hidden backdrop-blur-xl transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[80px]' : 'w-[260px]'}`}
    >
      {/* Decorative ambient glows */}
      <div className="pointer-events-none absolute -top-32 -left-16 h-56 w-56 rounded-full bg-primary/10 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-1/3 -right-16 h-56 w-56 rounded-full bg-accent/10 blur-[80px]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

      {/* Brand */}
      <div className={`relative flex h-16 items-center gap-2 border-b border-border/50 px-5 ${isCollapsed ? 'justify-center px-0' : ''}`}>
        <Link to="/" className="group flex items-center gap-1.5 text-base font-bold tracking-tight transition">
          {!isCollapsed && <span className="text-foreground group-hover:text-primary transition-colors">MIND</span>}
          <span className="text-gradient-brand animate-pulse drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]">✦</span>
          {!isCollapsed && <span className="text-accent group-hover:text-primary transition-colors">HUB</span>}
        </Link>
        {!isCollapsed && (
          <span className="ml-auto rounded-md border border-primary/30 bg-gradient-to-r from-primary/15 to-accent/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary shadow-[0_0_10px_hsl(var(--primary)/0.15)]">
            {variant === "admin" ? "Admin" : "Pro"}
          </span>
        )}
      </div>

      {/* Shop selector */}
      {shopName && (
        <button
          onClick={() => shopUrl && navigate(shopUrl)}
          className={`group relative mx-3 mt-3 flex items-center gap-2.5 rounded-xl border border-border/70 bg-muted/20 dark:bg-background/50 p-2.5 text-left transition-all hover:border-primary/50 hover:bg-background hover:shadow-[0_4px_24px_-4px_hsl(var(--primary)/0.25)] hover:-translate-y-px ${isCollapsed ? 'justify-center mx-2 p-1.5' : ''}`}
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground shadow-md ring-1 ring-primary/20">
            {shopName.slice(0, 2).toUpperCase()}
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500 shadow-[0_0_6px_hsl(142_76%_45%/0.6)]" />
          </div>
          {!isCollapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">{shopName}</p>
                <p className="truncate text-[10px] text-muted-foreground flex items-center gap-1">
                  <span className="inline-block h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                  En ligne
                </p>
              </div>
              <ChevronDown size={14} className="text-muted-foreground transition-transform group-hover:translate-y-0.5 group-hover:text-primary" />
            </>
          )}
        </button>
      )}

      {/* Quick action */}
      {variant === "vendor" && (
        <div className={`px-3 mt-3 ${isCollapsed ? 'px-2' : ''}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                size={isCollapsed ? "icon" : "sm"}
                className="group relative w-full overflow-hidden bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] text-primary-foreground shadow-md hover:shadow-[0_0_24px_hsl(var(--primary)/0.45)] hover:bg-[position:100%_0] transition-all duration-500"
              >
                <Link to="/dashboard/new-product" onClick={() => setMobileOpen(false)}>
                  <Plus size={14} className={`${isCollapsed ? '' : 'mr-1'} transition-transform group-hover:rotate-90`} />
                  {!isCollapsed && "Nouveau produit"}
                </Link>
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Nouveau produit</TooltipContent>}
          </Tooltip>
        </div>
      )}

      {/* Nav */}
      <nav className="relative flex-1 space-y-5 overflow-y-auto px-3 py-4 mt-2 [scrollbar-width:thin] [scrollbar-color:hsl(var(--border))_transparent]">
        {Object.entries(groupedItems).map(([group, groupItems], idx) => (
          <div key={group} className="relative">
            {idx > 0 && !isCollapsed && (
              <div className="absolute -top-2.5 left-3 right-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            )}
            {!isCollapsed && (
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
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            )}
            <div className="space-y-0.5">
              {groupItems.map((item) => {
                const Icon = item.icon;
                const active = fullPath === item.href;
                return (
                  <Tooltip key={item.label} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                          active
                            ? "bg-gradient-to-r from-primary/20 via-accent/10 to-transparent text-foreground font-semibold shadow-[inset_0_1px_0_hsl(var(--primary)/0.15)]"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:translate-x-0.5"
                        } ${isCollapsed ? 'justify-center px-2' : ''}`}
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
                        {!isCollapsed && <span className="flex-1 truncate">{item.label}</span>}
                        {!isCollapsed && item.badge && renderBadge(item.badge, item.badgeVariant, item.badgeTooltip)}
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right" className="flex items-center gap-2">
                        {item.label}
                        {item.badge && renderBadge(item.badge, item.badgeVariant)}
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer Controls */}
      <div className="mt-auto border-t border-border/50 p-3 bg-background/30 space-y-1">
        <button
          onClick={toggleCollapse}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground mb-2"
        >
          {isCollapsed ? <ChevronDown className="rotate-[-90deg] transition-transform" size={15} /> : <ChevronDown className="rotate-90 transition-transform" size={15} />}
          {!isCollapsed && <span>Réduire le menu</span>}
        </button>

        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              to="/faq"
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <HelpCircle size={15} className="transition-transform group-hover:rotate-12" />
              {!isCollapsed && <span>Centre d'aide</span>}
            </Link>
          </TooltipTrigger>
          {isCollapsed && <TooltipContent side="right">Centre d'aide</TooltipContent>}
        </Tooltip>

        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={handleSignOut}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <LogOut size={15} className="transition-transform group-hover:-translate-x-0.5" />
              {!isCollapsed && <span>Déconnexion</span>}
            </button>
          </TooltipTrigger>
          {isCollapsed && <TooltipContent side="right">Déconnexion</TooltipContent>}
        </Tooltip>
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
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/95 dark:bg-background/80 px-3 backdrop-blur-xl sm:gap-3 sm:px-6">
            <button
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={18} />
            </button>

            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-bold text-foreground sm:text-lg leading-tight">
                  {pageTitle}
                </h1>
                {variant === "admin" && (
                  <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase tracking-tighter">
                    <span className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" />
                    Live
                  </div>
                )}
              </div>
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
                    <Link to={shopUrl} className="hidden sm:inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border/60 bg-transparent hover:bg-primary/5 hover:border-primary/40 h-9 px-3">
                      <ExternalLink size={14} className="mr-1" /> Ma boutique
                    </Link>
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
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 mr-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">Système Opérationnel</span>
              </div>
              
              {variant === "admin" ? (
                <NotificationBell />
              ) : (
                currentVendor && <VendorNotificationBell vendorId={(currentVendor as any).id} />
              )}
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
      {/* Floating Support Button for Vendors */}
      {variant === "vendor" && (
        <div className="fixed bottom-6 right-6 z-50">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <a 
                  href="https://wa.me/2250000000000" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_0_20px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all group"
                >
                  <MessageSquare size={24} className="group-hover:animate-pulse" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-popover border-border text-popover-foreground font-black uppercase text-[10px] px-4 py-2 shadow-xl">
                Besoin d'aide ? WhatsApp
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </TooltipProvider>
  );
};

export default DashboardLayout;
