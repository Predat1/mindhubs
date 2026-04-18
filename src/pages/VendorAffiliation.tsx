import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Sparkles, Users, DollarSign, Link as LinkIcon, Copy, Gift } from "lucide-react";

const VendorAffiliationInner = ({ shopName, shopUrl, username }: { shopName: string; shopUrl: string; username: string }) => {
  const refLink = `${window.location.origin}/become-a-seller?ref=${username}`;

  const copyRef = () => {
    navigator.clipboard.writeText(refLink);
    toast({ title: "Lien d'affiliation copié ✓" });
  };

  return (
    <DashboardLayout variant="vendor" title="Affiliation" shopName={shopName} shopUrl={shopUrl}>
      <SEO title="Affiliation — Vendeur" description="Programme d'affiliation" path="/dashboard/affiliation" />

      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
            Programme d'affiliation
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">Bêta</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Gagnez de l'argent en parrainant d'autres vendeurs sur MIND✦HUB.</p>
        </div>

        {/* Hero */}
        <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-accent/15 via-card to-primary/10 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Gift size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-foreground">Gagnez 10% des ventes de vos filleuls</h3>
              <p className="mt-1 text-sm text-muted-foreground">Pendant les 6 premiers mois après leur inscription via votre lien.</p>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <code className="flex-1 truncate rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                  {refLink}
                </code>
                <Button onClick={copyRef} className="rounded-lg">
                  <Copy size={14} /> Copier mon lien
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Users, label: "Filleuls actifs", value: "0" },
            { icon: DollarSign, label: "Commissions gagnées", value: "0 CFA" },
            { icon: LinkIcon, label: "Clics sur votre lien", value: "0" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
            <Sparkles size={16} className="text-primary" /> Comment ça marche
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { n: 1, t: "Partagez votre lien", d: "Diffusez votre lien d'affiliation sur vos réseaux." },
              { n: 2, t: "Vos filleuls s'inscrivent", d: "Ils créent leur boutique via votre lien." },
              { n: 3, t: "Vous gagnez", d: "Touchez 10% de leurs ventes pendant 6 mois." },
            ].map((step) => (
              <div key={step.n} className="rounded-xl border border-border bg-background/50 p-4">
                <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {step.n}
                </div>
                <p className="text-sm font-bold text-foreground">{step.t}</p>
                <p className="mt-1 text-xs text-muted-foreground">{step.d}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

const VendorAffiliation = () => (
  <VendorGuard>
    {(vendor) => <VendorAffiliationInner shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`} username={vendor.username} />}
  </VendorGuard>
);

export default VendorAffiliation;
