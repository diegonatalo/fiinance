import { createContext, useContext } from "react";
import type { Portfolio } from "@/hooks/use-portfolio";
import type { QuoteFetchState } from "@/lib/quote-status";

/** A carteira e o estado da busca automática de cotações. */
export type PortfolioValue = Portfolio & { quoteState: QuoteFetchState };

export const PortfolioContext = createContext<PortfolioValue | null>(null);

export function usePortfolioContext(): PortfolioValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error("usePortfolioContext deve ser usado dentro de PortfolioProvider");
  }
  return ctx;
}
