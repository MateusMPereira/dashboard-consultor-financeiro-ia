import { Wallet, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { ExpensesChart } from "@/components/dashboard/ExpensesChart";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { AlertsList } from "@/components/dashboard/AlertsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  // Mock data - TODO: Substituir por dados reais do Supabase
  const transactions = [
    { id: "1", description: "Salário", category: "Receita", amount: 5000, date: "01/01/2025", type: "income" as const },
    { id: "2", description: "Supermercado", category: "Alimentação", amount: -450, date: "03/01/2025", type: "expense" as const },
    { id: "3", description: "Aluguel", category: "Moradia", amount: -1500, date: "05/01/2025", type: "expense" as const },
    { id: "4", description: "Freelance", category: "Receita", amount: 1200, date: "07/01/2025", type: "income" as const },
    { id: "5", description: "Academia", category: "Saúde", amount: -150, date: "10/01/2025", type: "expense" as const },
    { id: "6", description: "Combustível", category: "Transporte", amount: -300, date: "12/01/2025", type: "expense" as const },
  ];

  const expensesData = [
    { name: "Moradia", value: 1500, color: "hsl(221 83% 53%)" },
    { name: "Alimentação", value: 450, color: "hsl(142 76% 36%)" },
    { name: "Transporte", value: 300, color: "hsl(38 92% 50%)" },
    { name: "Saúde", value: 150, color: "hsl(0 84% 60%)" },
  ];

  const trendData = [
    { month: "Set", income: 5000, expenses: 3200 },
    { month: "Out", income: 5200, expenses: 3400 },
    { month: "Nov", income: 5000, expenses: 3100 },
    { month: "Dez", income: 6000, expenses: 4200 },
    { month: "Jan", income: 6200, expenses: 2400 },
  ];

  // Mock alerts - TODO: Buscar do Supabase
  const alerts = [
    {
      id: "1",
      titulo: "CMV acima da média histórica",
      tipo: "CMV Alto",
      impacto: 5.2,
      descricao: "O Custo de Mercadoria Vendida está 5,2% acima da média dos últimos 6 meses",
      status: "pendente" as const,
      data_alerta: "2024-12-14",
      hipoteses: [
        "Aumento no preço dos fornecedores de carne",
        "Possível desperdício na cozinha",
        "Mudança no mix de produtos vendidos"
      ],
      acoes: [
        "Revisar contratos com fornecedores",
        "Auditar processo de produção",
        "Analisar perdas e desperdícios",
        "Considerar ajuste de preços"
      ]
    },
    {
      id: "2",
      titulo: "EBITDA abaixo da meta",
      tipo: "EBITDA Baixo",
      impacto: 3.8,
      descricao: "O EBITDA está 3,8% abaixo da meta estabelecida para o período",
      status: "em_analise" as const,
      data_alerta: "2024-12-10",
      hipoteses: [
        "Aumento de custos fixos não planejados",
        "Queda na receita operacional"
      ],
      acoes: [
        "Revisar estrutura de custos",
        "Identificar oportunidades de redução de despesas",
        "Avaliar estratégias de aumento de receita"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                FinanceHub
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Controle total das suas finanças</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="alertas">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Alertas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Saldo Total"
                value="R$ 8.750,00"
                change="+12% este mês"
                changeType="positive"
                icon={Wallet}
                variant="default"
              />
              <MetricCard
                title="Receitas"
                value="R$ 6.200,00"
                change="+3.3% este mês"
                changeType="positive"
                icon={TrendingUp}
                variant="success"
              />
              <MetricCard
                title="Despesas"
                value="R$ 2.400,00"
                change="-42% este mês"
                changeType="positive"
                icon={TrendingDown}
                variant="destructive"
              />
              <MetricCard
                title="Economia"
                value="R$ 3.800,00"
                change="+61% este mês"
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
          </TabsContent>

          <TabsContent value="alertas">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Alertas & Insights</h2>
                <p className="text-muted-foreground">
                  Análise inteligente dos seus indicadores financeiros com sugestões de ação
                </p>
              </div>
              <AlertsList alerts={alerts} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
