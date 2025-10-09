export type TreatmentCategory = 'curtains' | 'roller_blinds' | 'roman_blinds' | 'venetian_blinds' | 'vertical_blinds' | 'cellular_blinds' | 'panel_glide' | 'plantation_shutters' | 'shutters';

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
  // Priority 1: Check if template has explicit treatment_category field
  if (template?.treatment_category) {
    return template.treatment_category as TreatmentCategory;
  }
  
  // Priority 2: Check curtain_type field (from curtain_templates table)
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
    if (curtainType === 'cellular_blind' || curtainType === 'cellular' || curtainType.includes('cellular')) {
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
    // Default to curtains for 'curtain', 'single', 'pair', etc.
    if (curtainType === 'curtain' || curtainType === 'single' || curtainType === 'pair') {
      return 'curtains';
    }
  }
  
  // Priority 3: Fallback to name-based detection
  const name = template?.name?.toLowerCase() || '';
  const description = template?.description?.toLowerCase() || '';
  
  if (name.includes('roller') || description.includes('roller blind')) return 'roller_blinds';
  if (name.includes('roman') || description.includes('roman blind')) return 'roman_blinds';
  if (name.includes('venetian')) return 'venetian_blinds';
  if (name.includes('shutter')) return 'shutters';
  
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
      inventoryCategory: 'blind_fabric',
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
      inventoryCategory: 'venetian_slats',
      specificFields: ['slat_size', 'slat_material', 'control_type'],
      visualComponent: 'RollerBlindVisualizer',
    },
    vertical_blinds: {
      requiresFullness: false,
      requiresHardwareType: false,
      requiresFabricOrientation: false,
      requiresHeading: false,
      requiresLining: false,
      showPooling: false,
      inventoryCategory: 'vertical_blind_vanes',
      specificFields: ['louvre_width', 'headrail_type', 'control_type'],
      visualComponent: 'RollerBlindVisualizer',
    },
    cellular_blinds: {
      requiresFullness: false,
      requiresHardwareType: false,
      requiresFabricOrientation: false,
      requiresHeading: false,
      requiresLining: false,
      showPooling: false,
      inventoryCategory: 'cellular_shade_fabric',
      specificFields: ['cell_size', 'headrail_type', 'control_type', 'mount_type'],
      visualComponent: 'RollerBlindVisualizer',
    },
    panel_glide: {
      requiresFullness: false,
      requiresHardwareType: false,
      requiresFabricOrientation: false,
      requiresHeading: false,
      requiresLining: false,
      showPooling: false,
      inventoryCategory: 'panel_glide_fabric',
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
      inventoryCategory: 'shutter_panels',
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
      inventoryCategory: 'shutter_panels',
      specificFields: ['louver_size', 'panel_config', 'frame_type'],
      visualComponent: 'RollerBlindVisualizer',
    },
  };
  
  return configs[category];
};

export const getTreatmentDisplayName = (category: TreatmentCategory): string => {
  const names: Record<TreatmentCategory, string> = {
    curtains: 'Curtains',
    roller_blinds: 'Roller Blinds',
    roman_blinds: 'Roman Blinds',
    venetian_blinds: 'Venetian Blinds',
    vertical_blinds: 'Vertical Blinds',
    cellular_blinds: 'Cellular Shades',
    panel_glide: 'Panel Glide',
    plantation_shutters: 'Plantation Shutters',
    shutters: 'Shutters',
  };
  return names[category];
};
