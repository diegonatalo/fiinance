import { CheckCircleIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import type { ToastAction } from "../contexts/toast-context";

interface ToastProps {
  message: string | null;
  action?: ToastAction;
  onDone: () => void;
}

export function Toast({ message, action, onDone }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, action ? 6000 : 2400);
    return () => clearTimeout(t);
  }, [message, action, onDone]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-lg border border-emerald-500/30 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-lg dark:bg-zinc-900 dark:text-zinc-50"
    >
      <CheckCircleIcon size={18} className="shrink-0 text-emerald-500" />
      <span>{message}</span>
      {action && (
        <button
          onClick={() => {
            action.onClick();
            onDone();
          }}
          className="shrink-0 rounded-md px-2 py-0.5 font-semibold text-emerald-600 outline-none hover:bg-emerald-500/10 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-emerald-400"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
