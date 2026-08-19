import { createContext, useContext, useMemo, type ReactNode } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  CreditCard,
  DollarSign,
  ExternalLink,
  HelpCircle,
  Home,
  LogOut,
  MessageSquare,
  Package,
  Plus,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Users,
  Zap,
  Info,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import { VendorNotificationBell } from "@/components/dashboard/VendorNotificationBell";
import {
  AnimatedSidebar,
  AnimatedSidebarContent,
  AnimatedSidebarFooter,
  AnimatedSidebarGroup,
  AnimatedSidebarGroupContent,
  AnimatedSidebarGroupLabel,
  AnimatedSidebarHeader,
  AnimatedSidebarInset,
  AnimatedSidebarMenu,
  AnimatedSidebarMenuButton,
  AnimatedSidebarMenuItem,
  AnimatedSidebarProvider,
  AnimatedSidebarTrigger,
  useAnimatedSidebarPanel,
} from "@/components/motion/animated-sidebar";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentVendor, useVendorProducts } from "@/hooks/useVendors";
import { useVendorOrders } from "@/hooks/useVendorOrders";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import MindHubsLogo from "@/components/brand/MindHubsLogo";

export type BadgeVariant = "count";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: BadgeVariant;
  group?: "main" | "growth" | "system" | "more";
};

interface DashboardLayoutProps {
  variant: "vendor" | "admin";
  title?: string;
  shopName?: string;
  shopUrl?: string;
  children: ReactNode;
}

const PersistentShellContext = createContext(false);

export const VENDOR_NAV: SidebarItem[] = [
  { label: "Accueil", href: "/dashboard", icon: Home, group: "main" },
  { label: "Ventes", href: "/dashboard/sales", icon: ShoppingBag, group: "main" },
  { label: "Produits", href: "/dashboard/products", icon: Package, group: "main" },
  { label: "Clients", href: "/dashboard/customers", icon: Users, group: "main" },
  { label: "Revenus", href: "/dashboard/revenue", icon: DollarSign, group: "main" },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare, group: "main" },
  { label: "Analytiques", href: "/dashboard/analytics", icon: BarChart3, group: "growth" },
  { label: "Abonnement", href: "/dashboard/abonnement", icon: CreditCard, group: "more" },
  { label: "Retraits", href: "/dashboard/payouts", icon: DollarSign, group: "more" },
  { label: "Profil & Boutique", href: "/dashboard/settings", icon: Settings, group: "more" },
];

export const ADMIN_NAV: SidebarItem[] = [
  { label: "Accueil", href: "/admin", icon: Home, group: "main" },
  { label: "Commandes", href: "/admin?tab=orders", icon: ShoppingBag, group: "main" },
  { label: "Messages", href: "/admin?tab=messages", icon: MessageSquare, group: "main" },
  { label: "Produits", href: "/admin?tab=products", icon: Package, group: "main" },
  { label: "Vendeurs", href: "/admin?tab=vendors", icon: Store, group: "main" },
  { label: "Abonnements", href: "/admin?tab=subscriptions", icon: CreditCard, group: "main" },
  { label: "Utilisateurs", href: "/admin?tab=users", icon: Users, group: "main" },
  { label: "API Manager", href: "/admin?tab=api-manager", icon: Zap, group: "system" },
  { label: "Logs d'audit", href: "/admin?tab=logs", icon: Info, group: "system" },
  { label: "Sécurité", href: "/admin?tab=security", icon: ShieldCheck, group: "system" },
  { label: "Analytiques", href: "/admin?tab=analytics", icon: BarChart3, group: "growth" },
  { label: "Paramètres", href: "/admin?tab=settings", icon: Settings, group: "system" },
];

const GROUP_LABELS: Record<string, string> = {
  main: "Pilotage",
  growth: "Croissance",
  system: "Système",
  more: "Plus",
};

function useVendorLiveBadges(enabled: boolean) {
  const { data: vendor } = useCurrentVendor();
  const { data: products = [] } = useVendorProducts(enabled ? vendor?.id : undefined);
  const productIds = useMemo(() => (Array.isArray(products) ? products.map((product) => product.id) : []), [products]);
  const { data: orders = [] } = useVendorOrders(enabled && productIds.length ? vendor?.id : undefined, productIds, 0.1);

  return useMemo(() => {
    if (!enabled || !Array.isArray(orders)) return {} as Record<string, string>;
    const pending = orders.filter((order) => order?.status === "pending").length;
    return pending > 0 ? { "/dashboard/sales": String(pending) } : {};
  }, [enabled, orders]);
}

function isActiveRoute(currentPath: string, href: string) {
  if (href.includes("?")) return currentPath === href;
  return currentPath === href || (href !== "/dashboard" && currentPath.startsWith(`${href}/`));
}

function SidebarBrand({ variant }: { variant: "vendor" | "admin" }) {
  const { collapsed } = useAnimatedSidebarPanel();

  return (
    <div className="flex items-center gap-2">
      <MindHubsLogo showWordmark={!collapsed} size="sm" className="min-w-0" />
      {!collapsed ? <span className="ml-auto rounded-md border border-sidebar-border px-2 py-1 text-[10px] font-medium text-muted-foreground">{variant === "admin" ? "Admin" : "Vendeur"}</span> : null}
    </div>
  );
}

