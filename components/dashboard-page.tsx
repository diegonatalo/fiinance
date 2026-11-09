"use client";

import { useTheme } from "@/hooks/use-theme";
import { SummaryCards } from "@/components/summary-card";
import { ChartsGrid } from "@/components/charts-grid";
import { TargetsCard } from "@/components/targets-card";
import { EvolutionChart } from "@/components/evolution-chart";
import { usePortfolioContext } from "@/lib/portfolio-context";
import { contributionsEvolution } from "@/lib/evolution";
import { monthOf } from "@/lib/date";
import { useToday } from "@/hooks/use-today";
import { summarizePayouts } from "@/lib/payouts";

export const DashboardPage = () => {
  const { theme } = useTheme();
  const today = useToday();
  const { assets, data, summary } = usePortfolioContext();
  const payouts = summarizePayouts(
    data.payouts,
    summary.totalInvested,
    monthOf(today),
  );

  return (
    <>
      <SummaryCards summary={summary} payouts={payouts} />

      <section className="grid gap-3">
        <h2 className="text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
          Alocação
        </h2>
        <TargetsCard />
        <ChartsGrid assets={assets} theme={theme} />
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
          Evolução
        </h2>
        <EvolutionChart data={contributionsEvolution(data.transactions)} theme={theme} />
      </section>
    </>
  );
};
