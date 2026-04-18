import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, ShoppingBag, Package, Users, DollarSign, BarChart3, Megaphone,
  Sparkles, Settings, HelpCircle, LogOut, Search, Bell, Plus, ExternalLink,
  Menu, X, ChevronDown, Store, MessageSquare, ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

export type SidebarItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

interface DashboardLayoutProps {
  variant: "vendor" | "admin";
  title?: string;
  shopName?: string;
  shopUrl?: string;
  children: ReactNode;
}

export const VENDOR_NAV: SidebarItem[] = [
  { label: "Accueil", href: "/dashboard", icon: Home },
  { label: "Ventes", href: "/dashboard/sales", icon: ShoppingBag },
  { label: "Produits", href: "/dashboard/products", icon: Package },
  { label: "Clients", href: "/dashboard/customers", icon: Users },
  { label: "Revenus", href: "/dashboard/revenue", icon: DollarSign },
  { label: "Analytiques", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Marketing", href: "/dashboard/marketing", icon: Megaphone },
  { label: "Affiliation", href: "/dashboard/affiliation", icon: Sparkles },
  { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

export const ADMIN_NAV: SidebarItem[] = [
  { label: "Accueil", href: "/admin", icon: Home },
  { label: "Commandes", href: "/admin?tab=orders", icon: ShoppingBag },
  { label: "Produits", href: "/admin?tab=products", icon: Package },
  { label: "Témoignages", href: "/admin?tab=testimonials", icon: MessageSquare },
  { label: "Vendeurs", href: "/admin?tab=vendors", icon: Store },
  { label: "Sécurité & rôles", href: "/admin?tab=security", icon: ShieldCheck },
  { label: "Analytiques", href: "/admin?tab=analytics", icon: BarChart3 },
  { label: "Paramètres", href: "/admin?tab=settings", icon: Settings },
];

const DashboardLayout = ({ variant, title, shopName, shopUrl, children }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const items = variant === "vendor" ? VENDOR_NAV : ADMIN_NAV;
  const initials = (user?.email ?? "U").slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const Sidebar = (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-card">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <Link to="/" className="flex items-center gap-2 text-base font-bold tracking-tight">
          <span className="text-foreground">MIND</span>
          <span className="text-gradient-brand">✦</span>
          <span className="text-accent">HUB</span>
        </Link>
        <span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {variant === "admin" ? "Admin" : "Vendeur"}
        </span>
      </div>

      {/* Shop selector */}
      {shopName && (
        <button
          onClick={() => shopUrl && navigate(shopUrl)}
          className="mx-3 mt-3 flex items-center gap-2.5 rounded-xl border border-border bg-background p-2.5 text-left transition hover:border-primary/40"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
            {shopName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">{shopName}</p>
            <p className="truncate text-[10px] text-muted-foreground">Ma boutique</p>
          </div>
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const fullPath = location.pathname + location.search;
          const active = fullPath === item.href;
          return (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-primary/15 text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon size={16} className={active ? "text-primary" : ""} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="rounded-md bg-destructive/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-destructive">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-0.5 border-t border-border p-3">
        <Link
          to="/faq"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <HelpCircle size={16} />
          Centre d'aide
        </Link>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">{Sidebar}</div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative">{Sidebar}</div>
        </div>
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur sm:gap-3 sm:px-6">
          <button
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu size={18} />
          </button>

          <h1 className="truncate text-base font-bold text-foreground sm:text-lg">{title ?? "Aperçu"}</h1>

          {/* Search */}
          <div className="relative ml-auto hidden max-w-md flex-1 sm:flex">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher dans le dashboard…"
              className="w-full rounded-full border border-border bg-muted/40 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:ml-0 sm:gap-2">
            {shopUrl && (
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link to={shopUrl}>
                  <ExternalLink size={14} /> Visiter ma boutique
                </Link>
              </Button>
            )}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Changer le thème"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
            <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
              <Bell size={16} />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
