import { Link } from "react-router-dom";
import { Mail, ExternalLink } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
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
    <footer className="relative mt-16 sm:mt-24">
      {/* Main CTA / Contact Block */}
      <div className="mx-4 sm:mx-8 lg:mx-16 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-primary/20 overflow-hidden">
        <div className="px-6 sm:px-10 lg:px-16 py-10 sm:py-16">
          <p className="text-primary font-semibold text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4 flex items-center gap-2">
            <span className="text-primary">✦</span> Contactez-nous
          </p>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight max-w-2xl">
            Intéressé par nos produits,{" "}
            <span className="text-muted-foreground">
              une question ou simplement en savoir plus ?
            </span>
          </h2>

          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 sm:gap-8">
            {/* Contact email */}
            <div>
              <p className="text-muted-foreground text-xs sm:text-sm mb-1">Contactez-nous :</p>
              <a
                href="mailto:contact@mindhub.com"
                className="text-foreground font-semibold text-sm sm:text-base flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                contact@mindhub.com
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-wrap gap-4 sm:gap-6 text-sm text-muted-foreground">
              <Link to="/a-propos" className="hover:text-foreground transition-colors">À propos</Link>
              <Link to="/boutique" className="hover:text-foreground transition-colors">Boutique</Link>
              <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </nav>
          </div>
        </div>

        {/* Big brand name */}
        <div className="px-6 sm:px-10 lg:px-16 pb-6 sm:pb-10 flex justify-center">
          <span className="text-[4rem] sm:text-[7rem] lg:text-[10rem] font-black tracking-tighter leading-none select-none text-foreground/5">
            MIND✦HUB
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mx-4 sm:mx-8 lg:mx-16 mt-0 border-t border-border/50">
        <div className="py-5 sm:py-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Copyright + policies */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © {new Date().getFullYear()}{" "}
              <span className="text-primary font-semibold">Mind Hub</span>. Tous droits réservés.
            </p>
            <nav className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-muted-foreground">
              <Link to="/conditions-generales" className="hover:text-foreground transition-colors">CGV</Link>
              <Link to="/politique-confidentialite" className="hover:text-foreground transition-colors">Confidentialité</Link>
              <Link to="/politique-remboursement" className="hover:text-foreground transition-colors">Remboursement</Link>
              <Link to="/politique-livraison" className="hover:text-foreground transition-colors">Livraison</Link>
            </nav>
          </div>

          {/* Social + payment */}
          <div className="flex items-center gap-4">
            <ShareButtons compact />
          </div>
        </div>

        {/* Payment methods */}
        <div className="pb-6 flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center sm:justify-start">
          {paymentMethods.map((p) => (
            <img
              key={p.name}
              src={p.logo}
              alt={p.name}
              className="h-7 sm:h-9 w-auto rounded object-contain opacity-60 hover:opacity-100 transition-opacity"
            />
          ))}
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
