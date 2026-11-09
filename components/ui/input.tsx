import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "../../lib/format";

const base =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600";

function borda(error?: boolean) {
  return error
    ? "border-red-400 dark:border-red-500"
    : "border-zinc-300 dark:border-zinc-700";
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className, ...props }: InputProps) {
  return <input className={cn(base, borda(error), className)} {...props} />;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function Select({ error, className, ...props }: SelectProps) {
  return <select className={cn(base, borda(error), className)} {...props} />;
}
