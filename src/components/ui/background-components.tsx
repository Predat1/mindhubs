import { cn } from "@/lib/utils";

export const BackgroundGlow = ({ className, children, ...props }: React.ComponentProps<"div">) => {
  return (
    <div className={cn("relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background", className)} {...props}>
      {/* Soft Gold Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary opacity-[0.04] blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
};
