import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Marquee({ children, className, duration = 24 }: { children: ReactNode; className?: string; duration?: number }) {
  const reducedMotion = useReducedMotion();
  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        className="flex w-max min-w-full items-center gap-8"
        animate={reducedMotion ? undefined : { x: ["0%", "-50%"] }}
        transition={reducedMotion ? undefined : { duration, ease: "linear", repeat: Infinity }}
      >
        <div className="flex shrink-0 items-center gap-8">{children}</div>
        <div className="flex shrink-0 items-center gap-8" aria-hidden="true">{children}</div>
      </motion.div>
    </div>
  );
}
