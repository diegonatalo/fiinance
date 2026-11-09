/**
 * Converte texto digitado para número, aceitando o formato brasileiro.
 * "1.234,56" -> 1234.56 · "12,5" -> 12.5 · "12.5" -> 12.5
 * Retorna NaN quando o texto é vazio ou inválido.
 */
export function parseDecimal(text: string): number {
  const clean = text.trim().replace(/\s/g, "");
  if (!clean) return NaN;
  const normalized = clean.includes(",")
    ? clean.replace(/\./g, "").replace(",", ".")
    : clean;
  if (!/^-?\d*\.?\d+$/.test(normalized)) return NaN;
  return Number(normalized);
}

/** Como `parseDecimal`, mas devolve 0 quando inválido (útil para campos opcionais). */
export function parseDecimalOuZero(text: string): number {
  const n = parseDecimal(text);
  return Number.isFinite(n) ? n : 0;
}
