import { useState } from "react";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Input, Select } from "./ui/input";
import { usePortfolioContext } from "@/lib/portfolio-context";
import { useToast } from "@/lib/toast-context";
import { isValidDate, today } from "@/lib/date";
import { useToday } from "@/hooks/use-today";
import { formatBRL, formatNumber } from "@/lib/format";
import { parseDecimal } from "@/lib/numbers";
import { sharesOn } from "@/lib/position";
import { PlusIcon } from "@phosphor-icons/react";

export const PayoutForm = () => {
  const { assets, data, addPayout } = usePortfolioContext();
  const notify = useToast();
  const [assetId, setAssetId] = useState("");
  const todayValue = useToday();
  const [typedDate, setDate] = useState<string | null>(null);
  const date = typedDate ?? todayValue;
  const [amount, setAmount] = useState("");
  const [errorMap, setErrorMap] = useState<{
    asset?: string;
    date?: string;
    amount?: string;
  }>({});

  const asset = assets.find((a) => a.id === assetId);
  const shares = asset && isValidDate(date) ? sharesOn(asset.id, date, data.transactions) : 0;
  const numericValue = parseDecimal(amount);

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: typeof errorMap = {};
    if (!asset) e.asset = "Escolha o ativo";
    if (!isValidDate(date)) e.date = "Data inválida";
    else if (date > today()) e.date = "Data no futuro";
    else if (asset && shares <= 0) e.date = "Você não tinha cotas nessa data";
    if (!Number.isFinite(numericValue) || numericValue <= 0)
      e.amount = "Deve ser maior que 0";
    setErrorMap(e);
    if (Object.keys(e).length > 0 || !asset) return;

    addPayout({ assetId: asset.id, date, valuePerShare: numericValue, shares });
    notify(`Provento de ${asset.ticker} registrado`);
    setAmount("");
  }

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Ativo" error={errorMap.asset}>
          <Select
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            error={!!errorMap.asset}
          >
            <option value="">Selecione…</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.ticker}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Data de pagamento" error={errorMap.date}>
          <Input
            type="date"
            value={date}
            max={todayValue}
            onChange={(e) => setDate(e.target.value)}
            error={!!errorMap.date}
          />
        </Field>
        <Field
          label="Valor por cota (R$)"
          error={errorMap.amount}
          hint={
            asset && shares > 0 && Number.isFinite(numericValue) && numericValue > 0
              ? `${formatNumber(shares)} cotas → ${formatBRL(shares * numericValue)}`
              : undefined
          }
        >
          <Input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,90"
            error={!!errorMap.amount}
          />
        </Field>
      </div>
      <div className="flex justify-end">
        <Button type="submit">
          <PlusIcon size={16} /> Registrar provento
        </Button>
      </div>
    </form>
  );
};
