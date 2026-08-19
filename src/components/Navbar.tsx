import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LayoutDashboard, LogOut, Menu, Search, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useCurrentVendor } from "@/hooks/useVendors";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePublicShell } from "@/components/public-shell-context";
import MindHubsLogo from "@/components/brand/MindHubsLogo";

const navLinks = [
  { label: "Marketplace", href: "/boutique" },
  { label: "Comment ça marche", href: "/faq" },
  { label: "Devenir vendeur", href: "/become-a-seller" },
];

const Navbar = () => {
  const inPublicShell = usePublicShell();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [compact, setCompact] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMarketplace = location.pathname === "/boutique";
  const { totalItems } = useCart();
  const { data: currentVendor } = useCurrentVendor();
  const { user, signOut } = useAuth();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);

  const userInitials = user
    ? (user.user_metadata?.full_name || user.email || "U").split(" ").map((word: string) => word[0]).join("").toUpperCase().slice(0, 2)
    : "";

  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (inPublicShell) return null;

  const handleSearchSubmit = () => {
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`/boutique?q=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const linkClass = (href: string) => cn(
    "rounded-lg px-3 py-2 text-sm transition-colors",
    location.pathname === href ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
  );

  return (
    <nav className="fixed inset-x-0 top-0 z-40 h-20" aria-label="Navigation principale">
      <div className="mx-auto h-full max-w-7xl px-3 sm:px-4">
        <motion.div
          initial={false}
          animate={{ scale: compact ? 0.985 : 1 }}
          transition={reduce ? { duration: 0.01 } : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "relative top-3 flex h-12 items-center gap-2 rounded-xl border px-2.5 transition-[background-color,border-color,box-shadow] duration-200 sm:px-3",
            compact
              ? "border-border bg-background/95 shadow-sm backdrop-blur-xl"
              : "border-transparent bg-background/60 backdrop-blur-sm",
          )}
        >
          <MindHubsLogo size="sm" className="px-2 py-1.5" />

          <div className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((link) => <Link key={link.href} to={link.href} className={linkClass(link.href)}>{link.label}</Link>)}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {!isMarketplace ? <div className="relative hidden md:block">
              <motion.div
                initial={false}
                animate={{ width: searchOpen ? 240 : 40 }}
                transition={{ duration: reduce ? 0.01 : 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex h-10 items-center overflow-hidden rounded-lg border border-border bg-muted/50"
              >
                <button type="button" onClick={() => searchOpen && searchQuery.trim() ? handleSearchSubmit() : setSearchOpen(true)} className="grid size-10 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-foreground" aria-label={searchOpen ? "Rechercher" : "Ouvrir la recherche"}>
                  <Search className="size-4" aria-hidden="true" />
                </button>
                {searchOpen ? <input ref={inputRef} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && handleSearchSubmit()} placeholder="Rechercher…" className="h-full min-w-0 flex-1 bg-transparent pr-3 text-sm outline-none placeholder:text-muted-foreground" /> : null}
              </motion.div>
            </div> : null}

            {!isMarketplace ? (
              <button type="button" onClick={() => setMobileOpen(true)} className="grid size-10 place-items-center rounded-lg border border-border bg-muted/50 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden" aria-label="Rechercher un produit">
                <Search className="size-4" aria-hidden="true" />
              </button>
            ) : null}

            <Link to="/panier" className="relative grid size-10 place-items-center rounded-lg border border-border bg-muted/50 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label={`Panier${totalItems ? `, ${totalItems} article${totalItems > 1 ? "s" : ""}` : " vide"}`}>
              <ShoppingCart className="size-4" aria-hidden="true" />
              <AnimatePresence initial={false}>{totalItems > 0 ? <motion.span initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.6 }} className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">{totalItems}</motion.span> : null}</AnimatePresence>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><button type="button" className="grid size-10 place-items-center rounded-lg border border-border bg-muted text-xs font-semibold text-foreground transition-colors hover:bg-accent" aria-label="Ouvrir le menu du compte">{userInitials}</button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="mt-2 w-60 rounded-xl border-border bg-popover">
                  <DropdownMenuLabel className="p-3"><p className="truncate text-sm font-medium">{user.user_metadata?.full_name || "Utilisateur"}</p><p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p></DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/mon-compte")}><User className="mr-2 size-4" /> Profil</DropdownMenuItem>
                  {currentVendor ? <DropdownMenuItem onClick={() => navigate("/dashboard")}><LayoutDashboard className="mr-2 size-4" /> Dashboard vendeur</DropdownMenuItem> : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => { await signOut(); navigate("/"); }} className="text-destructive focus:text-destructive"><LogOut className="mr-2 size-4" /> Déconnexion</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button onClick={() => navigate("/mon-compte")} variant="outline" size="sm" className="hidden sm:inline-flex">Connexion</Button>
                <Button onClick={() => navigate("/become-a-seller")} size="sm" className="hidden md:inline-flex">Commencer à vendre</Button>
              </>
            )}

            <Button type="button" variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu mobile"><Menu className="size-5" aria-hidden="true" /></Button>
          </div>
        </motion.div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="right" className="w-[min(22rem,88vw)] border-border bg-background">
          <SheetHeader className="text-left"><SheetTitle>MindHubs</SheetTitle></SheetHeader>
          <div className="mt-8 flex flex-col gap-2">
            {!isMarketplace ? <form onSubmit={(event) => { event.preventDefault(); handleSearchSubmit(); setMobileOpen(false); }} className="relative mb-3">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Rechercher un produit…" className="h-11 w-full rounded-lg border border-border bg-muted/50 pl-9 pr-3 text-sm outline-none focus:border-ring" aria-label="Rechercher un produit" />
            </form> : null}
            {navLinks.map((link) => <Link key={link.href} to={link.href} onClick={() => setMobileOpen(false)} className={linkClass(link.href)}>{link.label}</Link>)}
            <Link to="/become-a-seller" onClick={() => setMobileOpen(false)} className="mt-3 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Commencer à vendre</Link>
            {!user ? <Button onClick={() => { setMobileOpen(false); navigate("/mon-compte"); }} variant="outline" className="w-full">Connexion</Button> : null}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default Navbar;
