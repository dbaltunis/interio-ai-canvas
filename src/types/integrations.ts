export interface BaseIntegration {
  id: string;
  user_id: string;
  account_owner_id: string;
  integration_type: string;
  active: boolean;
  api_credentials: Record<string, any>;
  configuration: Record<string, any>;
  last_sync: string | null;
  created_at: string;
  updated_at: string;
}

export interface TIGPIMIntegration extends BaseIntegration {
  integration_type: 'tig_pim';
  api_credentials: {
    api_url: string;
    api_key: string;
    username?: string;
  };
  configuration: {
    auto_sync_products: boolean;
    sync_interval_hours: number;
    sync_pricing: boolean;
    sync_availability: boolean;
    default_supplier_id?: string;
  };
}

export interface MYOBExoIntegration extends BaseIntegration {
  integration_type: 'myob_exo';
  api_credentials: {
    server_url: string;
    database_id: string;
    username: string;
    password: string;
    api_key?: string;
  };
  configuration: {
    auto_export_quotes: boolean;
    default_gl_account: string;
    tax_code_mapping: Record<string, string>;
    customer_sync: boolean;
    create_purchase_orders: boolean;
  };
}

export interface RFMSIntegration extends BaseIntegration {
  integration_type: 'rfms';
  api_credentials: {
    api_url: string;
    store_queue: string;
    api_key: string;
    session_token?: string;
    session_started_at?: string;
  };
  configuration: {
    sync_customers: boolean;
    sync_quotes: boolean;
    sync_measurements: boolean;
    sync_scheduling: boolean;
    auto_update_job_status: boolean;
    measurement_units: 'metric' | 'imperial';
  };
}

export interface ZohoCRMIntegration extends BaseIntegration {
  integration_type: 'zoho_crm';
  api_credentials: {
    client_id: string;
    client_secret: string;
    refresh_token: string;
    access_token?: string;
    domain: string;
  };
  configuration: {
    sync_leads: boolean;
    sync_opportunities: boolean;
    sync_contacts: boolean;
    lead_assignment_rules: boolean;
    activity_logging: boolean;
  };
}

export interface GoogleCalendarIntegration extends BaseIntegration {
  integration_type: 'google_calendar';
  api_credentials: {
    client_id: string;
    client_secret: string;
    refresh_token: string;
    access_token?: string;
  };
  configuration: {
    calendar_id: string;
    sync_appointments: boolean;
    auto_create_events: boolean;
    sync_direction: 'app_to_calendar' | 'calendar_to_app' | 'both';
    event_duration_buffer: number;
  };
}

export interface OutlookCalendarIntegration extends BaseIntegration {
  integration_type: 'outlook_calendar';
  api_credentials: {
    access_token: string;
    refresh_token: string;
    expires_at?: string;
  };
  configuration: {
    calendar_id: string;
    sync_enabled: boolean;
    sync_appointments: boolean;
    auto_create_events: boolean;
    sync_direction: 'app_to_calendar' | 'calendar_to_app' | 'both';
  };
}

export interface TwilioIntegration extends BaseIntegration {
  integration_type: 'twilio';
  api_credentials: {
    account_sid: string;
    auth_token: string;
  };
  configuration: {
    phone_number: string;
    webhook_url?: string;
  };
}

export interface SendGridIntegration extends BaseIntegration {
  integration_type: 'sendgrid';
  api_credentials: {
    api_key: string;
  };
  configuration: {
    sender_email: string;
    sender_name: string;
    default_template_id?: string;
  };
}

export interface TWCIntegration extends BaseIntegration {
  integration_type: 'twc';
  api_credentials: {
    api_url: string;
    api_key: string;
    environment: 'staging' | 'production';
  };
  configuration: {
    auto_sync_options: boolean;
    sync_fabrics: boolean;
    sync_colors: boolean;
    default_item_mapping: Record<string, string>;
  };
}

export interface NetSuiteIntegration extends BaseIntegration {
  integration_type: 'netsuite';
  api_credentials: {
    account_id: string;
    consumer_key: string;
    consumer_secret: string;
    token_id: string;
    token_secret: string;
  };
  configuration: {
    sync_customers: boolean;
    sync_estimates: boolean;
    sync_sales_orders: boolean;
    sync_invoices: boolean;
    auto_create_customers: boolean;
    default_subsidiary?: string;
    default_currency?: string;
  };
}

export interface CWSystemsIntegration extends BaseIntegration {
  integration_type: 'cw_systems';
  api_credentials: {
    account_code: string;
    account_name: string;
    supplier_email: string;
    contact_name?: string;
    contact_phone?: string;
    /** Bearer token from the CORA CW Trade Hub company profile — enables direct API ordering */
    api_token?: string;
    /** Email address registered with CW Trade Hub (used as user_email in API calls) */
    api_user_email?: string;
  };
  configuration: {
    default_delivery_address: string;
    default_payment_terms: string;
    notes_template?: string;
    /** 'api' when Bearer token is configured; 'email' otherwise */
    order_method: 'email' | 'api';
  };
}

export interface NormanAustraliaIntegration extends BaseIntegration {
  integration_type: 'norman_australia';
  api_credentials: {
    account_number: string;
    account_name: string;
    supplier_email: string;
    contact_name?: string;
    contact_phone?: string;
  };
  configuration: {
    default_delivery_address: string;
    default_payment_terms: string;
    notes_template?: string;
    order_method: 'email';
  };
}

export type IntegrationType = TIGPIMIntegration | MYOBExoIntegration | RFMSIntegration | ZohoCRMIntegration | GoogleCalendarIntegration | OutlookCalendarIntegration | TwilioIntegration | SendGridIntegration | TWCIntegration | NetSuiteIntegration | CWSystemsIntegration | NormanAustraliaIntegration;

export interface IntegrationSyncLog {
  id: string;
  integration_id: string;
  sync_type: string;
  status: 'pending' | 'success' | 'error' | 'partial';
  records_processed: number;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export interface IntegrationError {
  id: string;
  integration_id: string;
  error_type: string;
  error_message: string;
  context: Record<string, any>;
  resolved: boolean;
  created_at: string;
}