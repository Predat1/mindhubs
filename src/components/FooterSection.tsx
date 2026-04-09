import { Link } from "react-router-dom";
import payMtn from "@/assets/pay-mtn.png";
import payMoov from "@/assets/pay-moov.png";
import payOrange from "@/assets/pay-orange.png";
import payWave from "@/assets/pay-wave.png";
import payTmoney from "@/assets/pay-tmoney.png";
import payAirtel from "@/assets/pay-airtel.png";
import payVisa from "@/assets/pay-visa.png";
import payMastercard from "@/assets/pay-mastercard.png";

const paymentMethods = [
  { name: "MTN", logo: payMtn },
  { name: "Moov Money", logo: payMoov },
  { name: "Orange Money", logo: payOrange },
  { name: "Wave", logo: payWave },
  { name: "TMoney", logo: payTmoney },
  { name: "Airtel Money", logo: payAirtel },
  { name: "Visa", logo: payVisa },
  { name: "MasterCard", logo: payMastercard },
];

const FooterSection = () => {
  return (
    <footer className="relative bg-background border-t-0">
      {/* Purple gradient top border */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Logo & Contact */}
          <div className="space-y-5">
            <Link to="/" className="text-2xl font-black tracking-tight">
              <span className="text-foreground">MIND</span>
              <span className="text-gradient-brand text-yellow-400">✦</span>
               <span className="text-primary font-black">HUB</span>
            </Link>
            <div className="space-y-3 text-muted-foreground text-sm">
              <p>
                <Link to="/boutique" className="hover:text-foreground transition-colors">
                  Voir notre catalogue
                </Link>
              </p>
              <p>contact@mindhub.com</p>
            </div>
          </div>

          {/* Nos politiques */}
          <div className="space-y-5">
            <h4 className="font-bold text-foreground text-lg">Nos politiques</h4>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li><Link to="/conditions-generales" className="hover:text-foreground transition-colors">Conditions générales</Link></li>
              <li><Link to="/politique-confidentialite" className="hover:text-foreground transition-colors">Politique confidentialité</Link></li>
              <li><Link to="/politique-remboursement" className="hover:text-foreground transition-colors">Politique de remboursement</Link></li>
              <li><Link to="/politique-livraison" className="hover:text-foreground transition-colors">Politique de livraison</Link></li>
            </ul>
          </div>

          {/* Liens Utiles */}
          <div className="space-y-5">
            <h4 className="font-bold text-foreground text-lg">Liens Utiles</h4>
            <ul className="space-y-3 text-muted-foreground text-sm">
              <li><Link to="/a-propos" className="hover:text-foreground transition-colors">À propos</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link to="/boutique" className="hover:text-foreground transition-colors">Boutique</Link></li>
              <li><Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 pt-8 border-t border-border" />

        {/* Payment icons & Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 flex-wrap">
            {paymentMethods.map((p) => (
              <img
                key={p.name}
                src={p.logo}
                alt={p.name}
                className="h-9 w-auto rounded object-contain"
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Copyright © 2023-{new Date().getFullYear()}{" "}
            <span className="text-primary font-semibold">Mind Hub</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
