export type TipoLancamento = "receita" | "despesa"
export type NaturezaLancamento = "operacional" | "financeira" | "investimento"

export interface Lancamento {
  id: string
  empresa_id: string
  sub_categoria_id: string | null
  descricao: string | null
  valor: number
  data_referencia: string
  created_at: string
  updated_at: string | null
  subcategorias?: {
    nome: string
    categorias: {
      natureza: "receita" | "despesa" | null
    } | null
  } | null
  tipo?: "receita" | "despesa" | null
}