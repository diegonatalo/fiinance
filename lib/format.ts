export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR");
}

export function formatPct(value: number, decimals = 1): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

export function formatSignedPct(value: number, decimals = 2): string {
  return `${value >= 0 ? "+" : ""}${formatPct(value, decimals)}`;
}

/** Variação com sinal tipográfico: "+3,09%" ou "−3,14%". */
export function formatChange(value: number, decimals = 2): string {
  return `${value >= 0 ? "+" : "−"}${formatPct(Math.abs(value), decimals)}`;
}

/** Variação com seta: "▲ +3,09%" ou "▼ −3,14%". */
export function formatDelta(value: number, decimals = 2): string {
  return `${value >= 0 ? "▲" : "▼"} ${formatChange(value, decimals)}`;
}

/** Valor com seta: "▲ R$ 514,79" ou "▼ R$ 120,31". */
export function formatDeltaBRL(value: number): string {
  return `${value >= 0 ? "▲" : "▼"} ${formatBRL(Math.abs(value))}`;
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "papel", "IPCA" -> "Papel · IPCA" · "tijolo", "logística" -> "Tijolo · Logística" */
export function formatKind(type: string, segment: string): string {
  return `${capitalize(type)} · ${capitalize(segment)}`;
}
