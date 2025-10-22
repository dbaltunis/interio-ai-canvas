export interface SubscriptionAddOn {
  id: string;
  name: string;
  description?: string;
  feature_key: string;
  price_monthly: number;
  price_yearly: number;
  is_active: boolean;
  display_order: number;
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
  access_token?: string;
  webhook_secret?: string;
  is_connected: boolean;
  auto_sync_enabled: boolean;
  sync_inventory: boolean;
  sync_prices: boolean;
  sync_images: boolean;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
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
