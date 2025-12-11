import { HorizontalBarChart } from "./HorizontalBarChart";

interface ChartData {
  name: string;
  value: number;
}

interface VariableExpensesChartProps {
  data: ChartData[];
}

export function VariableExpensesChart({ data }: VariableExpensesChartProps) {
  return (
    <HorizontalBarChart
      data={data}
      title="Despesas Variáveis Discretizadas"
    />
  );
}
