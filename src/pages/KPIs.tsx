import { KPICard } from "@/components/dashboard/KPICard";

const KPIs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">KPIs Financeiros Detalhados</h2>
        <p className="text-muted-foreground">
          Indicadores essenciais para tomada de decisão estratégica
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <KPICard
          label="Receita Líquida"
          value="R$ 100.000,00"
          percentage="Total"
          trend="up"
          variant="success"
        />
        <KPICard
          label="Despesas Totais"
          value="R$ 65.000,00"
          percentage="Total"
          trend="down"
          variant="warning"
        />
        <KPICard
          label="Receitas do Mês"
          value="R$ 6.200,00"
          percentage="Mês atual"
          variant="default"
        />
        <KPICard
          label="Despesas do Mês"
          value="R$ 2.400,00"
          percentage="Mês atual"
          trend="down"
          variant="default"
        />
        <KPICard
          label="Margem de Contribuição"
          value="59,2%"
          percentage="Sobre receita"
          trend="up"
          variant="success"
        />
        <KPICard
          label="Saldo Total"
          value="R$ 35.000,00"
          percentage="Positivo"
          trend="up"
          variant="success"
        />
      </div>
    </div>
  );
};

export default KPIs;
