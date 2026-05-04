import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Rocket, 
  Crown, 
  Star, 
  Sprout, 
  Camera, 
  Upload,
  ChevronRight,
  Check,
  Copy,
  LayoutDashboard,
  PlusCircle,
  Eye,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentVendor } from "@/hooks/useVendors";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

// --- TYPES & SCHEMA ---
type Step = 1 | 2 | 3;
type PlanId = "free" | "starter" | "pro" | "elite";

const schema = z.object({
  shopName: z.string().trim().min(2, "Nom trop court").max(60),
  username: z
    .string()
    .trim()
    .min(3, "3 caractères minimum")
    .max(30)
    .regex(/^[a-z0-9-]+$/, "lettres minuscules, chiffres et tirets uniquement"),
  niche: z.string().min(1, "Veuillez choisir une niche"),
  bio: z.string().trim().max(300).optional(),
  email: z.string().trim().email("Email invalide").max(255).optional().or(z.literal("")),
  password: z.string().min(6, "6 caractères minimum").optional().or(z.literal("")),
});

const PLANS = [
  { id: "free", name: "Free", icon: Sprout, price: "Gratuit", features: ["5 produits", "50 crédits IA", "Comm. 20%"] },
  { id: "starter", name: "Starter", icon: Rocket, price: "4 999 FCFA", features: ["20 produits", "200 crédits IA", "Comm. 15%"] },
  { id: "pro", name: "Pro", icon: Star, price: "14 999 FCFA", features: ["Illimité", "1000 crédits IA", "Comm. 10%"], recommended: true },
  { id: "elite", name: "Elite", icon: Crown, price: "49 999 FCFA", features: ["Illimité", "5000 crédits IA", "Comm. 5%"] },
];

const NICHES = [
  "Business & Finance",
  "Formation & Éducation",
  "Tech & IA",
  "Santé & Bien-être",
  "Agriculture",
  "Marketing Digital",
  "Autre"
];

