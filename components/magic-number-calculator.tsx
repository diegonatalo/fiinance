import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { formatDayMonth } from "@/lib/date";
import { formatBRL, formatNumber, formatPct } from "@/lib/format";
import { calculateMagicNumber } from "@/lib/magic-number";
import { parseDecimal, parseDecimalOrZero } from "@/lib/numbers";
import type { Fii, Payout } from "@/types/fii";

type MagicNumberCalcProps = {
  assets: Fii[];
  payouts: Payout[];
  className?: string;
};

const MANUAL = "";
const toField = (n: number) => String(n).replace(".", ",");

function lastPayout(payouts: Payout[], assetId: string) {
  return payouts.filter((p) => p.assetId === assetId).toSorted((a, b) => b.date.localeCompare(a.date))[0];
}

export const MagicNumberCalc = ({ assets, payouts, className }: MagicNumberCalcProps) => {
  const held = assets.filter((a) => a.shares > 0);
  // null: ainda não escolheu, vale o primeiro fundo da carteira
  const [picked, setPicked] = useState<string | null>(null);
  const [typedDividend, setTypedDividend] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [manualShares, setManualShares] = useState("");

  const assetId = picked ?? held[0]?.id ?? MANUAL;
  const asset = held.find((a) => a.id === assetId) ?? null;
  const last = asset ? lastPayout(payouts, asset.id) : undefined;
  const dividend = typedDividend ?? (last ? toField(last.valuePerShare) : "");
  const currentShares = asset ? asset.shares : parseDecimalOrZero(manualShares);
  const result = calculateMagicNumber(parseDecimal(dividend), parseDecimal(price), currentShares);

  function pick(id: string) {
    setPicked(id);
    setTypedDividend(null);
  }

  return (
    <Card className={cn("flex flex-col gap-[22px]", className)}>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold tracking-[-0.02em]">Número mágico</h2>
        <p className="text-sm text-muted">Quantas cotas para o provento do mês comprar uma cota nova.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="col-span-2">
          <Field label="Fundo">
            <Select value={assetId} onChange={(e) => pick(e.target.value)}>
              {held.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.ticker} · {formatNumber(a.shares)} cotas
                </option>
              ))}
              <option value={MANUAL}>Outro fundo (digitar)</option>
            </Select>
          </Field>
        </div>
        <Field
          label="Provento por cota"
          hint={typedDividend === null && last ? `último provento, de ${formatDayMonth(last.date)}` : undefined}
        >
          <Input inputMode="decimal" value={dividend} onChange={(e) => setTypedDividend(e.target.value)} placeholder="R$ 0,00" />
        </Field>
        <Field label="Preço da cota">
          <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="R$ 0,00" />
        </Field>
        {!asset && (
          <div className="col-span-2">
            <Field label="Cotas que você já possui">
              <Input inputMode="numeric" value={manualShares} onChange={(e) => setManualShares(e.target.value)} placeholder="0" />
            </Field>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-[18px] rounded-2xl border border-line bg-bg p-5 tabular-nums md:p-6">
        {!result ? (
          <p className="py-6 text-center text-sm text-muted">Preencha o provento e o preço da cota para ver o resultado.</p>
        ) : (
          <>
            <div className="flex items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-muted">Número mágico</span>
                <span className="flex items-baseline gap-1.5">
                  <span className="text-[38px] leading-none font-semibold tracking-[-0.04em] md:text-[40px]">
                    {formatNumber(result.magicNumber)}
                  </span>
                  <span className="text-[15px] font-medium text-muted">cotas</span>
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[13px] text-muted">Você tem</span>
                <span className="text-2xl font-semibold">{formatNumber(currentShares)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div
                role="progressbar"
                aria-label="Progresso até o número mágico"
                aria-valuenow={Math.round(result.progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-2.5 rounded-full bg-hairline"
              >
                <div
                  className={cn("h-2.5 rounded-full", result.reached ? "bg-up" : "bg-paper")}
                  style={{ width: `${result.progress}%` }}
                />
              </div>
              <span className="self-end text-xs text-muted">{formatPct(result.progress)}</span>
            </div>
            <p className="border-t border-hairline pt-4 text-[15px] leading-normal text-fg-soft">
              {result.reached ? (
                <span className="font-medium text-up">Meta atingida: o provento do mês já compra uma cota nova.</span>
              ) : (
                <>
                  Faltam <span className="font-semibold text-fg">{formatNumber(result.missing)} cotas</span>, cerca de{" "}
                  <span className="font-semibold text-fg">{formatBRL(result.missingContribution)}</span> em aportes.
                </>
              )}
            </p>
          </>
        )}
      </div>
    </Card>
  );
};
