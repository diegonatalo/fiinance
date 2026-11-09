import { useState } from "react";
import { Card, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Input, Select } from "./ui/input";
import { cn } from "@/lib/cn";
import { formatBRL, formatNumber, formatSignedPct } from "@/lib/format";
import { simulateAveragePrice } from "@/lib/average-price";
import { parseDecimal, parseDecimalOuZero } from "@/lib/numbers";
import type { Fii } from "@/types/fii";
import {
  ArrowRightIcon,
  CalculatorIcon,
  PlusMinusIcon,
  TrendDownIcon,
  TrendUpIcon,
} from "@phosphor-icons/react";

type AveragePriceCalcProps = {
  assets: Fii[];
  /** abre o registro de compra com os valores da simulação */
  onRecord: (asset: Fii, shares: number, price: number) => void;
};

export const AveragePriceCalc = ({ assets, onRecord }: AveragePriceCalcProps) => {
  const [assetId, setAssetId] = useState<string>("");
  const [manualCurrentShares, setManualCurrentShares] = useState("");
  const [manualCurrentPrice, setManualCurrentPrice] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const selectedAsset = assets.find((a) => a.id === assetId) ?? null;

  const currentShares = selectedAsset
    ? selectedAsset.shares
    : parseDecimalOuZero(manualCurrentShares);
  const currentPrice = selectedAsset
    ? selectedAsset.averagePrice
    : parseDecimalOuZero(manualCurrentPrice);

  const newQty = parseDecimal(newShares);
  const newP = parseDecimal(newPrice);
  const result = simulateAveragePrice(currentShares, currentPrice, newQty, newP);

  function handleAsset(id: string) {
    setAssetId(id);
    if (id) {
      setManualCurrentShares("");
      setManualCurrentPrice("");
    }
  }

  // baixou o preço médio = bom (verde), subiu = laranja
  const downloaded = result ? result.variation <= 0 : false;
  const canRecord =
    !!selectedAsset && !!result && Number.isInteger(newQty);

  return (
    <Card>
      <div className="mb-1 flex items-center gap-2">
        <CalculatorIcon size={16} className="text-emerald-500" />
        <CardTitle className="text-zinc-900 dark:text-zinc-100">
          Calculadora de Preço Médio
        </CardTitle>
      </div>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        Simule um novo aporte e veja qual seria o seu novo preço médio. Nada é
        salvo até você registrar a compra.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid content-start gap-4">
          <Field label="Usar ativo da carteira (opcional)">
            <Select
              value={assetId}
              onChange={(e) => handleAsset(e.target.value)}
            >
              <option value="">Informar posição manualmente</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.ticker} — {formatNumber(a.shares)} cotas a{" "}
                  {formatBRL(a.averagePrice)}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cotas atuais">
              <Input
                inputMode="numeric"
                disabled={!!selectedAsset}
                value={
                  selectedAsset ? selectedAsset.shares : manualCurrentShares
                }
                onChange={(e) => setManualCurrentShares(e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Preço médio atual (R$)">
              <Input
                inputMode="decimal"
                disabled={!!selectedAsset}
                value={
                  selectedAsset
                    ? String(selectedAsset.averagePrice.toFixed(2)).replace(".", ",")
                    : manualCurrentPrice
                }
                onChange={(e) => setManualCurrentPrice(e.target.value)}
                placeholder="0,00"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Novas cotas compradas">
              <Input
                inputMode="numeric"
                value={newShares}
                onChange={(e) => setNewShares(e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Preço pago por cota (R$)">
              <Input
                inputMode="decimal"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0,00"
              />
            </Field>
          </div>
        </div>

        {/* Resultado */}
        <div className="flex min-h-40 flex-col justify-center rounded-lg border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/50">
          {!result ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <CalculatorIcon
                size={22}
                className="text-zinc-300 dark:text-zinc-600"
              />
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Preencha sua posição atual e o novo aporte para ver o novo preço
                médio.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Preço médio atual
                  </p>
                  <p className="text-xl font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
                    {formatBRL(currentPrice)}
                  </p>
                </div>
                <ArrowRightIcon
                  size={18}
                  className="shrink-0 text-zinc-400 dark:text-zinc-600"
                />
                <div className="text-right">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Novo preço médio
                  </p>
                  <p className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatBRL(result.newAveragePrice)}
                  </p>
                </div>
              </div>

              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                  downloaded
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-orange-500/10 text-orange-600 dark:text-orange-400",
                )}
              >
                {downloaded ? (
                  <TrendDownIcon size={16} />
                ) : (
                  <TrendUpIcon size={16} />
                )}
                Preço médio {downloaded ? "cai" : "sobe"}{" "}
                {formatBRL(Math.abs(result.variation))} (
                {formatSignedPct(result.variationPct)})
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800/60">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Total de cotas
                  </p>
                  <p className="font-semibold tabular-nums">
                    {formatNumber(result.totalShares)}
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800/60">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Aporte
                  </p>
                  <p className="font-semibold tabular-nums">
                    {formatBRL(result.contribution)}
                  </p>
                </div>
                <div className="col-span-2 rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800/60">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Novo total investido
                  </p>
                  <p className="font-semibold tabular-nums">
                    {formatBRL(result.newTotalInvested)}
                  </p>
                </div>
              </div>

              {canRecord && (
                <Button
                  variant="outline"
                  onClick={() => onRecord(selectedAsset, newQty, newP)}
                >
                  <PlusMinusIcon size={16} /> Registrar esta compra
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
