import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { EASE_DRAWER } from "@/lib/ease";
import { cn } from "@/lib/utils";

export function MorphingModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal forceMount>
        <AnimatePresence>
          {open ? (
            <>
              <DialogPrimitive.Overlay forceMount asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0.01 : 0.2, ease: EASE_DRAWER }}
                  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                />
              </DialogPrimitive.Overlay>
              <DialogPrimitive.Content forceMount asChild>
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.98, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.98, filter: "blur(4px)" }}
                  transition={{ duration: reducedMotion ? 0.01 : 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className={cn("fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-2xl outline-none", className)}
                >
                  <div className="space-y-1">
                    <DialogPrimitive.Title className="text-lg font-semibold tracking-[-0.02em]">{title}</DialogPrimitive.Title>
                    {description ? <DialogPrimitive.Description className="text-sm text-muted-foreground">{description}</DialogPrimitive.Description> : null}
                  </div>
                  {children}
                  <DialogPrimitive.Close aria-label="Fermer" className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none">
                    <X className="size-4" aria-hidden="true" />
                  </DialogPrimitive.Close>
                </motion.div>
              </DialogPrimitive.Content>
            </>
          ) : null}
        </AnimatePresence>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
