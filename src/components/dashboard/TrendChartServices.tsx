import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface TrendData {
  month: string;
  income: number;
  trendOperatingExpenses: number;
}

interface TrendChartServicesProps {
  data: TrendData[];
}

export function TrendChartServices({ data }: TrendChartServicesProps) {
  return (
    <Card className="p-6 shadow-card">
      <h3 className="text-xl font-bold">Receita vs Despesas Operacionais</h3>
      <h6 className="text-md mb-4">Últimos 6 meses</h6>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="month" className="text-muted-foreground" />
          <YAxis className="text-muted-foreground" />
          <Tooltip
            formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
            contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="income"
            stroke="hsl(var(--success))"
            strokeWidth={2}
            name="Receitas"
            dot={{ fill: "hsl(var(--success))" }}
          />
          <Line
            type="monotone"
            dataKey="trendOperatingExpenses"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            name="Despesas Operacionais"
            dot={{ fill: "hsl(var(--destructive))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
