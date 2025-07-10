export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      appointment_schedulers: {
        Row: {
          active: boolean
          availability: Json
          buffer_time: number
          created_at: string
          description: string | null
          duration: number
          id: string
          image_url: string | null
          locations: Json
          max_advance_booking: number
          min_advance_notice: number
          name: string
          slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          availability?: Json
          buffer_time?: number
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          image_url?: string | null
          locations?: Json
          max_advance_booking?: number
          min_advance_notice?: number
          name: string
          slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          availability?: Json
          buffer_time?: number
          created_at?: string
          description?: string | null
          duration?: number
          id?: string
          image_url?: string | null
          locations?: Json
          max_advance_booking?: number
          min_advance_notice?: number
          name?: string
          slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_type: string
          client_id: string | null
          created_at: string
          description: string | null
          end_time: string
          id: string
          location: string | null
          project_id: string | null
          start_time: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_type: string
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          project_id?: string | null
          start_time: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_type?: string
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          project_id?: string | null
          start_time?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments_booked: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          location_type: string
          notes: string | null
          scheduler_id: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          location_type: string
          notes?: string | null
          scheduler_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          location_type?: string
          notes?: string | null
          scheduler_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_booked_scheduler_id_fkey"
            columns: ["scheduler_id"]
            isOneToOne: false
            referencedRelation: "appointment_schedulers"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          abn: string | null
          auto_calculate_fabric: boolean | null
          auto_generate_work_orders: boolean | null
          business_address: string | null
          business_email: string | null
          business_phone: string | null
          closing_time: string | null
          company_logo_url: string | null
          company_name: string | null
          created_at: string
          default_markup: number | null
          default_tax_rate: number | null
          email_quote_notifications: boolean | null
          id: string
          installation_lead_days: number | null
          labor_rate: number | null
          low_stock_alerts: boolean | null
          measurement_units: string | null
          opening_time: string | null
          quote_validity_days: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          abn?: string | null
          auto_calculate_fabric?: boolean | null
          auto_generate_work_orders?: boolean | null
          business_address?: string | null
          business_email?: string | null
          business_phone?: string | null
          closing_time?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          default_markup?: number | null
          default_tax_rate?: number | null
          email_quote_notifications?: boolean | null
          id?: string
          installation_lead_days?: number | null
          labor_rate?: number | null
          low_stock_alerts?: boolean | null
          measurement_units?: string | null
          opening_time?: string | null
          quote_validity_days?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          abn?: string | null
          auto_calculate_fabric?: boolean | null
          auto_generate_work_orders?: boolean | null
          business_address?: string | null
          business_email?: string | null
          business_phone?: string | null
          closing_time?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string
          default_markup?: number | null
          default_tax_rate?: number | null
          email_quote_notifications?: boolean | null
          id?: string
          installation_lead_days?: number | null
          labor_rate?: number | null
          low_stock_alerts?: boolean | null
          measurement_units?: string | null
          opening_time?: string | null
          quote_validity_days?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      calculation_formulas: {
        Row: {
          active: boolean | null
          category: string
          created_at: string
          description: string | null
          formula_expression: string
          id: string
          name: string
          updated_at: string
          user_id: string
          variables: Json | null
        }
        Insert: {
          active?: boolean | null
          category: string
          created_at?: string
          description?: string | null
          formula_expression: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
          variables?: Json | null
        }
        Update: {
          active?: boolean | null
          category?: string
          created_at?: string
          description?: string | null
          formula_expression?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      canvas_designs: {
        Row: {
          created_at: string
          design_data: Json
          id: string
          preview_image_url: string | null
          product_configuration_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          design_data?: Json
          id?: string
          preview_image_url?: string | null
          product_configuration_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          design_data?: Json
          id?: string
          preview_image_url?: string | null
          product_configuration_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "canvas_designs_product_configuration_id_fkey"
            columns: ["product_configuration_id"]
            isOneToOne: false
            referencedRelation: "product_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          client_type: string | null
          company_name: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          client_type?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          client_type?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_analytics: {
        Row: {
          created_at: string
          email_id: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email_id: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email_id?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_analytics_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      email_campaigns: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          recipient_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          active: boolean
          created_at: string
          from_email: string
          from_name: string
          id: string
          reply_to_email: string | null
          signature: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          from_email: string
          from_name: string
          id?: string
          reply_to_email?: string | null
          signature?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          from_email?: string
          from_name?: string
          id?: string
          reply_to_email?: string | null
          signature?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          active: boolean | null
          content: string
          created_at: string
          id: string
          name: string
          subject: string
          template_type: string
          updated_at: string
          user_id: string
          variables: Json | null
        }
        Insert: {
          active?: boolean | null
          content: string
          created_at?: string
          id?: string
          name: string
          subject: string
          template_type?: string
          updated_at?: string
          user_id: string
          variables?: Json | null
        }
        Update: {
          active?: boolean | null
          content?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string
          template_type?: string
          updated_at?: string
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      emails: {
        Row: {
          bounce_reason: string | null
          campaign_id: string | null
          click_count: number | null
          clicked_at: string | null
          client_id: string | null
          content: string
          created_at: string
          delivered_at: string | null
          id: string
          open_count: number | null
          opened_at: string | null
          recipient_email: string
          recipient_name: string | null
          sendgrid_message_id: string | null
          sent_at: string | null
          status: string
          subject: string
          template_id: string | null
          time_spent_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bounce_reason?: string | null
          campaign_id?: string | null
          click_count?: number | null
          clicked_at?: string | null
          client_id?: string | null
          content: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          open_count?: number | null
          opened_at?: string | null
          recipient_email: string
          recipient_name?: string | null
          sendgrid_message_id?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template_id?: string | null
          time_spent_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bounce_reason?: string | null
          campaign_id?: string | null
          click_count?: number | null
          clicked_at?: string | null
          client_id?: string | null
          content?: string
          created_at?: string
          delivered_at?: string | null
          id?: string
          open_count?: number | null
          opened_at?: string | null
          recipient_email?: string
          recipient_name?: string | null
          sendgrid_message_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          time_spent_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emails_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emails_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      fabric_calculations_cache: {
        Row: {
          calculation_hash: string
          cost_breakdown: Json
          created_at: string
          fabric_usage_data: Json
          id: string
          making_cost_id: string | null
          user_id: string
          window_covering_id: string
        }
        Insert: {
          calculation_hash: string
          cost_breakdown: Json
          created_at?: string
          fabric_usage_data: Json
          id?: string
          making_cost_id?: string | null
          user_id: string
          window_covering_id: string
        }
        Update: {
          calculation_hash?: string
          cost_breakdown?: Json
          created_at?: string
          fabric_usage_data?: Json
          id?: string
          making_cost_id?: string | null
          user_id?: string
          window_covering_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fabric_calculations_cache_making_cost_id_fkey"
            columns: ["making_cost_id"]
            isOneToOne: false
            referencedRelation: "making_costs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fabric_calculations_cache_window_covering_id_fkey"
            columns: ["window_covering_id"]
            isOneToOne: false
            referencedRelation: "window_coverings"
            referencedColumns: ["id"]
          },
        ]
      }
      fabric_orders: {
        Row: {
          color: string | null
          created_at: string
          expected_delivery: string | null
          fabric_code: string
          fabric_type: string
          id: string
          notes: string | null
          order_date: string | null
          pattern: string | null
          quantity: number
          received_date: string | null
          status: string
          supplier: string
          total_price: number
          unit: string
          unit_price: number
          updated_at: string
          user_id: string
          work_order_ids: string[] | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          expected_delivery?: string | null
          fabric_code: string
          fabric_type: string
          id?: string
          notes?: string | null
          order_date?: string | null
          pattern?: string | null
          quantity?: number
          received_date?: string | null
          status?: string
          supplier: string
          total_price?: number
          unit?: string
          unit_price?: number
          updated_at?: string
          user_id: string
          work_order_ids?: string[] | null
        }
        Update: {
          color?: string | null
          created_at?: string
          expected_delivery?: string | null
          fabric_code?: string
          fabric_type?: string
          id?: string
          notes?: string | null
          order_date?: string | null
          pattern?: string | null
          quantity?: number
          received_date?: string | null
          status?: string
          supplier?: string
          total_price?: number
          unit?: string
          unit_price?: number
          updated_at?: string
          user_id?: string
          work_order_ids?: string[] | null
        }
        Relationships: []
      }
      hardware_options: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          name: string
          price: number
          unit: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          name: string
          price?: number
          unit?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          name?: string
          price?: number
          unit?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      heading_options: {
        Row: {
          active: boolean | null
          created_at: string
          extras: Json | null
          fullness: number
          id: string
          name: string
          price: number
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          extras?: Json | null
          fullness?: number
          id?: string
          name: string
          price?: number
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          extras?: Json | null
          fullness?: number
          id?: string
          name?: string
          price?: number
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      integration_settings: {
        Row: {
          active: boolean | null
          api_credentials: Json | null
          configuration: Json
          created_at: string
          id: string
          integration_type: string
          last_sync: string | null
          sync_settings: Json | null
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          active?: boolean | null
          api_credentials?: Json | null
          configuration?: Json
          created_at?: string
          id?: string
          integration_type: string
          last_sync?: string | null
          sync_settings?: Json | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          active?: boolean | null
          api_credentials?: Json | null
          configuration?: Json
          created_at?: string
          id?: string
          integration_type?: string
          last_sync?: string | null
          sync_settings?: Json | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string
          color: string | null
          cost_per_unit: number | null
          created_at: string
          id: string
          length: number | null
          location: string | null
          name: string
          notes: string | null
          pattern: string | null
          quantity: number
          reorder_point: number | null
          sku: string | null
          supplier: string | null
          type: string | null
          unit: string
          updated_at: string
          user_id: string
          width: number | null
        }
        Insert: {
          category: string
          color?: string | null
          cost_per_unit?: number | null
          created_at?: string
          id?: string
          length?: number | null
          location?: string | null
          name: string
          notes?: string | null
          pattern?: string | null
          quantity?: number
          reorder_point?: number | null
          sku?: string | null
          supplier?: string | null
          type?: string | null
          unit?: string
          updated_at?: string
          user_id: string
          width?: number | null
        }
        Update: {
          category?: string
          color?: string | null
          cost_per_unit?: number | null
          created_at?: string
          id?: string
          length?: number | null
          location?: string | null
          name?: string
          notes?: string | null
          pattern?: string | null
          quantity?: number
          reorder_point?: number | null
          sku?: string | null
          supplier?: string | null
          type?: string | null
          unit?: string
          updated_at?: string
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lining_options: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          name: string
          price: number
          unit: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          name: string
          price?: number
          unit?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          name?: string
          price?: number
          unit?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      making_cost_option_mappings: {
        Row: {
          created_at: string
          id: string
          is_included: boolean | null
          making_cost_id: string
          option_category_id: string
          option_type: string
          override_pricing: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_included?: boolean | null
          making_cost_id: string
          option_category_id: string
          option_type: string
          override_pricing?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_included?: boolean | null
          making_cost_id?: string
          option_category_id?: string
          option_type?: string
          override_pricing?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "making_cost_option_mappings_making_cost_id_fkey"
            columns: ["making_cost_id"]
            isOneToOne: false
            referencedRelation: "making_costs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "making_cost_option_mappings_option_category_id_fkey"
            columns: ["option_category_id"]
            isOneToOne: false
            referencedRelation: "window_covering_option_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      making_costs: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          drop_ranges: Json | null
          hardware_options: Json | null
          heading_options: Json | null
          id: string
          include_fabric_selection: boolean | null
          lining_options: Json | null
          measurement_type: string
          name: string
          pricing_method: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          drop_ranges?: Json | null
          hardware_options?: Json | null
          heading_options?: Json | null
          id?: string
          include_fabric_selection?: boolean | null
          lining_options?: Json | null
          measurement_type?: string
          name: string
          pricing_method?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          drop_ranges?: Json | null
          hardware_options?: Json | null
          heading_options?: Json | null
          id?: string
          include_fabric_selection?: boolean | null
          lining_options?: Json | null
          measurement_type?: string
          name?: string
          pricing_method?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          related_id: string | null
          related_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          related_id?: string | null
          related_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      parts_options: {
        Row: {
          active: boolean
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price?: number
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pricing_grids: {
        Row: {
          active: boolean | null
          created_at: string
          grid_data: Json
          id: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          grid_data?: Json
          id?: string
          name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          grid_data?: Json
          id?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          active: boolean | null
          category: string | null
          conditions: Json | null
          created_at: string
          formula: string | null
          id: string
          name: string
          priority: number | null
          rule_type: string
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          conditions?: Json | null
          created_at?: string
          formula?: string | null
          id?: string
          name: string
          priority?: number | null
          rule_type: string
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          conditions?: Json | null
          created_at?: string
          formula?: string | null
          id?: string
          name?: string
          priority?: number | null
          rule_type?: string
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          markup_percentage: number | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          markup_percentage?: number | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          markup_percentage?: number | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_configurations: {
        Row: {
          created_at: string
          id: string
          name: string
          product_type: string
          project_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          product_type: string
          project_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          product_type?: string
          project_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_configurations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      product_details: {
        Row: {
          additional_options: Json | null
          created_at: string
          fabric_color: string | null
          fabric_pattern: string | null
          fabric_type: string | null
          hardware_details: Json | null
          heading_style: string | null
          id: string
          lining_type: string | null
          measurements: Json | null
          product_configuration_id: string
          style: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          additional_options?: Json | null
          created_at?: string
          fabric_color?: string | null
          fabric_pattern?: string | null
          fabric_type?: string | null
          hardware_details?: Json | null
          heading_style?: string | null
          id?: string
          lining_type?: string | null
          measurements?: Json | null
          product_configuration_id: string
          style?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          additional_options?: Json | null
          created_at?: string
          fabric_color?: string | null
          fabric_pattern?: string | null
          fabric_type?: string | null
          hardware_details?: Json | null
          heading_style?: string | null
          id?: string
          lining_type?: string | null
          measurements?: Json | null
          product_configuration_id?: string
          style?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_details_product_configuration_id_fkey"
            columns: ["product_configuration_id"]
            isOneToOne: false
            referencedRelation: "product_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_room_assignments: {
        Row: {
          created_at: string
          id: string
          product_configuration_id: string
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_configuration_id: string
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_configuration_id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_room_assignments_product_configuration_id_fkey"
            columns: ["product_configuration_id"]
            isOneToOne: false
            referencedRelation: "product_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_room_assignments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      product_templates: {
        Row: {
          active: boolean | null
          calculation_method: string
          calculation_rules: Json | null
          components: Json | null
          created_at: string
          description: string | null
          id: string
          making_cost_required: boolean | null
          measurement_requirements: Json | null
          name: string
          pricing_grid_required: boolean | null
          pricing_unit: string
          product_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          calculation_method?: string
          calculation_rules?: Json | null
          components?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          making_cost_required?: boolean | null
          measurement_requirements?: Json | null
          name: string
          pricing_grid_required?: boolean | null
          pricing_unit?: string
          product_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          calculation_method?: string
          calculation_rules?: Json | null
          components?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          making_cost_required?: boolean | null
          measurement_requirements?: Json | null
          name?: string
          pricing_grid_required?: boolean | null
          pricing_unit?: string
          product_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          base_price: number
          category_id: string | null
          cost_price: number | null
          created_at: string
          description: string | null
          id: string
          images: Json | null
          markup_percentage: number | null
          name: string
          options: Json | null
          sku: string | null
          specifications: Json | null
          unit: string | null
          updated_at: string
          user_id: string
          variants: Json | null
        }
        Insert: {
          active?: boolean | null
          base_price?: number
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          markup_percentage?: number | null
          name: string
          options?: Json | null
          sku?: string | null
          specifications?: Json | null
          unit?: string | null
          updated_at?: string
          user_id: string
          variants?: Json | null
        }
        Update: {
          active?: boolean | null
          base_price?: number
          category_id?: string | null
          cost_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          markup_percentage?: number | null
          name?: string
          options?: Json | null
          sku?: string | null
          specifications?: Json | null
          unit?: string | null
          updated_at?: string
          user_id?: string
          variants?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_files: {
        Row: {
          bucket_name: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          bucket_name: string
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          bucket_name?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          client_id: string | null
          completion_date: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          job_number: string | null
          name: string
          priority: string
          start_date: string | null
          status: string
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          job_number?: string | null
          name: string
          priority?: string
          start_date?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          job_number?: string | null
          name?: string
          priority?: string
          start_date?: string | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string
          description: string
          fabric_type: string | null
          id: string
          measurements: Json | null
          quantity: number
          quote_id: string
          total_price: number
          treatment_type: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          fabric_type?: string | null
          id?: string
          measurements?: Json | null
          quantity?: number
          quote_id: string
          total_price?: number
          treatment_type?: string | null
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          fabric_type?: string | null
          id?: string
          measurements?: Json | null
          quantity?: number
          quote_id?: string
          total_price?: number
          treatment_type?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          notes: string | null
          project_id: string
          quote_number: string
          status: string
          subtotal: number
          tax_amount: number
          tax_rate: number
          total_amount: number
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          project_id: string
          quote_number: string
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          project_id?: string
          quote_number?: string
          status?: string
          subtotal?: number
          tax_amount?: number
          tax_rate?: number
          total_amount?: number
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string
          description: string | null
          id: string
          measurements: Json | null
          name: string
          notes: string | null
          project_id: string
          room_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          measurements?: Json | null
          name: string
          notes?: string | null
          project_id: string
          room_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          measurements?: Json | null
          name?: string
          notes?: string | null
          project_id?: string
          room_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      service_options: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price?: number
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shopify_integrations: {
        Row: {
          auto_sync_enabled: boolean
          created_at: string
          id: string
          last_full_sync: string | null
          shop_domain: string
          sync_images: boolean
          sync_inventory: boolean
          sync_log: Json
          sync_prices: boolean
          sync_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_sync_enabled?: boolean
          created_at?: string
          id?: string
          last_full_sync?: string | null
          shop_domain: string
          sync_images?: boolean
          sync_inventory?: boolean
          sync_log?: Json
          sync_prices?: boolean
          sync_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_sync_enabled?: boolean
          created_at?: string
          id?: string
          last_full_sync?: string | null
          shop_domain?: string
          sync_images?: boolean
          sync_inventory?: boolean
          sync_log?: Json
          sync_prices?: boolean
          sync_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      surfaces: {
        Row: {
          created_at: string
          depth: number | null
          height: number | null
          id: string
          location: string | null
          measurements: Json | null
          name: string
          notes: string | null
          project_id: string
          room_id: string
          surface_height: number | null
          surface_type: string | null
          surface_width: number | null
          updated_at: string
          user_id: string
          width: number | null
          window_type: string | null
        }
        Insert: {
          created_at?: string
          depth?: number | null
          height?: number | null
          id?: string
          location?: string | null
          measurements?: Json | null
          name: string
          notes?: string | null
          project_id: string
          room_id: string
          surface_height?: number | null
          surface_type?: string | null
          surface_width?: number | null
          updated_at?: string
          user_id: string
          width?: number | null
          window_type?: string | null
        }
        Update: {
          created_at?: string
          depth?: number | null
          height?: number | null
          id?: string
          location?: string | null
          measurements?: Json | null
          name?: string
          notes?: string | null
          project_id?: string
          room_id?: string
          surface_height?: number | null
          surface_type?: string | null
          surface_width?: number | null
          updated_at?: string
          user_id?: string
          width?: number | null
          window_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "windows_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "windows_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          hourly_rate: number | null
          id: string
          name: string
          phone: string | null
          role: string
          skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          hourly_rate?: number | null
          id?: string
          name: string
          phone?: string | null
          role: string
          skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          hourly_rate?: number | null
          id?: string
          name?: string
          phone?: string | null
          role?: string
          skills?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      todos: {
        Row: {
          id: number
          inserted_at: string
          is_complete: boolean | null
          task: string | null
          user_id: string
        }
        Insert: {
          id?: number
          inserted_at?: string
          is_complete?: boolean | null
          task?: string | null
          user_id: string
        }
        Update: {
          id?: number
          inserted_at?: string
          is_complete?: boolean | null
          task?: string | null
          user_id?: string
        }
        Relationships: []
      }
      treatment_types: {
        Row: {
          active: boolean | null
          category: string
          complexity: string | null
          created_at: string
          description: string | null
          estimated_hours: number | null
          id: string
          labor_rate: number | null
          name: string
          required_materials: Json | null
          specifications: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          category: string
          complexity?: string | null
          created_at?: string
          description?: string | null
          estimated_hours?: number | null
          id?: string
          labor_rate?: number | null
          name: string
          required_materials?: Json | null
          specifications?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          category?: string
          complexity?: string | null
          created_at?: string
          description?: string | null
          estimated_hours?: number | null
          id?: string
          labor_rate?: number | null
          name?: string
          required_materials?: Json | null
          specifications?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      treatments: {
        Row: {
          color: string | null
          created_at: string
          fabric_type: string | null
          hardware: string | null
          id: string
          labor_cost: number | null
          material_cost: number | null
          measurements: Json | null
          mounting_type: string | null
          notes: string | null
          pattern: string | null
          product_name: string | null
          project_id: string
          quantity: number | null
          room_id: string
          status: string | null
          total_price: number | null
          treatment_type: string
          unit_price: number | null
          updated_at: string
          user_id: string
          window_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          fabric_type?: string | null
          hardware?: string | null
          id?: string
          labor_cost?: number | null
          material_cost?: number | null
          measurements?: Json | null
          mounting_type?: string | null
          notes?: string | null
          pattern?: string | null
          product_name?: string | null
          project_id: string
          quantity?: number | null
          room_id: string
          status?: string | null
          total_price?: number | null
          treatment_type: string
          unit_price?: number | null
          updated_at?: string
          user_id: string
          window_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          fabric_type?: string | null
          hardware?: string | null
          id?: string
          labor_cost?: number | null
          material_cost?: number | null
          measurements?: Json | null
          mounting_type?: string | null
          notes?: string | null
          pattern?: string | null
          product_name?: string | null
          project_id?: string
          quantity?: number | null
          room_id?: string
          status?: string | null
          total_price?: number | null
          treatment_type?: string
          unit_price?: number | null
          updated_at?: string
          user_id?: string
          window_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatments_window_id_fkey"
            columns: ["window_id"]
            isOneToOne: false
            referencedRelation: "surfaces"
            referencedColumns: ["id"]
          },
        ]
      }
      trimming_options: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          name: string
          price: number
          unit: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          name: string
          price?: number
          unit?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          name?: string
          price?: number
          unit?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      vendor_products: {
        Row: {
          availability_status: string | null
          created_at: string
          id: string
          last_updated: string | null
          lead_time_days: number | null
          minimum_order_quantity: number | null
          product_id: string | null
          user_id: string
          vendor_id: string | null
          vendor_price: number | null
          vendor_sku: string | null
        }
        Insert: {
          availability_status?: string | null
          created_at?: string
          id?: string
          last_updated?: string | null
          lead_time_days?: number | null
          minimum_order_quantity?: number | null
          product_id?: string | null
          user_id: string
          vendor_id?: string | null
          vendor_price?: number | null
          vendor_sku?: string | null
        }
        Update: {
          availability_status?: string | null
          created_at?: string
          id?: string
          last_updated?: string | null
          lead_time_days?: number | null
          minimum_order_quantity?: number | null
          product_id?: string | null
          user_id?: string
          vendor_id?: string | null
          vendor_price?: number | null
          vendor_sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          active: boolean | null
          address: string | null
          contact_person: string | null
          created_at: string
          discount_percentage: number | null
          email: string | null
          id: string
          lead_time_days: number | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          product_categories: string[] | null
          rating: number | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          contact_person?: string | null
          created_at?: string
          discount_percentage?: number | null
          email?: string | null
          id?: string
          lead_time_days?: number | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          product_categories?: string[] | null
          rating?: number | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          contact_person?: string | null
          created_at?: string
          discount_percentage?: number | null
          email?: string | null
          id?: string
          lead_time_days?: number | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          product_categories?: string[] | null
          rating?: number | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      window_covering_calculation_configs: {
        Row: {
          base_labor_hours: number | null
          complexity_multiplier: number | null
          created_at: string
          default_fabric_waste_percentage: number | null
          id: string
          override_pricing_method: string | null
          pattern_repeat_allowance_cm: number | null
          seam_allowance_cm: number | null
          seam_labor_hours_per_seam: number | null
          updated_at: string
          use_window_covering_pricing_method: boolean | null
          user_id: string
          window_covering_id: string
        }
        Insert: {
          base_labor_hours?: number | null
          complexity_multiplier?: number | null
          created_at?: string
          default_fabric_waste_percentage?: number | null
          id?: string
          override_pricing_method?: string | null
          pattern_repeat_allowance_cm?: number | null
          seam_allowance_cm?: number | null
          seam_labor_hours_per_seam?: number | null
          updated_at?: string
          use_window_covering_pricing_method?: boolean | null
          user_id: string
          window_covering_id: string
        }
        Update: {
          base_labor_hours?: number | null
          complexity_multiplier?: number | null
          created_at?: string
          default_fabric_waste_percentage?: number | null
          id?: string
          override_pricing_method?: string | null
          pattern_repeat_allowance_cm?: number | null
          seam_allowance_cm?: number | null
          seam_labor_hours_per_seam?: number | null
          updated_at?: string
          use_window_covering_pricing_method?: boolean | null
          user_id?: string
          window_covering_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "window_covering_calculation_configs_window_covering_id_fkey"
            columns: ["window_covering_id"]
            isOneToOne: false
            referencedRelation: "window_coverings"
            referencedColumns: ["id"]
          },
        ]
      }
      window_covering_calculations: {
        Row: {
          created_at: string
          drop: number
          fabric_cost: number
          fabric_id: string | null
          fabric_usage: number
          fabric_waste: number
          id: string
          making_cost: number
          margin_amount: number
          measurements: Json | null
          notes: string | null
          options_cost: number
          project_id: string | null
          selected_options: Json | null
          selling_price: number
          total_cost: number
          updated_at: string
          user_id: string
          width: number
          window_covering_id: string
        }
        Insert: {
          created_at?: string
          drop: number
          fabric_cost?: number
          fabric_id?: string | null
          fabric_usage?: number
          fabric_waste?: number
          id?: string
          making_cost?: number
          margin_amount?: number
          measurements?: Json | null
          notes?: string | null
          options_cost?: number
          project_id?: string | null
          selected_options?: Json | null
          selling_price?: number
          total_cost?: number
          updated_at?: string
          user_id: string
          width: number
          window_covering_id: string
        }
        Update: {
          created_at?: string
          drop?: number
          fabric_cost?: number
          fabric_id?: string | null
          fabric_usage?: number
          fabric_waste?: number
          id?: string
          making_cost?: number
          margin_amount?: number
          measurements?: Json | null
          notes?: string | null
          options_cost?: number
          project_id?: string | null
          selected_options?: Json | null
          selling_price?: number
          total_cost?: number
          updated_at?: string
          user_id?: string
          width?: number
          window_covering_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "window_covering_calculations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "window_covering_calculations_window_covering_id_fkey"
            columns: ["window_covering_id"]
            isOneToOne: false
            referencedRelation: "window_coverings"
            referencedColumns: ["id"]
          },
        ]
      }
      window_covering_option_assignments: {
        Row: {
          category_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
          window_covering_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          window_covering_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          window_covering_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_window_covering_option_assignments_category_id"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "window_covering_option_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_window_covering_option_assignments_window_covering_id"
            columns: ["window_covering_id"]
            isOneToOne: false
            referencedRelation: "window_coverings"
            referencedColumns: ["id"]
          },
        ]
      }
      window_covering_option_categories: {
        Row: {
          affects_fabric_calculation: boolean | null
          affects_labor_calculation: boolean | null
          calculation_method: string | null
          category_type: string | null
          created_at: string
          description: string | null
          fabric_waste_factor: number | null
          fullness_ratio: number | null
          has_fullness_ratio: boolean | null
          id: string
          image_url: string | null
          is_required: boolean
          name: string
          pattern_repeat_factor: number | null
          seam_complexity_factor: number | null
          sort_order: number
          source_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          affects_fabric_calculation?: boolean | null
          affects_labor_calculation?: boolean | null
          calculation_method?: string | null
          category_type?: string | null
          created_at?: string
          description?: string | null
          fabric_waste_factor?: number | null
          fullness_ratio?: number | null
          has_fullness_ratio?: boolean | null
          id?: string
          image_url?: string | null
          is_required?: boolean
          name: string
          pattern_repeat_factor?: number | null
          seam_complexity_factor?: number | null
          sort_order?: number
          source_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          affects_fabric_calculation?: boolean | null
          affects_labor_calculation?: boolean | null
          calculation_method?: string | null
          category_type?: string | null
          created_at?: string
          description?: string | null
          fabric_waste_factor?: number | null
          fullness_ratio?: number | null
          has_fullness_ratio?: boolean | null
          id?: string
          image_url?: string | null
          is_required?: boolean
          name?: string
          pattern_repeat_factor?: number | null
          seam_complexity_factor?: number | null
          sort_order?: number
          source_preference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      window_covering_option_extras: {
        Row: {
          base_price: number
          calculation_method: string | null
          created_at: string
          description: string | null
          fullness_ratio: number | null
          id: string
          image_url: string | null
          is_default: boolean
          is_required: boolean
          name: string
          pricing_method: string
          sort_order: number
          sub_subcategory_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_price?: number
          calculation_method?: string | null
          created_at?: string
          description?: string | null
          fullness_ratio?: number | null
          id?: string
          image_url?: string | null
          is_default?: boolean
          is_required?: boolean
          name: string
          pricing_method?: string
          sort_order?: number
          sub_subcategory_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_price?: number
          calculation_method?: string | null
          created_at?: string
          description?: string | null
          fullness_ratio?: number | null
          id?: string
          image_url?: string | null
          is_default?: boolean
          is_required?: boolean
          name?: string
          pricing_method?: string
          sort_order?: number
          sub_subcategory_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_extras_sub_subcategory_id"
            columns: ["sub_subcategory_id"]
            isOneToOne: false
            referencedRelation: "window_covering_option_sub_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      window_covering_option_sub_subcategories: {
        Row: {
          base_price: number
          calculation_method: string | null
          created_at: string
          description: string | null
          extra_fabric_percentage: number | null
          fullness_ratio: number | null
          id: string
          image_url: string | null
          name: string
          pricing_method: string
          sort_order: number
          subcategory_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_price?: number
          calculation_method?: string | null
          created_at?: string
          description?: string | null
          extra_fabric_percentage?: number | null
          fullness_ratio?: number | null
          id?: string
          image_url?: string | null
          name: string
          pricing_method?: string
          sort_order?: number
          subcategory_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_price?: number
          calculation_method?: string | null
          created_at?: string
          description?: string | null
          extra_fabric_percentage?: number | null
          fullness_ratio?: number | null
          id?: string
          image_url?: string | null
          name?: string
          pricing_method?: string
          sort_order?: number
          subcategory_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_sub_subcategories_subcategory_id"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "window_covering_option_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      window_covering_option_subcategories: {
        Row: {
          base_price: number
          calculation_method: string | null
          category_id: string
          created_at: string
          description: string | null
          extra_fabric_percentage: number | null
          fullness_ratio: number | null
          id: string
          image_url: string | null
          name: string
          pricing_method: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          base_price?: number
          calculation_method?: string | null
          category_id: string
          created_at?: string
          description?: string | null
          extra_fabric_percentage?: number | null
          fullness_ratio?: number | null
          id?: string
          image_url?: string | null
          name: string
          pricing_method: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          base_price?: number
          calculation_method?: string | null
          category_id?: string
          created_at?: string
          description?: string | null
          extra_fabric_percentage?: number | null
          fullness_ratio?: number | null
          id?: string
          image_url?: string | null
          name?: string
          pricing_method?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "window_covering_option_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "window_covering_option_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      window_covering_options: {
        Row: {
          base_cost: number
          calculation_method: string | null
          cost_type: string
          created_at: string
          description: string | null
          fullness_ratio: number | null
          id: string
          image_url: string | null
          is_default: boolean
          is_required: boolean
          making_cost_id: string | null
          name: string
          option_type: string
          sort_order: number
          source_type: string | null
          specifications: Json | null
          updated_at: string
          user_id: string
          window_covering_id: string
        }
        Insert: {
          base_cost?: number
          calculation_method?: string | null
          cost_type?: string
          created_at?: string
          description?: string | null
          fullness_ratio?: number | null
          id?: string
          image_url?: string | null
          is_default?: boolean
          is_required?: boolean
          making_cost_id?: string | null
          name: string
          option_type: string
          sort_order?: number
          source_type?: string | null
          specifications?: Json | null
          updated_at?: string
          user_id: string
          window_covering_id: string
        }
        Update: {
          base_cost?: number
          calculation_method?: string | null
          cost_type?: string
          created_at?: string
          description?: string | null
          fullness_ratio?: number | null
          id?: string
          image_url?: string | null
          is_default?: boolean
          is_required?: boolean
          making_cost_id?: string | null
          name?: string
          option_type?: string
          sort_order?: number
          source_type?: string | null
          specifications?: Json | null
          updated_at?: string
          user_id?: string
          window_covering_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "window_covering_options_making_cost_id_fkey"
            columns: ["making_cost_id"]
            isOneToOne: false
            referencedRelation: "making_costs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "window_covering_options_window_covering_id_fkey"
            columns: ["window_covering_id"]
            isOneToOne: false
            referencedRelation: "window_coverings"
            referencedColumns: ["id"]
          },
        ]
      }
      window_coverings: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          fabrication_pricing_method: string | null
          id: string
          image_url: string | null
          making_cost_id: string | null
          margin_percentage: number
          name: string
          pricing_grid_data: string | null
          unit_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          fabrication_pricing_method?: string | null
          id?: string
          image_url?: string | null
          making_cost_id?: string | null
          margin_percentage?: number
          name: string
          pricing_grid_data?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          fabrication_pricing_method?: string | null
          id?: string
          image_url?: string | null
          making_cost_id?: string | null
          margin_percentage?: number
          name?: string
          pricing_grid_data?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "window_coverings_making_cost_id_fkey"
            columns: ["making_cost_id"]
            isOneToOne: false
            referencedRelation: "making_costs"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_checkpoints: {
        Row: {
          assigned_to: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          order_index: number
          task: string
          updated_at: string
          user_id: string
          work_order_id: string
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          order_index?: number
          task: string
          updated_at?: string
          user_id: string
          work_order_id: string
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          order_index?: number
          task?: string
          updated_at?: string
          user_id?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_work_order_checkpoints_work_order"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_items: {
        Row: {
          color: string | null
          created_at: string
          fabric_code: string | null
          fabric_type: string | null
          hardware: string | null
          id: string
          measurements: Json | null
          notes: string | null
          pattern: string | null
          product_name: string
          quantity: number
          status: string
          supplier: string | null
          total_price: number | null
          treatment_id: string | null
          unit_price: number | null
          updated_at: string
          user_id: string
          work_order_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          fabric_code?: string | null
          fabric_type?: string | null
          hardware?: string | null
          id?: string
          measurements?: Json | null
          notes?: string | null
          pattern?: string | null
          product_name: string
          quantity?: number
          status?: string
          supplier?: string | null
          total_price?: number | null
          treatment_id?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id: string
          work_order_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          fabric_code?: string | null
          fabric_type?: string | null
          hardware?: string | null
          id?: string
          measurements?: Json | null
          notes?: string | null
          pattern?: string | null
          product_name?: string
          quantity?: number
          status?: string
          supplier?: string | null
          total_price?: number | null
          treatment_id?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_work_order_items_work_order"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_items_treatment_id_fkey"
            columns: ["treatment_id"]
            isOneToOne: false
            referencedRelation: "treatments"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          created_at: string
          due_date: string | null
          estimated_hours: number | null
          id: string
          instructions: string | null
          notes: string | null
          order_number: string
          priority: string
          progress: number | null
          project_id: string
          status: string
          treatment_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          created_at?: string
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          instructions?: string | null
          notes?: string | null
          order_number: string
          priority?: string
          progress?: number | null
          project_id: string
          status?: string
          treatment_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          created_at?: string
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          instructions?: string | null
          notes?: string | null
          order_number?: string
          priority?: string
          progress?: number | null
          project_id?: string
          status?: string
          treatment_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_job_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_quote_number: {
        Args: Record<PropertyKey, never>
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
