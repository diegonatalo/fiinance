import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/format";

type Variant = "primary" | "ghost" | "danger" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:ring-emerald-500",
  outline:
    "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 focus-visible:ring-zinc-400",
  ghost:
    "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 focus-visible:ring-zinc-400",
  danger:
    "text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 focus-visible:ring-red-500",
};

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-zinc-900",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
