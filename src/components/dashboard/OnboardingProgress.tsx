import { useCurrentVendor } from "@/hooks/useVendors";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { 
  CheckCircle2, 
  Circle, 
  Gift, 
  ChevronRight,
  User,
  FileText,
  Package,
  CreditCard
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const OnboardingProgress = () => {
  const { data: vendor } = useCurrentVendor();
  const queryClient = useQueryClient();

  const onboardingProgress = (vendor as any)?.onboarding_progress;
  if (!vendor || onboardingProgress?.completed) return null;

  const progress = onboardingProgress || {
    avatar: false,
    description: false,
    first_product: false,
    payout_method: false
  };

  const steps = [
    { id: 'avatar', label: 'Photo de profil', icon: User, done: progress.avatar },
    { id: 'description', label: 'Description boutique', icon: FileText, done: progress.description },
    { id: 'first_product', label: 'Premier produit', icon: Package, done: progress.first_product },
    { id: 'payout_method', label: 'Mode de retrait', icon: CreditCard, done: progress.payout_method },
  ];

  const completedSteps = steps.filter(s => s.done).length;
  const percentage = (completedSteps / steps.length) * 100;

  const claimBonus = async () => {
    if (completedSteps < steps.length) {
      toast.error("Complétez toutes les étapes pour débloquer votre cadeau !");
      return;
    }

    try {
      // 1. Mark as completed
      const { error: updateError } = await (supabase as any)
        .from('vendors')
        .update({ 
          onboarding_progress: { ...progress, completed: true } 
        })
        .eq('id', vendor.id);

      if (updateError) throw updateError;

      // 2. Grant credits (Handled by a DB function ideally, but simulation here)
      toast.success("Félicitations ! 50 Crédits IA ajoutés à votre compte.");
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      queryClient.invalidateQueries({ queryKey: ['credits'] });
      
    } catch (error) {
      toast.error("Erreur lors de la réclamation du bonus.");
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden glass-card rounded-[2.5rem] border-primary/20 bg-gradient-to-r from-primary/10 via-background to-transparent p-6 md:p-8 shadow-2xl"
      >
        <div className="flex flex-col md:flex-row gap-8 items-center">
          
          <div className="space-y-4 flex-1 text-center md:text-left">
             <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
                <Gift size={20} className="animate-bounce" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cadeau de Bienvenue</span>
             </div>
             <h3 className="text-2xl font-black tracking-tighter">Lancez votre <span className="text-gradient-primary">Business</span></h3>
             <p className="text-sm text-muted-foreground font-medium">Complétez ces 4 étapes simples pour débloquer <span className="text-foreground font-black">50 crédits IA gratuits</span>.</p>
             
             <div className="space-y-2 max-w-md mx-auto md:mx-0">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                   <span>Progression</span>
                   <span className="text-primary">{percentage.toFixed(0)}%</span>
                </div>
                <Progress value={percentage} className="h-2 bg-primary/10" />
             </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
             {steps.map((step) => (
               <div key={step.id} className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${step.done ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-muted/10 border-white/5 opacity-60'}`}>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${step.done ? 'bg-emerald-500 text-white' : 'bg-background text-muted-foreground'}`}>
                     {step.done ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
                  </div>
                  <span className="text-[9px] font-bold text-center leading-tight">{step.label}</span>
               </div>
             ))}
          </div>

          <div className="shrink-0">
             <Button 
               onClick={claimBonus}
               disabled={completedSteps < steps.length}
               className={`h-14 rounded-2xl px-8 font-black gap-2 transition-all ${completedSteps === steps.length ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105' : 'bg-muted text-muted-foreground grayscale'}`}
             >
                RÉCLAMER BONUS <ChevronRight size={18} />
             </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
