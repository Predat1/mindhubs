import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Package, 
  Download, 
  ExternalLink, 
  ShoppingBag, 
  Search, 
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";

export default function MyPurchases() {
  const { user } = useAuth();

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['my-purchases', user?.id],
    queryFn: async () => {
      // Fetch orders and their products for the current user
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          order_items (
            id,
            product_id,
            products (
              id,
              name,
              image_url,
              file_url,
              category
            )
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'completed'); // Only show paid items

      if (error) throw error;
      
      // Flatten products from orders
      const allProducts = data?.flatMap(order => 
        order.order_items.map(item => ({
          ...item.products,
          orderId: order.id,
          purchasedAt: order.created_at
        }))
      ) || [];

      return allProducts;
    },
    enabled: !!user?.id
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Mes Achats | MindHubs" description="Accédez à vos produits numériques, formations et ebooks achetés sur MindHubs." />
      <Navbar />

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                 <Badge className="bg-primary/20 text-primary border-none font-black text-[9px] px-3 uppercase tracking-widest">Bibliothèque Privée</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Mes <span className="text-gradient-primary">Achats</span></h1>
              <p className="text-muted-foreground font-medium max-w-xl">Retrouvez ici tous les produits numériques que vous avez acquis sur la plateforme. Accès illimité à vie.</p>
            </div>

            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un produit..." 
                className="h-14 rounded-2xl bg-muted/20 border-white/5 pl-12 font-bold"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="glass-card h-[400px] rounded-[2.5rem] animate-pulse bg-muted/20" />
              ))
            ) : purchases?.length === 0 ? (
              <div className="col-span-full py-20 text-center space-y-6">
                <div className="h-24 w-24 rounded-full bg-muted/20 flex items-center justify-center mx-auto text-muted-foreground/20">
                  <ShoppingBag size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black">Aucun achat détecté</h3>
                  <p className="text-muted-foreground font-medium">Parcourez la marketplace pour découvrir des produits incroyables.</p>
                </div>
                <Button asChild className="h-14 rounded-2xl bg-primary px-8 font-black gap-2">
                  <Link to="/marketplace">VOIR LA MARKETPLACE <ArrowRight size={18} /></Link>
                </Button>
              </div>
            ) : (
              purchases?.map((product) => (
                <div key={product.id} className="group glass-card rounded-[2.5rem] border-white/5 overflow-hidden flex flex-col transition-all hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10">
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={product.image_url || "/placeholder.svg"} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                       <Button className="w-full h-12 rounded-xl bg-white text-black hover:bg-primary hover:text-white font-black gap-2">
                         <Download size={16} /> TÉLÉCHARGER
                       </Button>
                    </div>
                    <div className="absolute top-4 left-4">
                       <Badge className="bg-black/60 backdrop-blur-md text-[8px] font-black uppercase tracking-widest">{product.category}</Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-6 flex-1 flex flex-col">
                    <div className="space-y-2">
                      <h3 className="text-xl font-black leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                        <Clock size={12} /> Acquis le {new Date(product.purchasedAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-2 text-emerald-500">
                          <CheckCircle2 size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Paiement Validé</span>
                       </div>
                       <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-primary">
                          <ExternalLink size={18} />
                       </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Security Notice */}
          <div className="glass-card p-8 rounded-[2.5rem] border-white/5 bg-gradient-to-r from-primary/5 to-transparent flex flex-col md:flex-row items-center gap-8">
            <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
               <Lock size={32} />
            </div>
            <div className="space-y-2 text-center md:text-left">
               <h4 className="text-xl font-black">Sécurisation des Téléchargements</h4>
               <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-2xl">
                 Tous vos téléchargements sont protégés par chiffrement. En cas de perte de votre fichier, vous pouvez revenir ici à tout moment pour le télécharger à nouveau sans frais supplémentaires.
               </p>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
