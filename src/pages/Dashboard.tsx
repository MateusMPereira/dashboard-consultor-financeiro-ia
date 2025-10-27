import { useState, useEffect } from "react";
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { ExpensesChart } from "@/components/dashboard/ExpensesChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

interface Transaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  type: "income" | "expense";
}

interface ExpenseData {
  name: string;
  value: number;
  color: string;
}

interface TrendData {
  month: string;
  income: number;
  expenses: number;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState({
    totalBalance: 0,
    currentMonthIncome: 0,
    currentMonthExpenses: 0,
    currentMonthSavings: 0,
    previousMonthIncome: 0,
    previousMonthExpenses: 0,
  });
  const [expensesChartData, setExpensesChartData] = useState<ExpenseData[]>([]);
  const [trendChartData, setTrendChartData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user?.empresa_id) {
      fetchDashboardData();
    }
  }, [authLoading, user?.empresa_id]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (!user?.empresa_id) {
        throw new Error("Empresa não encontrada");
      }

      const today = new Date();
      const currentMonthStart = format(startOfMonth(today), "yyyy-MM-dd");
      const currentMonthEnd = format(endOfMonth(today), "yyyy-MM-dd");
      const previousMonthStart = format(startOfMonth(subMonths(today, 1)), "yyyy-MM-dd");
      const previousMonthEnd = format(endOfMonth(subMonths(today, 1)), "yyyy-MM-dd");

      const { data: currentMonthLancamentos, error: currentMonthError } = await supabase
        .from("lancamentos")
        .select("*, categorias(nome)")
        .eq("empresa_id", user.empresa_id)
        .gte("data_referencia", currentMonthStart)
        .lte("data_referencia", currentMonthEnd);

      if (currentMonthError) throw currentMonthError;

      const { data: previousMonthLancamentos, error: previousMonthError } = await supabase
        .from("lancamentos")
        .select("*, categorias(nome)")
        .eq("empresa_id", user.empresa_id)
        .gte("data_referencia", previousMonthStart)
        .lte("data_referencia", previousMonthEnd);

      if (previousMonthError) throw previousMonthError;

      // Process data
      const allLancamentos = [...(currentMonthLancamentos || []), ...(previousMonthLancamentos || [])];

      let totalBalance = 0;
      let currentMonthIncome = 0;
      let currentMonthExpenses = 0;
      let previousMonthIncome = 0;
      let previousMonthExpenses = 0;

      const expensesByCategory: { [key: string]: number } = {};
      const trendDataMap: { [key: string]: { income: number; expenses: number } } = {};

      allLancamentos.forEach((lancamento: any) => {
        const amount = parseFloat(lancamento.valor);
        const isCurrentMonth = lancamento.data_referencia >= currentMonthStart && lancamento.data_referencia <= currentMonthEnd;
        const isPreviousMonth = lancamento.data_referencia >= previousMonthStart && lancamento.data_referencia <= previousMonthEnd;

        if (lancamento.tipo === "receita") {
          totalBalance += amount;
          if (isCurrentMonth) currentMonthIncome += amount;
          if (isPreviousMonth) previousMonthIncome += amount;
        } else {
          totalBalance -= amount;
          if (isCurrentMonth) currentMonthExpenses += amount;
          if (isPreviousMonth) previousMonthExpenses += amount;

          if (isCurrentMonth && lancamento.categorias?.nome) {
            expensesByCategory[lancamento.categorias.nome] = (expensesByCategory[lancamento.categorias.nome] || 0) + amount;
          }
        }

        const monthKey = format(new Date(lancamento.data_referencia), "MMM");
        if (!trendDataMap[monthKey]) {
          trendDataMap[monthKey] = { income: 0, expenses: 0 };
        }
        if (lancamento.tipo === "receita") {
          trendDataMap[monthKey].income += amount;
        } else {
          trendDataMap[monthKey].expenses += amount;
        }
      });

      setMetrics({
        totalBalance,
        currentMonthIncome,
        currentMonthExpenses,
        currentMonthSavings: currentMonthIncome - currentMonthExpenses,
        previousMonthIncome,
        previousMonthExpenses,
      });

      setExpensesChartData(Object.keys(expensesByCategory).map(category => ({
        name: category,
        value: expensesByCategory[category],
        color: "#" + Math.floor(Math.random()*16777215).toString(16), // Random color for now
      })));

      setTrendChartData(Object.keys(trendDataMap).map(month => ({
        month,
        income: trendDataMap[month].income,
        expenses: trendDataMap[month].expenses,
      })).sort((a, b) => new Date(`1 ${a.month} 2000`).getTime() - new Date(`1 ${b.month} 2000`).getTime())); // Sort by month

      setTransactions((currentMonthLancamentos || []).map((lancamento: any) => ({
        id: lancamento.id,
        description: lancamento.descricao,
        category: lancamento.categorias?.nome || "N/A",
        amount: parseFloat(lancamento.valor),
        date: format(new Date(lancamento.data_referencia), "dd/MM/yyyy"),
        type: lancamento.tipo === "receita" ? "income" : "expense",
      })));

    } catch (error: any) {
      console.error("Error fetching dashboard data:", error.message);
      // toast.error("Erro ao carregar dados do dashboard: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const getChangeType = (current: number, previous: number) => {
    if (current > previous) return "positive";
    if (current < previous) return "negative";
    return "neutral";
  };

  const getExpenseChangeType = (current: number, previous: number) => {
    if (current > previous) return "negative"; // More expenses is negative
    if (current < previous) return "positive"; // Less expenses is positive
    return "neutral";
  };

  const getChangeValue = (current: number, previous: number) => {
    const diff = current - previous;
    const percentage = previous === 0 ? 100 : (diff / previous) * 100;
    return `${diff >= 0 ? "+" : ""}${formatCurrency(diff)} (${percentage.toFixed(2)}%)`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Saldo Total"
          value={formatCurrency(metrics.totalBalance)}
          change="" // Total balance doesn't have a direct month-over-month change in this context
          changeType="neutral"
          icon={Wallet}
          variant="default"
        />
        <MetricCard
          title="Receitas"
          value={formatCurrency(metrics.currentMonthIncome)}
          change={getChangeValue(metrics.currentMonthIncome, metrics.previousMonthIncome)}
          changeType={getChangeType(metrics.currentMonthIncome, metrics.previousMonthIncome)}
          icon={TrendingUp}
          variant="success"
        />
        <MetricCard
          title="Despesas"
          value={formatCurrency(metrics.currentMonthExpenses)}
          change={getChangeValue(metrics.currentMonthExpenses, metrics.previousMonthExpenses)}
          changeType={getExpenseChangeType(metrics.currentMonthExpenses, metrics.previousMonthExpenses)}
          icon={TrendingDown}
          variant="destructive"
        />
        <MetricCard
          title="Economia"
          value={formatCurrency(metrics.currentMonthSavings)}
          change={getChangeValue(metrics.currentMonthSavings, metrics.previousMonthIncome - metrics.previousMonthExpenses)}
          changeType={getChangeType(metrics.currentMonthSavings, metrics.previousMonthIncome - metrics.previousMonthExpenses)}
          icon={DollarSign}
          variant="success"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ExpensesChart data={expensesChartData} />
        <TrendChart data={trendChartData} />
      </div>

      {/* Transactions Table */}
      <TransactionsList transactions={transactions} />
    </div>
  );
};

export default Dashboard;
