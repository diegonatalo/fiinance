/** Data local de hoje no formato yyyy-mm-dd. */
export function hoje(): string {
  return new Date().toLocaleDateString("sv-SE");
}

export function formatData(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function mesDe(iso: string): string {
  return iso.slice(0, 7);
}

const MESES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

/** "2026-03" -> "mar/26" */
export function formatMes(mes: string): string {
  const [ano, m] = mes.split("-");
  return `${MESES[Number(m) - 1]}/${ano.slice(2)}`;
}

export function dataValida(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = new Date(`${iso}T00:00:00`);
  return !Number.isNaN(d.getTime()) && d.toLocaleDateString("sv-SE") === iso;
}
