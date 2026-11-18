/**
 * Cores dos gráficos (recharts) no tema claro e no escuro. Fica num lugar só
 * para os três gráficos não se desencontrarem quando uma cor mudar.
 */
export const chartTheme = (theme: "light" | "dark") => {
  const isDark = theme === "dark";
  const text = isDark ? "#fafafa" : "#18181b";

  return {
    /** cor das séries de valor (área e barras), igual nos dois temas */
    series: "#10b981",
    /** texto dos eixos */
    axis: isDark ? "#a1a1aa" : "#71717a",
    /** linhas da grade */
    grid: isDark ? "#27272a" : "#e4e4e7",
    /** faixa sob o cursor nos gráficos de barra */
    cursor: isDark ? "#27272a66" : "#f4f4f566",
    /** props de estilo do <Tooltip> */
    tooltip: {
      contentStyle: {
        borderRadius: 8,
        border: `1px solid ${isDark ? "#3f3f46" : "#e4e4e7"}`,
        background: isDark ? "#18181b" : "#ffffff",
        fontSize: 12,
        color: text,
      },
      labelStyle: { color: text },
      itemStyle: { color: text },
    },
  };
};
