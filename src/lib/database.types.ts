export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          actor_name: string
          actor_user_id: string | null
          created_at: string
          detail: string
          id: string
          kind: Database["public"]["Enums"]["log_kind"]
          trip_id: string
        }
        Insert: {
          actor_name: string
          actor_user_id?: string | null
          created_at?: string
          detail: string
          id?: string
          kind: Database["public"]["Enums"]["log_kind"]
          trip_id: string
        }
        Update: {
          actor_name?: string
          actor_user_id?: string | null
          created_at?: string
          detail?: string
          id?: string
          kind?: Database["public"]["Enums"]["log_kind"]
          trip_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          author_name: string
          author_user_id: string | null
          body: string
          created_at: string
          id: string
          pinned: boolean
          trip_id: string
        }
        Insert: {
          author_name: string
          author_user_id?: string | null
          body: string
          created_at?: string
          id?: string
          pinned?: boolean
          trip_id: string
        }
        Update: {
          author_name?: string
          author_user_id?: string | null
          body?: string
          created_at?: string
          id?: string
          pinned?: boolean
          trip_id?: string
        }
        Relationships: []
      }
      contributions: {
        Row: {
          amount: number
          created_at: string
          id: string
          member_id: string
          note: string | null
          recorded_by: string | null
          trip_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          member_id: string
          note?: string | null
          recorded_by?: string | null
          trip_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          member_id?: string
          note?: string | null
          recorded_by?: string | null
          trip_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          created_by: string | null
          date_label: string | null
          id: string
          paid_by: string | null
          spent_on: string | null
          title: string
          trip_id: string
        }
        Insert: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          created_by?: string | null
          date_label?: string | null
          id?: string
          paid_by?: string | null
          spent_on?: string | null
          title: string
          trip_id: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          created_by?: string | null
          date_label?: string | null
          id?: string
          paid_by?: string | null
          spent_on?: string | null
          title?: string
          trip_id?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          bytes: number | null
          c1: string | null
          c2: string | null
          created_at: string
          device: Database["public"]["Enums"]["device_type"]
          height: number | null
          id: string
          is_video: boolean
          location_tag: string | null
          original_provider: string
          place: string
          quality_label: Database["public"]["Enums"]["quality_label"]
          ratio: string
          stop_key: string | null
          storage_path_original: string | null
          storage_path_thumb: string | null
          trip_id: string
          uploader_user_id: string | null
          width: number | null
        }
        Insert: {
          bytes?: number | null
          c1?: string | null
          c2?: string | null
          created_at?: string
          device: Database["public"]["Enums"]["device_type"]
          height?: number | null
          id?: string
          is_video?: boolean
          location_tag?: string | null
          original_provider?: string
          place: string
          quality_label: Database["public"]["Enums"]["quality_label"]
          ratio?: string
          stop_key?: string | null
          storage_path_original?: string | null
          storage_path_thumb?: string | null
          trip_id: string
          uploader_user_id?: string | null
          width?: number | null
        }
        Update: {
          bytes?: number | null
          c1?: string | null
          c2?: string | null
          created_at?: string
          device?: Database["public"]["Enums"]["device_type"]
          height?: number | null
          id?: string
          is_video?: boolean
          location_tag?: string | null
          original_provider?: string
          place?: string
          quality_label?: Database["public"]["Enums"]["quality_label"]
          ratio?: string
          stop_key?: string | null
          storage_path_original?: string | null
          storage_path_thumb?: string | null
          trip_id?: string
          uploader_user_id?: string | null
          width?: number | null
        }
        Relationships: []
      }
      members: {
        Row: {
          avatar_color: string
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          initials: string
          is_organizer: boolean
          name: string
          nickname: string | null
          prior_contribution_note: string | null
          role: Database["public"]["Enums"]["member_role"]
          sort_order: number
          trip_id: string
          user_id: string | null
        }
        Insert: {
          avatar_color: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          initials: string
          is_organizer?: boolean
          name: string
          nickname?: string | null
          prior_contribution_note?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          sort_order?: number
          trip_id: string
          user_id?: string | null
        }
        Update: {
          avatar_color?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          initials?: string
          is_organizer?: boolean
          name?: string
          nickname?: string | null
          prior_contribution_note?: string | null
          role?: Database["public"]["Enums"]["member_role"]
          sort_order?: number
          trip_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      stops: {
        Row: {
          condition: string | null
          date_label: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          nights: number | null
          note: string | null
          order_index: number
          state: Database["public"]["Enums"]["stop_state"]
          temp: string | null
          trip_id: string
          weather_icon: string | null
        }
        Insert: {
          condition?: string | null
          date_label?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          nights?: number | null
          note?: string | null
          order_index: number
          state?: Database["public"]["Enums"]["stop_state"]
          temp?: string | null
          trip_id: string
          weather_icon?: string | null
        }
        Update: {
          condition?: string | null
          date_label?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          nights?: number | null
          note?: string | null
          order_index?: number
          state?: Database["public"]["Enums"]["stop_state"]
          temp?: string | null
          trip_id?: string
          weather_icon?: string | null
        }
        Relationships: []
      }
      trip_invites: {
        Row: {
          active: boolean
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          max_uses: number | null
          role: Database["public"]["Enums"]["member_role"]
          token: string
          trip_id: string
          uses: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          role?: Database["public"]["Enums"]["member_role"]
          token?: string
          trip_id: string
          uses?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          role?: Database["public"]["Enums"]["member_role"]
          token?: string
          trip_id?: string
          uses?: number
        }
        Relationships: []
      }
      trips: {
        Row: {
          created_at: string
          created_by: string | null
          day_index: number
          end_date: string | null
          id: string
          invite_code: string | null
          name: string
          organizer_user_id: string | null
          per_head_amount: number
          start_date: string | null
          total_days: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          day_index?: number
          end_date?: string | null
          id?: string
          invite_code?: string | null
          name: string
          organizer_user_id?: string | null
          per_head_amount?: number
          start_date?: string | null
          total_days?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          day_index?: number
          end_date?: string | null
          id?: string
          invite_code?: string | null
          name?: string
          organizer_user_id?: string | null
          per_head_amount?: number
          start_date?: string | null
          total_days?: number
        }
        Relationships: []
      }
    }
    Views: {
      member_balances: {
        Row: {
          member_id: string | null
          paid: number | null
          splits: number | null
          trip_id: string | null
        }
        Relationships: []
      }
      trip_money_summary: {
        Row: {
          collected: number | null
          expected: number | null
          member_count: number | null
          per_head_amount: number | null
          spent: number | null
          trip_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_trip: {
        Args: {
          p_full_name?: string
          p_name: string
          p_nickname?: string
          p_per_head?: number
        }
        Returns: string
      }
      invite_info: {
        Args: { p_token: string }
        Returns: {
          invite_role: Database["public"]["Enums"]["member_role"]
          trip_id: string
          trip_name: string
          valid: boolean
        }[]
      }
      join_trip: {
        Args: { p_full_name?: string; p_nickname?: string; p_token: string }
        Returns: string
      }
      set_member_role: {
        Args: {
          p_member_id: string
          p_role: Database["public"]["Enums"]["member_role"]
        }
        Returns: undefined
      }
    }
    Enums: {
      device_type: "iPhone" | "Android"
      expense_category: "stay" | "food" | "travel" | "activities" | "misc"
      log_kind: "expense" | "edit" | "payment"
      member_role: "route_head" | "assistant" | "member"
      quality_label: "4K" | "HQ"
      stop_state: "done" | "current" | "upcoming"
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
      device_type: ["iPhone", "Android"],
      expense_category: ["stay", "food", "travel", "activities", "misc"],
      log_kind: ["expense", "edit", "payment"],
      member_role: ["route_head", "assistant", "member"],
      quality_label: ["4K", "HQ"],
      stop_state: ["done", "current", "upcoming"],
    },
  },
} as const
