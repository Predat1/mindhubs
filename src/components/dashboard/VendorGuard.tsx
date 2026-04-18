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
    if (!loading && !user) navigate("/mon-compte");
    if (!loading && !vendorLoading && user && !vendor) navigate("/become-a-seller");
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
