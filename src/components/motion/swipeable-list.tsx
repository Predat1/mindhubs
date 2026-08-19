import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SwipeableListItem({
  children,
  leftAction,
  rightAction,
  onSwipeLeft,
  onSwipeRight,
  className,
}: {
  children: ReactNode;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <div className={cn("relative overflow-hidden rounded-xl border border-border bg-card", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 grid w-16 place-items-center bg-muted text-muted-foreground">{leftAction}</div>
      <div className="pointer-events-none absolute inset-y-0 right-0 grid w-16 place-items-center bg-muted text-muted-foreground">{rightAction}</div>
      <motion.div
        drag={reducedMotion ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.24, right: 0.24 }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -72 || info.velocity.x < -500) onSwipeLeft?.();
          if (info.offset.x > 72 || info.velocity.x > 500) onSwipeRight?.();
        }}
        className="relative bg-card"
      >
        {children}
      </motion.div>
    </div>
  );
}
