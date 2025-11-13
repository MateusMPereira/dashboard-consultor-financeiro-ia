import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface VariableExpensesChartProps {
  data: ChartData[];
}

export function VariableExpensesChart({ data }: VariableExpensesChartProps) {
  return (
    <Card className="p-6 shadow-card">
      <h3 className="text-xl font-bold">Despesas Variáveis Discretizadas</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ value }) => `R$ ${Number(value).toFixed(2)}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`R$ ${Number(value).toFixed(2)}`, name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
