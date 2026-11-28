import { useId, useState } from "react";
import { FloppyDiskIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import type { NewAsset } from "@/hooks/use-portfolio";
import { cn } from "@/lib/cn";
import { parseDecimal } from "@/lib/numbers";
import { LIMITS, TICKER_REGEX, toCents, toHundredthCents } from "@/lib/validation";
import {
  BRICK_SEGMENTS,
  DEFAULT_RATING,
  MAX_RATING,
  MIN_RATING,
  RISK_PROFILES,
  type Asset,
  type BrickSegment,
  type FiiType,
  type RiskProfile,
} from "@/types/fii";

type FiiFormProps = {
  onSubmit: (asset: NewAsset) => void;
  /** quando informado, o formulário edita esse fundo */
  initial?: Asset | null;
  onCancel?: () => void;
  /** devolve o fundo que já usa o ticker, se houver */
  tickerInUse: (ticker: string, ignoreId?: string) => Asset | undefined;
};

type FormErrors = Partial<Record<"ticker" | "risk" | "shares" | "averagePrice" | "lastDividend", string>>;

const RATINGS = Array.from({ length: MAX_RATING - MIN_RATING + 1 }, (_, i) => MIN_RATING + i);

/** Número do app para o campo de texto, no formato brasileiro. */
const toField = (n: number | undefined) => (n === undefined ? "" : String(n).replace(".", ","));

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export const FiiForm = ({ onSubmit, initial, onCancel, tickerInUse }: FiiFormProps) => {
  const [ticker, setTicker] = useState(initial?.ticker ?? "");
  const [type, setType] = useState<FiiType>(initial?.type ?? "tijolo");
  const [segment, setSegment] = useState<BrickSegment>(initial?.segment ?? BRICK_SEGMENTS[0]);
  // fundo de papel de antes do perfil de risco: começa sem escolha
  const [risk, setRisk] = useState<RiskProfile | "">(initial ? (initial.risk ?? "") : RISK_PROFILES[0]);
  const [shares, setShares] = useState(toField(initial?.shares));
  const [price, setPrice] = useState(initial && initial.averagePrice > 0 ? toField(initial.averagePrice) : "");
  const [dividend, setDividend] = useState(initial && initial.lastDividend > 0 ? toField(initial.lastDividend) : "");
  const [rating, setRating] = useState(initial?.rating ?? DEFAULT_RATING);
  const [errors, setErrors] = useState<FormErrors>({});
  const typeLabel = useId();

  const normalizedTicker = ticker.trim().toUpperCase();

  function handleType(fresh: FiiType) {
    setType(fresh);
    if (fresh === "papel" && risk === "") setRisk(RISK_PROFILES[0]);
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!normalizedTicker) e.ticker = "Informe o ticker";
    else if (!TICKER_REGEX.test(normalizedTicker)) e.ticker = "Formato inválido (ex.: HGLG11)";
    else if (tickerInUse(normalizedTicker, initial?.id)) e.ticker = "Ticker já cadastrado";

    if (type === "papel" && risk === "") e.risk = "Escolha o perfil de risco";

    const qty = parseDecimal(shares);
    if (!shares.trim()) e.shares = "Informe a quantidade";
    else if (!Number.isInteger(qty) || qty < 0) e.shares = "Use um número inteiro";
    else if (qty > LIMITS.shares) e.shares = "Quantidade grande demais";

    const amount = price.trim() ? parseDecimal(price) : 0;
    if (!Number.isFinite(amount) || amount < 0) e.averagePrice = "Valor inválido";
    else if (toCents(amount, LIMITS.priceCents) === null) e.averagePrice = "Use no máximo 2 casas decimais";
    else if (amount === 0 && qty > 0) e.averagePrice = "Informe o preço médio";

    const paid = dividend.trim() ? parseDecimal(dividend) : 0;
    if (!Number.isFinite(paid) || paid < 0) e.lastDividend = "Valor inválido";
    else if (toHundredthCents(paid, LIMITS.dividendHundredthCents) === null)
      e.lastDividend = "Use no máximo 4 casas decimais";
    return e;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    onSubmit({
      ticker: normalizedTicker,
      type,
      segment: type === "tijolo" ? segment : null,
      risk: type === "papel" ? (risk as RiskProfile) : null,
      shares: parseDecimal(shares),
      averagePrice: price.trim() ? parseDecimal(price) : 0,
      lastDividend: dividend.trim() ? parseDecimal(dividend) : 0,
      rating,
    });

    if (!initial) {
      setTicker("");
      setShares("");
      setPrice("");
      setDividend("");
      setRating(DEFAULT_RATING);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ticker" error={errors.ticker}>
          <Input
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="HGLG11"
            maxLength={7}
            autoCapitalize="characters"
            error={!!errors.ticker}
          />
        </Field>

        <div role="group" aria-labelledby={typeLabel} className="grid gap-2">
          <span id={typeLabel} className="text-[13px] text-muted">
            Tipo
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(["tijolo", "papel"] as FiiType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleType(t)}
                aria-pressed={type === t}
                className={cn(
                  "h-12 rounded-xl border text-[15px] font-medium capitalize transition-colors",
                  type === t
                    ? t === "papel"
                      ? "border-paper bg-paper/10 text-paper-strong"
                      : "border-brick bg-brick/10 text-brick-strong"
                    : "border-line text-muted hover:bg-raised hover:text-fg",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {type === "tijolo" ? (
          <Field label="Segmento">
            <Select value={segment} onChange={(e) => setSegment(e.target.value as BrickSegment)}>
              {BRICK_SEGMENTS.map((s) => (
                <option key={s} value={s}>
                  {capitalize(s)}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          <Field label="Perfil de risco" error={errors.risk}>
            <Select value={risk} onChange={(e) => setRisk(e.target.value as RiskProfile)} error={!!errors.risk}>
              {risk === "" && (
                <option value="" disabled>
                  Escolha
                </option>
              )}
              {RISK_PROFILES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Field label="Nota (1 a 10)" hint="Quanto maior, maior a meta do fundo na carteira.">
          <Select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {RATINGS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Cotas" error={errors.shares}>
          <Input
            inputMode="numeric"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="100"
            error={!!errors.shares}
          />
        </Field>

        <Field label="Preço médio (R$)" error={errors.averagePrice}>
          <Input
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="150,00"
            error={!!errors.averagePrice}
          />
        </Field>

        <Field label="Último rendimento (R$ por cota)" error={errors.lastDividend}>
          <Input
            inputMode="decimal"
            value={dividend}
            onChange={(e) => setDividend(e.target.value)}
            placeholder="1,10"
            error={!!errors.lastDividend}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit">
          {initial ? (
            <>
              <FloppyDiskIcon size={16} aria-hidden="true" /> Salvar alterações
            </>
          ) : (
            <>
              <PlusIcon size={16} weight="bold" aria-hidden="true" /> Adicionar fundo
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
