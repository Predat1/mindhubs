import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";
import { EASE_OUT } from "@/lib/ease";

type AnimationVariant = "fade-up" | "fade-down" | "fade-left" | "fade-right" | "zoom-in" | "blur-in";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  variant?: AnimationVariant;
}

const hiddenByVariant: Record<AnimationVariant, Record<string, string | number>> = {
  "fade-up": { opacity: 0, y: 24 },
  "fade-down": { opacity: 0, y: -24 },
  "fade-left": { opacity: 0, x: -24 },
  "fade-right": { opacity: 0, x: 24 },
  "zoom-in": { opacity: 0, scale: 0.96 },
  "blur-in": { opacity: 0, y: 16, filter: "blur(6px)" },
};

const AnimateOnScroll = ({ children, className = "", delay = 0, duration = 280, variant = "fade-up" }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const reduce = useReducedMotion();
  const safeDuration = Math.min(Math.max(duration, 120), 400) / 1000;

  return (
    <motion.div
      ref={ref}
      initial={reduce ? false : hiddenByVariant[variant]}
      animate={reduce || isInView ? { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" } : hiddenByVariant[variant]}
      transition={reduce ? { duration: 0.01 } : { duration: safeDuration, delay: Math.min(Math.max(delay, 0), 320) / 1000, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimateOnScroll;
