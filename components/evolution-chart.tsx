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
import { chartTheme } from "@/lib/chart-theme";
import { formatBRL } from "@/lib/format";
import { formatMonth } from "@/lib/date";
import type { EvolutionPoint } from "@/lib/evolution";
import type { Theme } from "@/lib/theme";
import { ChartLineIcon } from "@phosphor-icons/react";

type EvolutionChartProps = {
  data: EvolutionPoint[];
  theme: Theme;
};

export const EvolutionChart = ({ data, theme }: EvolutionChartProps) => {
  const colors = chartTheme(theme);

  return (
    <Card className="min-w-0">
      <CardTitle className="mb-3">Aportes acumulados</CardTitle>
      {data.length < 2 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
          <ChartLineIcon size={22} className="text-zinc-300 dark:text-zinc-600" />
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Registre operações em pelo menos dois meses para ver a evolução
          </p>
        </div>
      ) : (
        <div className="h-52 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={data} margin={{ left: 0, right: 8, top: 4 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.grid}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tickFormatter={formatMonth}
                tick={{ fill: colors.axis, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
                tick={{ fill: colors.axis, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                formatter={(value) => [formatBRL(value as number), "Aportado"]}
                labelFormatter={(month) => formatMonth(month as string)}
                {...colors.tooltip}
              />
              <Area
                type="monotone"
                dataKey="contributed"
                stroke={colors.series}
                fill={colors.series}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
