import { Zap, Shield, HeadphonesIcon, Package, Truck } from "lucide-react";

interface TrustBlockProps {
  productMode?: "digital" | "physical" | "hybrid";
}

const TrustBlock = ({ productMode = "digital" }: TrustBlockProps) => {
  const deliveryItem = productMode === "digital"
    ? { icon: Package, label: "Accès digital après paiement" }
    : { icon: Truck, label: productMode === "hybrid" ? "Accès + livraison" : "Livraison selon le vendeur" };
  const items = [
    deliveryItem,
    { icon: Shield, label: "Paiement sécurisé" },
    { icon: Zap, label: "Protection acheteur" },
    { icon: HeadphonesIcon, label: "Contact vendeur" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => (
      <div key={item.label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/40 border border-border">
        <item.icon size={14} className="text-primary shrink-0" />
        <span className="text-[10px] sm:text-xs font-medium text-foreground">{item.label}</span>
      </div>
    ))}
    </div>
  );
};

export default TrustBlock;
