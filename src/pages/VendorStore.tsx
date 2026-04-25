import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import SEO from "@/components/SEO";
import ProductCard from "@/components/ProductCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { useVendor, useVendorProducts } from "@/hooks/useVendors";
import { 
  Store, 
  BadgeCheck, 
  Package, 
  Users, 
  Star, 
  MessageSquare, 
  Share2, 
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ExpertChat from "@/components/ExpertChat";

import StandaloneNavbar from "@/components/StandaloneNavbar";

const VendorStore = () => {
  const { username } = useParams<{ username: string }>();
  const { data: vendor, isLoading } = useVendor(username);
  const { data: products = [] } = useVendorProducts(vendor?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-32">
          <div className="h-[300px] rounded-3xl bg-muted/40 animate-pulse mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-64 rounded-2xl bg-muted/20 animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-48 text-center space-y-4">
           <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground"><Store size={32} /></div>
           <h1 className="text-3xl font-black">Boutique Introuvable</h1>
           <p className="text-muted-foreground">Ce vendeur n'existe pas ou a fermé sa boutique.</p>
           <Button asChild variant="outline" className="rounded-full"><Link to="/boutique">Explorer d'autres boutiques</Link></Button>
        </div>
        <FooterSection />
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien de la boutique copié !");
  };

  const initials = vendor.shop_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const brandColor = vendor.primary_color || "#7C3AED";
  const isStandalone = vendor.standalone_mode;

  return (
    <div className="min-h-screen bg-background" style={{ "--primary": brandColor } as React.CSSProperties}>
      <SEO 
        title={`${vendor.shop_name} — Mindhubs Expert`} 
        description={vendor.description || `Explorez la boutique digitale de ${vendor.shop_name}.`} 
        path={`/store/${vendor.username}`} 
      />
      
      {isStandalone ? (
        <StandaloneNavbar shopName={vendor.shop_name} primaryColor={brandColor} avatarUrl={vendor.avatar_url} />
      ) : (
        <Navbar />
      )}

      {/* Profile Header Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
         {/* Background Decor */}
         {vendor.banner_url ? (
           <div className="absolute top-0 left-0 right-0 h-[450px] z-0">
              <img src={vendor.banner_url} alt="" className="w-full h-full object-cover opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background to-background" />
           </div>
         ) : (
           <>
            <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-primary/5 via-background to-background z-0" />
            <div className="absolute -top-24 -left-24 h-64 w-64 bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute top-48 -right-24 h-80 w-80 bg-accent/5 rounded-full blur-[120px]" />
           </>
         )}

         <div className="container mx-auto px-4 relative z-10 pt-12">
            <div className="max-w-5xl mx-auto">
               
               {!isStandalone && (
                 <Link to="/boutique" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-8 group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Retour à l'exploration
                 </Link>
               )}

               <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-12">
                  {/* Avatar */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative shrink-0"
                  >
                     <div 
                       className="h-32 w-32 md:h-40 md:w-40 rounded-[2.5rem] p-1.5 shadow-2xl rotate-3"
                       style={{ background: `linear-gradient(135deg, ${brandColor}, #000, ${brandColor})`, boxShadow: `0 20px 50px -12px ${brandColor}33` }}
                     >
                        <div className="h-full w-full rounded-[2rem] bg-card flex items-center justify-center overflow-hidden -rotate-3 border-4 border-background">
                           {vendor.avatar_url ? (
                             <img src={vendor.avatar_url} alt={vendor.shop_name} className="h-full w-full object-cover" />
                           ) : (
                             <span className="text-4xl font-black" style={{ color: brandColor }}>{initials}</span>
                           )}
                        </div>
                     </div>
                     {vendor.verified && (
                       <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-accent rounded-2xl flex items-center justify-center text-accent-foreground border-4 border-background shadow-lg shadow-accent/20">
                          <BadgeCheck size={20} />
                       </div>
                     )}
                  </motion.div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left space-y-4">
                     <div className="space-y-1">
                        <div className="flex items-center justify-center md:justify-start gap-3">
                           <h1 className="text-3xl md:text-5xl font-black tracking-tight">{vendor.shop_name}</h1>
                           {vendor.verified && (
                             <Badge className="bg-accent/10 text-accent border-none font-black hidden md:flex">EXPERT VÉRIFIÉ</Badge>
                           )}
                        </div>
                        <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2">
                           <span className="font-bold" style={{ color: brandColor }}>@{vendor.username}</span>
                           <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                           <Globe size={14} /> {isStandalone ? "Site Officiel" : "Membre de Mindhubs"}
                        </p>
                     </div>

                     <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
                        {vendor.description || "Expert en transformation digitale et création de produits à forte valeur ajoutée sur le marché africain."}
                     </p>

                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <Button 
                          className="rounded-full gap-2 px-8 shadow-lg transition-transform hover:scale-105 active:scale-95"
                          style={{ backgroundColor: brandColor, boxShadow: `0 10px 20px -5px ${brandColor}4D` }}
                        >
                          Suivre l'Expert
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full h-10 w-10 border-border/60" onClick={handleShare}>
                           <Share2 size={16} />
                        </Button>
                        <div className="flex items-center gap-3 ml-2">
                           <button className="text-muted-foreground hover:text-primary transition-colors"><Facebook size={18} /></button>
                           <button className="text-muted-foreground hover:text-primary transition-colors"><Instagram size={18} /></button>
                           <button className="text-muted-foreground hover:text-primary transition-colors"><Linkedin size={18} /></button>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Stats Row */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-2 bg-muted/30 rounded-[2rem] border border-border/50 backdrop-blur-sm">
                  {[
                    { icon: Package, label: "Produits", val: products.length },
                    { icon: Users, label: "Étudiants", val: "1.2k+" },
                    { icon: Star, label: "Avis Pro", val: "4.9/5", color: "text-amber-500" },
                    { icon: ShieldCheck, label: "Fiabilité", val: "Elite", color: "text-emerald-500" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-card/50 p-4 md:p-6 rounded-3xl border border-transparent hover:border-primary/20 transition-all text-center group">
                       <div className={`h-8 w-8 rounded-xl bg-background flex items-center justify-center mx-auto mb-3 shadow-sm transition-transform group-hover:scale-110 ${stat.color || ""}`} style={{ color: stat.color ? undefined : brandColor }}>
                          <stat.icon size={16} />
                       </div>
                       <p className="text-xl md:text-2xl font-black">{stat.val}</p>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                    </div>
                  ))}
               </div>

            </div>
         </div>
      </section>

      {/* Products Section */}
      <section className="container mx-auto px-4 pb-24">
         <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between border-b border-border/50 pb-6">
               <div className="space-y-1">
                  <h2 className="text-2xl font-black flex items-center gap-3">
                     <Package style={{ color: brandColor }} /> Bibliothèque de Formations
                  </h2>
                  <p className="text-sm text-muted-foreground font-medium">Tous les outils digitaux créés par cet expert.</p>
               </div>
               <div className="hidden md:flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="rounded-full font-bold" style={{ color: brandColor, backgroundColor: `${brandColor}1A` }}>Tous</Button>
                  <Button variant="ghost" size="sm" className="rounded-full font-bold">E-books</Button>
                  <Button variant="ghost" size="sm" className="rounded-full font-bold">Kits Business</Button>
               </div>
            </div>

            {products.length === 0 ? (
               <div className="text-center py-20 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-border">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                     <Package size={24} />
                  </div>
                  <h3 className="text-xl font-bold">Aucun produit actif</h3>
                  <p className="text-muted-foreground text-sm">Cet expert prépare actuellement de nouveaux contenus.</p>
               </div>
            ) : (
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((p, i) => (
                    <AnimateOnScroll key={p.id} delay={i * 50}>
                       <ProductCard product={p} />
                    </AnimateOnScroll>
                  ))}
               </div>
            )}
         </div>
      </section>

      {/* Trust Badge */}
      <section className="container mx-auto px-4 pb-20">
         <div 
           className="max-w-2xl mx-auto p-8 rounded-[2rem] border text-center space-y-6"
           style={{ backgroundColor: `${brandColor}0D`, borderColor: `${brandColor}33` }}
         >
            <div className="flex justify-center -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} alt="User" />
                 </div>
               ))}
               <div className="h-10 w-10 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: brandColor }}>+50</div>
            </div>
            <div className="space-y-2">
               <h3 className="text-xl font-bold">Rejoignez la communauté de {vendor.shop_name}</h3>
               <p className="text-xs text-muted-foreground max-w-sm mx-auto font-medium">
                  Achetez en toute confiance. Mindhubs garantit l'accès à vie et la qualité des contenus de tous ses experts vérifiés.
               </p>
            </div>
            <Button asChild variant="link" className="font-black gap-2" style={{ color: brandColor }}>
               <Link to="/protection-acheteur">
                 En savoir plus sur la protection acheteur <ArrowRight size={14} />
               </Link>
            </Button>
         </div>
      </section>

      <FooterSection />
      
      {/* Expert Chat Widget */}
      <ExpertChat 
        vendorName={vendor.shop_name} 
        vendorUsername={vendor.username} 
        vendorAvatar={vendor.avatar_url} 
      />
    </div>
  );
};

export default VendorStore;
