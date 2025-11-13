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
  fonte?: string
  subcategorias?: {
    id?: string
    nome: string
    categoria_id?: string
    categorias: {
      id?: string
      descricao: string
      natureza: "receita" | "despesa" | null
    } | null
  } | null
  tipo?: "receita" | "despesa" | null
}