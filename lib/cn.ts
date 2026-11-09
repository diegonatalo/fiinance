/** Junta nomes de classe, ignorando valores vazios (false, null, undefined e ""). */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
