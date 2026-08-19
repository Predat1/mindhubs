import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Loader2, X } from "lucide-react";
import { type ButtonHTMLAttributes, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";

export type StatefulButtonState = "idle" | "loading" | "success" | "error";

interface StatefulButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  state?: StatefulButtonState;
  successLabel?: string;
  errorLabel?: string;
}

export function StatefulButton({
  children,
  state = "idle",
  successLabel = "Terminé",
  errorLabel = "Réessayer",
  className,
  disabled,
  ...props
}: StatefulButtonProps) {
  const reduce = useReducedMotion();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    if (state === "success") setAnnouncement(successLabel);
    else if (state === "error") setAnnouncement(errorLabel);
    else setAnnouncement("");
  }, [errorLabel, state, successLabel]);

  const label = state === "success" ? successLabel : state === "error" ? errorLabel : children;

  return (
    <motion.button
      type="button"
      disabled={disabled || state === "loading"}
      whileTap={reduce || disabled || state === "loading" ? undefined : { scale: 0.98 }}
      transition={SPRING_PRESS}
      aria-busy={state === "loading"}
      aria-live="polite"
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60",
        state === "error" && "bg-destructive hover:bg-destructive/90",
        className,
      )}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          initial={reduce ? false : { opacity: 0, y: 4, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, filter: "blur(3px)" }}
          transition={{ duration: reduce ? 0.01 : 0.18, ease: EASE_OUT }}
          className="inline-flex items-center gap-2"
        >
          {state === "loading" ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          {state === "success" ? <Check className="size-4" aria-hidden="true" /> : null}
          {state === "error" ? <X className="size-4" aria-hidden="true" /> : null}
          <span>{label}</span>
        </motion.span>
      </AnimatePresence>
      <span className="sr-only">{announcement}</span>
    </motion.button>
  );
}
