import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertCircle, Check, Circle, LoaderCircle, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AnimatedBadgeStatus = "idle" | "loading" | "success" | "error";

const statusIcons: Record<AnimatedBadgeStatus, typeof Circle> = {
  idle: Circle,
  loading: LoaderCircle,
  success: Check,
  error: X,
};

const statusLabels: Record<AnimatedBadgeStatus, string> = {
  idle: "En attente",
  loading: "En cours",
  success: "Terminé",
  error: "Erreur",
};

export function AnimatedBadge({
  status = "idle",
  children,
  className,
}: {
  status?: AnimatedBadgeStatus;
  children?: ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const Icon = statusIcons[status];

  return (
    <motion.span
      layout
      initial={reducedMotion ? false : { opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 460, damping: 30, mass: 0.55 }}
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex min-h-7 items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground",
        status === "success" && "border-foreground/20 text-foreground",
        status === "error" && "border-destructive/40 text-destructive",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={status}
          initial={reducedMotion ? false : { opacity: 0, y: 5, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -5, filter: "blur(3px)" }}
          transition={{ duration: reducedMotion ? 0.01 : 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-1.5"
        >
          <Icon className={cn("size-3.5", status === "loading" && "animate-spin")} aria-hidden="true" />
          <span>{children ?? statusLabels[status]}</span>
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

export function AnimatedStatusIcon({ status }: { status: AnimatedBadgeStatus }) {
  const Icon = statusIcons[status];
  return <Icon className={cn("size-4", status === "loading" && "animate-spin")} aria-hidden="true" />;
}

export const AnimatedBadgeErrorIcon = AlertCircle;
