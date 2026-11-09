import { dataValida } from "./data";
import {
  SEGMENTOS_PAPEL,
  SEGMENTOS_TIJOLO,
  type Ativo,
  type Cotacao,
  type Dados,
  type Provento,
  type Transacao,
} from "../models/fii";

export const DADOS_VAZIOS: Dados = {
  versao: 1,
  ativos: [],
  transacoes: [],
  proventos: [],
  cotacoes: {},
  metaPapel: null,
};

export const TICKER_REGEX = /^[A-Z]{4}\d{2}B?$/;

type Obj = Record<string, unknown>;

function isObj(v: unknown): v is Obj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function positivo(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > 0;
}

function lista(v: unknown): Obj[] {
  return Array.isArray(v) ? v.filter(isObj) : [];
}

function sanitizarAtivo(o: Obj): Ativo | null {
  if (typeof o.id !== "string" || typeof o.ticker !== "string") return null;
  if (o.tipo !== "papel" && o.tipo !== "tijolo") return null;
  const segmentos: readonly string[] =
    o.tipo === "papel" ? SEGMENTOS_PAPEL : SEGMENTOS_TIJOLO;
  if (typeof o.segmento !== "string" || !segmentos.includes(o.segmento))
    return null;
  return {
    id: o.id,
    ticker: o.ticker.trim().toUpperCase(),
    tipo: o.tipo,
    segmento: o.segmento as Ativo["segmento"],
  };
}

function sanitizarTransacao(o: Obj): Transacao | null {
  if (typeof o.id !== "string" || typeof o.ativoId !== "string") return null;
  if (o.tipo !== "compra" && o.tipo !== "venda") return null;
  if (typeof o.data !== "string" || !dataValida(o.data)) return null;
  if (!positivo(o.cotas) || !positivo(o.preco)) return null;
  return {
    id: o.id,
    ativoId: o.ativoId,
    tipo: o.tipo,
    data: o.data,
    cotas: o.cotas,
    preco: o.preco,
  };
}

function sanitizarProvento(o: Obj): Provento | null {
  if (typeof o.id !== "string" || typeof o.ativoId !== "string") return null;
  if (typeof o.data !== "string" || !dataValida(o.data)) return null;
  if (!positivo(o.valorPorCota) || !positivo(o.cotas)) return null;
  return {
    id: o.id,
    ativoId: o.ativoId,
    data: o.data,
    valorPorCota: o.valorPorCota,
    cotas: o.cotas,
  };
}

/**
 * Valida e normaliza qualquer valor vindo do storage ou de um arquivo importado.
 * Descarta itens inválidos e registros órfãos. Retorna null se não parecer um backup.
 */
export function sanitizarDados(raw: unknown): Dados | null {
  if (!isObj(raw) || !Array.isArray(raw.ativos)) return null;

  const ativos: Ativo[] = [];
  const ids = new Set<string>();
  for (const o of lista(raw.ativos)) {
    const a = sanitizarAtivo(o);
    if (a && !ids.has(a.id)) {
      ids.add(a.id);
      ativos.push(a);
    }
  }

  const transacoes = lista(raw.transacoes)
    .map(sanitizarTransacao)
    .filter((t): t is Transacao => t !== null && ids.has(t.ativoId));
  const proventos = lista(raw.proventos)
    .map(sanitizarProvento)
    .filter((p): p is Provento => p !== null && ids.has(p.ativoId));

  const cotacoes: Record<string, Cotacao> = {};
  if (isObj(raw.cotacoes)) {
    for (const [id, c] of Object.entries(raw.cotacoes)) {
      if (ids.has(id) && isObj(c) && positivo(c.preco)) {
        cotacoes[id] = {
          preco: c.preco,
          atualizadoEm:
            typeof c.atualizadoEm === "string" ? c.atualizadoEm : "",
        };
      }
    }
  }

  const meta = raw.metaPapel;
  const metaPapel =
    typeof meta === "number" && Number.isFinite(meta) && meta >= 0 && meta <= 100
      ? meta
      : null;

  return { versao: 1, ativos, transacoes, proventos, cotacoes, metaPapel };
}

/** Versão para o `useLocalStorage`: nunca falha, cai no estado vazio. */
export function sanitizarOuVazio(raw: unknown): Dados {
  return sanitizarDados(raw) ?? DADOS_VAZIOS;
}
