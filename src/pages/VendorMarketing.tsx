import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VendorGuard from "@/components/dashboard/VendorGuard";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Megaphone, Mail, Share2, Percent, Tag, Send, Copy } from "lucide-react";

const VendorMarketingInner = ({ shopName, shopUrl, username }: { shopName: string; shopUrl: string; username: string }) => {
  const fullShopUrl = `${window.location.origin}/store/${username}`;

  const copyShopLink = () => {
    navigator.clipboard.writeText(fullShopUrl);
    toast({ title: "Lien boutique copié ✓" });
  };

  const tools = [
    { icon: Percent, title: "Codes promo", desc: "Créez des réductions limitées dans le temps", soon: true },
    { icon: Mail, title: "Email marketing", desc: "Envoyez une newsletter à vos clients", soon: true },
    { icon: Tag, title: "Bundles produits", desc: "Vendez plusieurs produits en pack", soon: true },
    { icon: Send, title: "Notifications push", desc: "Alertez vos clients en temps réel", soon: true },
  ];

  return (
    <DashboardLayout variant="vendor" title="Marketing" shopName={shopName} shopUrl={shopUrl}>
      <SEO title="Marketing — Vendeur" description="Outils marketing" path="/dashboard/marketing" />

      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Marketing</h2>
          <p className="mt-1 text-sm text-muted-foreground">Augmentez vos ventes avec ces outils de promotion.</p>
        </div>

        {/* Share shop hero */}
        <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Share2 size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-foreground">Partagez votre boutique</h3>
              <p className="mt-1 text-sm text-muted-foreground">Le moyen le plus simple d'attirer des clients : partagez ce lien partout.</p>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <code className="flex-1 truncate rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
                  {fullShopUrl}
                </code>
                <Button onClick={copyShopLink} className="rounded-lg">
                  <Copy size={14} /> Copier le lien
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(`Découvrez ma boutique ${shopName} : ${fullShopUrl}`)}`} target="_blank" rel="noreferrer" className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">
                  WhatsApp
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullShopUrl)}`} target="_blank" rel="noreferrer" className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">
                  Facebook
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Découvrez ${shopName}`)}&url=${encodeURIComponent(fullShopUrl)}`} target="_blank" rel="noreferrer" className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">
                  Twitter
                </a>
                <a href={`mailto:?subject=${encodeURIComponent(shopName)}&body=${encodeURIComponent(`Découvrez ma boutique : ${fullShopUrl}`)}`} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">
                  Email
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Tools */}
        <div>
          <h3 className="mb-4 text-base font-bold text-foreground">Outils marketing</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {tools.map(({ icon: Icon, title, desc, soon }) => (
              <div key={title} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/30">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{title}</p>
                    {soon && <span className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground">Bientôt</span>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <Megaphone className="shrink-0 text-primary" size={22} />
            <div>
              <h3 className="text-base font-bold text-foreground">Conseils pour vendre plus</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>✓ Ajoutez au moins 3-5 produits dans votre boutique pour donner du choix</li>
                <li>✓ Soignez les images de vos produits (carrées, lumineuses, sans texte)</li>
                <li>✓ Rédigez des descriptions claires en mentionnant les bénéfices</li>
                <li>✓ Partagez votre lien boutique régulièrement sur vos réseaux sociaux</li>
                <li>✓ Répondez rapidement aux clients pour bâtir la confiance</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

const VendorMarketing = () => (
  <VendorGuard>
    {(vendor) => <VendorMarketingInner shopName={vendor.shop_name} shopUrl={`/store/${vendor.username}`} username={vendor.username} />}
  </VendorGuard>
);

export default VendorMarketing;
