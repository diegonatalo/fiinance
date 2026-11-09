import { hoje } from "./data";
import { uid } from "./id";
import { sanitizarDados } from "./dados";

export const CHAVE_DADOS = "fiinance:dados";
export const CHAVE_TEMA = "fiinance:theme";
const CHAVE_LEGADO = "fiinance:carteira";
const CHAVE_TEMA_LEGADO = "fii:theme";

/**
 * Converte a carteira antiga (lista de posições com cotas/preço médio) para o
 * modelo novo, gerando uma compra inicial por ativo. Roda uma única vez, antes
 * do primeiro render. O dado antigo é mantido no storage, sem alterações.
 */
export function migrarLegado() {
  try {
    if (localStorage.getItem(CHAVE_DADOS) === null) {
      const antigo = localStorage.getItem(CHAVE_LEGADO);
      const lista: unknown = antigo ? JSON.parse(antigo) : null;
      if (Array.isArray(lista)) {
        const ativos: unknown[] = [];
        const transacoes: unknown[] = [];
        for (const item of lista) {
          if (typeof item !== "object" || item === null) continue;
          const o = item as Record<string, unknown>;
          const id = typeof o.id === "string" ? o.id : uid();
          ativos.push({
            id,
            ticker: o.ticker,
            tipo: o.tipo,
            segmento: o.segmento,
          });
          transacoes.push({
            id: uid(),
            ativoId: id,
            tipo: "compra",
            data: hoje(),
            cotas: o.cotas,
            preco: o.precoMedio,
          });
        }
        const dados = sanitizarDados({ ativos, transacoes });
        if (dados) localStorage.setItem(CHAVE_DADOS, JSON.stringify(dados));
      }
    }

    if (localStorage.getItem(CHAVE_TEMA) === null) {
      const tema = localStorage.getItem(CHAVE_TEMA_LEGADO);
      if (tema) localStorage.setItem(CHAVE_TEMA, tema);
    }
  } catch {
    // storage indisponível ou JSON corrompido: o app abre vazio
  }
}
