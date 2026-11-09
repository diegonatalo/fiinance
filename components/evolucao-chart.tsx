import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardTitle } from "./ui/card";
import { formatBRL } from "../lib/format";
import { formatMes } from "../lib/data";
import type { PontoEvolucao } from "../lib/evolucao";
import type { Theme } from "../hooks/useTheme";
import { ChartLineIcon } from "@phosphor-icons/react";

interface EvolucaoChartProps {
  dados: PontoEvolucao[];
  theme: Theme;
}

export function EvolucaoChart({ dados, theme }: EvolucaoChartProps) {
  const isDark = theme === "dark";
  const eixo = isDark ? "#a1a1aa" : "#71717a";

  return (
    <Card className="min-w-0">
      <CardTitle className="mb-3">Aportes acumulados</CardTitle>
      {dados.length < 2 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <ChartLineIcon size={22} className="text-zinc-300 dark:text-zinc-600" />
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Registre operações em pelo menos dois meses para ver a evolução
          </p>
        </div>
      ) : (
        <div className="h-52 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={dados} margin={{ left: 0, right: 8, top: 4 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#27272a" : "#e4e4e7"}
                vertical={false}
              />
              <XAxis
                dataKey="mes"
                tickFormatter={formatMes}
                tick={{ fill: eixo, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
                tick={{ fill: eixo, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                formatter={(value) => [formatBRL(value as number), "Aportado"]}
                labelFormatter={(mes) => formatMes(mes as string)}
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
              <Area
                type="monotone"
                dataKey="aportado"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
