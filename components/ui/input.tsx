import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const base =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-600";

function border(error?: boolean) {
  return error
    ? "border-red-400 dark:border-red-500"
    : "border-zinc-300 dark:border-zinc-700";
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const Input = ({ error, className, ...props }: InputProps) => {
  return <input className={cn(base, border(error), className)} {...props} />;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
};

export const Select = ({ error, className, ...props }: SelectProps) => {
  return <select className={cn(base, border(error), className)} {...props} />;
};
