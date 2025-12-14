/**
 * Category-specific CSV import/export utilities
 * Handles parsing, validation, and export for different inventory categories
 * Uses header-based column lookup for flexible CSV parsing
 */

import {
  VALID_FABRIC_SUBCATEGORIES,
  VALID_MATERIAL_SUBCATEGORIES,
  VALID_HARDWARE_SUBCATEGORIES,
  VALID_WALLCOVERING_SUBCATEGORIES,
  VALID_SERVICE_SUBCATEGORIES,
  VALID_PRODUCT_CATEGORIES
} from '@/constants/inventoryCategories';

interface ValidationResult {
  valid: any[];
  invalid: { item: any; errors: string[]; row: number }[];
}

// Common validation helpers
const validateRequired = (value: any, fieldName: string): string | null => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

const validateNumber = (value: any, fieldName: string, min?: number): string | null => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return `${fieldName} must be a number`;
  }
  if (min !== undefined && num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  return null;
};

/**
 * Parse price value from CSV, stripping currency symbols and formatting
 * Handles: €26.50, $100.00, £1,234.56, NZ$85.00, A$42.50, "42.50", etc.
 */
const parsePrice = (value: any): number => {
  if (value === null || value === undefined) return 0;
  
  // Convert to string and clean
  let cleaned = String(value)
    .replace(/^"|"$/g, '')           // Remove surrounding quotes
    .replace(/[€$£¥₹R]/g, '')        // Remove currency symbols
    .replace(/^(NZ|A|AU|US|CA)\$/i, '') // Remove prefixed currency codes (NZ$, A$, etc.)
    .replace(/,/g, '')               // Remove thousand separators
    .trim();
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

/**
 * Create a lookup map from CSV headers to column indices
 * Normalizes headers: lowercase, trim, replace spaces with underscores
 */
const createColumnLookup = (headers: string[]): Record<string, number> => {
  const lookup: Record<string, number> = {};
  headers.forEach((header, index) => {
    // Normalize header names: lowercase, trim, replace spaces with underscores
    const normalized = header
      .toLowerCase()
      .trim()
      .replace(/^"|"$/g, '')
      .replace(/\s+/g, '_');
    lookup[normalized] = index;
  });
  return lookup;
};

/**
 * Get value from CSV row using multiple possible column names
 * Supports flexible header naming (e.g., "cost_price" or "cost" or "buy_price")
 */
const getValue = (values: string[], lookup: Record<string, number>, ...columnNames: string[]): string => {
  for (const name of columnNames) {
    const index = lookup[name.toLowerCase()];
    if (index !== undefined && values[index] !== undefined) {
      return values[index].replace(/^"|"$/g, '');
    }
  }
  return '';
};

/**
 * Parse boolean value from CSV (yes/true/1 = true)
 */
const parseBoolValue = (value: string): boolean => {
  const v = value.toLowerCase().trim();
  return v === 'yes' || v === 'true' || v === '1';
};

/**
 * Parse comma-separated values into array
 */
const parseCommaSeparated = (value: string): string[] => {
  if (!value) return [];
  return value.split(',').map(v => v.trim().toLowerCase()).filter(v => v);
};

// FABRICS PARSER - Header-based
export const parseFabricCSV = (csvData: string): ValidationResult => {
  const lines = csvData.split('\n').filter(line => line.trim());
  if (lines.length < 2) return { valid: [], invalid: [] };
  
  const headers = parseCSVLine(lines[0]);
  const lookup = createColumnLookup(headers);
  const valid: any[] = [];
  const invalid: { item: any; errors: string[]; row: number }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const errors: string[] = [];
    
    // Track inventory - supports multiple column names
    const trackValue = getValue(values, lookup, 'track_inventory', 'track', 'tracked');
    const shouldTrack = parseBoolValue(trackValue);
    
    // Rotation allowance
    const rotationValue = getValue(values, lookup, 'rotation_allowance', 'rotation', 'can_rotate');
    const canRotate = parseBoolValue(rotationValue);
    
    // Colors - supports multiple column names
    const colorsRaw = getValue(values, lookup, 'colors', 'color', 'colour', 'colours');
    const colorValues = parseCommaSeparated(colorsRaw);
    
    // Compatible treatments - supports multiple column names
    const compatibleTreatmentsRaw = getValue(values, lookup, 'compatible_treatments', 'treatments', 'compatible_with', 'works_with');
    const compatibleTreatments = parseCommaSeparated(compatibleTreatmentsRaw);
    
    const item: any = {
      category: 'fabric',
      name: getValue(values, lookup, 'name', 'product_name', 'fabric_name'),
      sku: getValue(values, lookup, 'sku', 'code', 'product_code', 'item_code'),
      description: getValue(values, lookup, 'description', 'desc', 'details'),
      subcategory: getValue(values, lookup, 'subcategory', 'sub_category', 'type', 'fabric_type'),
      product_category: getValue(values, lookup, 'product_category', 'category', 'treatment_type'),
      tags: colorValues,
      compatible_treatments: compatibleTreatments.length > 0 ? compatibleTreatments : null,
      supplier: getValue(values, lookup, 'supplier', 'vendor', 'manufacturer', 'brand'),
      collection_name: getValue(values, lookup, 'collection_name', 'collection', 'range', 'series'),
      location: getValue(values, lookup, 'location', 'warehouse', 'storage', 'bin'),
      quantity: shouldTrack ? (parseFloat(getValue(values, lookup, 'quantity', 'qty', 'stock', 'on_hand')) || 0) : null,
      unit: getValue(values, lookup, 'unit', 'uom', 'unit_of_measure') || 'meters',
      reorder_point: shouldTrack ? (parseFloat(getValue(values, lookup, 'reorder_point', 'reorder_level', 'min_stock', 'minimum')) || 0) : null,
      // CRITICAL: Support multiple price column name variations
      cost_price: parsePrice(getValue(values, lookup, 'cost_price', 'cost', 'buy_price', 'purchase_price', 'wholesale_price', 'cost_per_meter', 'cost_per_metre')),
      selling_price: parsePrice(getValue(values, lookup, 'selling_price', 'sell_price', 'retail_price', 'price', 'rrp', 'price_per_meter', 'price_per_metre')),
      price_per_meter: parsePrice(getValue(values, lookup, 'selling_price', 'sell_price', 'retail_price', 'price', 'rrp', 'price_per_meter', 'price_per_metre')),
      fabric_width: parseFloat(getValue(values, lookup, 'fabric_width', 'width', 'roll_width', 'material_width')) || null,
      fabric_composition: getValue(values, lookup, 'fabric_composition', 'composition', 'material', 'content', 'fibre_content'),
      fabric_grade: getValue(values, lookup, 'fabric_grade', 'grade', 'quality', 'tier'),
      pattern_repeat_vertical: parseFloat(getValue(values, lookup, 'pattern_repeat_vertical', 'vertical_repeat', 'pattern_vertical', 'v_repeat')) || null,
      pattern_repeat_horizontal: parseFloat(getValue(values, lookup, 'pattern_repeat_horizontal', 'horizontal_repeat', 'pattern_horizontal', 'h_repeat')) || null,
      image_url: getValue(values, lookup, 'image_url', 'image', 'photo', 'picture', 'img'),
      metadata: {
        maxLength: parseFloat(getValue(values, lookup, 'max_length', 'maximum_length', 'roll_length')) || null,
        rotationAllowance: canRotate,
        priceGroup: getValue(values, lookup, 'price_group', 'pricing_group', 'grid_code', 'price_code') || null,
      },
    };

    // Validation
    const nameError = validateRequired(item.name, 'Name');
    if (nameError) errors.push(nameError);
    
    const widthError = item.fabric_width ? validateNumber(item.fabric_width, 'Fabric Width', 0) : null;
    if (widthError) errors.push(widthError);

    if (shouldTrack) {
      const quantityError = validateNumber(item.quantity, 'Quantity', 0);
      if (quantityError) errors.push(quantityError);
    }

    const subcategoryLower = item.subcategory?.toLowerCase();
    if (!subcategoryLower || !VALID_FABRIC_SUBCATEGORIES.includes(subcategoryLower as any)) {
      errors.push(`Invalid subcategory "${item.subcategory}". Must be one of: ${VALID_FABRIC_SUBCATEGORIES.join(', ')}`);
    }

    const productCategoryLower = item.product_category?.toLowerCase();
    if (productCategoryLower && !VALID_PRODUCT_CATEGORIES.includes(productCategoryLower as any)) {
      errors.push(`Invalid product_category "${item.product_category}". Must be one of: ${VALID_PRODUCT_CATEGORIES.join(', ')}`);
    }

    if (errors.length > 0) {
      invalid.push({ item, errors, row: i + 1 });
    } else {
      valid.push(item);
    }
  }

  return { valid, invalid };
};

