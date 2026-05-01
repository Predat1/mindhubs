import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type { Vendor } from "@/hooks/useVendors";
import { 
  Save, Loader2, Upload, AlertTriangle, Sun, Moon, 
  User, Image as ImageIcon, Palette, Globe, Eye,
  BadgeCheck, Zap, Sparkles, Camera
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VendorSettingsInner = ({ vendor }: { vendor: Vendor }) => {
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const [form, setForm] = useState({
    shop_name: vendor.shop_name,
    username: vendor.username,
    description: vendor.description || "",
    avatar_url: vendor.avatar_url || "",
    banner_url: vendor.banner_url || "",
    primary_color: vendor.primary_color || "#F59E0B",
    standalone_mode: vendor.standalone_mode || false,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    setForm({
      shop_name: vendor.shop_name,
      username: vendor.username,
      description: vendor.description || "",
      avatar_url: vendor.avatar_url || "",
      banner_url: vendor.banner_url || "",
      primary_color: vendor.primary_color || "#F59E0B",
      standalone_mode: vendor.standalone_mode || false,
    });
  }, [vendor]);

  const handleAvatar = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
       toast({ title: "Fichier trop lourd", description: "L'image ne doit pas dépasser 2Mo.", variant: "destructive" });
       return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${vendor.user_id}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, avatar_url: data.publicUrl }));
      toast({ title: "Photo de profil mise à jour ✨" });
    } catch (e: any) {
      toast({ title: "Erreur d'upload", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleBanner = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
       toast({ title: "Fichier trop lourd", description: "La bannière ne doit pas dépasser 5Mo.", variant: "destructive" });
       return;
    }
    setUploadingBanner(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${vendor.user_id}/banner-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, banner_url: data.publicUrl }));
      toast({ title: "Bannière mise à jour ✨" });
    } catch (e: any) {
      toast({ title: "Erreur d'upload", description: e.message, variant: "destructive" });
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const username = form.username.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9-]/g, "");
      const { error } = await supabase
        .from("vendors")
        .update({
          shop_name: form.shop_name.trim(),
          username,
          description: form.description.trim() || null,
          avatar_url: form.avatar_url || null,
          banner_url: form.banner_url || null,
          primary_color: form.primary_color,
          standalone_mode: form.standalone_mode,
        })
        .eq("id", vendor.id);
      if (error) throw error;
      toast({ title: "Modifications enregistrées ✓", description: "Votre profil a été mis à jour avec succès." });
      queryClient.invalidateQueries({ queryKey: ["current-vendor"] });
      queryClient.invalidateQueries({ queryKey: ["vendor"] });
    } catch (e: any) {
      toast({ title: "Erreur lors de la sauvegarde", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout variant="vendor" title="Mon Profil & Design" shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`}>
      <SEO title="Mon Profil — MindHubs" description="Personnalisez votre identité visuelle" path="/dashboard/settings" />

      <div className="mx-auto max-w-5xl space-y-8 pb-24">
        {/* Header section with Preview button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
           <div className="space-y-1">
             <h2 className="text-3xl font-black tracking-tighter">Identité de l'Expert</h2>
             <p className="text-sm text-muted-foreground font-medium">Définissez comment vos clients perçoivent votre marque.</p>
           </div>
           <Button asChild variant="outline" className="rounded-2xl h-12 px-6 gap-2 border-white/10 shadow-xl">
              <a href={`/store/${vendor.username}`} target="_blank" rel="noreferrer">
                 <Eye size={16} /> Voir ma boutique
              </a>
           </Button>
        </div>

        <Tabs defaultValue="profil" className="space-y-8">
           <TabsList className="bg-muted/40 p-1.5 h-14 rounded-2xl border border-white/5 backdrop-blur-md">
              <TabsTrigger value="profil" className="rounded-xl px-6 font-black text-xs gap-2 data-[state=active]:bg-card data-[state=active]:shadow-lg">
                 <User size={14} /> Profil & Bio
              </TabsTrigger>
              <TabsTrigger value="design" className="rounded-xl px-6 font-black text-xs gap-2 data-[state=active]:bg-card data-[state=active]:shadow-lg">
                 <ImageIcon size={14} /> Design & Visuels
              </TabsTrigger>
              <TabsTrigger value="preferences" className="rounded-xl px-6 font-black text-xs gap-2 data-[state=active]:bg-card data-[state=active]:shadow-lg">
                 <Palette size={14} /> Préférences
              </TabsTrigger>
           </TabsList>

           <TabsContent value="profil" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-8">
                 {/* Main Form */}
                 <div className="lg:col-span-2 space-y-6">
                    <section className="glass-card rounded-[2.5rem] p-8 space-y-6 border-white/5">
                       <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><User size={20} /></div>
                          <h3 className="text-lg font-black tracking-tight">Informations Publiques</h3>
                       </div>

                       <div className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="shop_name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nom de la boutique</Label>
                            <Input id="shop_name" value={form.shop_name} onChange={(e) => setForm({ ...form, shop_name: e.target.value })} className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold focus:ring-primary/20" />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">URL de votre boutique (Unique)</Label>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-primary opacity-60">mindhubs.com/store/</span>
                              <Input id="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="h-14 rounded-2xl bg-white/5 border-white/10 font-bold focus:ring-primary/20" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Biographie de l'Expert</Label>
                            <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={6} className="rounded-2xl bg-white/5 border-white/10 font-medium leading-relaxed p-4" placeholder="Présentez votre expertise, vos résultats et ce que vos clients vont apprendre avec vous..." />
                          </div>
                       </div>
                    </section>
                 </div>

                 {/* Side Info / Tip */}
                 <div className="space-y-6">
                    <div className="glass-card rounded-[2.5rem] p-8 bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 space-y-4">
                       <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary"><Sparkles size={24} /></div>
                       <h4 className="text-xl font-black leading-tight">Optimisez votre Bio</h4>
                       <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                          Les vendeurs ayant une description de plus de 200 mots et des résultats concrets convertissent 30% mieux. N'hésitez pas à utiliser des emojis !
                       </p>
                    </div>
                 </div>
              </div>
           </TabsContent>

           <TabsContent value="design" className="space-y-8">
              <div className="space-y-8">
                 {/* Banner Section */}
                 <section className="glass-card rounded-[2.5rem] p-8 space-y-6 border-white/5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><ImageIcon size={20} /></div>
                          <h3 className="text-lg font-black tracking-tight">Bannière & Couverture</h3>
                       </div>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recommandé: 1500x500px</p>
                    </div>

                    <div className="relative h-[250px] w-full rounded-[2.5rem] bg-muted/20 overflow-hidden border border-white/5 group shadow-inner">
                       {form.banner_url ? (
                         <img src={form.banner_url} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                       ) : (
                         <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground/30 space-y-3">
                           <ImageIcon size={48} className="opacity-20" />
                           <p className="text-xs font-black uppercase tracking-tighter">Aucune bannière configurée</p>
                         </div>
                       )}
                       
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                          <label className="cursor-pointer flex flex-col items-center gap-2">
                             <div className="h-14 w-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                                {uploadingBanner ? <Loader2 className="animate-spin" size={24} /> : <Camera size={24} />}
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md">Modifier la bannière</span>
                             <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleBanner(e.target.files[0])} />
                          </label>
                       </div>
                       
                       {/* Floating Profile Overlap Preview */}
                       <div className="absolute bottom-6 left-12 h-20 w-20 rounded-2xl bg-card border-4 border-background shadow-2xl overflow-hidden hidden md:block">
                          {form.avatar_url ? <img src={form.avatar_url} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-primary/20 flex items-center justify-center text-primary font-black">PH</div>}
                       </div>
                    </div>
                 </section>

                 <div className="grid lg:grid-cols-2 gap-8">
                    {/* Avatar Upload */}
                    <section className="glass-card rounded-[2.5rem] p-8 space-y-6 border-white/5">
                       <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><User size={20} /></div>
                          <h3 className="text-lg font-black tracking-tight">Photo de Profil</h3>
                       </div>

                       <div className="flex flex-col items-center gap-6">
                          <div className="relative group">
                             <div className="h-40 w-40 rounded-[3rem] bg-muted/20 border-4 border-white/5 overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
                                {form.avatar_url ? (
                                  <img src={form.avatar_url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-primary/40 text-5xl font-black">
                                    {form.shop_name.slice(0, 1).toUpperCase()}
                                  </div>
                                )}
                             </div>
                             <label className="absolute -bottom-2 -right-2 h-12 w-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl cursor-pointer hover:bg-primary/90 transition-colors border-4 border-background">
                                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleAvatar(e.target.files[0])} />
                             </label>
                          </div>
                          <div className="text-center space-y-1">
                             <p className="text-sm font-black uppercase tracking-tight">Image de l'Expert</p>
                             <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Une photo pro augmente la confiance de 80%</p>
                          </div>
                       </div>
                    </section>

                    {/* Branding Colors */}
                    <section className="glass-card rounded-[2.5rem] p-8 space-y-6 border-white/5">
                       <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Palette size={20} /></div>
                          <h3 className="text-lg font-black tracking-tight">Couleurs & Marque</h3>
                       </div>

                       <div className="space-y-6">
                          <div className="space-y-4">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Couleur d'accentuation</Label>
                             <div className="flex items-center gap-6">
                                <div className="h-20 w-20 rounded-[2rem] border-4 border-white/5 shadow-inner" style={{ backgroundColor: form.primary_color }} />
                                <div className="flex-1 space-y-3">
                                   <div className="flex items-center gap-2">
                                      <input 
                                        type="color" 
                                        value={form.primary_color} 
                                        onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                                        className="h-10 w-12 rounded-lg cursor-pointer bg-transparent"
                                      />
                                      <Input 
                                        value={form.primary_color} 
                                        onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                                        className="font-mono uppercase h-10 text-xs font-bold"
                                      />
                                   </div>
                                   <p className="text-[9px] font-bold text-muted-foreground uppercase leading-relaxed">
                                      Cette couleur sera utilisée pour vos boutons, vos badges et les accents de votre boutique.
                                   </p>
                                </div>
                             </div>
                          </div>

                          <div className="pt-4 border-t border-white/5">
                             <div className="flex items-center justify-between">
                                <div>
                                   <Label className="text-sm font-black">Mode Standalone</Label>
                                   <p className="text-[10px] text-muted-foreground font-medium">Faire de votre boutique un site indépendant.</p>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => setForm(f => ({ ...f, standalone_mode: !f.standalone_mode }))}
                                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${form.standalone_mode ? 'bg-primary' : 'bg-white/10'}`}
                                >
                                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.standalone_mode ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                             </div>
                          </div>
                       </div>
                    </section>
                 </div>
              </div>
           </TabsContent>

           <TabsContent value="preferences" className="space-y-6">
              <section className="glass-card rounded-[2.5rem] p-8 space-y-6 border-white/5 max-w-2xl">
                 <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Zap size={20} /></div>
                    <h3 className="text-lg font-black tracking-tight">Préférences Système</h3>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/5 border border-white/5 transition-all hover:border-primary/20">
                       <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-background flex items-center justify-center text-primary shadow-xl">
                             {theme === "dark" ? <Moon size={24} /> : <Sun size={24} />}
                          </div>
                          <div>
                             <p className="font-black text-sm">{theme === "dark" ? "Mode Sombre" : "Mode Clair"}</p>
                             <p className="text-[10px] text-muted-foreground font-medium uppercase">Apparence de votre tableau de bord</p>
                          </div>
                       </div>
                       <Button onClick={toggleTheme} variant="outline" className="rounded-xl border-white/10 font-bold text-xs px-6 h-10">
                          Changer
                       </Button>
                    </div>

                    <div className="pt-10 space-y-4 border-t border-white/5">
                       <h4 className="text-xs font-black uppercase tracking-widest text-destructive/80">Zone Critique</h4>
                       <div className="flex items-center justify-between p-6 rounded-[2rem] bg-destructive/5 border border-destructive/10">
                          <div className="flex items-center gap-4">
                             <div className="h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive shadow-xl">
                                <AlertTriangle size={24} />
                             </div>
                             <div>
                                <p className="font-black text-sm">Déconnexion</p>
                                <p className="text-[10px] text-muted-foreground font-medium uppercase">Quitter votre session actuelle</p>
                             </div>
                          </div>
                          <Button onClick={signOut} variant="outline" className="rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 font-bold text-xs px-6 h-10">
                             Se déconnecter
                          </Button>
                       </div>
                    </div>
                 </div>
              </section>
           </TabsContent>
        </Tabs>

        {/* Global Save Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 right-8 z-50 sm:right-12"
        >
           <Button 
             onClick={handleSave} 
             disabled={saving} 
             className="rounded-full h-16 px-10 btn-glow font-black text-lg gap-3 shadow-2xl"
           >
              {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
              Enregistrer mon Profil
           </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

const VendorSettings = () => (
  <VendorGuard>{(vendor) => <VendorSettingsInner vendor={vendor} />}</VendorGuard>
);

export default VendorSettings;
