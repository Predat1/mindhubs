import { createContext, useCallback, useContext, useLayoutEffect, useState, type ReactNode } from "react";

export type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getThemeStorage = () => {
  try {
    return typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return getThemeStorage()?.getItem("mindhubs-theme") === "light" ? "light" : "dark";
  });

  const syncThemeClass = useCallback((nextTheme: Theme) => {
    const root = document.documentElement;
    root.classList.toggle("dark", nextTheme === "dark");
    root.classList.toggle("light", nextTheme === "light");
    root.dataset.theme = nextTheme;
    getThemeStorage()?.setItem("mindhubs-theme", nextTheme);
  }, []);

  const applyTheme = useCallback((nextTheme: Theme) => {
    const apply = () => syncThemeClass(nextTheme);
    const startViewTransition = document.startViewTransition?.bind(document);

    if (startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      startViewTransition(apply);
    } else {
      apply();
    }
    setThemeState(nextTheme);
  }, [syncThemeClass]);

  useLayoutEffect(() => {
    syncThemeClass(theme);
  }, [syncThemeClass, theme]);

  const setTheme = useCallback((nextTheme: Theme) => applyTheme(nextTheme), [applyTheme]);
  const toggleTheme = useCallback(() => applyTheme(theme === "dark" ? "light" : "dark"), [applyTheme, theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
