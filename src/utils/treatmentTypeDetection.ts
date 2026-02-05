export type TreatmentCategory = 'curtains' | 'blinds' | 'roller_blinds' | 'zebra_blinds' | 'roman_blinds' | 'venetian_blinds' | 'vertical_blinds' | 'cellular_blinds' | 'panel_glide' | 'plantation_shutters' | 'shutters' | 'shutter' | 'awning' | 'wallpaper';

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
    if (category === 'cellular_shades') return 'cellular_blinds'; // Convert old naming to new
    if (category === 'wallpaper') return 'wallpaper';
    return category as TreatmentCategory;
  }
  
  // Priority 3: Check remaining curtain_type patterns
  if (template?.curtain_type) {
    const curtainType = template.curtain_type.toLowerCase();
    
    if (curtainType === 'zebra_blind' || curtainType === 'zebra blind' || curtainType.includes('zebra') || curtainType.includes('day_night') || curtainType.includes('dual_blind') || curtainType.includes('vision_blind')) {
      return 'zebra_blinds';
    }
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
      return 'cellular_blinds';
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
  
  if (name.includes('honeycomb') || name.includes('cellular')) return 'cellular_blinds';
  if (name.includes('zebra') || name.includes('day night') || name.includes('day & night') || name.includes('vision blind') || description.includes('zebra') || description.includes('day night')) return 'zebra_blinds';
  if (name.includes('roller') || description.includes('roller blind')) return 'roller_blinds';
  if (name.includes('roman') || description.includes('roman blind')) return 'roman_blinds';
  if (name.includes('venetian')) return 'venetian_blinds';
  if (name.includes('shutter')) return 'shutters';
  // ✅ FIX: Add awning and panel_glide to name-based fallback detection
  if (name.includes('awning') || description.includes('awning')) return 'awning';
  if (name.includes('panel') && name.includes('glide')) return 'panel_glide';
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
    zebra_blinds: {
      requiresFullness: false,
      requiresHardwareType: false,
      requiresFabricOrientation: false,
      requiresHeading: false,
      requiresLining: false,
      showPooling: false,
      inventoryCategory: 'zebra_fabric',
      specificFields: ['control_position', 'mounting_type', 'band_width', 'chain_length'],
      visualComponent: 'ZebraBlindVisualizer',
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
      inventoryCategory: 'both', // Vertical blinds use fabric vanes AND material slats
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
      inventoryCategory: 'cellular_fabric',
      specificFields: ['cell_size', 'cell_type', 'opacity', 'headrail_type', 'control_type', 'mount_type'],
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
      visualComponent: 'ShutterVisualizer',
    },
    shutter: {
      requiresFullness: false,
      requiresHardwareType: false,
      requiresFabricOrientation: false,
      requiresHeading: false,
      requiresLining: false,
      showPooling: false,
      inventoryCategory: 'shutter_material',
      specificFields: ['louver_size', 'panel_config', 'frame_type'],
      visualComponent: 'ShutterVisualizer',
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
    zebra_blinds: 'Zebra Blinds',
    roman_blinds: 'Roman Blinds',
    venetian_blinds: 'Venetian Blinds',
    vertical_blinds: 'Vertical Blinds',
    cellular_blinds: 'Cellular Blinds',
    panel_glide: 'Panel Glide',
    plantation_shutters: 'Plantation Shutters',
    shutters: 'Shutters',
    shutter: 'Shutter',
    awning: 'Awning',
    wallpaper: 'Wallpaper',
  };
  return names[category];
};

export interface MeasurementLabels {
  width: string;
  height: string;
  widthShort: string;
  heightShort: string;
}

/**
 * Get treatment-specific measurement labels
 * Returns appropriate terminology for width and height measurements based on treatment type
 */
export const getMeasurementLabels = (category: TreatmentCategory): MeasurementLabels => {
  const labels: Record<TreatmentCategory, MeasurementLabels> = {
    curtains: {
      width: 'Rail Width',
      height: 'Curtain Drop',
      widthShort: 'Rail',
      heightShort: 'Drop'
    },
    roller_blinds: {
      width: 'Headrail Width',
      height: 'Blind Drop',
      widthShort: 'Headrail',
      heightShort: 'Drop'
    },
    zebra_blinds: {
      width: 'Headrail Width',
      height: 'Blind Drop',
      widthShort: 'Headrail',
      heightShort: 'Drop'
    },
    roman_blinds: {
      width: 'Blind Width',
      height: 'Blind Drop',
      widthShort: 'Width',
      heightShort: 'Drop'
    },
    venetian_blinds: {
      width: 'Headrail Width',
      height: 'Blind Drop',
      widthShort: 'Headrail',
      heightShort: 'Drop'
    },
    vertical_blinds: {
      width: 'Track Width',
      height: 'Drop Length',
      widthShort: 'Track',
      heightShort: 'Drop'
    },
    cellular_blinds: {
      width: 'Headrail Width',
      height: 'Shade Drop',
      widthShort: 'Headrail',
      heightShort: 'Drop'
    },
    panel_glide: {
      width: 'Track Width',
      height: 'Panel Length',
      widthShort: 'Track',
      heightShort: 'Length'
    },
    plantation_shutters: {
      width: 'Frame Width',
      height: 'Frame Height',
      widthShort: 'Width',
      heightShort: 'Height'
    },
    shutters: {
      width: 'Frame Width',
      height: 'Frame Height',
      widthShort: 'Width',
      heightShort: 'Height'
    },
    shutter: {
      width: 'Frame Width',
      height: 'Frame Height',
      widthShort: 'Width',
      heightShort: 'Height'
    },
    awning: {
      width: 'Awning Width',
      height: 'Projection',
      widthShort: 'Width',
      heightShort: 'Projection'
    },
    wallpaper: {
      width: 'Wall Width',
      height: 'Wall Height',
      widthShort: 'Width',
      heightShort: 'Height'
    },
    blinds: {
      width: 'Blind Width',
      height: 'Blind Drop',
      widthShort: 'Width',
      heightShort: 'Drop'
    },
  };
  
  return labels[category];
};
