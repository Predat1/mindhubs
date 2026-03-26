import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Contact */}
          <div className="space-y-4">
            <Link to="/" className="text-xl font-bold">
              <span className="text-foreground">SAVOIR</span>
              <span className="text-gradient-brand">✦</span>
              <span className="text-accent">HUB</span>
            </Link>
            <div className="space-y-2 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <Mail size={14} />
                <span>contact@savoirhub.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} />
                <span>+33 6 00 00 00 00</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span>En ligne</span>
              </div>
            </div>
          </div>

          {/* Nos politiques */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm">Nos politiques</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li><a href="#" className="hover:text-foreground transition-colors">Conditions générales</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Politique de confidentialité</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Politique de remboursement</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Mentions légales</a></li>
            </ul>
          </div>

          {/* Liens Utiles */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm">Liens Utiles</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li><Link to="/boutique" className="hover:text-foreground transition-colors">Toutes les formations</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Mon compte</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Newsletter mini */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground text-sm">Newsletter</h4>
            <p className="text-muted-foreground text-sm">Recevez nos dernières offres</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button className="btn-primary-brand px-4 py-2 rounded-lg text-sm font-semibold">
                OK
              </button>
            </form>
          </div>
        </div>

        {/* Payment icons */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {["VISA", "MC", "AMEX", "PayPal", "CB"].map((p) => (
              <span
                key={p}
                className="text-[10px] font-bold px-2 py-1 rounded border border-border text-muted-foreground"
              >
                {p}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Copyright © 2023-{new Date().getFullYear()} SavoirHub ❤️
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
