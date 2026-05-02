import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Zap, ExternalLink, Eye, TrendingUp, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const MOCK_ADS = [
  {
    id: 1,
    title: "Kit Fiscalité Afrique 2026",
    niche: "Business / Légal",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
    hotness: 98,
    engagement: "12k",
    daysActive: 45,
    countries: ["Sénégal", "Côte d'Ivoire", "Cameroun"],
    description: "Comment structurer son entreprise et payer moins d'impôts légalement en Afrique de l'Ouest.",
  },
  {
    id: 2,
    title: "Formation IA pour Marketeurs",
    niche: "Technologie / Marketing",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    hotness: 85,
    engagement: "8.5k",
    daysActive: 12,
    countries: ["Gabon", "Togo", "Bénin"],
    description: "Maîtrisez ChatGPT et Claude pour automatiser votre agence marketing en 30 jours.",
  },
  {
    id: 3,
    title: "Guide Exportation Produits Locaux",
    niche: "Commerce / Agro",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
    hotness: 92,
    engagement: "15k",
    daysActive: 60,
    countries: ["Sénégal", "Mali", "Guinée"],
    description: "Le guide complet pour exporter vos produits locaux vers l'Europe sans intermédiaires.",
  },
];

const WinningProductSpy = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-8">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Rechercher des pubs gagnantes (ex: Shopify, Coaching, Excel...)" 
            className="h-14 pl-12 rounded-2xl bg-card/40 border-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 font-black gap-2">
          Lancer l'Analyse <Zap size={18} fill="currentColor" />
        </Button>
        <Button variant="outline" className="h-14 px-6 rounded-2xl border-white/10 gap-2">
          <Filter size={18} /> Filtres
        </Button>
      </div>

      {/* Results Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_ADS.map((ad, i) => (
          <motion.div 
            key={ad.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 group"
          >
            <div className="aspect-video relative overflow-hidden">
              <img src={ad.image} alt={ad.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute top-4 right-4 flex gap-2">
                <Badge className="bg-destructive text-white border-none font-black px-3 py-1">HOT {ad.hotness}%</Badge>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-1.5">
                    <Eye size={14} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest">{ad.engagement} vues</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-widest">Actif {ad.daysActive}j</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">{ad.niche}</p>
                <h3 className="text-xl font-black tracking-tight">{ad.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {ad.description}
              </p>
              
              <div className="flex flex-wrap gap-2 pt-2">
                {ad.countries.map(c => (
                  <Badge key={c} variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-white/10">{c}</Badge>
                ))}
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button className="flex-1 rounded-xl font-black text-xs uppercase tracking-widest bg-white/5 hover:bg-white/10 border-white/5 transition-all">
                  Voir Pub <ExternalLink size={14} className="ml-2" />
                </Button>
                <Button className="flex-1 rounded-xl font-black text-xs uppercase tracking-widest bg-primary text-primary-foreground shadow-lg hover:shadow-primary/20">
                  Remix Lab <Zap size={14} className="ml-2" fill="currentColor" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WinningProductSpy;
