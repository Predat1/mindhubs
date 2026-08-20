import { EASE_OUT, SPRING_LAYOUT, SPRING_PANEL, SPRING_PRESS } from "@/lib/ease";

export const PAGE_ENTER = {
  opacity: 1,
  y: 0,
  filter: "blur(0px)",
} as const;

export const PAGE_EXIT = (direction: 1 | -1) => ({
  opacity: 0,
  y: direction > 0 ? -6 : 6,
  filter: "blur(2px)",
});

export const PAGE_TRANSITION = {
  duration: 0.24,
  ease: EASE_OUT,
} as const;

export const LIST_ITEM_TRANSITION = {
  duration: 0.2,
  ease: EASE_OUT,
} as const;

export { EASE_OUT, SPRING_LAYOUT, SPRING_PANEL, SPRING_PRESS };
