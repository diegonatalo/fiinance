import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { formatBRL } from "@/lib/format";
import type { EvolutionChart as Chart } from "@/lib/evolution";

type EvolutionChartProps = {
  chart: Chart | null;
  /** o investido acumulado até hoje */
  invested: number;
  className?: string;
};

/** Valor investido acumulado mês a mês. */
export const EvolutionChart = ({ chart, invested, className }: EvolutionChartProps) => (
  <Card className={cn("flex flex-col gap-5", className)}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <CardTitle>Evolução</CardTitle>
      <span className="text-[13px] text-muted">investido acumulado</span>
    </div>
    {chart === null ? (
      <p className="py-16 text-center text-sm text-muted">
        Registre operações em pelo menos dois meses para ver a evolução.
      </p>
    ) : (
      <div>
        <div
          role="img"
          aria-label={`Valor investido acumulado ao longo dos meses, chegando a ${formatBRL(invested)}`}
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
            <path d={chart.area} className="fill-fg" fillOpacity="0.05" />
            <path
              d={chart.invested}
              fill="none"
              className="stroke-fg"
              strokeWidth="2.5"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <span
            className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg ring-4 ring-surface"
            style={{ left: `${(chart.last.x / 800) * 100}%`, top: `${(chart.last.y / 250) * 100}%` }}
            aria-hidden="true"
          />
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
