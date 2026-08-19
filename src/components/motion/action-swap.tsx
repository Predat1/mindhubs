import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ActionSwap({
  icon,
  label,
  className,
  ...props
}: ComponentPropsWithoutRef<"button"> & { icon: ReactNode; label: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.6 }}
      aria-label={label}
      className={cn(
        "group inline-flex h-9 items-center gap-2 overflow-hidden rounded-lg border border-border bg-card px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      <span className="grid size-5 shrink-0 place-items-center">{icon}</span>
      <AnimatePresence initial={false}>
        <motion.span
          initial={reducedMotion ? false : { opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          exit={reducedMotion ? undefined : { opacity: 0, width: 0 }}
          transition={{ duration: reducedMotion ? 0.01 : 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-0 whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-200 group-hover:max-w-32 group-hover:opacity-100 group-focus-visible:max-w-32 group-focus-visible:opacity-100"
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
