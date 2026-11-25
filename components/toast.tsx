import { CheckCircleIcon } from "@phosphor-icons/react";
import { useEffect } from "react";
import type { ToastAction } from "@/hooks/use-toast";

type ToastProps = {
  message: string | null;
  action?: ToastAction;
  onDone: () => void;
};

export const Toast = ({ message, action, onDone }: ToastProps) => {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, action ? 6000 : 2400);
    return () => clearTimeout(t);
  }, [message, action, onDone]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-1/2 z-50 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-medium text-fg shadow-xl md:bottom-6"
    >
      <CheckCircleIcon size={18} className="shrink-0 text-up" />
      <span>{message}</span>
      {action && (
        <button
          onClick={() => {
            action.onClick();
            onDone();
          }}
          type="button"
          className="shrink-0 rounded-lg px-2 py-1 font-semibold text-paper hover:bg-paper/10"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
