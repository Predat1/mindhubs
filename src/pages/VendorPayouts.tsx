import { useState } from "react";
import { useCurrentVendor } from "@/hooks/useVendors";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Wallet, 
  ArrowUpRight, 
  History, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Phone,
  Building2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const PAYOUT_METHODS = [
  { id: 'wave', name: 'Wave', icon: Wallet, color: 'text-blue-500' },
  { id: 'orange_money', name: 'Orange Money', icon: Phone, color: 'text-orange-500' },
  { id: 'mtn_money', name: 'MTN Money', icon: Phone, color: 'text-yellow-500' },
  { id: 'moov_money', name: 'Moov Money', icon: Phone, color: 'text-blue-600' },
  { id: 'bank_transfer', name: 'Virement Bancaire', icon: Building2, color: 'text-gray-500' },
];

export default function VendorPayouts() {
  const { data: vendor } = useCurrentVendor();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("wave");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch payout history
  const { data: payouts, isLoading } = useQuery({
    queryKey: ['payouts', vendor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('vendor_id', vendor?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!vendor?.id
  });

  const requestPayout = useMutation({
    mutationFn: async () => {
      if (!vendor) return;
      const numAmount = parseInt(amount);
      
      // Basic check (Real check should be on backend)
      if (numAmount < 5000) throw new Error("Le montant minimum est de 5 000 FCFA");
      
      const { error } = await supabase
        .from('payout_requests')
        .insert([{
          vendor_id: vendor.id,
          amount_fcfa: numAmount,
          method,
          phone_number: phoneNumber,
          status: 'pending'
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Demande de retrait envoyée !");
      setAmount("");
      setPhoneNumber("");
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la demande");
    }
  });

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    requestPayout.mutate();
  };

  const pendingAmount = payouts?.filter(p => p.status === 'pending')
    .reduce((acc, p) => acc + p.amount_fcfa, 0) || 0;

  return (
    <DashboardLayout variant="vendor" title="Retraits & Revenus" shopName={vendor?.shop_name}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-3xl border-white/5 space-y-2">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Solde Disponible</p>
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black">{vendor?.balance_fcfa?.toLocaleString() || 0} <span className="text-sm">FCFA</span></h3>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <DollarSign size={20} />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border-white/5 space-y-2">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">En cours de retrait</p>
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black">{pendingAmount.toLocaleString()} <span className="text-sm">FCFA</span></h3>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Clock size={20} />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border-white/5 space-y-2">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Retiré</p>
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black">
                {payouts?.filter(p => p.status === 'completed')
                  .reduce((acc, p) => acc + p.amount_fcfa, 0).toLocaleString() || 0} 
                <span className="text-sm"> FCFA</span>
              </h3>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <ArrowUpRight size={20} />
                </div>
                <h3 className="text-xl font-black">Nouveau Retrait</h3>
              </div>

              <form onSubmit={handleRequest} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Montant (FCFA)</Label>
                  <Input 
                    type="number" 
                    placeholder="Min 5 000 FCFA"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-14 rounded-2xl bg-muted/20 border-white/5 font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Méthode de Paiement</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYOUT_METHODS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${method === m.id ? 'bg-primary/10 border-primary text-primary' : 'bg-muted/10 border-white/5 hover:border-white/20'}`}
                      >
                        <m.icon size={16} className={m.color} />
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Numéro de téléphone / Compte</Label>
                  <Input 
                    placeholder="Ex: 07 00 00 00 00"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-14 rounded-2xl bg-muted/20 border-white/5 font-bold"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                  <AlertCircle size={18} className="text-amber-500 shrink-0" />
                  <p className="text-[10px] text-amber-500/80 font-medium leading-relaxed">
                    Les retraits sont traités sous 24h à 48h ouvrables. Assurez-vous que le numéro est correct.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={requestPayout.isPending}
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20"
                >
                  {requestPayout.isPending ? "Traitement..." : "DEMANDER LE RETRAIT"}
                </Button>
              </form>
            </div>
          </div>

          {/* History */}
          <div className="lg:col-span-7">
            <div className="glass-card p-8 rounded-[2.5rem] border-white/5 min-h-[500px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                    <History size={20} />
                  </div>
                  <h3 className="text-xl font-black">Historique</h3>
                </div>
                <Badge variant="outline" className="rounded-full">{payouts?.length || 0} Opérations</Badge>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  <div className="animate-pulse space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-20 bg-muted/20 rounded-2xl" />)}
                  </div>
                ) : payouts?.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto text-muted-foreground/30">
                      <Wallet size={32} />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground">Aucun retrait pour le moment.</p>
                  </div>
                ) : (
                  payouts?.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-muted/10 hover:bg-muted/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                          p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                          p.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {p.status === 'completed' ? <CheckCircle2 size={24} /> : 
                           p.status === 'rejected' ? <XCircle size={24} /> : 
                           <Clock size={24} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-lg">{p.amount_fcfa.toLocaleString()} FCFA</span>
                            <Badge className="bg-muted text-[8px] font-black px-2">{p.method.toUpperCase()}</Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium">
                            {new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`rounded-full text-[9px] font-black px-3 ${
                          p.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' : 
                          p.status === 'rejected' ? 'bg-destructive/20 text-destructive' : 
                          'bg-blue-500/20 text-blue-500'
                        }`}>
                          {p.status === 'pending' ? 'EN ATTENTE' : 
                           p.status === 'processing' ? 'TRAITEMENT' :
                           p.status === 'completed' ? 'EFFECTUÉ' : 'REJETÉ'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
