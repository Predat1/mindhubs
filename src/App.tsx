import { lazy, Suspense, type ComponentType } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Loader2 } from "lucide-react";
import MindHubsMark from "@/components/brand/MindHubsMark";

const CHUNK_RELOAD_KEY = "mindhubs:chunk-reload";

function clearChunkReloadMarker() {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  } catch {
    // Some privacy modes can make sessionStorage unavailable. The import
    // still works normally; only the recovery marker is skipped.
  }
}

function reloadAfterChunkFailure() {
  if (typeof window === "undefined") return false;

  try {
    if (window.sessionStorage.getItem(CHUNK_RELOAD_KEY) === "1") {
      window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      return false;
    }

    window.sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}

/**
 * Vite can keep a stale module URL in an already-open tab after a deployment
 * or HMR update. Retry exactly once with a full reload, then let the normal
 * error boundary handle a genuine import error instead of creating a loop.
 */
function lazyWithRetry<T extends ComponentType<any>>(importer: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      const module = await importer();
      clearChunkReloadMarker();
      return module;
    } catch (error) {
      if (reloadAfterChunkFailure()) {
        await new Promise<never>(() => undefined);
      }

      throw error;
    }
  });
}

// Lazy-loaded pages
const Index = lazyWithRetry(() => import("./pages/Index.tsx"));
const Boutique = lazyWithRetry(() => import("./pages/Boutique.tsx"));
const ProductDetail = lazyWithRetry(() => import("./pages/ProductDetail.tsx"));
const CartPage = lazyWithRetry(() => import("./pages/CartPage.tsx"));
const About = lazyWithRetry(() => import("./pages/About.tsx"));
const Contact = lazyWithRetry(() => import("./pages/Contact.tsx"));
const MonCompte = lazyWithRetry(() => import("./pages/MonCompte.tsx"));
const MyPurchases = lazyWithRetry(() => import("./pages/MyPurchases.tsx"));
const StudentDashboard = lazyWithRetry(() => import("./pages/StudentDashboard.tsx"));
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword.tsx"));
const ConditionsGenerales = lazyWithRetry(() => import("./pages/ConditionsGenerales.tsx"));
const PolitiqueConfidentialite = lazyWithRetry(() => import("./pages/PolitiqueConfidentialite.tsx"));
const PolitiqueRemboursement = lazyWithRetry(() => import("./pages/PolitiqueRemboursement.tsx"));
const PolitiqueLivraison = lazyWithRetry(() => import("./pages/PolitiqueLivraison.tsx"));
const FAQ = lazyWithRetry(() => import("./pages/FAQ.tsx"));
const Admin = lazyWithRetry(() => import("./pages/Admin.tsx"));
const Checkout = lazyWithRetry(() => import("./pages/Checkout.tsx"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound.tsx"));
const BecomeSeller = lazyWithRetry(() => import("./pages/BecomeSeller.tsx"));
const VendorLanding = lazyWithRetry(() => import("./pages/VendorLanding.tsx"));
const VendorStore = lazyWithRetry(() => import("./pages/VendorStore.tsx"));
const VendorDashboard = lazyWithRetry(() => import("./pages/VendorDashboard.tsx"));
const VendorProductForm = lazyWithRetry(() => import("./pages/VendorProductForm.tsx"));
const VendorSales = lazyWithRetry(() => import("./pages/VendorSales.tsx"));
const VendorProducts = lazyWithRetry(() => import("./pages/VendorProducts.tsx"));
const VendorCustomers = lazyWithRetry(() => import("./pages/VendorCustomers.tsx"));
const VendorRevenue = lazyWithRetry(() => import("./pages/VendorRevenue.tsx"));
const VendorPayouts = lazyWithRetry(() => import("./pages/VendorPayouts.tsx"));
const VendorAnalytics = lazyWithRetry(() => import("./pages/VendorAnalytics.tsx"));
const VendorSettings = lazyWithRetry(() => import("./pages/VendorSettings.tsx"));
const VendorMessages = lazyWithRetry(() => import("./pages/VendorMessages.tsx"));
const ProtectionAcheteur = lazyWithRetry(() => import("./pages/ProtectionAcheteur.tsx"));
const LMSPlayer = lazyWithRetry(() => import("./pages/LMSPlayer.tsx"));

import ScrollToTop from "./components/ScrollToTop.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import AdminGuard from "./components/dashboard/AdminGuard.tsx";
import PublicShell from "./components/PublicShell";
import { PersistentDashboardShell } from "./components/dashboard/DashboardLayout";

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
  <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
    <div className="w-full max-w-sm space-y-3" aria-label="Chargement MindHubs" role="status">
      <MindHubsMark size={28} decorative />
      <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
      <div className="h-24 animate-pulse rounded-xl border border-border bg-card" />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Chargement…
      </div>
    </div>
  </div>
);

const AppContent = () => {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicShell />}>
            <Route path="/" element={<Index />} />
            <Route path="/boutique" element={<Boutique />} />
            <Route path="/produit/:id" element={<ProductDetail />} />
            <Route path="/panier" element={<CartPage />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/mon-compte" element={<MonCompte />} />
            <Route path="/mes-achats" element={<MyPurchases />} />
            <Route path="/mes-formations" element={<StudentDashboard />} />
            <Route path="/formation/:id" element={<LMSPlayer />} />
            <Route path="/experts" element={<Navigate to="/become-a-seller" replace />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/conditions-generales" element={<ConditionsGenerales />} />
            <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
            <Route path="/politique-remboursement" element={<PolitiqueRemboursement />} />
            <Route path="/politique-livraison" element={<PolitiqueLivraison />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/protection-acheteur" element={<ProtectionAcheteur />} />
            <Route path="/become-a-seller" element={<VendorLanding />} />
            <Route path="/become-a-seller/start" element={<BecomeSeller />} />
            <Route path="/pricing" element={<Navigate to="/become-a-seller" replace />} />
            <Route path="/login" element={<Navigate to="/mon-compte" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/admin" element={<AdminGuard><PersistentDashboardShell variant="admin" /></AdminGuard>}>
            <Route index element={<Admin />} />
          </Route>
          <Route path="/store/:username" element={<VendorStore />} />
          <Route element={<PersistentDashboardShell variant="vendor" />}>
            <Route path="/dashboard" element={<VendorDashboard />} />
            <Route path="/dashboard/new-product" element={<VendorProductForm />} />
            <Route path="/dashboard/edit-product/:id" element={<VendorProductForm />} />
            <Route path="/dashboard/sales" element={<VendorSales />} />
            <Route path="/dashboard/products" element={<VendorProducts />} />
            <Route path="/dashboard/customers" element={<VendorCustomers />} />
            <Route path="/dashboard/revenue" element={<VendorRevenue />} />
            <Route path="/dashboard/payouts" element={<VendorPayouts />} />
            <Route path="/dashboard/analytics" element={<VendorAnalytics />} />
            <Route path="/dashboard/settings" element={<VendorSettings />} />
            <Route path="/dashboard/messages" element={<VendorMessages />} />
            <Route path="/dashboard/abonnement" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <TooltipProvider>
          <AuthProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <ErrorBoundary>
                  <AppContent />
                </ErrorBoundary>
              </BrowserRouter>
            </CartProvider>
          </AuthProvider>
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
