import { HorizontalBarChart } from "./HorizontalBarChart";

interface ChartData {
  name: string;
  value: number;
}

interface FixedExpensesChartProps {
  data: ChartData[];
}

export function FixedExpensesChart({ data }: FixedExpensesChartProps) {
  return (
    <HorizontalBarChart
      data={data}
      title="Despesas Fixas Discretizadas"
    />
  );
}