const BecomeSeller = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: existingVendor } = useCurrentVendor();
  
  // --- STATE ---
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>((searchParams.get("plan") as PlanId) || "pro");
  const [form, setForm] = useState({
    shopName: "",
    username: "",
    niche: "",
    bio: "",
    email: user?.email || "",
    password: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState("");
  
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // --- EFFECTS ---
  useEffect(() => {
    if (existingVendor && currentStep !== 3) {
      navigate("/dashboard");
    }
  }, [existingVendor, navigate, currentStep]);

  useEffect(() => {
    const planFromUrl = searchParams.get("plan") as PlanId;
    if (planFromUrl && PLANS.some(p => p.id === planFromUrl)) {
      setSelectedPlan(planFromUrl);
      setCurrentStep(2); // Skip step 1 if plan in URL
    }
  }, [searchParams]);

  // Real-time username check
  useEffect(() => {
    const checkUsername = async () => {
      if (form.username.length < 3) {
        setUsernameStatus("idle");
        return;
      }
      setUsernameStatus("checking");
      const { data } = await supabase.from("vendors").select("id").eq("username", form.username).maybeSingle();
      setUsernameStatus(data ? "taken" : "available");
    };

    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [form.username]);

  // --- HELPERS ---
  const slugify = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const storeInitials = useMemo(() => 
    form.shopName ? form.shopName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() : "MH", 
  [form.shopName]);

  // --- ACTIONS ---
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    if (usernameStatus === "taken") {
      toast.error("Ce nom d'utilisateur est déjà pris");
      return;
    }

    setSubmitting(true);
    try {
      setSubmitStep("⚙ Création du compte...");
      let userId = user?.id;

      if (!userId) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.shopName } },
        });
        if (signUpError) throw signUpError;
        userId = signUpData.user?.id;
      }

      setSubmitStep("🏪 Installation de la boutique...");
      
      let avatarUrl = null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${userId}/${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, avatarFile);
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
          avatarUrl = publicUrl;
        }
      }

      const { data: newVendor, error: vendorError } = await supabase
        .from("vendors")
        .insert({
          user_id: userId,
          username: form.username,
          shop_name: form.shopName,
          description: `Niche: ${form.niche} | ${form.bio}`,
          avatar_url: avatarUrl,
        })
        .select()
        .single();

      if (vendorError) throw vendorError;
      const vendorId = newVendor.id;

      // Assign vendor role
      await supabase.from("user_roles").insert({ user_id: userId, role: "vendor" });

      // Create subscription
      await (supabase as any).from("vendor_subscriptions").insert({
        vendor_id: vendorId,
        plan: selectedPlan,
        status: selectedPlan === 'free' ? 'active' : 'pending'
      });

      // Initialize credits with 0
      await (supabase as any).from("vendor_credits").insert({
        vendor_id: vendorId,
        balance: 0
      });

      setSubmitStep("✓ Presque prêt !");
      await queryClient.invalidateQueries({ queryKey: ["current-vendor"] });
      
      setTimeout(() => {
        setCurrentStep(3);
        setSubmitting(false);
      }, 1500);

    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création");
      setSubmitting(false);
    }
  };

  // --- RENDER HELPERS ---
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-12">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black transition-all duration-500 ${
            currentStep === s ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-110" :
            currentStep > s ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
          }`}>
            {currentStep > s ? <Check size={20} /> : s}
          </div>
          {s < 3 && <div className={`w-12 h-1 mx-2 rounded-full ${currentStep > s ? "bg-emerald-500" : "bg-muted"}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background aurora-bg selection:bg-primary/30">
      <SEO title="Devenir Vendeur — MindHubs" description="Créez votre boutique digitale en 3 étapes." path="/become-a-seller" />
      <Navbar />

      <main className="pt-32 pb-24 container mx-auto px-4">
        <StepIndicator />

        <AnimatePresence mode="wait">
          {/* STEP 1 : SELECTION DU PLAN */}
          {currentStep === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-5xl mx-auto space-y-12"
            >
              <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Quel créateur êtes-vous ?</h1>
                <p className="text-muted-foreground text-lg">Choisissez votre plan — vous pouvez upgrader à tout moment.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {PLANS.map((plan) => {
                  const Icon = plan.icon;
                  const isSelected = selectedPlan === plan.id;
                  return (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPlan(plan.id as PlanId)}
                      className={`cursor-pointer relative p-6 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center text-center space-y-4 ${
                        isSelected ? "border-primary bg-primary/10 shadow-xl" : "border-white/5 bg-card/50 hover:border-primary/50"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4 h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                          <Check size={14} strokeWidth={4} />
                        </div>
                      )}
                      {plan.recommended && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-zinc-950 font-black text-[10px] uppercase">Recommandé</Badge>
                      )}
                      <div className={`p-4 rounded-2xl ${isSelected ? "bg-primary text-zinc-950" : "bg-muted text-muted-foreground"}`}>
                        <Icon size={32} />
                      </div>
                      <div>
                        <h3 className="font-black text-xl">{plan.name}</h3>
                        <p className="text-primary font-bold text-sm">{plan.price}</p>
                      </div>
                      <div className="space-y-2 w-full">
                        {plan.features.map((f, i) => (
                          <div key={i} className="text-[10px] font-bold text-muted-foreground flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-emerald-500" /> {f}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex flex-col items-center gap-6">
                <Button 
                  onClick={() => setCurrentStep(2)}
                  className="h-16 px-12 rounded-2xl text-xl font-black gap-3 btn-glow"
                >
                  Continuer avec le plan {PLANS.find(p => p.id === selectedPlan)?.name} <ArrowRight />
                </Button>
                <Link to="/pricing" target="_blank" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  Voir le détail des plans <Eye size={14} />
                </Link>
              </div>
            </motion.div>
          )}

          {/* STEP 2 : CONFIGURATION BOUTIQUE */}
          {currentStep === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start"
            >
              <div className="space-y-8">
                <div className="space-y-2">
                  <h2 className="text-4xl font-black tracking-tight">Créez votre boutique</h2>
                  <p className="text-muted-foreground font-medium">Quelques détails pour commencer à vendre.</p>
                </div>

                <form onSubmit={handleFinalSubmit} className="space-y-6">
                  {/* Avatar Upload */}
                  <div className="flex flex-col items-center gap-4">
                    <div 
                      onClick={() => avatarInputRef.current?.click()}
                      className="group relative h-24 w-24 rounded-3xl cursor-pointer overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary transition-all"
                    >
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center bg-primary/5 text-primary">
                          <span className="text-3xl font-black">{storeInitials}</span>
                          <Camera size={16} className="absolute bottom-1 right-1 bg-primary text-zinc-950 p-1 rounded-lg" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Upload className="text-white" size={24} />
                      </div>
                    </div>
                    <input ref={avatarInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Photo de profil</p>
                  </div>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nom de la boutique</Label>
                      <Input 
                        placeholder="Ex: Vision Digital"
                        className="h-12 rounded-xl font-bold"
                        value={form.shopName}
                        onChange={(e) => setForm({ ...form, shopName: e.target.value, username: form.username || slugify(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">URL personnalisée</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase opacity-50">mindhubs.fun/store/</span>
                        <Input 
                          placeholder="votre-boutique"
                          className="h-12 pl-36 rounded-xl font-black lowercase"
                          value={form.username}
                          onChange={(e) => setForm({ ...form, username: slugify(e.target.value) })}
                          required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold">
                          {usernameStatus === "checking" && "⏳"}
                          {usernameStatus === "available" && <span className="text-emerald-500">✓ Disponible</span>}
                          {usernameStatus === "taken" && <span className="text-destructive">✗ Déjà pris</span>}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Niche principale</Label>
                      <Select onValueChange={(v) => setForm({ ...form, niche: v })}>
                        <SelectTrigger className="h-12 rounded-xl font-bold">
                          <SelectValue placeholder="Choisir un domaine" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-white/10 bg-zinc-900">
                          {NICHES.map(n => <SelectItem key={n} value={n} className="font-bold">{n}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Bio (300 chars max)</Label>
                      <Textarea 
                        placeholder="Parlez-nous de votre expertise..."
                        className="rounded-xl resize-none font-medium h-24"
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        maxLength={300}
                      />
                      <div className="text-[10px] text-right font-bold text-muted-foreground">{form.bio.length}/300</div>
                    </div>

                    {!user && (
                      <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email</Label>
                          <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Mot de passe</Label>
                          <Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-12 rounded-xl" />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full h-16 rounded-2xl font-black text-xl gap-3 btn-glow">
                    {submitting ? (
                      <div className="flex items-center gap-3">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Settings size={20} /></motion.div>
                        {submitStep}
                      </div>
                    ) : (
                      <>Créer ma boutique →</>
                    )}
                  </Button>
                </form>
              </div>

              {/* LIVE PREVIEW */}
              <div className="sticky top-32 space-y-6">
                <div className="text-center">
                  <Badge variant="outline" className="px-3 py-1 border-primary/20 text-primary font-black text-[10px] uppercase tracking-widest">Aperçu en direct</Badge>
                </div>
                <div className="p-8 rounded-[3rem] bg-card border border-primary/20 shadow-2xl space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-20"><Sparkles size={40} className="text-primary" /></div>
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20 flex items-center justify-center shadow-inner overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-3xl font-black text-primary">{storeInitials}</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black">{form.shopName || "Votre Boutique"}</h3>
                      <div className="flex items-center justify-center gap-2">
                        <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-tighter">
                          Plan {PLANS.find(p => p.id === selectedPlan)?.name}
                        </Badge>
                        {form.niche && <Badge variant="outline" className="text-[9px] border-white/10 uppercase tracking-tighter">{form.niche}</Badge>}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 italic">
                      {form.bio || "Votre bio s'affichera ici pour inspirer confiance à vos clients..."}
                    </p>
                    <div className="w-full pt-4 grid grid-cols-2 gap-3 opacity-50">
                      <div className="h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black uppercase tracking-widest">0 Produit</div>
                      <div className="h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[10px] font-black uppercase tracking-widest">0 Vente</div>
                    </div>
                    <Button disabled className="w-full h-12 rounded-xl bg-white/5 text-muted-foreground border-dashed border-white/10 mt-4">Voir la boutique</Button>
                  </div>
                </div>
                <p className="text-center text-[10px] font-bold text-muted-foreground">Voici exactement ce que verront vos clients</p>
              </div>
            </motion.div>
          )}

          {/* STEP 3 : SUCCESS SCREEN */}
          {currentStep === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center space-y-12 py-12"
            >
              <div className="relative">
                <div className="absolute inset-0 animate-ping opacity-20"><CheckCircle2 size={120} className="text-emerald-500 mx-auto" /></div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="relative z-10"
                >
                  <CheckCircle2 size={120} className="text-emerald-500 mx-auto" strokeWidth={1} />
                </motion.div>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
                  Votre boutique <br /> <span className="text-gradient-primary">est en ligne ! 🚀</span>
                </h1>
                <p className="text-muted-foreground font-medium">Félicitations {form.shopName}, votre aventure de créateur commence maintenant.</p>
              </div>

              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Lien de votre boutique</p>
                <div className="flex items-center gap-2 p-3 bg-black/40 rounded-xl border border-white/5 group">
                  <code className="flex-1 text-sm font-bold text-primary truncate">mindhubs.fun/store/{form.username}</code>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`mindhubs.fun/store/${form.username}`);
                      toast.success("URL copiée !");
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {selectedPlan !== "free" && (
                <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/20 text-left space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-lg text-zinc-950"><Star size={20} /></div>
                    <h4 className="font-black">Activez votre plan {PLANS.find(p => p.id === selectedPlan)?.name}</h4>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    Pour profiter de tous les avantages, effectuez votre paiement par Orange Money ou Wave au <span className="text-white font-black underline">+225 00 00 00 00</span>.
                  </p>
                  <Button variant="outline" className="w-full rounded-xl border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest">
                    J'ai effectué le paiement
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button asChild className="h-16 rounded-2xl font-black text-lg gap-2 btn-glow">
                  <Link to="/dashboard/new-product"><PlusCircle size={20} /> Ajouter mon 1er produit</Link>
                </Button>
                <Button asChild variant="outline" className="h-16 rounded-2xl font-black text-lg gap-2 border-white/10">
                  <Link to={`/store/${form.username}`}><LayoutDashboard size={20} /> Voir ma boutique</Link>
                </Button>
                <Button asChild variant="ghost" className="h-12 rounded-xl text-muted-foreground font-bold hover:text-white col-span-full">
                  <Link to="/dashboard/settings">Configurer mon profil</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <FooterSection />
    </div>
  );
};

export default BecomeSeller;
