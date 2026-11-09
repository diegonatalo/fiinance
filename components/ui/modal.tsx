import { XIcon } from "@phosphor-icons/react";
import { useEffect, useEffectEvent, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

const FOCAVEIS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ open, title, onClose, children }: ModalProps) {
  const painel = useRef<HTMLDivElement>(null);
  const fechar = useEffectEvent(onClose);

  useEffect(() => {
    if (!open) return;
    const anterior = document.activeElement as HTMLElement | null;
    const el = painel.current;
    // foca o primeiro campo do conteúdo (o primeiro focável é o botão de fechar)
    const campos = el?.querySelectorAll<HTMLElement>(FOCAVEIS);
    (campos?.[1] ?? campos?.[0] ?? el)?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        fechar();
        return;
      }
      if (e.key !== "Tab" || !el) return;
      const itens = el.querySelectorAll<HTMLElement>(FOCAVEIS);
      if (itens.length === 0) return;
      const primeiro = itens[0];
      const ultimo = itens[itens.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      anterior?.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={painel}
        tabIndex={-1}
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-t-2xl border border-zinc-200 bg-white p-5 shadow-xl outline-none dark:border-zinc-800 dark:bg-zinc-900 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <XIcon size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
