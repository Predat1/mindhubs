import { motion, useReducedMotion } from "motion/react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function AnimatedText({
  children,
  className,
  as = "span",
  ...props
}: HTMLAttributes<HTMLElement> & { as?: "span" | "p" | "h1" | "h2" | "h3" }) {
  const reducedMotion = useReducedMotion();
  const Tag = motion[as];
  const words = String(children).split(" ");

  return (
    <Tag
      {...props}
      className={cn(className)}
      initial={reducedMotion ? false : "hidden"}
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.025 } }, hidden: {} }}
      aria-label={String(children)}
    >
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={{ hidden: { opacity: 0, y: 8, filter: "blur(4px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)" } }}
          transition={{ duration: reducedMotion ? 0.01 : 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
          aria-hidden="true"
        >
          {word}{index < words.length - 1 ? "\u00a0" : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