// HARDWARE PARSER - Header-based
export const parseHardwareCSV = (csvData: string): ValidationResult => {
  const lines = csvData.split('\n').filter(line => line.trim());
  if (lines.length < 2) return { valid: [], invalid: [] };
  
  const headers = parseCSVLine(lines[0]);
  const lookup = createColumnLookup(headers);
  const valid: any[] = [];
  const invalid: { item: any; errors: string[]; row: number }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const errors: string[] = [];
    
    const trackValue = getValue(values, lookup, 'track_inventory', 'track', 'tracked');
    const shouldTrack = parseBoolValue(trackValue);
    
    const tagsRaw = getValue(values, lookup, 'tags', 'keywords', 'labels');
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(t => t) : [];
    
    const item: any = {
      name: getValue(values, lookup, 'name', 'product_name', 'item_name'),
      sku: getValue(values, lookup, 'sku', 'code', 'product_code', 'item_code'),
      description: getValue(values, lookup, 'description', 'desc', 'details'),
      subcategory: getValue(values, lookup, 'subcategory', 'sub_category', 'type', 'hardware_category'),
      tags,
      quantity: shouldTrack ? (parseFloat(getValue(values, lookup, 'quantity', 'qty', 'stock', 'on_hand')) || 0) : null,
      unit: getValue(values, lookup, 'unit', 'uom', 'unit_of_measure') || 'pieces',
      cost_price: parsePrice(getValue(values, lookup, 'cost_price', 'cost', 'buy_price', 'purchase_price', 'wholesale')),
      selling_price: parsePrice(getValue(values, lookup, 'selling_price', 'sell_price', 'retail_price', 'price', 'rrp')),
      supplier: getValue(values, lookup, 'supplier', 'vendor', 'manufacturer', 'brand'),
      location: getValue(values, lookup, 'location', 'warehouse', 'storage', 'bin'),
      reorder_point: shouldTrack ? (parseFloat(getValue(values, lookup, 'reorder_point', 'reorder_level', 'min_stock')) || 0) : null,
      hardware_type: getValue(values, lookup, 'hardware_type', 'type', 'category'),
      material_finish: getValue(values, lookup, 'material_finish', 'finish', 'color', 'colour'),
      hardware_load_capacity: parseFloat(getValue(values, lookup, 'hardware_load_capacity', 'load_capacity', 'max_load', 'weight_capacity')) || null,
      hardware_weight: parseFloat(getValue(values, lookup, 'hardware_weight', 'weight', 'item_weight')) || null,
      mounting_type: getValue(values, lookup, 'mounting_type', 'mount_type', 'mounting'),
      collection_name: getValue(values, lookup, 'collection_name', 'collection', 'range', 'series'),
      metadata: {
        compatible_with: getValue(values, lookup, 'compatible_with', 'compatibility', 'works_with'),
        dimensions: getValue(values, lookup, 'dimensions', 'size', 'measurements'),
        vendor_name: getValue(values, lookup, 'vendor_name', 'vendor', 'brand'),
      },
    };

    // Validation
    const nameError = validateRequired(item.name, 'Name');
    if (nameError) errors.push(nameError);

    if (shouldTrack) {
      const quantityError = validateNumber(item.quantity, 'Quantity', 0);
      if (quantityError) errors.push(quantityError);
    }

    const subcategoryLower = item.subcategory?.toLowerCase();
    if (!subcategoryLower || !VALID_HARDWARE_SUBCATEGORIES.includes(subcategoryLower as any)) {
      errors.push(`Invalid subcategory "${item.subcategory}". Must be one of: ${VALID_HARDWARE_SUBCATEGORIES.join(', ')}`);
    }

    if (errors.length > 0) {
      invalid.push({ item, errors, row: i + 1 });
    } else {
      valid.push(item);
    }
  }

  return { valid, invalid };
};

