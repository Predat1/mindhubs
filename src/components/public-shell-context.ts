import { createContext, useContext } from "react";

export const PublicShellContext = createContext(false);
export const usePublicShell = () => useContext(PublicShellContext);
