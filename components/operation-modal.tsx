import { useState } from "react";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { usePortfolioContext } from "@/lib/portfolio-context";
import { useToast } from "@/lib/toast-context";
import { cn, formatBRL, formatNumber } from "@/lib/format";
import { isValidDate, today } from "@/lib/date";
import { parseDecimal } from "@/lib/numbers";
import { sharesOn } from "@/lib/position";
import type { Fii, OperationType } from "@/types/fii";

export interface InitialOperation {
  type?: OperationType;
  shares?: number;
  price?: number;
}

interface OperationModalProps {
  asset: Fii | null;
  initialValues?: InitialOperation;
  onClose: () => void;
}

export function OperationModal({ asset, initialValues, onClose }: OperationModalProps) {
  return (
    <Modal
      open={!!asset}
      title={asset ? `Registrar operação — ${asset.ticker}` : "Registrar operação"}
      onClose={onClose}
    >
      {asset && (
        <OperationForm
          key={asset.id}
          asset={asset}
          initialValues={initialValues}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

interface OperationFormProps {
  asset: Fii;
  initialValues?: InitialOperation;
  onClose: () => void;
}

function OperationForm({ asset, initialValues, onClose }: OperationFormProps) {
  const { data, recordOperation } = usePortfolioContext();
  const notify = useToast();
  const [type, setType] = useState<OperationType>(initialValues?.type ?? "compra");
  const [date, setDate] = useState(today);
  const [shares, setShares] = useState(
    initialValues?.shares ? String(initialValues.shares) : "",
  );
  const [price, setPrice] = useState(
    initialValues?.price ? String(initialValues.price).replace(".", ",") : "",
  );
  const [errorMap, setErrorMap] = useState<{
    date?: string;
    shares?: string;
    price?: string;
  }>({});

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e: typeof errorMap = {};
    const qty = parseDecimal(shares);
    const amount = parseDecimal(price);

    if (!isValidDate(date)) e.date = "Data inválida";
    else if (date > today()) e.date = "Data no futuro";
    if (!Number.isInteger(qty) || qty <= 0)
      e.shares = "Use um número inteiro maior que 0";
    else if (
      type === "venda" &&
      isValidDate(date) &&
      qty > sharesOn(asset.id, date, data.transactions)
    ) {
      e.shares = "Mais cotas do que você tinha nessa data";
    }
    if (!Number.isFinite(amount) || amount <= 0) e.price = "Deve ser maior que 0";

    setErrorMap(e);
    if (Object.keys(e).length > 0) return;

    recordOperation(asset.id, { type, date, shares: qty, price: amount });
    notify(
      `${type === "compra" ? "Compra" : "Venda"} de ${formatNumber(qty)} cotas de ${asset.ticker} registrada`,
    );
    onClose();
  }

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Posição atual: {formatNumber(asset.shares)} cotas
        {asset.shares > 0 && <> a {formatBRL(asset.averagePrice)} (preço médio)</>}.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {(["compra", "venda"] as OperationType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            aria-pressed={type === t}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors",
              type === t
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <Field label="Data" error={errorMap.date}>
        <Input
          type="date"
          value={date}
          max={today()}
          onChange={(e) => setDate(e.target.value)}
          error={!!errorMap.date}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Qtd. de cotas" error={errorMap.shares}>
          <Input
            inputMode="numeric"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="10"
            error={!!errorMap.shares}
          />
        </Field>
        <Field label="Preço por cota (R$)" error={errorMap.price}>
          <Input
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="150,00"
            error={!!errorMap.price}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Registrar</Button>
      </div>
    </form>
  );
}
