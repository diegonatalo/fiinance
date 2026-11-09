import type { ReactNode } from "react";
import { cn } from "../../lib/format";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: CardProps) {
  return (
    <h2
      className={cn(
        "text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400",
        className,
      )}
    >
      {children}
    </h2>
  );
}
