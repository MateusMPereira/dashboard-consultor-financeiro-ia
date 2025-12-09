import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface FixedExpensesChartProps {
  data: ChartData[];
}

const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export function FixedExpensesChart({ data }: FixedExpensesChartProps) {
  return (
    <Card className="p-6 shadow-card">
      <h3 className="text-xl font-bold">Despesas Fixas Discretizadas</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ value }) => `${formatCurrency(value)}`}
            outerRadius={60}
            fill="#8884d8"
            dataKey="value"
            style={{ fontSize: '12px' }}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any, name) => [formatCurrency(value), name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
