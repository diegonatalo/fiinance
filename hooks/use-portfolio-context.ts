import { createContext, useContext } from "react";
import type { Portfolio } from "@/hooks/use-portfolio";

export const PortfolioContext = createContext<Portfolio | null>(null);

export function usePortfolioContext(): Portfolio {
  const ctx = useContext(PortfolioContext);
  if (!ctx) {
    throw new Error("usePortfolioContext deve ser usado dentro de PortfolioProvider");
  }
  return ctx;
}
