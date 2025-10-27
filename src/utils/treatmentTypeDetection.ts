export type TreatmentCategory = 'curtains' | 'blinds' | 'roller_blinds' | 'roman_blinds' | 'venetian_blinds' | 'vertical_blinds' | 'cellular_blinds' | 'cellular_shades' | 'panel_glide' | 'plantation_shutters' | 'shutters' | 'awning' | 'wallpaper';

export interface TreatmentConfig {
  requiresFullness: boolean;
  requiresHardwareType: boolean;
  requiresFabricOrientation: boolean;
  requiresHeading: boolean;
  requiresLining: boolean;
  showPooling: boolean;
  inventoryCategory: string;
  specificFields?: string[];
  visualComponent: string;
}

export const detectTreatmentType = (template: any): TreatmentCategory => {
  // Priority 1: Check curtain_type field for wallpaper FIRST (special case override)
  if (template?.curtain_type) {
    const curtainType = template.curtain_type.toLowerCase();
    
    // Wallpaper check takes highest priority
    if (curtainType === 'wallpaper' || curtainType.includes('wallpaper')) {
      return 'wallpaper';
    }
  }
  
  // Priority 2: Check if template has explicit treatment_category field
  if (template?.treatment_category) {
    const category = template.treatment_category;
    // Map database categories to internal categories
    if (category === 'cellular_shades') return 'cellular_shades';
    if (category === 'wallpaper') return 'wallpaper';
    return category as TreatmentCategory;
  }
  
  // Priority 3: Check remaining curtain_type patterns
  if (template?.curtain_type) {
    const curtainType = template.curtain_type.toLowerCase();
    
    if (curtainType === 'roller_blind' || curtainType === 'roller blind' || curtainType.includes('roller')) {
      return 'roller_blinds';
    }
    if (curtainType === 'roman_blind' || curtainType === 'roman blind' || curtainType.includes('roman')) {
      return 'roman_blinds';
    }
    if (curtainType === 'venetian_blind' || curtainType === 'venetian blind' || curtainType.includes('venetian')) {
      return 'venetian_blinds';
    }
    if (curtainType === 'vertical_blind' || curtainType === 'vertical blind' || curtainType.includes('vertical')) {
      return 'vertical_blinds';
    }
    if (curtainType === 'cellular_shade' || curtainType === 'cellular_blind' || curtainType === 'cellular' || curtainType.includes('cellular') || curtainType.includes('honeycomb')) {
      return 'cellular_shades';
    }
    if (curtainType === 'panel_glide' || curtainType.includes('panel')) {
      return 'panel_glide';
    }
    if (curtainType === 'plantation_shutter' || curtainType.includes('plantation')) {
      return 'plantation_shutters';
    }
    if (curtainType.includes('shutter')) {
      return 'shutters';
    }
    if (curtainType === 'awning' || curtainType.includes('awning')) {
      return 'awning';
    }
    // Default to curtains for 'curtain', 'single', 'pair', etc.
    if (curtainType === 'curtain' || curtainType === 'single' || curtainType === 'pair') {
      return 'curtains';
    }
  }
  
  // Priority 4: Fallback to name-based detection
  const name = template?.name?.toLowerCase() || '';
  const description = template?.description?.toLowerCase() || '';
  
  if (name.includes('honeycomb') || name.includes('cellular')) return 'cellular_shades';
  if (name.includes('roller') || description.includes('roller blind')) return 'roller_blinds';
  if (name.includes('roman') || description.includes('roman blind')) return 'roman_blinds';
  if (name.includes('venetian')) return 'venetian_blinds';
  if (name.includes('shutter')) return 'shutters';
  if (name.includes('wallpaper') || name.includes('wall covering') || description.includes('wallpaper')) return 'wallpaper';
  
  return 'curtains'; // default
};

