import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { PublicShellContext } from "@/components/public-shell-context";

const PublicShell = ({ children }: { children?: ReactNode }) => (
  <>
    <Navbar />
    <PublicShellContext.Provider value>
      <PageTransitionProvider>
        {children ?? <Outlet />}
      </PageTransitionProvider>
    </PublicShellContext.Provider>
  </>
);

export default PublicShell;
