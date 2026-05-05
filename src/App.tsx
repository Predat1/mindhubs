import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Loader2 } from "lucide-react";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index.tsx"));
const Boutique = lazy(() => import("./pages/Boutique.tsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.tsx"));
const CartPage = lazy(() => import("./pages/CartPage.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const MonCompte = lazy(() => import("./pages/MonCompte.tsx"));
const MyPurchases = lazy(() => import("./pages/MyPurchases.tsx"));
const VendorLanding = lazy(() => import("./pages/VendorLanding.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const ConditionsGenerales = lazy(() => import("./pages/ConditionsGenerales.tsx"));
const PolitiqueConfidentialite = lazy(() => import("./pages/PolitiqueConfidentialite.tsx"));
const PolitiqueRemboursement = lazy(() => import("./pages/PolitiqueRemboursement.tsx"));
const PolitiqueLivraison = lazy(() => import("./pages/PolitiqueLivraison.tsx"));
const FAQ = lazy(() => import("./pages/FAQ.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const Checkout = lazy(() => import("./pages/Checkout.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const BecomeSeller = lazy(() => import("./pages/BecomeSeller.tsx"));
const VendorStore = lazy(() => import("./pages/VendorStore.tsx"));
const VendorDashboard = lazy(() => import("./pages/VendorDashboard.tsx"));
const VendorProductForm = lazy(() => import("./pages/VendorProductForm.tsx"));
const VendorSales = lazy(() => import("./pages/VendorSales.tsx"));
const VendorProducts = lazy(() => import("./pages/VendorProducts.tsx"));
const VendorCustomers = lazy(() => import("./pages/VendorCustomers.tsx"));
const VendorRevenue = lazy(() => import("./pages/VendorRevenue.tsx"));
const VendorPayouts = lazy(() => import("./pages/VendorPayouts.tsx"));
const VendorAnalytics = lazy(() => import("./pages/VendorAnalytics.tsx"));
const VendorMarketing = lazy(() => import("./pages/VendorMarketing.tsx"));
const VendorSettings = lazy(() => import("./pages/VendorSettings.tsx"));
const VendorAdsStudio = lazy(() => import("./pages/VendorAdsStudio.tsx"));
const CreatorLab = lazy(() => import("./pages/CreatorLab.tsx"));
const Pricing = lazy(() => import("./pages/Pricing.tsx"));
const VendorSubscription = lazy(() => import("./pages/VendorSubscription.tsx"));
const CinemaStudio = lazy(() => import("./pages/CinemaStudio.tsx"));
const VendorMessages = lazy(() => import("./pages/VendorMessages.tsx"));
const ProtectionAcheteur = lazy(() => import("./pages/ProtectionAcheteur.tsx"));
const LMSPlayer = lazy(() => import("./pages/LMSPlayer.tsx"));

import ScrollToTop from "./components/ScrollToTop.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import AdminGuard from "./components/dashboard/AdminGuard.tsx";
import { LiveSalesPopup } from "./components/gamification/LiveSalesPopup.tsx";
import { ExitIntentPopup } from "./components/ExitIntentPopup.tsx";
import { ExplorePopup } from "./components/ExplorePopup.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-2 border-primary/20 animate-ping" />
      <Loader2 className="absolute inset-0 m-auto animate-spin text-primary" size={32} />
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">Chargement MindHubs...</p>
  </div>
);

const AppContent = () => {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/boutique" element={<Boutique />} />
          <Route path="/produit/:id" element={<ProductDetail />} />
          <Route path="/panier" element={<CartPage />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/mon-compte" element={<MonCompte />} />
          <Route path="/mes-achats" element={<MyPurchases />} />
          <Route path="/formation/:id" element={<LMSPlayer />} />
          <Route path="/experts" element={<VendorLanding />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/conditions-generales" element={<ConditionsGenerales />} />
          <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
          <Route path="/politique-remboursement" element={<PolitiqueRemboursement />} />
          <Route path="/politique-livraison" element={<PolitiqueLivraison />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/protection-acheteur" element={<ProtectionAcheteur />} />
          <Route path="/become-a-seller" element={<BecomeSeller />} />
          <Route path="/store/:username" element={<VendorStore />} />
          <Route path="/dashboard" element={<VendorDashboard />} />
          <Route path="/dashboard/new-product" element={<VendorProductForm />} />
          <Route path="/dashboard/edit-product/:id" element={<VendorProductForm />} />
          <Route path="/dashboard/sales" element={<VendorSales />} />
          <Route path="/dashboard/products" element={<VendorProducts />} />
          <Route path="/dashboard/customers" element={<VendorCustomers />} />
          <Route path="/dashboard/revenue" element={<VendorRevenue />} />
          <Route path="/dashboard/payouts" element={<VendorPayouts />} />
          <Route path="/dashboard/analytics" element={<VendorAnalytics />} />
          <Route path="/dashboard/marketing" element={<VendorMarketing />} />
          <Route path="/dashboard/settings" element={<VendorSettings />} />
          <Route path="/dashboard/ads-studio" element={<VendorAdsStudio />} />
          <Route path="/dashboard/creator-lab" element={<CreatorLab />} />
          <Route path="/dashboard/cinema-studio" element={<CinemaStudio />} />
          <Route path="/dashboard/factory" element={<Navigate to="/dashboard/creator-lab" replace />} />
          <Route path="/dashboard/messages" element={<VendorMessages />} />
          <Route path="/dashboard/abonnement" element={<VendorSubscription />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Navigate to="/mon-compte" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <ErrorBoundary>
              <AppContent />
              <LiveSalesPopup />
              <ExitIntentPopup />
              <ExplorePopup />
            </ErrorBoundary>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
