import { cn } from "@/lib/cn";
import { formatMonth } from "@/lib/date";
import { formatBRL } from "@/lib/format";
import type { PayoutMonth } from "@/lib/payouts";

type PayoutsChartProps = {
  series: PayoutMonth[];
  average: number;
  /** mês em destaque (o último com proventos) */
  highlight: string | null;
};

/** Barras dos últimos 12 meses, com a linha da média. */
export const PayoutsChart = ({ series, average, highlight }: PayoutsChartProps) => {
  const max = Math.max(...series.map((m) => m.total), average) * 1.06 || 1;
  const first = series[0];
  const last = series.at(-1);
  const peak = series.reduce((best, m) => (m.total > best.total ? m : best), series[0] ?? { month: "", total: 0 });

  return (
    <div
      role="img"
      aria-label={
        first && last
          ? `Proventos por mês de ${formatMonth(first.month)} a ${formatMonth(last.month)}, com pico de ${formatBRL(peak.total)} em ${formatMonth(peak.month)}`
          : "Sem proventos"
      }
      className="flex flex-col gap-2.5"
    >
      <div className="relative grid h-[130px] grid-cols-12 items-end gap-1.5 border-b border-line md:h-[220px] md:gap-2.5" aria-hidden="true">
        {average > 0 && (
          <>
            <div className="absolute inset-x-0 border-t border-dashed border-track" style={{ bottom: `${(average / max) * 100}%` }} />
            <span
              className="absolute right-0 mb-1 hidden font-mono text-[11px] text-subtle md:block"
              style={{ bottom: `${(average / max) * 100}%` }}
            >
              média {formatBRL(Math.round(average)).replace(",00", "")}
            </span>
          </>
        )}
        {series.map((m) => (
          <div
            key={m.month}
            className={cn("rounded-t-[5px] rounded-b-[1px] md:rounded-t-lg", m.month === highlight ? "bg-fg" : "bg-track")}
            style={{ height: `${(m.total / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-12 gap-1.5 text-center font-mono text-[9px] text-subtle md:gap-2.5 md:text-[11px]" aria-hidden="true">
        {series.map((m) => (
          <span key={m.month}>
            <span className="md:hidden">{formatMonth(m.month).charAt(0).toUpperCase()}</span>
            <span className="hidden md:inline">{formatMonth(m.month).slice(0, 3)}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
