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
      api_health: {
        Row: {
          api_name: string
          id: string
          last_success: string | null
          latency_ms: number | null
          quality_score: number | null
          status: string
        }
        Insert: {
          api_name: string
          id?: string
          last_success?: string | null
          latency_ms?: number | null
          quality_score?: number | null
          status: string
        }
        Update: {
          api_name?: string
          id?: string
          last_success?: string | null
          latency_ms?: number | null
          quality_score?: number | null
          status?: string
        }
        Relationships: []
      }
      asset_health: {
        Row: {
          asset_name: string
          city: string
          fault_severity: string | null
          health_score: number
          id: string
          load_ratio: number | null
          temperature: number | null
          timestamp: string | null
        }
        Insert: {
          asset_name: string
          city: string
          fault_severity?: string | null
          health_score: number
          id?: string
          load_ratio?: number | null
          temperature?: number | null
          timestamp?: string | null
        }
        Update: {
          asset_name?: string
          city?: string
          fault_severity?: string | null
          health_score?: number
          id?: string
          load_ratio?: number | null
          temperature?: number | null
          timestamp?: string | null
        }
        Relationships: []
      }
      battery_data: {
        Row: {
          city: string
          id: string
          net_power_kw: number | null
          soc_percent: number
          soh_percent: number
          status: string | null
          timestamp: string | null
        }
        Insert: {
          city: string
          id?: string
          net_power_kw?: number | null
          soc_percent: number
          soh_percent: number
          status?: string | null
          timestamp?: string | null
        }
        Update: {
          city?: string
          id?: string
          net_power_kw?: number | null
          soc_percent?: number
          soh_percent?: number
          status?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      carbon_metrics: {
        Row: {
          carbon_intensity: number
          city: string
          co2_savings_kg: number
          id: string
          renewable_share: number
          timestamp: string | null
        }
        Insert: {
          carbon_intensity: number
          city: string
          co2_savings_kg: number
          id?: string
          renewable_share: number
          timestamp?: string | null
        }
        Update: {
          carbon_intensity?: number
          city?: string
          co2_savings_kg?: number
          id?: string
          renewable_share?: number
          timestamp?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          id: string
          role: string
          session_id: string | null
          timestamp: string | null
        }
        Insert: {
          content: string
          id?: string
          role: string
          session_id?: string | null
          timestamp?: string | null
        }
        Update: {
          content?: string
          id?: string
          role?: string
          session_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string | null
          id: string
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_data: {
        Row: {
          city: string
          demand_kw: number
          dsi_index: number | null
          id: string
          peak_kw: number | null
          temperature_adjustment_kw: number | null
          timestamp: string | null
        }
        Insert: {
          city: string
          demand_kw: number
          dsi_index?: number | null
          id?: string
          peak_kw?: number | null
          temperature_adjustment_kw?: number | null
          timestamp?: string | null
        }
        Update: {
          city?: string
          demand_kw?: number
          dsi_index?: number | null
          id?: string
          peak_kw?: number | null
          temperature_adjustment_kw?: number | null
          timestamp?: string | null
        }
        Relationships: []
      }
      executive_reports: {
        Row: {
          carbon_savings: number
          created_at: string | null
          id: string
          period: string
          revenue: number
          risk_score: number
          roi: number
        }
        Insert: {
          carbon_savings: number
          created_at?: string | null
          id?: string
          period: string
          revenue: number
          risk_score: number
          roi: number
        }
        Update: {
          carbon_savings?: number
          created_at?: string | null
          id?: string
          period?: string
          revenue?: number
          risk_score?: number
          roi?: number
        }
        Relationships: []
      }
      feature_store: {
        Row: {
          ahi: number | null
          city: string
          dsi: number | null
          id: string
          quality_grade: string | null
          rai: number | null
          spi: number | null
          timestamp: string | null
          wpi: number | null
        }
        Insert: {
          ahi?: number | null
          city: string
          dsi?: number | null
          id?: string
          quality_grade?: string | null
          rai?: number | null
          spi?: number | null
          timestamp?: string | null
          wpi?: number | null
        }
        Update: {
          ahi?: number | null
          city?: string
          dsi?: number | null
          id?: string
          quality_grade?: string | null
          rai?: number | null
          spi?: number | null
          timestamp?: string | null
          wpi?: number | null
        }
        Relationships: []
      }
      forecasts: {
        Row: {
          city: string
          id: string
          mae: number | null
          predictions_json: Json
          rmse: number | null
          timestamp: string | null
          type: string
        }
        Insert: {
          city: string
          id?: string
          mae?: number | null
          predictions_json: Json
          rmse?: number | null
          timestamp?: string | null
          type: string
        }
        Update: {
          city?: string
          id?: string
          mae?: number | null
          predictions_json?: Json
          rmse?: number | null
          timestamp?: string | null
          type?: string
        }
        Relationships: []
      }
      notification_history: {
        Row: {
          city: string | null
          id: string
          message: string
          resolved_at: string | null
          severity: string
          title: string
        }
        Insert: {
          city?: string | null
          id?: string
          message: string
          resolved_at?: string | null
          severity: string
          title: string
        }
        Update: {
          city?: string | null
          id?: string
          message?: string
          resolved_at?: string | null
          severity?: string
          title?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          acknowledged: boolean | null
          city: string | null
          created_at: string | null
          id: string
          message: string
          severity: string
          title: string
        }
        Insert: {
          acknowledged?: boolean | null
          city?: string | null
          created_at?: string | null
          id?: string
          message: string
          severity: string
          title: string
        }
        Update: {
          acknowledged?: boolean | null
          city?: string | null
          created_at?: string | null
          id?: string
          message?: string
          severity?: string
          title?: string
        }
        Relationships: []
      }
      operational_events: {
        Row: {
          city: string
          description: string | null
          event_type: string
          id: string
          severity: string
          timestamp: string | null
        }
        Insert: {
          city: string
          description?: string | null
          event_type: string
          id?: string
          severity: string
          timestamp?: string | null
        }
        Update: {
          city?: string
          description?: string | null
          event_type?: string
          id?: string
          severity?: string
          timestamp?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
      scenario_results: {
        Row: {
          ai_narrative: string
          created_at: string | null
          id: string
          impact_json: Json
          scenario_params_json: Json
        }
        Insert: {
          ai_narrative: string
          created_at?: string | null
          id?: string
          impact_json: Json
          scenario_params_json: Json
        }
        Update: {
          ai_narrative?: string
          created_at?: string | null
          id?: string
          impact_json?: Json
          scenario_params_json?: Json
        }
        Relationships: []
      }
      solar_data: {
        Row: {
          city: string
          generation_kw: number
          id: string
          irradiance: number | null
          spi_index: number | null
          timestamp: string | null
        }
        Insert: {
          city: string
          generation_kw: number
          id?: string
          irradiance?: number | null
          spi_index?: number | null
          timestamp?: string | null
        }
        Update: {
          city?: string
          generation_kw?: number
          id?: string
          irradiance?: number | null
          spi_index?: number | null
          timestamp?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          id: string
          key: string
          value: Json
        }
        Insert: {
          category: string
          id?: string
          key: string
          value: Json
        }
        Update: {
          category?: string
          id?: string
          key?: string
          value?: Json
        }
        Relationships: []
      }
      weather_data: {
        Row: {
          city: string
          cloud_cover: number | null
          humidity: number | null
          id: string
          latitude: number
          longitude: number
          shortwave_radiation: number | null
          surface_pressure: number | null
          temperature: number | null
          timestamp: string | null
          wind_direction: number | null
          wind_speed: number | null
        }
        Insert: {
          city: string
          cloud_cover?: number | null
          humidity?: number | null
          id?: string
          latitude: number
          longitude: number
          shortwave_radiation?: number | null
          surface_pressure?: number | null
          temperature?: number | null
          timestamp?: string | null
          wind_direction?: number | null
          wind_speed?: number | null
        }
        Update: {
          city?: string
          cloud_cover?: number | null
          humidity?: number | null
          id?: string
          latitude?: number
          longitude?: number
          shortwave_radiation?: number | null
          surface_pressure?: number | null
          temperature?: number | null
          timestamp?: string | null
          wind_direction?: number | null
          wind_speed?: number | null
        }
        Relationships: []
      }
      wind_data: {
        Row: {
          city: string
          generation_kw: number
          id: string
          timestamp: string | null
          wind_speed: number | null
          wpi_index: number | null
        }
        Insert: {
          city: string
          generation_kw: number
          id?: string
          timestamp?: string | null
          wind_speed?: number | null
          wpi_index?: number | null
        }
        Update: {
          city?: string
          generation_kw?: number
          id?: string
          timestamp?: string | null
          wind_speed?: number | null
          wpi_index?: number | null
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
      user_role:
        | "Admin"
        | "Utility Operator"
        | "Engineer"
        | "Technician"
        | "Consumer"
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
      user_role: [
        "Admin",
        "Utility Operator",
        "Engineer",
        "Technician",
        "Consumer",
      ],
    },
  },
} as const
