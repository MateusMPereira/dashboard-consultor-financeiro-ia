import { useState, useEffect } from "react";
import { PieChart, ShoppingCart, Calculator, DollarSign, Target } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { DiscretizedCMVChart } from "@/components/dashboard/DiscretizedCMVChart";
import { FixedExpensesChart } from "@/components/dashboard/FixedExpensesChart";
import { VariableExpensesChart } from "@/components/dashboard/VariableExpensesChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { TrendChartServices } from "@/components/dashboard/TrendChartServices";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { Transaction } from "@/components/dashboard/TransactionsList";

interface DiscretizedCMVData {
  name: string;
  value: number;
  color: string;
}

interface FixedExpenseData {
  name: string;
  value: number;
  color: string;
}

interface VariableExpenseData {
  name: string;
  value: number;
  color: string;
}

interface TrendData {
  month: string;
  income: number;
  cmv: number;
  despesasOperacionais: number;
}

interface TrendServicesData {
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
  const [discretizedCMVChartData, setDiscretizedCMVChartData] = useState<DiscretizedCMVData[]>([]);
  const [fixedExpensesChartData, setFixedExpensesChartData] = useState<FixedExpenseData[]>([]);
  const [variableExpensesChartData, setVariableExpensesChartData] = useState<VariableExpenseData[]>([]);
  const [trendChartData, setTrendChartData] = useState<TrendData[]>([]);
  const [trendChartServicesData, setTrendChartServicesData] = useState<TrendServicesData[]>([]);
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
        .select("*, subcategorias(*, categorias(*))")
        .eq("empresa_id", user.empresa_id)
        .gte("data_referencia", currentMonthStart)
        .lte("data_referencia", currentMonthEnd)
        .order("data_referencia", { ascending: false });

      if (currentMonthError) throw currentMonthError;

      const { data: previousMonthLancamentos, error: previousMonthError } = await supabase
        .from("lancamentos")
        .select("*, subcategorias(*, categorias(*))")
        .eq("empresa_id", user.empresa_id)
        .gte("data_referencia", previousMonthStart)
        .lte("data_referencia", previousMonthEnd);

      if (previousMonthError) throw previousMonthError;

      const allLancamentos = [...(currentMonthLancamentos || []), ...(previousMonthLancamentos || [])].map((item: any) => ({
        ...item,
        tipo: item.subcategorias?.categorias?.natureza || 'despesa',
      }));

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

      const cmvBySubcategory: { [key: string]: number } = {};
      const fixedExpensesBySubcategory: { [key: string]: number } = {};
      const variableExpensesBySubcategory: { [key: string]: number } = {};
      const trendDataMap: { [key: string]: { income: number; cmv: number; expenses: number } } = {};
      const trendServicesDataMap: { [key: string]: { income: number; expenses: number } } = {};

      allLancamentos.forEach((lancamento: any) => {
        const amount = parseFloat(lancamento.valor);
        const isCurrentMonth = lancamento.data_referencia >= currentMonthStart && lancamento.data_referencia <= currentMonthEnd;
        const isPreviousMonth = lancamento.data_referencia >= previousMonthStart && lancamento.data_referencia <= previousMonthEnd;

        const isCMV = lancamento.subcategorias?.categorias?.descricao?.toUpperCase().includes('CMV') && lancamento.tipo === 'despesa';
        const isFixedCost = lancamento.subcategorias?.categorias?.descricao?.toUpperCase().includes('CUSTO FIXO') && lancamento.tipo === 'despesa';
        const isVariableCost = lancamento.subcategorias?.categorias?.descricao?.toUpperCase().includes('CUSTO VARIAVEL') && lancamento.tipo === 'despesa';

        const monthKey = format(new Date(lancamento.data_referencia.replace(/-/g, '/')), "MMM");
        if (!trendDataMap[monthKey]) {
          trendDataMap[monthKey] = { income: 0, cmv: 0, expenses: 0 };
        }
        if (!trendServicesDataMap[monthKey]) {
          trendServicesDataMap[monthKey] = { income: 0, despesasOperacionais: 0 };
        }

        if (lancamento.tipo === "receita") {
          if (isCurrentMonth) netIncomes += amount;
          if (isPreviousMonth) previousNetIncomes += amount;
          
          trendDataMap[monthKey].income += amount;
          trendServicesDataMap[monthKey].income += amount;
        } else { // Non-revenue
          if (isCMV) {
            if (isCurrentMonth) {
              totalCMV += amount;
              const subcategoryName = lancamento.subcategorias?.nome || "CMV Não Categorizado";
              cmvBySubcategory[subcategoryName] = (cmvBySubcategory[subcategoryName] || 0) + amount;
            }
            if (isPreviousMonth) {
              previousTotalCMV += amount;
            }
            trendDataMap[monthKey].cmv += amount;
          } else { // Operating Expense
            if (isCurrentMonth) {
              operatingExpenses += amount;
              const subcategoryName = lancamento.subcategorias?.nome || "Despesa Não Categorizada";
              if (isFixedCost) {
                fixedExpensesBySubcategory[subcategoryName] = (fixedExpensesBySubcategory[subcategoryName] || 0) + amount;
              } else if (isVariableCost) {
                variableExpensesBySubcategory[subcategoryName] = (variableExpensesBySubcategory[subcategoryName] || 0) + amount;
              }
            }
            if (isPreviousMonth) {
              previousOperatingExpenses += amount;
            }
            trendDataMap[monthKey].expenses += amount;
          }
          // All non-revenue expenses are added to trendServicesDataMap
          trendServicesDataMap[monthKey].despesasOperacionais += amount;
        }
      });      

