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

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/boutique?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      {announcementVisible && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-primary text-primary-foreground overflow-hidden">
          <div className="relative flex items-center py-2 sm:py-1.5">
            <button
              onClick={() => setAnnouncementVisible(false)}
              className="absolute right-2 z-10 text-primary-foreground/70 hover:text-primary-foreground transition-colors bg-primary px-1"
              aria-label="Fermer l'annonce"
            >
              <X size={14} />
            </button>
            <div className="animate-marquee whitespace-nowrap flex gap-16">
              {[...Array(2)].map((_, i) => (
                <span key={i} className="text-[10px] sm:text-xs font-medium tracking-wide inline-flex gap-16">
                  <span>🔥 <strong>-70% sur toutes les formations</strong> — Offre limitée !</span>
                  <span>🚀 Accès à vie • Paiement sécurisé • Satisfait ou remboursé</span>
                  <span>⭐ +2000 clients satisfaits — Rejoignez-les maintenant</span>
                </span>
              ))}
            </div>
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

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Search */}
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-1 sm:px-3 sm:py-1.5 sm:rounded-lg sm:bg-muted/50 sm:border sm:border-border sm:hover:border-primary/40"
                aria-label="Rechercher"
              >
                <Search size={18} />
                <span className="hidden sm:inline text-xs text-muted-foreground">Rechercher…</span>
                <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                  ⌘K
                </kbd>
              </button>

              {searchOpen && (
                <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-[calc(100%+8px)] sm:top-10 sm:w-96 bg-background border border-border rounded-xl shadow-2xl p-3 sm:p-4 animate-fade-in z-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Rechercher un produit…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearchSubmit();
                        if (e.key === "Escape") {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }
                      }}
                      className="w-full pl-9 pr-4 py-2.5 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  {searchQuery.trim().length >= 2 && (
                    <div className="mt-3 max-h-72 overflow-y-auto space-y-1">
                      {searchResults.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4 text-center">Aucun résultat pour "{searchQuery}"</p>
                      ) : (
                        <>
                          {searchResults.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => navigate(`/produit/${p.id}`)}
                              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                            >
                              <img src={p.image} alt={p.title} className="w-11 h-11 rounded-lg object-cover shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs sm:text-sm font-medium text-foreground truncate">{p.title}</p>
                                <p className="text-xs text-accent font-semibold">{p.price}</p>
                              </div>
                            </button>
                          ))}
                          <button
                            onClick={handleSearchSubmit}
                            className="w-full mt-2 py-2 text-xs text-primary font-medium hover:bg-primary/5 rounded-lg transition-colors"
                          >
                            Voir tous les résultats →
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {searchQuery.trim().length < 2 && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-2 text-center">
                      Tapez au moins 2 caractères pour rechercher
                    </p>
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
