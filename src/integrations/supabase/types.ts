export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_daily_metrics: {
        Row: {
          active_users: number | null
          course_completion_rate: number | null
          course_enrollments: number | null
          date: string
          id: string
          lesson_completions: number | null
          new_signups: number | null
          referral_commissions: number | null
          referral_count: number | null
          total_revenue: number | null
        }
        Insert: {
          active_users?: number | null
          course_completion_rate?: number | null
          course_enrollments?: number | null
          date: string
          id?: string
          lesson_completions?: number | null
          new_signups?: number | null
          referral_commissions?: number | null
          referral_count?: number | null
          total_revenue?: number | null
        }
        Update: {
          active_users?: number | null
          course_completion_rate?: number | null
          course_enrollments?: number | null
          date?: string
          id?: string
          lesson_completions?: number | null
          new_signups?: number | null
          referral_commissions?: number | null
          referral_count?: number | null
          total_revenue?: number | null
        }
        Relationships: []
      }
      course_modules: {
        Row: {
          content: string
          course_id: string
          created_at: string
          description: string | null
          id: string
          module_order: number
          title: string
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          module_order: number
          title: string
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          module_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          description: string | null
          id: string
          pdf_url: string | null
          price: number
          referral_reward: number
          title: string
        }
        Insert: {
          description?: string | null
          id?: string
          pdf_url?: string | null
          price: number
          referral_reward: number
          title: string
        }
        Update: {
          description?: string | null
          id?: string
          pdf_url?: string | null
          price?: number
          referral_reward?: number
          title?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          admin_response: string | null
          id: string
          message: string
          rating: number | null
          responded_at: string | null
          status: string | null
          subject: string
          submitted_at: string
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          id?: string
          message: string
          rating?: number | null
          responded_at?: string | null
          status?: string | null
          subject: string
          submitted_at?: string
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          id?: string
          message?: string
          rating?: number | null
          responded_at?: string | null
          status?: string | null
          subject?: string
          submitted_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content: string
          created_at: string
          id: string
          lesson_order: number
          module_id: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lesson_order: number
          module_id: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lesson_order?: number
          module_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_methods: {
        Row: {
          account_number: string | null
          added_at: string
          id: string
          ifsc_code: string | null
          is_default: boolean
          method_type: string
          upi_id: string | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          added_at?: string
          id?: string
          ifsc_code?: string | null
          is_default?: boolean
          method_type: string
          upi_id?: string | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          added_at?: string
          id?: string
          ifsc_code?: string | null
          is_default?: boolean
          method_type?: string
          upi_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          failure_reason: string | null
          id: string
          payout_method_id: string
          processed_at: string | null
          razorpay_payout_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          failure_reason?: string | null
          id?: string
          payout_method_id: string
          processed_at?: string | null
          razorpay_payout_id?: string | null
          status: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          failure_reason?: string | null
          id?: string
          payout_method_id?: string
          processed_at?: string | null
          razorpay_payout_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_payout_method_id_fkey"
            columns: ["payout_method_id"]
            isOneToOne: false
            referencedRelation: "payout_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          course_id: string
          has_used_referral_code: boolean | null
          id: string
          purchased_at: string | null
          used_referral_code: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          has_used_referral_code?: boolean | null
          id?: string
          purchased_at?: string | null
          used_referral_code?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          has_used_referral_code?: boolean | null
          id?: string
          purchased_at?: string | null
          used_referral_code?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          course_id: string
          id: string
          referral_code: string
          successful_referrals: number | null
          total_earned: number | null
          user_id: string
        }
        Insert: {
          course_id: string
          id?: string
          referral_code: string
          successful_referrals?: number | null
          total_earned?: number | null
          user_id: string
        }
        Update: {
          course_id?: string
          id?: string
          referral_code?: string
          successful_referrals?: number | null
          total_earned?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          metadata: Json | null
          resource_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string | null
          module_id: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          module_id?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string | null
          module_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          email: string | null
          id: string
          is_admin: boolean
          joined_at: string | null
          name: string | null
        }
        Insert: {
          email?: string | null
          id: string
          is_admin?: boolean
          joined_at?: string | null
          name?: string | null
        }
        Update: {
          email?: string | null
          id?: string
          is_admin?: boolean
          joined_at?: string | null
          name?: string | null
        }
        Relationships: []
      }
      wallet: {
        Row: {
          balance: number | null
          id: string
          last_updated: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          id?: string
          last_updated?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          id?: string
          last_updated?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aggregate_daily_metrics: {
        Args: { target_date: string }
        Returns: undefined
      }
      generate_test_analytics_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_course_structure: {
        Args: { course_id_param: string }
        Returns: {
          course_id: string
          course_title: string
          course_description: string
          module_id: string
          module_title: string
          module_description: string
          module_order: number
          lesson_id: string
          lesson_title: string
          lesson_order: number
        }[]
      }
      get_user_course_progress: {
        Args: { user_id_param: string; course_id_param: string }
        Returns: {
          lesson_id: string
          completed: boolean
          completed_at: string
        }[]
      }
      grant_admin_privileges: {
        Args: { admin_email: string }
        Returns: Json
      }
      grant_one_time_access_to_user: {
        Args: { user_email: string }
        Returns: Json
      }
      is_user_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_user_login: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      revoke_admin_privileges: {
        Args: { admin_email: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
