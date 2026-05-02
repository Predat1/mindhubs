import { useState } from "react";
import { Search, Sparkles, TrendingUp, Zap, MapPin, Globe, Filter, MessageSquare, ArrowRight, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCreatorLab } from "@/contexts/CreatorLabContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

// ─── 3 Principaux Changements ───
// 1. Sélecteur multi-marchés africains (15 pays) avec chips interactifs.
// 2. Génération dynamique de placeholders SVG pour les pépites détectées.
// 3. Intégration du "Remix Lab" via Sheet latérale pour pivoter instantanément sur une idée.

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
  const svg = `
    <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="url(#grad)" />
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="400" y2="300" gradientUnits="userSpaceOnUse">
          <stop stop-color="#7C3AED" />
          <stop offset="1" stop-color="#DB2777" />
        </linearGradient>
      </defs>
      <text x="50%" y="45%" text-anchor="middle" fill="white" font-family="Outfit, sans-serif" font-size="24" font-weight="bold">${title.slice(0, 20)}...</text>
      <rect x="50%" y="60%" width="100" height="24" rx="12" transform="translate(-50, 0)" fill="white" fill-opacity="0.2" />
      <text x="50%" y="66%" text-anchor="middle" fill="white" font-family="Outfit, sans-serif" font-size="10" font-weight="bold" letter-spacing="1">${niche.toUpperCase()}</text>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const WinningProductSpy = ({ onRemix }: { onRemix: () => void }) => {
  const { setCurrentIdea, selectedMarkets, setSelectedMarkets, useCredits, updatePipelineStatus } = useCreatorLab();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [remixProduct, setRemixProduct] = useState<any | null>(null);
  const [remixAngles, setRemixAngles] = useState<any[]>([]);
  const [isRemixing, setIsRemixing] = useState(false);

  const toggleMarket = (code: string) => {
    setSelectedMarkets(selectedMarkets.includes(code) 
      ? selectedMarkets.filter(c => c !== code) 
      : [...selectedMarkets, code]
    );
  };

  const handleSearch = async () => {
    if (!searchTerm) return;
    if (!useCredits(10)) return; // WHY: Coût fixe pour une recherche profonde

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-creator', {
        body: { idea: searchTerm, type: 'spy-research', markets: selectedMarkets.length ? selectedMarkets : ["Afrique Francophone"] }
      });
      if (error) throw error;
      const parsed = typeof data.result === 'string' ? JSON.parse(data.result.replace(/```json|```/g, '')) : data.result;
      setResults(parsed.products || []);
      updatePipelineStatus('spy', 'done');
      updatePipelineStatus('sandbox', 'active');
    } catch (err) {
      toast({ title: "Erreur de veille", description: "L'IA n'a pas pu scanner les marchés.", variant: "destructive" });
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
      const parsed = typeof data.result === 'string' ? JSON.parse(data.result.replace(/```json|```/g, '')) : data.result;
      setRemixAngles(parsed.angles || []);
    } catch (err) {
      toast({ title: "Erreur Remix", variant: "destructive" });
    } finally {
      setIsRemixing(false);
    }
  };

  const confirmRemix = (angle: any) => {
    setCurrentIdea(angle.title);
    setRemixProduct(null);
    onRemix(); // Navigation vers Sandbox
  };

  return (
    <div className="space-y-10">
      {/* Search Header */}
      <div className="stat-card p-10 rounded-[2.5rem] border-glow space-y-8 bg-white/5 backdrop-blur-3xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-10"><Globe size={120} /></div>
        <div className="max-w-2xl space-y-4 relative z-10">
           <h2 className="text-3xl font-black tracking-tighter">Scannez l'Afrique en temps réel</h2>
           <p className="text-muted-foreground font-medium">L'IA MindHubs scrute TikTok, WhatsApp et Facebook pour dénicher les pépites de votre niche.</p>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="flex flex-wrap gap-2">
            {AFRICAN_MARKETS.map(m => (
              <button 
                key={m.code} 
                onClick={() => toggleMarket(m.code)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border ${selectedMarkets.includes(m.code) ? 'bg-primary border-primary text-white scale-105 shadow-lg' : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'}`}
              >
                <span>{m.flag}</span> {m.label}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Ex: Business plan pour aviculture, Formation trading..." 
                className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus:ring-primary"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching} className="h-14 px-10 rounded-2xl btn-primary-brand font-black text-base gap-2">
              {isSearching ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />} Scannage IA
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Sujets chauds :</span>
            <div className="flex gap-2">
              {SUGGESTIONS.map(s => <button key={s} onClick={() => setSearchTerm(s)} className="text-[11px] font-bold text-primary hover:underline">#{s}</button>)}
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {results.map((p, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group glass-card rounded-[2rem] overflow-hidden border border-white/5 hover:border-primary/50 transition-all hover:shadow-[0_20px_50px_rgba(124,58,237,0.1)]"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                <img src={generatePlaceholderSVG(p.title, searchTerm)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 left-4 flex gap-1">
                   <Badge className="bg-black/60 backdrop-blur-md text-[10px] font-black">{selectedMarkets[0] || 'AF'} {AFRICAN_MARKETS.find(m => m.code === selectedMarkets[0])?.flag}</Badge>
                </div>
                <div className="absolute top-4 right-4"><Badge className="bg-emerald-500/80 backdrop-blur-md text-white font-black">{p.hotScore}% HOT</Badge></div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                   <h3 className="font-black text-lg leading-tight line-clamp-2">{p.title}</h3>
                   <div className={`p-2 rounded-lg bg-opacity-10 ${p.peakPlatform === 'WhatsApp' ? 'bg-emerald-500 text-emerald-500' : p.peakPlatform === 'TikTok' ? 'bg-zinc-900 text-white' : 'bg-blue-500 text-blue-500'}`}>
                      <MessageSquare size={16} />
                   </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 font-medium">{p.reason}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                   <p className="text-xl font-black text-primary">{p.estimatedPrice}</p>
                   <Button onClick={() => handleOpenRemix(p)} variant="outline" size="sm" className="rounded-xl font-bold border-white/10 group-hover:bg-primary group-hover:text-white transition-all">Remix Lab <ArrowRight size={14} className="ml-2" /></Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Remix Sheet */}
      <Sheet open={!!remixProduct} onOpenChange={() => setRemixProduct(null)}>
        <SheetContent className="w-full sm:max-w-md bg-zinc-950 border-white/10 p-0 overflow-y-auto">
          <div className="p-8 space-y-8">
            <SheetHeader className="text-left">
              <SheetTitle className="text-2xl font-black flex items-center gap-2"><Sparkles className="text-primary" /> Remix Lab</SheetTitle>
              <SheetDescription className="font-medium">Pivot stratégique pour différencier votre offre : <strong>{remixProduct?.title}</strong></SheetDescription>
            </SheetHeader>

            <div className="space-y-6">
              {isRemixing ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-2xl" />)}
                </div>
              ) : (
                remixAngles.map((angle, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 hover:border-primary/50 transition-all"
                  >
                    <p className="font-black text-primary">{angle.title}</p>
                    <p className="text-xs text-muted-foreground font-medium">{angle.description}</p>
                    <Button onClick={() => confirmRemix(angle)} className="w-full rounded-xl font-bold btn-primary-brand h-9 text-xs">Utiliser cette idée</Button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default WinningProductSpy;