// WALLPAPER PARSER - Header-based
export const parseWallpaperCSV = (csvData: string): ValidationResult => {
  const lines = csvData.split('\n').filter(line => line.trim());
  if (lines.length < 2) return { valid: [], invalid: [] };
  
  const headers = parseCSVLine(lines[0]);
  const lookup = createColumnLookup(headers);
  const valid: any[] = [];
  const invalid: { item: any; errors: string[]; row: number }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const errors: string[] = [];
    
    const trackValue = getValue(values, lookup, 'track_inventory', 'track', 'tracked');
    const shouldTrack = parseBoolValue(trackValue);
    
    const tagsRaw = getValue(values, lookup, 'tags', 'keywords', 'labels');
    const baseTags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(t => t) : [];
    const colorsRaw = getValue(values, lookup, 'colors', 'color', 'colour', 'colours');
    const colorValues = parseCommaSeparated(colorsRaw);
    
    const item: any = {
      name: getValue(values, lookup, 'name', 'product_name', 'wallpaper_name'),
      sku: getValue(values, lookup, 'sku', 'code', 'product_code', 'item_code'),
      description: getValue(values, lookup, 'description', 'desc', 'details'),
      subcategory: getValue(values, lookup, 'subcategory', 'sub_category', 'type', 'wallpaper_type'),
      tags: [...baseTags, ...colorValues],
      supplier: getValue(values, lookup, 'supplier', 'vendor', 'manufacturer', 'brand'),
      collection_name: getValue(values, lookup, 'collection_name', 'collection', 'range', 'series'),
      location: getValue(values, lookup, 'location', 'warehouse', 'storage', 'bin'),
      quantity: shouldTrack ? (parseFloat(getValue(values, lookup, 'quantity', 'qty', 'stock', 'on_hand')) || 0) : null,
      unit: getValue(values, lookup, 'unit', 'uom', 'unit_of_measure') || 'rolls',
      reorder_point: shouldTrack ? (parseFloat(getValue(values, lookup, 'reorder_point', 'reorder_level', 'min_stock')) || 0) : null,
      cost_price: parsePrice(getValue(values, lookup, 'cost_price', 'cost', 'buy_price', 'purchase_price', 'wholesale')),
      selling_price: parsePrice(getValue(values, lookup, 'selling_price', 'sell_price', 'retail_price', 'price', 'rrp')),
      roll_width: parseFloat(getValue(values, lookup, 'roll_width', 'width', 'wallpaper_width')) || null,
      roll_length: parseFloat(getValue(values, lookup, 'roll_length', 'length', 'wallpaper_length')) || null,
      pattern_repeat_vertical: parseFloat(getValue(values, lookup, 'pattern_repeat_vertical', 'vertical_repeat', 'v_repeat')) || null,
      pattern_repeat_horizontal: parseFloat(getValue(values, lookup, 'pattern_repeat_horizontal', 'horizontal_repeat', 'h_repeat')) || null,
      metadata: {
        coverage_per_roll: parseFloat(getValue(values, lookup, 'coverage_per_roll', 'coverage', 'sqm_per_roll')) || null,
        material_type: getValue(values, lookup, 'material_type', 'material', 'type'),
        washability: getValue(values, lookup, 'washability', 'washable', 'cleaning'),
        fire_rating: getValue(values, lookup, 'fire_rating', 'fire_rated', 'flammability'),
        price_group: getValue(values, lookup, 'price_group', 'pricing_group', 'price_code') || null,
      },
      image_url: getValue(values, lookup, 'image_url', 'image', 'photo', 'picture', 'img'),
    };

    // Validation
    const nameError = validateRequired(item.name, 'Name');
    if (nameError) errors.push(nameError);

    if (shouldTrack) {
      const quantityError = validateNumber(item.quantity, 'Quantity', 0);
      if (quantityError) errors.push(quantityError);
    }

    if (item.roll_width) {
      const widthError = validateNumber(item.roll_width, 'Roll Width', 0);
      if (widthError) errors.push(widthError);
    }

    const subcategoryLower = item.subcategory?.toLowerCase();
    if (!subcategoryLower || !VALID_WALLCOVERING_SUBCATEGORIES.includes(subcategoryLower as any)) {
      errors.push(`Invalid subcategory "${item.subcategory}". Must be one of: ${VALID_WALLCOVERING_SUBCATEGORIES.join(', ')}`);
    }

    if (errors.length > 0) {
      invalid.push({ item, errors, row: i + 1 });
    } else {
      valid.push(item);
    }
  }

  return { valid, invalid };
};

