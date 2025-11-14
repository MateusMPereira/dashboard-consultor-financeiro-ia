import { useState, useEffect } from "react";
import { PieChart, ShoppingCart, Calculator, DollarSign, Target } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { DiscretizedCMVChart } from "@/components/dashboard/DiscretizedCMVChart";
import { FixedExpensesChart } from "@/components/dashboard/FixedExpensesChart";
import { VariableExpensesChart } from "@/components/dashboard/VariableExpensesChart";
import { MonthYearPicker } from "@/components/dashboard/MonthYearPicker";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { TrendChartServices } from "@/components/dashboard/TrendChartServices";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { Transaction } from "@/components/dashboard/TransactionsList";

const Dashboard = () => {
  const { user, empresa, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
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
  const [discretizedCMVChartData, setDiscretizedCMVChartData] = useState<any[]>([]);
  const [fixedExpensesChartData, setFixedExpensesChartData] = useState<any[]>([]);
  const [variableExpensesChartData, setVariableExpensesChartData] = useState<any[]>([]);
  const [trendChartData, setTrendChartData] = useState<any[]>([]);
  const [trendChartServicesData, setTrendChartServicesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (empresa?.id || user?.empresa_id)) {
      fetchTrendsAndTransactionsData();
    }
  }, [authLoading, empresa?.id, user?.empresa_id]);

  useEffect(() => {
    if (!authLoading && (empresa?.id || user?.empresa_id)) {
      fetchCardsAndPiesData(selectedDate);
    }
  }, [authLoading, empresa?.id, user?.empresa_id, selectedDate]);

  const fetchCardsAndPiesData = async (date: Date) => {
    setLoading(true);
    try {
      const empresaId = empresa?.id || user?.empresa_id;
      if (!empresaId) throw new Error("Empresa não encontrada");

      const currentMonthStart = format(startOfMonth(date), "yyyy-MM-dd");
      const currentMonthEnd = format(endOfMonth(date), "yyyy-MM-dd");
      const previousMonthStart = format(startOfMonth(subMonths(date, 1)), "yyyy-MM-dd");
      const previousMonthEnd = format(endOfMonth(subMonths(date, 1)), "yyyy-MM-dd");

      const { data: lancamentos, error } = await supabase
        .from("lancamentos")
        .select("*, subcategorias(*, categorias(*))")
        .eq("empresa_id", empresaId)
        .gte("data_referencia", previousMonthStart)
        .lte("data_referencia", currentMonthEnd);

      if (error) throw error;

      const allLancamentos = (lancamentos || []).map((item: any) => ({
        ...item,
        tipo: item.subcategorias?.categorias?.natureza || 'despesa',
      }));

      let netIncomes = 0;
      let previousNetIncomes = 0;
      let totalCMV = 0;
      let previousTotalCMV = 0;
      let operatingExpenses = 0;
      let previousOperatingExpenses = 0;

      const cmvBySubcategory: { [key: string]: number } = {};
      const fixedExpensesBySubcategory: { [key: string]: number } = {};
      const variableExpensesBySubcategory: { [key: string]: number } = {};

      const fixedCostKeywords = ['DESPESAS FIXAS', 'DESPESA FIXA', 'CUSTOS FIXOS', 'CUSTO FIXO'];
      const variableCostKeywords = [
        'DESPESAS VARIAVEIS', 'DESPESAS VARIÁVEIS', 'DESPESA VARIAVEL', 'DESPESA VARIÁVEL',
        'CUSTOS VARIAVEIS', 'CUSTOS VARIÁVEIS', 'CUSTO VARIAVEL', 'CUSTO VARIÁVEL'
      ];
      const cmvKeywords = [
        'CMV', 'CUSTO DE MERCADORIA VENDIDA', 'CUSTOS DE MERCADORIA VENDIDA',
        'CUSTO POR MERCADORIA VENDIDA', 'CUSTOS POR MERCADORIA VENDIDA'
      ];

      allLancamentos.forEach((lancamento: any) => {
        const amount = parseFloat(lancamento.valor);
        const isCurrentMonth = lancamento.data_referencia >= currentMonthStart && lancamento.data_referencia <= currentMonthEnd;
        const isPreviousMonth = lancamento.data_referencia >= previousMonthStart && lancamento.data_referencia <= previousMonthEnd;
        
        const descriptionUpperCase = lancamento.subcategorias?.categorias?.descricao?.toUpperCase();
        const isCMV = descriptionUpperCase && cmvKeywords.some(keyword => descriptionUpperCase.includes(keyword)) && lancamento.tipo === 'despesa';
        const isFixedCost = descriptionUpperCase && fixedCostKeywords.some(keyword => descriptionUpperCase.includes(keyword)) && lancamento.tipo === 'despesa';
        const isVariableCost = descriptionUpperCase && variableCostKeywords.some(keyword => descriptionUpperCase.includes(keyword)) && lancamento.tipo === 'despesa';

        if (lancamento.tipo === "receita") {
          if (isCurrentMonth) netIncomes += amount;
          if (isPreviousMonth) previousNetIncomes += amount;
        } else { // Non-revenue
          if (isCMV) {
            if (isCurrentMonth) {
              totalCMV += amount;
              const subcategoryName = lancamento.subcategorias?.nome || "CMV Não Categorizado";
              cmvBySubcategory[subcategoryName] = (cmvBySubcategory[subcategoryName] || 0) + amount;
            }
            if (isPreviousMonth) previousTotalCMV += amount;
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
            if (isPreviousMonth) previousOperatingExpenses += amount;
          }
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

      const colorPalette = [
        "hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--destructive))",
        "#FFA500", "#800080", "#FFD700", "#000000", "#808080"
      ];

      setDiscretizedCMVChartData(Object.keys(cmvBySubcategory).map(name => ({
        name, value: cmvBySubcategory[name], color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      })));
      setFixedExpensesChartData(Object.keys(fixedExpensesBySubcategory).map(name => ({
        name, value: fixedExpensesBySubcategory[name], color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      })));
      setVariableExpensesChartData(Object.keys(variableExpensesBySubcategory).map(name => ({
        name, value: variableExpensesBySubcategory[name], color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      })));

    } catch (error: any) {
      console.error("Error fetching card and pie data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendsAndTransactionsData = async () => {
    try {
      const empresaId = empresa?.id || user?.empresa_id;
      if (!empresaId) throw new Error("Empresa não encontrada");

      const today = new Date();
      const sixMonthsAgo = startOfMonth(subMonths(today, 5)); // 5 months ago to include current month
      const currentMonthEnd = endOfMonth(today);

      const { data: lancamentos, error } = await supabase
        .from("lancamentos")
        .select("*, subcategorias(*, categorias(*))")
        .eq("empresa_id", empresaId)
        .gte("data_referencia", format(sixMonthsAgo, "yyyy-MM-dd"))
        .lte("data_referencia", format(currentMonthEnd, "yyyy-MM-dd"));

      if (error) throw error;

      const allLancamentos = (lancamentos || []).map((item: any) => ({
        ...item,
        tipo: item.subcategorias?.categorias?.natureza || 'despesa',
      }));

  const trendDataMap: { [key: string]: { income: number; cmv: number; expenses: number } } = {};
  const trendServicesDataMap: { [key: string]: { income: number; trendOperatingExpenses: number } } = {};
  const atividade = (empresa as any)?.atividade || undefined;
      
      const fixedCostKeywords = ['DESPESAS FIXAS', 'DESPESA FIXA', 'CUSTOS FIXOS', 'CUSTO FIXO'];
      const variableCostKeywords = [
        'DESPESAS VARIAVEIS', 'DESPESAS VARIÁVEIS', 'DESPESA VARIAVEL', 'DESPESA VARIÁVEL',
        'CUSTOS VARIAVEIS', 'CUSTOS VARIÁVEIS', 'CUSTO VARIAVEL', 'CUSTO VARIÁVEL'
      ];
      const cmvKeywords = [
        'CMV', 'CUSTO DE MERCADORIA VENDIDA', 'CUSTOS DE MERCADORIA VENDIDA',
        'CUSTO POR MERCADORIA VENDIDA', 'CUSTOS POR MERCADORIA VENDIDA'
      ];

      allLancamentos.forEach((lancamento: any) => {
        const amount = parseFloat(lancamento.valor);
        const monthKey = format(new Date(lancamento.data_referencia.replace(/-/g, '/')), "MMM");
        
        if (!trendDataMap[monthKey]) {
          trendDataMap[monthKey] = { income: 0, cmv: 0, expenses: 0 };
        }
        if (!trendServicesDataMap[monthKey]) {
          trendServicesDataMap[monthKey] = { income: 0, trendOperatingExpenses: 0 };
        }

        const descriptionUpperCase = lancamento.subcategorias?.categorias?.descricao?.toUpperCase();
        const isCMV = descriptionUpperCase && cmvKeywords.some(keyword => descriptionUpperCase.includes(keyword)) && lancamento.tipo === 'despesa';

        if (lancamento.tipo === "receita") {
          if (atividade === 'varejo') {
            trendDataMap[monthKey].income += amount;
          }
          if (atividade === 'servico') {
            trendServicesDataMap[monthKey].income += amount;
          }
        } else { // Non-revenue
          if (isCMV) {
            if (atividade === 'varejo') trendDataMap[monthKey].cmv += amount;
          } else { // Operating Expense
            if (atividade === 'varejo') trendDataMap[monthKey].expenses += amount;
            if (atividade === 'servico') trendServicesDataMap[monthKey].trendOperatingExpenses += amount;
          }
        }
      });

      if (atividade === 'varejo') {
        setTrendChartData(Object.keys(trendDataMap).map(month => ({
          month,
          income: trendDataMap[month].income,
          cmv: trendDataMap[month].cmv,
          despesasOperacionais: trendDataMap[month].expenses,
        })).sort((a, b) => new Date(`1 ${a.month} 2000`).getTime() - new Date(`1 ${b.month} 2000`).getTime()));
        // clear services chart data
        setTrendChartServicesData([]);
      } else if (atividade === 'servico') {
        setTrendChartServicesData(Object.keys(trendServicesDataMap).map(month => ({
          month,
          income: trendServicesDataMap[month].income,
          trendOperatingExpenses: trendServicesDataMap[month].trendOperatingExpenses,
        })).sort((a, b) => new Date(`1 ${a.month} 2000`).getTime() - new Date(`1 ${b.month} 2000`).getTime()));
        // clear varejo chart data
        setTrendChartData([]);
      } else {
        // If atividade not defined, clear both
        setTrendChartData([]);
        setTrendChartServicesData([]);
      }

      const currentMonthStartForTransactions = format(startOfMonth(today), "yyyy-MM-dd");
      setTransactions(allLancamentos
        .filter((lancamento: any) => lancamento.data_referencia >= currentMonthStartForTransactions)
        .map((lancamento: any) => ({
          id: lancamento.id,
          description: lancamento.descricao,
          // Show parent category (categorias.descricao) if available, otherwise fallback to subcategory name
          category: lancamento.subcategorias?.categorias?.descricao || lancamento.subcategorias?.nome || "N/A",
          amount: parseFloat(lancamento.valor),
          date: format(new Date(lancamento.data_referencia.replace(/-/g, '/')), "dd/MM/yyyy"),
          type: (lancamento.tipo === "receita" ? "income" : "expense") as "income" | "expense",
        }))
        .slice(0, 4)
      );

    } catch (error: any) {
      console.error("Error fetching trend and transaction data:", error.message);
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
    let diffSign = "";
    if (diff > 0) {
      diffSign = "+";
    }
    return `${diff < 0 ? "" : diffSign}${formatCurrency(diff)} (${diff < 0 ? "" : diffSign}${diff === 0 ? 0 : percentage.toFixed(2)}%)`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Carregando dashboard...</div>
      </div>
    );
  }

  const atividade = (empresa as any)?.atividade;
  const gridColsClass = atividade === 'varejo' ? 'lg:grid-cols-5' : 'lg:grid-cols-4';

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <MonthYearPicker date={selectedDate} setDate={setSelectedDate} />
      </div>
      {/* Metrics Grid */}
      <div className={`grid gap-6 md:grid-cols-2 ${gridColsClass}`}>
        <MetricCard
          title="Receita Líquida"
          value={formatCurrency(metrics.netIncomes)}
          change={getChangeValue(metrics.netIncomes, metrics.previousNetIncomes)}
          changeType={getChangeType(metrics.netIncomes, metrics.previousNetIncomes)}
          icon={DollarSign}
          variant="default"
        />

        {atividade === 'varejo' && (
          <MetricCard
            title="CMV Total"
            value={formatCurrency(metrics.totalCMV)}
            change={getChangeValue(metrics.totalCMV, metrics.previousTotalCMV)}
            changeType={getExpenseChangeType(metrics.totalCMV, metrics.previousTotalCMV)}
            icon={ShoppingCart}
            variant="destructive"
          />
        )}

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
          {((empresa as any)?.atividade === 'varejo') && <TrendChart data={trendChartData} />}
          {((empresa as any)?.atividade === 'servico') && <TrendChartServices data={trendChartServicesData} />}
        </div>
      </div>

      {/* Transactions Table */}
      <TransactionsList transactions={transactions} />
    </div>
  );
};

export default Dashboard;