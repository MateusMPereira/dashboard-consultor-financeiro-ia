import { useState, useEffect } from "react";
import { PieChart, ShoppingCart, Calculator, DollarSign, Target } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { ExpensesChart } from "@/components/dashboard/ExpensesChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { Transaction } from "@/components/dashboard/TransactionsList";

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
    netIncomes: 0,
    previousNetIncomes: 0,
    totalCMV: 0,
    cmvIncomesSlice: 0,
    previousTotalCMV: 0,
    operatingExpenses: 0,
    previousOperatingExpenses: 0,
    contributionMargin: 0,
    previousContributionMargin: 0,
    ebitda: 0,
    previousEbitda: 0,
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
        .lte("data_referencia", currentMonthEnd)
        .order("data_referencia", { ascending: false });

      if (currentMonthError) throw currentMonthError;

      const { data: previousMonthLancamentos, error: previousMonthError } = await supabase
        .from("lancamentos")
        .select("*, categorias(nome)")
        .eq("empresa_id", user.empresa_id)
        .gte("data_referencia", previousMonthStart)
        .lte("data_referencia", previousMonthEnd);

      if (previousMonthError) throw previousMonthError;

      const allLancamentos = [...(currentMonthLancamentos || []), ...(previousMonthLancamentos || [])];

      let netIncomes = 0;
      let previousNetIncomes = 0
      let totalCMV = 0;
      let cmvIncomesSlice = 0;
      let previousTotalCMV = 0;
      let operatingExpenses = 0;
      let previousOperatingExpenses = 0;
      let contributionMargin = 0;
      let previousContributionMargin = 0;
      let ebitda = 0;
      let previousEbitda = 0;

      const expensesByNature: { [key: string]: number } = {};
      const trendDataMap: { [key: string]: { income: number; expenses: number } } = {};

      allLancamentos.forEach((lancamento: any) => {
        const amount = parseFloat(lancamento.valor);
        const isCurrentMonth = lancamento.data_referencia >= currentMonthStart && lancamento.data_referencia <= currentMonthEnd;
        const isPreviousMonth = lancamento.data_referencia >= previousMonthStart && lancamento.data_referencia <= previousMonthEnd;

        if (lancamento.tipo === "receita") {
          if (isCurrentMonth) netIncomes += amount;
          if (isPreviousMonth) previousNetIncomes += amount;
        } else {

          if (isCurrentMonth) {
            const categoryName = lancamento.categorias?.nome || "Natureza não definida";
            expensesByNature[categoryName] = (expensesByNature[categoryName] || 0) + amount;
          }
        }

        const monthKey = format(new Date(lancamento.data_referencia.replace(/-/g, '/')), "MMM");
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
        netIncomes,
        previousNetIncomes,
        totalCMV,
        cmvIncomesSlice: (netIncomes > 0) ? totalCMV * (netIncomes / 100) : 0,
        previousTotalCMV,
        operatingExpenses,
        previousOperatingExpenses: 0,
        contributionMargin,
        previousContributionMargin,
        ebitda,
        previousEbitda
      });

      setExpensesChartData(Object.keys(expensesByNature).map(nature => ({
        name: nature,
        value: expensesByNature[nature],
        color: "#" + Math.floor(Math.random()*16777215).toString(16),
      })));

      setTrendChartData(Object.keys(trendDataMap).map(month => ({
        month,
        income: trendDataMap[month].income,
        expenses: trendDataMap[month].expenses,
      })).sort((a, b) => new Date(`1 ${a.month} 2000`).getTime() - new Date(`1 ${b.month} 2000`).getTime()));

      setTransactions((currentMonthLancamentos || [])
        .map((lancamento: any) => ({
          id: lancamento.id,
          description: lancamento.descricao,
          category: lancamento.categorias?.nome || "N/A",
          amount: parseFloat(lancamento.valor),
          date: format(new Date(lancamento.data_referencia.replace(/-/g, '/')), "dd/MM/yyyy"),
          type: (lancamento.tipo === "receita" ? "income" : "expense") as "income" | "expense",
        }))
        .slice(0, 4)
      );

    } catch (error: any) {
      console.error("Error fetching dashboard data:", error.message);
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
    if (current > previous) return "negative";
    if (current < previous) return "positive";
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Receita Líquida"
          value={formatCurrency(metrics.netIncomes)}
          change=""
          changeType="neutral"
          icon={DollarSign}
          variant="default"
        />
        <MetricCard
          title="CMV Total"
          value={formatCurrency(metrics.totalCMV)}
          change={getChangeValue(metrics.totalCMV, metrics.previousTotalCMV)}
          changeType={getChangeType(metrics.totalCMV, metrics.previousTotalCMV)}
          icon={ShoppingCart}
          variant="destructive"
        />
        <MetricCard
          title="Despesas Operacionais"
          value={formatCurrency(metrics.operatingExpenses)}
          change={getChangeValue(metrics.operatingExpenses, metrics.previousOperatingExpenses)}
          changeType={getExpenseChangeType(metrics.operatingExpenses, metrics.previousOperatingExpenses)}
          icon={Calculator}
          variant="destructive"
        />
        <MetricCard
          title="Marge de Contribuição"
          value={formatCurrency(metrics.contributionMargin)}
          change={getChangeValue(metrics.contributionMargin, metrics.previousContributionMargin)}
          changeType={getChangeType(metrics.contributionMargin, metrics.previousContributionMargin)}
          icon={PieChart}
          variant="destructive"
        />
        <MetricCard
          title="Ebitda"
          value={formatCurrency(metrics.ebitda)}
          change={getChangeValue(metrics.ebitda, metrics.previousEbitda)}
          changeType={getChangeType(metrics.ebitda, metrics.previousEbitda)}
          icon={Target}
          variant="success"
        />
      </div>

      {/* Charts Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-[40%]">
          <ExpensesChart data={expensesChartData} />
        </div>
        <div className="lg:w-[60%]">
          <TrendChart data={trendChartData} />
        </div>
      </div>

      {/* Transactions Table */}
      <TransactionsList transactions={transactions} />
    </div>
  );
};

export default Dashboard;
