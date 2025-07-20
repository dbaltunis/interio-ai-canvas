
export interface WindowCoveringOption {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  base_cost: number; // Added for compatibility
  cost_type: string; // Added for compatibility
  option_type: string; // Added for compatibility
  window_covering_id: string; // Added for compatibility
  image_url?: string;
  is_required?: boolean;
  is_default: boolean;
  active: boolean;
  sort_order: number;
  pricing_method?: string;
}

export interface SubSubCategory {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  pricing_method: string; // Made required
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
