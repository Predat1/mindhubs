import { Link, useLocation } from "react-router-dom";
import { Home, Package, ShoppingBag, Plus, Settings, type LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  cta?: boolean;
}

const VENDOR_BOTTOM_NAV: NavItem[] = [
  { label: "Accueil", href: "/dashboard", icon: Home },
  { label: "Produits", href: "/dashboard/products", icon: Package },
  { label: "Ajouter", href: "/dashboard/new-product", icon: Plus, cta: true },
  { label: "Ventes", href: "/dashboard/sales", icon: ShoppingBag },
  { label: "Profil", href: "/dashboard/settings", icon: Settings },
];

const ADMIN_BOTTOM_NAV: NavItem[] = [
  { label: "Accueil", href: "/admin", icon: Home },
  { label: "Produits", href: "/admin?tab=products", icon: Package },
  { label: "Commandes", href: "/admin?tab=orders", icon: ShoppingBag },
  { label: "Vendeurs", href: "/admin?tab=vendors", icon: Settings },
];

interface Props {
  variant: "vendor" | "admin";
}

const MobileBottomNav = ({ variant }: Props) => {
  const location = useLocation();
  const items = variant === "vendor" ? VENDOR_BOTTOM_NAV : ADMIN_BOTTOM_NAV;
  const fullPath = location.pathname + location.search;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
      aria-label="Navigation principale mobile"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex items-stretch justify-around px-2 py-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = fullPath === item.href || fullPath.startsWith(item.href + "/");
          if (item.cta) {
            return (
              <li key={item.href} className="flex items-center">
                <Link
                  to={item.href}
                  className="flex h-12 w-12 -mt-3 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95"
                  aria-label={item.label}
                >
                  <Icon size={22} strokeWidth={2.5} />
                </Link>
              </li>
            );
          }
          return (
            <li key={item.href} className="flex-1">
              <Link
                to={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 transition-colors ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
