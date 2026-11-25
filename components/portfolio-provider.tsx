import type { ReactNode } from "react";
import { usePortfolio } from "@/hooks/use-portfolio";
import { PortfolioContext } from "@/hooks/use-portfolio-context";
import { useQuoteRefresh } from "@/hooks/use-quote-refresh";

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
  const portfolio = usePortfolio();
  const quoteState = useQuoteRefresh(portfolio.assets, portfolio.data.quotes, portfolio.setQuotes);
  return <PortfolioContext value={{ ...portfolio, quoteState }}>{children}</PortfolioContext>;
};
