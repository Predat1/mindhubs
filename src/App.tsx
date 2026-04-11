import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BackgroundGlow } from "@/components/ui/background-components";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <BackgroundGlow className="min-h-0 items-stretch">
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
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BackgroundGlow>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
