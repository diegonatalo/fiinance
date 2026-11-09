export interface ResultadoMagicNumber {
  magicNumber: number;
  faltam: number;
  progresso: number;
  atingiu: boolean;
  aporteFaltante: number;
}

/** Magic number = cotação ÷ dividendo por cota, arredondado para cima. */
export function calcularMagicNumber(
  dividendo: number,
  cotacao: number,
  cotasAtuais: number,
): ResultadoMagicNumber | null {
  if (
    !Number.isFinite(dividendo) ||
    dividendo <= 0 ||
    !Number.isFinite(cotacao) ||
    cotacao <= 0
  ) {
    return null;
  }
  const magicNumber = Math.ceil(cotacao / dividendo);
  const faltam = Math.max(0, magicNumber - cotasAtuais);
  return {
    magicNumber,
    faltam,
    progresso: Math.min(100, (cotasAtuais / magicNumber) * 100),
    atingiu: cotasAtuais >= magicNumber,
    aporteFaltante: faltam * cotacao,
  };
}
