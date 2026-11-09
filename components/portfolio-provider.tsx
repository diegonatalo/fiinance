import type { ReactNode } from "react";
import { usePortfolio } from "@/hooks/use-portfolio";
import { PortfolioContext } from "@/lib/portfolio-context";

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
  const portfolio = usePortfolio();
  return <PortfolioContext value={portfolio}>{children}</PortfolioContext>;
};
