import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocation, useNavigationType } from "react-router-dom";
import { useEffect, useRef, type ReactNode } from "react";
import { EASE_OUT } from "@/lib/ease";

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const reduce = useReducedMotion() ?? false;
  const previousHistoryIndex = useRef<number | undefined>(undefined);
  const direction = useRef<1 | -1>(1);

  useEffect(() => {
    const currentIndex = window.history.state?.idx as number | undefined;
    if (navigationType === "POP" && currentIndex !== undefined && previousHistoryIndex.current !== undefined) {
      direction.current = currentIndex < previousHistoryIndex.current ? -1 : 1;
    } else {
      direction.current = navigationType === "POP" ? -1 : 1;
    }
    previousHistoryIndex.current = currentIndex;
  }, [location.key, navigationType]);

  const travelDirection = direction.current;
  const distance = travelDirection > 0 ? 8 : -8;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${location.pathname}${location.search}`}
        initial={reduce ? false : { opacity: 0, y: distance, filter: "blur(4px)" }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -distance, filter: "blur(4px)" }}
        transition={{ duration: reduce ? 0.01 : 0.28, ease: EASE_OUT }}
        className="min-h-screen will-change-[opacity,transform,filter]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
