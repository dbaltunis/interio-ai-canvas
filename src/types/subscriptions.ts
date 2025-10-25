export interface SubscriptionAddOn {
  id: string;
  name: string;
  description?: string;
  feature_key: string;
  price_monthly: number;
  price_yearly: number;
  is_active: boolean;
  display_order: number;
  add_on_type: 'feature' | 'capacity' | 'integration';
  created_at: string;
  updated_at: string;
}

export interface UsageTracking {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  inventory_items_count: number;
  emails_sent_count: number;
  active_integrations: string[];
  created_at: string;
  updated_at: string;
}

export interface UserSubscriptionAddOn {
  id: string;
  user_id: string;
  add_on_id: string;
  subscription_id?: string;
  is_active: boolean;
  activated_at: string;
  created_at: string;
  add_on?: SubscriptionAddOn;
}

export interface ShopifyIntegration {
  id: string;
  user_id: string;
  shop_domain: string;
  access_token: string | null;
  webhook_secret: string | null;
  is_connected: boolean | null;
  auto_sync_enabled: boolean | null;
  sync_inventory: boolean | null;
  sync_prices: boolean | null;
  sync_images: boolean | null;
  last_sync_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ManualQuoteItem {
  id: string;
  quote_id: string;
  user_id: string;
  item_name: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  tax_rate: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
