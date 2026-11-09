import { useState } from "react";
import { Card, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { usePortfolioContext } from "@/lib/portfolio-context";
import { formatBRL, formatPct } from "@/lib/format";
import { currentAllocation, suggestContribution } from "@/lib/targets";
import { parseDecimal } from "@/lib/numbers";
import { positionValue } from "@/lib/summary";
import { TargetIcon } from "@phosphor-icons/react";

const Bar = ({
  name,
  current,
  target,
}: {
  name: string;
  current: number;
  target: number | null;
}) => {
  return (
    <div className="grid gap-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-zinc-700 dark:text-zinc-200">
          {name}
        </span>
        <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
          {formatPct(current)}
          {target !== null && ` / meta ${formatPct(target, 0)}`}
        </span>
      </div>
      <div className="relative h-2.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${Math.min(100, current)}%` }}
        />
        {target !== null && (
          <div
            className="absolute -top-0.5 h-3.5 w-0.5 bg-zinc-900 dark:bg-zinc-100"
            style={{ left: `${target}%` }}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
};

export const TargetsCard = () => {
  const { assets, data, setPaperTarget } = usePortfolioContext();
  const [draft, setDraft] = useState<string | null>(null);

  const paper = assets
    .filter((a) => a.type === "papel")
    .reduce((acc, a) => acc + positionValue(a), 0);
  const brick = assets
    .filter((a) => a.type === "tijolo")
    .reduce((acc, a) => acc + positionValue(a), 0);
  const { paperPct, brickPct } = currentAllocation(paper, brick);
  const target = data.paperTarget;
  const suggestion = target !== null ? suggestContribution(paper, brick, target) : null;

  function save() {
    if (draft === null) return;
    const n = parseDecimal(draft);
    if (draft.trim() === "") setPaperTarget(null);
    else if (Number.isFinite(n) && n >= 0 && n <= 100) setPaperTarget(n);
    setDraft(null);
  }

  return (
    <Card>
      <div className="mb-1 flex items-center gap-2">
        <TargetIcon size={16} className="text-emerald-500" />
        <CardTitle className="text-zinc-900 dark:text-zinc-100">
          Meta de alocação
        </CardTitle>
      </div>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        Defina quanto da carteira quer em papel; o restante fica em tijolo.
        Comparação feita pelo valor investido.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-4">
          <label className="grid max-w-48 gap-1.5">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Meta em papel (%)
            </span>
            <Input
              inputMode="decimal"
              placeholder="ex.: 40"
              value={draft ?? (target === null ? "" : String(target).replace(".", ","))}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={save}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            />
          </label>
          {suggestion && (
            <p className="rounded-lg bg-zinc-100 px-3 py-2.5 text-sm text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200">
              Para chegar na meta só com compras, aporte cerca de{" "}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatBRL(suggestion.contribution)}
              </span>{" "}
              em <span className="font-semibold">{suggestion.variantClass}</span>.
            </p>
          )}
          {target !== null && !suggestion && paper + brick > 0 && (
            <p className="rounded-lg bg-emerald-500/10 px-3 py-2.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Carteira alinhada com a meta.
            </p>
          )}
        </div>

        <div className="grid content-start gap-3">
          <Bar name="Papel" current={paperPct} target={target} />
          <Bar
            name="Tijolo"
            current={brickPct}
            target={target === null ? null : 100 - target}
          />
        </div>
      </div>
    </Card>
  );
};
