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
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, cartBounce } = useCart();
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
    <>
      {/* Announcement Bar */}
      {announcementVisible && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-primary text-primary-foreground">
          <div className="container mx-auto flex items-center justify-center px-4 py-2 relative">
            <p className="text-[10px] sm:text-xs font-medium text-center tracking-wide leading-tight">
              🔥 <span className="font-bold">-70% sur toutes les formations</span> — Offre limitée !
            </p>
            <button
              onClick={() => setAnnouncementVisible(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              aria-label="Fermer l'annonce"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Main Nav */}
      <nav
        className="fixed left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border transition-all duration-300"
        style={{ top: announcementVisible ? "32px" : "0" }}
      >
        <div className="container mx-auto flex items-center justify-between h-14 sm:h-16 px-4">
          <Link to="/" className="text-lg sm:text-xl font-bold tracking-tight">
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

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <Search size={18} />
              </button>

              {searchOpen && (
                <div className="absolute right-0 top-10 w-[calc(100vw-2rem)] sm:w-80 bg-background border border-border rounded-xl shadow-lg p-3 animate-fade-in z-50">
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
            <Link to="/panier" className={`relative text-muted-foreground hover:text-foreground transition-colors p-1 ${cartBounce ? "animate-cart-bounce" : ""}`}>
              <ShoppingCart size={18} />
              <span
                className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold transition-transform ${
                  totalItems > 0 ? "scale-100" : "scale-0"
                }`}
              >
                {totalItems}
              </span>
            </Link>

            <button className="md:hidden text-foreground p-1" onClick={() => setOpen(!open)}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden bg-background border-t border-border px-4 pb-4 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`block py-3 text-sm transition-colors ${
                  location.pathname === link.href
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