// TRIMMINGS PARSER - Header-based
export const parseTrimmingsCSV = (csvData: string): ValidationResult => {
  const lines = csvData.split('\n').filter(line => line.trim());
  if (lines.length < 2) return { valid: [], invalid: [] };
  
  const headers = parseCSVLine(lines[0]);
  const lookup = createColumnLookup(headers);
  const valid: any[] = [];
  const invalid: { item: any; errors: string[]; row: number }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const errors: string[] = [];
    
    const trackValue = getValue(values, lookup, 'track_inventory', 'track', 'tracked');
    const shouldTrack = parseBoolValue(trackValue);
    
    const tagsRaw = getValue(values, lookup, 'tags', 'keywords', 'labels');
    const baseTags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(t => t) : [];
    const colorsRaw = getValue(values, lookup, 'colors', 'color', 'colour', 'colours');
    const colorValues = parseCommaSeparated(colorsRaw);
    
    const item: any = {
      name: getValue(values, lookup, 'name', 'product_name', 'trimming_name'),
      sku: getValue(values, lookup, 'sku', 'code', 'product_code', 'item_code'),
      description: getValue(values, lookup, 'description', 'desc', 'details'),
      subcategory: getValue(values, lookup, 'subcategory', 'sub_category', 'type', 'trimming_type'),
      tags: [...baseTags, ...colorValues],
      quantity: shouldTrack ? (parseFloat(getValue(values, lookup, 'quantity', 'qty', 'stock', 'on_hand')) || 0) : null,
      unit: getValue(values, lookup, 'unit', 'uom', 'unit_of_measure') || 'meters',
      cost_price: parsePrice(getValue(values, lookup, 'cost_price', 'cost', 'buy_price', 'purchase_price', 'wholesale')),
      selling_price: parsePrice(getValue(values, lookup, 'selling_price', 'sell_price', 'retail_price', 'price', 'rrp')),
      supplier: getValue(values, lookup, 'supplier', 'vendor', 'manufacturer', 'brand'),
      collection_name: getValue(values, lookup, 'collection_name', 'collection', 'range', 'series'),
      location: getValue(values, lookup, 'location', 'warehouse', 'storage', 'bin'),
      reorder_point: shouldTrack ? (parseFloat(getValue(values, lookup, 'reorder_point', 'reorder_level', 'min_stock')) || 0) : null,
      unit_price: parsePrice(getValue(values, lookup, 'unit_price', 'price_per_meter', 'price_per_metre')) || null,
      metadata: {
        trimming_width: parseFloat(getValue(values, lookup, 'trimming_width', 'width', 'size')) || null,
        material_composition: getValue(values, lookup, 'material_composition', 'composition', 'material', 'content'),
        vendor_name: getValue(values, lookup, 'vendor_name', 'vendor', 'brand'),
      },
    };

    // Validation
    const nameError = validateRequired(item.name, 'Name');
    if (nameError) errors.push(nameError);

    if (shouldTrack) {
      const quantityError = validateNumber(item.quantity, 'Quantity', 0);
      if (quantityError) errors.push(quantityError);
    }

    if (!item.subcategory || !['fringe', 'cord', 'tassel', 'braid', 'border'].includes(item.subcategory?.toLowerCase())) {
      errors.push('Invalid subcategory. Must be: fringe, cord, tassel, braid, or border');
    }

    if (errors.length > 0) {
      invalid.push({ item, errors, row: i + 1 });
    } else {
      valid.push(item);
    }
  }

  return { valid, invalid };
};

