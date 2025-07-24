export interface BaseIntegration {
  id: string;
  user_id: string;
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
    api_key: string;
    client_id: string;
  };
  configuration: {
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

export type IntegrationType = TIGPIMIntegration | MYOBExoIntegration | RFMSIntegration | ZohoCRMIntegration;

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