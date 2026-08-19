import { Link } from "react-router-dom";
import { ShoppingCart, LogIn, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

interface StandaloneNavbarProps {
  shopName: string;
  primaryColor: string;
  avatarUrl?: string | null;
}

const StandaloneNavbar = ({ shopName, primaryColor, avatarUrl }: StandaloneNavbarProps) => {
  const { items } = useCart();
  const { user } = useAuth();
  const totalItems = items.length;

  return (
    <nav className="fixed inset-x-0 top-0 z-[100] h-16 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        <Link to="#" className="group flex items-center gap-2.5">
          <div className="size-9 overflow-hidden rounded-lg border border-border bg-muted transition-transform group-hover:scale-[1.03]">
            {avatarUrl ? (
              <img src={avatarUrl} alt={shopName} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center font-black" style={{ backgroundColor: `${primaryColor}1A`, color: primaryColor }}>
                {shopName.slice(0, 1)}
              </div>
            )}
          </div>
          <span className="max-w-[12rem] truncate text-sm font-semibold tracking-[-0.02em]">{shopName}</span>
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link to="/boutique" className="mr-1 hidden items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex">
            <Store size={14} /> Marketplace
          </Link>

          <Button variant="ghost" size="icon" className="relative rounded-lg hover:bg-accent" asChild>
            <Link to="/panier">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-[10px] font-black flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  {totalItems}
                </span>
              )}
            </Link>
          </Button>

          <Button
            className="hidden rounded-lg px-4 text-xs font-medium sm:flex"
            style={{ backgroundColor: primaryColor }}
            asChild
          >
            <Link to={user ? "/dashboard" : "/mon-compte"}>
              {user ? "Dashboard" : "Connexion"}
            </Link>
          </Button>
          
          <Button variant="outline" size="icon" className="rounded-lg border-border sm:hidden" asChild>
             <Link to="/mon-compte"><LogIn size={20} /></Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default StandaloneNavbar;
