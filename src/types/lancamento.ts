export type TipoLancamento = "receita" | "despesa"
export type NaturezaLancamento = "operacional" | "financeira" | "investimento"

export interface Lancamento {
  id: string
  usuario_id: string | null
  empresa_id: string
  categoria_id: string | null
  fornecedor_id: string | null
  tipo: TipoLancamento
  natureza: NaturezaLancamento | null
  descricao: string | null
  valor: number
  valor_liquido: number | null
  custo: number | null
  impostos: number | null
  data_referencia: string
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