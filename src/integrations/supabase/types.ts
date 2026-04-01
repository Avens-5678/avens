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
      b2b_hire_offers: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          offering_vendor_id: string
          price_per_unit: number
          quantity_available: number
          request_id: string
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          offering_vendor_id: string
          price_per_unit: number
          quantity_available?: number
          request_id: string
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          offering_vendor_id?: string
          price_per_unit?: number
          quantity_available?: number
          request_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_hire_offers_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "b2b_hire_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_hire_requests: {
        Row: {
          budget_per_unit: number | null
          created_at: string
          id: string
          item_name: string
          needed_date: string
          needed_till_date: string | null
          notes: string | null
          quantity_needed: number
          requesting_vendor_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          budget_per_unit?: number | null
          created_at?: string
          id?: string
          item_name: string
          needed_date: string
          needed_till_date?: string | null
          notes?: string | null
          quantity_needed?: number
          requesting_vendor_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          budget_per_unit?: number | null
          created_at?: string
          id?: string
          item_name?: string
          needed_date?: string
          needed_till_date?: string | null
          notes?: string | null
          quantity_needed?: number
          requesting_vendor_id?: string
          status?: string | null
          updated_at?: string
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
      company_settings: {
        Row: {
          address: string | null
          company_name: string
          created_at: string
          email: string | null
          gst_enabled: boolean
          gst_number: string | null
          id: string
          logo_url: string | null
          pan_number: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name?: string
          created_at?: string
          email?: string | null
          gst_enabled?: boolean
          gst_number?: string | null
          id?: string
          logo_url?: string | null
          pan_number?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string
          created_at?: string
          email?: string | null
          gst_enabled?: boolean
          gst_number?: string | null
          id?: string
          logo_url?: string | null
          pan_number?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      employee_permissions: {
        Row: {
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string | null
          employee_id: string
          id: string
          permission_category: string
          updated_at: string | null
        }
        Insert: {
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          employee_id: string
          id?: string
          permission_category: string
          updated_at?: string | null
        }
        Update: {
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          employee_id?: string
          id?: string
          permission_category?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      event_folder_members: {
        Row: {
          created_at: string
          folder_id: string
          id: string
          order_id: string | null
          role: string | null
          service_type: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string
          folder_id: string
          id?: string
          order_id?: string | null
          role?: string | null
          service_type?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string
          folder_id?: string
          id?: string
          order_id?: string | null
          role?: string | null
          service_type?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_folder_members_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "event_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      event_folders: {
        Row: {
          client_id: string
          created_at: string
          event_date: string | null
          id: string
          notes: string | null
          status: string | null
          title: string
          updated_at: string
          venue_order_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          event_date?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          title: string
          updated_at?: string
          venue_order_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          event_date?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          venue_order_id?: string | null
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
      event_timeline: {
        Row: {
          assigned_vendor_id: string | null
          created_at: string
          description: string | null
          display_order: number | null
          folder_id: string
          id: string
          reminder_sent: boolean | null
          time: string
          title: string
        }
        Insert: {
          assigned_vendor_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          folder_id: string
          id?: string
          reminder_sent?: boolean | null
          time: string
          title: string
        }
        Update: {
          assigned_vendor_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          folder_id?: string
          id?: string
          reminder_sent?: boolean | null
          time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_timeline_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "event_folders"
            referencedColumns: ["id"]
          },
        ]
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
      labor_shifts: {
        Row: {
          created_at: string
          daily_rate: number
          hours_worked: number | null
          id: string
          notes: string | null
          order_id: string | null
          paid_at: string | null
          shift_date: string
          status: string | null
          total_pay: number | null
          vendor_id: string
          worker_name: string
          worker_phone: string | null
        }
        Insert: {
          created_at?: string
          daily_rate?: number
          hours_worked?: number | null
          id?: string
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          shift_date: string
          status?: string | null
          total_pay?: number | null
          vendor_id: string
          worker_name: string
          worker_phone?: string | null
        }
        Update: {
          created_at?: string
          daily_rate?: number
          hours_worked?: number | null
          id?: string
          notes?: string | null
          order_id?: string | null
          paid_at?: string | null
          shift_date?: string
          status?: string | null
          total_pay?: number | null
          vendor_id?: string
          worker_name?: string
          worker_phone?: string | null
        }
        Relationships: []
      }
      logistics_config: {
        Row: {
          id: string
          labor_units_per_loader: number
          loader_daily_rate: number
          markup_percent: number
          min_booking_hours: number
          updated_at: string | null
        }
        Insert: {
          id?: string
          labor_units_per_loader?: number
          loader_daily_rate?: number
          markup_percent?: number
          min_booking_hours?: number
          updated_at?: string | null
        }
        Update: {
          id?: string
          labor_units_per_loader?: number
          loader_daily_rate?: number
          markup_percent?: number
          min_booking_hours?: number
          updated_at?: string | null
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
          is_lookbook: boolean | null
          linked_rental_ids: string[] | null
          lookbook_description: string | null
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
          is_lookbook?: boolean | null
          linked_rental_ids?: string[] | null
          lookbook_description?: string | null
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
          is_lookbook?: boolean | null
          linked_rental_ids?: string[] | null
          lookbook_description?: string | null
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
      pricing_rules: {
        Row: {
          applies_to: string
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          markup_default: number
          markup_max: number
          markup_min: number
          markup_type: string
          tier_key: string
          tier_label: string
          updated_at: string
        }
        Insert: {
          applies_to?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          markup_default?: number
          markup_max?: number
          markup_min?: number
          markup_type?: string
          tier_key: string
          tier_label: string
          updated_at?: string
        }
        Update: {
          applies_to?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          markup_default?: number
          markup_max?: number
          markup_min?: number
          markup_type?: string
          tier_key?: string
          tier_label?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_bundles: {
        Row: {
          bundle_items: Json
          created_at: string
          description: string | null
          discount_percent: number | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          total_price: number | null
          trigger_categories: string[] | null
          trigger_service_type: string | null
          updated_at: string
        }
        Insert: {
          bundle_items?: Json
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          total_price?: number | null
          trigger_categories?: string[] | null
          trigger_service_type?: string | null
          updated_at?: string
        }
        Update: {
          bundle_items?: Json
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          total_price?: number | null
          trigger_categories?: string[] | null
          trigger_service_type?: string | null
          updated_at?: string
        }
        Relationships: []
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
          warehouse_lat: number | null
          warehouse_lng: number | null
          warehouse_pincode: string | null
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
          warehouse_lat?: number | null
          warehouse_lng?: number | null
          warehouse_pincode?: string | null
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
          warehouse_lat?: number | null
          warehouse_lng?: number | null
          warehouse_pincode?: string | null
        }
        Relationships: []
      }
      promo_banners: {
        Row: {
          created_at: string
          cta_text: string | null
          display_order: number | null
          gradient_from: string | null
          gradient_to: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          linked_rental_ids: string[] | null
          service_type: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_text?: string | null
          display_order?: number | null
          gradient_from?: string | null
          gradient_to?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          linked_rental_ids?: string[] | null
          service_type?: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_text?: string | null
          display_order?: number | null
          gradient_from?: string | null
          gradient_to?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          linked_rental_ids?: string[] | null
          service_type?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      quote_line_items: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          item_description: string
          quantity: number
          quote_id: string
          total_price: number
          unit: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          item_description: string
          quantity?: number
          quote_id: string
          total_price?: number
          unit?: string | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          item_description?: string
          quantity?: number
          quote_id?: string
          total_price?: number
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_line_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          acceptance_token: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          created_by: string | null
          discount_amount: number | null
          discount_type: string | null
          discount_value: number | null
          gst_amount: number | null
          gst_percent: number | null
          id: string
          notes: string | null
          parent_quote_id: string | null
          quote_number: string
          sent_at: string | null
          sent_via: string | null
          signature_url: string | null
          signed_at: string | null
          source_order_id: string | null
          source_type: string
          status: string
          subtotal: number
          tax_type: string | null
          template: string | null
          total: number
          updated_at: string
          version: number | null
        }
        Insert: {
          acceptance_token?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          gst_amount?: number | null
          gst_percent?: number | null
          id?: string
          notes?: string | null
          parent_quote_id?: string | null
          quote_number?: string
          sent_at?: string | null
          sent_via?: string | null
          signature_url?: string | null
          signed_at?: string | null
          source_order_id?: string | null
          source_type?: string
          status?: string
          subtotal?: number
          tax_type?: string | null
          template?: string | null
          total?: number
          updated_at?: string
          version?: number | null
        }
        Update: {
          acceptance_token?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          gst_amount?: number | null
          gst_percent?: number | null
          id?: string
          notes?: string | null
          parent_quote_id?: string | null
          quote_number?: string
          sent_at?: string | null
          sent_via?: string | null
          signature_url?: string | null
          signed_at?: string | null
          source_order_id?: string | null
          source_type?: string
          status?: string
          subtotal?: number
          tax_type?: string | null
          template?: string | null
          total?: number
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_parent_quote_id_fkey"
            columns: ["parent_quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_orders: {
        Row: {
          action_token: string | null
          assigned_vendor_id: string | null
          booking_source: string | null
          budget: string | null
          check_in: string | null
          check_out: string | null
          client_email: string | null
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string
          equipment_category: string
          equipment_details: string | null
          event_date: string | null
          hold_id: string | null
          id: string
          is_offline: boolean | null
          is_vendor_direct: boolean | null
          location: string | null
          manpower_fee: number | null
          notes: string | null
          platform_fee: number | null
          status: string
          title: string
          transport_fee: number | null
          updated_at: string
          vendor_inventory_item_id: string | null
          vendor_payout: number | null
          vendor_quote_amount: number | null
          vendor_responded_at: string | null
          vendor_response: string | null
          venue_lat: number | null
          venue_lng: number | null
          venue_pincode: string | null
          whatsapp_sent_at: string | null
        }
        Insert: {
          action_token?: string | null
          assigned_vendor_id?: string | null
          booking_source?: string | null
          budget?: string | null
          check_in?: string | null
          check_out?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          equipment_category?: string
          equipment_details?: string | null
          event_date?: string | null
          hold_id?: string | null
          id?: string
          is_offline?: boolean | null
          is_vendor_direct?: boolean | null
          location?: string | null
          manpower_fee?: number | null
          notes?: string | null
          platform_fee?: number | null
          status?: string
          title: string
          transport_fee?: number | null
          updated_at?: string
          vendor_inventory_item_id?: string | null
          vendor_payout?: number | null
          vendor_quote_amount?: number | null
          vendor_responded_at?: string | null
          vendor_response?: string | null
          venue_lat?: number | null
          venue_lng?: number | null
          venue_pincode?: string | null
          whatsapp_sent_at?: string | null
        }
        Update: {
          action_token?: string | null
          assigned_vendor_id?: string | null
          booking_source?: string | null
          budget?: string | null
          check_in?: string | null
          check_out?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          equipment_category?: string
          equipment_details?: string | null
          event_date?: string | null
          hold_id?: string | null
          id?: string
          is_offline?: boolean | null
          is_vendor_direct?: boolean | null
          location?: string | null
          manpower_fee?: number | null
          notes?: string | null
          platform_fee?: number | null
          status?: string
          title?: string
          transport_fee?: number | null
          updated_at?: string
          vendor_inventory_item_id?: string | null
          vendor_payout?: number | null
          vendor_quote_amount?: number | null
          vendor_responded_at?: string | null
          vendor_response?: string | null
          venue_lat?: number | null
          venue_lng?: number | null
          venue_pincode?: string | null
          whatsapp_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_orders_hold_id_fkey"
            columns: ["hold_id"]
            isOneToOne: false
            referencedRelation: "reservation_holds"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_reviews: {
        Row: {
          created_at: string
          id: string
          is_approved: boolean | null
          rating: number
          rental_id: string
          review_text: string
          reviewer_email: string | null
          reviewer_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_approved?: boolean | null
          rating: number
          rental_id: string
          review_text: string
          reviewer_email?: string | null
          reviewer_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_approved?: boolean | null
          rating?: number
          rental_id?: string
          review_text?: string
          reviewer_email?: string | null
          reviewer_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rental_reviews_rental_id_fkey"
            columns: ["rental_id"]
            isOneToOne: false
            referencedRelation: "rentals"
            referencedColumns: ["id"]
          },
        ]
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
          advance_amount: number | null
          amenities: string[] | null
          av_equipment: boolean | null
          cancellation_policy: string | null
          categories: string[] | null
          catering_type: string | null
          created_at: string
          description: string
          display_order: number | null
          experience_level: string | null
          guest_capacity: string | null
          has_variants: boolean | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          is_active: boolean | null
          markup_tier: string | null
          max_capacity: number | null
          min_capacity: number | null
          num_halls: number | null
          parking_available: boolean | null
          price_range: string | null
          price_value: number | null
          pricing_packages: Json | null
          pricing_unit: string | null
          quantity: number | null
          rating: number | null
          refund_rules: string | null
          rooms_available: number | null
          search_keywords: string | null
          seating_types: string[] | null
          service_type: string
          short_description: string
          show_on_home: boolean | null
          size_options: string[] | null
          slot_types: string[] | null
          specifications: Json | null
          title: string
          updated_at: string
          venue_type: string | null
          video_url: string | null
          volume_units: number
          weekday_price: number | null
          weekend_price: number | null
        }
        Insert: {
          address?: string | null
          advance_amount?: number | null
          amenities?: string[] | null
          av_equipment?: boolean | null
          cancellation_policy?: string | null
          categories?: string[] | null
          catering_type?: string | null
          created_at?: string
          description: string
          display_order?: number | null
          experience_level?: string | null
          guest_capacity?: string | null
          has_variants?: boolean | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_active?: boolean | null
          markup_tier?: string | null
          max_capacity?: number | null
          min_capacity?: number | null
          num_halls?: number | null
          parking_available?: boolean | null
          price_range?: string | null
          price_value?: number | null
          pricing_packages?: Json | null
          pricing_unit?: string | null
          quantity?: number | null
          rating?: number | null
          refund_rules?: string | null
          rooms_available?: number | null
          search_keywords?: string | null
          seating_types?: string[] | null
          service_type?: string
          short_description: string
          show_on_home?: boolean | null
          size_options?: string[] | null
          slot_types?: string[] | null
          specifications?: Json | null
          title: string
          updated_at?: string
          venue_type?: string | null
          video_url?: string | null
          volume_units?: number
          weekday_price?: number | null
          weekend_price?: number | null
        }
        Update: {
          address?: string | null
          advance_amount?: number | null
          amenities?: string[] | null
          av_equipment?: boolean | null
          cancellation_policy?: string | null
          categories?: string[] | null
          catering_type?: string | null
          created_at?: string
          description?: string
          display_order?: number | null
          experience_level?: string | null
          guest_capacity?: string | null
          has_variants?: boolean | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          is_active?: boolean | null
          markup_tier?: string | null
          max_capacity?: number | null
          min_capacity?: number | null
          num_halls?: number | null
          parking_available?: boolean | null
          price_range?: string | null
          price_value?: number | null
          pricing_packages?: Json | null
          pricing_unit?: string | null
          quantity?: number | null
          rating?: number | null
          refund_rules?: string | null
          rooms_available?: number | null
          search_keywords?: string | null
          seating_types?: string[] | null
          service_type?: string
          short_description?: string
          show_on_home?: boolean | null
          size_options?: string[] | null
          slot_types?: string[] | null
          specifications?: Json | null
          title?: string
          updated_at?: string
          venue_type?: string | null
          video_url?: string | null
          volume_units?: number
          weekday_price?: number | null
          weekend_price?: number | null
        }
        Relationships: []
      }
      reservation_holds: {
        Row: {
          check_in: string
          check_out: string
          created_at: string
          expires_at: string
          id: string
          quantity: number
          rental_id: string
          session_id: string
          slot: string
          status: string
          user_id: string | null
          variant_id: string | null
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string
          expires_at?: string
          id?: string
          quantity?: number
          rental_id: string
          session_id: string
          slot?: string
          status?: string
          user_id?: string | null
          variant_id?: string | null
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string
          expires_at?: string
          id?: string
          quantity?: number
          rental_id?: string
          session_id?: string
          slot?: string
          status?: string
          user_id?: string | null
          variant_id?: string | null
        }
        Relationships: []
      }
      seasonal_pricing: {
        Row: {
          created_at: string
          end_date: string
          id: string
          inventory_item_id: string
          is_active: boolean
          price_multiplier: number
          season_name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          inventory_item_id: string
          is_active?: boolean
          price_multiplier?: number
          season_name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          inventory_item_id?: string
          is_active?: boolean
          price_multiplier?: number
          season_name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seasonal_pricing_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "vendor_inventory"
            referencedColumns: ["id"]
          },
        ]
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
      service_orders: {
        Row: {
          admin_notes: string | null
          budget: string | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string
          event_date: string | null
          event_end_date: string | null
          guest_count: number | null
          id: string
          location: string | null
          notes: string | null
          service_details: string | null
          service_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          budget?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          event_date?: string | null
          event_end_date?: string | null
          guest_count?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          service_details?: string | null
          service_type?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          budget?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          event_date?: string | null
          event_end_date?: string | null
          guest_count?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          service_details?: string | null
          service_type?: string
          status?: string
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
      site_visit_requests: {
        Row: {
          client_email: string | null
          client_id: string
          client_name: string
          client_phone: string
          created_at: string
          deposit_amount: number | null
          deposit_status: string | null
          id: string
          notes: string | null
          preferred_date: string
          preferred_slot: string | null
          updated_at: string
          venue_id: string
          visit_status: string | null
        }
        Insert: {
          client_email?: string | null
          client_id: string
          client_name: string
          client_phone: string
          created_at?: string
          deposit_amount?: number | null
          deposit_status?: string | null
          id?: string
          notes?: string | null
          preferred_date: string
          preferred_slot?: string | null
          updated_at?: string
          venue_id: string
          visit_status?: string | null
        }
        Update: {
          client_email?: string | null
          client_id?: string
          client_name?: string
          client_phone?: string
          created_at?: string
          deposit_amount?: number | null
          deposit_status?: string | null
          id?: string
          notes?: string | null
          preferred_date?: string
          preferred_slot?: string | null
          updated_at?: string
          venue_id?: string
          visit_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_visit_requests_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "vendor_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
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
      transport_tiers: {
        Row: {
          base_fee: number
          created_at: string | null
          id: string
          max_km: number | null
          min_km: number
          per_km_fee: number | null
          vehicle_type: string | null
        }
        Insert: {
          base_fee: number
          created_at?: string | null
          id?: string
          max_km?: number | null
          min_km?: number
          per_km_fee?: number | null
          vehicle_type?: string | null
        }
        Update: {
          base_fee?: number
          created_at?: string | null
          id?: string
          max_km?: number | null
          min_km?: number
          per_km_fee?: number | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      trust_strip_items: {
        Row: {
          created_at: string
          display_order: number | null
          icon_name: string
          id: string
          is_active: boolean | null
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          icon_name?: string
          id?: string
          is_active?: boolean | null
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          icon_name?: string
          id?: string
          is_active?: boolean | null
          text?: string
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
      vehicle_tiers: {
        Row: {
          base_fare: number
          created_at: string | null
          display_order: number | null
          id: string
          max_volume_units: number | null
          min_volume_units: number
          night_surge_multiplier: number
          per_km_rate: number
          updated_at: string | null
          vehicle_type: string
        }
        Insert: {
          base_fare?: number
          created_at?: string | null
          display_order?: number | null
          id?: string
          max_volume_units?: number | null
          min_volume_units?: number
          night_surge_multiplier?: number
          per_km_rate?: number
          updated_at?: string | null
          vehicle_type: string
        }
        Update: {
          base_fare?: number
          created_at?: string | null
          display_order?: number | null
          id?: string
          max_volume_units?: number | null
          min_volume_units?: number
          night_surge_multiplier?: number
          per_km_rate?: number
          updated_at?: string | null
          vehicle_type?: string
        }
        Relationships: []
      }
      vendor_availability: {
        Row: {
          booking_order_id: string | null
          created_at: string
          date: string
          id: string
          inventory_item_id: string | null
          is_auto_blocked: boolean | null
          is_booked: boolean | null
          notes: string | null
          slot: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          booking_order_id?: string | null
          created_at?: string
          date: string
          id?: string
          inventory_item_id?: string | null
          is_auto_blocked?: boolean | null
          is_booked?: boolean | null
          notes?: string | null
          slot?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          booking_order_id?: string | null
          created_at?: string
          date?: string
          id?: string
          inventory_item_id?: string | null
          is_auto_blocked?: boolean | null
          is_booked?: boolean | null
          notes?: string | null
          slot?: string | null
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
          address: string | null
          advance_amount: number | null
          amenities: string[] | null
          amenities_matrix: Json | null
          av_equipment: boolean | null
          cancellation_policy: string | null
          categories: string[] | null
          category: string | null
          catering_type: string | null
          created_at: string
          crew_type: string | null
          description: string | null
          display_order: number | null
          experience_level: string | null
          guest_capacity: string | null
          has_variants: boolean | null
          house_rules: string[] | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          instagram_url: string | null
          is_available: boolean
          is_verified: boolean | null
          labor_weight: number
          markup_tier: string | null
          max_capacity: number | null
          min_capacity: number | null
          name: string
          num_halls: number | null
          packages: Json | null
          parking_available: boolean | null
          portfolio_urls: string[] | null
          price_per_day: number | null
          price_value: number | null
          pricing_packages: Json | null
          pricing_unit: string | null
          quantity: number
          refund_rules: string | null
          rooms_available: number | null
          search_keywords: string | null
          seating_types: string[] | null
          service_type: string
          short_description: string | null
          slot_types: string[] | null
          updated_at: string
          vendor_base_price: number | null
          vendor_id: string
          venue_pricing_model: string | null
          venue_type: string | null
          verified_at: string | null
          verified_by: string | null
          video_url: string | null
          virtual_tour_url: string | null
          volume_units: number
          weekday_price: number | null
          weekend_price: number | null
        }
        Insert: {
          address?: string | null
          advance_amount?: number | null
          amenities?: string[] | null
          amenities_matrix?: Json | null
          av_equipment?: boolean | null
          cancellation_policy?: string | null
          categories?: string[] | null
          category?: string | null
          catering_type?: string | null
          created_at?: string
          crew_type?: string | null
          description?: string | null
          display_order?: number | null
          experience_level?: string | null
          guest_capacity?: string | null
          has_variants?: boolean | null
          house_rules?: string[] | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          instagram_url?: string | null
          is_available?: boolean
          is_verified?: boolean | null
          labor_weight?: number
          markup_tier?: string | null
          max_capacity?: number | null
          min_capacity?: number | null
          name: string
          num_halls?: number | null
          packages?: Json | null
          parking_available?: boolean | null
          portfolio_urls?: string[] | null
          price_per_day?: number | null
          price_value?: number | null
          pricing_packages?: Json | null
          pricing_unit?: string | null
          quantity?: number
          refund_rules?: string | null
          rooms_available?: number | null
          search_keywords?: string | null
          seating_types?: string[] | null
          service_type?: string
          short_description?: string | null
          slot_types?: string[] | null
          updated_at?: string
          vendor_base_price?: number | null
          vendor_id: string
          venue_pricing_model?: string | null
          venue_type?: string | null
          verified_at?: string | null
          verified_by?: string | null
          video_url?: string | null
          virtual_tour_url?: string | null
          volume_units?: number
          weekday_price?: number | null
          weekend_price?: number | null
        }
        Update: {
          address?: string | null
          advance_amount?: number | null
          amenities?: string[] | null
          amenities_matrix?: Json | null
          av_equipment?: boolean | null
          cancellation_policy?: string | null
          categories?: string[] | null
          category?: string | null
          catering_type?: string | null
          created_at?: string
          crew_type?: string | null
          description?: string | null
          display_order?: number | null
          experience_level?: string | null
          guest_capacity?: string | null
          has_variants?: boolean | null
          house_rules?: string[] | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          instagram_url?: string | null
          is_available?: boolean
          is_verified?: boolean | null
          labor_weight?: number
          markup_tier?: string | null
          max_capacity?: number | null
          min_capacity?: number | null
          name?: string
          num_halls?: number | null
          packages?: Json | null
          parking_available?: boolean | null
          portfolio_urls?: string[] | null
          price_per_day?: number | null
          price_value?: number | null
          pricing_packages?: Json | null
          pricing_unit?: string | null
          quantity?: number
          refund_rules?: string | null
          rooms_available?: number | null
          search_keywords?: string | null
          seating_types?: string[] | null
          service_type?: string
          short_description?: string | null
          slot_types?: string[] | null
          updated_at?: string
          vendor_base_price?: number | null
          vendor_id?: string
          venue_pricing_model?: string | null
          venue_type?: string | null
          verified_at?: string | null
          verified_by?: string | null
          video_url?: string | null
          virtual_tour_url?: string | null
          volume_units?: number
          weekday_price?: number | null
          weekend_price?: number | null
        }
        Relationships: []
      }
      vendor_inventory_variants: {
        Row: {
          attribute_type: string
          attribute_value: string
          created_at: string
          display_order: number | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          inventory_item_id: string
          is_active: boolean | null
          price_value: number | null
          pricing_unit: string | null
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
          inventory_item_id: string
          is_active?: boolean | null
          price_value?: number | null
          pricing_unit?: string | null
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
          inventory_item_id?: string
          is_active?: boolean | null
          price_value?: number | null
          pricing_unit?: string | null
          stock_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_inventory_variants_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "vendor_inventory"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_metrics: {
        Row: {
          avg_rating: number | null
          avg_response_time_hours: number | null
          booking_success_rate: number | null
          created_at: string | null
          id: string
          is_sponsored: boolean | null
          rank_score: number | null
          total_reviews: number | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          avg_rating?: number | null
          avg_response_time_hours?: number | null
          booking_success_rate?: number | null
          created_at?: string | null
          id?: string
          is_sponsored?: boolean | null
          rank_score?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          avg_rating?: number | null
          avg_response_time_hours?: number | null
          booking_success_rate?: number | null
          created_at?: string | null
          id?: string
          is_sponsored?: boolean | null
          rank_score?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: []
      }
      venue_holds: {
        Row: {
          amount_paid: number
          created_at: string
          expires_at: string
          hold_date: string
          id: string
          payment_id: string | null
          slot: string | null
          status: string
          updated_at: string
          user_id: string
          venue_id: string
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          expires_at?: string
          hold_date: string
          id?: string
          payment_id?: string | null
          slot?: string | null
          status?: string
          updated_at?: string
          user_id: string
          venue_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          expires_at?: string
          hold_date?: string
          id?: string
          payment_id?: string | null
          slot?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          venue_id?: string
        }
        Relationships: []
      }
      whatsapp_assignment_rules: {
        Row: {
          created_at: string | null
          eligible_employee_ids: string[] | null
          id: string
          is_auto_assign: boolean | null
          last_assigned_index: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          eligible_employee_ids?: string[] | null
          id?: string
          is_auto_assign?: boolean | null
          last_assigned_index?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          eligible_employee_ids?: string[] | null
          id?: string
          is_auto_assign?: boolean | null
          last_assigned_index?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_campaign_recipients: {
        Row: {
          campaign_id: string
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          id: string
          phone_number: string
          read_at: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          phone_number: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          phone_number?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_campaigns: {
        Row: {
          audience_filter: Json | null
          created_at: string | null
          created_by: string | null
          delivered_count: number | null
          failed_count: number | null
          id: string
          read_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string | null
          template_name: string
          total_recipients: number | null
          updated_at: string | null
        }
        Insert: {
          audience_filter?: Json | null
          created_at?: string | null
          created_by?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          id?: string
          read_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          template_name: string
          total_recipients?: number | null
          updated_at?: string | null
        }
        Update: {
          audience_filter?: Json | null
          created_at?: string | null
          created_by?: string | null
          delivered_count?: number | null
          failed_count?: number | null
          id?: string
          read_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          template_name?: string
          total_recipients?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_contacts: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          name: string | null
          opted_in: boolean | null
          opted_in_at: string | null
          phone_number: string
          tags: string[] | null
          total_conversations: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          name?: string | null
          opted_in?: boolean | null
          opted_in_at?: string | null
          phone_number: string
          tags?: string[] | null
          total_conversations?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          name?: string | null
          opted_in?: boolean | null
          opted_in_at?: string | null
          phone_number?: string
          tags?: string[] | null
          total_conversations?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      whatsapp_conversations: {
        Row: {
          admin_user_id: string | null
          created_at: string | null
          direction: string
          id: string
          is_resolved: boolean | null
          message_text: string
          phone_number: string
          sent_by: string
          session_id: string
        }
        Insert: {
          admin_user_id?: string | null
          created_at?: string | null
          direction?: string
          id?: string
          is_resolved?: boolean | null
          message_text: string
          phone_number: string
          sent_by?: string
          session_id: string
        }
        Update: {
          admin_user_id?: string | null
          created_at?: string | null
          direction?: string
          id?: string
          is_resolved?: boolean | null
          message_text?: string
          phone_number?: string
          sent_by?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_conversations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_sessions: {
        Row: {
          assigned_at: string | null
          assigned_employee_id: string | null
          assignment_type: string | null
          created_at: string | null
          current_flow: string | null
          flow_data: Json | null
          id: string
          last_message_at: string | null
          phone_number: string
          updated_at: string | null
          user_id: string | null
          user_type: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_employee_id?: string | null
          assignment_type?: string | null
          created_at?: string | null
          current_flow?: string | null
          flow_data?: Json | null
          id?: string
          last_message_at?: string | null
          phone_number: string
          updated_at?: string | null
          user_id?: string | null
          user_type?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_employee_id?: string | null
          assignment_type?: string | null
          created_at?: string | null
          current_flow?: string | null
          flow_data?: Json | null
          id?: string
          last_message_at?: string | null
          phone_number?: string
          updated_at?: string | null
          user_id?: string | null
          user_type?: string | null
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
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
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
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      calculate_vendor_rank_score: {
        Args: {
          _avg_rating: number
          _avg_response_time_hours: number
          _booking_success_rate: number
          _is_sponsored: boolean
        }
        Returns: number
      }
      check_email_type: { Args: { check_email: string }; Returns: Json }
      cleanup_expired_holds: { Args: never; Returns: undefined }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      employee_has_permission: {
        Args: { _category: string; _type?: string; _user_id: string }
        Returns: boolean
      }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_available_inventory: {
        Args: {
          p_check_in: string
          p_check_out: string
          p_rental_id: string
          p_slot?: string
        }
        Returns: Json
      }
      get_quote_by_token: {
        Args: { _token: string }
        Returns: {
          acceptance_token: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          created_by: string | null
          discount_amount: number | null
          discount_type: string | null
          discount_value: number | null
          gst_amount: number | null
          gst_percent: number | null
          id: string
          notes: string | null
          parent_quote_id: string | null
          quote_number: string
          sent_at: string | null
          sent_via: string | null
          signature_url: string | null
          signed_at: string | null
          source_order_id: string | null
          source_type: string
          status: string
          subtotal: number
          tax_type: string | null
          template: string | null
          total: number
          updated_at: string
          version: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "quotes"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_quote_line_items_by_token: {
        Args: { _token: string }
        Returns: {
          created_at: string
          display_order: number | null
          id: string
          item_description: string
          quantity: number
          quote_id: string
          total_price: number
          unit: string | null
          unit_price: number
        }[]
        SetofOptions: {
          from: "*"
          to: "quote_line_items"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_user_role: { Args: { _user_id: string }; Returns: string }
      gettransactionid: { Args: never; Returns: unknown }
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
      longtransactionsenabled: { Args: never; Returns: boolean }
      lookup_order_by_id: { Args: { order_id: string }; Returns: Json }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      sign_quote_by_token: {
        Args: { _signature_url: string; _token: string }
        Returns: boolean
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
      validate_admin_email: { Args: { check_email: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "client" | "vendor" | "employee"
      request_status:
        | "pending"
        | "approved"
        | "in_progress"
        | "completed"
        | "cancelled"
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
      app_role: ["admin", "client", "vendor", "employee"],
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
