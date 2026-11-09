import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatBRL } from "../lib/format";
import type { Fatia } from "../lib/distribuicao";
import { Card, CardTitle } from "./ui/card";
import { ChartPieSliceIcon } from "@phosphor-icons/react";

interface PieChartCardProps {
  title: string;
  data: Fatia[];
  theme: "light" | "dark";
}

const COLORS = [
  "#10b981", // emerald-500
  "#3b82f6", // blue-500
  "#f59e0b", // amber-500
  "#ec4899", // pink-500
  "#8b5cf6", // violet-500
  "#14b8a6", // teal-500
  "#f97316", // orange-500
  "#ef4444", // red-500
  "#6366f1", // indigo-500
  "#84cc16", // lime-500
];

export function PieChartCard({ title, data, theme }: PieChartCardProps) {
  const total = data.reduce((acc, d) => acc + d.valor, 0);
  const isDark = theme === "dark";

  return (
    <Card className="flex min-w-0 flex-col">
      <CardTitle className="mb-3">{title}</CardTitle>

      {data.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <ChartPieSliceIcon
            size={22}
            className="text-zinc-300 dark:text-zinc-600"
          />
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Sem dados para exibir
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="h-44 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="valor"
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    formatBRL(value as number),
                    name as string,
                  ]}
                  contentStyle={{
                    borderRadius: 8,
                    border: `1px solid ${isDark ? "#3f3f46" : "#e4e4e7"}`,
                    background: isDark ? "#18181b" : "#ffffff",
                    fontSize: 12,
                    color: isDark ? "#fafafa" : "#18181b",
                  }}
                  labelStyle={{ color: isDark ? "#fafafa" : "#18181b" }}
                  itemStyle={{ color: isDark ? "#fafafa" : "#18181b" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="grid gap-1.5">
            {data.map((d, i) => {
              const pct = total > 0 ? (d.valor / total) * 100 : 0;
              return (
                <li key={d.nome} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="truncate capitalize text-zinc-600 dark:text-zinc-300">
                    {d.nome}
                  </span>
                  <span className="ml-auto shrink-0 font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                    {pct.toFixed(1)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Card>
  );
}
