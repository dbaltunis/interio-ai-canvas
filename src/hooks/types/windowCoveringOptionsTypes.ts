
export interface WindowCoveringOption {
  id: string;
  name: string;
  label?: string;
  description?: string;
  base_price: number;
  base_cost: number;
  cost_type: string;
  option_type: string;
  window_covering_id: string;
  image_url?: string;
  is_required?: boolean;
  is_default: boolean;
  active: boolean;
  sort_order: number;
  pricing_method?: string;
  pricing_grid_data?: any;
  key?: string;
  option_values?: any[];
}

export interface SubSubCategory {
  id: string;
  name: string;
  label?: string;
  description?: string;
  base_price: number;
  pricing_method: string;
  pricing_grid_data?: any;
  image_url?: string;
  extras?: WindowCoveringOption[];
}

export interface SubCategory {
  id: string;
  name: string;
  description?: string;
  base_price?: number; // Added for compatibility
  pricing_method?: string; // Added for compatibility
  sub_subcategories?: SubSubCategory[];
}

export interface HierarchicalOption {
  id: string;
  name: string;
  description?: string;
  subcategories?: SubCategory[];
}
