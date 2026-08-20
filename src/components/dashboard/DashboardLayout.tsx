import { createContext, useContext, useMemo, type ReactNode } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  ArrowDownToLine,
  CircleUserRound,
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
  WalletCards,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type BadgeVariant = "count";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeVariant?: BadgeVariant;
  group?: "main" | "more";
};

export type DashboardRouteMeta = {
  title: string;
  navHref?: string;
  matches: (pathname: string, search: string) => boolean;
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
  { label: "Analytiques", href: "/dashboard/analytics", icon: BarChart3, group: "main" },
  { label: "Revenus", href: "/dashboard/revenue", icon: WalletCards, group: "more" },
  { label: "Messages", href: "/dashboard/messages", icon: MessageSquare, group: "more" },
  { label: "Retraits", href: "/dashboard/payouts", icon: ArrowDownToLine, group: "more" },
  { label: "Profil & Boutique", href: "/dashboard/settings", icon: Settings, group: "more" },
];

export const ADMIN_NAV: SidebarItem[] = [
  { label: "Accueil", href: "/admin", icon: Home, group: "main" },
  { label: "Commandes", href: "/admin?tab=orders", icon: ShoppingBag, group: "main" },
  { label: "Produits", href: "/admin?tab=products", icon: Package, group: "main" },
  { label: "Vendeurs", href: "/admin?tab=vendors", icon: Store, group: "main" },
  { label: "Analytiques", href: "/admin?tab=analytics", icon: BarChart3, group: "main" },
  { label: "Messages", href: "/admin?tab=messages", icon: MessageSquare, group: "more" },
  { label: "Utilisateurs", href: "/admin?tab=users", icon: Users, group: "more" },
  { label: "API Manager", href: "/admin?tab=api-manager", icon: Zap, group: "more" },
  { label: "Logs d'audit", href: "/admin?tab=logs", icon: Info, group: "more" },
  { label: "Sécurité", href: "/admin?tab=security", icon: ShieldCheck, group: "more" },
  { label: "Paramètres", href: "/admin?tab=settings", icon: Settings, group: "more" },
];

const GROUP_LABELS: Record<string, string> = {
  main: "Principal",
  more: "Plus",
};

const VENDOR_ROUTE_META: DashboardRouteMeta[] = [
  { title: "Accueil", navHref: "/dashboard", matches: (pathname) => pathname === "/dashboard" },
  { title: "Nouveau produit", navHref: "/dashboard/products", matches: (pathname) => pathname === "/dashboard/new-product" },
  { title: "Modifier le produit", navHref: "/dashboard/products", matches: (pathname) => pathname.startsWith("/dashboard/edit-product/") },
  { title: "Ventes", navHref: "/dashboard/sales", matches: (pathname) => pathname === "/dashboard/sales" },
  { title: "Produits", navHref: "/dashboard/products", matches: (pathname) => pathname === "/dashboard/products" },
  { title: "Clients", navHref: "/dashboard/customers", matches: (pathname) => pathname === "/dashboard/customers" },
  { title: "Revenus", navHref: "/dashboard/revenue", matches: (pathname) => pathname === "/dashboard/revenue" },
  { title: "Messages", navHref: "/dashboard/messages", matches: (pathname) => pathname === "/dashboard/messages" },
  { title: "Analytiques", navHref: "/dashboard/analytics", matches: (pathname) => pathname === "/dashboard/analytics" },
  { title: "Retraits", navHref: "/dashboard/payouts", matches: (pathname) => pathname === "/dashboard/payouts" },
  { title: "Profil & Boutique", navHref: "/dashboard/settings", matches: (pathname) => pathname === "/dashboard/settings" },
];

const ADMIN_TAB_META: Record<string, DashboardRouteMeta> = {
  orders: { title: "Commandes", navHref: "/admin?tab=orders", matches: () => true },
  products: { title: "Produits", navHref: "/admin?tab=products", matches: () => true },
  vendors: { title: "Vendeurs", navHref: "/admin?tab=vendors", matches: () => true },
  analytics: { title: "Analytiques", navHref: "/admin?tab=analytics", matches: () => true },
  messages: { title: "Messages", navHref: "/admin?tab=messages", matches: () => true },
  users: { title: "Utilisateurs", navHref: "/admin?tab=users", matches: () => true },
  "api-manager": { title: "API Manager", navHref: "/admin?tab=api-manager", matches: () => true },
  logs: { title: "Logs d'audit", navHref: "/admin?tab=logs", matches: () => true },
  security: { title: "Sécurité", navHref: "/admin?tab=security", matches: () => true },
  settings: { title: "Paramètres", navHref: "/admin?tab=settings", matches: () => true },
};

