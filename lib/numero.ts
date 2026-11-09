/**
 * Converte texto digitado para número, aceitando o formato brasileiro.
 * "1.234,56" -> 1234.56 · "12,5" -> 12.5 · "12.5" -> 12.5
 * Retorna NaN quando o texto é vazio ou inválido.
 */
export function parseDecimal(texto: string): number {
  const limpo = texto.trim().replace(/\s/g, "");
  if (!limpo) return NaN;
  const normalizado = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo;
  if (!/^-?\d*\.?\d+$/.test(normalizado)) return NaN;
  return Number(normalizado);
}

/** Como `parseDecimal`, mas devolve 0 quando inválido (útil para campos opcionais). */
export function parseDecimalOuZero(texto: string): number {
  const n = parseDecimal(texto);
  return Number.isFinite(n) ? n : 0;
}
