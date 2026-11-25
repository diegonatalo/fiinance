import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export const Field = ({ label, error, hint, children }: FieldProps) => {
  return (
    <label className="grid gap-2">
      <span className="text-[13px] text-muted">{label}</span>
      {children}
      {error ? (
        <span className="text-xs text-down">{error}</span>
      ) : (
        hint && <span className="text-xs text-subtle">{hint}</span>
      )}
    </label>
  );
};
