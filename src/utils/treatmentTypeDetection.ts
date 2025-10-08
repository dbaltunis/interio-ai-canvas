export type TreatmentCategory = 'curtains' | 'roller_blinds' | 'roman_blinds' | 'venetian_blinds' | 'shutters';

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
      visualComponent: 'RomanBlindVisualizer',
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
      visualComponent: 'VenetianBlindVisualizer',
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
      visualComponent: 'ShutterVisualizer',
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
    shutters: 'Shutters',
  };
  return names[category];
};
