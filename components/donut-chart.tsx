import { useState } from "react";
import { cn } from "@/lib/cn";
import type { Slice } from "@/lib/distribution";
import { donutArcs } from "@/lib/donut";
import { formatBRL, formatPct } from "@/lib/format";

const RADIUS = 48;
const STROKE = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

type DonutChartProps = {
  title: string;
  slices: Slice[];
  /** cor de cada fatia pelo nome, para a cor seguir o segmento e não a posição */
  color: (name: string) => string;
  /** texto quando não há nada investido nesse recorte */
  empty: string;
  className?: string;
};

/**
 * Donut pelo valor investido. O centro mostra o total, ou a fatia sob o mouse;
 * a legenda ao lado traz o nome, a % e o valor de cada fatia, então a cor nunca
 * é a única pista.
 */
export const DonutChart = ({ title, slices, color, empty, className }: DonutChartProps) => {
  const [active, setActive] = useState<string | null>(null);
  const arcs = donutArcs(slices, CIRCUMFERENCE);
  const total = slices.reduce((acc, s) => acc + s.amount, 0);
  const current = arcs.find((a) => a.name === active);

  return (
    <figure className={cn("flex min-w-0 flex-col gap-4", className)}>
      <figcaption className="text-[15px] font-semibold">{title}</figcaption>
      {arcs.length === 0 ? (
        <p className="py-6 text-[13px] text-muted">{empty}</p>
      ) : (
        <div className="flex flex-wrap items-center gap-5">
          <div className="relative size-[148px] shrink-0">
            <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden="true">
              <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="var(--c-hairline)" strokeWidth={STROKE} />
              {arcs.map((a) => (
                <circle
                  key={a.name}
                  cx="60"
                  cy="60"
                  r={RADIUS}
                  fill="none"
                  stroke={color(a.name)}
                  strokeWidth={active === a.name ? STROKE + 4 : STROKE}
                  strokeDasharray={`${a.length} ${CIRCUMFERENCE - a.length}`}
                  strokeDashoffset={-a.offset}
                  className="cursor-default transition-[stroke-width]"
                  onMouseEnter={() => setActive(a.name)}
                  onMouseLeave={() => setActive(null)}
                />
              ))}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center tabular-nums">
              <span className="max-w-[84px] truncate text-[11px] text-muted">{current ? capitalize(current.name) : "Total"}</span>
              <span className="text-[13px] font-semibold">{current ? formatPct(current.pct) : formatBRL(total)}</span>
            </div>
          </div>
          <ul className="flex min-w-[220px] flex-1 flex-col gap-1.5 text-[13px] tabular-nums">
            {arcs.map((a) => (
              <li
                key={a.name}
                className={cn(
                  "flex items-center gap-2 rounded-md px-1.5 py-0.5",
                  active === a.name && "bg-raised",
                )}
                onMouseEnter={() => setActive(a.name)}
                onMouseLeave={() => setActive(null)}
              >
                <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: color(a.name) }} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-fg-soft">{capitalize(a.name)}</span>
                <span className="w-12 text-right font-medium text-fg">{formatPct(a.pct)}</span>
                <span className="whitespace-nowrap text-right text-muted">{formatBRL(a.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </figure>
  );
};
