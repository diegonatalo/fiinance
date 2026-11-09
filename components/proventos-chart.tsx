import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardTitle } from "./ui/card";
import { formatBRL } from "../lib/format";
import { formatMes } from "../lib/data";
import type { MesProvento } from "../lib/proventos";
import type { Theme } from "../hooks/useTheme";

interface ProventosChartProps {
  serie: MesProvento[];
  theme: Theme;
}

export function ProventosChart({ serie, theme }: ProventosChartProps) {
  const isDark = theme === "dark";
  const eixo = isDark ? "#a1a1aa" : "#71717a";

  return (
    <Card className="min-w-0">
      <CardTitle className="mb-3">Proventos nos últimos 12 meses</CardTitle>
      <div className="h-52 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={serie} margin={{ left: 0, right: 8, top: 4 }}>
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
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v: number) => `R$${v}`}
              tick={{ fill: eixo, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              cursor={{ fill: isDark ? "#27272a66" : "#f4f4f566" }}
              formatter={(value) => [formatBRL(value as number), "Proventos"]}
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
            <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
