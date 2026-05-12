import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Palette, Globe, Megaphone, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PreferencesPanelProps {
  vendorId: string;
  open: boolean;
  onClose: () => void;
}

const STYLE_OPTIONS = [
  { value: "ugc", label: "UGC Authentique" },
  { value: "cinematique", label: "Cinématique Premium" },
  { value: "minimaliste", label: "Minimaliste / Épuré" },
  { value: "luxe", label: "Luxe / Haut de gamme" },
  { value: "energique", label: "Énergique / Dynamique" },
  { value: "educatif", label: "Éducatif / Tutoriel" },
];

const PLATFORM_OPTIONS = [
  { value: "facebook", label: "Facebook Ads" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "whatsapp", label: "WhatsApp Status" },
  { value: "google", label: "Google Ads" },
];

const COUNTRY_OPTIONS = [
  { value: "BJ", label: "🇧🇯 Bénin" },
  { value: "SN", label: "🇸🇳 Sénégal" },
  { value: "CI", label: "🇨🇮 Côte d'Ivoire" },
  { value: "CM", label: "🇨🇲 Cameroun" },
  { value: "TG", label: "🇹🇬 Togo" },
  { value: "BF", label: "🇧🇫 Burkina Faso" },
  { value: "ML", label: "🇲🇱 Mali" },
  { value: "GA", label: "🇬🇦 Gabon" },
  { value: "CD", label: "🇨🇩 RD Congo" },
  { value: "MG", label: "🇲🇬 Madagascar" },
  { value: "FR", label: "🇫🇷 France" },
];

const TONE_OPTIONS = [
  { value: "authentique", label: "Authentique" },
  { value: "professionnel", label: "Professionnel" },
  { value: "decontracte", label: "Décontracté" },
  { value: "urgence", label: "Urgence / FOMO" },
  { value: "inspirant", label: "Inspirant" },
  { value: "humoristique", label: "Humoristique" },
];

interface Prefs {
  preferred_style: string;
  target_platforms: string[];
  target_countries: string[];
  brand_colors: string[];
  tone: string;
  custom_instructions: string;
}

const DEFAULT_PREFS: Prefs = {
  preferred_style: "ugc",
  target_platforms: ["facebook", "tiktok", "instagram"],
  target_countries: ["BJ", "SN", "CI"],
  brand_colors: [],
  tone: "authentique",
  custom_instructions: "",
};

const PreferencesPanel = ({ vendorId, open, onClose }: PreferencesPanelProps) => {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newColor, setNewColor] = useState("#8B5CF6");

  useEffect(() => {
    if (!open || !vendorId) return;
    setLoading(true);
    (async () => {
      const { data } = await (supabase as any)
        .from("cinema_preferences")
        .select("*")
        .eq("vendor_id", vendorId)
        .maybeSingle();
      if (data) {
        setPrefs({
          preferred_style: data.preferred_style || "ugc",
          target_platforms: data.target_platforms || ["facebook", "tiktok", "instagram"],
          target_countries: data.target_countries || ["BJ", "SN", "CI"],
          brand_colors: data.brand_colors || [],
          tone: data.tone || "authentique",
          custom_instructions: data.custom_instructions || "",
        });
      }
      setLoading(false);
    })();
  }, [open, vendorId]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await (supabase as any)
      .from("cinema_preferences")
      .upsert({
        vendor_id: vendorId,
        ...prefs,
        updated_at: new Date().toISOString(),
      });
    setSaving(false);
    if (error) {
      toast.error("Erreur lors de la sauvegarde.");
      console.error(error);
    } else {
      toast.success("Préférences sauvegardées !");
      onClose();
    }
  };

  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h2 className="text-sm font-black tracking-tight">Préférences Créatives</h2>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="p-4 space-y-6">

                {/* Style */}
                <section className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <Megaphone className="w-3.5 h-3.5" /> Style préféré
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {STYLE_OPTIONS.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setPrefs(p => ({ ...p, preferred_style: s.value }))}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                          prefs.preferred_style === s.value
                            ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                            : "border-white/5 hover:border-white/15 text-muted-foreground"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Platforms */}
                <section className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <Globe className="w-3.5 h-3.5" /> Plateformes cibles
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PLATFORM_OPTIONS.map(p => (
                      <button
                        key={p.value}
                        onClick={() => setPrefs(prev => ({ ...prev, target_platforms: toggleArray(prev.target_platforms, p.value) }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          prefs.target_platforms.includes(p.value)
                            ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
                            : "border-white/5 hover:border-white/15 text-muted-foreground"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Countries */}
                <section className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <Globe className="w-3.5 h-3.5" /> Pays cibles
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {COUNTRY_OPTIONS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setPrefs(prev => ({ ...prev, target_countries: toggleArray(prev.target_countries, c.value) }))}
                        className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          prefs.target_countries.includes(c.value)
                            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                            : "border-white/5 hover:border-white/15 text-muted-foreground"
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Brand Colors */}
                <section className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <Palette className="w-3.5 h-3.5" /> Couleurs de marque
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {prefs.brand_colors.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setPrefs(p => ({ ...p, brand_colors: p.brand_colors.filter((_, idx) => idx !== i) }))}
                        className="w-8 h-8 rounded-lg border-2 border-white/10 hover:border-destructive/50 transition-colors relative group"
                        style={{ backgroundColor: c }}
                        title={`${c} — cliquer pour supprimer`}
                      >
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-white text-[10px] font-bold bg-black/40 rounded-lg">✕</span>
                      </button>
                    ))}
                    <div className="flex items-center gap-1">
                      <input
                        type="color"
                        value={newColor}
                        onChange={e => setNewColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-white/10"
                      />
                      <button
                        onClick={() => {
                          if (prefs.brand_colors.length >= 5) { toast.error("Max 5 couleurs."); return; }
                          setPrefs(p => ({ ...p, brand_colors: [...p.brand_colors, newColor] }));
                        }}
                        className="px-2 py-1 rounded-md bg-muted/40 border border-white/5 text-xs font-medium hover:bg-muted/60 transition-colors"
                      >
                        + Ajouter
                      </button>
                    </div>
                  </div>
                </section>

                {/* Tone */}
                <section className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <MessageSquare className="w-3.5 h-3.5" /> Ton de communication
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {TONE_OPTIONS.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setPrefs(p => ({ ...p, tone: t.value }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                          prefs.tone === t.value
                            ? "bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-300"
                            : "border-white/5 hover:border-white/15 text-muted-foreground"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Custom Instructions */}
                <section className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Instructions personnalisées
                  </label>
                  <textarea
                    value={prefs.custom_instructions}
                    onChange={e => setPrefs(p => ({ ...p, custom_instructions: e.target.value }))}
                    placeholder="Ex: Toujours inclure le logo en bas à droite, utiliser un ton proche du client..."
                    rows={3}
                    className="w-full resize-none rounded-xl bg-muted/40 border border-white/10 px-3 py-2 text-sm outline-none focus:border-violet-500/30 transition-colors"
                  />
                </section>

                {/* Save */}
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Sauvegarder les préférences
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PreferencesPanel;
