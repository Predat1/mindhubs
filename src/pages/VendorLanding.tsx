import { motion } from "framer-motion";
import { 
  Zap, 
  Video, 
  Sparkles, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Rocket, 
  Globe, 
  Wallet,
  Star,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/FooterSection";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "Cinema Studio AI",
    desc: "Générez des publicités vidéos ultra-réalistes (Sora, Veo) en 1 minute. Plus besoin de caméras.",
    icon: Video,
    color: "text-primary"
  },
  {
    title: "Paiements Mobiles",
    desc: "Vendez en Afrique et recevez vos gains instantanément sur Wave, Orange Money ou MTN.",
    icon: Wallet,
    color: "text-emerald-500"
  },
  {
    title: "Marketing Automatisé",
    desc: "L'IA crée vos visuels Facebook Ads et vos textes de vente à votre place.",
    icon: Sparkles,
    color: "text-amber-500"
  }
];

export default function VendorLanding() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <SEO 
        title="Devenez Vendeur Expert | MindHubs AI" 
        description="Lancez votre business de produits numériques avec la puissance de l'IA. Vidéos Sora, paiements Wave/OM et revenus passifs." 
      />
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6">
                L'Ère de l'Intelligence Artificielle est là
              </Badge>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
                Ne vendez plus. <br />
                <span className="text-gradient-primary">Dominez</span> le marché.
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                MindHubs est la première plateforme qui met <span className="text-foreground font-bold">Sora, Veo et ElevenLabs</span> au service de vos ventes. Créez, vendez et encaissez en Afrique.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-primary text-primary-foreground font-black text-lg gap-2 shadow-2xl shadow-primary/30 btn-glow">
                <Link to="/register">LANCER MA BOUTIQUE <Rocket size={20} /></Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 backdrop-blur-md font-black text-lg gap-2">
                <Link to="/marketplace">VOIR LES EXEMPLES</Link>
              </Button>
            </motion.div>

            <div className="pt-12 flex items-center justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
               <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest"><Globe size={16} /> Global Reach</div>
               <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest"><ShieldCheck size={16} /> Secure Payouts</div>
               <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest"><Zap size={16} /> AI Powered</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Power Section — Cinema Studio Showcase */}
      <section className="py-28 md:py-36 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/10 blur-[160px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-fuchsia-500/10 blur-[120px]" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16 space-y-5"
          >
            <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
              <Video size={12} className="mr-1.5 inline" /> Cinema Studio AI
            </Badge>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.95]">
              Votre équipe vidéo <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-primary via-fuchsia-400 to-accent bg-clip-text text-transparent">
                remplacée par l'IA.
              </span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-xl mx-auto">
              Des publicités vidéo ultra-réalistes générées en 90 secondes. Plus de caméras, plus de monteurs — juste votre idée et l'IA.
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid md:grid-cols-12 gap-4 md:gap-6 max-w-6xl mx-auto">
            {/* Video Card — Large */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="md:col-span-7 relative group"
            >
              <div className="absolute inset-0 bg-primary/15 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative rounded-[2rem] border border-white/10 bg-muted/30 dark:bg-white/[0.03] backdrop-blur-xl overflow-hidden aspect-video shadow-2xl">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src="https://cdn.pixabay.com/video/2023/10/20/185793-876182147_tiny.mp4"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-6 md:p-8 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Généré en temps réel</span>
                  </div>
                  <p className="text-white font-black text-lg md:text-xl leading-snug">
                    Pub vidéo Sora · 60s · Qualité 4K
                  </p>
                </div>
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <Video size={24} className="text-white ml-1" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Stack — Right */}
            <div className="md:col-span-5 grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-6">
              {[
                { value: "10x", label: "Conversion vs images", sub: "Vidéo > Statique", color: "text-primary" },
                { value: "90s", label: "Temps de génération", sub: "De l'idée au film", color: "text-fuchsia-400" },
                { value: "4K", label: "Résolution d'export", sub: "Facebook · TikTok · YouTube", color: "text-emerald-400" },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 + idx * 0.1 }}
                  className="rounded-2xl border border-white/10 bg-muted/30 dark:bg-white/[0.03] backdrop-blur-xl p-5 md:p-6 flex items-center gap-5 hover:border-primary/30 hover:bg-primary/5 transition-all group/stat"
                >
                  <div className={`text-3xl md:text-4xl font-black tracking-tighter ${stat.color} group-hover/stat:scale-110 transition-transform`}>
                    {stat.value}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black leading-snug truncate">{stat.label}</p>
                    <p className="text-[11px] text-muted-foreground font-medium truncate">{stat.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature Pills — Bottom Row */}
            {[
              { icon: Sparkles, text: "Accès exclusif Sora & Veo en Afrique", accent: "from-primary/15 to-primary/5 border-primary/20" },
              { icon: Video, text: "Timeline d'édition pro simplifiée", accent: "from-fuchsia-500/15 to-fuchsia-500/5 border-fuchsia-500/20" },
              { icon: Globe, text: "Voix-off IA multilingues incluses", accent: "from-emerald-500/15 to-emerald-500/5 border-emerald-500/20" },
              { icon: Zap, text: "Formats optimisés Reels & TikTok", accent: "from-amber-500/15 to-amber-500/5 border-amber-500/20" },
            ].map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + idx * 0.08 }}
                className={`md:col-span-3 flex items-center gap-3 rounded-2xl border bg-gradient-to-br ${feat.accent} backdrop-blur-xl p-4 hover:scale-[1.03] transition-transform`}
              >
                <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <feat.icon size={16} />
                </div>
                <span className="text-xs font-bold leading-snug">{feat.text}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-12"
          >
            <Button asChild size="lg" className="h-14 px-10 rounded-2xl bg-primary text-primary-foreground font-black gap-2 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-shadow">
              <Link to="/register">
                Essayer le Cinema Studio <ArrowRight size={18} />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Pricing / Comparison */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
             <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Choisissez votre <span className="text-gradient-primary">Vitesse</span></h2>
             <p className="text-muted-foreground font-medium">Trois paliers pour passer de débutant à leader du marché digital.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
             {/* Starter */}
             <div className="glass-card p-8 rounded-[3rem] border-white/5 space-y-8 flex flex-col hover:border-primary/20 transition-all group">
                <div className="space-y-2">
                   <h3 className="text-2xl font-black">Starter</h3>
                   <p className="text-4xl font-black">4 999 <span className="text-xs text-muted-foreground uppercase">FCFA / mois</span></p>
                </div>
                <ul className="space-y-4 flex-1">
                   {["20 Produits", "200 Crédits IA", "Commission 15%", "Studio Pub Basique"].map((f, i) => (
                     <li key={i} className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 size={16} className="text-primary" /> {f}</li>
                   ))}
                </ul>
                <Button variant="outline" className="h-14 rounded-2xl font-black border-white/10 hover:bg-primary hover:text-white group-hover:scale-105 transition-all">Lancer mon business</Button>
             </div>

             {/* Pro - Recommended */}
             <div className="glass-card p-8 rounded-[3rem] border-primary/30 bg-primary/5 space-y-8 flex flex-col scale-105 relative shadow-2xl">
                <div className="absolute top-0 right-8 -translate-y-1/2">
                   <Badge className="bg-primary text-primary-foreground font-black px-4 py-1 rounded-full uppercase tracking-widest text-[9px]">Le Plus Populaire</Badge>
                </div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black">Pro</h3>
                   <p className="text-4xl font-black">14 999 <span className="text-xs text-muted-foreground uppercase">FCFA / mois</span></p>
                </div>
                <ul className="space-y-4 flex-1">
                   {["Produits Illimités", "1 000 Crédits IA", "Commission 10%", "Cinema Studio Inclus", "Support Prioritaire"].map((f, i) => (
                     <li key={i} className="flex items-center gap-2 text-sm font-bold text-foreground"><CheckCircle2 size={16} className="text-primary" /> {f}</li>
                   ))}
                </ul>
                <Button className="h-14 rounded-2xl font-black bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:scale-105 transition-all">Devenir Expert</Button>
             </div>

             {/* Elite */}
             <div className="glass-card p-8 rounded-[3rem] border-white/5 space-y-8 flex flex-col hover:border-primary/20 transition-all group">
                <div className="space-y-2">
                   <h3 className="text-2xl font-black">Elite</h3>
                   <p className="text-4xl font-black">49 999 <span className="text-xs text-muted-foreground uppercase">FCFA / mois</span></p>
                </div>
                <ul className="space-y-4 flex-1">
                   {["Tout Illimité", "Cinema Studio Ultra HD", "Commission 5%", "Modèles Sora & Veo", "Manager Dédié"].map((f, i) => (
                     <li key={i} className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 size={16} className="text-primary" /> {f}</li>
                   ))}
                </ul>
                <Button variant="outline" className="h-14 rounded-2xl font-black border-white/10 hover:bg-primary hover:text-white group-hover:scale-105 transition-all">Scale sans limite</Button>
             </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-muted/10">
        <div className="container mx-auto px-4 text-center">
           <div className="max-w-2xl mx-auto space-y-8">
              <h2 className="text-3xl font-black tracking-tight">Rejoignez +500 experts africains déjà en place.</h2>
              <div className="flex justify-center -space-x-4">
                 {[1,2,3,4,5].map(i => (
                   <div key={i} className="h-14 w-14 rounded-full border-4 border-background bg-muted overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                   </div>
                 ))}
                 <div className="h-14 w-14 rounded-full border-4 border-background bg-primary text-primary-foreground flex items-center justify-center font-black text-xs">
                    +500
                 </div>
              </div>
              <p className="text-muted-foreground font-medium italic">"Grâce au Cinema Studio, j'ai multiplié mes ventes de formation par 4 en seulement 2 semaines."</p>
           </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="container mx-auto px-4 relative z-10 text-center space-y-12">
           <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Prêt à bâtir votre <span className="text-gradient-primary">Empire</span> ?</h2>
           <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="flex items-center gap-3 p-4 bg-background/50 backdrop-blur-md rounded-2xl border border-white/5">
                 <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Wallet size={20} /></div>
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Paiements</p>
                    <p className="text-xs font-bold">Wave & OM Natif</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background/50 backdrop-blur-md rounded-2xl border border-white/5">
                 <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Users size={20} /></div>
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Audience</p>
                    <p className="text-xs font-bold">Marketplace Mondiale</p>
                 </div>
              </div>
           </div>
           <Button asChild size="lg" className="h-20 px-16 rounded-3xl bg-foreground text-background hover:bg-primary hover:text-white font-black text-2xl shadow-2xl transition-all">
              <Link to="/register">COMMENCER GRATUITEMENT</Link>
           </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