function DashboardNavigation({ variant, items, currentPath, shopUrl, onSignOut }: {
  variant: "vendor" | "admin";
  items: SidebarItem[];
  currentPath: string;
  shopName?: string;
  shopUrl?: string;
  onSignOut: () => void;
}) {
  const groups = items.reduce<Record<string, SidebarItem[]>>((result, item) => {
    const group = item.group ?? "main";
    (result[group] ??= []).push(item);
    return result;
  }, {});

  return (
    <>
      <AnimatedSidebarHeader>
        <SidebarBrand variant={variant} />
        {variant === "vendor" ? (
          <Button asChild size="sm" className="w-full justify-start">
            <Link to="/dashboard/new-product"><Plus className="size-4" aria-hidden="true" /> Nouveau produit</Link>
          </Button>
        ) : null}
      </AnimatedSidebarHeader>

      <AnimatedSidebarContent>
        {Object.entries(groups).map(([group, groupItems]) => (
          <AnimatedSidebarGroup key={group}>
            <AnimatedSidebarGroupLabel>{GROUP_LABELS[group] ?? group}</AnimatedSidebarGroupLabel>
            <AnimatedSidebarGroupContent>
              <AnimatedSidebarMenu>
                {groupItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveRoute(currentPath, item.href);
                  return (
                    <AnimatedSidebarMenuItem key={item.href}>
                      <AnimatedSidebarMenuButton href={item.href} icon={<Icon className="size-4" aria-hidden="true" />} isActive={active} badge={item.badge ? <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">{item.badge}</span> : undefined} />
                    </AnimatedSidebarMenuItem>
                  );
                })}
              </AnimatedSidebarMenu>
            </AnimatedSidebarGroupContent>
          </AnimatedSidebarGroup>
        ))}
      </AnimatedSidebarContent>

      <AnimatedSidebarFooter>
        <AnimatedSidebarMenu>
          <AnimatedSidebarMenuItem>
            <AnimatedSidebarMenuButton href="/faq" icon={<HelpCircle className="size-4" aria-hidden="true" />}>Centre d'aide</AnimatedSidebarMenuButton>
          </AnimatedSidebarMenuItem>
          <AnimatedSidebarMenuItem>
            <AnimatedSidebarMenuButton icon={<LogOut className="size-4" aria-hidden="true" />} onSelect={onSignOut}>Déconnexion</AnimatedSidebarMenuButton>
          </AnimatedSidebarMenuItem>
        </AnimatedSidebarMenu>
      </AnimatedSidebarFooter>
    </>
  );
}

const DashboardLayout = ({ variant, title, shopName, shopUrl, children }: DashboardLayoutProps) => {
  const isNestedInPersistentShell = useContext(PersistentShellContext);
  const { signOut, user, isDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentVendor } = useCurrentVendor();
  const baseItems = variant === "vendor" ? VENDOR_NAV : ADMIN_NAV;
  const liveBadges = useVendorLiveBadges(variant === "vendor");
  const items = useMemo(() => baseItems.map((item) => ({ ...item, badge: liveBadges[item.href] })), [baseItems, liveBadges]);
  const currentPath = `${location.pathname}${location.search}`;
  const currentItem = items.find((item) => isActiveRoute(currentPath, item.href));
  const pageTitle = title ?? currentItem?.label ?? "Aperçu";
  const initials = (user?.email ?? "U").slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isNestedInPersistentShell) return <>{children}</>;

  return (
    <AnimatedSidebarProvider>
      <AnimatedSidebar variant="sidebar" collapsible="icon">
        <DashboardNavigation variant={variant} items={items} currentPath={currentPath} shopUrl={shopUrl} onSignOut={handleSignOut} />
      </AnimatedSidebar>

      <AnimatedSidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/80 bg-background/90 px-3 backdrop-blur-xl sm:px-5">
          <AnimatedSidebarTrigger />
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold sm:text-base">{pageTitle}</h1>
            <p className="hidden text-xs text-muted-foreground sm:block">{variant === "admin" ? "Espace administration" : "Tableau de bord vendeur"}</p>
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {shopUrl ? <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex"><Link to={shopUrl}><ExternalLink className="size-3.5" /> Ma boutique</Link></Button> : null}
            <ThemeToggle />
            {variant === "admin" ? <NotificationBell /> : currentVendor ? <VendorNotificationBell vendorId={(currentVendor as { id: string }).id} /> : null}
            <button type="button" className="grid size-9 place-items-center rounded-full border border-border bg-muted text-xs font-semibold transition-colors hover:bg-accent" aria-label={`Compte ${user?.email ?? "utilisateur"}`}>
              {initials}
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-5 sm:px-5 lg:px-8 lg:py-7" tabIndex={-1}>
          {isDemo ? <div className="mx-auto mb-5 max-w-7xl rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground" role="status"><strong className="text-foreground">Mode démo.</strong> Les données sont fictives et les actions sensibles sont désactivées.</div> : null}
          <PageTransitionProvider>
            <div className="mx-auto max-w-7xl">{children}</div>
          </PageTransitionProvider>
        </main>
      </AnimatedSidebarInset>
    </AnimatedSidebarProvider>
  );
};

export function PersistentDashboardShell({ variant }: { variant: "vendor" | "admin" }) {
  const { data: vendor } = useCurrentVendor();
  const shopName = variant === "vendor" ? vendor?.shop_name : undefined;
  const shopUrl = variant === "vendor" && vendor?.username ? `/store/${vendor.username}` : undefined;

  return (
    <DashboardLayout variant={variant} shopName={shopName} shopUrl={shopUrl}>
      <PersistentShellContext.Provider value>
        <Outlet />
      </PersistentShellContext.Provider>
    </DashboardLayout>
  );
}

export default DashboardLayout;
