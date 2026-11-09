import { createContext, useContext } from "react";

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type NotifyFn = {
  (message: string, action?: ToastAction): void;
};

export const ToastContext = createContext<NotifyFn | null>(null);

export function useToast(): NotifyFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return ctx;
}
