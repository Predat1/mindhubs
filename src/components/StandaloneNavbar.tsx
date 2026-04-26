import { Link } from "react-router-dom";
import { ShoppingCart, LogIn, Store, ShieldCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

interface StandaloneNavbarProps {
  shopName: string;
  primaryColor: string;
  avatarUrl?: string | null;
}

const StandaloneNavbar = ({ shopName, primaryColor, avatarUrl }: StandaloneNavbarProps) => {
  const { cartItems } = useCart();
  const { user } = useAuth();
  const totalItems = cartItems.length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-background/80 backdrop-blur-xl border-b border-white/5 h-20">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link to="#" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-muted overflow-hidden border border-white/10 group-hover:scale-105 transition-transform">
            {avatarUrl ? (
              <img src={avatarUrl} alt={shopName} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/20 text-primary font-black">
                {shopName.slice(0, 1)}
              </div>
            )}
          </div>
          <span className="font-black text-xl tracking-tighter">{shopName}</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/boutique" className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mr-4">
            <Store size={14} /> Marketplace
          </Link>
          
          <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-white/5" asChild>
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
            className="rounded-xl font-black text-xs px-6 hidden sm:flex"
            style={{ backgroundColor: primaryColor }}
            asChild
          >
            <Link to={user ? "/dashboard" : "/mon-compte"}>
              {user ? "Espace Membre" : "Connexion"}
            </Link>
          </Button>
          
          <Button variant="outline" size="icon" className="rounded-xl sm:hidden border-white/10" asChild>
             <Link to="/mon-compte"><LogIn size={20} /></Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default StandaloneNavbar;
