"use client";

import { useState } from "react";
import Link from "next/link";
import { TrashSimpleIcon } from "@phosphor-icons/react";
import { PageHeader } from "@/components/page-header";
import { PayoutForm } from "@/components/payout-form";
import { PayoutsChart } from "@/components/payouts-chart";
import { Button, buttonClasses } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { usePortfolioContext } from "@/hooks/use-portfolio-context";
import { useToast } from "@/hooks/use-toast";
import { useToday } from "@/hooks/use-today";
import { cn } from "@/lib/cn";
import { formatDayMonth, formatMonthLong, monthName, monthOf } from "@/lib/date";
import { formatBRL, formatDelta, formatNumber } from "@/lib/format";
import { lastMonths, latestPayoutMonth, payoutsByMonth, payoutTotal, summarizePayouts } from "@/lib/payouts";

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

type StatProps = { label: string; children: React.ReactNode; className?: string; note?: React.ReactNode };

const Stat = ({ label, children, className, note }: StatProps) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    <dt className="text-[13px] text-muted">{label}</dt>
    <dd className="text-[40px] leading-none font-semibold tracking-[-0.045em] tabular-nums md:leading-normal md:tracking-[-0.04em]">{children}</dd>
    {note && <dd className="text-[13px] text-muted tabular-nums md:hidden">{note}</dd>}
  </div>
);

