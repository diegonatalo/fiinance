export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPct(value: number, casas = 1): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  })}%`;
}

export function formatPctSinal(value: number, casas = 2): string {
  return `${value >= 0 ? "+" : ""}${formatPct(value, casas)}`;
}
