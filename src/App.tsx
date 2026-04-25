import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BackgroundGlow } from "@/components/ui/background-components";
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
import VendorAffiliation from "./pages/VendorAffiliation.tsx";
import VendorSettings from "./pages/VendorSettings.tsx";
import VendorAdsStudio from "./pages/VendorAdsStudio.tsx";
import DigitalProductFactory from "./pages/DigitalProductFactory.tsx";
import VendorMessages from "./pages/VendorMessages.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";
import PageTransition from "./components/PageTransition.tsx";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import { LiveSalesPopup } from "./components/gamification/LiveSalesPopup.tsx";

const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <BackgroundGlow className="min-h-0 items-stretch">
      <Routes>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/boutique" element={<PageTransition><Boutique /></PageTransition>} />
        <Route path="/produit/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
        <Route path="/panier" element={<PageTransition><CartPage /></PageTransition>} />
        <Route path="/a-propos" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/mon-compte" element={<PageTransition><MonCompte /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/conditions-generales" element={<PageTransition><ConditionsGenerales /></PageTransition>} />
        <Route path="/politique-confidentialite" element={<PageTransition><PolitiqueConfidentialite /></PageTransition>} />
        <Route path="/politique-remboursement" element={<PageTransition><PolitiqueRemboursement /></PageTransition>} />
        <Route path="/politique-livraison" element={<PageTransition><PolitiqueLivraison /></PageTransition>} />
        <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><Admin /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
        <Route path="/become-a-seller" element={<PageTransition><BecomeSeller /></PageTransition>} />
        <Route path="/store/:username" element={<PageTransition><VendorStore /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><VendorDashboard /></PageTransition>} />
        <Route path="/dashboard/new-product" element={<PageTransition><VendorProductForm /></PageTransition>} />
        <Route path="/dashboard/edit-product/:id" element={<PageTransition><VendorProductForm /></PageTransition>} />
        <Route path="/dashboard/sales" element={<PageTransition><VendorSales /></PageTransition>} />
        <Route path="/dashboard/products" element={<PageTransition><VendorProducts /></PageTransition>} />
        <Route path="/dashboard/customers" element={<PageTransition><VendorCustomers /></PageTransition>} />
        <Route path="/dashboard/revenue" element={<PageTransition><VendorRevenue /></PageTransition>} />
        <Route path="/dashboard/analytics" element={<PageTransition><VendorAnalytics /></PageTransition>} />
        <Route path="/dashboard/marketing" element={<PageTransition><VendorMarketing /></PageTransition>} />
        <Route path="/dashboard/affiliation" element={<PageTransition><VendorAffiliation /></PageTransition>} />
        <Route path="/dashboard/settings" element={<PageTransition><VendorSettings /></PageTransition>} />
        <Route path="/dashboard/ads-studio" element={<PageTransition><VendorAdsStudio /></PageTransition>} />
        <Route path="/dashboard/factory" element={<PageTransition><DigitalProductFactory /></PageTransition>} />
        <Route path="/dashboard/messages" element={<PageTransition><VendorMessages /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </BackgroundGlow>
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
