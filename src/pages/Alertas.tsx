import { AlertsList } from "@/components/dashboard/AlertsList";

const Alertas = () => {
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
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Alertas & Insights</h2>
        <p className="text-muted-foreground">
          Análise inteligente dos seus indicadores financeiros com sugestões de ação
        </p>
      </div>
      <AlertsList alerts={alerts} />
    </div>
  );
};

export default Alertas;
