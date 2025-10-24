import { KPICard } from "@/components/dashboard/KPICard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Lancamento } from "@/types/lancamento";
import { calculaKPIs } from "@/lib/calculaKPIs";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const KPIs = () => {
  const { user } = useAuth();
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLancamentos();
  }, []);

  const fetchLancamentos = async () => {
    try {
      if (!user?.empresa_id) throw new Error("Empresa não encontrada");

      const { data: rawData, error } = await supabase
        .from("lancamentos")
        .select("*, categorias(nome), fornecedores(nome)")
        .eq("empresa_id", user.empresa_id);

      if (error) throw error;

      const lancamentosData: Lancamento[] = (rawData || []).map(item => {
        const tipedItem = item as any;
        return {
          id: tipedItem.id,
          usuario_id: tipedItem.usuario_id,
          empresa_id: tipedItem.empresa_id,
          categoria_id: tipedItem.categoria_id,
          fornecedor_id: tipedItem.fornecedor_id,
          tipo: (tipedItem.tipo || "despesa") as "receita" | "despesa",
          natureza: tipedItem.natureza as "operacional" | "financeira" | "investimento" | null || null,
          classificacao: tipedItem.classificacao as "fixa" | "variavel" | null || null,
          descricao: tipedItem.descricao,
          valor: Number(tipedItem.valor),
          valor_liquido: tipedItem.valor_liquido ? Number(tipedItem.valor_liquido) : null,
          impostos: tipedItem.impostos ? Number(tipedItem.impostos) : null,
          data_referencia: tipedItem.data_referencia,
          data_vencimento: tipedItem.data_vencimento || null,
          data_pagamento: tipedItem.data_pagamento || null,
          status: (tipedItem.status || "pendente") as "pendente" | "pago" | "atrasado" | "cancelado",
          forma_pagamento: tipedItem.forma_pagamento || null,
          parcelas: tipedItem.parcelas ? Number(tipedItem.parcelas) : null,
          parcela_atual: tipedItem.parcela_atual ? Number(tipedItem.parcela_atual) : null,
          origem: tipedItem.origem,
          criado_por: tipedItem.criado_por,
          created_at: tipedItem.created_at,
          updated_at: tipedItem.updated_at,
          categorias: tipedItem.categorias,
          fornecedores: tipedItem.fornecedores
        };
      });

      setLancamentos(lancamentosData);
    } catch (error: any) {
      toast.error("Erro ao carregar lançamentos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const kpis = calculaKPIs(lancamentos);

  const formatMoney = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return value.toFixed(1) + "%";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">KPIs Financeiros Detalhados</h2>
        <p className="text-muted-foreground">
          Indicadores essenciais para tomada de decisão estratégica
        </p>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <KPICard
            label="Receita Líquida"
            value={formatMoney(kpis.receitaLiquida)}
            percentage="Total"
            trend="up"
            variant="success"
          />
          <KPICard
            label="Despesas Totais"
            value={formatMoney(kpis.despesasTotais)}
            percentage="Total"
            trend="down"
            variant="warning"
          />
          <KPICard
            label="Receitas do Mês"
            value={formatMoney(kpis.receitasMes)}
            percentage="Mês atual"
            variant="default"
          />
          <KPICard
            label="Despesas do Mês"
            value={formatMoney(kpis.despesasMes)}
            percentage="Mês atual"
            trend="down"
            variant="default"
          />
          <KPICard
            label="Margem de Contribuição"
            value={formatPercent(kpis.margemContribuicao)}
            percentage="Sobre receita"
            trend={kpis.margemContribuicao >= 40 ? "up" : "down"}
            variant={kpis.margemContribuicao >= 40 ? "success" : "warning"}
          />
          <KPICard
            label="Saldo Total"
            value={formatMoney(kpis.saldoTotal)}
            percentage={kpis.saldoTotal >= 0 ? "Positivo" : "Negativo"}
            trend={kpis.saldoTotal >= 0 ? "up" : "down"}
            variant={kpis.saldoTotal >= 0 ? "success" : "destructive"}
          />
          <KPICard
            label="Custos Fixos"
            value={formatMoney(kpis.custoFixo)}
            percentage="Do total"
            variant="default"
          />
          <KPICard
            label="Custos Variáveis"
            value={formatMoney(kpis.custoVariavel)}
            percentage="Do total"
            variant="default"
          />
          <KPICard
            label="Margem EBITDA"
            value={formatPercent(kpis.margemEBITDA)}
            percentage="Sobre receita"
            trend={kpis.margemEBITDA >= 15 ? "up" : "down"}
            variant={kpis.margemEBITDA >= 15 ? "success" : "warning"}
          />
        </div>
      )}
    </div>
  );
};

export default KPIs;
