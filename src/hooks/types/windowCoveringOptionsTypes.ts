
export interface WindowCoveringOption {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  is_required?: boolean;
  is_default?: boolean;
  active: boolean;
}

export interface SubSubCategory {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  extras?: WindowCoveringOption[];
}

export interface SubCategory {
  id: string;
  name: string;
  description?: string;
  sub_subcategories?: SubSubCategory[];
}

export interface HierarchicalOption {
  id: string;
  name: string;
  description?: string;
  subcategories?: SubCategory[];
}
