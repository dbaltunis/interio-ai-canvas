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
      business_settings: {
        Row: {
          abn: string | null
          auto_calculate_fabric: boolean | null
          auto_generate_work_orders: boolean | null
          business_address: string | null
          business_email: string | null
          business_phone: string | null
          closing_time: string | null
          company_name: string | null
          created_at: string
          default_markup: number | null
          default_tax_rate: number | null
          email_quote_notifications: boolean | null
          id: string
          installation_lead_days: number | null
          labor_rate: number | null
          low_stock_alerts: boolean | null
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
          company_name?: string | null
          created_at?: string
          default_markup?: number | null
          default_tax_rate?: number | null
          email_quote_notifications?: boolean | null
          id?: string
          installation_lead_days?: number | null
          labor_rate?: number | null
          low_stock_alerts?: boolean | null
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
          company_name?: string | null
          created_at?: string
          default_markup?: number | null
          default_tax_rate?: number | null
          email_quote_notifications?: boolean | null
          id?: string
          installation_lead_days?: number | null
          labor_rate?: number | null
          low_stock_alerts?: boolean | null
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
          client_id: string
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
          client_id: string
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
          client_id?: string
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
          client_id: string
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
          client_id: string
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
          client_id?: string
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
      window_covering_option_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_required: boolean
          name: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean
          name: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      window_covering_option_subcategories: {
        Row: {
          base_price: number
          category_id: string
          created_at: string
          description: string | null
          extra_fabric_percentage: number | null
          fullness_ratio: number | null
          id: string
          name: string
          pricing_method: string
          sort_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          base_price?: number
          category_id: string
          created_at?: string
          description?: string | null
          extra_fabric_percentage?: number | null
          fullness_ratio?: number | null
          id?: string
          name: string
          pricing_method: string
          sort_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          base_price?: number
          category_id?: string
          created_at?: string
          description?: string | null
          extra_fabric_percentage?: number | null
          fullness_ratio?: number | null
          id?: string
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
          cost_type: string
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          is_required: boolean
          name: string
          option_type: string
          sort_order: number
          specifications: Json | null
          updated_at: string
          user_id: string
          window_covering_id: string
        }
        Insert: {
          base_cost?: number
          cost_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          is_required?: boolean
          name: string
          option_type: string
          sort_order?: number
          specifications?: Json | null
          updated_at?: string
          user_id: string
          window_covering_id: string
        }
        Update: {
          base_cost?: number
          cost_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          is_required?: boolean
          name?: string
          option_type?: string
          sort_order?: number
          specifications?: Json | null
          updated_at?: string
          user_id?: string
          window_covering_id?: string
        }
        Relationships: [
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
          margin_percentage?: number
          name?: string
          pricing_grid_data?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
