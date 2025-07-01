
export interface OptionCategory {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_required: boolean;
  sort_order: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
  subcategories?: OptionSubcategory[];
}

export interface OptionSubcategory {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  description?: string;
  pricing_method: 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage';
  base_price: number;
  fullness_ratio?: number;
  extra_fabric_percentage?: number;
  sort_order: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}
