"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PayoutForm } from "@/components/payout-form";
import { PayoutsChart } from "@/components/payouts-chart";
import { usePortfolioContext } from "@/lib/portfolio-context";
import { useToast } from "@/lib/toast-context";
import { useTheme } from "@/hooks/use-theme";
import { formatBRL, formatNumber } from "@/lib/format";
import { formatDate, monthOf } from "@/lib/date";
import { useToday } from "@/hooks/use-today";
import { payoutTotal, lastMonths } from "@/lib/payouts";
import { TrashSimpleIcon } from "@phosphor-icons/react";

export function PayoutsPage() {
  const { data, removePayout } = usePortfolioContext();
  const { theme } = useTheme();
  const notify = useToast();
  const today = useToday();

  const tickers = new Map(data.assets.map((a) => [a.id, a.ticker]));
  const sortedItems = data.payouts.toSorted((a, b) =>
    b.date.localeCompare(a.date),
  );
  const series = lastMonths(data.payouts, monthOf(today), 12);

  return (
    <>
      <Card>
        <CardTitle className="mb-4">Registrar provento</CardTitle>
        {data.assets.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Adicione um ativo na aba Carteira para registrar proventos.
          </p>
        ) : (
          <PayoutForm />
        )}
      </Card>

      <PayoutsChart series={series} theme={theme} />

      {sortedItems.length > 0 && (
        <Card>
          <CardTitle className="mb-4">Histórico de proventos</CardTitle>
          <ul className="grid divide-y divide-zinc-100 dark:divide-zinc-800/60">
            {sortedItems.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-2 text-sm">
                <span className="w-20 shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {formatDate(p.date)}
                </span>
                <span className="font-semibold">{tickers.get(p.assetId)}</span>
                <span className="ml-auto text-right text-xs tabular-nums text-zinc-600 dark:text-zinc-300">
                  {formatNumber(p.shares)} × {formatBRL(p.valuePerShare)}
                  <span className="block font-medium text-emerald-600 dark:text-emerald-400">
                    {formatBRL(payoutTotal(p))}
                  </span>
                </span>
                <Button
                  variant="danger"
                  className="px-2!"
                  aria-label={`Excluir provento de ${tickers.get(p.assetId)}`}
                  onClick={() => {
                    removePayout(p.id);
                    notify("Provento excluído");
                  }}
                >
                  <TrashSimpleIcon size={16} />
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
