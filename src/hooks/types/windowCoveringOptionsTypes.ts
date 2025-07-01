
export interface WindowCoveringOption {
  id: string;
  window_covering_id: string;
  option_type: string;
  name: string;
  description?: string;
  cost_type: string;
  base_cost: number;
  is_required: boolean;
  is_default: boolean;
  sort_order: number;
  image_url?: string;
  specifications?: any;
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
  image_url?: string;
  cost_type: string;
  pricing_method?: string;
  subcategories?: {
    id: string;
    name: string;
    description?: string;
    base_price: number;
    pricing_method: string;
    image_url?: string;
    sub_subcategories?: {
      id: string;
      name: string;
      description?: string;
      base_price: number;
      pricing_method: string;
      image_url?: string;
      extras?: {
        id: string;
        name: string;
        description?: string;
        base_price: number;
        pricing_method: string;
        image_url?: string;
        is_required: boolean;
        is_default: boolean;
      }[];
    }[];
  }[];
}
