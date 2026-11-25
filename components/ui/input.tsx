import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const base =
  "h-12 w-full min-w-0 rounded-xl border bg-bg px-3.5 text-[15px] font-medium tabular-nums text-fg outline-none transition-colors placeholder:font-normal placeholder:text-faint focus:border-paper disabled:opacity-60";

function border(error?: boolean) {
  return error ? "border-down" : "border-line";
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
};

export const Input = ({ error, className, ...props }: InputProps) => {
  return <input aria-invalid={error || undefined} className={cn(base, border(error), className)} {...props} />;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean;
};

export const Select = ({ error, className, ...props }: SelectProps) => {
  return <select aria-invalid={error || undefined} className={cn(base, border(error), className)} {...props} />;
};
