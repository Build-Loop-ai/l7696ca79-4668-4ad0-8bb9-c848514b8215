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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          call_id: string | null
          created_at: string | null
          email: string | null
          google_calendar_event_id: string | null
          id: string
          notes: string | null
          organization_id: string
          patient_name: string
          phone_number: string | null
          scheduled_at: string
          service_type: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          call_id?: string | null
          created_at?: string | null
          email?: string | null
          google_calendar_event_id?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          patient_name: string
          phone_number?: string | null
          scheduled_at: string
          service_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          call_id?: string | null
          created_at?: string | null
          email?: string | null
          google_calendar_event_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          patient_name?: string
          phone_number?: string | null
          scheduled_at?: string
          service_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "call_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          caller_number: string | null
          created_at: string
          direction: Database["public"]["Enums"]["call_direction"] | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          metadata: Json | null
          organization_id: string
          outcome: Database["public"]["Enums"]["call_outcome"] | null
          phone_number_id: string | null
          recording_url: string | null
          started_at: string | null
          summary: string | null
          transcript: string | null
          vapi_call_id: string | null
        }
        Insert: {
          caller_number?: string | null
          created_at?: string
          direction?: Database["public"]["Enums"]["call_direction"] | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          outcome?: Database["public"]["Enums"]["call_outcome"] | null
          phone_number_id?: string | null
          recording_url?: string | null
          started_at?: string | null
          summary?: string | null
          transcript?: string | null
          vapi_call_id?: string | null
        }
        Update: {
          caller_number?: string | null
          created_at?: string
          direction?: Database["public"]["Enums"]["call_direction"] | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          outcome?: Database["public"]["Enums"]["call_outcome"] | null
          phone_number_id?: string | null
          recording_url?: string | null
          started_at?: string | null
          summary?: string | null
          transcript?: string | null
          vapi_call_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_logs_phone_number_id_fkey"
            columns: ["phone_number_id"]
            isOneToOne: false
            referencedRelation: "phone_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          ai_config: Json | null
          business_hours: Json | null
          created_at: string
          custom_greeting: string | null
          google_calendar_connected: boolean | null
          google_calendar_email: string | null
          google_calendar_id: string | null
          google_calendar_refresh_token: string | null
          id: string
          language: string | null
          organization_id: string
          services: Json | null
          transcriber_language: string | null
          transfer_number: string | null
          updated_at: string
          vapi_api_key: string | null
          vapi_assistant_id: string | null
          voice_id: string | null
          voice_provider: string | null
        }
        Insert: {
          ai_config?: Json | null
          business_hours?: Json | null
          created_at?: string
          custom_greeting?: string | null
          google_calendar_connected?: boolean | null
          google_calendar_email?: string | null
          google_calendar_id?: string | null
          google_calendar_refresh_token?: string | null
          id?: string
          language?: string | null
          organization_id: string
          services?: Json | null
          transcriber_language?: string | null
          transfer_number?: string | null
          updated_at?: string
          vapi_api_key?: string | null
          vapi_assistant_id?: string | null
          voice_id?: string | null
          voice_provider?: string | null
        }
        Update: {
          ai_config?: Json | null
          business_hours?: Json | null
          created_at?: string
          custom_greeting?: string | null
          google_calendar_connected?: boolean | null
          google_calendar_email?: string | null
          google_calendar_id?: string | null
          google_calendar_refresh_token?: string | null
          id?: string
          language?: string | null
          organization_id?: string
          services?: Json | null
          transcriber_language?: string | null
          transfer_number?: string | null
          updated_at?: string
          vapi_api_key?: string | null
          vapi_assistant_id?: string | null
          voice_id?: string | null
          voice_provider?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: Json | null
          business_type: Database["public"]["Enums"]["business_type"] | null
          created_at: string
          customer_phone_number: string | null
          description: string | null
          forwarding_active: boolean | null
          forwarding_confirmed_at: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          phone_carrier: string | null
          slug: string | null
          special_instructions: string | null
          timezone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: Json | null
          business_type?: Database["public"]["Enums"]["business_type"] | null
          created_at?: string
          customer_phone_number?: string | null
          description?: string | null
          forwarding_active?: boolean | null
          forwarding_confirmed_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          phone_carrier?: string | null
          slug?: string | null
          special_instructions?: string | null
          timezone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: Json | null
          business_type?: Database["public"]["Enums"]["business_type"] | null
          created_at?: string
          customer_phone_number?: string | null
          description?: string | null
          forwarding_active?: boolean | null
          forwarding_confirmed_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          phone_carrier?: string | null
          slug?: string | null
          special_instructions?: string | null
          timezone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      phone_numbers: {
        Row: {
          country_code: string | null
          created_at: string
          forwarding_number: string | null
          friendly_name: string | null
          id: string
          is_active: boolean | null
          is_forwarding: boolean | null
          number_type: string | null
          organization_id: string
          phone_number: string
          released_at: string | null
          status: string | null
          twilio_monthly_cost_cents: number | null
          twilio_sid: string | null
          updated_at: string
          vapi_phone_id: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          forwarding_number?: string | null
          friendly_name?: string | null
          id?: string
          is_active?: boolean | null
          is_forwarding?: boolean | null
          number_type?: string | null
          organization_id: string
          phone_number: string
          released_at?: string | null
          status?: string | null
          twilio_monthly_cost_cents?: number | null
          twilio_sid?: string | null
          updated_at?: string
          vapi_phone_id?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string
          forwarding_number?: string | null
          friendly_name?: string | null
          id?: string
          is_active?: boolean | null
          is_forwarding?: boolean | null
          number_type?: string | null
          organization_id?: string
          phone_number?: string
          released_at?: string | null
          status?: string | null
          twilio_monthly_cost_cents?: number | null
          twilio_sid?: string | null
          updated_at?: string
          vapi_phone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_numbers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          minutes_included: number | null
          minutes_used: number | null
          organization_id: string
          plan: Database["public"]["Enums"]["subscription_plan"] | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          minutes_included?: number | null
          minutes_used?: number | null
          organization_id: string
          plan?: Database["public"]["Enums"]["subscription_plan"] | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          minutes_included?: number | null
          minutes_used?: number | null
          organization_id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"] | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["system_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["system_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["system_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organization_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _organization_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_minutes_used: {
        Args: { minutes_to_add: number; org_id: string }
        Returns: undefined
      }
      is_org_admin: {
        Args: { _organization_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _organization_id: string; _user_id: string }
        Returns: boolean
      }
      is_system_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "owner" | "admin" | "manager" | "viewer"
      business_type:
        | "dental_clinic"
        | "medical_practice"
        | "salon"
        | "restaurant"
        | "other"
      call_direction: "inbound" | "outbound"
      call_outcome:
        | "appointment_booked"
        | "info_provided"
        | "transferred"
        | "voicemail"
        | "missed"
        | "completed"
      subscription_plan: "starter" | "growth" | "enterprise"
      subscription_status: "active" | "canceled" | "past_due" | "trialing"
      system_role: "super_admin" | "support"
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
      app_role: ["owner", "admin", "manager", "viewer"],
      business_type: [
        "dental_clinic",
        "medical_practice",
        "salon",
        "restaurant",
        "other",
      ],
      call_direction: ["inbound", "outbound"],
      call_outcome: [
        "appointment_booked",
        "info_provided",
        "transferred",
        "voicemail",
        "missed",
        "completed",
      ],
      subscription_plan: ["starter", "growth", "enterprise"],
      subscription_status: ["active", "canceled", "past_due", "trialing"],
      system_role: ["super_admin", "support"],
    },
  },
} as const
