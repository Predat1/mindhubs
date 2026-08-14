import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, Search, LayoutDashboard, User, LogOut, Zap, ChevronRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useSearchProducts } from "@/hooks/useProducts";
import { NotificationBell } from "@/components/NotificationBell";
import { useCurrentVendor } from "@/hooks/useVendors";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navLinks = [
  { label: "Explorer", href: "/boutique" },
  { label: "Devenir Expert", href: "/experts", highlight: true },
  { label: "Expertise", href: "/a-propos" },
  { label: "Tarifs", href: "/pricing" },
  { label: "Support", href: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { data: currentVendor } = useCurrentVendor();
  const { user, signOut } = useAuth();
  
  const userInitials = user
    ? (user.user_metadata?.full_name || user.email || "U")
        .split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "";
    
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const { data: searchResults = [] } = useSearchProducts(debouncedSearchQuery);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/boutique?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500">
        <div className="container mx-auto px-4 py-2">
          <div className="glass-card rounded-xl px-5 py-2.5 flex items-center justify-between">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
               <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground transition-transform group-hover:rotate-12">
                  <Zap size={20} fill="currentColor" />
               </div>
               <span className="text-lg font-bold tracking-tight hidden sm:block">
                 MIND<span className="text-primary italic">HUBS</span>
               </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                    className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all flex items-center gap-2 ${
                    location.pathname === link.href
                      ? "bg-primary/20 text-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              
              {/* Search Bar (Desktop) */}
              <div ref={searchRef} className="relative hidden md:block">
                 <div className={`flex items-center bg-muted rounded-full border border-glass transition-all duration-500 ${searchOpen ? "w-64" : "w-9"}`}>
                    <button 
                      aria-label={searchOpen ? "Lancer la recherche" : "Ouvrir la recherche"}
                      onClick={() => {
                        if (searchOpen && searchQuery.trim()) {
                          handleSearchSubmit();
                        } else {
                          setSearchOpen(!searchOpen);
                        }
                      }}
                      className="h-9 w-9 shrink-0 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                    >
                       <Search size={18} />
                    </button>
                    {searchOpen && (
                      <input 
                        ref={inputRef}
                        type="text"
                        placeholder="Rechercher..."
                        className="bg-transparent border-none text-xs font-bold w-full focus:ring-0 pr-4"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                      />
                    )}
                 </div>
              </div>

              {/* Notifications */}
              <div className="hidden sm:block">
                <NotificationBell />
              </div>

              {/* Cart */}
              <Link to="/panier" aria-label={`Panier${totalItems > 0 ? `, ${totalItems} article${totalItems > 1 ? "s" : ""}` : " vide"}`} className="relative h-10 w-10 rounded-full bg-muted flex items-center justify-center text-secondary hover:text-primary transition-all border border-glass">
                <ShoppingCart size={18} />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-[10px] font-black rounded-full flex items-center justify-center shadow-lg"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Auth / Profile */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button aria-label={`Ouvrir le profil de ${user.user_metadata?.full_name || user.email || "l'utilisateur"}`} className="h-10 w-10 rounded-2xl bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-black text-sm hover:scale-105 transition-transform">
                       {userInitials}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-lg mt-2 bg-surface border-border">
                    <DropdownMenuLabel className="font-bold p-4">
                       <p className="text-sm truncate">{user.user_metadata?.full_name || "Utilisateur"}</p>
                       <p className="text-[10px] text-muted-foreground font-medium truncate">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem onClick={() => navigate("/mon-compte")} className="p-3 rounded-xl m-1 hover:bg-primary/10 cursor-pointer">
                       <User size={16} className="mr-3" /> Profil Expert
                    </DropdownMenuItem>
                    {currentVendor && (
                      <DropdownMenuItem onClick={() => navigate("/dashboard")} className="p-3 rounded-xl m-1 bg-primary/5 text-primary hover:bg-primary/10 cursor-pointer">
                         <LayoutDashboard size={16} className="mr-3" /> Dashboard Vendeur
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem onClick={async () => { await signOut(); navigate("/"); }} className="p-3 rounded-xl m-1 text-destructive hover:bg-destructive/10 cursor-pointer">
                       <LogOut size={16} className="mr-3" /> Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => navigate("/mon-compte")} className="rounded-2xl px-6 h-10 btn-glow font-black hidden sm:flex">
                   Connexion
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <button aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} className="lg:hidden h-10 w-10 rounded-full bg-muted flex items-center justify-center text-foreground" onClick={() => setOpen(!open)}>
                 {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-surface border-t border-glass overflow-hidden"
            >
              <div className="container mx-auto px-6 py-8 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted text-lg font-medium hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                       {link.label}
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground" />
                  </Link>
                ))}
                {!user && (
                  <Button onClick={() => navigate("/mon-compte")} className="w-full h-14 rounded-2xl btn-glow text-lg font-black">
                     Se Connecter
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
