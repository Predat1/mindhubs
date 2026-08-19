import type { Transition, Variants } from "motion/react";
import { EASE_DRAWER, EASE_OUT, SPRING_LAYOUT, SPRING_PANEL } from "@/lib/ease";

export const ROUTE_TRANSITION: Transition = {
  duration: 0.28,
  ease: EASE_OUT,
};

export const REDUCED_TRANSITION: Transition = { duration: 0.01 };

export const PANEL_TRANSITION: Transition = {
  duration: 0.36,
  ease: EASE_DRAWER,
};

export const STAGGER_CONTAINER: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.035, delayChildren: 0.04 },
  },
};

export const STAGGER_ITEM: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: EASE_OUT },
  },
};

export const OVERLAY_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.14, ease: EASE_OUT } },
};

export const SHEET_VARIANTS: Variants = {
  hidden: { opacity: 0, y: "100%" },
  show: { opacity: 1, y: 0, transition: PANEL_TRANSITION },
  exit: { opacity: 0, y: "100%", transition: PANEL_TRANSITION },
};

export const SHARED_LAYOUT_TRANSITION = SPRING_LAYOUT;
export const MORPH_PANEL_TRANSITION = SPRING_PANEL;
