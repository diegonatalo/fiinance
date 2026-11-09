import { useCallback, useMemo, useSyncExternalStore } from "react";

const EVENTO = "fiinance:storage";

// Fallback em memória para quando o localStorage está bloqueado ou cheio.
const memoria = new Map<string, string>();

function ler(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? memoria.get(key) ?? null;
  } catch {
    return memoria.get(key) ?? null;
  }
}

function escrever(key: string, valor: string) {
  memoria.set(key, valor);
  try {
    window.localStorage.setItem(key, valor);
  } catch {
    // storage cheio/desativado: o valor segue válido nesta sessão
  }
  window.dispatchEvent(new Event(EVENTO));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENTO, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENTO, callback);
  };
}

/**
 * Estado persistido no localStorage, sincronizado entre componentes e abas.
 * `initialValue` e `sanitize` devem ser estáveis (constantes de módulo).
 * `sanitize` valida o que foi lido e devolve um valor seguro.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  sanitize?: (raw: unknown) => T,
) {
  const raw = useSyncExternalStore(
    subscribe,
    () => ler(key),
    () => null,
  );

  const value = useMemo<T>(() => {
    if (raw === null) return initialValue;
    try {
      const parsed: unknown = JSON.parse(raw);
      return sanitize ? sanitize(parsed) : (parsed as T);
    } catch {
      return initialValue;
    }
  }, [raw, initialValue, sanitize]);

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const atual = ler(key);
      let prev = initialValue;
      if (atual !== null) {
        try {
          const parsed: unknown = JSON.parse(atual);
          prev = sanitize ? sanitize(parsed) : (parsed as T);
        } catch {
          // valor corrompido: parte do inicial
        }
      }
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      escrever(key, JSON.stringify(resolved));
    },
    [key, initialValue, sanitize],
  );

  return [value, setValue] as const;
}
