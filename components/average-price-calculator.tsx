import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { simulateAveragePrice } from "@/lib/average-price";
import { cn } from "@/lib/cn";
import { formatBRL, formatChange, formatNumber } from "@/lib/format";
import { parseDecimal, parseDecimalOrZero } from "@/lib/numbers";
import type { Asset } from "@/types/fii";

type AveragePriceCalcProps = {
  assets: Asset[];
  /** soma a compra simulada à posição do fundo */
  onRecord: (asset: Asset, shares: number, price: number) => void;
  className?: string;
};

const MANUAL = "";

export const AveragePriceCalc = ({ assets, onRecord, className }: AveragePriceCalcProps) => {
  const held = assets.filter((a) => a.shares > 0);
  // null: ainda não escolheu, vale o primeiro fundo da carteira
  const [picked, setPicked] = useState<string | null>(null);
  const [manualShares, setManualShares] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const assetId = picked ?? held[0]?.id ?? MANUAL;
  const asset = held.find((a) => a.id === assetId) ?? null;

  const currentShares = asset ? asset.shares : parseDecimalOrZero(manualShares);
  const currentPrice = asset ? asset.averagePrice : parseDecimalOrZero(manualPrice);
  const qty = parseDecimal(newShares);
  const price = parseDecimal(newPrice);
  const result = simulateAveragePrice(currentShares, currentPrice, qty, price);
  const lowered = result ? result.variation <= 0 : false;


  return (
    <Card className={cn("flex flex-col gap-[22px]", className)}>
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-semibold tracking-[-0.02em]">Preço médio</h2>
        <p className="text-sm text-muted">Como fica o seu preço médio depois de uma nova compra.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="col-span-2">
          <Field label="Fundo">
            <Select value={assetId} onChange={(e) => setPicked(e.target.value)}>
              {held.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.ticker} · {formatNumber(a.shares)} cotas a {formatBRL(a.averagePrice)}
                </option>
              ))}
              <option value={MANUAL}>Outra posição (digitar)</option>
            </Select>
          </Field>
        </div>
        {!asset && (
          <>
            <Field label="Cotas atuais">
              <Input inputMode="numeric" value={manualShares} onChange={(e) => setManualShares(e.target.value)} placeholder="0" />
            </Field>
            <Field label="Preço médio atual">
              <Input inputMode="decimal" value={manualPrice} onChange={(e) => setManualPrice(e.target.value)} placeholder="R$ 0,00" />
            </Field>
          </>
        )}
        <Field label="Cotas compradas">
          <Input inputMode="numeric" value={newShares} onChange={(e) => setNewShares(e.target.value)} placeholder="0" />
        </Field>
        <Field label="Preço por cota">
          <Input inputMode="decimal" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="R$ 0,00" />
        </Field>
      </div>

      <div className="flex flex-col gap-[18px] rounded-2xl border border-line bg-bg p-5 tabular-nums md:p-6">
        {!result ? (
          <p className="py-6 text-center text-sm text-muted">
            {asset ? "Preencha a compra para ver o novo preço médio." : "Preencha sua posição atual e a compra para ver o novo preço médio."}
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-muted">Hoje</span>
                <span className="text-2xl font-medium text-muted line-through decoration-track">{formatBRL(currentPrice)}</span>
              </div>
              <span className="mb-1.5 text-faint" aria-hidden="true">→</span>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-muted">Depois da compra</span>
                <span className="text-[38px] leading-none font-semibold tracking-[-0.04em] md:text-[40px]">
                  {formatBRL(result.newAveragePrice)}
                </span>
              </div>
              <span
                className={cn(
                  "inline-flex h-8 items-center self-center rounded-full px-3 text-[13px] font-medium md:ml-auto",
                  lowered ? "bg-up/12 text-up" : "bg-brick/12 text-brick-strong",
                )}
              >
                {lowered ? "▼ cai" : "▲ sobe"} {formatBRL(Math.abs(result.variation))} · {formatChange(result.variationPct)}
              </span>
            </div>
            <dl className="grid grid-cols-3 gap-3 border-t border-hairline pt-4">
              <div className="flex flex-col gap-1">
                <dt className="text-xs text-muted">Total de cotas</dt>
                <dd className="text-base font-semibold">{formatNumber(result.totalShares)}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs text-muted">Aporte</dt>
                <dd className="text-base font-semibold">{formatBRL(result.contribution)}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-xs text-muted">Total investido</dt>
                <dd className="text-base font-semibold">{formatBRL(result.newTotalInvested)}</dd>
              </div>
            </dl>
            {asset && Number.isInteger(qty) && (
              <Button variant="outline" onClick={() => onRecord(asset, qty, price)}>
                Aplicar esta compra ao fundo
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
