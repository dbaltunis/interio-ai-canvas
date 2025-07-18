
export interface OptionCategory {
  id: string;
  name: string;
  description?: string;
  is_required: boolean;
  sort_order: number;
  image_url?: string;
  category_type?: string;
  has_fullness_ratio?: boolean;
  fullness_ratio?: number;
  calculation_method?: 'per-unit' | 'per-linear-meter' | 'per-linear-yard' | 'per-sqm' | 'fixed' | 'percentage';
  affects_fabric_calculation?: boolean;
  affects_labor_calculation?: boolean;
  subcategories?: OptionSubcategory[];
}

export interface OptionSubcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  pricing_method: 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage';
  base_price: number;
  fullness_ratio?: number;
  extra_fabric_percentage?: number;
  sort_order: number;
  image_url?: string;
  calculation_method?: string;
  sub_subcategories?: OptionSubSubcategory[];
}

export interface OptionSubSubcategory {
  id: string;
  subcategory_id: string;
  name: string;
  description?: string;
  pricing_method: 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage';
  base_price: number;
  fullness_ratio?: number;
  extra_fabric_percentage?: number;
  sort_order: number;
  image_url?: string;
  calculation_method?: string;
  extras?: OptionExtra[];
}

export interface OptionExtra {
  id: string;
  sub_subcategory_id: string;
  name: string;
  description?: string;
  pricing_method: 'per-unit' | 'per-meter' | 'per-sqm' | 'fixed' | 'percentage' | 'per-item';
  base_price: number;
  sort_order: number;
  image_url?: string;
  is_required: boolean;
  is_default: boolean;
  fullness_ratio?: number;
  calculation_method?: string;
}
