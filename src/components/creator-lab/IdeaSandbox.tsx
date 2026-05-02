import { useState } from "react";
import { Target, TrendingUp, ShieldAlert, CheckCircle2, ArrowRight, Loader2, DollarSign, Globe, Award, Sparkles, AlertCircle } from "lucide-center";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCreatorLab } from "@/contexts/CreatorLabContext";
import { BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";

// ─── 3 Principaux Changements ───
// 1. Passage au moteur Gemini 2.5 Pro via le routing intelligent pour une analyse marché d'élite.
// 2. Intégration du Tool Calling pour une extraction de données analytiques garantie sans erreur.
// 3. Débit de crédits précis basé sur les tokens réellement consommés par l'IA.

const IdeaSandbox = ({ onValidate }: { onValidate: () => void }) => {
  const { currentIdea, setCurrentIdea, selectedMarkets, useCredits, deductCredits, updatePipelineStatus, setValidationScore } = useCreatorLab();
  const [isValidating, setIsValidating] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [pivots, setPivots] = useState<any[]>([]);
  const [isPivoting, setIsPivoting] = useState(false);

  const handleValidate = async () => {
    if (!currentIdea) return;
    if (!useCredits(5)) return; // Vérification initiale du solde

    setIsValidating(true);
    setAnalysis(null);
    setPivots([]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-creator', {
        body: { idea: currentIdea, markets: selectedMarkets, type: 'validate' }
      });
      if (error) throw error;
      
      // WHY: On utilise maintenant 'result' directement car l'Edge Function gère le tool_calling
      setAnalysis(data.result);
      setValidationScore(data.result.score);
      
      // WHY: Débit précis des crédits (1 token = 0.005 crédit environ, ici on simule une échelle)
      deductCredits(Math.ceil(data.tokens_used / 100)); 

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
    try {
      const { data } = await supabase.functions.invoke('ai-creator', {
        body: { idea: currentIdea, markets: selectedMarkets, type: 'pivots' }
      });
      setPivots(data.result.pivots || []);
      deductCredits(Math.ceil(data.tokens_used / 100));
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
    </div>
  );
};

export default IdeaSandbox;
