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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      about_content: {
        Row: {
          created_at: string
          founder_image_url: string | null
          founder_name: string
          founder_note: string
          founder_quote: string
          full_about_text: string
          id: string
          mission_statement: string
          updated_at: string
          vision_statement: string
        }
        Insert: {
          created_at?: string
          founder_image_url?: string | null
          founder_name: string
          founder_note: string
          founder_quote: string
          full_about_text: string
          id?: string
          mission_statement: string
          updated_at?: string
          vision_statement: string
        }
        Update: {
          created_at?: string
          founder_image_url?: string | null
          founder_name?: string
          founder_note?: string
          founder_quote?: string
          full_about_text?: string
          id?: string
          mission_statement?: string
          updated_at?: string
          vision_statement?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          account_locked_until: string | null
          created_at: string
          created_by: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_failed_login: string | null
          last_login: string | null
          last_password_reset: string | null
          login_attempts: number | null
          password_changed_at: string | null
          password_hash: string
          reset_token: string | null
          reset_token_expires: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          account_locked_until?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          last_failed_login?: string | null
          last_login?: string | null
          last_password_reset?: string | null
          login_attempts?: number | null
          password_changed_at?: string | null
          password_hash: string
          reset_token?: string | null
          reset_token_expires?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          account_locked_until?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_failed_login?: string | null
          last_login?: string | null
          last_password_reset?: string | null
          login_attempts?: number | null
          password_changed_at?: string | null
          password_hash?: string
          reset_token?: string | null
          reset_token_expires?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      awards: {
        Row: {
          created_at: string
          description: string
          display_order: number | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          created_at?: string
          description: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      client_testimonials: {
        Row: {
          client_name: string
          company: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          position: string | null
          rating: number
          testimonial: string
          updated_at: string
        }
        Insert: {
          client_name: string
          company?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          position?: string | null
          rating: number
          testimonial: string
          updated_at?: string
        }
        Update: {
          client_name?: string
          company?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          position?: string | null
          rating?: number
          testimonial?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          default_portfolio_tags: string[] | null
          description: string
          event_type: string
          hero_cta_text: string | null
          hero_image_url: string | null
          hero_subtitle: string | null
          id: string
          is_active: boolean | null
          location: string | null
          meta_description: string | null
          process_description: string
          process_steps: Json | null
          services: Json | null
          services_section_title: string | null
          specialties: Json | null
          title: string
          updated_at: string
          url_slug: string | null
          what_we_do_title: string | null
        }
        Insert: {
          created_at?: string
          default_portfolio_tags?: string[] | null
          description: string
          event_type: string
          hero_cta_text?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          meta_description?: string | null
          process_description: string
          process_steps?: Json | null
          services?: Json | null
          services_section_title?: string | null
          specialties?: Json | null
          title: string
          updated_at?: string
          url_slug?: string | null
          what_we_do_title?: string | null
        }
        Update: {
          created_at?: string
          default_portfolio_tags?: string[] | null
          description?: string
          event_type?: string
          hero_cta_text?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          meta_description?: string | null
          process_description?: string
          process_steps?: Json | null
          services?: Json | null
          services_section_title?: string | null
          specialties?: Json | null
          title?: string
          updated_at?: string
          url_slug?: string | null
          what_we_do_title?: string | null
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          created_at: string
          email: string
          event_type: string | null
          form_type: string
          id: string
          message: string
          name: string
          phone: string | null
          rental_id: string | null
          rental_title: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          event_type?: string | null
          form_type: string
          id?: string
          message: string
          name: string
          phone?: string | null
          rental_id?: string | null
          rental_title?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          event_type?: string | null
          form_type?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          rental_id?: string | null
          rental_title?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hero_banners: {
        Row: {
          button_text: string | null
          created_at: string
          display_order: number | null
          event_type: string
          id: string
          image_url: string
          is_active: boolean | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          button_text?: string | null
          created_at?: string
          display_order?: number | null
          event_type: string
          id?: string
          image_url: string
          is_active?: boolean | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          button_text?: string | null
          created_at?: string
          display_order?: number | null
          event_type?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_achievements: {
        Row: {
          content: string
          created_at: string
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          short_content: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          short_content: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          short_content?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          album_url: string | null
          created_at: string
          display_order: number | null
          event_id: string
          id: string
          image_url: string
          is_before: boolean | null
          is_before_after: boolean | null
          tag: string | null
          title: string
          updated_at: string
        }
        Insert: {
          album_url?: string | null
          created_at?: string
          display_order?: number | null
          event_id: string
          id?: string
          image_url: string
          is_before?: boolean | null
          is_before_after?: boolean | null
          tag?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          album_url?: string | null
          created_at?: string
          display_order?: number | null
          event_id?: string
          id?: string
          image_url?: string
          is_before?: boolean | null
          is_before_after?: boolean | null
          tag?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_portfolio_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rentals: {
        Row: {
          created_at: string
          description: string
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          price_range: string | null
          short_description: string
          show_on_home: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price_range?: string | null
          short_description: string
          show_on_home?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          price_range?: string | null
          short_description?: string
          show_on_home?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          display_order: number | null
          event_type: string
          id: string
          is_active: boolean | null
          short_description: string
          show_on_home: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          display_order?: number | null
          event_type: string
          id?: string
          is_active?: boolean | null
          short_description: string
          show_on_home?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number | null
          event_type?: string
          id?: string
          is_active?: boolean | null
          short_description?: string
          show_on_home?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          background_audio_enabled: boolean | null
          background_audio_url: string | null
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          background_audio_enabled?: boolean | null
          background_audio_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          background_audio_enabled?: boolean | null
          background_audio_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          created_at: string
          display_order: number | null
          full_bio: string | null
          id: string
          is_active: boolean | null
          name: string
          photo_url: string | null
          role: string
          short_bio: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          full_bio?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          photo_url?: string | null
          role: string
          short_bio: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          full_bio?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          photo_url?: string | null
          role?: string
          short_bio?: string
          updated_at?: string
        }
        Relationships: []
      }
      trusted_clients: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          logo_url: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      portfolio_view: {
        Row: {
          album_url: string | null
          description: string | null
          display_order: number | null
          event_id: string | null
          event_title: string | null
          event_type: string | null
          id: string | null
          image_url: string | null
          is_before: boolean | null
          is_before_after: boolean | null
          location: string | null
          tag: string | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_portfolio_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      authenticate_admin: {
        Args: { input_email: string; input_password_hash: string }
        Returns: {
          admin_id: string
          email: string
          full_name: string
          is_active: boolean
          login_attempts: number
          needs_password_change: boolean
          role: string
        }[]
      }
      create_admin_user: {
        Args: {
          input_email: string
          input_full_name: string
          input_password_hash: string
          input_role?: string
        }
        Returns: string
      }
      get_admin_users_secure: {
        Args: Record<PropertyKey, never>
        Returns: {
          account_locked_until: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_failed_login: string
          last_login: string
          login_attempts: number
          password_changed_at: string
          role: string
          updated_at: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_by_email: {
        Args: { user_email: string }
        Returns: boolean
      }
      is_admin_or_initial_setup: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_secure: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_simple: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      unlock_admin_account: {
        Args: { admin_id: string }
        Returns: boolean
      }
      update_admin_password: {
        Args: { admin_id: string; new_password_hash: string }
        Returns: boolean
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
