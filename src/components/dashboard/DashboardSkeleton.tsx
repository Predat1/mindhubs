interface Props {
  variant?: "page" | "cards" | "list" | "stats";
  count?: number;
}

/**
 * Unified skeleton component for dashboard loading states.
 *
 * Variants:
 * - page  : full-page placeholder (header + stats + content)
 * - cards : grid of product/feature cards
 * - list  : vertical list of rows (orders, customers...)
 * - stats : KPI cards row
 */
const DashboardSkeleton = ({ variant = "page", count = 3 }: Props) => {
  if (variant === "cards") {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-3xl border border-border bg-muted/20 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-border bg-muted/20 p-4 animate-pulse"
          >
            <div className="h-10 w-10 rounded-xl bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/2 rounded bg-muted" />
              <div className="h-2.5 w-1/3 rounded bg-muted/60" />
            </div>
            <div className="h-7 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "stats") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="rounded-[2.5rem] border border-border bg-muted/20 p-6 animate-pulse"
          >
            <div className="mb-4 h-10 w-10 rounded-xl bg-muted" />
            <div className="h-6 w-20 rounded bg-muted mb-2" />
            <div className="h-2.5 w-24 rounded bg-muted/60" />
          </div>
        ))}
      </div>
    );
  }

  // page: full placeholder
  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-1/3 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted/60" />
      </div>
      <DashboardSkeleton variant="stats" count={4} />
      <DashboardSkeleton variant="cards" count={3} />
    </div>
  );
};

export default DashboardSkeleton;
