export type TipoLancamento = "receita" | "despesa"
export type NaturezaLancamento = "operacional" | "financeira" | "investimento"
export type ClassificacaoLancamento = "fixa" | "variavel"
export type StatusLancamento = "pendente" | "pago" | "atrasado" | "cancelado"

export interface Lancamento {
  id: string
  usuario_id: string | null
  empresa_id: string
  categoria_id: string | null
  fornecedor_id: string | null
  tipo: TipoLancamento
  natureza: NaturezaLancamento | null
  classificacao: ClassificacaoLancamento | null
  descricao: string | null
  valor: number
  valor_liquido: number | null
  impostos: number | null
  data_referencia: string
  data_vencimento: string | null
  data_pagamento: string | null
  status: StatusLancamento
  forma_pagamento: string | null
  parcelas: number | null
  parcela_atual: number | null
  origem: string | null
  criado_por: string | null
  created_at: string
  updated_at: string | null
  categorias?: {
    nome: string
  } | null
  fornecedores?: {
    nome: string
  } | null
}