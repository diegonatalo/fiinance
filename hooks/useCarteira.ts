import { useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { DADOS_VAZIOS, sanitizarDados, sanitizarOuVazio } from "../lib/dados";
import { CHAVE_DADOS } from "../lib/migracao";
import { uid } from "../lib/id";
import { calcularPosicoes } from "../lib/posicao";
import { calcularResumo } from "../lib/resumo";
import type {
  Ativo,
  Dados,
  Provento,
  Transacao,
  TipoOperacao,
} from "../models/fii";

export type NovoAtivo = Omit<Ativo, "id">;

export interface NovaOperacao {
  tipo: TipoOperacao;
  data: string;
  cotas: number;
  preco: number;
}

export interface NovoProvento {
  ativoId: string;
  data: string;
  valorPorCota: number;
  cotas: number;
}

/** Tudo o que pertence a um ativo, para permitir "desfazer" a exclusão. */
export interface SnapshotAtivo {
  ativo: Ativo;
  transacoes: Transacao[];
  proventos: Provento[];
  cotacao: Dados["cotacoes"][string] | undefined;
}

export function useCarteira() {
  const [dados, setDados] = useLocalStorage<Dados>(
    CHAVE_DADOS,
    DADOS_VAZIOS,
    sanitizarOuVazio,
  );

  const ativos = useMemo(
    () => calcularPosicoes(dados.ativos, dados.transacoes),
    [dados.ativos, dados.transacoes],
  );
  const resumo = useMemo(
    () => calcularResumo(ativos, dados.cotacoes),
    [ativos, dados.cotacoes],
  );

  function tickerEmUso(ticker: string, ignorarId?: string) {
    const t = ticker.trim().toUpperCase();
    return dados.ativos.find((a) => a.ticker === t && a.id !== ignorarId);
  }

  /** Cria o ativo com a primeira compra; se o ticker já existe, soma à posição. */
  function adicionarAtivo(novo: NovoAtivo, compra: Omit<NovaOperacao, "tipo">) {
    const existente = tickerEmUso(novo.ticker);
    const ativoId = existente?.id ?? uid();
    const transacao: Transacao = {
      id: uid(),
      ativoId,
      tipo: "compra",
      ...compra,
    };
    setDados((prev) => ({
      ...prev,
      ativos: existente ? prev.ativos : [...prev.ativos, { id: ativoId, ...novo }],
      transacoes: [...prev.transacoes, transacao],
    }));
    return { existente: !!existente };
  }

  function atualizarAtivo(id: string, patch: NovoAtivo) {
    setDados((prev) => ({
      ...prev,
      ativos: prev.ativos.map((a) => (a.id === id ? { ...patch, id } : a)),
    }));
  }

  function removerAtivo(id: string): SnapshotAtivo | null {
    const ativo = dados.ativos.find((a) => a.id === id);
    if (!ativo) return null;
    const snapshot: SnapshotAtivo = {
      ativo,
      transacoes: dados.transacoes.filter((t) => t.ativoId === id),
      proventos: dados.proventos.filter((p) => p.ativoId === id),
      cotacao: dados.cotacoes[id],
    };
    setDados((prev) => {
      const cotacoes = { ...prev.cotacoes };
      delete cotacoes[id];
      return {
        ...prev,
        ativos: prev.ativos.filter((a) => a.id !== id),
        transacoes: prev.transacoes.filter((t) => t.ativoId !== id),
        proventos: prev.proventos.filter((p) => p.ativoId !== id),
        cotacoes,
      };
    });
    return snapshot;
  }

  function restaurarAtivo({ ativo, transacoes, proventos, cotacao }: SnapshotAtivo) {
    setDados((prev) => ({
      ...prev,
      ativos: [...prev.ativos, ativo],
      transacoes: [...prev.transacoes, ...transacoes],
      proventos: [...prev.proventos, ...proventos],
      cotacoes: cotacao ? { ...prev.cotacoes, [ativo.id]: cotacao } : prev.cotacoes,
    }));
  }

  function registrarOperacao(ativoId: string, op: NovaOperacao) {
    setDados((prev) => ({
      ...prev,
      transacoes: [...prev.transacoes, { id: uid(), ativoId, ...op }],
    }));
  }

  function removerTransacao(id: string) {
    setDados((prev) => ({
      ...prev,
      transacoes: prev.transacoes.filter((t) => t.id !== id),
    }));
  }

  function adicionarProvento(p: NovoProvento) {
    setDados((prev) => ({
      ...prev,
      proventos: [...prev.proventos, { id: uid(), ...p }],
    }));
  }

  function removerProvento(id: string) {
    setDados((prev) => ({
      ...prev,
      proventos: prev.proventos.filter((p) => p.id !== id),
    }));
  }

  function definirCotacoes(precos: Record<string, number>) {
    const atualizadoEm = new Date().toISOString();
    setDados((prev) => {
      const cotacoes = { ...prev.cotacoes };
      for (const [id, preco] of Object.entries(precos)) {
        if (preco > 0) cotacoes[id] = { preco, atualizadoEm };
        else delete cotacoes[id];
      }
      return { ...prev, cotacoes };
    });
  }

  function definirMetaPapel(meta: number | null) {
    setDados((prev) => ({ ...prev, metaPapel: meta }));
  }

  /** Substitui todos os dados por um backup. Retorna false se o conteúdo for inválido. */
  function importar(conteudo: string): boolean {
    try {
      const novo = sanitizarDados(JSON.parse(conteudo));
      if (!novo) return false;
      setDados(novo);
      return true;
    } catch {
      return false;
    }
  }

  return {
    dados,
    ativos,
    resumo,
    tickerEmUso,
    adicionarAtivo,
    atualizarAtivo,
    removerAtivo,
    restaurarAtivo,
    registrarOperacao,
    removerTransacao,
    adicionarProvento,
    removerProvento,
    definirCotacoes,
    definirMetaPapel,
    importar,
  };
}

export type Carteira = ReturnType<typeof useCarteira>;
