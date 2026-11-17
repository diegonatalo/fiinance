import { useSyncExternalStore } from "react";

const pad = (value: number) => String(value).padStart(2, "0");

const todayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const subscribe = (onChange: () => void) => {
  // O dia pode virar com o app aberto.
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
};

/**
 * Data local de hoje no formato "AAAA-MM-DD". Vazia no servidor e na
 * hidratação: a data só é calculada no navegador (sem `new Date()` no render).
 */
export const useToday = (): string =>
  useSyncExternalStore(subscribe, todayKey, () => "");
