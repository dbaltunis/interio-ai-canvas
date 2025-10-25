
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

export interface InventoryCategory {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category_type: 'fabric' | 'hardware' | 'wallcovering' | 'service' | 'accessory';
  parent_category_id?: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EnhancedInventoryItem {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  subcategory?: string;
  quantity: number;
  unit?: string;
  cost_price: number;
  selling_price: number;
  profit_per_unit?: number;
  markup_percentage?: number;
  margin_percentage?: number;
  supplier?: string;
  location?: string;
  min_stock_level?: number;
  
  // Fabric-specific fields
  fabric_width?: number;
  pattern_repeat_vertical?: number;
  pattern_repeat_horizontal?: number;
  fullness_ratio?: number;
  composition?: string;
  care_instructions?: string;
  roll_direction?: 'face_in' | 'face_out' | 'either';
  collection_name?: string;
  color_code?: string;
  pattern_direction?: 'straight' | 'half_drop' | 'random';
  transparency_level?: 'blackout' | 'dim_out' | 'screen' | 'transparent';
  fire_rating?: string;
  
  // Hardware-specific fields
  hardware_type?: 'track' | 'rod' | 'bracket' | 'motor' | 'accessory';
  material_finish?: string;
  weight_capacity?: number;
  max_length?: number;
  installation_type?: string;
  compatibility_tags?: string[];
  
  // Pricing and specs
  pricing_method: 'per_unit' | 'per_meter' | 'per_sqm' | 'per_roll' | 'price_grid';
  pricing_grid?: any;
  specifications?: any;
  images?: string[];
  vendor_id?: string;
  reorder_point: number;
  reorder_quantity: number;
  last_ordered_date?: string;
  category_id?: string;
  
  created_at: string;
  updated_at: string;
}

export interface HardwareAssembly {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  assembly_type: 'track_system' | 'rod_system' | 'motor_kit' | 'bracket_set';
  components: any[];
  total_cost: number;
  selling_price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryMovement {
  id: string;
  user_id: string;
  inventory_id: string;
  movement_type: 'stock_in' | 'stock_out' | 'adjustment' | 'transfer' | 'reserved' | 'unreserved';
  quantity: number;
  reference_type?: 'purchase_order' | 'sale_order' | 'adjustment' | 'transfer' | 'project';
  reference_id?: string;
  notes?: string;
  movement_date: string;
  created_at: string;
}
