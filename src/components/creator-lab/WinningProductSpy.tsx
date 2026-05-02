import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Zap, ExternalLink, Eye, TrendingUp, ShieldCheck, Loader2, Globe, Facebook } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const WinningProductSpy = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ads, setAds] = useState<any[]>([]);
  const [searchMode, setSearchMode] = useState<"meta" | "perplexity">("meta");

  const handleIASearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-creator', {
        body: { idea: searchTerm, type: 'spy-research' }
      });
      if (error) throw error;

      let content = data.result;
      if (content.includes("```json")) {
        content = content.split("```json")[1].split("```")[0];
      }
      const parsed = JSON.parse(content);

      if (parsed.products) {
        const formatted = parsed.products.map((p: any, i: number) => ({
          id: `ai-${i}`,
          title: p.title,
          niche: "Tendance Web (IA Deep Research)",
          image: `https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800&sig=${i}`,
          hotness: 99,
          engagement: "Viral",
          daysActive: "Live",
          countries: ["International"],
          description: p.reason,
          price: p.price
        }));
        setAds(formatted);
        toast.success("Deep Research Perplexity terminée !");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur IA. Vérifiez votre clé OpenRouter.");
    } finally {
      setLoading(false);
    }
  };

  const handleMetaSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('meta-ads-api', {
        body: { query: searchTerm, country: 'ALL' }
      });
      if (error) throw error;

      if (data?.data) {
        const formattedAds = data.data.map((ad: any) => ({
          id: ad.id,
          title: ad.page_name,
          niche: ad.digitalScore > 70 ? "Vente Digitale High-Intent" : "Produit Numérique",
          image: ad.ad_snapshot_url || "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800",
          hotness: ad.digitalScore,
          engagement: ad.publisher_platforms?.length > 1 ? "Multi-Plateforme" : "Facebook/IG",
          daysActive: "Actif",
          countries: ["Ciblage Précis"],
          description: ad.ad_creative_bodies?.[0] || "Aucune description disponible.",
          url: ad.ad_snapshot_url
        }));
        setAds(formattedAds);
        toast.success(`${formattedAds.length} publicités Meta identifiées !`);
      } else {
        toast.error("Aucun résultat Meta trouvé.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Erreur Meta Ads. Vérifiez votre token Facebook.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchMode === "perplexity") handleIASearch();
    else handleMetaSearch();
  };

  const displayAds = ads.length > 0 ? ads : [
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
  ];

  return (
    <div className="space-y-8">
      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="bg-white/5 p-1.5 rounded-2xl border border-white/5 flex gap-2">
            <button 
                onClick={() => setSearchMode("meta")}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${searchMode === "meta" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-white/5"}`}
            >
                <Facebook size={14} /> Meta Ads
            </button>
            <button 
                onClick={() => setSearchMode("perplexity")}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${searchMode === "perplexity" ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:bg-white/5"}`}
            >
                <Globe size={14} /> Deep Research (IA)
            </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder={searchMode === "meta" ? "Rechercher des pubs Facebook..." : "Analyser une niche sur tout le Web..."} 
            className="h-14 pl-12 rounded-2xl bg-card/40 border-white/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button 
          onClick={handleSearch}
          disabled={loading || !searchTerm}
          className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 font-black gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
          Lancer l'Analyse
        </Button>
      </div>

      {/* Results Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayAds.map((ad, i) => (
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
                <Badge className="bg-destructive text-white border-none font-black px-3 py-1">
                    {searchMode === "perplexity" ? "PREMIUM" : `HOT ${ad.hotness}%`}
                </Badge>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-1.5">
                    <Eye size={14} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest">{ad.engagement}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-widest">{ad.daysActive}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">{ad.niche}</p>
                <h3 className="text-xl font-black tracking-tight">{ad.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {ad.description}
              </p>
              
              {ad.price && (
                  <div className="text-sm font-black text-emerald-500">Estimation : {ad.price}</div>
              )}

              <div className="flex gap-3 pt-4">
                <Button className="flex-1 rounded-xl font-black text-xs uppercase tracking-widest bg-white/5 hover:bg-white/10 border-white/5 transition-all">
                  Voir Plus <ExternalLink size={14} className="ml-2" />
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