// MATERIALS PARSER - Header-based
export const parseMaterialCSV = (csvData: string): ValidationResult => {
  const lines = csvData.split('\n').filter(line => line.trim());
  if (lines.length < 2) return { valid: [], invalid: [] };
  
  const headers = parseCSVLine(lines[0]);
  const lookup = createColumnLookup(headers);
  const valid: any[] = [];
  const invalid: { item: any; errors: string[]; row: number }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const errors: string[] = [];
    
    const trackValue = getValue(values, lookup, 'track_inventory', 'track', 'tracked');
    const shouldTrack = parseBoolValue(trackValue);
    
    const tagsRaw = getValue(values, lookup, 'tags', 'keywords', 'labels');
    const baseTags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(t => t) : [];
    const colorsRaw = getValue(values, lookup, 'colors', 'color', 'colour', 'colours');
    const colorValues = parseCommaSeparated(colorsRaw);
    
    const item: any = {
      category: 'material',
      name: getValue(values, lookup, 'name', 'product_name', 'material_name'),
      sku: getValue(values, lookup, 'sku', 'code', 'product_code', 'item_code'),
      description: getValue(values, lookup, 'description', 'desc', 'details'),
      subcategory: getValue(values, lookup, 'subcategory', 'sub_category', 'type', 'material_category'),
      tags: [...baseTags, ...colorValues],
      quantity: shouldTrack ? (parseFloat(getValue(values, lookup, 'quantity', 'qty', 'stock', 'on_hand')) || 0) : null,
      unit: getValue(values, lookup, 'unit', 'uom', 'unit_of_measure') || 'pieces',
      cost_price: parsePrice(getValue(values, lookup, 'cost_price', 'cost', 'buy_price', 'purchase_price', 'wholesale')),
      selling_price: parsePrice(getValue(values, lookup, 'selling_price', 'sell_price', 'retail_price', 'price', 'rrp')),
      supplier: getValue(values, lookup, 'supplier', 'vendor', 'manufacturer', 'brand'),
      collection_name: getValue(values, lookup, 'collection_name', 'collection', 'range', 'series'),
      location: getValue(values, lookup, 'location', 'warehouse', 'storage', 'bin'),
      reorder_point: shouldTrack ? (parseFloat(getValue(values, lookup, 'reorder_point', 'reorder_level', 'min_stock')) || 0) : null,
      image_url: getValue(values, lookup, 'image_url', 'image', 'photo', 'picture', 'img'),
      metadata: {
        slat_width: parseFloat(getValue(values, lookup, 'slat_width', 'width', 'size')) || null,
        material_type: getValue(values, lookup, 'material_type', 'material', 'type'),
        vendor_name: getValue(values, lookup, 'vendor_name', 'vendor', 'brand'),
      },
    };

    const nameError = validateRequired(item.name, 'Name');
    if (nameError) errors.push(nameError);

    if (shouldTrack) {
      const quantityError = validateNumber(item.quantity, 'Quantity', 0);
      if (quantityError) errors.push(quantityError);
    }

    const subcategoryLower = item.subcategory?.toLowerCase();
    if (!subcategoryLower || !VALID_MATERIAL_SUBCATEGORIES.includes(subcategoryLower as any)) {
      errors.push(`Invalid subcategory "${item.subcategory}". Must be one of: ${VALID_MATERIAL_SUBCATEGORIES.join(', ')}`);
    }

    if (errors.length > 0) {
      invalid.push({ item, errors, row: i + 1 });
    } else {
      valid.push(item);
    }
  }

  return { valid, invalid };
};

