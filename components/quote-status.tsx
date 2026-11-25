"use client";

import { usePortfolioContext } from "@/hooks/use-portfolio-context";
import { useNow } from "@/hooks/use-now";
import { cn } from "@/lib/cn";
import { quoteStatus } from "@/lib/quote-status";

const DOT = {
  fresh: "bg-up",
  old: "bg-faint",
  error: "bg-down",
  loading: "bg-faint animate-pulse",
} as const;

/** Selo "Cotações de hoje · há 3 min": as cotações chegam sozinhas, sem digitar. */
export const QuoteStatus = ({ className, bare }: { className?: string; bare?: boolean }) => {
  const { assets, data, quoteState } = usePortfolioContext();
  const now = useNow();
  const held = assets.filter((a) => a.shares > 0);
  const status = quoteStatus({
    held: held.length,
    updatedAt: held.map((a) => data.quotes[a.id]?.updatedAt),
    state: quoteState,
    now,
  });
  if (!status) return null;

  return (
    <p
      role="status"
      className={cn(
        "inline-flex shrink-0 items-center gap-2 text-[13px] text-muted",
        !bare && "h-8 rounded-full border border-line px-3",
        className,
      )}
    >
      <span className={cn("size-[7px] rounded-full", DOT[status.tone])} aria-hidden="true" />
      {status.label}
    </p>
  );
};
