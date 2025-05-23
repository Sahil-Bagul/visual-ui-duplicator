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
      content_management_logs: {
        Row: {
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          operation_type: string
          resource_id: string
          resource_type: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          operation_type: string
          resource_id: string
          resource_type: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          operation_type?: string
          resource_id?: string
          resource_type?: string
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
          is_published: boolean | null
          pdf_url: string | null
          price: number
          referral_reward: number
          title: string
        }
        Insert: {
          description?: string | null
          id?: string
          is_published?: boolean | null
          pdf_url?: string | null
          price: number
          referral_reward: number
          title: string
        }
        Update: {
          description?: string | null
          id?: string
          is_published?: boolean | null
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
      notifications: {
        Row: {
          action_text: string | null
          action_url: string | null
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_text?: string | null
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_text?: string | null
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
      support_tickets: {
        Row: {
          admin_response: string | null
          created_at: string | null
          id: string
          message: string
          responded_at: string | null
          status: string | null
          subject: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string | null
          id?: string
          message: string
          responded_at?: string | null
          status?: string | null
          subject: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string | null
          id?: string
          message?: string
          responded_at?: string | null
          status?: string | null
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
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
          is_suspended: boolean | null
          joined_at: string | null
          name: string | null
        }
        Insert: {
          email?: string | null
          id: string
          is_admin?: boolean
          is_suspended?: boolean | null
          joined_at?: string | null
          name?: string | null
        }
        Update: {
          email?: string | null
          id?: string
          is_admin?: boolean
          is_suspended?: boolean | null
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
      create_course: {
        Args:
          | {
              admin_id: string
              course_title: string
              course_price: number
              referral_reward: number
              course_description: string
              pdf_url: string
            }
          | {
              p_title: string
              p_price: number
              p_referral_reward: number
              p_description: string
              p_pdf_url: string
            }
        Returns: string
      }
      create_course_module: {
        Args:
          | Record<PropertyKey, never>
          | {
              admin_id: string
              course_id: string
              module_title: string
              module_order: number
            }
          | {
              admin_id: string
              course_id: string
              title: string
              content: string
              module_order: number
              description: string
            }
          | {
              admin_id: string
              course_id: string
              title: string
              description: string
              module_order: number
            }
        Returns: undefined
      }
      create_lesson: {
        Args:
          | {
              admin_id: string
              module_id: string
              lesson_title: string
              lesson_content: string
              lesson_order: number
            }
          | {
              module_id: string
              title: string
              video_url: string
              lesson_order: number
            }
        Returns: string
      }
      create_user_notification: {
        Args:
          | Record<PropertyKey, never>
          | {
              user_id_param: string
              title_param: string
              message_param: string
              type_param: string
              action_url_param: string
              action_text_param: string
            }
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
      get_recent_analytics_metrics: {
        Args: { days_back?: number }
        Returns: {
          date: string
          active_users: number
          new_signups: number
          course_enrollments: number
          lesson_completions: number
          total_revenue: number
          referral_commissions: number
          referral_count: number
          course_completion_rate: number
        }[]
      }
      get_user_by_id_safe: {
        Args: { user_id_param: string }
        Returns: {
          email: string | null
          id: string
          is_admin: boolean
          is_suspended: boolean | null
          joined_at: string | null
          name: string | null
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
      is_user_admin_safe: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      log_content_management: {
        Args: {
          admin_id_param: string
          operation_type_param: string
          resource_type_param: string
          resource_id_param: string
          details_param?: Json
        }
        Returns: string
      }
      log_user_login: {
        Args: { user_id_param: string }
        Returns: undefined
      }
      mark_all_notifications_as_read: {
        Args: { user_id_param: string }
        Returns: number
      }
      mark_notification_as_read: {
        Args: { notification_id_param: string }
        Returns: boolean
      }
      respond_to_support_ticket: {
        Args: {
          ticket_id_param: string
          status_param: string
          admin_response_param: string
        }
        Returns: string
      }
      revoke_admin_privileges: {
        Args: { admin_email: string }
        Returns: Json
      }
      send_telegram_test_message: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      submit_support_ticket: {
        Args: { subject_param: string; message_param: string }
        Returns: string
      }
      toggle_user_suspension: {
        Args:
          | { admin_id: string; target_user_id: string; suspend: boolean }
          | { user_id: number }
        Returns: string
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
