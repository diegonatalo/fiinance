import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export const Card = ({ children, className }: CardProps) => {
  return (
    <section className={cn("min-w-0 rounded-[20px] border border-line bg-surface p-5 sm:p-7", className)}>
      {children}
    </section>
  );
};

export const CardTitle = ({ children, className }: CardProps) => {
  return <h2 className={cn("text-[17px] font-semibold tracking-tight text-fg", className)}>{children}</h2>;
};
