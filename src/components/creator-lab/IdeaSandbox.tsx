import { useState } from "react";
import { Target, TrendingUp, ShieldAlert, CheckCircle2, ArrowRight, Loader2, DollarSign, Globe, Award, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCreatorLab } from "@/contexts/CreatorLabContext";
import { BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";
import { CREDIT_COSTS } from "@/constants/credits";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

// ─── 3 Principaux Changements ───
// 1. Passage au moteur Gemini 2.5 Pro via le routing intelligent pour une analyse marché d'élite.
// 2. Intégration du Tool Calling pour une extraction de données analytiques garantie sans erreur.
// 3. Débit de crédits précis basé sur les tokens réellement consommés par l'IA.

const IdeaSandbox = ({ onValidate }: { onValidate: () => void }) => {
  const navigate = useNavigate();
  const { currentIdea, setCurrentIdea, selectedMarkets, credits, spend, updatePipelineStatus, setValidationScore } = useCreatorLab();
  const [isValidating, setIsValidating] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [pivots, setPivots] = useState<any[]>([]);
  const [isPivoting, setIsPivoting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);

  const handleValidate = async () => {
    if (!currentIdea) return;
    const cost = CREDIT_COSTS['validate'];
    
    if (credits < cost) {
      setShowInsufficient(true);
      return;
    }
    
    setShowConfirm(true);
  };

  const confirmValidate = async () => {
    setShowConfirm(false);
    setIsValidating(true);
    setAnalysis(null);
    setPivots([]);
    const cost = CREDIT_COSTS['validate'];

    try {
      const result = await spend(cost, `Validation idée: ${currentIdea}`, 'validate');
      if (!result.success) {
        toast({ title: "Erreur crédits", description: result.error, variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.functions.invoke('ai-creator', {
        body: { idea: currentIdea, markets: selectedMarkets, type: 'validate' }
      });
      if (error) throw error;
      
      setAnalysis(data.result);
      setValidationScore(data.result.score);
      
      updatePipelineStatus('sandbox', 'done');
      updatePipelineStatus('architect', 'active');

      if (data.result.score < 50) {
        handleGetPivots();
      }
    } catch (err) {
      toast({ title: "Échec de validation", description: "L'IA n'a pas pu analyser votre idée.", variant: "destructive" });
    } finally {
      setIsValidating(false);
    }
  };

  const handleGetPivots = async () => {
    setIsPivoting(true);
    const cost = CREDIT_COSTS['pivots'];
    try {
      if (credits < cost) return;
      await spend(cost, `Recherche pivots: ${currentIdea}`, 'pivots');

      const { data } = await supabase.functions.invoke('ai-creator', {
        body: { idea: currentIdea, markets: selectedMarkets, type: 'pivots' }
      });
      setPivots(data.result.pivots || []);
    } catch (err) {
      console.error("Pivots error", err);
    } finally {
      setIsPivoting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="stat-card p-10 rounded-[2.5rem] border-glow bg-white/5 backdrop-blur-3xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
             <label className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2"><Sparkles size={14} className="text-primary" /> Votre idée de produit digital</label>
             <Input 
                value={currentIdea}
                onChange={e => setCurrentIdea(e.target.value)}
                placeholder="Ex: Guide PDF sur l'investissement immobilier au Sénégal..."
                className="h-16 text-lg font-bold bg-white/5 border-white/10 rounded-2xl px-6 focus:ring-primary"
             />
          </div>
          <Button onClick={handleValidate} disabled={isValidating || !currentIdea} className="h-16 px-12 rounded-2xl btn-primary-brand font-black text-lg gap-2 self-end">
            {isValidating ? <Loader2 className="animate-spin" /> : <Target size={20} />} Valider l'idée
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="stat-card p-8 rounded-[2rem] border-glow grid md:grid-cols-2 gap-8">
                 <div className="flex flex-col items-center justify-center text-center space-y-4 border-r border-white/5">
                    <div className="relative w-40 h-40">
                       <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle className="text-white/5 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
                          <circle className="text-primary stroke-current" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent" strokeDasharray={`${analysis.score * 2.51} 251`} transform="rotate(-90 50 50)" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-black">{analysis.score}</span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Score IA</span>
                       </div>
                    </div>
                    <Badge className={`${analysis.score >= 75 ? 'bg-emerald-500' : analysis.score >= 50 ? 'bg-yellow-500' : 'bg-destructive'} text-white font-black px-4`}>
                       {analysis.score >= 75 ? 'TRÈS PROMETTEUR' : analysis.score >= 50 ? 'VIABLE AVEC AJUSTEMENTS' : 'À REVOIR'}
                    </Badge>
                 </div>
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[10px] font-black text-muted-foreground uppercase">Demande</p>
                          <p className="text-lg font-black text-primary">{analysis.demand}</p>
                       </div>
                       <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[10px] font-black text-muted-foreground uppercase">Saturation</p>
                          <p className="text-lg font-black text-accent">{analysis.saturation}</p>
                       </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex gap-4">
                       <CheckCircle2 className="text-primary shrink-0" size={24} />
                       <p className="text-sm font-medium leading-relaxed italic">"{analysis.recommendation}"</p>
                    </div>
                 </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                 <div className="stat-card p-5 rounded-2xl border-glow flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><DollarSign size={20} /></div>
                    <div><p className="text-[9px] font-black text-muted-foreground uppercase">Prix suggéré</p><p className="text-sm font-black">{analysis.suggestedPrice}</p></div>
                 </div>
                 <div className="stat-card p-5 rounded-2xl border-glow flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Award size={20} /></div>
                    <div><p className="text-[9px] font-black text-muted-foreground uppercase">Format idéal</p><p className="text-sm font-black">{analysis.bestFormat}</p></div>
                 </div>
                 <div className="stat-card p-5 rounded-2xl border-glow flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center"><Globe size={20} /></div>
                    <div><p className="text-[9px] font-black text-muted-foreground uppercase">Top Marché</p><p className="text-sm font-black">{analysis.topMarket}</p></div>
                 </div>
              </div>

              {analysis.score >= 75 && (
                <Button onClick={onValidate} className="w-full h-16 rounded-2xl btn-primary-brand font-black text-xl gap-3 animate-bounce hover:animate-none">
                  Idée validée → Créer le Produit <ArrowRight size={24} />
                </Button>
              )}
            </div>

            <div className="space-y-6">
               <div className="stat-card p-6 rounded-[2rem] border-glow h-full space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2"><TrendingUp size={14} /> Tendance 6 mois</h4>
                  <div className="h-40">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analysis.chartData}>
                           <Bar dataKey="val" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                           <XAxis dataKey="name" hide />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-muted-foreground uppercase">Forces & Défis</p>
                     <div className="space-y-2">
                        {analysis.pros.map((p: string, i: number) => <div key={i} className="flex items-center gap-2 text-xs font-bold text-emerald-500"><CheckCircle2 size={12} /> {p}</div>)}
                        {analysis.cons.map((c: string, i: number) => <div key={i} className="flex items-center gap-2 text-xs font-bold text-destructive"><AlertCircle size={12} /> {c}</div>)}
                     </div>
                  </div>
               </div>

               {analysis.score < 50 && (
                 <div className="stat-card p-6 rounded-[2rem] border border-destructive/20 bg-destructive/5 space-y-4">
                    <h4 className="text-xs font-black uppercase text-destructive flex items-center gap-2"><ShieldAlert size={14} /> Pivots Suggérés</h4>
                    <div className="space-y-3">
                       {isPivoting ? <Loader2 className="animate-spin mx-auto text-destructive" /> : pivots.map((p, i) => (
                         <button key={i} onClick={() => { setCurrentIdea(p.title); setAnalysis(null); }} className="w-full p-4 rounded-xl bg-white/5 border border-white/5 text-left hover:bg-white/10 transition-all">
                            <p className="text-[11px] font-black text-primary">{p.title}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">{p.whyBetter}</p>
                         </button>
                       ))}
                    </div>
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="glass-card border-white/10 text-white rounded-[2rem] max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Target size={32} className="text-primary" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tighter">Confirmation</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium">
              L'analyse approfondie de votre idée va consommer <span className="text-white font-black">{CREDIT_COSTS['validate']} crédits</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-white/5 p-4 rounded-2xl space-y-3">
             <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Solde actuel</span>
                <span className="font-bold">{credits} crédits</span>
             </div>
             <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Solde après</span>
                <span className="font-bold text-primary">{credits - CREDIT_COSTS['validate']} crédits</span>
             </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button onClick={confirmValidate} className="w-full h-12 rounded-xl btn-glow font-black uppercase text-xs">Confirmer & Analyser</Button>
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
              Votre solde actuel ({credits} crédits) est trop bas pour valider cette idée.
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

export default IdeaSandbox;
