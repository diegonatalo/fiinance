import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { formatBRL } from "@/lib/format";
import type { EvolutionChart as Chart } from "@/lib/evolution";

type EvolutionChartProps = {
  chart: Chart | null;
  /** o patrimônio de hoje, quando todas as cotações estão em dia */
  marketValue: number | null;
  /** o último valor investido acumulado */
  invested: number;
  className?: string;
};

/** Valor investido mês a mês (tracejado) e o patrimônio de hoje (ponto). */
export const EvolutionChart = ({ chart, marketValue, invested, className }: EvolutionChartProps) => (
  <Card className={cn("flex flex-col gap-5", className)}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <CardTitle>Evolução</CardTitle>
      <div className="flex gap-5 text-[13px] text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-fg" aria-hidden="true" />
          Patrimônio hoje
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-4 border-t-2 border-dashed border-faint" aria-hidden="true" />
          Investido
        </span>
      </div>
    </div>
    {chart === null ? (
      <p className="py-16 text-center text-sm text-muted">
        Registre operações em pelo menos dois meses para ver a evolução.
      </p>
    ) : (
      <div>
        <div
          role="img"
          aria-label={`Valor investido ao longo dos meses, chegando a ${formatBRL(invested)}${
            marketValue === null ? "" : `, e patrimônio de ${formatBRL(marketValue)} hoje`
          }`}
          className="relative h-[260px]"
        >
          <svg viewBox="0 0 800 250" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true">
            {chart.grid.map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="800"
                y2={y}
                className="stroke-hairline"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <path
              d={chart.invested}
              fill="none"
              className="stroke-faint"
              strokeWidth="2"
              strokeDasharray="5 5"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {chart.today && (
            <span
              className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg ring-4 ring-surface"
              style={{ left: `${(chart.today.x / 800) * 100}%`, top: `${(chart.today.y / 250) * 100}%` }}
              aria-hidden="true"
            />
          )}
        </div>
        <div className="relative h-4 font-mono text-[11px] text-subtle" aria-hidden="true">
          {chart.labels.map((label) => (
            <span key={label.left} className="absolute -translate-x-1/2" style={{ left: `${label.left}%` }}>
              {label.text}
            </span>
          ))}
        </div>
      </div>
    )}
  </Card>
);
