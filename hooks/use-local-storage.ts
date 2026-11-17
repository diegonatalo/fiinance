import { useCallback, useMemo, useSyncExternalStore } from "react";

// Avisa os componentes desta aba; outras abas avisam pelo evento "storage".
const changes = new EventTarget();

// Fallback em memória para quando o localStorage está bloqueado ou cheio.
// Só vale para as chaves cuja gravação falhou: nos outros casos o
// localStorage é a fonte, inclusive quando a chave some.
const memory = new Map<string, string>();
const failed = new Set<string>();

const read = (key: string): string | null => {
  if (failed.has(key)) return memory.get(key) ?? null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
};

const write = (key: string, value: string) => {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
    failed.delete(key);
  } catch {
    // Armazenamento cheio ou desativado: o valor vale nesta visita.
    failed.add(key);
  }
  changes.dispatchEvent(new Event("change"));
};

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  changes.addEventListener("change", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    changes.removeEventListener("change", onChange);
  };
};

const parse = <T>(
  raw: string | null,
  initialValue: T,
  sanitize?: (raw: unknown) => T,
): T => {
  if (raw === null) return initialValue;
  try {
    const parsed: unknown = JSON.parse(raw);
    return sanitize ? sanitize(parsed) : (parsed as T);
  } catch {
    return initialValue;
  }
};

/**
 * Estado salvo no localStorage como JSON, sincronizado entre componentes e abas.
 * No servidor e na hidratação vale `initialValue`.
 * `initialValue` e `sanitize` devem ser estáveis (constantes de módulo);
 * `sanitize` valida o que foi lido e devolve um valor seguro.
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  sanitize?: (raw: unknown) => T,
) => {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  );

  const value = useMemo(
    () => parse(raw, initialValue, sanitize),
    [raw, initialValue, sanitize],
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = parse(read(key), initialValue, sanitize);
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
      write(key, JSON.stringify(resolved));
    },
    [key, initialValue, sanitize],
  );

  return [value, setValue] as const;
};
