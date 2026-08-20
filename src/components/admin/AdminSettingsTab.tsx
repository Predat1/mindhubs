import { useState } from "react";
import { Bell, CheckCircle2, Loader2, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface AdminSettingsTabProps {
  logAction: (action: string, details: string) => Promise<void>;
}

const AdminSettingsTab = ({ logAction }: AdminSettingsTabProps) => {
  const [notif, setNotif] = useState({ title: "", message: "", type: "info", link: "" });
  const [sendingNotif, setSendingNotif] = useState(false);

  const handleSendNotification = async (event: React.FormEvent) => {
    event.preventDefault();
    setSendingNotif(true);
    try {
      const { error } = await (supabase as any).from("global_notifications").insert([{
        ...notif,
        created_at: new Date().toISOString(),
      }]);
      if (error) throw error;
      await logAction("GLOBAL_NOTIF_SENT", `Titre: ${notif.title}`);
      toast.success("Notification envoyée à tous les vendeurs.");
      setNotif({ title: "", message: "", type: "info", link: "" });
    } catch (error) {
      toast.error("Impossible d’envoyer la notification", { description: (error as Error).message });
    } finally {
      setSendingNotif(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Store size={21} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Catalogue multivendeur</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Le catalogue est ouvert : les vendeurs autorisés peuvent créer autant de produits que nécessaire. La boutique et la marketplace restent contrôlées séparément par publication.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
              <CheckCircle2 size={14} aria-hidden="true" /> Catalogue multivendeur ouvert
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary"><Bell size={21} aria-hidden="true" /></div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Notifications globales</h2>
            <p className="text-xs text-muted-foreground">Envoyer une information importante à tous les vendeurs.</p>
          </div>
        </div>

        <Card className="rounded-3xl border-border p-6 sm:p-8">
          <form onSubmit={handleSendNotification} className="max-w-2xl space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-xs font-semibold">
                <span>Titre</span>
                <Input required value={notif.title} onChange={(event) => setNotif({ ...notif, title: event.target.value })} placeholder="Ex. Maintenance du système" />
              </label>
              <label className="space-y-2 text-xs font-semibold">
                <span>Type</span>
                <select value={notif.type} onChange={(event) => setNotif({ ...notif, type: event.target.value })} className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="info">Information</option>
                  <option value="success">Succès / mise à jour</option>
                  <option value="warning">Avertissement</option>
                  <option value="new_product">Nouveau produit</option>
                </select>
              </label>
            </div>
            <label className="block space-y-2 text-xs font-semibold">
              <span>Message</span>
              <textarea required value={notif.message} onChange={(event) => setNotif({ ...notif, message: event.target.value })} className="min-h-28 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Écrivez votre message ici…" />
            </label>
            <label className="block space-y-2 text-xs font-semibold">
              <span>Lien facultatif</span>
              <Input value={notif.link} onChange={(event) => setNotif({ ...notif, link: event.target.value })} placeholder="https://mindhubs.fun/…" />
            </label>
            <Button type="submit" disabled={sendingNotif} className="h-11 rounded-xl gap-2">
              {sendingNotif ? <Loader2 className="animate-spin" size={16} /> : <Bell size={16} aria-hidden="true" />} Diffuser l’annonce
            </Button>
          </form>
        </Card>
      </section>
    </div>
  );
};

export default AdminSettingsTab;
