import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      <rect width="32" height="32" rx="7" className="fill-navy dark:fill-paper" />
      <rect x="8" y="6" width="16" height="20" rx="2" className="fill-paper dark:fill-navy" />
      <rect x="8" y="6" width="16" height="2.4" className="fill-gold" />
      <rect x="11" y="13.5" width="10" height="1.6" rx="0.8" className="fill-navy/35 dark:fill-paper/40" />
      <rect x="11" y="17.5" width="7" height="1.6" rx="0.8" className="fill-navy/35 dark:fill-paper/40" />
    </svg>
  );
}

export function Wordmark({
  to = "/",
  compact = false,
  onDark = false,
}: {
  to?: string;
  compact?: boolean;
  onDark?: boolean;
}) {
  return (
    <Link to={to} className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <BrandMark className={onDark ? "[&>rect:first-child]:fill-paper [&>rect:nth-child(2)]:fill-navy" : undefined} />
      <span className="flex flex-col leading-none">
        <span className={cn("text-[0.95rem] font-semibold tracking-tight", onDark ? "text-paper" : "text-fg")}>
          InstantQuote
        </span>
        {compact ? null : (
          <span className="mt-0.5 hidden text-[0.65rem] tracking-wide text-fg-subtle sm:block">
            Look like a real company
          </span>
        )}
      </span>
    </Link>
  );
}
