import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { EASE_DRAWER } from "@/lib/ease";
import { cn } from "@/lib/utils";

export function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
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
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0.01 : 0.2, ease: EASE_DRAWER }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
              </DialogPrimitive.Overlay>
              <DialogPrimitive.Content forceMount asChild>
                <motion.div
                  initial={reducedMotion ? false : { y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reducedMotion ? undefined : { y: "100%", opacity: 0 }}
                  transition={{ duration: reducedMotion ? 0.01 : 0.36, ease: EASE_DRAWER }}
                  drag={reducedMotion ? false : "y"}
                  dragConstraints={{ top: 0 }}
                  dragElastic={{ top: 0.08, bottom: 0.55 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 100 || info.velocity.y > 650) onOpenChange(false);
                  }}
                  className={cn("fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-2xl border border-border bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-card-foreground shadow-2xl outline-none", className)}
                >
                  <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <DialogPrimitive.Title className="text-lg font-semibold tracking-[-0.02em]">{title}</DialogPrimitive.Title>
                    <DialogPrimitive.Close aria-label="Fermer" className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none">
                      <X className="size-4" aria-hidden="true" />
                    </DialogPrimitive.Close>
                  </div>
                  {children}
                </motion.div>
              </DialogPrimitive.Content>
            </>
          ) : null}
        </AnimatePresence>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
