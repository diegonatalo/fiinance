import { useSyncExternalStore } from "react";

let now = 0;

const subscribe = (onChange: () => void) => {
  now = Date.now();
  onChange();
  const id = window.setInterval(() => {
    now = Date.now();
    onChange();
  }, 30_000);
  return () => window.clearInterval(id);
};

const getSnapshot = () => (now === 0 ? (now = Date.now()) : now);

/**
 * Hora atual em ms, atualizada a cada 30 s. Null no servidor e na hidratação
 * (sem `Date` no render do servidor).
 */
export const useNow = (): number | null => useSyncExternalStore(subscribe, getSnapshot, () => null);
