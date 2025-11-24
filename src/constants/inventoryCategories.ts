// Inventory Category Definitions
// Single source of truth for all inventory categories and subcategories

export const INVENTORY_CATEGORIES = {
  // Fabrics (used for both curtains and Roman blinds)
  fabrics: {
    label: "Curtain/Roman Fabrics",
    subcategories: [
      { value: "curtain_fabric", label: "Curtain Fabric" },
      { value: "roman_fabric", label: "Roman Blind Fabric" },
      { value: "sheer_fabric", label: "Sheer Fabric" },
      { value: "furniture_fabric", label: "Furniture Fabric" },
    ]
  },
  
  // Blind Materials
  roller_fabric: {
    label: "Roller Blind Fabric",
    subcategories: [
      { value: "light_filtering", label: "Light Filtering" },
      { value: "blockout", label: "Blockout" },
      { value: "sunscreen", label: "Sunscreen" },
      { value: "dual_roller", label: "Dual Roller" },
    ]
  },
  
  venetian_slats: {
    label: "Venetian Slats",
    subcategories: [
      { value: "wood_25mm", label: "Wood 25mm (1\")" },
      { value: "wood_50mm", label: "Wood 50mm (2\")" },
      { value: "wood_63mm", label: "Wood 63mm (2.5\")" },
      { value: "aluminum_16mm", label: "Aluminum 16mm" },
      { value: "aluminum_25mm", label: "Aluminum 25mm (1\")" },
      { value: "aluminum_50mm", label: "Aluminum 50mm (2\")" },
    ]
  },
  
  vertical_vanes: {
    label: "Vertical Vanes",
    subcategories: [
      { value: "fabric_89mm", label: "Fabric 89mm (3.5\")" },
      { value: "fabric_127mm", label: "Fabric 127mm (5\")" },
      { value: "pvc_89mm", label: "PVC 89mm (3.5\")" },
      { value: "pvc_127mm", label: "PVC 127mm (5\")" },
    ]
  },
  
  cellular_fabric: {
    label: "Cellular/Honeycomb Fabric",
    subcategories: [
      { value: "single_cell_16mm", label: "Single Cell 16mm" },
      { value: "single_cell_20mm", label: "Single Cell 20mm" },
      { value: "double_cell_25mm", label: "Double Cell 25mm" },
      { value: "blackout_single", label: "Blackout Single Cell" },
      { value: "blackout_double", label: "Blackout Double Cell" },
    ]
  },
  
  // Other Treatments
  shutter_panels: {
    label: "Shutter Panels",
    subcategories: [
      { value: "plantation_63mm", label: "Plantation 63mm (2.5\")" },
      { value: "plantation_89mm", label: "Plantation 89mm (3.5\")" },
      { value: "cafe_style", label: "Cafe Style" },
      { value: "solid_panel", label: "Solid Panel" },
    ]
  },
  
  panel_glide_fabric: {
    label: "Panel Glide Fabric",
    subcategories: [
      { value: "light_filtering", label: "Light Filtering" },
      { value: "blockout", label: "Blockout" },
      { value: "decorative", label: "Decorative" },
    ]
  },
  
  awning_fabric: {
    label: "Awning Fabric",
    subcategories: [
      { value: "outdoor_acrylic", label: "Outdoor Acrylic" },
      { value: "outdoor_pvc", label: "Outdoor PVC" },
      { value: "retractable", label: "Retractable" },
    ]
  },
  
  // Hardware & Other
  hardware: {
    label: "Hardware & Tracks",
    subcategories: [
      { value: "rod", label: "Rods/Poles" },
      { value: "track", label: "Tracks" },
      { value: "motor", label: "Motors" },
      { value: "bracket", label: "Brackets" },
      { value: "accessory", label: "Accessories" },
    ]
  },
  
  wallcoverings: {
    label: "Wallcoverings",
    subcategories: [
      { value: "wallpaper", label: "Wallpaper" },
      { value: "wall_fabric", label: "Wall Fabric" },
      { value: "wall_panel", label: "Wall Panel" },
    ]
  }
} as const;

export type InventoryCategoryKey = keyof typeof INVENTORY_CATEGORIES;

export const getCategoryLabel = (key: string): string => {
  const category = INVENTORY_CATEGORIES[key as InventoryCategoryKey];
  return category?.label || key;
};

export const getSubcategoryLabel = (categoryKey: string, subcategoryValue: string): string => {
  const category = INVENTORY_CATEGORIES[categoryKey as InventoryCategoryKey];
  if (!category) return subcategoryValue;
  
  const subcategory = category.subcategories.find(sub => sub.value === subcategoryValue);
  return subcategory?.label || subcategoryValue;
};

// Predefined color palette for color variant system
export const COLOR_PALETTE = [
  { name: "White", value: "white", hex: "#FFFFFF" },
  { name: "Ivory", value: "ivory", hex: "#FFFFF0" },
  { name: "Cream", value: "cream", hex: "#FFFDD0" },
  { name: "Beige", value: "beige", hex: "#F5F5DC" },
  { name: "Light Grey", value: "light_grey", hex: "#D3D3D3" },
  { name: "Grey", value: "grey", hex: "#808080" },
  { name: "Charcoal", value: "charcoal", hex: "#36454F" },
  { name: "Black", value: "black", hex: "#000000" },
  { name: "Silver", value: "silver", hex: "#C0C0C0" },
  { name: "Bronze", value: "bronze", hex: "#CD7F32" },
  { name: "Gold", value: "gold", hex: "#FFD700" },
  { name: "Brown", value: "brown", hex: "#964B00" },
  { name: "Tan", value: "tan", hex: "#D2B48C" },
  { name: "Navy", value: "navy", hex: "#000080" },
  { name: "Blue", value: "blue", hex: "#0000FF" },
  { name: "Light Blue", value: "light_blue", hex: "#ADD8E6" },
  { name: "Green", value: "green", hex: "#008000" },
  { name: "Sage", value: "sage", hex: "#9DC183" },
  { name: "Red", value: "red", hex: "#FF0000" },
  { name: "Burgundy", value: "burgundy", hex: "#800020" },
  { name: "Pink", value: "pink", hex: "#FFC0CB" },
  { name: "Purple", value: "purple", hex: "#800080" },
  { name: "Yellow", value: "yellow", hex: "#FFFF00" },
  { name: "Orange", value: "orange", hex: "#FFA500" },
] as const;

export type ColorOption = typeof COLOR_PALETTE[number];
