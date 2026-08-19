import { motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0, className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 220, damping: 28, mass: 0.55 });
  const formatted = useTransform(springValue, (latest) => {
    const number = latest.toLocaleString("fr-FR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${number}${suffix}`;
  });

  useEffect(() => {
    if (isInView) motionValue.set(value);
  }, [isInView, motionValue, value]);

  return <motion.span ref={ref} className={className}>{formatted}</motion.span>;
}

export function NumberTicker(props: AnimatedNumberProps) {
  return <AnimatedNumber {...props} />;
}
