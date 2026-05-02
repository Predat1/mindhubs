import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, Zap, ShieldCheck, BarChart3, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const MOCK_ANALYSIS = {
  score: 82,
  saturation: "Faible",
  demand: "Élevée",
  competitors: 4,
  recommendation: "Opportunité majeure. Le marché africain manque de guides structurés sur ce sujet spécifique. Privilégiez un format 'Kit Prêt-à-l'emploi'.",
  pros: ["Forte demande saisonnière", "Peu de concurrence directe", "Facile à produire"],
  cons: ["Niche très technique", "Nécessite des preuves sociales fortes"],
  chartData: [
    { name: "Jan", val: 30 },
    { name: "Féb", val: 45 },
    { name: "Mar", val: 60 },
    { name: "Avr", val: 85 },
    { name: "Mai", val: 92 },
    { name: "Juin", val: 80 },
  ]
};

const IdeaSandbox = () => {
  const [idea, setIdea] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<null | typeof MOCK_ANALYSIS>(null);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalysis(MOCK_ANALYSIS);
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      {/* Input Section */}
      <div className="space-y-8">
        <div className="glass-card rounded-[2.5rem] p-8 border-white/5 space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Lightbulb className="text-amber-500" /> Testez votre idée
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Décrivez votre projet de produit digital. Notre IA va l'analyser par rapport aux tendances du marché et à la concurrence actuelle.
            </p>
          </div>
          
          <div className="space-y-4">
            <Textarea 
              placeholder="Ex: Je veux créer un guide PDF pour aider les restaurateurs au Sénégal à automatiser leurs stocks avec Excel et une app mobile..."
              className="min-h-[200px] rounded-3xl bg-white/5 border-white/10 p-6 text-lg leading-relaxed focus-visible:ring-primary"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
            <Button 
              onClick={handleAnalyze}
              disabled={!idea || analyzing}
              className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg gap-3 shadow-lg shadow-primary/20"
            >
              {analyzing ? (
                <>Analyse en cours... <Zap className="animate-spin" size={20} /></>
              ) : (
                <>Analyser le Potentiel <Zap size={20} fill="currentColor" /></>
              )}
            </Button>
          </div>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 border-white/5 bg-primary/5 border-primary/20">
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-sm uppercase tracking-widest">Confidentialité Totale</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Vos idées sont traitées de manière anonyme et ne sont jamais partagées avec d'autres utilisateurs. Vous gardez 100% de la propriété intellectuelle.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results Section */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {!analysis && !analyzing ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 glass-card rounded-[2.5rem] border-white/5 border-dashed"
            >
              <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <BarChart3 size={32} className="text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-black text-muted-foreground/50 uppercase tracking-widest">En attente d'analyse</h3>
              <p className="text-sm text-muted-foreground/40 mt-2 max-w-xs">
                Entrez votre idée à gauche pour voir les graphiques de tendance et les recommandations.
              </p>
            </motion.div>
          ) : analyzing ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-6 glass-card rounded-[2.5rem] border-white/5"
            >
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={32} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-black uppercase tracking-widest">Analyse IA</h3>
                <p className="text-xs text-muted-foreground mt-1">Comparaison avec 50,000+ produits...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Score & Main Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card rounded-3xl p-6 border-white/5 text-center space-y-2">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Score Potentiel</p>
                  <div className="text-5xl font-black text-primary">{analysis!.score}%</div>
                </div>
                <div className="glass-card rounded-3xl p-6 border-white/5 text-center space-y-2">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Saturation</p>
                  <div className="text-xl font-black text-emerald-500 uppercase tracking-tight">{analysis!.saturation}</div>
                </div>
              </div>

              {/* Recommendation */}
              <div className="glass-card rounded-[2.5rem] p-8 border-white/5 space-y-4">
                <h4 className="font-black flex items-center gap-2 text-sm uppercase tracking-widest">
                  <TrendingUp size={16} className="text-primary" /> Verdict de l'IA
                </h4>
                <p className="text-sm leading-relaxed font-medium">
                  {analysis!.recommendation}
                </p>
              </div>

              {/* Chart */}
              <div className="glass-card rounded-[2.5rem] p-8 border-white/5">
                <div className="flex items-center justify-between mb-6">
                   <h4 className="font-black text-sm uppercase tracking-widest">Courbe de Demande</h4>
                   <Badge className="bg-primary/20 text-primary border-none">TRENDING UP</Badge>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysis!.chartData}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '1rem', border: '1px solid hsl(var(--border))' }}
                        itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                        {analysis!.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 4 ? "hsl(var(--primary))" : "hsl(var(--primary)/0.2)"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid md:grid-cols-2 gap-4">
                 <div className="p-5 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                    <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                       <CheckCircle2 size={14} /> Points Forts
                    </h5>
                    <ul className="space-y-2">
                       {analysis!.pros.map((p, i) => <li key={i} className="text-xs font-medium">• {p}</li>)}
                    </ul>
                 </div>
                 <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-3">
                    <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                       <AlertTriangle size={14} /> Défis à Relever
                    </h5>
                    <ul className="space-y-2">
                       {analysis!.cons.map((c, i) => <li key={i} className="text-xs font-medium">• {c}</li>)}
                    </ul>
                 </div>
              </div>

              <Button className="w-full h-16 rounded-2xl bg-gradient-to-r from-primary to-accent font-black text-lg gap-3">
                 Passer à la Conception <ArrowRight size={20} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IdeaSandbox;
