import { motion, useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const reducedMotion = useReducedMotion();
  const isDark = theme === "dark";

  return (
    <motion.button
      type="button"
      whileTap={reducedMotion ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.6 }}
      onClick={toggleTheme}
      aria-label={isDark ? "Activer le thème clair" : "Activer le thème sombre"}
      className={cn("relative grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground", className)}
    >
      <motion.span layout transition={{ type: "spring", stiffness: 360, damping: 32, mass: 0.6 }}>
        {isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
      </motion.span>
    </motion.button>
  );
}