// SERVICES PARSER - Header-based
export const parseServiceCSV = (csvData: string): ValidationResult => {
  const lines = csvData.split('\n').filter(line => line.trim());
  if (lines.length < 2) return { valid: [], invalid: [] };
  
  const headers = parseCSVLine(lines[0]);
  const lookup = createColumnLookup(headers);
  const valid: any[] = [];
  const invalid: { item: any; errors: string[]; row: number }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const errors: string[] = [];
    
    const trackValue = getValue(values, lookup, 'track_inventory', 'track', 'tracked');
    const shouldTrack = parseBoolValue(trackValue);
    
    const tagsRaw = getValue(values, lookup, 'tags', 'keywords', 'labels');
    const baseTags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(t => t) : [];
    
    const item: any = {
      category: 'service',
      name: getValue(values, lookup, 'name', 'service_name', 'product_name'),
      sku: getValue(values, lookup, 'sku', 'code', 'service_code'),
      description: getValue(values, lookup, 'description', 'desc', 'details'),
      subcategory: getValue(values, lookup, 'subcategory', 'sub_category', 'type', 'service_type'),
      tags: baseTags,
      quantity: shouldTrack ? (parseFloat(getValue(values, lookup, 'quantity', 'qty')) || 0) : null,
      unit: getValue(values, lookup, 'unit', 'uom', 'billing_unit') || 'service',
      cost_price: parsePrice(getValue(values, lookup, 'cost_price', 'cost', 'hourly_cost')),
      selling_price: parsePrice(getValue(values, lookup, 'selling_price', 'sell_price', 'price', 'rate', 'hourly_rate')),
      supplier: getValue(values, lookup, 'supplier', 'provider', 'vendor'),
      location: getValue(values, lookup, 'location', 'area'),
      reorder_point: null,
    };

    const nameError = validateRequired(item.name, 'Name');
    if (nameError) errors.push(nameError);

    const subcategoryLower = item.subcategory?.toLowerCase();
    if (!subcategoryLower || !VALID_SERVICE_SUBCATEGORIES.includes(subcategoryLower as any)) {
      errors.push(`Invalid subcategory "${item.subcategory}". Must be one of: ${VALID_SERVICE_SUBCATEGORIES.join(', ')}`);
    }

    if (errors.length > 0) {
      invalid.push({ item, errors, row: i + 1 });
    } else {
      valid.push(item);
    }
  }

  return { valid, invalid };
};

// Helper to extract colors from tags (colors are lowercase color names)
const KNOWN_COLORS = [
  'white', 'ivory', 'cream', 'beige', 'natural', 'sand', 'taupe', 'grey', 'gray', 'charcoal', 
  'black', 'navy', 'blue', 'teal', 'turquoise', 'green', 'sage', 'moss', 'olive', 'emerald',
  'gold', 'silver', 'champagne', 'bronze', 'copper', 'burgundy', 'wine', 'plum', 'crimson',
  'red', 'pink', 'coral', 'orange', 'yellow', 'brown', 'chocolate', 'walnut', 'pearl',
  'custom', 'light-grey', 'ocean-blue', 'soft-white', 'antique-gold', 'navy-white', 
  'forest-sand', 'burgundy-cream'
];

const extractColorsFromTags = (tags: string[] | undefined): { colors: string[], nonColorTags: string[] } => {
  if (!tags || !Array.isArray(tags)) return { colors: [], nonColorTags: [] };
  
  const colors: string[] = [];
  const nonColorTags: string[] = [];
  
  tags.forEach(tag => {
    const lowerTag = tag.toLowerCase();
    // Check if tag is a known color or looks like a color (contains hyphen like "navy-white")
    if (KNOWN_COLORS.includes(lowerTag) || lowerTag.includes('-')) {
      colors.push(lowerTag);
    } else {
      nonColorTags.push(tag);
    }
  });
  
  return { colors, nonColorTags };
};

