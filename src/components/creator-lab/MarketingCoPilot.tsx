import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Megaphone, Zap, Video, Send, Copy, 
  Sparkles, CheckCircle2, Facebook, Twitter, 
  MessageCircle, Smartphone, Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const MOCK_SCRIPTS = [
  {
    type: "TikTok / Reel",
    hook: "La technique secrète pour arrêter de payer trop d'impôts en Afrique...",
    script: "Saviez-vous que 80% des entrepreneurs au Sénégal paient trop de taxes par simple oubli administratif ? Dans mon nouveau Kit Fiscalité, je vous montre la faille légale utilisée par les grands groupes pour réinvestir 30% de bénéfices en plus. Cliquez sur le lien dans ma bio !",
    duration: "45s",
    music: "Chill Afrobeat / Trending"
  },
  {
    type: "Post WhatsApp / FB",
    hook: "🛑 ARRÊTEZ DE GASPILLER VOTRE ARGENT !",
    script: "Chercher la croissance c'est bien, protéger ses acquis c'est mieux. La fiscalité n'est pas votre ennemie, c'est votre alliée quand on sait comment la dompter. Mon nouveau produit est dispo sur MindHubs. Premier arrivé, premier servi avec -50% pour les 10 premiers !",
    duration: "Texte long",
    music: "N/A"
  }
];

import { supabase } from "@/integrations/supabase/client";

const MarketingCoPilot = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [scripts, setScripts] = useState<null | any[]>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-creator', {
        body: { 
          idea: "Produit Digital MindHubs", // Should come from parent context
          type: "marketing"
        }
      });

      if (error) throw error;

      // Simple parsing (OpenRouter returns text, we might need to parse it if we wanted JSON)
      // For now let's use a simpler structure if the AI doesn't return JSON
      const content = data.result;
      
      // Mock-like formatting for the demo if AI returns text
      const newScripts = [
        {
          type: "TikTok / Reel",
          hook: content.split('\n')[0] || "Hook Viral IA",
          script: content,
          duration: "45s",
          music: "Chill Afrobeat / Trending"
        }
      ];
      
      setScripts(newScripts);
      toast.success("Scripts marketing générés !");
    } catch (err: any) {
      console.error(err);
      toast.error("Erreur IA Marketing. Vérifiez votre clé OpenRouter.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papier !");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black tracking-tighter">Marketing <span className="text-primary italic">Co-Pilot</span></h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
          Générez instantanément des scripts viraux et des contenus promotionnels pour WhatsApp, TikTok et Facebook afin de propulser vos ventes.
        </p>
        {!scripts && (
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 font-black text-lg gap-4 shadow-xl shadow-primary/20"
          >
            {isGenerating ? "Co-Pilot travaille..." : "Générer mon Kit Marketing"} <Zap size={20} fill="currentColor" />
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {scripts && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-8"
          >
            {scripts.map((s, i) => (
              <div key={i} className="glass-card rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    {s.type.includes("Video") || s.type.includes("TikTok") ? <Video size={120} /> : <MessageCircle size={120} />}
                 </div>
                 
                 <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.type.includes("TikTok") ? "bg-primary/20 text-primary" : "bg-emerald-500/20 text-emerald-500"}`}>
                             {s.type.includes("TikTok") ? <Video size={20} /> : <MessageCircle size={20} />}
                          </div>
                          <div>
                             <h4 className="font-black text-sm uppercase tracking-widest">{s.type}</h4>
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">IA Copywriting v2.0</p>
                          </div>
                       </div>
                       <Badge variant="outline" className="border-white/10 text-[10px] font-black uppercase px-3 py-1">DURÉE: {s.duration}</Badge>
                    </div>

                    <div className="space-y-4">
                       <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">L'Accroche (Hook)</p>
                          <p className="font-bold text-lg leading-tight italic">"{s.hook}"</p>
                       </div>
                       <div className="p-6 rounded-2xl bg-background/50 border border-white/5 relative group/script">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Le Script Complet</p>
                          <p className="text-sm leading-relaxed font-medium">
                             {s.script}
                          </p>
                          <Button 
                            onClick={() => handleCopy(s.script)}
                            variant="secondary" 
                            size="sm" 
                            className="absolute top-4 right-4 rounded-xl font-black text-[10px] opacity-0 group-hover/script:opacity-100 transition-all gap-2"
                          >
                             <Copy size={12} /> COPIER
                          </Button>
                       </div>
                    </div>

                    {s.music !== "N/A" && (
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-white/5 px-4 py-2 rounded-full w-fit">
                         <Sparkles size={14} className="text-amber-500" /> Musique conseillée : {s.music}
                      </div>
                    )}

                    <div className="flex gap-4 pt-2">
                       <Button className="flex-1 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black text-xs uppercase tracking-widest gap-2">
                          <Share2 size={16} /> Partager WhatsApp
                       </Button>
                       <Button className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black text-xs uppercase tracking-widest gap-2">
                          <Facebook size={16} /> Pub Facebook
                       </Button>
                    </div>
                 </div>
              </div>
            ))}

            <div className="flex justify-center pt-8">
               <Button variant="ghost" className="rounded-2xl font-black text-xs uppercase tracking-widest gap-2 text-muted-foreground hover:text-foreground">
                  <Zap size={16} className="text-primary" /> Régénérer d'autres variantes
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketingCoPilot;
