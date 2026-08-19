import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import markSvg from "@/assets/brand/mindhubs-mark.svg?raw";

export type MindHubsMarkVariant = "cyan" | "mono" | "current";

export type MindHubsMarkProps = {
  size?: number;
  variant?: MindHubsMarkVariant;
  className?: string;
  decorative?: boolean;
  title?: string;
};

const variantStyles: Record<MindHubsMarkVariant, CSSProperties> = {
  cyan: {
    "--mindhubs-mark-node": "#6EE7FF",
    "--mindhubs-mark-link": "#18DCFF",
  } as CSSProperties,
  mono: {
    "--mindhubs-mark-node": "hsl(var(--foreground))",
    "--mindhubs-mark-link": "hsl(var(--foreground))",
  } as CSSProperties,
  current: {
    "--mindhubs-mark-node": "hsl(var(--brand-cyan))",
    "--mindhubs-mark-link": "hsl(var(--brand-cyan-strong))",
  } as CSSProperties,
};

function getInlineMarkSvg(variant: MindHubsMarkVariant) {
  return markSvg.replace('class="mh-mark"', `class="mh-mark" data-variant="${variant}"`);
}

export function MindHubsMark({
  size = 24,
  variant = "current",
  className,
  decorative = false,
  title,
}: MindHubsMarkProps) {
  return (
    <span
      className={cn("inline-flex shrink-0", className)}
      style={{ ...variantStyles[variant], width: size, height: size }}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : title || "MindHubs"}
      aria-hidden={decorative ? "true" : undefined}
      dangerouslySetInnerHTML={{ __html: getInlineMarkSvg(variant) }}
    />
  );
}

export default MindHubsMark;
