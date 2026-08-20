import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocation, useNavigationType } from "react-router-dom";
import { useEffect, useRef, type ReactNode } from "react";
import { PAGE_ENTER, PAGE_EXIT, PAGE_TRANSITION } from "@/lib/motion-presets";

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
        initial={reduce ? false : { opacity: 0, y: distance, filter: "blur(2px)" }}
        animate={reduce ? { opacity: 1 } : PAGE_ENTER}
        exit={reduce ? { opacity: 0 } : PAGE_EXIT(travelDirection)}
        transition={reduce ? { duration: 0.01 } : PAGE_TRANSITION}
        className="min-h-full will-change-[opacity,transform]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
