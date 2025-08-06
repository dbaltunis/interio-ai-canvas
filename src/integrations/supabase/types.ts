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
      access_requests: {
        Row: {
          approver_id: string
          created_at: string
          expires_at: string | null
          id: string
          record_id: string
          record_type: string
          request_reason: string | null
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          approver_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          record_id: string
          record_type: string
          request_reason?: string | null
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          approver_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          record_id?: string
          record_type?: string
          request_reason?: string | null
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_requests_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "access_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      account_settings: {
        Row: {
          account_owner_id: string
          business_settings: Json | null
          created_at: string
          currency: string | null
          id: string
          integration_settings: Json | null
          language: string | null
          measurement_units: Json | null
          updated_at: string
        }
        Insert: {
          account_owner_id: string
          business_settings?: Json | null
          created_at?: string
          currency?: string | null
          id?: string
          integration_settings?: Json | null
          language?: string | null
          measurement_units?: Json | null
          updated_at?: string
        }
        Update: {
          account_owner_id?: string
          business_settings?: Json | null
          created_at?: string
          currency?: string | null
          id?: string
          integration_settings?: Json | null
          language?: string | null
          measurement_units?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_settings_account_owner_id_fkey"
            columns: ["account_owner_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      appointment_notifications: {
        Row: {
          appointment_id: string
          channels: string[]
          created_at: string
          error_message: string | null
          id: string
          message: string
          metadata: Json | null
          scheduled_for: string
          sent_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_id: string
          channels?: string[]
          created_at?: string
          error_message?: string | null
          id?: string
          message: string
          metadata?: Json | null
          scheduled_for: string
          sent_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_id?: string
          channels?: string[]
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_notifications_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
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
          color: string | null
          created_at: string
          description: string | null
          end_time: string
          id: string
          invited_client_emails: string[] | null
          last_caldav_sync: string | null
          location: string | null
          notification_enabled: boolean | null
          notification_minutes: number | null
          project_id: string | null
          start_time: string
          status: string | null
          team_member_ids: string[] | null
          title: string
          updated_at: string
          user_id: string
          video_meeting_link: string | null
        }
        Insert: {
          appointment_type?: string | null
          caldav_calendar_id?: string | null
          caldav_etag?: string | null
          caldav_uid?: string | null
          client_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          id?: string
          invited_client_emails?: string[] | null
          last_caldav_sync?: string | null
          location?: string | null
          notification_enabled?: boolean | null
          notification_minutes?: number | null
          project_id?: string | null
          start_time: string
          status?: string | null
          team_member_ids?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          video_meeting_link?: string | null
        }
        Update: {
          appointment_type?: string | null
          caldav_calendar_id?: string | null
          caldav_etag?: string | null
          caldav_uid?: string | null
          client_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          id?: string
          invited_client_emails?: string[] | null
          last_caldav_sync?: string | null
          location?: string | null
          notification_enabled?: boolean | null
          notification_minutes?: number | null
          project_id?: string | null
          start_time?: string
          status?: string | null
          team_member_ids?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          video_meeting_link?: string | null
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
      booking_notifications: {
        Row: {
          booking_id: string
          created_at: string
          customer_email: string
          id: string
          notification_type: string
          scheduler_id: string
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          customer_email: string
          id?: string
          notification_type?: string
          scheduler_id: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          customer_email?: string
          id?: string
          notification_type?: string
          scheduler_id?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
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
      client_measurements: {
        Row: {
          client_id: string | null
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
          client_id?: string | null
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
          client_id?: string | null
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
          created_by: string | null
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
          created_by?: string | null
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
          created_by?: string | null
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
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      components_temp: {
        Row: {
          active: boolean | null
          component_type: string
          cost_price: number | null
          created_at: string
          description: string | null
          fullness_ratio: number | null
          id: string
          labor_hours: number | null
          name: string
          selling_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          component_type: string
          cost_price?: number | null
          created_at?: string
          description?: string | null
          fullness_ratio?: number | null
          id?: string
          labor_hours?: number | null
          name: string
          selling_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          component_type?: string
          cost_price?: number | null
          created_at?: string
          description?: string | null
          fullness_ratio?: number | null
          id?: string
          labor_hours?: number | null
          name?: string
          selling_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      curtain_templates: {
        Row: {
          active: boolean
          average_drop_width: number | null
          bottom_hem: number
          compatible_hardware: string[] | null
          created_at: string
          curtain_type: string
          description: string | null
          drop_height_ranges: Json | null
          extra_fabric_fixed: number | null
          extra_fabric_percentage: number | null
          eyelet_spacing: number | null
          fabric_direction: string
          fabric_width_type: string
          fullness_ratio: number
          glider_spacing: number | null
          hand_drop_height_prices: Json | null
          hand_finished_upcharge_fixed: number | null
          hand_finished_upcharge_percentage: number | null
          hand_price_per_drop: number | null
          hand_price_per_metre: number | null
          hand_price_per_panel: number | null
          header_allowance: number | null
          heading_name: string
          heading_upcharge_per_curtain: number | null
          heading_upcharge_per_metre: number | null
          height_breakpoint: number | null
          height_price_ranges: Json | null
          horizontal_repeat: number | null
          id: string
          is_railroadable: boolean | null
          lining_types: Json | null
          machine_drop_height_prices: Json | null
          machine_price_per_drop: number | null
          machine_price_per_metre: number | null
          machine_price_per_panel: number | null
          manufacturing_type: string
          name: string
          offers_hand_finished: boolean | null
          overlap: number | null
          price_above_breakpoint_multiplier: number | null
          price_rules: Json | null
          pricing_grid_data: Json | null
          pricing_type: string
          return_left: number | null
          return_right: number | null
          seam_hems: number
          selected_heading_ids: string[] | null
          side_hems: number
          unit_price: number | null
          updated_at: string
          user_id: string
          uses_height_pricing: boolean | null
          vertical_repeat: number | null
          waste_percent: number | null
        }
        Insert: {
          active?: boolean
          average_drop_width?: number | null
          bottom_hem?: number
          compatible_hardware?: string[] | null
          created_at?: string
          curtain_type?: string
          description?: string | null
          drop_height_ranges?: Json | null
          extra_fabric_fixed?: number | null
          extra_fabric_percentage?: number | null
          eyelet_spacing?: number | null
          fabric_direction?: string
          fabric_width_type?: string
          fullness_ratio?: number
          glider_spacing?: number | null
          hand_drop_height_prices?: Json | null
          hand_finished_upcharge_fixed?: number | null
          hand_finished_upcharge_percentage?: number | null
          hand_price_per_drop?: number | null
          hand_price_per_metre?: number | null
          hand_price_per_panel?: number | null
          header_allowance?: number | null
          heading_name: string
          heading_upcharge_per_curtain?: number | null
          heading_upcharge_per_metre?: number | null
          height_breakpoint?: number | null
          height_price_ranges?: Json | null
          horizontal_repeat?: number | null
          id?: string
          is_railroadable?: boolean | null
          lining_types?: Json | null
          machine_drop_height_prices?: Json | null
          machine_price_per_drop?: number | null
          machine_price_per_metre?: number | null
          machine_price_per_panel?: number | null
          manufacturing_type?: string
          name: string
          offers_hand_finished?: boolean | null
          overlap?: number | null
          price_above_breakpoint_multiplier?: number | null
          price_rules?: Json | null
          pricing_grid_data?: Json | null
          pricing_type?: string
          return_left?: number | null
          return_right?: number | null
          seam_hems?: number
          selected_heading_ids?: string[] | null
          side_hems?: number
          unit_price?: number | null
          updated_at?: string
          user_id: string
          uses_height_pricing?: boolean | null
          vertical_repeat?: number | null
          waste_percent?: number | null
        }
        Update: {
          active?: boolean
          average_drop_width?: number | null
          bottom_hem?: number
          compatible_hardware?: string[] | null
          created_at?: string
          curtain_type?: string
          description?: string | null
          drop_height_ranges?: Json | null
          extra_fabric_fixed?: number | null
          extra_fabric_percentage?: number | null
          eyelet_spacing?: number | null
          fabric_direction?: string
          fabric_width_type?: string
          fullness_ratio?: number
          glider_spacing?: number | null
          hand_drop_height_prices?: Json | null
          hand_finished_upcharge_fixed?: number | null
          hand_finished_upcharge_percentage?: number | null
          hand_price_per_drop?: number | null
          hand_price_per_metre?: number | null
          hand_price_per_panel?: number | null
          header_allowance?: number | null
          heading_name?: string
          heading_upcharge_per_curtain?: number | null
          heading_upcharge_per_metre?: number | null
          height_breakpoint?: number | null
          height_price_ranges?: Json | null
          horizontal_repeat?: number | null
          id?: string
          is_railroadable?: boolean | null
          lining_types?: Json | null
          machine_drop_height_prices?: Json | null
          machine_price_per_drop?: number | null
          machine_price_per_metre?: number | null
          machine_price_per_panel?: number | null
          manufacturing_type?: string
          name?: string
          offers_hand_finished?: boolean | null
          overlap?: number | null
          price_above_breakpoint_multiplier?: number | null
          price_rules?: Json | null
          pricing_grid_data?: Json | null
          pricing_type?: string
          return_left?: number | null
          return_right?: number | null
          seam_hems?: number
          selected_heading_ids?: string[] | null
          side_hems?: number
          unit_price?: number | null
          updated_at?: string
          user_id?: string
          uses_height_pricing?: boolean | null
          vertical_repeat?: number | null
          waste_percent?: number | null
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
      email_templates: {
        Row: {
          active: boolean | null
          content: string
          created_at: string
          id: string
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
          subject: string
          template_type: string
          updated_at?: string
          user_id: string
          variables?: Json | null
        }
        Update: {
          active?: boolean | null
          content?: string
          created_at?: string
          id?: string
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
          attachment_info: Json | null
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
          attachment_info?: Json | null
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
          attachment_info?: Json | null
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
      enhanced_inventory_items: {
        Row: {
          active: boolean | null
          category: string
          collection_name: string | null
          color: string | null
          cost_price: number | null
          created_at: string
          depth: number | null
          description: string | null
          fabric_care_instructions: string | null
          fabric_collection: string | null
          fabric_composition: string | null
          fabric_grade: string | null
          fabric_origin: string | null
          fabric_width: number | null
          finish: string | null
          fullness_ratio: number | null
          hardware_dimensions: string | null
          hardware_finish: string | null
          hardware_load_capacity: number | null
          hardware_material: string | null
          hardware_mounting_type: string | null
          hardware_weight: number | null
          height: number | null
          id: string
          image_url: string | null
          is_flame_retardant: boolean | null
          labor_hours: number | null
          location: string | null
          markup_percentage: number | null
          name: string
          pattern_repeat_horizontal: number | null
          pattern_repeat_vertical: number | null
          price_per_meter: number | null
          price_per_unit: number | null
          price_per_yard: number | null
          quantity: number | null
          reorder_point: number | null
          selling_price: number | null
          service_rate: number | null
          sku: string | null
          supplier: string | null
          unit: string | null
          unit_price: number | null
          updated_at: string
          user_id: string
          vendor_id: string | null
          weight: number | null
          width: number | null
        }
        Insert: {
          active?: boolean | null
          category: string
          collection_name?: string | null
          color?: string | null
          cost_price?: number | null
          created_at?: string
          depth?: number | null
          description?: string | null
          fabric_care_instructions?: string | null
          fabric_collection?: string | null
          fabric_composition?: string | null
          fabric_grade?: string | null
          fabric_origin?: string | null
          fabric_width?: number | null
          finish?: string | null
          fullness_ratio?: number | null
          hardware_dimensions?: string | null
          hardware_finish?: string | null
          hardware_load_capacity?: number | null
          hardware_material?: string | null
          hardware_mounting_type?: string | null
          hardware_weight?: number | null
          height?: number | null
          id?: string
          image_url?: string | null
          is_flame_retardant?: boolean | null
          labor_hours?: number | null
          location?: string | null
          markup_percentage?: number | null
          name: string
          pattern_repeat_horizontal?: number | null
          pattern_repeat_vertical?: number | null
          price_per_meter?: number | null
          price_per_unit?: number | null
          price_per_yard?: number | null
          quantity?: number | null
          reorder_point?: number | null
          selling_price?: number | null
          service_rate?: number | null
          sku?: string | null
          supplier?: string | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id: string
          vendor_id?: string | null
          weight?: number | null
          width?: number | null
        }
        Update: {
          active?: boolean | null
          category?: string
          collection_name?: string | null
          color?: string | null
          cost_price?: number | null
          created_at?: string
          depth?: number | null
          description?: string | null
          fabric_care_instructions?: string | null
          fabric_collection?: string | null
          fabric_composition?: string | null
          fabric_grade?: string | null
          fabric_origin?: string | null
          fabric_width?: number | null
          finish?: string | null
          fullness_ratio?: number | null
          hardware_dimensions?: string | null
          hardware_finish?: string | null
          hardware_load_capacity?: number | null
          hardware_material?: string | null
          hardware_mounting_type?: string | null
          hardware_weight?: number | null
          height?: number | null
          id?: string
          image_url?: string | null
          is_flame_retardant?: boolean | null
          labor_hours?: number | null
          location?: string | null
          markup_percentage?: number | null
          name?: string
          pattern_repeat_horizontal?: number | null
          pattern_repeat_vertical?: number | null
          price_per_meter?: number | null
          price_per_unit?: number | null
          price_per_yard?: number | null
          quantity?: number | null
          reorder_point?: number | null
          selling_price?: number | null
          service_rate?: number | null
          sku?: string | null
          supplier?: string | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
          weight?: number | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "enhanced_inventory_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      hardware_assemblies: {
        Row: {
          active: boolean | null
          assembly_type: string
          components: Json
          created_at: string
          description: string | null
          id: string
          name: string
          selling_price: number | null
          total_cost: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          assembly_type: string
          components?: Json
          created_at?: string
          description?: string | null
          id?: string
          name: string
          selling_price?: number | null
          total_cost?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          assembly_type?: string
          components?: Json
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          selling_price?: number | null
          total_cost?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          care_instructions: string | null
          category: string | null
          category_id: string | null
          collection_name: string | null
          color_code: string | null
          compatibility_tags: string[] | null
          composition: string | null
          created_at: string
          description: string | null
          fabric_width: number | null
          fire_rating: string | null
          fullness_ratio: number | null
          hardware_type: string | null
          id: string
          images: string[] | null
          installation_type: string | null
          last_ordered_date: string | null
          location: string | null
          material_finish: string | null
          max_length: number | null
          min_stock_level: number | null
          name: string
          pattern_direction: string | null
          pattern_repeat_horizontal: number | null
          pattern_repeat_vertical: number | null
          pricing_grid: Json | null
          pricing_method: string | null
          quantity: number | null
          reorder_point: number | null
          reorder_quantity: number | null
          roll_direction: string | null
          sku: string | null
          specifications: Json | null
          supplier: string | null
          transparency_level: string | null
          unit: string | null
          unit_price: number | null
          updated_at: string
          user_id: string
          vendor_id: string | null
          weight_capacity: number | null
        }
        Insert: {
          care_instructions?: string | null
          category?: string | null
          category_id?: string | null
          collection_name?: string | null
          color_code?: string | null
          compatibility_tags?: string[] | null
          composition?: string | null
          created_at?: string
          description?: string | null
          fabric_width?: number | null
          fire_rating?: string | null
          fullness_ratio?: number | null
          hardware_type?: string | null
          id?: string
          images?: string[] | null
          installation_type?: string | null
          last_ordered_date?: string | null
          location?: string | null
          material_finish?: string | null
          max_length?: number | null
          min_stock_level?: number | null
          name: string
          pattern_direction?: string | null
          pattern_repeat_horizontal?: number | null
          pattern_repeat_vertical?: number | null
          pricing_grid?: Json | null
          pricing_method?: string | null
          quantity?: number | null
          reorder_point?: number | null
          reorder_quantity?: number | null
          roll_direction?: string | null
          sku?: string | null
          specifications?: Json | null
          supplier?: string | null
          transparency_level?: string | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id: string
          vendor_id?: string | null
          weight_capacity?: number | null
        }
        Update: {
          care_instructions?: string | null
          category?: string | null
          category_id?: string | null
          collection_name?: string | null
          color_code?: string | null
          compatibility_tags?: string[] | null
          composition?: string | null
          created_at?: string
          description?: string | null
          fabric_width?: number | null
          fire_rating?: string | null
          fullness_ratio?: number | null
          hardware_type?: string | null
          id?: string
          images?: string[] | null
          installation_type?: string | null
          last_ordered_date?: string | null
          location?: string | null
          material_finish?: string | null
          max_length?: number | null
          min_stock_level?: number | null
          name?: string
          pattern_direction?: string | null
          pattern_repeat_horizontal?: number | null
          pattern_repeat_vertical?: number | null
          pricing_grid?: Json | null
          pricing_method?: string | null
          quantity?: number | null
          reorder_point?: number | null
          reorder_quantity?: number | null
          roll_direction?: string | null
          sku?: string | null
          specifications?: Json | null
          supplier?: string | null
          transparency_level?: string | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
          weight_capacity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          active: boolean | null
          category_type: string
          created_at: string
          description: string | null
          id: string
          name: string
          parent_category_id: string | null
          sort_order: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          category_type: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_category_id?: string | null
          sort_order?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          category_type?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_category_id?: string | null
          sort_order?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          id: string
          inventory_id: string
          movement_date: string | null
          movement_type: string
          notes: string | null
          quantity: number
          reference_id: string | null
          reference_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inventory_id: string
          movement_date?: string | null
          movement_type: string
          notes?: string | null
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inventory_id?: string
          movement_date?: string | null
          movement_type?: string
          notes?: string | null
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventory"
            referencedColumns: ["id"]
          },
        ]
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
      permission_audit_log: {
        Row: {
          action: string
          created_at: string
          created_by: string | null
          id: string
          new_value: boolean | null
          permission_name: string
          previous_value: boolean | null
          reason: string | null
          target_user_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          created_by?: string | null
          id?: string
          new_value?: boolean | null
          permission_name: string
          previous_value?: boolean | null
          reason?: string | null
          target_user_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          created_by?: string | null
          id?: string
          new_value?: boolean | null
          permission_name?: string
          previous_value?: boolean | null
          reason?: string | null
          target_user_id?: string
          user_id?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
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
          created_by: string | null
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
          created_by?: string | null
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
          created_by?: string | null
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
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      quote_templates: {
        Row: {
          active: boolean | null
          blocks: Json
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          preview_image_url: string | null
          template_style: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          blocks?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          preview_image_url?: string | null
          template_style?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          blocks?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          preview_image_url?: string | null
          template_style?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      sms_campaigns: {
        Row: {
          created_at: string
          failed_count: number | null
          id: string
          message: string
          name: string
          recipient_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          failed_count?: number | null
          id?: string
          message: string
          name: string
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          failed_count?: number | null
          id?: string
          message?: string
          name?: string
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sms_contacts: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          name: string | null
          opted_in: boolean | null
          opted_in_at: string | null
          opted_out_at: string | null
          phone_number: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          id?: string
          name?: string | null
          opted_in?: boolean | null
          opted_in_at?: string | null
          opted_out_at?: string | null
          phone_number: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          name?: string | null
          opted_in?: boolean | null
          opted_in_at?: string | null
          opted_out_at?: string | null
          phone_number?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sms_delivery_logs: {
        Row: {
          campaign_id: string | null
          contact_id: string | null
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          message: string
          phone_number: string
          provider_message_id: string | null
          sent_at: string | null
          status: string
          template_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message: string
          phone_number: string
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          template_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message?: string
          phone_number?: string
          provider_message_id?: string | null
          sent_at?: string | null
          status?: string
          template_id?: string | null
        }
        Relationships: []
      }
      sms_templates: {
        Row: {
          active: boolean | null
          created_at: string
          id: string
          message: string
          name: string
          template_type: string
          updated_at: string
          user_id: string
          variables: Json | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: string
          message: string
          name: string
          template_type: string
          updated_at?: string
          user_id: string
          variables?: Json | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: string
          message?: string
          name?: string
          template_type?: string
          updated_at?: string
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_projects: number | null
          max_users: number | null
          name: string
          price_monthly: number
          price_yearly: number
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_projects?: number | null
          max_users?: number | null
          name: string
          price_monthly?: number
          price_yearly?: number
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_projects?: number | null
          max_users?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string
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
      user_invitations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by_email: string | null
          invited_by_name: string | null
          invited_email: string
          invited_name: string | null
          permissions: Json | null
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by_email?: string | null
          invited_by_name?: string | null
          invited_email: string
          invited_name?: string | null
          permissions?: Json | null
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by_email?: string | null
          invited_by_name?: string | null
          invited_email?: string
          invited_name?: string | null
          permissions?: Json | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
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
      user_notification_settings: {
        Row: {
          created_at: string
          email_api_key_encrypted: string | null
          email_from_address: string | null
          email_from_name: string | null
          email_notifications_enabled: boolean
          email_service_provider: string | null
          id: string
          sms_api_key_encrypted: string | null
          sms_notifications_enabled: boolean
          sms_phone_number: string | null
          sms_service_provider: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_api_key_encrypted?: string | null
          email_from_address?: string | null
          email_from_name?: string | null
          email_notifications_enabled?: boolean
          email_service_provider?: string | null
          id?: string
          sms_api_key_encrypted?: string | null
          sms_notifications_enabled?: boolean
          sms_phone_number?: string | null
          sms_service_provider?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_api_key_encrypted?: string | null
          email_from_address?: string | null
          email_from_name?: string | null
          email_notifications_enabled?: boolean
          email_service_provider?: string | null
          id?: string
          sms_api_key_encrypted?: string | null
          sms_notifications_enabled?: boolean
          sms_phone_number?: string | null
          sms_service_provider?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          permission_name: string
          user_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_name: string
          user_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_name_fkey"
            columns: ["permission_name"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["name"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          currency: string | null
          date_format: string | null
          id: string
          language: string | null
          time_format: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          date_format?: string | null
          id?: string
          language?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          date_format?: string | null
          id?: string
          language?: string | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
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
          default_notification_minutes: number | null
          display_name: string | null
          email_notifications: boolean | null
          first_name: string | null
          invited_by_user_id: string | null
          is_active: boolean | null
          last_name: string | null
          parent_account_id: string | null
          permissions: Json | null
          phone_number: string | null
          role: string | null
          sms_notifications: boolean | null
          status: string | null
          status_message: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          default_notification_minutes?: number | null
          display_name?: string | null
          email_notifications?: boolean | null
          first_name?: string | null
          invited_by_user_id?: string | null
          is_active?: boolean | null
          last_name?: string | null
          parent_account_id?: string | null
          permissions?: Json | null
          phone_number?: string | null
          role?: string | null
          sms_notifications?: boolean | null
          status?: string | null
          status_message?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          default_notification_minutes?: number | null
          display_name?: string | null
          email_notifications?: boolean | null
          first_name?: string | null
          invited_by_user_id?: string | null
          is_active?: boolean | null
          last_name?: string | null
          parent_account_id?: string | null
          permissions?: Json | null
          phone_number?: string | null
          role?: string | null
          sms_notifications?: boolean | null
          status?: string | null
          status_message?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_invited_by_user_id_fkey"
            columns: ["invited_by_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_profiles_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_security_settings: {
        Row: {
          created_at: string
          id: string
          login_notifications: boolean | null
          security_alerts: boolean | null
          session_timeout_minutes: number | null
          two_factor_enabled: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          login_notifications?: boolean | null
          security_alerts?: boolean | null
          session_timeout_minutes?: number | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          login_notifications?: boolean | null
          security_alerts?: boolean | null
          session_timeout_minutes?: number | null
          two_factor_enabled?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
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
      window_coverings: {
        Row: {
          active: boolean | null
          base_price: number | null
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          base_price?: number | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          base_price?: number | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_user_invitation: {
        Args: { invitation_token_param: string; user_id_param: string }
        Returns: Json
      }
      can_edit_record: {
        Args: {
          record_user_id: string
          record_created_by: string
          record_type: string
          record_id: string
        }
        Returns: boolean
      }
      get_account_owner: {
        Args: { user_id_param: string }
        Returns: string
      }
      get_default_permissions_for_role: {
        Args: { user_role: string }
        Returns: string[]
      }
      get_user_email: {
        Args: { user_id: string }
        Returns: string
      }
      has_permission: {
        Args: { permission_name: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      validate_permission_dependencies: {
        Args: { user_id_param: string; permissions_param: string[] }
        Returns: Json
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
