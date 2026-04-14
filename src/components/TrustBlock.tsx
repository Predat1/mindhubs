import { Zap, Shield, HeadphonesIcon, ThumbsUp } from "lucide-react";

const items = [
  { icon: Zap, label: "Livraison instantanée" },
  { icon: Shield, label: "Paiement sécurisé" },
  { icon: ThumbsUp, label: "Satisfaction garantie" },
  { icon: HeadphonesIcon, label: "Support WhatsApp 24/7" },
];

const TrustBlock = () => (
  <div className="grid grid-cols-2 gap-2">
    {items.map((item) => (
      <div key={item.label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/40 border border-border">
        <item.icon size={14} className="text-primary shrink-0" />
        <span className="text-[10px] sm:text-xs font-medium text-foreground">{item.label}</span>
      </div>
    ))}
  </div>
);

export default TrustBlock;
