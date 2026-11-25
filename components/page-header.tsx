import type { ReactNode } from "react";
import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  /** botão principal da tela; no celular vira um "+" ao lado do título */
  action?: { label: string; onClick: () => void; disabled?: boolean };
  /** controles ao lado do botão (filtros, por exemplo) */
  children?: ReactNode;
};

/** Título da tela com a descrição e a ação principal. */
export const PageHeader = ({ title, description, action, children }: PageHeaderProps) => (
  <section className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
    <div className="flex min-w-0 flex-1 flex-col gap-1.5 md:gap-2.5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[30px] font-semibold tracking-[-0.04em] md:text-[40px]">{title}</h1>
        {action && (
          <Button size="icon" className="size-11 rounded-xl md:hidden" onClick={action.onClick} disabled={action.disabled} aria-label={action.label}>
            <PlusIcon size={18} weight="bold" aria-hidden="true" />
          </Button>
        )}
      </div>
      {description && <p className="text-[13px] text-muted tabular-nums md:text-[15px]">{description}</p>}
    </div>
    {(children || action) && (
      <div className={cn("flex w-full flex-wrap items-center gap-3 *:max-md:w-full md:w-auto", !children && "max-md:hidden")}>
        {children}
        {action && (
          <Button className="max-md:hidden" onClick={action.onClick} disabled={action.disabled}>
            <PlusIcon size={16} weight="bold" aria-hidden="true" /> {action.label}
          </Button>
        )}
      </div>
    )}
  </section>
);
