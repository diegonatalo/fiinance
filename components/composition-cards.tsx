import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { brickSegmentDistribution, paperSegmentDistribution, type Slice } from "@/lib/distribution";
import { formatBRL, formatKind, formatPct } from "@/lib/format";
import type { PositionRow } from "@/lib/summary";
import type { Fii } from "@/types/fii";

const typeColor = (asset: Fii) => (asset.type === "papel" ? "bg-paper" : "bg-brick");

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
              <span className="text-xs text-muted">{formatKind(r.asset.type, r.asset.segment)}</span>
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

const BRICK_SHADES = ["bg-brick", "bg-brick-deep", "bg-brick-light", "bg-brick/55", "bg-brick-deep/45"];
const BRICK_TEXT = ["text-brick", "text-brick-deep", "text-brick-light", "text-brick/55", "text-brick-deep/45"];
const PAPER_SHADES = ["bg-paper", "bg-paper-deep"];
const PAPER_TEXT = ["text-paper", "text-paper-deep"];

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

type StackProps = {
  title: string;
  share: number;
  slices: Slice[];
  shades: string[];
  texts: string[];
  empty: string;
};

const Stack = ({ title, share, slices, shades, texts, empty }: StackProps) => {
  const total = slices.reduce((acc, s) => acc + s.amount, 0);
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <CardTitle>{title}</CardTitle>
        <span className="text-[13px] text-muted">{formatPct(share)} da carteira</span>
      </div>
      {total === 0 ? (
        <p className="text-[13px] text-muted">{empty}</p>
      ) : (
        <>
          <div className="flex h-3.5 gap-[3px]" aria-hidden="true">
            {slices.map((s, i) => (
              <div
                key={s.name}
                className={cn("rounded-full", shades[i % shades.length])}
                style={{ width: `${(s.amount / total) * 100}%` }}
              />
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-fg-soft tabular-nums">
            {slices.map((s, i) => (
              <li key={s.name}>
                <span className={texts[i % texts.length]} aria-hidden="true">
                  ■
                </span>{" "}
                {capitalize(s.name)} {formatPct((s.amount / total) * 100)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

type SegmentsCardProps = {
  assets: Fii[];
  paperPct: number;
  brickPct: number;
  className?: string;
};

/** Tijolo por segmento e papel por indexador, pelo valor investido. */
export const SegmentsCard = ({ assets, paperPct, brickPct, className }: SegmentsCardProps) => (
  <Card className={cn("flex flex-col gap-7", className)}>
    <Stack
      title="Tijolo por segmento"
      share={brickPct}
      slices={brickSegmentDistribution(assets)}
      shades={BRICK_SHADES}
      texts={BRICK_TEXT}
      empty="Nenhum fundo de tijolo na carteira."
    />
    <Stack
      title="Papel por indexador"
      share={paperPct}
      slices={paperSegmentDistribution(assets)}
      shades={PAPER_SHADES}
      texts={PAPER_TEXT}
      empty="Nenhum fundo de papel na carteira."
    />
  </Card>
);
