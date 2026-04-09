import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, Search } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useSearchProducts } from "@/hooks/useProducts";

const navLinks = [
  { label: "Accueil", href: "/" },
  { label: "Boutique", href: "/boutique" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
  { label: "Mon compte", href: "/mon-compte" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { data: searchResults = [] } = useSearchProducts(searchQuery);
  const searchRef = useRef<HTMLDivElement>(null);

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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="text-xl font-bold tracking-tight">
          <span className="text-foreground">MIND</span>
          <span className="text-gradient-brand">✦</span>
          <span className="text-accent">HUB</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`text-sm transition-colors story-link ${
                location.pathname === link.href
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div ref={searchRef} className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-muted-foreground hover:text-foreground transition-colors hover-scale"
            >
              <Search size={20} />
            </button>

            {searchOpen && (
              <div className="absolute right-0 top-10 w-72 md:w-80 bg-background border border-border rounded-xl shadow-lg p-3 animate-fade-in z-50">
                <input
                  autoFocus
                  type="text"
                  placeholder="Rechercher un produit…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {searchQuery.trim().length >= 2 && (
                  <div className="mt-2 max-h-60 overflow-y-auto space-y-1">
                    {searchResults.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2 text-center">Aucun résultat</p>
                    ) : (
                      searchResults.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => navigate(`/produit/${p.id}`)}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                        >
                          <img src={p.image} alt={p.title} className="w-10 h-10 rounded object-cover shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">{p.title}</p>
                            <p className="text-xs text-accent">{p.price}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link to="/panier" className="relative text-muted-foreground hover:text-foreground transition-colors hover-scale">
            <ShoppingCart size={20} />
            <span
              className={`absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold transition-transform ${
                totalItems > 0 ? "scale-100" : "scale-0"
              }`}
            >
              {totalItems}
            </span>
          </Link>

          <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-background border-t border-border px-4 pb-4 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="block py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
