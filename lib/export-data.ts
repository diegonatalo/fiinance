import type { AppData } from "@/types/fii";

export function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function dataToJson(data: AppData): string {
  return JSON.stringify(data, null, 2);
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
