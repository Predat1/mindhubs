import { useState } from "react";
import { Megaphone, MessageSquare, Play, Copy, Share2, Sparkles, Loader2, MapPin, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCreatorLab } from "@/contexts/CreatorLabContext";
import { CREDIT_COSTS } from "@/constants/credits";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Wallet, AlertCircle, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── 3 Principaux Changements ───
// 1. Branchement sur Mistral Large 2411 via AI Creator pour un copywriting français d'exception.
// 2. Utilisation du Tool Calling pour garantir un kit marketing complet et structuré.
// 3. Débit de crédits basé sur les tokens réels, optimisant le coût pour les itérations.

const MarketingCoPilot = () => {
  const navigate = useNavigate();
  const { currentIdea, selectedMarkets, credits, spend, updatePipelineStatus } = useCreatorLab();
  const [isGenerating, setIsGenerating] = useState(false);
  const [scripts, setScripts] = useState<any[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);

  const handleGenerate = async () => {
    if (!currentIdea) return;
    const cost = CREDIT_COSTS['marketing'];
    
    if (credits < cost) {
      setShowInsufficient(true);
      return;
    }
    
    setShowConfirm(true);
  };

  const confirmGenerate = async () => {
    setShowConfirm(false);
    setIsGenerating(true);
    const cost = CREDIT_COSTS['marketing'];

    try {
      const result = await spend(cost, `Génération Kit Marketing: ${currentIdea}`, 'marketing');
      if (!result.success) {
        toast({ title: "Erreur crédits", description: result.error, variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.functions.invoke('ai-creator', {
        body: { idea: currentIdea, markets: selectedMarkets, type: 'marketing' }
      });
      if (error) throw error;
      
      setScripts(data.result.scripts || []);
      updatePipelineStatus('marketing', 'done');
      updatePipelineStatus('publish', 'active');
    } catch (err) {
      toast({ title: "Erreur Marketing", variant: "destructive" });
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
            <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} className="stat-card p-6 rounded-[2rem] border-glow space-y-6 flex flex-col h-full">
              <div className="flex justify-between items-start">
                <Badge className="bg-primary/10 text-primary font-black px-4 py-1">{script.platform}</Badge>
                <button onClick={() => copyToClipboard(script.script)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground" aria-label="Copier le script"><Copy size={16} /></button>
              </div>

              <div className="space-y-4 flex-1">
                 <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <p className="text-[10px] font-black text-primary uppercase">Accroche (Hook)</p>
                    <p className="text-sm font-bold">"{script.hook}"</p>
                 </div>
                 <div className="p-4 rounded-2xl bg-zinc-900/50 border border-white/5 font-medium text-xs leading-relaxed whitespace-pre-wrap">{script.script}</div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                 <div className="flex items-center justify-between text-[10px] font-black uppercase text-muted-foreground">
                    <span className="flex items-center gap-1"><Play size={10} /> {script.duration}</span>
                    <span>{script.type}</span>
                 </div>
                 <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex gap-2 items-start">
                    <Info size={14} className="text-emerald-500 mt-0.5" />
                    <div>
                       <p className="text-[9px] font-black text-emerald-500 uppercase">Note Culturelle</p>
                       <p className="text-[10px] font-medium text-emerald-500/80 leading-tight">{script.culturalNote}</p>
                    </div>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="glass-card border-white/10 text-white rounded-[2rem] max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Megaphone size={32} className="text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tighter">Confirmation</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              La génération de votre kit viral va consommer <span className="text-white font-black">{CREDIT_COSTS['marketing']} crédits</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white/5 p-4 rounded-2xl space-y-3">
             <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Solde actuel</span>
                <span className="font-bold">{credits} crédits</span>
             </div>
             <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Solde après</span>
                <span className="font-bold text-primary">{credits - CREDIT_COSTS['marketing']} crédits</span>
             </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button onClick={confirmGenerate} className="w-full h-12 rounded-xl btn-glow font-black uppercase text-xs">Confirmer & Générer</Button>
            <Button variant="ghost" onClick={() => setShowConfirm(false)} className="w-full h-12 rounded-xl font-bold text-xs uppercase">Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insufficient Credits Dialog */}
      <Dialog open={showInsufficient} onOpenChange={setShowInsufficient}>
        <DialogContent className="glass-card border-destructive/20 text-white rounded-[2rem] max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4 text-destructive">
              <AlertCircle size={32} />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tighter">Crédits insuffisants</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              Votre solde actuel ({credits} crédits) est trop bas pour générer ce kit.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => { setShowInsufficient(false); navigate('/dashboard/abonnement'); }} className="w-full h-12 rounded-xl bg-destructive hover:bg-destructive/90 font-black uppercase text-xs gap-2">
               <Wallet size={16} /> Recharger maintenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarketingCoPilot;
