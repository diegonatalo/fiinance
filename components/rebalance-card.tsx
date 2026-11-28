import { useId, useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { formatBRL } from "@/lib/format";
import { parseDecimal } from "@/lib/numbers";
import { minimumContribution, splitContribution } from "@/lib/targets";
import type { Asset } from "@/types/fii";

/** Quanto aportar em cada fundo para a carteira se aproximar da meta dada pelas notas. */
export const RebalanceCard = ({ assets, className }: { assets: Asset[]; className?: string }) => {
  const [typed, setTyped] = useState("");
  const inputId = useId();
  const minimum = minimumContribution(assets);
  const amount = typed.trim() ? parseDecimal(typed) : (minimum ?? NaN);
  const split = splitContribution(assets, amount);

  return (
    <Card className={cn("flex flex-col gap-5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <CardTitle>Próximo aporte</CardTitle>
        <span className="text-[13px] text-muted">meta pela nota</span>
      </div>

      {assets.length === 0 ? (
        <p className="rounded-[14px] border border-line p-4 text-sm text-muted">
          Cadastre fundos e dê uma nota a cada um para saber onde aportar.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <label htmlFor={inputId} className="text-[13px] text-muted">
              Valor do aporte (R$)
            </label>
            <Input
              id={inputId}
              inputMode="decimal"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={minimum ? formatBRL(minimum).replace("R$", "").trim() : "1.000,00"}
            />
            <span className="text-xs text-subtle">
              {minimum === null
                ? "Digite quanto vai aportar."
                : minimum === 0
                  ? "A carteira já está na meta."
                  : `${formatBRL(minimum)} levam todos os fundos à meta só com compras.`}
            </span>
          </div>

          {split.length > 0 ? (
            <ul className="flex flex-col">
              {split.map((s) => (
                <li
                  key={s.asset.id}
                  className="flex items-center gap-3 border-t border-hairline py-2.5 text-sm tabular-nums first:border-t-0"
                >
                  <span
                    className={cn("h-6 w-1 rounded", s.asset.type === "papel" ? "bg-paper" : "bg-brick")}
                    aria-hidden="true"
                  />
                  <span className="flex-1 font-mono font-medium">{s.asset.ticker}</span>
                  <span className="font-semibold">{formatBRL(s.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            typed.trim() !== "" && <p className="text-sm text-muted">Digite um valor maior que zero.</p>
          )}
        </>
      )}
    </Card>
  );
};
