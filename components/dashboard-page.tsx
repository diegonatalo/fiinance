"use client";

import { AllocationCard } from "@/components/allocation-card";
import { FundsCard, SegmentsCard, TopHoldings } from "@/components/composition-cards";
import { DashboardHero } from "@/components/dashboard-hero";
import { EvolutionChart } from "@/components/evolution-chart";
import { usePortfolioContext } from "@/hooks/use-portfolio-context";
import { useToday } from "@/hooks/use-today";
import { monthOf } from "@/lib/date";
import { contributionsEvolution, evolutionChart } from "@/lib/evolution";
import { summarizePayouts } from "@/lib/payouts";
import { positionRows, positionValue } from "@/lib/summary";
import { currentAllocation } from "@/lib/targets";

export const DashboardPage = () => {
  const today = useToday();
  const { assets, data, summary } = usePortfolioContext();
  const payouts = summarizePayouts(data.payouts, summary.totalInvested, monthOf(today));
  const rows = positionRows(assets)
    .filter((r) => r.asset.shares > 0)
    .toSorted((a, b) => b.invested - a.invested);
  const evolution = contributionsEvolution(data.transactions);
  const sum = (type: string) =>
    assets.filter((a) => a.type === type).reduce((acc, a) => acc + positionValue(a), 0);
  const { paperPct, brickPct } = currentAllocation(sum("papel"), sum("tijolo"));

  return (
    <>
      <DashboardHero summary={summary} payouts={payouts} />
      <div className="flex flex-wrap gap-6">
        <EvolutionChart
          chart={evolutionChart(evolution, monthOf(today))}
          invested={summary.totalInvested}
          className="order-3 flex-[999_1_560px] md:order-1"
        />
        <AllocationCard className="order-1 flex-[1_1_340px] md:order-2" />
        <TopHoldings rows={rows} className="order-2 w-full md:hidden" />
        <FundsCard rows={rows} className="order-4 flex-[1_1_520px] max-md:hidden md:order-3" />
        <SegmentsCard
          assets={assets}
          paperPct={paperPct}
          brickPct={brickPct}
          className="order-4 flex-[1_1_420px]"
        />
      </div>
    </>
  );
};