      setMetrics({
        netIncomes,
        previousNetIncomes,
        totalCMV,
        cmvIncomesSlice: (netIncomes > 0) ? totalCMV * (netIncomes / 100) : 0,
        previousTotalCMV,
        operatingExpenses,
        previousOperatingExpenses,
        contributionMargin: totalCMV + operatingExpenses,
        previousContributionMargin: previousTotalCMV + previousOperatingExpenses,
        ebitda: netIncomes - (totalCMV + operatingExpenses),
        previousEbitda: previousNetIncomes - (previousTotalCMV + previousOperatingExpenses)
      });

      setDiscretizedCMVChartData(Object.keys(cmvBySubcategory).map(name => ({
        name,
        value: cmvBySubcategory[name],
        color: "#" + Math.floor(Math.random()*16777215).toString(16),
      })));

      setFixedExpensesChartData(Object.keys(fixedExpensesBySubcategory).map(name => ({
        name,
        value: fixedExpensesBySubcategory[name],
        color: "#" + Math.floor(Math.random()*16777215).toString(16),
      })));

      setVariableExpensesChartData(Object.keys(variableExpensesBySubcategory).map(name => ({
        name,
        value: variableExpensesBySubcategory[name],
        color: "#" + Math.floor(Math.random()*16777215).toString(16),
      })));

      setTrendChartData(Object.keys(trendDataMap).map(month => ({
        month,
        income: trendDataMap[month].income,
        cmv: trendDataMap[month].cmv,
        despesasOperacionais: trendDataMap[month].expenses,
      })).sort((a, b) => new Date(`1 ${a.month} 2000`).getTime() - new Date(`1 ${b.month} 2000`).getTime()));

      setTrendChartServicesData(Object.keys(trendServicesDataMap).map(month => ({
        month,
        income: trendServicesDataMap[month].income,
        despesasOperacionais: trendServicesDataMap[month].despesasOperacionais,
      })).sort((a, b) => new Date(`1 ${a.month} 2000`).getTime() - new Date(`1 ${b.month} 2000`).getTime()));

      setTransactions(allLancamentos
        .filter((lancamento: any) => {
            const today = new Date();
            const currentMonthStart = format(startOfMonth(today), "yyyy-MM-dd");
            return lancamento.data_referencia >= currentMonthStart;
        })
        .map((lancamento: any) => ({
          id: lancamento.id,
          description: lancamento.descricao,
          category: lancamento.subcategorias?.nome || "N/A",
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
          change={getChangeValue(metrics.netIncomes, metrics.previousNetIncomes)}
          changeType={getChangeType(metrics.netIncomes, metrics.previousNetIncomes)}
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
          title="Margem de Contribuição"
          value={formatCurrency(metrics.contributionMargin)}
          change={getChangeValue(metrics.contributionMargin, metrics.previousContributionMargin)}
          changeType={getExpenseChangeType(metrics.contributionMargin, metrics.previousContributionMargin)}
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
        <div className="lg:w-[33%]">
          <DiscretizedCMVChart data={discretizedCMVChartData} />
        </div>
        <div className="lg:w-[33%]">
          <FixedExpensesChart data={fixedExpensesChartData} />
        </div>
        <div className="lg:w-[34%]">
          <VariableExpensesChart data={variableExpensesChartData} />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-[100%]">
          <TrendChart data={trendChartData} />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-[100%]">
          <TrendChartServices data={trendChartServicesData} />
        </div>
      </div>

      {/* Transactions Table */}
      <TransactionsList transactions={transactions} />
    </div>
  );
};

export default Dashboard;