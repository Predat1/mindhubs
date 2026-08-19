import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useRef, type ComponentPropsWithoutRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TiltCard({ children, className, ...props }: ComponentPropsWithoutRef<"div"> & { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [5, -5]), { stiffness: 200, damping: 15, mass: 0.3 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-5, 5]), { stiffness: 200, damping: 15, mass: 0.3 });

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      style={reducedMotion ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      className={cn("relative transform-gpu", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