export const getTreatmentConfig = (category: TreatmentCategory): TreatmentConfig => {
  const configs: Record<TreatmentCategory, TreatmentConfig> = {
    curtains: {
      requiresFullness: true,
      requiresHardwareType: true,
      requiresFabricOrientation: true,
      requiresHeading: true,
      requiresLining: true,
      showPooling: true,
      inventoryCategory: 'curtain_fabric',
      visualComponent: 'CurtainVisualizer',
    },
    blinds: {
      requiresFullness: false,
      requiresHardwareType: false,
      requiresFabricOrientation: false,
      requiresHeading: false,
      requiresLining: false,
      showPooling: false,
      inventoryCategory: 'roller_blind_fabric',
      specificFields: ['control_position', 'mounting_type'],
      visualComponent: 'BlindVisualizer',
    },
    roller_blinds: {
      requiresFullness: false,
      requiresHardwareType: false,
      requiresFabricOrientation: false,
      requiresHeading: false,
      requiresLining: false,
      showPooling: false,
      inventoryCategory: 'roller_blind_fabric',
      specificFields: ['control_position', 'mounting_type', 'fabric_transparency', 'chain_length'],
      visualComponent: 'RollerBlindVisualizer',
    },
    roman_blinds: {
      requiresFullness: false,
      requiresHardwareType: false,
      requiresFabricOrientation: false,
      requiresHeading: false,
      requiresLining: true,
      showPooling: false,
      inventoryCategory: 'curtain_fabric',
      specificFields: ['fold_style', 'fold_spacing', 'mounting_type'],
      visualComponent: 'RollerBlindVisualizer',
    },
    venetian_blinds: {
      requiresFullness: false,
      requiresHardwareType: false,
      requiresFabricOrientation: false,
      requiresHeading: false,
      requiresLining: false,
      showPooling: false,
      inventoryCategory: 'none', // Venetian blinds don't use fabric inventory
      specificFields: ['slat_size', 'slat_material', 'control_type'],
      visualComponent: 'VenetianBlindVisualizer',
    },
    vertical_blinds: {
      requiresFullness: false,
      requiresHardwareType: false,
      requiresFabricOrientation: false,
      requiresHeading: false,
      requiresLining: false,
      showPooling: false,
      inventoryCategory: 'none', // Vertical blinds don't use fabric inventory
      specificFields: ['louvre_width', 'headrail_type', 'control_type'],
      visualComponent: 'BlindVisualizer',
    },
    cellular_blinds: {
      requiresFullness: false,
      requiresHardwareType: false,
      requiresFabricOrientation: false,
      requiresHeading: false,
      requiresLining: false,
      showPooling: false,
      inventoryCategory: 'none', // Cellular blinds don't use fabric inventory
      specificFields: ['cell_size', 'headrail_type', 'control_type', 'mount_type'],
      visualComponent: 'BlindVisualizer',
    },
    cellular_shades: {
      requiresFullness: false,
      requiresHardwareType: false,
      requiresFabricOrientation: false,
      requiresHeading: false,
      requiresLining: false,
      showPooling: false,
      inventoryCategory: 'none', // Cellular shades don't use fabric inventory
      specificFields: ['cell_type', 'opacity', 'control_type', 'mount_type'],
      visualComponent: 'BlindVisualizer',
    },
    panel_glide: {
      requiresFullness: false,
      requiresHardwareType: false,
      requiresFabricOrientation: false,
      requiresHeading: false,
      requiresLining: false,
      showPooling: false,
      inventoryCategory: 'panel_fabric',
      specificFields: ['track_type', 'panel_width', 'control_type'],
      visualComponent: 'RollerBlindVisualizer',
    },
    plantation_shutters: {
      requiresFullness: false,
      requiresHardwareType: false,
      requiresFabricOrientation: false,
      requiresHeading: false,
      requiresLining: false,
      showPooling: false,
      inventoryCategory: 'shutter_material',
      specificFields: ['louvre_size', 'frame_type', 'hinge_type', 'material'],
      visualComponent: 'RollerBlindVisualizer',
    },
    shutters: {
      requiresFullness: false,
      requiresHardwareType: false,
      requiresFabricOrientation: false,
      requiresHeading: false,
      requiresLining: false,
      showPooling: false,
      inventoryCategory: 'shutter_material',
      specificFields: ['louver_size', 'panel_config', 'frame_type'],
      visualComponent: 'RollerBlindVisualizer',
    },
    awning: {
      requiresFullness: false,
      requiresHardwareType: false,
      requiresFabricOrientation: false,
      requiresHeading: false,
      requiresLining: false,
      showPooling: false,
      inventoryCategory: 'awning_fabric',
      specificFields: ['projection', 'valance', 'control_type'],
      visualComponent: 'AwningVisualizer',
    },
    wallpaper: {
      requiresFullness: false,
      requiresHardwareType: false,
      requiresFabricOrientation: false,
      requiresHeading: false,
      requiresLining: false,
      showPooling: false,
      inventoryCategory: 'wallcovering',
      specificFields: ['roll_width', 'roll_length', 'pattern_repeat'],
      visualComponent: 'RollerBlindVisualizer',
    },
  };
  
  return configs[category];
};

export const getTreatmentDisplayName = (category: TreatmentCategory): string => {
  const names: Record<TreatmentCategory, string> = {
    curtains: 'Curtains',
    blinds: 'Blinds',
    roller_blinds: 'Roller Blinds',
    roman_blinds: 'Roman Blinds',
    venetian_blinds: 'Venetian Blinds',
    vertical_blinds: 'Vertical Blinds',
    cellular_blinds: 'Cellular Shades',
    cellular_shades: 'Honeycomb Shades',
    panel_glide: 'Panel Glide',
    plantation_shutters: 'Plantation Shutters',
    shutters: 'Shutters',
    awning: 'Awning',
    wallpaper: 'Wallpaper',
  };
  return names[category];
};
