/**
 * Centralized Inventory Tags Configuration
 * 
 * Tags provide granular filtering within subcategories.
 * Example: curtain_fabric can have tags like "day", "night", "wide_width", "patterned"
 * 
 * This 3-level filtering system:
 * Level 1: SUBCATEGORY (what product type) - curtain_fabric, roller_fabric, venetian_slats
 * Level 2: PRICE GROUP (which pricing grid) - Group 1, Group 2, etc.
 * Level 3: TAGS (granular filtering) - day, night, wide_width, aluminium, 25mm
 */

export interface TagCategory {
  key: string;
  label: string;
  icon?: string;
  color?: string;
}

/**
 * Suggested tags per subcategory
 * These appear as quick-add buttons when creating/editing products
 */
export const SUBCATEGORY_TAGS: Record<string, TagCategory[]> = {
  // Fabric tags (for curtains, romans)
  curtain_fabric: [
    { key: "day", label: "Day Fabric", color: "bg-amber-100 text-amber-800" },
    { key: "night", label: "Night Fabric", color: "bg-indigo-100 text-indigo-800" },
    { key: "sheer", label: "Sheer", color: "bg-sky-100 text-sky-800" },
    { key: "blockout", label: "Blockout", color: "bg-slate-100 text-slate-800" },
    { key: "wide_width", label: "Wide Width (280cm+)", color: "bg-emerald-100 text-emerald-800" },
    { key: "narrow_width", label: "Narrow Width (137cm)", color: "bg-orange-100 text-orange-800" },
    { key: "patterned", label: "Patterned", color: "bg-purple-100 text-purple-800" },
    { key: "plain", label: "Plain", color: "bg-gray-100 text-gray-800" },
    { key: "textured", label: "Textured", color: "bg-rose-100 text-rose-800" },
    { key: "linen_look", label: "Linen Look", color: "bg-amber-100 text-amber-800" },
    { key: "velvet", label: "Velvet", color: "bg-violet-100 text-violet-800" },
  ],
  
  lining_fabric: [
    { key: "standard", label: "Standard Lining", color: "bg-gray-100 text-gray-800" },
    { key: "blockout", label: "Blockout Lining", color: "bg-slate-100 text-slate-800" },
    { key: "thermal", label: "Thermal", color: "bg-red-100 text-red-800" },
    { key: "bonded", label: "Bonded", color: "bg-blue-100 text-blue-800" },
    { key: "interlining", label: "Interlining", color: "bg-amber-100 text-amber-800" },
  ],

  sheer_fabric: [
    { key: "voile", label: "Voile", color: "bg-sky-100 text-sky-800" },
    { key: "lace", label: "Lace", color: "bg-pink-100 text-pink-800" },
    { key: "muslin", label: "Muslin", color: "bg-stone-100 text-stone-800" },
    { key: "embroidered", label: "Embroidered", color: "bg-purple-100 text-purple-800" },
  ],
  
  // Roller blind materials
  roller_fabric: [
    { key: "sunscreen", label: "Sunscreen", color: "bg-amber-100 text-amber-800" },
    { key: "blockout", label: "Blockout", color: "bg-slate-100 text-slate-800" },
    { key: "light_filtering", label: "Light Filtering", color: "bg-sky-100 text-sky-800" },
    { key: "3%", label: "3% Openness", color: "bg-orange-100 text-orange-800" },
    { key: "5%", label: "5% Openness", color: "bg-yellow-100 text-yellow-800" },
    { key: "10%", label: "10% Openness", color: "bg-lime-100 text-lime-800" },
    { key: "pvc_free", label: "PVC Free", color: "bg-green-100 text-green-800" },
    { key: "fire_retardant", label: "Fire Retardant", color: "bg-red-100 text-red-800" },
  ],
  
  // Venetian slat materials
  venetian_slats: [
    { key: "aluminium", label: "Aluminium", color: "bg-zinc-100 text-zinc-800" },
    { key: "basswood", label: "Basswood", color: "bg-amber-100 text-amber-800" },
    { key: "faux_wood", label: "Faux Wood", color: "bg-orange-100 text-orange-800" },
    { key: "paulownia", label: "Paulownia", color: "bg-yellow-100 text-yellow-800" },
    { key: "25mm", label: "25mm", color: "bg-blue-100 text-blue-800" },
    { key: "35mm", label: "35mm", color: "bg-indigo-100 text-indigo-800" },
    { key: "50mm", label: "50mm", color: "bg-purple-100 text-purple-800" },
    { key: "63mm", label: "63mm", color: "bg-pink-100 text-pink-800" },
    { key: "perforated", label: "Perforated", color: "bg-sky-100 text-sky-800" },
  ],
  
  // Vertical slat materials
  vertical_slats: [
    { key: "fabric", label: "Fabric", color: "bg-purple-100 text-purple-800" },
    { key: "pvc", label: "PVC", color: "bg-gray-100 text-gray-800" },
    { key: "89mm", label: "89mm", color: "bg-blue-100 text-blue-800" },
    { key: "127mm", label: "127mm", color: "bg-indigo-100 text-indigo-800" },
    { key: "blockout", label: "Blockout", color: "bg-slate-100 text-slate-800" },
    { key: "light_filtering", label: "Light Filtering", color: "bg-sky-100 text-sky-800" },
  ],
  
  // Cellular/honeycomb materials
  cellular: [
    { key: "single_cell", label: "Single Cell", color: "bg-blue-100 text-blue-800" },
    { key: "double_cell", label: "Double Cell", color: "bg-indigo-100 text-indigo-800" },
    { key: "20mm", label: "20mm Cell", color: "bg-gray-100 text-gray-800" },
    { key: "25mm", label: "25mm Cell", color: "bg-zinc-100 text-zinc-800" },
    { key: "45mm", label: "45mm Cell", color: "bg-slate-100 text-slate-800" },
    { key: "blockout", label: "Blockout", color: "bg-slate-100 text-slate-800" },
    { key: "light_filtering", label: "Light Filtering", color: "bg-sky-100 text-sky-800" },
    { key: "day_night", label: "Day/Night", color: "bg-amber-100 text-amber-800" },
  ],
  
  // Shutter materials
  shutter_material: [
    { key: "basswood", label: "Basswood", color: "bg-amber-100 text-amber-800" },
    { key: "polymer", label: "Polymer", color: "bg-gray-100 text-gray-800" },
    { key: "aluminium", label: "Aluminium", color: "bg-zinc-100 text-zinc-800" },
    { key: "pvc", label: "PVC", color: "bg-slate-100 text-slate-800" },
    { key: "63mm", label: "63mm Blades", color: "bg-blue-100 text-blue-800" },
    { key: "89mm", label: "89mm Blades", color: "bg-indigo-100 text-indigo-800" },
    { key: "114mm", label: "114mm Blades", color: "bg-purple-100 text-purple-800" },
  ],
  
  // Panel glide fabrics
  panel_glide_fabric: [
    { key: "sunscreen", label: "Sunscreen", color: "bg-amber-100 text-amber-800" },
    { key: "blockout", label: "Blockout", color: "bg-slate-100 text-slate-800" },
    { key: "translucent", label: "Translucent", color: "bg-sky-100 text-sky-800" },
    { key: "natural_weave", label: "Natural Weave", color: "bg-stone-100 text-stone-800" },
  ],
  
  // Awning fabrics
  awning_fabric: [
    { key: "acrylic", label: "Acrylic", color: "bg-blue-100 text-blue-800" },
    { key: "mesh", label: "Mesh", color: "bg-gray-100 text-gray-800" },
    { key: "pvc", label: "PVC", color: "bg-slate-100 text-slate-800" },
    { key: "canvas", label: "Canvas", color: "bg-amber-100 text-amber-800" },
    { key: "striped", label: "Striped", color: "bg-purple-100 text-purple-800" },
    { key: "solid", label: "Solid Color", color: "bg-zinc-100 text-zinc-800" },
  ],
  
  // Wallpaper
  wallpaper: [
    { key: "vinyl", label: "Vinyl", color: "bg-blue-100 text-blue-800" },
    { key: "non_woven", label: "Non-Woven", color: "bg-gray-100 text-gray-800" },
    { key: "grasscloth", label: "Grasscloth", color: "bg-green-100 text-green-800" },
    { key: "textured", label: "Textured", color: "bg-rose-100 text-rose-800" },
    { key: "peel_stick", label: "Peel & Stick", color: "bg-orange-100 text-orange-800" },
    { key: "mural", label: "Mural", color: "bg-purple-100 text-purple-800" },
  ],
  
  // Hardware
  rod: [
    { key: "wood", label: "Wood", color: "bg-amber-100 text-amber-800" },
    { key: "metal", label: "Metal", color: "bg-zinc-100 text-zinc-800" },
    { key: "acrylic", label: "Acrylic", color: "bg-sky-100 text-sky-800" },
    { key: "28mm", label: "28mm", color: "bg-blue-100 text-blue-800" },
    { key: "35mm", label: "35mm", color: "bg-indigo-100 text-indigo-800" },
    { key: "50mm", label: "50mm", color: "bg-purple-100 text-purple-800" },
  ],
  
  track: [
    { key: "ceiling_fix", label: "Ceiling Fix", color: "bg-blue-100 text-blue-800" },
    { key: "wall_fix", label: "Wall Fix", color: "bg-gray-100 text-gray-800" },
    { key: "motorised", label: "Motorised", color: "bg-green-100 text-green-800" },
    { key: "hand_draw", label: "Hand Draw", color: "bg-orange-100 text-orange-800" },
    { key: "corded", label: "Corded", color: "bg-yellow-100 text-yellow-800" },
    { key: "wave", label: "Wave/Ripplefold", color: "bg-purple-100 text-purple-800" },
  ],
  
  motor: [
    { key: "battery", label: "Battery", color: "bg-green-100 text-green-800" },
    { key: "hardwired", label: "Hardwired", color: "bg-blue-100 text-blue-800" },
    { key: "solar", label: "Solar", color: "bg-amber-100 text-amber-800" },
    { key: "wifi", label: "WiFi", color: "bg-purple-100 text-purple-800" },
    { key: "bluetooth", label: "Bluetooth", color: "bg-indigo-100 text-indigo-800" },
    { key: "alexa", label: "Alexa Compatible", color: "bg-sky-100 text-sky-800" },
  ],
};

