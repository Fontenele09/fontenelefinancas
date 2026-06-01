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
      achievements: {
        Row: {
          code: string
          description: string | null
          id: string
          title: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          code: string
          description?: string | null
          id?: string
          title: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          code?: string
          description?: string | null
          id?: string
          title?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_accounts: {
        Row: {
          color: string
          created_at: string
          credit_limit: number | null
          id: string
          initial_balance: number
          name: string
          type: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          credit_limit?: number | null
          id?: string
          initial_balance?: number
          name: string
          type: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          credit_limit?: number | null
          id?: string
          initial_balance?: number
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_budgets: {
        Row: {
          category: string
          created_at: string
          id: string
          limit: number
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          limit: number
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          limit?: number
          user_id?: string
        }
        Relationships: []
      }
      finance_goals: {
        Row: {
          category: string | null
          created_at: string
          deadline: string | null
          id: string
          name: string
          saved: number
          target: number
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          name: string
          saved?: number
          target: number
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          name?: string
          saved?: number
          target?: number
          user_id?: string
        }
        Relationships: []
      }
      finance_recurring_bills: {
        Row: {
          amount: number
          auto_pay: boolean
          category: string | null
          created_at: string
          due_day: number
          frequency: string
          id: string
          name: string
          paid_month: string | null
          user_id: string
        }
        Insert: {
          amount: number
          auto_pay?: boolean
          category?: string | null
          created_at?: string
          due_day: number
          frequency?: string
          id?: string
          name: string
          paid_month?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          auto_pay?: boolean
          category?: string | null
          created_at?: string
          due_day?: number
          frequency?: string
          id?: string
          name?: string
          paid_month?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          account_id: string
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          tags: string[]
          type: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          tags?: string[]
          type: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          tags?: string[]
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          level: number
          updated_at: string
          username: string | null
          xp: number
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          level?: number
          updated_at?: string
          username?: string | null
          xp?: number
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          level?: number
          updated_at?: string
          username?: string | null
          xp?: number
        }
        Relationships: []
      }
      routine_completions: {
        Row: {
          created_at: string
          date: string
          id: string
          routine_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          routine_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          routine_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routine_completions_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "routines"
            referencedColumns: ["id"]
          },
        ]
      }
      routines: {
        Row: {
          archived: boolean
          category: string | null
          created_at: string
          days: number[]
          grace_days: number
          icon: string | null
          id: string
          name: string
          time_of_day: string | null
          user_id: string
        }
        Insert: {
          archived?: boolean
          category?: string | null
          created_at?: string
          days?: number[]
          grace_days?: number
          icon?: string | null
          id?: string
          name: string
          time_of_day?: string | null
          user_id: string
        }
        Update: {
          archived?: boolean
          category?: string | null
          created_at?: string
          days?: number[]
          grace_days?: number
          icon?: string | null
          id?: string
          name?: string
          time_of_day?: string | null
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
