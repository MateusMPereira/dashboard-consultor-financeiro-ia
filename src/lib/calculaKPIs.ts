import { Lancamento } from "@/integrations/supabase/types";

interface KPIsFinanceiros {
  receitaLiquida: number;
  despesasTotais: number;
  receitasMes: number;
  despesasMes: number;
  margemContribuicao: number;
  saldoTotal: number;
  custoFixo: number;
  custoVariavel: number;
  custoOperacional: number;
  margemEBITDA: number;
}

export const calculaKPIs = (lancamentos: Lancamento[]): KPIsFinanceiros => {
  const hoje = new Date();
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  // Filtra lançamentos do mês atual
  const lancamentosMes = lancamentos.filter(l => {
    const data = new Date(l.data_referencia);
    return data >= inicioMes && data <= fimMes;
  });

  // Calcula receitas e despesas totais
  const receitas = lancamentos.filter(l => l.tipo === "receita" && l.status === "pago");
  const despesas = lancamentos.filter(l => l.tipo === "despesa" && l.status === "pago");
  const receitasMesAtual = lancamentosMes.filter(l => l.tipo === "receita" && l.status === "pago");
  const despesasMesAtual = lancamentosMes.filter(l => l.tipo === "despesa" && l.status === "pago");

  const somaValores = (items: Lancamento[]) => 
    items.reduce((sum, l) => sum + Number(l.valor_liquido || l.valor), 0);

  const receitaLiquida = somaValores(receitas);
  const despesasTotais = somaValores(despesas);
  const receitasMes = somaValores(receitasMesAtual);
  const despesasMes = somaValores(despesasMesAtual);

  // Calcula custos por classificação
  const custosFixos = despesas.filter(l => l.classificacao === "fixa");
  const custosVariaveis = despesas.filter(l => l.classificacao === "variavel");
  const custosOperacionais = despesas.filter(l => l.natureza === "operacional");

  const custoFixo = somaValores(custosFixos);
  const custoVariavel = somaValores(custosVariaveis);
  const custoOperacional = somaValores(custosOperacionais);

  // Calcula margens
  const margemContribuicao = receitaLiquida ? ((receitaLiquida - custoVariavel) / receitaLiquida) * 100 : 0;
  const margemEBITDA = receitaLiquida ? ((receitaLiquida - custoOperacional) / receitaLiquida) * 100 : 0;
  const saldoTotal = receitaLiquida - despesasTotais;

  return {
    receitaLiquida,
    despesasTotais,
    receitasMes,
    despesasMes,
    margemContribuicao,
    saldoTotal,
    custoFixo,
    custoVariavel,
    custoOperacional,
    margemEBITDA,
  };
};