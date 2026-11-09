import { useCallback, useState, type ReactNode } from "react";
import { Toast } from "./toast";
import { ToastContext, type ToastAction } from "@/lib/toast-context";

interface ToastState {
  message: string;
  action?: ToastAction;
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastState | null>(null);

  const notify = useCallback((message: string, action?: ToastAction) => {
    setToast({ message, action });
  }, []);
  const dismiss = useCallback(() => setToast(null), []);

  return (
    <ToastContext value={notify}>
      {children}
      <Toast
        message={toast?.message ?? null}
        action={toast?.action}
        onDone={dismiss}
      />
    </ToastContext>
  );
};
