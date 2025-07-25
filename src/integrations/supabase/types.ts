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
          active: boolean | null
          availability: Json | null
          buffer_time: number | null
          created_at: string
          description: string | null
          duration: number | null
          google_meet_link: string | null
          id: string
          image_url: string | null
          locations: Json | null
          max_advance_booking: number | null
          min_advance_notice: number | null
          name: string
          slug: string
          updated_at: string
          user_email: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          availability?: Json | null
          buffer_time?: number | null
          created_at?: string
          description?: string | null
          duration?: number | null
          google_meet_link?: string | null
          id?: string
          image_url?: string | null
          locations?: Json | null
          max_advance_booking?: number | null
          min_advance_notice?: number | null
          name: string
          slug: string
          updated_at?: string
          user_email?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          availability?: Json | null
          buffer_time?: number | null
          created_at?: string
          description?: string | null
          duration?: number | null
          google_meet_link?: string | null
          id?: string
          image_url?: string | null
          locations?: Json | null
          max_advance_booking?: number | null
          min_advance_notice?: number | null
          name?: string
          slug?: string
          updated_at?: string
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      appointment_shares: {
        Row: {
          appointment_id: string
          created_at: string
          id: string
          owner_id: string
          permission_level: string
          shared_with_user_id: string
          updated_at: string
        }
        Insert: {
          appointment_id: string
          created_at?: string
          id?: string
          owner_id: string
          permission_level?: string
          shared_with_user_id: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string
          created_at?: string
          id?: string
          owner_id?: string
          permission_level?: string
          shared_with_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_type: string | null
          caldav_calendar_id: string | null
          caldav_etag: string | null
          caldav_uid: string | null
          client_id: string | null
          created_at: string
          description: string | null
          end_time: string
          id: string
          last_caldav_sync: string | null
          location: string | null
          project_id: string | null
          start_time: string
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_type?: string | null
          caldav_calendar_id?: string | null
          caldav_etag?: string | null
          caldav_uid?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          last_caldav_sync?: string | null
          location?: string | null
          project_id?: string | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_type?: string | null
          caldav_calendar_id?: string | null
          caldav_etag?: string | null
          caldav_uid?: string | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          last_caldav_sync?: string | null
          location?: string | null
          project_id?: string | null
          start_time?: string
          status?: string | null
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
        ]
      }
      appointments_booked: {
        Row: {
          appointment_date: string
          appointment_time: string
          appointment_timezone: string | null
          booking_message: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          customer_timezone: string | null
          id: string
          location_type: string | null
          notes: string | null
          scheduler_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          appointment_timezone?: string | null
          booking_message?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          customer_timezone?: string | null
          id?: string
          location_type?: string | null
          notes?: string | null
          scheduler_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          appointment_timezone?: string | null
          booking_message?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          customer_timezone?: string | null
          id?: string
          location_type?: string | null
          notes?: string | null
          scheduler_id?: string
          status?: string | null
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
          address: string | null
          business_email: string | null
          business_phone: string | null
          city: string | null
          company_logo_url: string | null
          company_name: string | null
          country: string | null
          created_at: string
          id: string
          measurement_units: string | null
          state: string | null
          updated_at: string
          user_id: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          abn?: string | null
          address?: string | null
          business_email?: string | null
          business_phone?: string | null
          city?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          id?: string
          measurement_units?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          abn?: string | null
          address?: string | null
          business_email?: string | null
          business_phone?: string | null
          city?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          id?: string
          measurement_units?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      caldav_accounts: {
        Row: {
          account_name: string
          active: boolean
          created_at: string
          email: string
          id: string
          last_sync_at: string | null
          password_encrypted: string
          server_url: string | null
          sync_enabled: boolean
          sync_token: string | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          account_name: string
          active?: boolean
          created_at?: string
          email: string
          id?: string
          last_sync_at?: string | null
          password_encrypted: string
          server_url?: string | null
          sync_enabled?: boolean
          sync_token?: string | null
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          account_name?: string
          active?: boolean
          created_at?: string
          email?: string
          id?: string
          last_sync_at?: string | null
          password_encrypted?: string
          server_url?: string | null
          sync_enabled?: boolean
          sync_token?: string | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      caldav_calendars: {
        Row: {
          account_id: string
          caldav_url: string | null
          calendar_id: string
          color: string | null
          created_at: string
          description: string | null
          display_name: string
          etag: string | null
          id: string
          last_sync_at: string | null
          read_only: boolean
          sync_enabled: boolean
          sync_token: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          caldav_url?: string | null
          calendar_id: string
          color?: string | null
          created_at?: string
          description?: string | null
          display_name: string
          etag?: string | null
          id?: string
          last_sync_at?: string | null
          read_only?: boolean
          sync_enabled?: boolean
          sync_token?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          caldav_url?: string | null
          calendar_id?: string
          color?: string | null
          created_at?: string
          description?: string | null
          display_name?: string
          etag?: string | null
          id?: string
          last_sync_at?: string | null
          read_only?: boolean
          sync_enabled?: boolean
          sync_token?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "caldav_calendars_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "caldav_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      caldav_sync_log: {
        Row: {
          account_id: string
          calendar_id: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          events_created: number | null
          events_deleted: number | null
          events_synced: number | null
          events_updated: number | null
          id: string
          started_at: string
          status: string
          sync_type: string
        }
        Insert: {
          account_id: string
          calendar_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          events_created?: number | null
          events_deleted?: number | null
          events_synced?: number | null
          events_updated?: number | null
          id?: string
          started_at?: string
          status: string
          sync_type: string
        }
        Update: {
          account_id?: string
          calendar_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          events_created?: number | null
          events_deleted?: number | null
          events_synced?: number | null
          events_updated?: number | null
          id?: string
          started_at?: string
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "caldav_sync_log_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "caldav_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "caldav_sync_log_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "caldav_calendars"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_shares: {
        Row: {
          calendar_id: string
          created_at: string
          id: string
          owner_id: string
          permission_level: string
          shared_with_user_id: string
          updated_at: string
        }
        Insert: {
          calendar_id: string
          created_at?: string
          id?: string
          owner_id: string
          permission_level?: string
          shared_with_user_id: string
          updated_at?: string
        }
        Update: {
          calendar_id?: string
          created_at?: string
          id?: string
          owner_id?: string
          permission_level?: string
          shared_with_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_measurements: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          measured_at: string | null
          measured_by: string | null
          measurement_type: string
          measurements: Json
          notes: string | null
          photos: Json | null
          project_id: string | null
          room_id: string | null
          updated_at: string | null
          user_id: string
          window_covering_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          measured_at?: string | null
          measured_by?: string | null
          measurement_type?: string
          measurements?: Json
          notes?: string | null
          photos?: Json | null
          project_id?: string | null
          room_id?: string | null
          updated_at?: string | null
          user_id: string
          window_covering_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          measured_at?: string | null
          measured_by?: string | null
          measurement_type?: string
          measurements?: Json
          notes?: string | null
          photos?: Json | null
          project_id?: string | null
          room_id?: string | null
          updated_at?: string | null
          user_id?: string
          window_covering_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_measurements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_measurements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_measurements_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
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
          country: string | null
          created_at: string
          email: string | null
          funnel_stage: string | null
          id: string
          last_contact_date: string | null
          name: string
          notes: string | null
          phone: string | null
          stage_changed_at: string | null
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
          country?: string | null
          created_at?: string
          email?: string | null
          funnel_stage?: string | null
          id?: string
          last_contact_date?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          stage_changed_at?: string | null
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
          country?: string | null
          created_at?: string
          email?: string | null
          funnel_stage?: string | null
          id?: string
          last_contact_date?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          stage_changed_at?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      email_analytics: {
        Row: {
          created_at: string
          email_id: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email_id?: string | null
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
          status: string | null
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
          status?: string | null
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
          status?: string | null
          subject?: string
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          active: boolean | null
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
          active?: boolean | null
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
          active?: boolean | null
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
      emails: {
        Row: {
          bounce_reason: string | null
          campaign_id: string | null
          click_count: number | null
          client_id: string | null
          content: string
          created_at: string
          id: string
          open_count: number | null
          recipient_email: string
          sent_at: string | null
          status: string | null
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
          client_id?: string | null
          content: string
          created_at?: string
          id?: string
          open_count?: number | null
          recipient_email: string
          sent_at?: string | null
          status?: string | null
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
          client_id?: string | null
          content?: string
          created_at?: string
          id?: string
          open_count?: number | null
          recipient_email?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          template_id?: string | null
          time_spent_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_settings: {
        Row: {
          active: boolean | null
          api_credentials: Json | null
          configuration: Json | null
          created_at: string
          id: string
          integration_type: string
          last_sync: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          api_credentials?: Json | null
          configuration?: Json | null
          created_at?: string
          id?: string
          integration_type: string
          last_sync?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          api_credentials?: Json | null
          configuration?: Json | null
          created_at?: string
          id?: string
          integration_type?: string
          last_sync?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          location: string | null
          min_stock_level: number | null
          name: string
          quantity: number | null
          sku: string | null
          supplier: string | null
          unit: string | null
          unit_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          min_stock_level?: number | null
          name: string
          quantity?: number | null
          sku?: string | null
          supplier?: string | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          min_stock_level?: number | null
          name?: string
          quantity?: number | null
          sku?: string | null
          supplier?: string | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      message_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          message_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          message_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "user_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_orders: {
        Row: {
          actual_order_date: string | null
          created_at: string
          id: string
          notes: string | null
          order_status: string
          planned_order_date: string | null
          product_name: string
          product_type: string
          project_id: string
          quantity: number
          unit_price: number
          updated_at: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          actual_order_date?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_status?: string
          planned_order_date?: string | null
          product_name: string
          product_type: string
          project_id: string
          quantity?: number
          unit_price?: number
          updated_at?: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          actual_order_date?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_status?: string
          planned_order_date?: string | null
          product_name?: string
          product_type?: string
          project_id?: string
          quantity?: number
          unit_price?: number
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_orders_vendor"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
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
          funnel_stage: string | null
          id: string
          job_number: string | null
          name: string
          priority: string | null
          start_date: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          funnel_stage?: string | null
          id?: string
          job_number?: string | null
          name: string
          priority?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          funnel_stage?: string | null
          id?: string
          job_number?: string | null
          name?: string
          priority?: string | null
          start_date?: string | null
          status?: string | null
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
        ]
      }
      quotes: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          notes: string | null
          project_id: string | null
          quote_number: string | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          total_amount: number | null
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          project_id?: string | null
          quote_number?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number | null
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          project_id?: string | null
          quote_number?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number | null
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
        ]
      }
      rooms: {
        Row: {
          created_at: string
          description: string | null
          id: string
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
          name?: string
          notes?: string | null
          project_id?: string
          room_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      surfaces: {
        Row: {
          created_at: string
          height: number | null
          id: string
          name: string
          project_id: string
          room_id: string
          surface_height: number | null
          surface_type: string
          surface_width: number | null
          updated_at: string
          user_id: string
          width: number | null
        }
        Insert: {
          created_at?: string
          height?: number | null
          id?: string
          name: string
          project_id: string
          room_id: string
          surface_height?: number | null
          surface_type?: string
          surface_width?: number | null
          updated_at?: string
          user_id: string
          width?: number | null
        }
        Update: {
          created_at?: string
          height?: number | null
          id?: string
          name?: string
          project_id?: string
          room_id?: string
          surface_height?: number | null
          surface_type?: string
          surface_width?: number | null
          updated_at?: string
          user_id?: string
          width?: number | null
        }
        Relationships: []
      }
      team_workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      treatments: {
        Row: {
          calculation_details: Json | null
          color: string | null
          created_at: string
          fabric_details: Json | null
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
          treatment_details: Json | null
          treatment_type: string
          unit_price: number | null
          updated_at: string
          user_id: string
          window_id: string
        }
        Insert: {
          calculation_details?: Json | null
          color?: string | null
          created_at?: string
          fabric_details?: Json | null
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
          treatment_details?: Json | null
          treatment_type?: string
          unit_price?: number | null
          updated_at?: string
          user_id: string
          window_id: string
        }
        Update: {
          calculation_details?: Json | null
          color?: string | null
          created_at?: string
          fabric_details?: Json | null
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
          treatment_details?: Json | null
          treatment_type?: string
          unit_price?: number | null
          updated_at?: string
          user_id?: string
          window_id?: string
        }
        Relationships: []
      }
      user_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          created_at: string | null
          current_job_id: string | null
          current_page: string | null
          id: string
          is_online: boolean | null
          last_seen: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_job_id?: string | null
          current_page?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_job_id?: string | null
          current_page?: string | null
          id?: string
          is_online?: boolean | null
          last_seen?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          status: string | null
          status_message: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          status?: string | null
          status_message?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          status?: string | null
          status_message?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          active: boolean | null
          address: string | null
          city: string | null
          company_type: string | null
          contact_person: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          lead_time_days: number | null
          minimum_order_amount: number | null
          name: string
          payment_terms: string | null
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          company_type?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_time_days?: number | null
          minimum_order_amount?: number | null
          name: string
          payment_terms?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          city?: string | null
          company_type?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          lead_time_days?: number | null
          minimum_order_amount?: number | null
          name?: string
          payment_terms?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          joined_at: string
          role: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string
          role?: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string
          role?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
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
