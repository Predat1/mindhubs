import { useState } from "react";
import { Megaphone, MessageSquare, TikTok, Facebook, WhatsApp, Play, Copy, Share2, Sparkles, Loader2, MapPin, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCreatorLab } from "@/contexts/CreatorLabContext";

// ─── 3 Principaux Changements ───
// 1. Intégration du contexte partagé (Idée + Marchés) pour une génération marketing ciblée.
// 2. Ajout de "Notes Culturelles" pour adapter les scripts aux spécificités locales africaines.
// 3. Cartographie des canaux : focus sur WhatsApp et Mobile Money comme vecteurs de vente.

const MarketingCoPilot = () => {
  const { currentIdea, selectedMarkets, useCredits, updatePipelineStatus } = useCreatorLab();
  const [isGenerating, setIsGenerating] = useState(false);
  const [scripts, setScripts] = useState<any[]>([]);

  const handleGenerate = async () => {
    if (!currentIdea) return;
    if (!useCredits(10)) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-creator', {
        body: { idea: currentIdea, markets: selectedMarkets, type: 'marketing' }
      });
      if (error) throw error;
      const parsed = typeof data.result === 'string' ? JSON.parse(data.result.replace(/```json|```/g, '')) : data.result;
      setScripts(parsed.scripts || []);
      updatePipelineStatus('marketing', 'done');
      updatePipelineStatus('publish', 'active');
    } catch (err) {
      toast({ title: "Erreur Marketing", description: "L'IA n'a pas pu générer vos scripts.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copié !", description: "Le script est dans votre presse-papier." });
  };

  return (
    <div className="space-y-8">
      {/* Context Recap */}
      <div className="stat-card p-8 rounded-[2.5rem] border-glow bg-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary"><Megaphone size={32} /></div>
            <div>
               <h3 className="text-xl font-black">{currentIdea || "Produit non défini"}</h3>
               <div className="flex items-center gap-2 mt-1">
                  <MapPin size={12} className="text-muted-foreground" />
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    Cibles : {selectedMarkets.length ? selectedMarkets.join(', ') : "Toute l'Afrique"}
                  </span>
               </div>
            </div>
         </div>
         <Button onClick={handleGenerate} disabled={isGenerating || !currentIdea} className="h-14 px-10 rounded-2xl btn-primary-brand font-black gap-2">
            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />} Générer mon Kit Viral
         </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <AnimatePresence>
          {scripts.map((script, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="stat-card p-6 rounded-[2rem] border-glow space-y-6 flex flex-col h-full"
            >
              <div className="flex justify-between items-start">
                <Badge className="bg-primary/10 text-primary font-black px-4 py-1">{script.platform}</Badge>
                <div className="flex gap-2">
                   <button onClick={() => copyToClipboard(script.script)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground"><Copy size={16} /></button>
                   <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground"><Share2 size={16} /></button>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <p className="text-[10px] font-black text-primary uppercase">Accroche (Hook)</p>
                    <p className="text-sm font-bold leading-tight">"{script.hook}"</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 font-medium text-xs leading-relaxed">
                    {script.script}
                 </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                 <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground">
                    <span className="flex items-center gap-1"><Play size={10} /> {script.duration}</span>
                    <span>Type: {script.type}</span>
                 </div>
                 <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex gap-2 items-start">
                    <Info size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                       <p className="text-[9px] font-black text-emerald-500 uppercase">Note Culturelle</p>
                       <p className="text-[10px] font-medium text-emerald-500/80 leading-tight">{script.culturalNote}</p>
                    </div>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {scripts.length === 0 && !isGenerating && (
          <div className="md:col-span-2 py-20 text-center space-y-4 opacity-40">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto"><Megaphone size={32} /></div>
             <p className="text-xs font-black uppercase tracking-widest">Vos scripts TikTok, Reels et WhatsApp apparaîtront ici</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingCoPilot;
