
// Types for window covering options
export interface WindowCoveringOption {
  id: string;
  window_covering_id: string;
  name: string;
  description?: string;
  option_type: string;
  base_cost: number;
  cost_type: string;
  is_required: boolean;
  is_default: boolean;
  sort_order: number;
}

export interface HierarchicalOption {
  id: string;
  name: string;
  description?: string;
  option_type: string;
  base_cost: number;
  is_required: boolean;
  is_default: boolean;
  sort_order: number;
  cost_type: string;
  pricing_method: string;
  subcategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  pricing_method: string;
  image_url?: string;
  sub_subcategories: SubSubCategory[];
}

export interface SubSubCategory {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  pricing_method: string;
  image_url?: string;
}
