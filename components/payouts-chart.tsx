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
import { chartTheme } from "@/lib/chart-theme";
import { formatBRL } from "@/lib/format";
import { formatMonth } from "@/lib/date";
import type { PayoutMonth } from "@/lib/payouts";
import type { Theme } from "@/lib/theme";

type PayoutsChartProps = {
  series: PayoutMonth[];
  theme: Theme;
};

export const PayoutsChart = ({ series, theme }: PayoutsChartProps) => {
  const colors = chartTheme(theme);

  return (
    <Card className="min-w-0">
      <CardTitle className="mb-3">Proventos nos últimos 12 meses</CardTitle>
      <div className="h-52 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart data={series} margin={{ left: 0, right: 8, top: 4 }}>
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
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v: number) => `R$${v}`}
              tick={{ fill: colors.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              cursor={{ fill: colors.cursor }}
              formatter={(value) => [formatBRL(value as number), "Proventos"]}
              labelFormatter={(month) => formatMonth(month as string)}
              {...colors.tooltip}
            />
            <Bar dataKey="total" fill={colors.series} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
