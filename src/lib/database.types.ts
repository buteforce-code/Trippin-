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
        Relationships: [
          {
            foreignKeyName: "activity_log_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_money_summary"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "activity_log_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "contributions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "member_balances"
            referencedColumns: ["member_id"]
          },
          {
            foreignKeyName: "contributions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_money_summary"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "contributions_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "expenses_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_money_summary"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "expenses_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "media_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_money_summary"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "media_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          avatar_color: string
          created_at: string
          email: string | null
          id: string
          initials: string
          is_organizer: boolean
          name: string
          sort_order: number
          trip_id: string
          user_id: string | null
        }
        Insert: {
          avatar_color: string
          created_at?: string
          email?: string | null
          id?: string
          initials: string
          is_organizer?: boolean
          name: string
          sort_order?: number
          trip_id: string
          user_id?: string | null
        }
        Update: {
          avatar_color?: string
          created_at?: string
          email?: string | null
          id?: string
          initials?: string
          is_organizer?: boolean
          name?: string
          sort_order?: number
          trip_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_money_summary"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "stops_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_money_summary"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "stops_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string
          day_index: number
          end_date: string | null
          id: string
          name: string
          organizer_user_id: string | null
          per_head_amount: number
          start_date: string | null
          total_days: number
        }
        Insert: {
          created_at?: string
          day_index?: number
          end_date?: string | null
          id?: string
          name: string
          organizer_user_id?: string | null
          per_head_amount?: number
          start_date?: string | null
          total_days?: number
        }
        Update: {
          created_at?: string
          day_index?: number
          end_date?: string | null
          id?: string
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
        Relationships: [
          {
            foreignKeyName: "members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_money_summary"
            referencedColumns: ["trip_id"]
          },
          {
            foreignKeyName: "members_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
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
        Insert: {
          collected?: never
          expected?: never
          member_count?: never
          per_head_amount?: number | null
          spent?: never
          trip_id?: string | null
        }
        Update: {
          collected?: never
          expected?: never
          member_count?: never
          per_head_amount?: number | null
          spent?: never
          trip_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      device_type: "iPhone" | "Android"
      expense_category: "stay" | "food" | "travel" | "activities" | "misc"
      log_kind: "expense" | "edit" | "payment"
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
      quality_label: ["4K", "HQ"],
      stop_state: ["done", "current", "upcoming"],
    },
  },
} as const