function getDashboardRouteMeta(variant: "vendor" | "admin", pathname: string, search: string) {
  if (variant === "vendor") return VENDOR_ROUTE_META.find((route) => route.matches(pathname, search));
  if (pathname !== "/admin") return undefined;
  const tab = new URLSearchParams(search).get("tab");
  return tab ? ADMIN_TAB_META[tab] : { title: "Accueil", navHref: "/admin", matches: () => true };
}

function useVendorLiveBadges(enabled: boolean) {
  const { data: vendor } = useCurrentVendor();
  const { data: products = [] } = useVendorProducts(enabled ? vendor?.id : undefined);
  const productIds = useMemo(() => (Array.isArray(products) ? products.map((product) => product.id) : []), [products]);
  const { data: orders = [] } = useVendorOrders(enabled && productIds.length ? vendor?.id : undefined, productIds);

  return useMemo(() => {
    if (!enabled || !Array.isArray(orders)) return {} as Record<string, string>;
    const pending = orders.filter((order) => order?.status === "pending").length;
    return pending > 0 ? { "/dashboard/sales": String(pending) } : {};
  }, [enabled, orders]);
}

function isActiveRoute(currentPath: string, href: string) {
  const [pathname, search = ""] = currentPath.split("?");
  const [hrefPathname, hrefSearch = ""] = href.split("?");
  if (hrefSearch) {
    if (pathname !== hrefPathname) return false;
    const expected = new URLSearchParams(hrefSearch);
    const current = new URLSearchParams(search);
    return [...expected.entries()].every(([key, value]) => current.get(key) === value);
  }
  if (href === "/dashboard" || href === "/admin") return pathname === href && !search;
  return pathname === href || (href !== "/dashboard" && href !== "/admin" && pathname.startsWith(`${href}/`));
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

function DashboardNavigation({ variant, items, currentPath, activeHref }: {
  variant: "vendor" | "admin";
  items: SidebarItem[];
  currentPath: string;
  activeHref?: string;
}) {
  const { collapsed } = useAnimatedSidebarPanel();
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
          <Button asChild size="sm" className={collapsed ? "size-10 justify-center px-0" : "w-full justify-start"}>
            <Link to="/dashboard/new-product" aria-label="Nouveau produit" title={collapsed ? "Nouveau produit" : undefined}>
              <Plus className="size-4" aria-hidden="true" />
              <span className={collapsed ? "sr-only" : undefined}>Nouveau produit</span>
            </Link>
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
                  const active = item.href === activeHref || isActiveRoute(currentPath, item.href);
                  return (
                    <AnimatedSidebarMenuItem key={item.href}>
                      <AnimatedSidebarMenuButton href={item.href} icon={<Icon className="size-4" aria-hidden="true" />} isActive={active} badge={item.badge ? <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">{item.badge}</span> : undefined}>{item.label}</AnimatedSidebarMenuButton>
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
  const routeMeta = getDashboardRouteMeta(variant, location.pathname, location.search);
  const pageTitle = title ?? routeMeta?.title ?? "Aperçu";
  const initials = (user?.email ?? "U").slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isNestedInPersistentShell) return <>{children}</>;

  return (
    <AnimatedSidebarProvider>
      <AnimatedSidebar variant="sidebar" collapsible="icon">
        <DashboardNavigation variant={variant} items={items} currentPath={currentPath} activeHref={routeMeta?.navHref} />
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="grid size-9 place-items-center rounded-full border border-border bg-muted text-xs font-semibold transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Ouvrir le menu du compte ${user?.email ?? "utilisateur"}`}>
                  {initials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user?.email ?? "Mon compte"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/mon-compte"><CircleUserRound className="mr-2 size-4" aria-hidden="true" /> Mon compte</Link>
                </DropdownMenuItem>
                {shopUrl ? <DropdownMenuItem asChild><Link to={shopUrl}><Store className="mr-2 size-4" aria-hidden="true" /> Ma boutique</Link></DropdownMenuItem> : null}
                <DropdownMenuItem asChild>
                  <Link to={variant === "admin" ? "/admin?tab=settings" : "/dashboard/settings"}><Settings className="mr-2 size-4" aria-hidden="true" /> Paramètres</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 size-4" aria-hidden="true" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-5 sm:px-5 lg:px-8 lg:py-7" tabIndex={-1}>
          {isDemo ? <div className="mx-auto mb-5 max-w-7xl rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground" role="status"><strong className="text-foreground">Mode démo.</strong> Les données sont fictives et les actions sensibles sont désactivées.</div> : null}
          <PageTransitionProvider>
            <div className="mx-auto max-w-7xl">{children}</div>
          </PageTransitionProvider>
        </div>
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
