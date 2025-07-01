
export interface OptionCategory {
  id: string;
  name: string;
  description?: string;
  is_required: boolean;
  sort_order: number;
  image_url?: string;
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
}
