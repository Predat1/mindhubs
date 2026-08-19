import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MindHubsMark, type MindHubsMarkVariant } from "./MindHubsMark";

export type MindHubsLogoProps = {
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: MindHubsMarkVariant;
  href?: string;
  className?: string;
};

const sizes = {
  sm: { icon: 26, text: "text-sm", gap: "gap-2" },
  md: { icon: 32, text: "text-base", gap: "gap-2.5" },
  lg: { icon: 40, text: "text-xl", gap: "gap-3" },
} as const;

export function MindHubsLogo({
  showWordmark = true,
  size = "md",
  variant = "current",
  href = "/",
  className,
}: MindHubsLogoProps) {
  const scale = sizes[size];
  const content = (
    <span className={cn("inline-flex min-w-0 items-center font-semibold tracking-[-0.025em]", scale.gap, className)}>
      <MindHubsMark size={scale.icon} variant={variant} decorative={showWordmark} title="MindHubs" />
      {showWordmark ? <span className={cn("truncate", scale.text)}>MindHubs</span> : null}
    </span>
  );

  return href ? (
    <Link to={href} aria-label="MindHubs, accueil" className="inline-flex min-w-0 rounded-lg focus-visible:outline-none">
      {content}
    </Link>
  ) : content;
}

export default MindHubsLogo;
