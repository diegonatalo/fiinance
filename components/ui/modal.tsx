import { XIcon } from "@phosphor-icons/react";
import { useEffect, useEffectEvent, useRef, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Modal = ({ open, title, onClose, children }: ModalProps) => {
  const dashboard = useRef<HTMLDivElement>(null);
  const close = useEffectEvent(onClose);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const el = dashboard.current;
    // foca o primeiro campo do conteúdo (o primeiro focável é o botão de fechar)
    const fields = el?.querySelectorAll<HTMLElement>(FOCUSABLE);
    (fields?.[1] ?? fields?.[0] ?? el)?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !el) return;
      const items = el.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) return;
      const first = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={dashboard}
        tabIndex={-1}
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-surface p-6 text-fg shadow-2xl outline-none sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-[10px] text-muted transition-colors hover:bg-raised hover:text-fg"
          >
            <XIcon size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
