import { useState } from "react";
import { Card, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { useCarteiraContext } from "../contexts/carteira-context";
import { useToast } from "../contexts/toast-context";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { buscarCotacao } from "../lib/cotacoes";
import { formatBRL } from "../lib/format";
import { parseDecimal } from "../lib/numero";
import { ArrowsClockwiseIcon, ChartLineUpIcon } from "@phosphor-icons/react";

const CHAVE_TOKEN = "fiinance:brapi-token";

function sanitizarToken(raw: unknown): string {
  return typeof raw === "string" ? raw : "";
}

export function CotacoesCard() {
  const { ativos, dados, definirCotacoes } = useCarteiraContext();
  const notify = useToast();
  const [token, setToken] = useLocalStorage(CHAVE_TOKEN, "", sanitizarToken);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [manuais, setManuais] = useState<Record<string, string>>({});

  const comCotas = ativos.filter((a) => a.cotas > 0);

  async function atualizar() {
    setCarregando(true);
    setErro(null);
    const resultados = await Promise.allSettled(
      comCotas.map(async (a) => [a.id, await buscarCotacao(a.ticker, token.trim())] as const),
    );
    const precos: Record<string, number> = {};
    const falhas: string[] = [];
    for (const r of resultados) {
      if (r.status === "fulfilled") precos[r.value[0]] = r.value[1];
      else falhas.push(r.reason instanceof Error ? r.reason.message : "Erro de rede");
    }
    if (Object.keys(precos).length > 0) definirCotacoes(precos);
    if (falhas.length > 0) {
      setErro(`${falhas.length} de ${comCotas.length} falharam: ${[...new Set(falhas)].join("; ")}`);
    } else {
      notify("Cotações atualizadas");
    }
    setCarregando(false);
  }

  function salvarManual(id: string) {
    const texto = manuais[id];
    if (texto === undefined) return;
    const valor = parseDecimal(texto);
    if (texto.trim() === "") definirCotacoes({ [id]: 0 });
    else if (Number.isFinite(valor) && valor > 0) definirCotacoes({ [id]: valor });
    setManuais((m) => Object.fromEntries(Object.entries(m).filter(([k]) => k !== id)));
  }

  return (
    <Card>
      <div className="mb-1 flex items-center gap-2">
        <ChartLineUpIcon size={16} className="text-emerald-500" />
        <CardTitle className="text-zinc-900 dark:text-zinc-100">
          Cotações
        </CardTitle>
      </div>
      <p className="mb-4 text-xs text-zinc-500 dark:text-zinc-400">
        Informe a cotação manualmente ou busque na{" "}
        <a
          href="https://brapi.dev"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          brapi
        </a>{" "}
        (exige token gratuito para FIIs). O token fica só neste navegador.
      </p>

      {comCotas.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Adicione ativos para acompanhar as cotações.
        </p>
      ) : (
        <div className="grid gap-4">
          <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
            <Field label="Token da brapi (opcional)">
              <Input
                type="password"
                autoComplete="off"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="seu token"
              />
            </Field>
            <Button onClick={atualizar} disabled={carregando}>
              <ArrowsClockwiseIcon
                size={16}
                className={carregando ? "animate-spin" : undefined}
              />
              {carregando ? "Buscando…" : "Atualizar cotações"}
            </Button>
          </div>
          {erro && <p className="text-xs text-red-500">{erro}</p>}

          <ul className="grid gap-2 sm:grid-cols-2">
            {comCotas.map((a) => {
              const cot = dados.cotacoes[a.id];
              return (
                <li key={a.id} className="grid grid-cols-[5rem_1fr] items-center gap-2">
                  <span className="text-sm font-semibold">{a.ticker}</span>
                  <Input
                    inputMode="decimal"
                    aria-label={`Cotação de ${a.ticker}`}
                    placeholder={cot ? formatBRL(cot.preco) : "R$ 0,00"}
                    value={manuais[a.id] ?? (cot ? String(cot.preco).replace(".", ",") : "")}
                    onChange={(e) =>
                      setManuais((m) => ({ ...m, [a.id]: e.target.value }))
                    }
                    onBlur={() => salvarManual(a.id)}
                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}
