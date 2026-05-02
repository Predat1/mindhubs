import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Settings as SettingsIcon, Save, Zap, Bell, ShieldCheck, 
  ChevronRight, Info, AlertCircle, Plus, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CREDIT_COSTS } from "@/constants/credits";
import { Badge } from "@/components/ui/badge";

interface AdminSettingsTabProps {
  logAction: (action: string, details: string) => Promise<void>;
}

const AdminSettingsTab = ({ logAction }: AdminSettingsTabProps) => {
  const queryClient = useQueryClient();
  const [savingPlan, setSavingPlan] = useState<string | null>(null);
  
  // ─── Notification Form State ───
  const [notif, setNotif] = useState({
    title: "",
    message: "",
    type: "info",
    link: ""
  });
  const [sendingNotif, setSendingNotif] = useState(false);

  // ─── Queries ───
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["admin-plan-limits"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('plan_limits').select('*').order('price_fcfa_monthly');
      if (error) throw error;
      return data || [];
    }
  });

  // ─── Handlers ───
  const handleUpdatePlan = async (plan: any) => {
    setSavingPlan(plan.plan);
    try {
      const { error } = await (supabase as any)
        .from('plan_limits')
        .update(plan)
        .eq('plan', plan.plan);
      
      if (error) throw error;
      
      await logAction('PLAN_CONFIG_UPDATE', `Plan ${plan.plan} modifié`);
      toast.success(`Plan ${plan.plan} mis à jour ✨`);
      queryClient.invalidateQueries({ queryKey: ["admin-plan-limits"] });
    } catch (err: any) {
      toast.error("Erreur: " + err.message);
    } finally {
      setSavingPlan(null);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingNotif(true);
    try {
      const { error } = await (supabase as any)
        .from('global_notifications')
        .insert([{
          ...notif,
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      await logAction('GLOBAL_NOTIF_SENT', `Titre: ${notif.title}`);
      toast.success("Notification envoyée à tous les vendeurs 📢");
      setNotif({ title: "", message: "", type: "info", link: "" });
    } catch (err: any) {
      toast.error("Erreur: " + err.message);
    } finally {
      setSendingNotif(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* ─── SECTION: PLAN CONFIGURATION ─── */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
           <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-2xl"><Zap size={24} /></div>
           <div>
             <h2 className="text-3xl font-black tracking-tighter">Plans Tarifaires</h2>
             <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Configuration des limites et privilèges par abonnement</p>
           </div>
        </div>

        <div className="grid gap-6">
          {plansLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-3xl" />)
          ) : plans.map((p) => (
            <Card key={p.plan} className="stat-card p-8 rounded-[2.5rem] border-glow bg-zinc-950/30 overflow-hidden group">
               <div className="flex flex-col lg:flex-row gap-8">
                  {/* Plan Header */}
                  <div className="lg:w-48 shrink-0">
                     <Badge className={`mb-2 font-black uppercase ${p.plan === 'elite' ? 'bg-amber-500' : p.plan === 'pro' ? 'bg-purple-500' : 'bg-zinc-500'}`}>
                        Plan {p.plan}
                     </Badge>
                     <div className="space-y-4">
                        <div className="space-y-1">
                           <label className="text-[9px] font-black uppercase text-muted-foreground">Mensuel (FCFA)</label>
                           <Input 
                             type="number" 
                             value={p.price_fcfa_monthly} 
                             onChange={e => {
                               const newPlans = plans.map(pl => pl.plan === p.plan ? {...pl, price_fcfa_monthly: parseInt(e.target.value)} : pl);
                               queryClient.setQueryData(["admin-plan-limits"], newPlans);
                             }}
                             className="h-10 bg-white/5 border-white/10 rounded-xl font-bold"
                           />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[9px] font-black uppercase text-muted-foreground">Annuel (FCFA)</label>
                           <Input 
                             type="number" 
                             value={p.price_fcfa_yearly} 
                             onChange={e => {
                               const newPlans = plans.map(pl => pl.plan === p.plan ? {...pl, price_fcfa_yearly: parseInt(e.target.value)} : pl);
                               queryClient.setQueryData(["admin-plan-limits"], newPlans);
                             }}
                             className="h-10 bg-white/5 border-white/10 rounded-xl font-bold"
                           />
                        </div>
                     </div>
                  </div>

                  {/* Limits */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
                     <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-muted-foreground">Crédits / mois</label>
                        <Input 
                          type="number" 
                          value={p.monthly_credits} 
                          onChange={e => {
                            const newPlans = plans.map(pl => pl.plan === p.plan ? {...pl, monthly_credits: parseInt(e.target.value)} : pl);
                            queryClient.setQueryData(["admin-plan-limits"], newPlans);
                          }}
                          className="h-10 bg-white/5 border-white/10 rounded-xl font-bold"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-muted-foreground">Max Produits (-1=∞)</label>
                        <Input 
                          type="number" 
                          value={p.max_products} 
                          onChange={e => {
                            const newPlans = plans.map(pl => pl.plan === p.plan ? {...pl, max_products: parseInt(e.target.value)} : pl);
                            queryClient.setQueryData(["admin-plan-limits"], newPlans);
                          }}
                          className="h-10 bg-white/5 border-white/10 rounded-xl font-bold"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-muted-foreground">Commission (%)</label>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={p.commission_rate * 100} 
                          onChange={e => {
                            const newPlans = plans.map(pl => pl.plan === p.plan ? {...pl, commission_rate: parseFloat(e.target.value) / 100} : pl);
                            queryClient.setQueryData(["admin-plan-limits"], newPlans);
                          }}
                          className="h-10 bg-white/5 border-white/10 rounded-xl font-bold"
                        />
                     </div>

                     {/* Toggles */}
                     <div className="col-span-full grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
                        {[
                          { key: 'ads_studio', label: 'Ads Studio' },
                          { key: 'creator_lab_full', label: 'Lab Complet' },
                          { key: 'priority_placement', label: 'Priorité' },
                        ].map(toggle => (
                          <div key={toggle.key} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                             <span className="text-[10px] font-black uppercase">{toggle.label}</span>
                             <Switch 
                               checked={p[toggle.key]} 
                               onCheckedChange={val => {
                                 const newPlans = plans.map(pl => pl.plan === p.plan ? {...pl, [toggle.key]: val} : pl);
                                 queryClient.setQueryData(["admin-plan-limits"], newPlans);
                               }}
                             />
                          </div>
                        ))}
                        <div className="flex flex-col gap-1">
                           <label className="text-[9px] font-black uppercase text-muted-foreground px-1">Badge UI</label>
                           <Input 
                            placeholder="Elite Badge" 
                            value={p.badge || ""} 
                            onChange={e => {
                              const newPlans = plans.map(pl => pl.plan === p.plan ? {...pl, badge: e.target.value} : pl);
                              queryClient.setQueryData(["admin-plan-limits"], newPlans);
                            }}
                            className="h-8 text-[10px] bg-white/5 border-white/10 rounded-lg"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center">
                     <Button 
                       onClick={() => handleUpdatePlan(p)} 
                       disabled={savingPlan === p.plan}
                       className="h-full px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest gap-2 bg-primary hover:scale-[1.02] transition-all"
                     >
                        {savingPlan === p.plan ? <Loader2 className="animate-spin" /> : <Save size={16} />} Sauvegarder
                     </Button>
                  </div>
               </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── SECTION: CREDIT COSTS (INFORMATIVE) ─── */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
           <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-2xl"><AlertCircle size={24} /></div>
           <div>
             <h2 className="text-3xl font-black tracking-tighter">Coûts des Fonctionnalités</h2>
             <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Aperçu de la rentabilité par action IA</p>
           </div>
        </div>

        <Card className="stat-card rounded-3xl overflow-hidden border-glow">
           <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/30 border-b border-white/5">
                   <th className="p-4 text-[10px] font-black uppercase tracking-widest">Feature</th>
                   <th className="p-4 text-[10px] font-black uppercase tracking-widest">Crédits</th>
                   <th className="p-4 text-[10px] font-black uppercase tracking-widest">Coût Réel (FCFA)</th>
                   <th className="p-4 text-[10px] font-black uppercase tracking-widest">Marge Est.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: "Veille Concurrentielle", key: "spy-research", cost: 24, margin: "84%" },
                  { name: "Validation d'Idée", key: "validate", cost: 2, margin: "98%" },
                  { name: "Planification Produit", key: "plan", cost: 3, margin: "99%" },
                  { name: "Rédaction Chapitre", key: "chapter-draft", cost: 48, margin: "60%" },
                  { name: "Kit Marketing", key: "marketing", cost: 4, margin: "98%" },
                  { name: "Ads Studio (Kit)", key: "ads-creative", cost: 36, margin: "90%" },
                  { name: "Description IA", key: "description", cost: 1, margin: "98%" },
                ].map((f) => (
                  <tr key={f.key} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-sm">{f.name}</td>
                    <td className="p-4 font-black text-primary">{CREDIT_COSTS[f.key as keyof typeof CREDIT_COSTS] || "-"}</td>
                    <td className="p-4 text-xs font-mono text-muted-foreground">~{f.cost} FCFA</td>
                    <td className="p-4"><Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black">{f.margin}</Badge></td>
                  </tr>
                ))}
              </tbody>
           </table>
           <div className="p-4 bg-muted/20 flex items-center gap-3">
              <Info size={16} className="text-primary" />
              <p className="text-[10px] font-medium text-muted-foreground italic">
                Note : Les coûts réels varient selon la longueur des tokens. Modifiable dans <code className="bg-black/50 px-1 rounded text-primary">src/constants/credits.ts</code>.
              </p>
           </div>
        </Card>
      </section>

      {/* ─── SECTION: GLOBAL NOTIFICATIONS ─── */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
           <div className="h-12 w-12 rounded-2xl bg-fuchsia-500/10 text-fuchsia-500 flex items-center justify-center shadow-2xl"><Bell size={24} /></div>
           <div>
             <h2 className="text-3xl font-black tracking-tighter">Notifications Globales</h2>
             <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Envoyer un message flash à tous les vendeurs</p>
           </div>
        </div>

        <Card className="stat-card p-8 rounded-[3rem] border-glow bg-gradient-to-br from-fuchsia-500/5 to-transparent">
           <form onSubmit={handleSendNotification} className="space-y-6 max-w-2xl">
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase">Titre de l'annonce</label>
                    <Input 
                      required 
                      placeholder="Ex: Maintenance du système" 
                      value={notif.title}
                      onChange={e => setNotif({...notif, title: e.target.value})}
                      className="h-12 rounded-xl bg-white/5 border-white/10" 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase">Type de message</label>
                    <select 
                      className="w-full h-12 bg-zinc-900 border border-white/10 rounded-xl px-3 font-bold text-sm outline-none"
                      value={notif.type}
                      onChange={e => setNotif({...notif, type: e.target.value})}
                    >
                      <option value="info">ℹ️ Information</option>
                      <option value="success">✅ Succès / Mise à jour</option>
                      <option value="warning">⚠️ Alerte</option>
                      <option value="new_product">✨ Nouveau produit</option>
                    </select>
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase">Message (Markdown supporté)</label>
                 <Input 
                  required 
                  placeholder="Écrivez votre message ici..." 
                  value={notif.message}
                  onChange={e => setNotif({...notif, message: e.target.value})}
                  className="h-20 rounded-xl bg-white/5 border-white/10" 
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase">Lien CTA (Optionnel)</label>
                 <Input 
                  placeholder="https://mindhubs.market/..." 
                  value={notif.link}
                  onChange={e => setNotif({...notif, link: e.target.value})}
                  className="h-12 rounded-xl bg-white/5 border-white/10" 
                 />
              </div>
              <Button type="submit" disabled={sendingNotif} className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 shadow-xl shadow-fuchsia-500/20">
                 {sendingNotif ? <Loader2 className="animate-spin" /> : <Bell size={18} />} Diffuser l'annonce
              </Button>
           </form>
        </Card>
      </section>
    </div>
  );
};

export default AdminSettingsTab;
