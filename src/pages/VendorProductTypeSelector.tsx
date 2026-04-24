import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { FileArchive, PlaySquare, Briefcase, CalendarHeart, ArrowRight } from "lucide-react";

const PRODUCT_TYPES = [
  {
    id: "file",
    title: "Fichiers & E-books",
    description: "PDF, templates, audios. Vos clients téléchargent instantanément après achat avec protection anti-piratage.",
    icon: FileArchive,
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500",
  },
  {
    id: "course",
    title: "Formations & Vidéos",
    description: "Créez des formations avec un lien YouTube/Vimeo. L'étudiant visionnera son cours directement sur la plateforme.",
    icon: PlaySquare,
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-500",
  },
  {
    id: "service",
    title: "Services & Prestations",
    description: "Travaux sur mesure, freelancing. Décrivez votre offre et recevez des commandes sécurisées.",
    icon: Briefcase,
    color: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-500",
  },
  {
    id: "coaching",
    title: "Coaching & Consultations",
    description: "Sessions individuelles. Planifiez vos créneaux et laissez vos clients réserver leur moment d'expertise.",
    icon: CalendarHeart,
    color: "from-orange-500/20 to-amber-500/20",
    iconColor: "text-orange-500",
  },
];

const Inner = ({ shopName, shopUrl }: { shopName: string; shopUrl: string }) => {
  const navigate = useNavigate();

  return (
    <DashboardLayout variant="vendor" title="Nouveau produit" shopName={shopName} shopUrl={shopUrl}>
      <SEO title="Type de produit" description="Choisissez le type de produit à créer" path="/dashboard/new-product" />
      
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black mb-3">Que souhaitez-vous vendre ?</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Mindhubs s'adapte à votre expertise. Choisissez le format qui correspond le mieux à ce que vous souhaitez offrir à votre audience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRODUCT_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => navigate(`/dashboard/new-product/form?type=${type.id}`)}
                className="group relative flex flex-col text-left p-6 rounded-3xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10 flex items-start gap-5">
                  <div className={`shrink-0 h-14 w-14 rounded-2xl bg-background border border-border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 ${type.iconColor}`}>
                    <Icon size={24} />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold flex items-center justify-between">
                      {type.title}
                      <ArrowRight size={18} className="text-muted-foreground opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

const VendorProductTypeSelector = () => (
  <VendorGuard>
    {(vendor) => <Inner shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`} />}
  </VendorGuard>
);

export default VendorProductTypeSelector;
