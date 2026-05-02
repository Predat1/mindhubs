import { useState } from "react";
import { Search, Sparkles, Globe, ArrowRight, Loader2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCreatorLab } from "@/contexts/CreatorLabContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

// ─── 3 Principaux Changements ───
// 1. Branchement sur le moteur Perplexity Deep Research pour une veille marché africaine de haute précision.
// 2. Gestion dynamique des crédits basée sur les tokens réels consommés par la recherche web.
// 3. Amélioration de la Sheet de Remix avec des angles de différenciation générés par Gemini 2.5 Flash.

const AFRICAN_MARKETS = [
  { code: "SN", label: "Sénégal", flag: "🇸🇳", currency: "FCFA" },
  { code: "CI", label: "Côte d'Ivoire", flag: "🇨🇮", currency: "FCFA" },
  { code: "CM", label: "Cameroun", flag: "🇨🇲", currency: "FCFA" },
  { code: "GA", label: "Gabon", flag: "🇬🇦", currency: "FCFA" },
  { code: "TG", label: "Togo", flag: "🇹🇬", currency: "FCFA" },
  { code: "BJ", label: "Bénin", flag: "🇧🇯", currency: "FCFA" },
  { code: "MA", label: "Maroc", flag: "🇲🇦", currency: "MAD" },
  { code: "CD", label: "RD Congo", flag: "🇨🇩", currency: "CDF" },
];

const SUGGESTIONS = ["Fiscalité", "Business Plan", "IA & Marketing", "E-commerce"];

const generatePlaceholderSVG = (title: string, niche: string) => {
  const svg = `<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="url(#grad)" /><defs><linearGradient id="grad" x1="0" y1="0" x2="400" y2="300" gradientUnits="userSpaceOnUse"><stop stop-color="#7C3AED" /><stop offset="1" stop-color="#DB2777" /></linearGradient></defs><text x="50%" y="45%" text-anchor="middle" fill="white" font-family="Outfit" font-size="24" font-weight="bold">${title.slice(0, 20)}...</text><rect x="50%" y="60%" width="100" height="24" rx="12" transform="translate(-50, 0)" fill="white" fill-opacity="0.2" /><text x="50%" y="66%" text-anchor="middle" fill="white" font-family="Outfit" font-size="10" font-weight="bold" letter-spacing="1">${niche.toUpperCase()}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const WinningProductSpy = ({ onRemix }: { onRemix: () => void }) => {
  const { setCurrentIdea, selectedMarkets, setSelectedMarkets, useCredits, deductCredits, updatePipelineStatus } = useCreatorLab();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [remixProduct, setRemixProduct] = useState<any | null>(null);
  const [remixAngles, setRemixAngles] = useState<any[]>([]);
  const [isRemixing, setIsRemixing] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) return;
    if (!useCredits(10)) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-creator', {
        body: { idea: searchTerm, type: 'spy-research', markets: selectedMarkets }
      });
      if (error) throw error;
      setResults(data.result.products || []);
      deductCredits(Math.ceil(data.tokens_used / 50)); // Perplexity coûte plus cher
      updatePipelineStatus('spy', 'done');
      updatePipelineStatus('sandbox', 'active');
    } catch (err) {
      toast({ title: "Erreur de veille", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenRemix = async (product: any) => {
    setRemixProduct(product);
    setIsRemixing(true);
    setRemixAngles([]);
    try {
      const { data } = await supabase.functions.invoke('ai-creator', {
        body: { idea: product.title, type: 'remix', markets: selectedMarkets }
      });
      setRemixAngles(data.result.angles || []);
      deductCredits(Math.ceil(data.tokens_used / 100));
    } catch (err) {
      toast({ title: "Erreur Remix", variant: "destructive" });
    } finally {
      setIsRemixing(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="stat-card p-10 rounded-[2.5rem] border-glow bg-white/5 backdrop-blur-3xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-10"><Globe size={120} /></div>
        <div className="max-w-2xl space-y-4 relative z-10">
           <h2 className="text-3xl font-black tracking-tighter">Scannez l'Afrique en temps réel</h2>
           <p className="text-muted-foreground font-medium">Moteur Perplexity Deep Research activé pour une précision inégalée.</p>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="flex flex-wrap gap-2">
            {AFRICAN_MARKETS.map(m => (
              <button 
                key={m.code} 
                onClick={() => setSelectedMarkets(selectedMarkets.includes(m.code) ? selectedMarkets.filter(c => c !== m.code) : [...selectedMarkets, m.code])}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${selectedMarkets.includes(m.code) ? 'bg-primary border-primary text-white scale-105 shadow-lg' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'}`}
              >
                <span>{m.flag}</span> {m.label}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input placeholder="Ex: Business plan pour aviculture..." className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <Button onClick={handleSearch} disabled={isSearching} className="h-14 px-10 rounded-2xl btn-primary-brand font-black gap-2">
              {isSearching ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />} Scannage IA
            </Button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {results.map((p, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="group glass-card rounded-[2rem] overflow-hidden border border-white/5 hover:border-primary/50 transition-all">
              <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                <img src={generatePlaceholderSVG(p.title, searchTerm)} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                <div className="absolute top-4 left-4"><Badge className="bg-black/60 backdrop-blur-md text-[10px] font-black">{selectedMarkets[0] || 'AF'}</Badge></div>
                <div className="absolute top-4 right-4"><Badge className="bg-emerald-500/80 backdrop-blur-md text-white font-black">{p.hotScore}% HOT</Badge></div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                   <h3 className="font-black text-lg leading-tight line-clamp-2">{p.title}</h3>
                   <div className="p-2 rounded-lg bg-primary/10 text-primary"><MessageSquare size={16} /></div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 font-medium">{p.reason}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                   <p className="text-xl font-black text-primary">{p.estimatedPrice}</p>
                   <Button onClick={() => handleOpenRemix(p)} variant="outline" size="sm" className="rounded-xl font-bold border-white/10 group-hover:bg-primary group-hover:text-white transition-all">Remix Lab</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Sheet open={!!remixProduct} onOpenChange={() => setRemixProduct(null)}>
        <SheetContent className="w-full sm:max-w-md bg-zinc-950 border-white/10 p-8 space-y-8 overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle className="text-2xl font-black flex items-center gap-2"><Sparkles className="text-primary" /> Remix Lab</SheetTitle>
            <SheetDescription className="font-medium">Différenciation stratégique via Gemini 2.5 Flash.</SheetDescription>
          </SheetHeader>
          <div className="space-y-6">
            {isRemixing ? <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-2xl" />)}</div> : remixAngles.map((angle, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-primary/50 transition-all">
                <p className="font-black text-primary">{angle.title}</p>
                <p className="text-xs text-muted-foreground font-medium">{angle.description}</p>
                <Button onClick={() => { setCurrentIdea(angle.title); onRemix(); }} className="w-full rounded-xl font-bold btn-primary-brand h-9 text-xs">Utiliser cette idée</Button>
              </motion.div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default WinningProductSpy;
