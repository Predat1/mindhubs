import { motion } from "motion/react";
import { createElement, forwardRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from "react";
import { SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

interface SharedLayoutBgProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  as?: ElementType;
  pillClassName?: string;
  active?: boolean;
}

export const SharedLayoutBg = forwardRef<HTMLElement, SharedLayoutBgProps>(function SharedLayoutBg(
  { children, as: Component = "div", pillClassName, active = false, className, ...props },
  ref,
) {
  const indicator = active
    ? <motion.span layoutId="mindhubs-shared-layout-bg" transition={SPRING_LAYOUT} className={cn("pointer-events-none absolute inset-0", pillClassName)} aria-hidden="true" />
    : null;
  return createElement(
    Component,
    { ...props, ref, className: cn("relative", className) },
    indicator,
    createElement("span", { className: "relative z-10" }, children),
  );
});
