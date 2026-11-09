import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, error, hint, children }: FieldProps) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      {children}
      {error ? (
        <span className="text-xs text-red-500">{error}</span>
      ) : (
        hint && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {hint}
          </span>
        )
      )}
    </label>
  );
}
