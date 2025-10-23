import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { ExpensesChart } from "@/components/dashboard/ExpensesChart";
import { TrendChart } from "@/components/dashboard/TrendChart";

const Dashboard = () => {
  // Mock data temporário
  const transactions = [
    { id: "1", description: "Salário", category: "Receita", amount: 5000, date: "01/01/2025", type: "income" as const },
    { id: "2", description: "Supermercado", category: "Alimentação", amount: -450, date: "03/01/2025", type: "expense" as const },
    { id: "3", description: "Aluguel", category: "Moradia", amount: -1500, date: "05/01/2025", type: "expense" as const },
  ];

  const expensesData = [
    { name: "Moradia", value: 1500, color: "hsl(221 83% 53%)" },
    { name: "Alimentação", value: 450, color: "hsl(142 76% 36%)" },
    { name: "Transporte", value: 300, color: "hsl(38 92% 50%)" },
  ];

  const trendData = [
    { month: "Set", income: 5000, expenses: 3200 },
    { month: "Out", income: 5200, expenses: 3400 },
    { month: "Nov", income: 5000, expenses: 3100 },
    { month: "Dez", income: 6000, expenses: 4200 },
    { month: "Jan", income: 6200, expenses: 2400 },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Saldo Total"
          value="R$ 8.750,00"
          change="Positivo"
          changeType="positive"
          icon={Wallet}
          variant="default"
        />
        <MetricCard
          title="Receitas"
          value="R$ 6.200,00"
          change="Este mês"
          changeType="positive"
          icon={TrendingUp}
          variant="success"
        />
        <MetricCard
          title="Despesas"
          value="R$ 2.400,00"
          change="Este mês"
          changeType="negative"
          icon={TrendingDown}
          variant="destructive"
        />
        <MetricCard
          title="Economia"
          value="R$ 3.800,00"
          change="Este mês"
          changeType="positive"
          icon={DollarSign}
          variant="success"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ExpensesChart data={expensesData} />
        <TrendChart data={trendData} />
      </div>

      {/* Transactions Table */}
      <TransactionsList transactions={transactions} />
    </div>
  );
};

export default Dashboard;
