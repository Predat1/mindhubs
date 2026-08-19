import { motion, useReducedMotion } from "motion/react";
import { ReactNode } from "react";
import { EASE_OUT } from "@/lib/ease";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(4px)" }}
      transition={{ duration: reduce ? 0.01 : 0.28, ease: EASE_OUT }}
      className="h-full w-full will-change-[opacity,transform,filter]"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
