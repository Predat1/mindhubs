import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  Globe2,
  ImagePlus,
  Package,
  Share2,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  WandSparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import MindHubsMark from "@/components/brand/MindHubsMark";

const CHANNELS = [
  {
    icon: Store,
    label: "Votre boutique",
    title: "Construisez votre propre espace de vente.",
    text: "Un lien unique, votre ordre de produits et votre identité. Partagez votre boutique où vous le souhaitez.",
    points: ["Lien mindhubs.fun/store/votre-nom", "Présentation et catalogue personnalisables", "Trafic depuis vos réseaux et vos campagnes"],
    accent: "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20",
  },
  {
    icon: Globe2,
    label: "La marketplace",
    title: "Proposez vos produits à la découverte.",
    text: "Publiez uniquement les produits que vous choisissez et profitez d’un canal de découverte supplémentaire.",
    points: ["Publication facultative", "Recherche et catégories MindHubs", "Statistiques séparées par canal"],
    accent: "bg-brand-magenta/10 text-brand-magenta border-brand-magenta/20",
  },
];

const FEATURES = [
  { icon: Package, title: "Digital, physique ou hybride", text: "Vendez des formations, ebooks, modèles, services, produits physiques ou plusieurs formats ensemble." },
  { icon: WandSparkles, title: "Créez plus vite", text: "Structurez une offre, améliorez une description et préparez des visuels depuis votre espace vendeur." },
  { icon: ImagePlus, title: "Présentez mieux vos offres", text: "Ajoutez images, preuves sociales, détails, FAQ et éléments de confiance à vos pages de vente." },
  { icon: BarChart3, title: "Comprenez vos résultats", text: "Distinguez les vues, commandes et revenus venant de votre boutique, de la marketplace ou de vos liens externes." },
];

const STEPS = [
  { number: "01", title: "Créez votre boutique", text: "Un nom et une URL suffisent pour obtenir votre espace vendeur." },
  { number: "02", title: "Publiez votre premier produit", text: "Ajoutez votre offre, son prix, ses contenus et son mode de livraison." },
  { number: "03", title: "Partagez et développez", text: "Envoyez votre lien, activez la marketplace si vous le souhaitez et suivez vos ventes." },
];

const FAQS = [
  { question: "Dois-je publier dans la marketplace ?", answer: "Non. Votre boutique personnelle est votre espace principal. Vous choisissez ensuite les produits que vous souhaitez proposer dans la marketplace." },
  { question: "Puis-je vendre des produits physiques ?", answer: "Oui. MindHubs prend en charge les produits digitaux, physiques et hybrides. Les informations de stock et de livraison sont configurées au niveau du produit." },
  { question: "Puis-je commencer gratuitement ?", answer: "Oui. La création de votre boutique et l’ajout de produits sont accessibles dès votre inscription." },
  { question: "MindHubs garantit-il du trafic ou des ventes ?", answer: "Non. La marketplace apporte une opportunité de découverte, mais les résultats dépendent de votre offre, de votre contenu, de votre prix et de votre promotion." },
];

