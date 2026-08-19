import { cn } from "@/lib/utils";

export function Shimmer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("relative overflow-hidden rounded-lg bg-muted/70", className)} {...props}>
    <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_var(--ease-out)_infinite] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
  </div>;
}
