"use client";

import { FundsCard, TopHoldings } from "@/components/composition-cards";
import { DashboardHero } from "@/components/dashboard-hero";
import { DiversificationCard } from "@/components/diversification-card";
import { RebalanceCard } from "@/components/rebalance-card";
import { usePortfolioContext } from "@/hooks/use-portfolio-context";
import { positionRows } from "@/lib/summary";

export const DashboardPage = () => {
  const { assets, summary } = usePortfolioContext();
  const rows = positionRows(assets)
    .filter((r) => r.asset.shares > 0)
    .toSorted((a, b) => b.invested - a.invested);

  return (
    <>
      <DashboardHero summary={summary} />
      <div className="flex flex-wrap gap-6">
        <DiversificationCard assets={assets} className="order-3 w-full md:order-1" />
        <RebalanceCard assets={assets} className="order-1 flex-[1_1_340px] md:order-2" />
        <TopHoldings rows={rows} className="order-2 w-full md:hidden" />
        <FundsCard rows={rows} className="order-4 flex-[999_1_520px] max-md:hidden md:order-3" />
      </div>
    </>
  );
};
