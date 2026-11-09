import { today } from "./date";
import { uid } from "./id";
import { sanitizeData } from "./data";

export const DATA_KEY = "fiinance:dados";
export const THEME_KEY = "fiinance:theme";
const LEGACY_KEY = "fiinance:carteira";
const LEGACY_THEME_KEY = "fii:theme";

/**
 * Converte a carteira antiga (lista de posições com cotas/preço médio) para o
 * modelo novo, gerando uma compra inicial por ativo. Roda uma única vez, antes
 * do primeiro render. O dado antigo é mantido no storage, sem alterações.
 */
export function migrateLegacy() {
  try {
    if (localStorage.getItem(DATA_KEY) === null) {
      const legacy = localStorage.getItem(LEGACY_KEY);
      const list: unknown = legacy ? JSON.parse(legacy) : null;
      if (Array.isArray(list)) {
        const assets: unknown[] = [];
        const transactions: unknown[] = [];
        for (const item of list) {
          if (typeof item !== "object" || item === null) continue;
          const o = item as Record<string, unknown>;
          const id = typeof o.id === "string" ? o.id : uid();
          assets.push({
            id,
            ticker: o.ticker,
            type: o.tipo,
            segment: o.segmento,
          });
          transactions.push({
            id: uid(),
            assetId: id,
            type: "compra",
            date: today(),
            shares: o.cotas,
            price: o.precoMedio,
          });
        }
        const data = sanitizeData({ assets, transactions });
        if (data) localStorage.setItem(DATA_KEY, JSON.stringify(data));
      }
    }

    if (localStorage.getItem(THEME_KEY) === null) {
      const theme = localStorage.getItem(LEGACY_THEME_KEY);
      if (theme) localStorage.setItem(THEME_KEY, theme);
    }
  } catch {
    // storage indisponível ou JSON corrompido: o app abre vazio
  }
}
