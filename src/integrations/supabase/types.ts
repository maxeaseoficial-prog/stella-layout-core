export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      adicionais: {
        Row: {
          created_at: string
          data: Json
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "adicionais_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      arquivos: {
        Row: {
          created_at: string
          data: Json
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "arquivos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      caixa_fechamentos: {
        Row: {
          created_at: string
          data: Json
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "caixa_fechamentos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      caixa_movimentacoes: {
        Row: {
          created_at: string
          data: Json
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "caixa_movimentacoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias: {
        Row: {
          created_at: string
          data: Json
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_fiscais: {
        Row: {
          atualizado_em: string | null
          codigo: string | null
          criado_em: string | null
          descricao_oficial: string | null
          id: string
          natureza_receita: string | null
          ncm: string
          nome_amigavel: string
          rec_cofins: string | null
          rec_pis: string | null
          situacao: string | null
          tenant_id: string | null
          tipo_contribuicao: string | null
          unidade_comercial: string | null
          unidade_tributavel: string | null
          vigencia: string | null
        }
        Insert: {
          atualizado_em?: string | null
          codigo?: string | null
          criado_em?: string | null
          descricao_oficial?: string | null
          id?: string
          natureza_receita?: string | null
          ncm: string
          nome_amigavel: string
          rec_cofins?: string | null
          rec_pis?: string | null
          situacao?: string | null
          tenant_id?: string | null
          tipo_contribuicao?: string | null
          unidade_comercial?: string | null
          unidade_tributavel?: string | null
          vigencia?: string | null
        }
        Update: {
          atualizado_em?: string | null
          codigo?: string | null
          criado_em?: string | null
          descricao_oficial?: string | null
          id?: string
          natureza_receita?: string | null
          ncm?: string
          nome_amigavel?: string
          rec_cofins?: string | null
          rec_pis?: string | null
          situacao?: string | null
          tenant_id?: string | null
          tipo_contribuicao?: string | null
          unidade_comercial?: string | null
          unidade_tributavel?: string | null
          vigencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categorias_fiscais_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string
          data: Json
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes: {
        Row: {
          created_at: string
          data: Json
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_fiscais: {
        Row: {
          created_at: string
          data: Json
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      empresa_usuarios: {
        Row: {
          criado_em: string
          empresa_id: string
          id: string
          papel: Database["public"]["Enums"]["app_role"]
          permissoes: Json | null
          user_id: string
        }
        Insert: {
          criado_em?: string
          empresa_id: string
          id?: string
          papel: Database["public"]["Enums"]["app_role"]
          permissoes?: Json | null
          user_id: string
        }
        Update: {
          criado_em?: string
          empresa_id?: string
          id?: string
          papel?: Database["public"]["Enums"]["app_role"]
          permissoes?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "empresa_usuarios_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          criado_em: string
          id: string
          nome: string
        }
        Insert: {
          criado_em?: string
          id?: string
          nome: string
        }
        Update: {
          criado_em?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      fiscal_ncm: {
        Row: {
          ano: number | null
          ato_legal: string | null
          codigo: string
          criado_em: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string
          id: string
          situacao: string | null
        }
        Insert: {
          ano?: number | null
          ato_legal?: string | null
          codigo: string
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao: string
          id?: string
          situacao?: string | null
        }
        Update: {
          ano?: number | null
          ato_legal?: string | null
          codigo?: string
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string
          id?: string
          situacao?: string | null
        }
        Relationships: []
      }
      fornecedores: {
        Row: {
          created_at: string
          data: Json
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fornecedores_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_estoque: {
        Row: {
          created_at: string
          data: Json
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_estoque_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes_estoque: {
        Row: {
          created_at: string
          data: Json
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_estoque_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_fiscais: {
        Row: {
          ambiente: string
          chave_acesso: string | null
          cliente_id: string | null
          created_at: string
          data_autorizacao: string | null
          data_emissao: string | null
          external_id: string | null
          id: string
          mensagem_sefaz: string | null
          numero: number | null
          payload_envio: Json | null
          pedido_id: string | null
          protocolo: string | null
          resumo_destinatario: Json | null
          serie: string | null
          spedy_id: string
          status: string
          tenant_id: string
          tipo_emissao: string
          updated_at: string
          valor_total: number | null
        }
        Insert: {
          ambiente: string
          chave_acesso?: string | null
          cliente_id?: string | null
          created_at?: string
          data_autorizacao?: string | null
          data_emissao?: string | null
          external_id?: string | null
          id?: string
          mensagem_sefaz?: string | null
          numero?: number | null
          payload_envio?: Json | null
          pedido_id?: string | null
          protocolo?: string | null
          resumo_destinatario?: Json | null
          serie?: string | null
          spedy_id: string
          status: string
          tenant_id: string
          tipo_emissao: string
          updated_at?: string
          valor_total?: number | null
        }
        Update: {
          ambiente?: string
          chave_acesso?: string | null
          cliente_id?: string | null
          created_at?: string
          data_autorizacao?: string | null
          data_emissao?: string | null
          external_id?: string | null
          id?: string
          mensagem_sefaz?: string | null
          numero?: number | null
          payload_envio?: Json | null
          pedido_id?: string | null
          protocolo?: string | null
          resumo_destinatario?: Json | null
          serie?: string | null
          spedy_id?: string
          status?: string
          tenant_id?: string
          tipo_emissao?: string
          updated_at?: string
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notas_fiscais_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          created_at: string
          data: Json
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      precificacao_historico: {
        Row: {
          created_at: string
          data: Json
          id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: Json
          id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "precificacao_historico_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          categoria_fiscal_id: string | null
          created_at: string
          data: Json
          descricao_fiscal: string | null
          id: string
          ncm_oficial: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          categoria_fiscal_id?: string | null
          created_at?: string
          data: Json
          descricao_fiscal?: string | null
          id: string
          ncm_oficial?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          categoria_fiscal_id?: string | null
          created_at?: string
          data?: Json
          descricao_fiscal?: string | null
          id?: string
          ncm_oficial?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_fiscal_id_fkey"
            columns: ["categoria_fiscal_id"]
            isOneToOne: false
            referencedRelation: "categorias_fiscais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      segredos_fiscais: {
        Row: {
          chave_api: string
          chave_api_producao: string | null
          chave_api_sandbox: string | null
          id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          chave_api: string
          chave_api_producao?: string | null
          chave_api_sandbox?: string | null
          id?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          chave_api?: string
          chave_api_producao?: string | null
          chave_api_sandbox?: string | null
          id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "segredos_fiscais_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas: {
        Row: {
          concluida: boolean
          concluida_em: string | null
          created_at: string
          descricao: string | null
          id: string
          itens: Json
          prioridade: string
          tipo: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          concluida?: boolean
          concluida_em?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          itens?: Json
          prioridade?: string
          tipo?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          concluida?: boolean
          concluida_em?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          itens?: Json
          prioridade?: string
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      empresa_do_usuario: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      papel_do_usuario: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "administrador" | "operador_matriz" | "caixa"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["administrador", "operador_matriz", "caixa"],
    },
  },
} as const
