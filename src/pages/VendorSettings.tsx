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
import { Save, Loader2, Upload, AlertTriangle, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

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
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${vendor.user_id}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, avatar_url: data.publicUrl }));
      toast({ title: "Avatar uploadé" });
    } catch (e: unknown) {
      toast({ title: "Erreur", description: (e as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleBanner = async (file: File) => {
    setUploadingBanner(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${vendor.user_id}/banner-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setForm((f) => ({ ...f, banner_url: data.publicUrl }));
      toast({ title: "Bannière uploadée" });
    } catch (e: unknown) {
      toast({ title: "Erreur", description: (e as Error).message, variant: "destructive" });
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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
      toast({ title: "Boutique mise à jour ✓" });
      queryClient.invalidateQueries({ queryKey: ["current-vendor"] });
      queryClient.invalidateQueries({ queryKey: ["vendor"] });
    } catch (e: unknown) {
      toast({ title: "Erreur", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout variant="vendor" title="Paramètres" shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`}>
      <SEO title="Paramètres — Vendeur" description="Réglages boutique" path="/dashboard/settings" />

      <div className="mx-auto max-w-3xl space-y-6 pb-12">
        <div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Paramètres</h2>
          <p className="mt-1 text-sm text-muted-foreground">Gérez les informations publiques et le design de votre boutique.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Informations Générales</h3>
            
            <div className="space-y-2">
              <Label>Avatar de la boutique</Label>
              <div className="flex items-center gap-4">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-lg font-bold text-primary">
                    {form.shop_name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent transition-colors">
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploading ? "Upload…" : "Changer"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleAvatar(e.target.files[0])} />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shop_name">Nom de la boutique</Label>
              <Input id="shop_name" value={form.shop_name} onChange={(e) => setForm({ ...form, shop_name: e.target.value })} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">URL boutique</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">/store/</span>
                <Input id="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </div>
              <p className="text-[10px] text-muted-foreground">Lettres minuscules, chiffres et tirets uniquement.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Bio)</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Présentez votre expertise…" />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Design & Boutique Standalone</h3>
            
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Mode Boutique Unique</Label>
                    <p className="text-[10px] text-muted-foreground">Masquer la navigation MindHubs sur votre lien direct.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setForm(f => ({ ...f, standalone_mode: !f.standalone_mode }))}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${form.standalone_mode ? 'bg-primary' : 'bg-muted'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.standalone_mode ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
               </div>

               <div className="space-y-2">
                 <Label>Bannière de couverture</Label>
                 <div className="relative h-32 w-full rounded-xl bg-muted overflow-hidden border border-border group">
                    {form.banner_url ? (
                      <img src={form.banner_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <Upload size={24} />
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                       <span className="bg-white text-black px-4 py-2 rounded-full text-xs font-black">
                         {uploadingBanner ? "Upload en cours..." : "Changer la bannière"}
                       </span>
                       <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleBanner(e.target.files[0])} />
                    </label>
                 </div>
               </div>

               <div className="space-y-2">
                  <Label>Couleur de marque principale</Label>
                  <div className="flex items-center gap-4">
                     <input 
                       type="color" 
                       value={form.primary_color} 
                       onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                       className="h-10 w-20 rounded-lg cursor-pointer bg-transparent"
                     />
                     <Input 
                       value={form.primary_color} 
                       onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                       className="w-32 font-mono uppercase"
                     />
                  </div>
               </div>
            </div>
          </section>

          <Button type="submit" disabled={saving} className="rounded-full h-12 px-8 btn-glow">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Enregistrer les modifications
          </Button>
        </form>

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
           <div>
             <h3 className="text-sm font-bold text-foreground">Préférences visuelles</h3>
             <p className="text-xs text-muted-foreground">Interface du tableau de bord.</p>
           </div>
           <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                 </div>
                 <div>
                    <p className="text-sm font-bold">{theme === "dark" ? "Mode Sombre" : "Mode Clair"}</p>
                    <p className="text-[10px] text-muted-foreground">Cliquez pour changer l'ambiance.</p>
                 </div>
              </div>
              <Button onClick={toggleTheme} variant="outline" size="sm" className="rounded-xl border-white/10">
                 Basculer
              </Button>
           </div>
        </section>

        <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="shrink-0 text-destructive" size={20} />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-foreground">Zone dangereuse</h3>
              <p className="mt-1 text-xs text-muted-foreground">Déconnectez-vous de votre compte vendeur.</p>
              <Button onClick={signOut} variant="outline" size="sm" className="mt-3 rounded-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive">
                Se déconnecter
              </Button>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

const VendorSettings = () => (
  <VendorGuard>{(vendor) => <VendorSettingsInner vendor={vendor} />}</VendorGuard>
);

export default VendorSettings;
