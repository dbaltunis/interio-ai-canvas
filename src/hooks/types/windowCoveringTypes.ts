
export interface OptionCategory {
  id: string;
  name: string;
  description?: string;
  is_required: boolean;
  sort_order: number;
  subcategories?: OptionSubcategory[];
}

export interface OptionSubcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  pricing_method: 'per-unit' | 'per-meter' | 'per-sqm' | 'fabric-based' | 'fixed' | 'percentage';
  base_price: number;
  fullness_ratio?: number;
  extra_fabric_percentage?: number;
  sort_order: number;
}
