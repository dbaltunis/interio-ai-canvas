export interface OnlineStore {
  id: string;
  user_id: string;
  store_name: string;
  store_slug: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  template_id: string;
  custom_domain?: string;
  domain_verified: boolean;
  is_published: boolean;
  seo_title?: string;
  seo_description?: string;
  google_analytics_id?: string;
  payment_provider: 'stripe' | 'paypal';
  stripe_account_id?: string;
  paypal_account_id?: string;
  created_at: string;
  updated_at: string;
}

export interface StoreTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'modern' | 'classic' | 'bold' | 'professional' | 'portfolio';
  preview_image_url?: string;
  preview_images?: string[];
  demo_url?: string;
  features?: Record<string, any>;
  template_config: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    defaultPages: Array<{
      type: string;
      title: string;
      slug: string;
      sections: Array<{
        type: string;
        content: Record<string, any>;
      }>;
    }>;
  };
  is_default: boolean;
  created_at: string;
}

export interface StorePage {
  id: string;
  store_id: string;
  page_type: string;
  title: string;
  slug: string;
  content: any[];
  is_active: boolean;
  sort_order: number;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface StoreInquiry {
  id: string;
  store_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  inquiry_type: 'quote_request' | 'product_inquiry' | 'general_contact' | 'booking_request';
  product_id?: string;
  message?: string;
  configuration_data: any;
  quote_data: any;
  status: 'new' | 'contacted' | 'quoted' | 'converted' | 'closed';
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface StoreProductVisibility {
  id: string;
  store_id: string;
  inventory_item_id: string;
  is_visible: boolean;
  is_featured: boolean;
  sort_order: number;
  custom_description?: string;
  custom_images: string[];
  created_at: string;
  updated_at: string;
}