/**
 * Get suggested tags for a given subcategory
 */
export const getTagsForSubcategory = (subcategory: string): TagCategory[] => {
  return SUBCATEGORY_TAGS[subcategory] || [];
};

/**
 * Get all unique tags across all subcategories (for search/filtering)
 */
export const getAllTags = (): TagCategory[] => {
  const allTags: TagCategory[] = [];
  const seenKeys = new Set<string>();
  
  Object.values(SUBCATEGORY_TAGS).forEach(tags => {
    tags.forEach(tag => {
      if (!seenKeys.has(tag.key)) {
        seenKeys.add(tag.key);
        allTags.push(tag);
      }
    });
  });
  
  return allTags;
};

/**
 * Popular filter groups for quick filtering
 */
export const QUICK_FILTER_GROUPS = {
  width: {
    label: "Width",
    tags: ["wide_width", "narrow_width"]
  },
  opacity: {
    label: "Opacity", 
    tags: ["blockout", "light_filtering", "sheer", "sunscreen"]
  },
  material_type: {
    label: "Material",
    tags: ["aluminium", "basswood", "faux_wood", "pvc", "fabric"]
  },
  slat_size: {
    label: "Size",
    tags: ["25mm", "35mm", "50mm", "63mm", "89mm", "127mm"]
  },
  style: {
    label: "Style",
    tags: ["patterned", "plain", "textured", "striped"]
  }
};

/**
 * CSV Import/Export tag column helpers
 */
export const tagsToCSV = (tags: string[] | undefined): string => {
  return tags?.join(';') || '';
};

export const csvToTags = (csvValue: string): string[] => {
  return csvValue ? csvValue.split(';').map(t => t.trim()).filter(Boolean) : [];
};
