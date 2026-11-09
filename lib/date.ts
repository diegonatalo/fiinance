/** Data local de hoje no formato yyyy-mm-dd. */
export function today(): string {
  return new Date().toLocaleDateString("sv-SE");
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

export function monthOf(iso: string): string {
  return iso.slice(0, 7);
}

const MONTHS = [
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
export function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  return `${MONTHS[Number(m) - 1]}/${year.slice(2)}`;
}

export function isValidDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = new Date(`${iso}T00:00:00`);
  return !Number.isNaN(d.getTime()) && d.toLocaleDateString("sv-SE") === iso;
}
