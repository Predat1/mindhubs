import { useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentVendor, type Vendor } from "@/hooks/useVendors";

interface Props {
  children: (vendor: Vendor) => ReactNode;
}

const VendorGuard = ({ children }: Props) => {
  const { user, loading } = useAuth();
  const { data: vendor, isLoading: vendorLoading } = useCurrentVendor();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/mon-compte");
      return;
    }
    
    // If we have a user but no vendor yet, and we aren't loading anything, 
    // we double check before redirecting to prevent accidental "logouts"
    if (!loading && !vendorLoading && user && !vendor) {
      // Small timeout to allow any pending auth state to stabilize
      const t = setTimeout(() => {
        if (!vendor) navigate("/become-a-seller");
      }, 500);
      return () => clearTimeout(t);
    }
  }, [loading, user, vendor, vendorLoading, navigate]);

  if (loading || vendorLoading || !vendor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children(vendor)}</>;
};

export default VendorGuard;
