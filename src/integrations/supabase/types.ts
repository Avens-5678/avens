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
      event_requests: {
        Row: {
          admin_notes: string | null
          assigned_vendor_id: string | null
          budget: string | null
          client_id: string
          created_at: string
          event_date: string | null
          event_type: string
          guest_count: number | null
          id: string
          location: string | null
          requirements: string | null
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          assigned_vendor_id?: string | null
          budget?: string | null
          client_id: string
          created_at?: string
          event_date?: string | null
          event_type: string
          guest_count?: number | null
          id?: string
          location?: string | null
          requirements?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          assigned_vendor_id?: string | null
          budget?: string | null
          client_id?: string
          created_at?: string
          event_date?: string | null
          event_type?: string
          guest_count?: number | null
          id?: string
          location?: string | null
          requirements?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          cta_button_text: string | null
          cta_description: string | null
          cta_title: string | null
          default_portfolio_tags: string[] | null
          description: string
          event_type: string
          hero_cta_text: string | null
          hero_description: string | null
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
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
          cta_button_text?: string | null
          cta_description?: string | null
          cta_title?: string | null
          default_portfolio_tags?: string[] | null
          description: string
          event_type: string
          hero_cta_text?: string | null
          hero_description?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
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
          cta_button_text?: string | null
          cta_description?: string | null
          cta_title?: string | null
          default_portfolio_tags?: string[] | null
          description?: string
          event_type?: string
          hero_cta_text?: string | null
          hero_description?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
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
      faq: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          created_at: string
          email: string
          event_date: string | null
          event_type: string | null
          form_type: string
          id: string
          location: string | null
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
          event_date?: string | null
          event_type?: string | null
          form_type: string
          id?: string
          location?: string | null
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
          event_date?: string | null
          event_type?: string | null
          form_type?: string
          id?: string
          location?: string | null
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
          hero_text_1: string | null
          hero_text_2: string | null
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
          hero_text_1?: string | null
          hero_text_2?: string | null
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
          hero_text_1?: string | null
          hero_text_2?: string | null
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
          show_on_home: boolean | null
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
          show_on_home?: boolean | null
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
          show_on_home?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio: {
        Row: {
          after_image_url: string | null
          album_url: string | null
          before_image_url: string | null
          created_at: string
          display_order: number | null
          event_id: string
          id: string
          image_url: string
          is_before: boolean | null
          is_before_after: boolean | null
          show_on_home: boolean | null
          tag: string | null
          title: string
          updated_at: string
        }
        Insert: {
          after_image_url?: string | null
          album_url?: string | null
          before_image_url?: string | null
          created_at?: string
          display_order?: number | null
          event_id: string
          id?: string
          image_url: string
          is_before?: boolean | null
          is_before_after?: boolean | null
          show_on_home?: boolean | null
          tag?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          after_image_url?: string | null
          album_url?: string | null
          before_image_url?: string | null
          created_at?: string
          display_order?: number | null
          event_id?: string
          id?: string
          image_url?: string
          is_before?: boolean | null
          is_before_after?: boolean | null
          show_on_home?: boolean | null
          tag?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
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
          address: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          godown_address: string | null
          gst_number: string | null
          id: string
          pan_number: string | null
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          godown_address?: string | null
          gst_number?: string | null
          id?: string
          pan_number?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          godown_address?: string | null
          gst_number?: string | null
          id?: string
          pan_number?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rental_orders: {
        Row: {
          action_token: string | null
          assigned_vendor_id: string | null
          budget: string | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string
          equipment_category: string
          equipment_details: string | null
          event_date: string | null
          id: string
          location: string | null
          notes: string | null
          status: string
          title: string
          updated_at: string
          vendor_quote_amount: number | null
          vendor_responded_at: string | null
          vendor_response: string | null
          whatsapp_sent_at: string | null
        }
        Insert: {
          action_token?: string | null
          assigned_vendor_id?: string | null
          budget?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          equipment_category?: string
          equipment_details?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          status?: string
          title: string
          updated_at?: string
          vendor_quote_amount?: number | null
          vendor_responded_at?: string | null
          vendor_response?: string | null
          whatsapp_sent_at?: string | null
        }
        Update: {
          action_token?: string | null
          assigned_vendor_id?: string | null
          budget?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          equipment_category?: string
          equipment_details?: string | null
          event_date?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          status?: string
          title?: string
          updated_at?: string
          vendor_quote_amount?: number | null
          vendor_responded_at?: string | null
          vendor_response?: string | null
          whatsapp_sent_at?: string | null
        }
        Relationships: []
      }
      rental_variants: {
        Row: {
          attribute_type: string
          attribute_value: string
          created_at: string
          display_order: number | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          is_active: boolean | null
          price_value: number | null
          pricing_unit: string | null
          rental_id: string
          stock_quantity: number | null
          updated_at: string
        }
        Insert: {
          attribute_type?: string
          attribute_value: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_active?: boolean | null
          price_value?: number | null
          pricing_unit?: string | null
          rental_id: string
          stock_quantity?: number | null
          updated_at?: string
        }
        Update: {
          attribute_type?: string
          attribute_value?: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_active?: boolean | null
          price_value?: number | null
          pricing_unit?: string | null
          rental_id?: string
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_variants_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
      }
      rentals: {
        Row: {
          address: string | null
          categories: string[] | null
          created_at: string
          description: string
          display_order: number | null
          has_variants: boolean | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          is_active: boolean | null
          price_range: string | null
          price_value: number | null
          pricing_unit: string | null
          quantity: number | null
          rating: number | null
          search_keywords: string | null
          short_description: string
          show_on_home: boolean | null
          size_options: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          categories?: string[] | null
          created_at?: string
          description: string
          display_order?: number | null
          has_variants?: boolean | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_active?: boolean | null
          price_range?: string | null
          price_value?: number | null
          pricing_unit?: string | null
          quantity?: number | null
          rating?: number | null
          search_keywords?: string | null
          short_description: string
          show_on_home?: boolean | null
          size_options?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          categories?: string[] | null
          created_at?: string
          description?: string
          display_order?: number | null
          has_variants?: boolean | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_active?: boolean | null
          price_range?: string | null
          price_value?: number | null
          pricing_unit?: string | null
          quantity?: number | null
          rating?: number | null
          search_keywords?: string | null
          short_description?: string
          show_on_home?: boolean | null
          size_options?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
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
          image_url: string | null
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
          image_url?: string | null
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
          image_url?: string | null
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_availability: {
        Row: {
          created_at: string
          date: string
          id: string
          inventory_item_id: string | null
          is_booked: boolean | null
          notes: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          inventory_item_id?: string | null
          is_booked?: boolean | null
          notes?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          inventory_item_id?: string | null
          is_booked?: boolean | null
          notes?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_availability_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "vendor_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_inventory: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          is_verified: boolean | null
          name: string
          price_per_day: number | null
          quantity: number
          updated_at: string
          vendor_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_verified?: boolean | null
          name: string
          price_per_day?: number | null
          quantity?: number
          updated_at?: string
          vendor_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          is_verified?: boolean | null
          name?: string
          price_per_day?: number | null
          quantity?: number
          updated_at?: string
          vendor_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      admin_users_safe: {
        Row: {
          account_locked_until: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          is_active: boolean | null
          last_failed_login: string | null
          last_login: string | null
          login_attempts: number | null
          password_changed_at: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          account_locked_until?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          last_failed_login?: string | null
          last_login?: string | null
          login_attempts?: number | null
          password_changed_at?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          account_locked_until?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          last_failed_login?: string | null
          last_login?: string | null
          login_attempts?: number | null
          password_changed_at?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
      check_email_type: { Args: { check_email: string }; Returns: Json }
      get_user_role: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_secure: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      validate_admin_email: { Args: { check_email: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "client" | "vendor"
      request_status:
        | "pending"
        | "approved"
        | "in_progress"
        | "completed"
        | "cancelled"
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
      app_role: ["admin", "client", "vendor"],
      request_status: [
        "pending",
        "approved",
        "in_progress",
        "completed",
        "cancelled",
      ],
    },
  },
} as const
