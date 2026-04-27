import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index.tsx";
import Boutique from "./pages/Boutique.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import CartPage from "./pages/CartPage.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";
import MonCompte from "./pages/MonCompte.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import ConditionsGenerales from "./pages/ConditionsGenerales.tsx";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite.tsx";
import PolitiqueRemboursement from "./pages/PolitiqueRemboursement.tsx";
import PolitiqueLivraison from "./pages/PolitiqueLivraison.tsx";
import FAQ from "./pages/FAQ.tsx";
import Admin from "./pages/Admin.tsx";
import Checkout from "./pages/Checkout.tsx";
import NotFound from "./pages/NotFound.tsx";
import BecomeSeller from "./pages/BecomeSeller.tsx";
import VendorStore from "./pages/VendorStore.tsx";
import VendorDashboard from "./pages/VendorDashboard.tsx";
import VendorProductForm from "./pages/VendorProductForm.tsx";
import VendorSales from "./pages/VendorSales.tsx";
import VendorProducts from "./pages/VendorProducts.tsx";
import VendorCustomers from "./pages/VendorCustomers.tsx";
import VendorRevenue from "./pages/VendorRevenue.tsx";
import VendorAnalytics from "./pages/VendorAnalytics.tsx";
import VendorMarketing from "./pages/VendorMarketing.tsx";
import VendorSettings from "./pages/VendorSettings.tsx";
import VendorAdsStudio from "./pages/VendorAdsStudio.tsx";
import DigitalProductFactory from "./pages/DigitalProductFactory.tsx";
import VendorMessages from "./pages/VendorMessages.tsx";
import ProtectionAcheteur from "./pages/ProtectionAcheteur.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import { LiveSalesPopup } from "./components/gamification/LiveSalesPopup.tsx";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/boutique" element={<Boutique />} />
        <Route path="/produit/:id" element={<ProductDetail />} />
        <Route path="/panier" element={<CartPage />} />
        <Route path="/a-propos" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/mon-compte" element={<MonCompte />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/conditions-generales" element={<ConditionsGenerales />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
        <Route path="/politique-remboursement" element={<PolitiqueRemboursement />} />
        <Route path="/politique-livraison" element={<PolitiqueLivraison />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/admin" element={<Admin />} />
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
        <Route path="/dashboard/analytics" element={<VendorAnalytics />} />
        <Route path="/dashboard/marketing" element={<VendorMarketing />} />
        <Route path="/dashboard/settings" element={<VendorSettings />} />
        <Route path="/dashboard/ads-studio" element={<VendorAdsStudio />} />
        <Route path="/dashboard/factory" element={<DigitalProductFactory />} />
        <Route path="/dashboard/messages" element={<VendorMessages />} />
        <Route path="/login" element={<Navigate to="/mon-compte" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
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
            </ErrorBoundary>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
