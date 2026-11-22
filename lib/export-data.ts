import { BACKUP_APP } from "@/lib/data";
import type { AppData } from "@/types/fii";

/** O arquivo de backup: os dados e de qual app eles são. */
export function dataToJson(data: AppData): string {
  return JSON.stringify({ app: BACKUP_APP, ...data }, null, 2);
}

export function transactionsToCsv(data: AppData): string {
  const tickers = new Map(data.assets.map((a) => [a.id, a.ticker]));
  const rows = data.transactions
    .toSorted((a, b) => a.date.localeCompare(b.date))
    .map((t) =>
      [
        t.date,
        tickers.get(t.assetId) ?? "",
        t.type,
        t.shares,
        t.price.toFixed(2),
        (t.shares * t.price).toFixed(2),
      ].join(";"),
    );
  return ["data;ticker;tipo;cotas;preco;total", ...rows].join("\n");
}
