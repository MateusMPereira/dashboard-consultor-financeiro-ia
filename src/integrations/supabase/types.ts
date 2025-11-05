export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TipoLancamento = "receita" | "despesa"
export type NaturezaLancamento = "operacional" | "financeira" | "investimento"

export interface Lancamento {
  id: string
  empresa_id: string
  categoria_id: string | null
  fornecedor_id: string | null
  tipo: TipoLancamento
  natureza: NaturezaLancamento | null
  descricao: string | null
  valor: number
  valor_liquido: number | null
  custo: number
  impostos: number | null
  data_referencia: string
  created_at: string
  updated_at: string | null
  categorias?: {
    nome: string
  } | null
  fornecedores?: {
    nome: string
  } | null
}

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  auth: {
    Tables: {
      users: {
        Row: {
          id: string
          email?: string | null
          phone?: string | null
        }
      }
    }
  }
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string
          nome: string
          cnpj: string | null
          telefone: string | null
          email: string | null
          whatsapp_numero: string | null
          ativo: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          nome: string
          cnpj?: string | null
          telefone?: string | null
          email?: string | null
          whatsapp_numero?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          nome?: string
          cnpj?: string | null
          telefone?: string | null
          email?: string | null
          whatsapp_numero?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          id: string
          nome: string
          empresa_id: string
          auth_id: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          nome: string
          empresa_id: string
          auth_id: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          nome: string
          empresa_id?: string
          auth_id?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usuarios_users_id_fkey"
            columns: ["auth_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          }
        ]
      }
      categorias: {
        Row: {
          id: string
          usuario_id: string | null
          empresa_id: string
          nome: string
          descricao: string | null
          ativo: boolean
          natureza_id: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          usuario_id?: string | null
          empresa_id: string
          nome: string
          descricao?: string | null
          ativo?: boolean
          natureza_id: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          usuario_id?: string | null
          empresa_id?: string
          nome?: string
          descricao?: string | null
          ativo?: boolean
          natureza_id?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categorias_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categorias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categorias_natureza_id_fkey"
            columns: ["natureza_id"]
            isOneToOne: false
            referencedRelation: "naturezas"
            referencedColumns: ["id"]
          }
        ]
      }
      fornecedores: {
        Row: {
          id: string
          usuario_id: string | null
          empresa_id: string
          nome: string
          cnpj: string | null
          contato: string | null
          email: string | null
          telefone: string | null
          endereco: string | null
          cidade: string | null
          uf: string | null
          categoria: string | null
          observacoes: string | null
          ativo: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          usuario_id?: string | null
          empresa_id: string
          nome: string
          cnpj?: string | null
          contato?: string | null
          email?: string | null
          telefone?: string | null
          endereco?: string | null
          cidade?: string | null
          uf?: string | null
          categoria?: string | null
          observacoes?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          usuario_id?: string | null
          empresa_id?: string
          nome?: string
          cnpj?: string | null
          contato?: string | null
          email?: string | null
          telefone?: string | null
          endereco?: string | null
          cidade?: string | null
          uf?: string | null
          categoria?: string | null
          observacoes?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fornecedores_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fornecedores_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          }
        ]
      }
      lancamentos: {
        Row: {
          id: string
          empresa_id: string
          categoria_id: string | null
          fornecedor_id: string | null
          descricao: string | null
          valor: number
          data_referencia: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          categoria_id?: string | null
          fornecedor_id?: string | null
          descricao?: string | null
          valor: number
          data_referencia: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          empresa_id?: string
          categoria_id?: string | null
          fornecedor_id?: string | null
          descricao?: string | null
          valor?: number
          data_referencia?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          }
        ]
      }
      mensagens_whatsapp: {
        Row: {
          id: string
          empresa_id: string
          contato: string
          mensagem: string
          tipo: string
          direcao: string
          lancamento_id: string | null
          processada: boolean
          data_envio: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          contato: string
          mensagem: string
          tipo: string
          direcao: string
          lancamento_id?: string | null
          processada?: boolean
          data_envio?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          empresa_id?: string
          contato?: string
          mensagem?: string
          tipo?: string
          direcao?: string
          lancamento_id?: string | null
          processada?: boolean
          data_envio?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_whatsapp_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_whatsapp_lancamento_id_fkey"
            columns: ["lancamento_id"]
            isOneToOne: false
            referencedRelation: "lancamentos"
            referencedColumns: ["id"]
          }
        ]
      }
      arquivos: {
        Row: {
          id: string
          empresa_id: string
          mensagem_id: string | null
          tipo: string | null
          url: string
          nome_original: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          mensagem_id?: string | null
          tipo?: string | null
          url: string
          nome_original?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          empresa_id?: string
          mensagem_id?: string | null
          tipo?: string | null
          url?: string
          nome_original?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "arquivos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "arquivos_mensagem_id_fkey"
            columns: ["mensagem_id"]
            isOneToOne: false
            referencedRelation: "mensagens_whatsapp"
            referencedColumns: ["id"]
          }
        ]
      }
      kpis_financeiros: {
        Row: {
          id: string
          empresa_id: string
          periodo_inicio: string
          periodo_fim: string
          receita_liquida: number | null
          cmv: number | null
          custo_pessoal: number | null
          custo_fixo: number | null
          margem_contribuicao: number | null
          ebitda: number | null
          ebitda_percent: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          periodo_inicio: string
          periodo_fim: string
          receita_liquida?: number | null
          cmv?: number | null
          custo_pessoal?: number | null
          custo_fixo?: number | null
          margem_contribuicao?: number | null
          ebitda?: number | null
          ebitda_percent?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          empresa_id?: string
          periodo_inicio?: string
          periodo_fim?: string
          receita_liquida?: number | null
          cmv?: number | null
          custo_pessoal?: number | null
          custo_fixo?: number | null
          margem_contribuicao?: number | null
          ebitda?: number | null
          ebitda_percent?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpis_financeiros_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          }
        ]
      }
      alertas: {
        Row: {
          id: string
          empresa_id: string
          titulo: string
          tipo: string | null
          impacto: number | null
          descricao: string | null
          status: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          titulo: string
          tipo?: string | null
          impacto?: number | null
          descricao?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          empresa_id?: string
          titulo?: string
          tipo?: string | null
          impacto?: number | null
          descricao?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alertas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          }
        ]
      }
      insights: {
        Row: {
          id: string
          empresa_id: string
          alerta_id: string | null
          hipotese: string | null
          acao_recomendada: string | null
          status: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          alerta_id?: string | null
          hipotese?: string | null
          acao_recomendada?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          empresa_id?: string
          alerta_id?: string | null
          hipotese?: string | null
          acao_recomendada?: string | null
          status?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insights_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insights_alerta_id_fkey"
            columns: ["alerta_id"]
            isOneToOne: false
            referencedRelation: "alertas"
            referencedColumns: ["id"]
          }
        ]
      }
      metas: {
        Row: {
          id: string
          empresa_id: string
          tipo: string
          valor_alvo: number
          periodo: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          tipo: string
          valor_alvo: number
          periodo: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          empresa_id?: string
          tipo?: string
          valor_alvo?: number
          periodo?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          }
        ]
      }
      log_ia: {
        Row: {
          id: string
          empresa_id: string
          mensagem_id: string | null
          acao: string | null
          resultado: string | null
          sucesso: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          empresa_id: string
          mensagem_id?: string | null
          acao?: string | null
          resultado?: string | null
          sucesso?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          empresa_id?: string
          mensagem_id?: string | null
          acao?: string | null
          resultado?: string | null
          sucesso?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "log_ia_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "log_ia_mensagem_id_fkey"
            columns: ["mensagem_id"]
            isOneToOne: false
            referencedRelation: "mensagens_whatsapp"
            referencedColumns: ["id"]
          }
        ]
      },
      naturezas: {
        Row: {
          id: string
          descricao: string | null
          tipo: "receita" | "despesa" | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          descricao?: string | null
          tipo?: "receita" | "despesa" | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          descricao?: string | null
          tipo?: "receita" | "despesa" | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

// Auth schema types
export type AuthSchema = DatabaseWithoutInternals[Extract<keyof Database, "auth">]
export type AuthUser = Database["auth"]["Tables"]["users"]["Row"]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums = Record<string, never>
export type CompositeTypes = Record<string, never>

export const Constants = {
  public: {
    Enums: {},
  },
} as const
