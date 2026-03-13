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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      canais: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      categorias: {
        Row: {
          cor: string
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          cor: string
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          cor?: string
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      comunicacao_canais: {
        Row: {
          canal_id: string
          comunicacao_id: string
          created_at: string
          id: string
        }
        Insert: {
          canal_id: string
          comunicacao_id: string
          created_at?: string
          id?: string
        }
        Update: {
          canal_id?: string
          comunicacao_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunicacao_canais_canal_id_fkey"
            columns: ["canal_id"]
            isOneToOne: false
            referencedRelation: "canais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunicacao_canais_comunicacao_id_fkey"
            columns: ["comunicacao_id"]
            isOneToOne: false
            referencedRelation: "comunicacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      comunicacao_personas: {
        Row: {
          comunicacao_id: string
          created_at: string
          id: string
          persona_id: string
        }
        Insert: {
          comunicacao_id: string
          created_at?: string
          id?: string
          persona_id: string
        }
        Update: {
          comunicacao_id?: string
          created_at?: string
          id?: string
          persona_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunicacao_personas_comunicacao_id_fkey"
            columns: ["comunicacao_id"]
            isOneToOne: false
            referencedRelation: "comunicacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunicacao_personas_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "personas"
            referencedColumns: ["id"]
          },
        ]
      }
      comunicacoes: {
        Row: {
          ativo: boolean
          categoria_id: string
          created_at: string
          data_fim: string | null
          data_inicio: string
          id: string
          instituicao_id: string
          modalidades: string[]
          nome_acao: string
          pessoa_id: string
          repiques: string[]
          safras: string[]
          tipo_disparo: Database["public"]["Enums"]["tipo_disparo_enum"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          categoria_id: string
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          id?: string
          instituicao_id: string
          modalidades?: string[]
          nome_acao: string
          pessoa_id: string
          repiques?: string[]
          safras?: string[]
          tipo_disparo: Database["public"]["Enums"]["tipo_disparo_enum"]
          updated_at?: string
          user_id?: string
        }
        Update: {
          ativo?: boolean
          categoria_id?: string
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          instituicao_id?: string
          modalidades?: string[]
          nome_acao?: string
          pessoa_id?: string
          repiques?: string[]
          safras?: string[]
          tipo_disparo?: Database["public"]["Enums"]["tipo_disparo_enum"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comunicacoes_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunicacoes_instituicao_id_fkey"
            columns: ["instituicao_id"]
            isOneToOne: false
            referencedRelation: "instituicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comunicacoes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      instituicoes: {
        Row: {
          cor: string
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          cor: string
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          cor?: string
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      journeys: {
        Row: {
          area: string | null
          brand_tag: string | null
          business_unit: string | null
          category: string | null
          channels: string | null
          course_type: string | null
          created_at: string
          emergency: boolean | null
          flow_data: Json | null
          format: string | null
          harvest: string | null
          id: string
          modality: string | null
          name: string
          other_filters: string | null
          period: string | null
          request: string | null
          request_type: string | null
          requester: string | null
          size: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area?: string | null
          brand_tag?: string | null
          business_unit?: string | null
          category?: string | null
          channels?: string | null
          course_type?: string | null
          created_at?: string
          emergency?: boolean | null
          flow_data?: Json | null
          format?: string | null
          harvest?: string | null
          id?: string
          modality?: string | null
          name: string
          other_filters?: string | null
          period?: string | null
          request?: string | null
          request_type?: string | null
          requester?: string | null
          size?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          area?: string | null
          brand_tag?: string | null
          business_unit?: string | null
          category?: string | null
          channels?: string | null
          course_type?: string | null
          created_at?: string
          emergency?: boolean | null
          flow_data?: Json | null
          format?: string | null
          harvest?: string | null
          id?: string
          modality?: string | null
          name?: string
          other_filters?: string | null
          period?: string | null
          request?: string | null
          request_type?: string | null
          requester?: string | null
          size?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marcos: {
        Row: {
          cor: string
          created_at: string
          data_fim: string
          data_inicio: string
          id: string
          maturidade: Database["public"]["Enums"]["maturidade_enum"]
          modalidade: Database["public"]["Enums"]["modalidade_enum"]
          nome: string
          safra: string
          updated_at: string
        }
        Insert: {
          cor: string
          created_at?: string
          data_fim: string
          data_inicio: string
          id?: string
          maturidade: Database["public"]["Enums"]["maturidade_enum"]
          modalidade: Database["public"]["Enums"]["modalidade_enum"]
          nome: string
          safra: string
          updated_at?: string
        }
        Update: {
          cor?: string
          created_at?: string
          data_fim?: string
          data_inicio?: string
          id?: string
          maturidade?: Database["public"]["Enums"]["maturidade_enum"]
          modalidade?: Database["public"]["Enums"]["modalidade_enum"]
          nome?: string
          safra?: string
          updated_at?: string
        }
        Relationships: []
      }
      personas: {
        Row: {
          categoria: Database["public"]["Enums"]["persona_categoria_enum"]
          cor: string
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          categoria?: Database["public"]["Enums"]["persona_categoria_enum"]
          cor: string
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          categoria?: Database["public"]["Enums"]["persona_categoria_enum"]
          cor?: string
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      pessoas: {
        Row: {
          created_at: string
          id: string
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
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
      [_ in never]: never
    }
    Enums: {
      maturidade_enum: "Calouros" | "Veteranos" | "Ambos"
      modalidade_enum: "Presencial" | "EAD" | "Híbrido"
      persona_categoria_enum: "disponivel" | "restrita"
      tipo_disparo_enum: "Pontual" | "Régua Fechada" | "Régua Aberta"
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
      maturidade_enum: ["Calouros", "Veteranos", "Ambos"],
      modalidade_enum: ["Presencial", "EAD", "Híbrido"],
      persona_categoria_enum: ["disponivel", "restrita"],
      tipo_disparo_enum: ["Pontual", "Régua Fechada", "Régua Aberta"],
    },
  },
} as const
