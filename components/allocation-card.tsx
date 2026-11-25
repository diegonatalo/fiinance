import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { usePortfolioContext } from "@/hooks/use-portfolio-context";
import { cn } from "@/lib/cn";
import { formatBRL, formatPct } from "@/lib/format";
import { parseDecimal } from "@/lib/numbers";
import { positionValue } from "@/lib/summary";
import { currentAllocation, suggestContribution } from "@/lib/targets";

const STEP = 5;

const stepButton =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-bg text-lg text-fg transition-colors hover:bg-raised disabled:opacity-40";

/** Papel × tijolo pelo valor investido, a meta e quanto aportar para chegar nela. */
export const AllocationCard = ({ className }: { className?: string }) => {
  const { assets, data, setPaperTarget } = usePortfolioContext();
  const [draft, setDraft] = useState<string | null>(null);

  const sum = (type: string) =>
    assets.filter((a) => a.type === type).reduce((acc, a) => acc + positionValue(a), 0);
  const paper = sum("papel");
  const brick = sum("tijolo");
  const { paperPct, brickPct } = currentAllocation(paper, brick);
  const target = data.paperTarget;
  const suggestion = target !== null ? suggestContribution(paper, brick, target) : null;
  const hasPositions = paper + brick > 0;
  const tone = suggestion?.variantClass === "papel" ? "paper" : "brick";

  function save() {
    if (draft === null) return;
    const n = parseDecimal(draft.replace("%", ""));
    if (draft.trim() === "") setPaperTarget(null);
    else if (Number.isFinite(n) && n >= 0 && n <= 100) setPaperTarget(n);
    setDraft(null);
  }

  function step(delta: number) {
    const base = target ?? Math.round(paperPct / STEP) * STEP;
    setPaperTarget(Math.min(100, Math.max(0, Math.round((base + delta) / STEP) * STEP)));
    setDraft(null);
  }

  return (
    <Card className={cn("flex flex-col gap-5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <CardTitle>Alocação</CardTitle>
        <span className="text-[13px] text-muted">pelo valor investido</span>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="relative">
          <div className="flex h-4 gap-[3px]">
            {hasPositions ? (
              <>
                {paperPct > 0 && <div className="rounded-full bg-paper" style={{ width: `${paperPct}%` }} />}
                {brickPct > 0 && <div className="flex-1 rounded-full bg-brick" />}
              </>
            ) : (
              <div className="flex-1 rounded-full bg-hairline" />
            )}
          </div>
          {target !== null && (
            <div
              className="absolute -top-1.5 h-7 w-0.5 -translate-x-1/2 rounded-sm bg-fg"
              style={{ left: `${target}%` }}
              aria-hidden="true"
            />
          )}
        </div>
        <div className="flex justify-between gap-3 text-[13px] text-muted tabular-nums">
          <span>
            <span className="text-paper">●</span> Papel {formatPct(paperPct)}
            {target !== null && <span className="text-faint"> / {formatPct(target, 0)}</span>}
          </span>
          <span>
            <span className="text-brick">●</span> Tijolo {formatPct(brickPct)}
            {target !== null && <span className="text-faint"> / {formatPct(100 - target, 0)}</span>}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="meta-papel" className="text-[13px] text-muted">
          Meta em papel
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Diminuir meta"
            className={stepButton}
            onClick={() => step(-STEP)}
            disabled={target === 0}
          >
            −
          </button>
          <input
            id="meta-papel"
            inputMode="decimal"
            placeholder="sem meta"
            value={draft ?? (target === null ? "" : formatPct(target, Number.isInteger(target) ? 0 : 1))}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-bg text-center text-base font-semibold text-fg tabular-nums outline-none placeholder:font-normal placeholder:text-faint focus:border-paper"
          />
          <button
            type="button"
            aria-label="Aumentar meta"
            className={stepButton}
            onClick={() => step(STEP)}
            disabled={target === 100}
          >
            +
          </button>
        </div>
      </div>

      {suggestion ? (
        <div
          className={cn(
            "flex flex-col gap-1 rounded-[14px] border p-4",
            tone === "brick" ? "border-brick/25 bg-brick/10" : "border-paper/25 bg-paper/10",
          )}
        >
          <span className={cn("text-[13px]", tone === "brick" ? "text-brick-strong" : "text-paper-strong")}>
            Próximo aporte
          </span>
          <span className="text-2xl font-semibold tracking-[-0.03em] tabular-nums">
            {formatBRL(suggestion.contribution)}{" "}
            <span
              className={cn(
                "text-[15px] font-medium tracking-normal",
                tone === "brick" ? "text-brick-strong" : "text-paper-strong",
              )}
            >
              em {suggestion.variantClass}
            </span>
          </span>
          <span className="text-[13px] text-muted">para chegar na meta só com compras</span>
        </div>
      ) : (
        <p className="rounded-[14px] border border-line p-4 text-sm text-muted">
          {target === null
            ? "Defina quanto quer em papel para saber onde aportar."
            : hasPositions
              ? "Carteira alinhada com a meta."
              : "Cadastre fundos para comparar com a meta."}
        </p>
      )}
    </Card>
  );
};
