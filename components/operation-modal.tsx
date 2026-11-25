import { useState } from "react";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { usePortfolioContext } from "@/hooks/use-portfolio-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/cn";
import { formatBRL, formatNumber } from "@/lib/format";
import { isValidDate, today } from "@/lib/date";
import { useToday } from "@/hooks/use-today";
import { parseDecimal } from "@/lib/numbers";
import { sharesOn } from "@/lib/position";
import { LIMITS, toCents } from "@/lib/validation";
import type { Fii, OperationType } from "@/types/fii";

export type InitialOperation = {
  type?: OperationType;
  shares?: number;
  price?: number;
};

type OperationModalProps = {
  asset: Fii | null;
  initialValues?: InitialOperation;
  onClose: () => void;
};

export const OperationModal = ({ asset, initialValues, onClose }: OperationModalProps) => {
  return (
    <Modal
      open={!!asset}
      title={asset ? `Comprar ou vender ${asset.ticker}` : "Comprar ou vender"}
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
};

type OperationFormProps = {
  asset: Fii;
  initialValues?: InitialOperation;
  onClose: () => void;
};

const OperationForm = ({ asset, initialValues, onClose }: OperationFormProps) => {
  const { data, recordOperation } = usePortfolioContext();
  const notify = useToast();
  const [type, setType] = useState<OperationType>(initialValues?.type ?? "compra");
  const todayValue = useToday();
  const [typedDate, setDate] = useState<string | null>(null);
  const date = typedDate ?? todayValue;
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
    else if (qty > LIMITS.shares) e.shares = "Quantidade grande demais";
    else if (
      type === "venda" &&
      isValidDate(date) &&
      qty > sharesOn(asset.id, date, data.transactions)
    ) {
      e.shares = "Mais cotas do que você tinha nessa data";
    }
    if (!Number.isFinite(amount) || amount <= 0) e.price = "Deve ser maior que 0";
    else if (toCents(amount, LIMITS.priceCents) === null) e.price = "Use no máximo 2 casas decimais";

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
      <p className="text-sm text-muted">
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
              "h-12 rounded-xl border text-[15px] font-medium capitalize transition-colors",
              type === t ? "border-fg bg-raised text-fg" : "border-line text-muted hover:bg-raised hover:text-fg",
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
          max={todayValue}
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

      <div className="flex flex-wrap justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Registrar</Button>
      </div>
    </form>
  );
};
