
// Database types for tables not yet in Supabase types
export interface PricingGrid {
  id: string;
  user_id: string;
  name: string;
  grid_data: {
    widthColumns?: string[];
    dropRows?: Array<{
      drop: string;
      prices: number[];
    }>;
  };
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WindowCoveringOptionCategory {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_required: boolean;
  image_url?: string;
  subcategories?: WindowCoveringOptionSubcategory[];
  created_at: string;
  updated_at: string;
}

export interface WindowCoveringOptionSubcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  pricing_method: string;
  base_price: number;
  subsubcategories?: WindowCoveringOptionSubSubcategory[];
  extras?: WindowCoveringOptionExtra[];
  created_at: string;
  updated_at: string;
}

export interface WindowCoveringOptionSubSubcategory {
  id: string;
  subcategory_id: string;
  name: string;
  description?: string;
  pricing_method: string;
  base_price: number;
  created_at: string;
  updated_at: string;
}

export interface WindowCoveringOptionExtra {
  id: string;
  subcategory_id: string;
  name: string;
  description?: string;
  pricing_method: string;
  base_price: number;
  created_at: string;
  updated_at: string;
}

export interface WindowCoveringOptionAssignment {
  id: string;
  window_covering_id: string;
  category_id: string;
  user_id: string;
  created_at: string;
}

export interface BusinessSettings {
  id: string;
  user_id: string;
  company_name: string;
  abn?: string;
  business_email: string;
  business_phone: string;
  address: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  measurement_units?: string;
  created_at: string;
  updated_at: string;
}
