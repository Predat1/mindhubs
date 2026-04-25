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
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm({
      shop_name: vendor.shop_name,
      username: vendor.username,
      description: vendor.description || "",
      avatar_url: vendor.avatar_url || "",
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

      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Paramètres</h2>
          <p className="mt-1 text-sm text-muted-foreground">Gérez les informations publiques de votre boutique.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
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
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
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
            <p className="text-xs text-muted-foreground">Lettres minuscules, chiffres et tirets uniquement.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Présentez votre boutique en quelques phrases…" />
          </div>

          <Button type="submit" disabled={saving} className="rounded-full">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Enregistrer
          </Button>
        </form>

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
           <div>
             <h3 className="text-sm font-bold text-foreground">Préférences visuelles</h3>
             <p className="text-xs text-muted-foreground">Personnalisez votre interface de travail.</p>
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

        {/* Danger zone */}
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
