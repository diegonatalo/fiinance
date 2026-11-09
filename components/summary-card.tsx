import type { ComponentType } from "react";
import { Card } from "./ui/card";
import { cn } from "@/lib/cn";
import { formatBRL, formatNumber, formatPct, formatSignedPct } from "@/lib/format";
import type { Summary } from "@/lib/summary";
import type { PayoutsSummary } from "@/lib/payouts";
import {
  CoinsIcon,
  HandCoinsIcon,
  StackIcon,
  TrendUpIcon,
  WalletIcon,
} from "@phosphor-icons/react";

type SummaryCardsProps = {
  summary: Summary;
  payouts: PayoutsSummary;
};

type Item = {
  label: string;
  value: string;
  sub?: string;
  subTone?: "positivo" | "negativo";
  icon: ComponentType<{ size?: number }>;
  highlight?: boolean;
};

export const SummaryCards = ({ summary, payouts }: SummaryCardsProps) => {
  const items: Item[] = [
    {
      label: "Total investido",
      value: formatBRL(summary.totalInvested),
      sub: `${formatNumber(summary.activeAssets)} ativos · ${formatNumber(summary.totalShares)} cotas`,
      icon: WalletIcon,
      highlight: true,
    },
    {
      label: "Valor atual",
      value: formatBRL(summary.marketValue),
      sub: summary.completeQuotes
        ? `${formatBRL(summary.result)} (${formatSignedPct(summary.resultPct)})`
        : "informe as cotações na aba Carteira",
      subTone: summary.completeQuotes
        ? summary.result >= 0
          ? "positivo"
          : "negativo"
        : undefined,
      icon: TrendUpIcon,
    },
    {
      label: "Renda média mensal",
      value: formatBRL(payouts.monthlyAverage),
      sub: `${formatBRL(payouts.total12m)} em 12 meses`,
      icon: HandCoinsIcon,
    },
    {
      label: "Yield on cost (12m)",
      value: formatPct(payouts.dyOnCost, 2),
      sub: "proventos ÷ total investido",
      icon: payouts.total12m > 0 ? CoinsIcon : StackIcon,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ label, value, sub, subTone, icon: Icon, highlight }) => (
        <Card key={label} className="flex items-center gap-4">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
              highlight
                ? "bg-emerald-500 text-white"
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
            )}
          >
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {label}
            </p>
            <p
              className={cn(
                "truncate text-xl font-bold tabular-nums",
                highlight
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-900 dark:text-zinc-50",
              )}
            >
              {value}
            </p>
            {sub && (
              <p
                className={cn(
                  "truncate text-xs",
                  subTone === "positivo" && "text-emerald-600 dark:text-emerald-400",
                  subTone === "negativo" && "text-red-600 dark:text-red-400",
                  !subTone && "text-zinc-400 dark:text-zinc-500",
                )}
              >
                {sub}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
