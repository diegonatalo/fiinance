import type { ComponentType } from "react";
import { Card } from "./ui/card";
import { cn, formatBRL, formatNumber, formatPct, formatPctSinal } from "../lib/format";
import type { Resumo } from "../lib/resumo";
import type { ResumoProventos } from "../lib/proventos";
import {
  CoinsIcon,
  HandCoinsIcon,
  StackIcon,
  TrendUpIcon,
  WalletIcon,
} from "@phosphor-icons/react";

interface SummaryCardsProps {
  resumo: Resumo;
  proventos: ResumoProventos;
}

interface Item {
  label: string;
  value: string;
  sub?: string;
  subTom?: "positivo" | "negativo";
  icon: ComponentType<{ size?: number }>;
  highlight?: boolean;
}

export function SummaryCards({ resumo, proventos }: SummaryCardsProps) {
  const items: Item[] = [
    {
      label: "Total investido",
      value: formatBRL(resumo.totalInvestido),
      sub: `${formatNumber(resumo.ativosAtivos)} ativos · ${formatNumber(resumo.totalCotas)} cotas`,
      icon: WalletIcon,
      highlight: true,
    },
    {
      label: "Valor atual",
      value: formatBRL(resumo.valorMercado),
      sub: resumo.cotacoesCompletas
        ? `${formatBRL(resumo.resultado)} (${formatPctSinal(resumo.resultadoPct)})`
        : "informe as cotações na aba Carteira",
      subTom: resumo.cotacoesCompletas
        ? resumo.resultado >= 0
          ? "positivo"
          : "negativo"
        : undefined,
      icon: TrendUpIcon,
    },
    {
      label: "Renda média mensal",
      value: formatBRL(proventos.mediaMensal),
      sub: `${formatBRL(proventos.total12m)} em 12 meses`,
      icon: HandCoinsIcon,
    },
    {
      label: "Yield on cost (12m)",
      value: formatPct(proventos.dyOnCost, 2),
      sub: "proventos ÷ total investido",
      icon: proventos.total12m > 0 ? CoinsIcon : StackIcon,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ label, value, sub, subTom, icon: Icon, highlight }) => (
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
                  subTom === "positivo" && "text-emerald-600 dark:text-emerald-400",
                  subTom === "negativo" && "text-red-600 dark:text-red-400",
                  !subTom && "text-zinc-400 dark:text-zinc-500",
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
}
