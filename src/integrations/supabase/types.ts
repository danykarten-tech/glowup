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
      affiliate_products: {
        Row: {
          affiliate_link: string
          brand: string
          category: string
          created_at: string
          description: string
          id: string
          image_url: string
          is_active: boolean
          name: string
          price: string
          rating: number | null
          sort_order: number
          tag: string | null
          updated_at: string
        }
        Insert: {
          affiliate_link?: string
          brand?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          is_active?: boolean
          name: string
          price?: string
          rating?: number | null
          sort_order?: number
          tag?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_link?: string
          brand?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          price?: string
          rating?: number | null
          sort_order?: number
          tag?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      analysis_history: {
        Row: {
          analysis_data: Json | null
          created_at: string
          hairstyle_score: number | null
          id: string
          overall_score: number
          photo_url: string | null
          share_token: string | null
          skin_score: number | null
          style_score: number | null
          symmetry_score: number | null
          user_id: string
        }
        Insert: {
          analysis_data?: Json | null
          created_at?: string
          hairstyle_score?: number | null
          id?: string
          overall_score: number
          photo_url?: string | null
          share_token?: string | null
          skin_score?: number | null
          style_score?: number | null
          symmetry_score?: number | null
          user_id: string
        }
        Update: {
          analysis_data?: Json | null
          created_at?: string
          hairstyle_score?: number | null
          id?: string
          overall_score?: number
          photo_url?: string | null
          share_token?: string | null
          skin_score?: number | null
          style_score?: number | null
          symmetry_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      glow_challenges: {
        Row: {
          challenged_friend_contact: string | null
          challenged_friend_name: string | null
          challenger_id: string
          challenger_name: string | null
          challenger_score: number
          created_at: string
          id: string
          status: string
        }
        Insert: {
          challenged_friend_contact?: string | null
          challenged_friend_name?: string | null
          challenger_id: string
          challenger_name?: string | null
          challenger_score: number
          created_at?: string
          id?: string
          status?: string
        }
        Update: {
          challenged_friend_contact?: string | null
          challenged_friend_name?: string | null
          challenger_id?: string
          challenger_name?: string | null
          challenger_score?: number
          created_at?: string
          id?: string
          status?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          page_path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          page_path: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          plan: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_subscription_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          plan: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_subscription_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          plan?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_subscription_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auto_renew_enabled: boolean
          avatar_url: string | null
          bonus_credits: number
          cancel_at_period_end: boolean
          created_at: string
          downgrade_after_expiry: string
          full_name: string | null
          id: string
          plan: string
          plan_start_date: string | null
          razorpay_customer_id: string | null
          razorpay_subscription_id: string | null
          referral_code: string | null
          renewal_date: string | null
          subscription_status: string
          updated_at: string
        }
        Insert: {
          auto_renew_enabled?: boolean
          avatar_url?: string | null
          bonus_credits?: number
          cancel_at_period_end?: boolean
          created_at?: string
          downgrade_after_expiry?: string
          full_name?: string | null
          id: string
          plan?: string
          plan_start_date?: string | null
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          referral_code?: string | null
          renewal_date?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Update: {
          auto_renew_enabled?: boolean
          avatar_url?: string | null
          bonus_credits?: number
          cancel_at_period_end?: boolean
          created_at?: string
          downgrade_after_expiry?: string
          full_name?: string | null
          id?: string
          plan?: string
          plan_start_date?: string | null
          razorpay_customer_id?: string | null
          razorpay_subscription_id?: string | null
          referral_code?: string | null
          renewal_date?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          bonus_awarded: boolean
          created_at: string
          id: string
          referred_user_id: string
          referrer_id: string
        }
        Insert: {
          bonus_awarded?: boolean
          created_at?: string
          id?: string
          referred_user_id: string
          referrer_id: string
        }
        Update: {
          bonus_awarded?: boolean
          created_at?: string
          id?: string
          referred_user_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          status: string
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          status?: string
          subject: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_premium_plan: {
        Args: { p_plan: string; p_user_id: string }
        Returns: boolean
      }
      check_subscription_expiry: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      get_shared_analysis: {
        Args: { p_share_token: string }
        Returns: {
          analysis_data: Json | null
          created_at: string
          hairstyle_score: number | null
          id: string
          overall_score: number
          photo_url: string | null
          share_token: string | null
          skin_score: number | null
          style_score: number | null
          symmetry_score: number | null
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "analysis_history"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      is_admin_email: { Args: { user_id: string }; Returns: boolean }
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
