import { useSyncExternalStore } from "react";
import { today } from "@/lib/date";

const subscribe = () => () => {};

/**
 * Data de hoje (yyyy-mm-dd) para usar na renderização. No servidor e na hidratação
 * vale "" (a data só existe no navegador); depois da hidratação vira a data local.
 */
export function useToday(): string {
  return useSyncExternalStore(subscribe, today, () => "");
}