// EXPORT FUNCTIONS
export const exportCategoryInventory = (items: any[], category: string): string => {
  if (category === 'fabrics') {
    const headers = [
      'name', 'sku', 'description', 'subcategory', 'product_category', 'compatible_treatments', 'colors', 'track_inventory',
      'supplier', 'collection_name', 'location', 'quantity', 'unit', 'reorder_point', 'cost_price', 'selling_price', 'price_group',
      'fabric_width', 'fabric_composition', 'fabric_grade', 'pattern_repeat_vertical',
      'pattern_repeat_horizontal', 'max_length', 'rotation_allowance', 'image_url'
    ];
    
    const rows = items.map(item => {
      const isTracked = item.quantity != null ? 'yes' : 'no';
      // Extract colors from tags for export
      const { colors } = extractColorsFromTags(item.tags);
      const colorsStr = colors.join(',');
      // Compatible treatments
      const compatibleTreatments = Array.isArray(item.compatible_treatments) 
        ? item.compatible_treatments.join(',') 
        : '';
      
      return [
        `"${item.name || ''}"`,
        `"${item.sku || ''}"`,
        `"${item.description || ''}"`,
        `"${item.subcategory || ''}"`,
        `"${item.product_category || ''}"`,
        `"${compatibleTreatments}"`,
        `"${colorsStr}"`,
        isTracked,
        `"${item.supplier || ''}"`,
        `"${item.collection_name || ''}"`,
        `"${item.location || ''}"`,
        item.quantity ?? 0,
        `"${item.unit || 'meters'}"`,
        item.reorder_point ?? 0,
        item.cost_price || 0,
        item.selling_price || 0,
        `"${(item as any).metadata?.priceGroup || ''}"`,
        item.fabric_width || '',
        `"${item.fabric_composition || ''}"`,
        `"${item.fabric_grade || ''}"`,
        item.pattern_repeat_vertical || '',
        item.pattern_repeat_horizontal || '',
        (item as any).metadata?.maxLength || '',
        (item as any).metadata?.rotationAllowance ? 'yes' : 'no',
        `"${item.image_url || ''}"`
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
  
  if (category === 'hardware') {
    const headers = [
      'name', 'sku', 'description', 'subcategory', 'tags', 'track_inventory',
      'quantity', 'unit', 'cost_price', 'selling_price', 'supplier', 'vendor_name', 'collection_name',
      'location', 'reorder_point', 'hardware_type', 'material_finish',
      'hardware_load_capacity', 'hardware_weight', 'mounting_type', 'compatible_with', 'dimensions'
    ];
    
    const rows = items.map(item => {
      const isTracked = item.quantity != null ? 'yes' : 'no';
      const tags = Array.isArray(item.tags) ? item.tags.join(',') : '';
      
      return [
        `"${item.name || ''}"`,
        `"${item.sku || ''}"`,
        `"${item.description || ''}"`,
        `"${item.subcategory || ''}"`,
        `"${tags}"`,
        isTracked,
        item.quantity ?? 0,
        `"${item.unit || 'pieces'}"`,
        item.cost_price || 0,
        item.selling_price || 0,
        `"${item.supplier || ''}"`,
        `"${(item as any).metadata?.vendor_name || ''}"`,
        `"${item.collection_name || ''}"`,
        `"${item.location || ''}"`,
        item.reorder_point ?? 0,
        `"${item.hardware_type || ''}"`,
        `"${item.material_finish || ''}"`,
        item.hardware_load_capacity || '',
        item.hardware_weight || '',
        `"${item.mounting_type || ''}"`,
        `"${(item as any).metadata?.compatible_with || ''}"`,
        `"${(item as any).metadata?.dimensions || ''}"`
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
  
  if (category === 'wallpaper') {
    const headers = [
      'name', 'sku', 'description', 'subcategory', 'tags', 'track_inventory',
      'supplier', 'collection_name', 'location', 'quantity', 'unit', 'reorder_point', 'cost_price', 'selling_price', 'price_group',
      'roll_width', 'roll_length', 'pattern_repeat_vertical', 'pattern_repeat_horizontal', 'coverage_per_roll',
      'colors', 'material_type', 'washability', 'fire_rating', 'image_url'
    ];
    
    const rows = items.map(item => {
      const isTracked = item.quantity != null ? 'yes' : 'no';
      // Extract colors and non-color tags separately
      const { colors, nonColorTags } = extractColorsFromTags(item.tags);
      const tagsStr = nonColorTags.join(',');
      const colorsStr = colors.join(',');
      
      return [
        `"${item.name || ''}"`,
        `"${item.sku || ''}"`,
        `"${item.description || ''}"`,
        `"${item.subcategory || ''}"`,
        `"${tagsStr}"`,
        isTracked,
        `"${item.supplier || ''}"`,
        `"${item.collection_name || ''}"`,
        `"${item.location || ''}"`,
        item.quantity ?? 0,
        `"${item.unit || 'rolls'}"`,
        item.reorder_point ?? 0,
        item.cost_price || 0,
        item.selling_price || 0,
        `"${(item as any).metadata?.price_group || ''}"`,
        item.roll_width || '',
        item.roll_length || '',
        item.pattern_repeat_vertical || '',
        item.pattern_repeat_horizontal || '',
        (item as any).metadata?.coverage_per_roll || '',
        `"${colorsStr}"`,
        `"${(item as any).metadata?.material_type || ''}"`,
        `"${(item as any).metadata?.washability || ''}"`,
        `"${(item as any).metadata?.fire_rating || ''}"`,
        `"${item.image_url || ''}"`
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
  
  if (category === 'trimmings') {
    const headers = [
      'name', 'sku', 'description', 'subcategory', 'tags', 'track_inventory',
      'quantity', 'unit', 'cost_price', 'selling_price', 'supplier', 'vendor_name', 'collection_name',
      'location', 'reorder_point', 'trimming_width', 'colors', 'material_composition', 'price_per_meter'
    ];
    
    const rows = items.map(item => {
      const isTracked = item.quantity != null ? 'yes' : 'no';
      // Extract colors and non-color tags separately
      const { colors, nonColorTags } = extractColorsFromTags(item.tags);
      const tagsStr = nonColorTags.join(',');
      const colorsStr = colors.join(',');
      
      return [
        `"${item.name || ''}"`,
        `"${item.sku || ''}"`,
        `"${item.description || ''}"`,
        `"${item.subcategory || ''}"`,
        `"${tagsStr}"`,
        isTracked,
        item.quantity ?? 0,
        `"${item.unit || 'meters'}"`,
        item.cost_price || 0,
        item.selling_price || 0,
        `"${item.supplier || ''}"`,
        `"${(item as any).metadata?.vendor_name || ''}"`,
        `"${item.collection_name || ''}"`,
        `"${item.location || ''}"`,
        item.reorder_point ?? 0,
        (item as any).metadata?.trimming_width || '',
        `"${colorsStr}"`,
        `"${(item as any).metadata?.material_composition || ''}"`,
        item.unit_price || item.selling_price || 0
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  if (category === 'material') {
    const headers = [
      'name', 'sku', 'description', 'subcategory', 'tags', 'track_inventory',
      'quantity', 'unit', 'cost_price', 'selling_price', 'supplier', 'vendor_name', 'collection_name',
      'location', 'reorder_point', 'slat_width', 'material_type', 'colors', 'image_url'
    ];
    
    const rows = items.map(item => {
      const isTracked = item.quantity != null ? 'yes' : 'no';
      const { colors, nonColorTags } = extractColorsFromTags(item.tags);
      const tagsStr = nonColorTags.join(',');
      const colorsStr = colors.join(',');
      
      return [
        `"${item.name || ''}"`,
        `"${item.sku || ''}"`,
        `"${item.description || ''}"`,
        `"${item.subcategory || ''}"`,
        `"${tagsStr}"`,
        isTracked,
        item.quantity ?? 0,
        `"${item.unit || 'pieces'}"`,
        item.cost_price || 0,
        item.selling_price || 0,
        `"${item.supplier || ''}"`,
        `"${(item as any).metadata?.vendor_name || ''}"`,
        `"${item.collection_name || ''}"`,
        `"${item.location || ''}"`,
        item.reorder_point ?? 0,
        (item as any).metadata?.slat_width || item.slat_width || '',
        `"${(item as any).metadata?.material_type || item.material_type || ''}"`,
        `"${colorsStr}"`,
        `"${item.image_url || ''}"`
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  if (category === 'service') {
    const headers = [
      'name', 'sku', 'description', 'subcategory', 'tags', 'track_inventory',
      'quantity', 'unit', 'cost_price', 'selling_price', 'supplier', 'location'
    ];
    
    const rows = items.map(item => {
      const isTracked = item.quantity != null ? 'yes' : 'no';
      const tags = Array.isArray(item.tags) ? item.tags.join(',') : '';
      
      return [
        `"${item.name || ''}"`,
        `"${item.sku || ''}"`,
        `"${item.description || ''}"`,
        `"${item.subcategory || ''}"`,
        `"${tags}"`,
        isTracked,
        item.quantity ?? 0,
        `"${item.unit || 'service'}"`,
        item.cost_price || 0,
        item.selling_price || 0,
        `"${item.supplier || ''}"`,
        `"${item.location || ''}"`
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }

  return '';
};