export const PayoutsPage = () => {
  const { assets, data, summary, removePayout } = usePortfolioContext();
  const notify = useToast();
  const today = useToday();
  const [adding, setAdding] = useState(false);

  const tickers = new Map(data.assets.map((a) => [a.id, a]));
  const series = lastMonths(data.payouts, monthOf(today), 12);
  const totals = summarizePayouts(data.payouts, summary.totalInvested, monthOf(today));
  const latest = latestPayoutMonth(series);
  const months = payoutsByMonth(data.payouts);

  function remove(id: string, ticker: string | undefined) {
    removePayout(id);
    notify(`Provento de ${ticker ?? "fundo"} excluído`);
  }

  return (
    <>
      <PageHeader
        title="Proventos"
        description="A renda que a carteira paga, mês a mês."
        action={{ label: "Lançar provento", onClick: () => setAdding(true) }}
      />

      <section className="flex flex-col gap-7 rounded-[20px] border border-line bg-surface p-5 md:p-8">
        <dl className="flex flex-wrap gap-x-14 gap-y-5">
          <Stat
            label="Últimos 12 meses"
            note={
              <>
                média de <span className="text-fg">{formatBRL(totals.monthlyAverage)}</span> por mês
              </>
            }
          >
            {formatBRL(totals.total12m)}
          </Stat>
          <Stat label="Média por mês" className="max-md:hidden">
            {formatBRL(totals.monthlyAverage)}
          </Stat>
          {latest && (
            <Stat label={capitalize(monthName(latest.month))} className="max-md:hidden">
              {formatBRL(latest.total)}{" "}
              {latest.changePct !== null && (
                <span className={cn("text-sm font-medium tracking-normal", latest.changePct >= 0 ? "text-up" : "text-down")}>
                  {formatDelta(latest.changePct, 1)}
                </span>
              )}
            </Stat>
          )}
        </dl>
        {series.length > 0 && (
          <PayoutsChart series={series} average={totals.monthlyAverage} highlight={latest?.month ?? null} />
        )}
      </section>

      {months.length === 0 && (
        <p className="rounded-[20px] border border-dashed border-line-strong px-6 py-12 text-center text-[15px] text-muted">
          Nenhum provento lançado ainda. Use <span className="text-fg">Lançar provento</span> quando um fundo pagar.
        </p>
      )}

      {months.map((group) => (
        <section key={group.month} className="overflow-hidden rounded-[20px] border border-line bg-surface" aria-labelledby={`mes-${group.month}`}>
          <div className="flex items-baseline justify-between gap-3 px-5 pt-5 pb-2 md:px-6 md:pt-6">
            <h2 id={`mes-${group.month}`} className="text-[15px] font-semibold md:text-[17px]">
              {capitalize(formatMonthLong(group.month))}
            </h2>
            <span className="text-[13px] text-muted tabular-nums">
              <span className="font-semibold text-fg">{formatBRL(group.total)}</span>
              <span className="max-md:hidden">
                {" "}
                · {group.items.length} {group.items.length === 1 ? "pagamento" : "pagamentos"}
              </span>
            </span>
          </div>

          <ul className="px-5 pb-2 md:hidden">
            {group.items.map((p) => {
              const asset = tickers.get(p.assetId);
              return (
                <li key={p.id} className="flex items-center gap-3 border-t border-hairline py-2 tabular-nums">
                  <span className={cn("h-6 w-1 rounded", asset?.type === "papel" ? "bg-paper" : "bg-brick")} aria-hidden="true" />
                  <span className="flex flex-1 flex-wrap items-baseline gap-x-2.5">
                    <span className="font-mono text-[13px] font-medium">{asset?.ticker}</span>
                    <span className="text-xs text-muted">
                      {formatDayMonth(p.date)} · {formatBRL(p.valuePerShare)} × {formatNumber(p.shares)}
                    </span>
                  </span>
                  <span className="text-sm font-semibold">{formatBRL(payoutTotal(p))}</span>
                  <Button variant="danger" size="icon" aria-label={`Excluir provento de ${asset?.ticker}`} onClick={() => remove(p.id, asset?.ticker)}>
                    <TrashSimpleIcon size={16} />
                  </Button>
                </li>
              );
            })}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] border-collapse tabular-nums">
              <thead>
                <tr className="font-mono text-[11px] tracking-[0.06em] text-subtle uppercase">
                  <th scope="col" className="px-6 py-3.5 text-left font-medium">Fundo</th>
                  <th scope="col" className="px-3 py-3.5 text-left font-medium">Data</th>
                  <th scope="col" className="px-3 py-3.5 text-right font-medium">Por cota</th>
                  <th scope="col" className="px-3 py-3.5 text-right font-medium">Cotas</th>
                  <th scope="col" className="px-3 py-3.5 text-right font-medium">Recebido</th>
                  <th scope="col" className="w-16 px-6 py-3.5"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((p) => {
                  const asset = tickers.get(p.assetId);
                  return (
                    <tr key={p.id} className="border-t border-hairline">
                      <th scope="row" className="px-6 py-2.5 text-left font-normal">
                        <span className="inline-flex items-center gap-3">
                          <span className={cn("h-6 w-1 rounded", asset?.type === "papel" ? "bg-paper" : "bg-brick")} aria-hidden="true" />
                          <span className="font-mono text-sm font-medium">{asset?.ticker}</span>
                        </span>
                      </th>
                      <td className="px-3 py-2.5 text-sm text-muted">{formatDayMonth(p.date)}</td>
                      <td className="px-3 py-2.5 text-right text-sm">{formatBRL(p.valuePerShare)}</td>
                      <td className="px-3 py-2.5 text-right text-sm text-muted">{formatNumber(p.shares)}</td>
                      <td className="px-3 py-2.5 text-right text-sm font-semibold">{formatBRL(payoutTotal(p))}</td>
                      <td className="px-6 py-2.5 text-right">
                        <Button variant="danger" size="icon" aria-label={`Excluir provento de ${asset?.ticker}`} onClick={() => remove(p.id, asset?.ticker)}>
                          <TrashSimpleIcon size={16} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <Modal open={adding} title="Lançar provento" onClose={() => setAdding(false)}>
        {assets.length === 0 ? (
          <div className="flex flex-col items-start gap-4">
            <p className="text-[15px] text-muted">Cadastre um fundo na Carteira antes de lançar proventos.</p>
            <Link href="/app/carteira" className={buttonClasses()}>
              Ir para a Carteira
            </Link>
          </div>
        ) : (
          <PayoutForm onDone={() => setAdding(false)} />
        )}
      </Modal>
    </>
  );
};
