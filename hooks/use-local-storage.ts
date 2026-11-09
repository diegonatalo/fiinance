import { useCallback, useMemo, useSyncExternalStore } from "react";

const EVENT = "fiinance:storage";

// Fallback em memória para quando o localStorage está bloqueado ou cheio.
const memory = new Map<string, string>();

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key) ?? memory.get(key) ?? null;
  } catch {
    return memory.get(key) ?? null;
  }
}

function write(key: string, amount: string) {
  memory.set(key, amount);
  try {
    window.localStorage.setItem(key, amount);
  } catch {
    // storage cheio/desativado: o valor segue válido nesta sessão
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENT, callback);
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
    () => read(key),
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
      const current = read(key);
      let prev = initialValue;
      if (current !== null) {
        try {
          const parsed: unknown = JSON.parse(current);
          prev = sanitize ? sanitize(parsed) : (parsed as T);
        } catch {
          // valor corrompido: parte do inicial
        }
      }
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      write(key, JSON.stringify(resolved));
    },
    [key, initialValue, sanitize],
  );

  return [value, setValue] as const;
}
