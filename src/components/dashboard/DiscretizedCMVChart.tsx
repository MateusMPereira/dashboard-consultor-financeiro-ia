import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface ExpensesChartProps {
  data: ChartData[];
}

const formatCurrency = (value: number) => {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export function DiscretizedCMVChart({ data }: ExpensesChartProps) {
  return (
    <Card className="p-6 shadow-card">
      <h3 className="text-xl font-bold">CMV Discretizado</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ value }) => `${formatCurrency(value)}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any, name) => [formatCurrency(Number(value)), name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
