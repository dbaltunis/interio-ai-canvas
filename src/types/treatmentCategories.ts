// Single source of truth for treatment categories
// This ensures consistent naming across the entire application

export const TREATMENT_CATEGORIES = {
  ROLLER_BLINDS: {
    db_value: 'roller_blinds',
    display_name: 'Roller Blinds',
    singular: 'roller_blind'
  },
  ROMAN_BLINDS: {
    db_value: 'roman_blinds',
    display_name: 'Roman Blinds',
    singular: 'roman_blind'
  },
  VENETIAN_BLINDS: {
    db_value: 'venetian_blinds',
    display_name: 'Venetian Blinds',
    singular: 'venetian_blind'
  },
  VERTICAL_BLINDS: {
    db_value: 'vertical_blinds',
    display_name: 'Vertical Blinds',
    singular: 'vertical_blind'
  },
  CELLULAR_BLINDS: {
    db_value: 'cellular_blinds',
    display_name: 'Cellular Shades',
    singular: 'cellular_shade'
  },
  PLANTATION_SHUTTERS: {
    db_value: 'plantation_shutters',
    display_name: 'Plantation Shutters',
    singular: 'plantation_shutter'
  },
  SHUTTERS: {
    db_value: 'shutters',
    display_name: 'Shutters',
    singular: 'shutter'
  },
  PANEL_GLIDE: {
    db_value: 'panel_glide',
    display_name: 'Panel Glides',
    singular: 'panel_glide'
  },
  CURTAINS: {
    db_value: 'curtains',
    display_name: 'Curtains',
    singular: 'curtain'
  },
  AWNING: {
    db_value: 'awning',
    display_name: 'Awnings',
    singular: 'awning'
  }
} as const;

// Type for database values (plural, used in treatment_options)
export type TreatmentCategoryDbValue = typeof TREATMENT_CATEGORIES[keyof typeof TREATMENT_CATEGORIES]['db_value'];

// Type for singular values (used in curtain_templates.curtain_type)
export type TreatmentCategorySingular = typeof TREATMENT_CATEGORIES[keyof typeof TREATMENT_CATEGORIES]['singular'];

// Helper function to convert singular curtain_type to plural treatment_category
export function singularToDbValue(singular: string): TreatmentCategoryDbValue {
  const entry = Object.values(TREATMENT_CATEGORIES).find(
    cat => cat.singular === singular
  );
  return entry?.db_value || 'curtains';
}

// Helper function to convert plural treatment_category to singular curtain_type
export function dbValueToSingular(dbValue: string): TreatmentCategorySingular {
  const entry = Object.values(TREATMENT_CATEGORIES).find(
    cat => cat.db_value === dbValue
  );
  return entry?.singular || 'curtain';
}

// Helper function to get display name from db_value
export function getDisplayName(dbValue: string): string {
  const entry = Object.values(TREATMENT_CATEGORIES).find(
    cat => cat.db_value === dbValue
  );
  return entry?.display_name || dbValue;
}

// Helper function to get display name from singular
export function getDisplayNameFromSingular(singular: string): string {
  const entry = Object.values(TREATMENT_CATEGORIES).find(
    cat => cat.singular === singular
  );
  return entry?.display_name || singular;
}

// All valid db_values as array
export const ALL_DB_VALUES = Object.values(TREATMENT_CATEGORIES).map(cat => cat.db_value);

// All valid singular values as array
export const ALL_SINGULAR_VALUES = Object.values(TREATMENT_CATEGORIES).map(cat => cat.singular);
