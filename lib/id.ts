export function uid(): string {
  // randomUUID só existe em contexto seguro (https/localhost); `vite --host` via IP não é.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
