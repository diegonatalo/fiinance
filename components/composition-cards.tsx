import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { formatBRL, formatKind, formatPct } from "@/lib/format";
import type { PositionRow } from "@/lib/summary";
import type { Asset } from "@/types/fii";

const typeColor = (asset: Asset) => (asset.type === "papel" ? "bg-paper" : "bg-brick");

/** Peso de cada fundo no total investido, em barras. */
export const FundsCard = ({ rows, className }: { rows: PositionRow[]; className?: string }) => {
  const max = Math.max(...rows.map((r) => r.invested), 0);
  return (
    <Card className={cn("flex flex-col gap-3.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <CardTitle>Por fundo</CardTitle>
        <span className="text-[13px] text-muted">peso no valor investido</span>
      </div>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Nenhum fundo na carteira.</p>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {rows.map((r) => (
            <li
              key={r.asset.id}
              className="grid grid-cols-[76px_minmax(0,1fr)_104px_52px] items-center gap-3.5 text-[13px] tabular-nums"
            >
              <span className="font-mono font-medium">{r.asset.ticker}</span>
              <span className="h-2 rounded-full bg-hairline" aria-hidden="true">
                <span
                  className={cn("block h-2 rounded-full", typeColor(r.asset))}
                  style={{ width: `${max > 0 ? (r.invested / max) * 100 : 0}%` }}
                />
              </span>
              <span className="text-right">{formatBRL(r.invested)}</span>
              <span className="text-right text-muted">{formatPct(r.weight)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

/** No celular: as quatro maiores posições, com link para a carteira. */
export const TopHoldings = ({ rows, className }: { rows: PositionRow[]; className?: string }) => {
  if (rows.length === 0) return null;
  return (
    <section className={cn("flex flex-col", className)} aria-labelledby="maiores-posicoes">
      <div className="flex items-baseline justify-between pb-1.5">
        <h2 id="maiores-posicoes" className="text-[15px] font-semibold">
          Maiores posições
        </h2>
        <Link href="/app/carteira" className="text-[13px] text-paper">
          Ver carteira
        </Link>
      </div>
      <ul>
        {rows.slice(0, 4).map((r) => (
          <li key={r.asset.id} className="flex items-center gap-3 border-t border-hairline py-2.5 tabular-nums">
            <span className={cn("h-[30px] w-1 rounded", typeColor(r.asset))} aria-hidden="true" />
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="font-mono text-sm font-medium">{r.asset.ticker}</span>
              <span className="text-xs text-muted">{formatKind(r.asset)}</span>
            </span>
            <span className="flex flex-col items-end gap-0.5">
              <span className="text-sm font-medium">{formatBRL(r.invested)}</span>
              <span className="text-xs text-muted">{formatPct(r.weight)}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};