export default function VendorLanding() {
  const reduce = useReducedMotion();
  const entrance = reduce ? undefined : { opacity: 0, y: 14 };

  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <SEO
        title="Devenir vendeur | Créez votre boutique MindHubs"
        description="Créez votre boutique MindHubs, vendez vos produits digitaux ou physiques et choisissez librement votre distribution."
        path="/become-a-seller"
        keywords="devenir vendeur, créer une boutique en ligne, vendre produits digitaux, marketplace Afrique"
      />

      <main>
        <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 sm:pb-28 lg:px-8 lg:pt-36">
          <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[min(80vw,900px)] -translate-x-1/2 rounded-full bg-brand-cyan/10 blur-3xl" aria-hidden="true" />
          <div className="relative grid items-center gap-14 lg:grid-cols-[1.04fr_0.96fr] lg:gap-20">
            <motion.div initial={entrance} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-cyan"><Sparkles className="size-3.5" aria-hidden="true" /> Pour créateurs et vendeurs</div>
              <h1 className="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-[-0.055em] sm:text-6xl lg:text-7xl">Construisez votre boutique. Vendez à votre façon.</h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">MindHubs vous donne un espace de vente personnel, des outils pour présenter vos offres et un catalogue public optionnel pour être découvert.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-6"><Link to="/become-a-seller/start">Commencer gratuitement <ArrowRight className="size-4" aria-hidden="true" /></Link></Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6"><Link to="/boutique">Explorer la marketplace</Link></Button>
              </div>
              <p className="mt-4 text-xs text-text-subtle">Aucune carte bancaire requise pour commencer. La marketplace reste facultative.</p>
            </motion.div>

            <motion.div initial={reduce ? undefined : { opacity: 0, y: 18, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.42, delay: reduce ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }} className="relative">
              <div className="absolute -inset-4 rounded-[2rem] border border-brand-cyan/10 bg-brand-cyan/5 blur-xl" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-black/25">
                <div className="flex items-center justify-between border-b border-border px-5 py-4"><div className="flex items-center gap-2 text-sm font-semibold"><span className="grid size-7 place-items-center rounded-lg bg-brand-cyan/10"><MindHubsMark size={19} decorative /></span> Votre espace vendeur</div><span className="rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-[10px] font-medium text-success">Prêt à lancer</span></div>
                <div className="p-5 sm:p-7">
                  <div className="rounded-2xl border border-border bg-surface-secondary p-5"><p className="text-xs text-muted-foreground">Votre boutique</p><p className="mt-2 text-xl font-semibold tracking-[-0.03em]">Atelier Digital</p><p className="mt-1 text-xs text-brand-cyan">mindhubs.fun/store/atelier-digital</p><div className="mt-6 flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-brand-cyan text-xs font-semibold text-background">AD</span><div className="h-2 w-28 rounded-full bg-muted" /><div className="ml-auto h-8 w-20 rounded-lg bg-brand-cyan/15" /></div></div>
                  <div className="mt-4 grid grid-cols-3 gap-3"><div className="rounded-xl border border-border bg-background p-3"><p className="text-[10px] text-muted-foreground">Produits</p><p className="mt-1 text-lg font-semibold">03</p></div><div className="rounded-xl border border-border bg-background p-3"><p className="text-[10px] text-muted-foreground">Boutique</p><p className="mt-1 text-lg font-semibold text-success">Active</p></div><div className="rounded-xl border border-border bg-background p-3"><p className="text-[10px] text-muted-foreground">Canal</p><p className="mt-1 text-lg font-semibold text-brand-cyan">2</p></div></div>
                  <div className="mt-5 space-y-2"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="size-3.5 text-success" /> Créer votre boutique</div><div className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="size-3.5 text-success" /> Ajouter un premier produit</div><div className="flex items-center gap-2 text-xs text-text-subtle"><span className="grid size-3.5 place-items-center rounded-full border border-border text-[9px]">3</span> Choisir vos canaux de distribution</div></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-border bg-surface-secondary/40">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-cyan">Deux canaux, un seul produit</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Votre boutique vous appartient. La marketplace vous ouvre une porte supplémentaire.</h2><p className="mt-4 text-sm leading-6 text-muted-foreground">Le produit reste unique dans votre espace. Vous décidez où il est visible, sans devoir créer deux fiches différentes.</p></div>
            <div className="mt-10 grid gap-4 lg:grid-cols-2">{CHANNELS.map(({ icon: Icon, label, title, text, points, accent }) => <div key={label} className="rounded-2xl border border-border bg-card p-6 sm:p-8"><div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${accent}`}><Icon className="size-3.5" aria-hidden="true" /> {label}</div><h3 className="mt-6 text-2xl font-semibold tracking-[-0.035em]">{title}</h3><p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">{text}</p><ul className="mt-6 space-y-3">{points.map((point) => <li key={point} className="flex items-start gap-2 text-sm text-text-secondary"><Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" /> {point}</li>)}</ul></div>)}</div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="text-center"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-cyan">Tout au même endroit</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Les outils essentiels pour vendre proprement.</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">Commencez avec l’essentiel. Activez les fonctions avancées seulement lorsqu’elles deviennent utiles pour votre activité.</p></div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{FEATURES.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand-cyan/30"><div className="grid size-10 place-items-center rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 text-brand-cyan"><Icon className="size-5" aria-hidden="true" /></div><h3 className="mt-5 text-base font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}</div>
        </section>

        <section className="border-y border-border bg-surface-secondary/40">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8"><div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-cyan">Simple à démarrer</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">De l’idée au premier lien partagé.</h2><p className="mt-4 text-sm leading-6 text-muted-foreground">Vous pouvez commencer petit, apprendre ce qui fonctionne et enrichir votre boutique au fil de vos ventes.</p></div><div className="space-y-4">{STEPS.map(({ number, title, text }) => <div key={number} className="flex gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6"><span className="text-sm font-semibold text-brand-cyan">{number}</span><div><h3 className="text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div></div>)}</div></div></div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8"><div className="grid gap-5 sm:grid-cols-3"><div className="rounded-2xl border border-border bg-card p-6"><ShoppingBag className="size-5 text-brand-cyan" aria-hidden="true" /><h3 className="mt-5 text-lg font-semibold">Produits digitaux</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Formations, ebooks, modèles, fichiers, ressources et contenus téléchargeables.</p></div><div className="rounded-2xl border border-border bg-card p-6"><Truck className="size-5 text-brand-cyan" aria-hidden="true" /><h3 className="mt-5 text-lg font-semibold">Produits physiques</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Stock, informations de livraison et suivi adaptés à vos produits physiques.</p></div><div className="rounded-2xl border border-border bg-card p-6"><Share2 className="size-5 text-brand-cyan" aria-hidden="true" /><h3 className="mt-5 text-lg font-semibold">Offres hybrides</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Combinez un produit physique avec un guide, une formation ou un bonus digital.</p></div></div></section>

        <section className="border-y border-border bg-surface-secondary/40"><div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8"><div className="text-center"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-cyan">Questions fréquentes</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Avant de commencer</h2></div><div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card px-5 sm:px-7">{FAQS.map(({ question, answer }) => <details key={question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-semibold [&::-webkit-details-marker]:hidden">{question}<ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" /></summary><p className="max-w-2xl pt-3 text-sm leading-6 text-muted-foreground">{answer}</p></details>)}</div></div></section>

        <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8"><div className="relative overflow-hidden rounded-3xl border border-brand-cyan/20 bg-brand-cyan/5 p-8 text-center sm:p-12"><div className="pointer-events-none absolute left-1/2 top-0 h-44 w-96 -translate-x-1/2 rounded-full bg-brand-cyan/10 blur-3xl" aria-hidden="true" /><div className="relative"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-cyan">Prêt à commencer ?</p><h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">Créez votre espace vendeur aujourd’hui.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">Votre boutique peut être prête en quelques minutes. Vous choisirez ensuite quoi vendre, où le publier et comment le développer.</p><Button asChild size="lg" className="relative mt-8 h-12 px-6"><Link to="/become-a-seller/start">Créer ma boutique <ArrowRight className="size-4" aria-hidden="true" /></Link></Button></div></div></section>
      </main>

      <FooterSection showContactCta={false} />
    </div>
  );
}
