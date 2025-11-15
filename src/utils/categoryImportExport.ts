/**
 * Category-specific CSV import/export utilities
 * Handles parsing, validation, and export for different inventory categories
 */

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

// FABRICS PARSER
export const parseFabricCSV = (csvData: string): ValidationResult => {
  const lines = csvData.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0]);
  const valid: any[] = [];
  const invalid: { item: any; errors: string[]; row: number }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const errors: string[] = [];
    
    const item: any = {
      name: values[0]?.replace(/^"|"$/g, ''),
      sku: values[1]?.replace(/^"|"$/g, ''),
      description: values[2]?.replace(/^"|"$/g, ''),
      subcategory: values[3]?.replace(/^"|"$/g, ''),
      quantity: parseFloat(values[4]) || 0,
      unit: values[5]?.replace(/^"|"$/g, '') || 'meters',
      cost_price: parseFloat(values[6]) || 0,
      selling_price: parseFloat(values[7]) || 0,
      supplier: values[8]?.replace(/^"|"$/g, ''),
      location: values[9]?.replace(/^"|"$/g, ''),
      reorder_point: parseFloat(values[10]) || 0,
      fabric_width: parseFloat(values[11]) || null,
      pattern_repeat_vertical: parseFloat(values[12]) || null,
      pattern_repeat_horizontal: parseFloat(values[13]) || null,
      fabric_composition: values[14]?.replace(/^"|"$/g, ''),
      fabric_grade: values[15]?.replace(/^"|"$/g, ''),
      color: values[16]?.replace(/^"|"$/g, ''),
      collection_name: values[17]?.replace(/^"|"$/g, ''),
      metadata: {
        maxLength: parseFloat(values[18]) || null,
      },
      price_group: values[19]?.replace(/^"|"$/g, ''),
    };

    // Validation
    const nameError = validateRequired(item.name, 'Name');
    if (nameError) errors.push(nameError);
    
    const widthError = item.fabric_width ? validateNumber(item.fabric_width, 'Fabric Width', 0) : null;
    if (widthError) errors.push(widthError);

    const quantityError = validateNumber(item.quantity, 'Quantity', 0);
    if (quantityError) errors.push(quantityError);

    if (!item.subcategory || !['curtain_fabric', 'roller_fabric', 'furniture_fabric', 'sheer_fabric'].includes(item.subcategory)) {
      errors.push('Invalid subcategory. Must be: curtain_fabric, roller_fabric, furniture_fabric, or sheer_fabric');
    }

    if (errors.length > 0) {
      invalid.push({ item, errors, row: i + 1 });
    } else {
      valid.push(item);
    }
  }

  return { valid, invalid };
};

// HARDWARE PARSER
export const parseHardwareCSV = (csvData: string): ValidationResult => {
  const lines = csvData.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0]);
  const valid: any[] = [];
  const invalid: { item: any; errors: string[]; row: number }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const errors: string[] = [];
    
    const item: any = {
      name: values[0]?.replace(/^"|"$/g, ''),
      sku: values[1]?.replace(/^"|"$/g, ''),
      description: values[2]?.replace(/^"|"$/g, ''),
      subcategory: values[3]?.replace(/^"|"$/g, ''),
      quantity: parseFloat(values[4]) || 0,
      unit: values[5]?.replace(/^"|"$/g, '') || 'pieces',
      cost_price: parseFloat(values[6]) || 0,
      selling_price: parseFloat(values[7]) || 0,
      supplier: values[8]?.replace(/^"|"$/g, ''),
      location: values[9]?.replace(/^"|"$/g, ''),
      reorder_point: parseFloat(values[10]) || 0,
      hardware_type: values[11]?.replace(/^"|"$/g, ''),
      material_finish: values[12]?.replace(/^"|"$/g, ''),
      hardware_load_capacity: parseFloat(values[13]) || null,
      hardware_weight: parseFloat(values[14]) || null,
      mounting_type: values[15]?.replace(/^"|"$/g, ''),
      metadata: {
        compatible_with: values[16]?.replace(/^"|"$/g, ''),
        dimensions: values[17]?.replace(/^"|"$/g, ''),
      },
    };

    // Validation
    const nameError = validateRequired(item.name, 'Name');
    if (nameError) errors.push(nameError);

    const quantityError = validateNumber(item.quantity, 'Quantity', 0);
    if (quantityError) errors.push(quantityError);

    if (!item.subcategory || !['track', 'pole', 'bracket', 'motor', 'accessory', 'finial'].includes(item.subcategory)) {
      errors.push('Invalid subcategory. Must be: track, pole, bracket, motor, accessory, or finial');
    }

    if (errors.length > 0) {
      invalid.push({ item, errors, row: i + 1 });
    } else {
      valid.push(item);
    }
  }

  return { valid, invalid };
};

// WALLPAPER PARSER
export const parseWallpaperCSV = (csvData: string): ValidationResult => {
  const lines = csvData.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0]);
  const valid: any[] = [];
  const invalid: { item: any; errors: string[]; row: number }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const errors: string[] = [];
    
    const item: any = {
      name: values[0]?.replace(/^"|"$/g, ''),
      sku: values[1]?.replace(/^"|"$/g, ''),
      description: values[2]?.replace(/^"|"$/g, ''),
      subcategory: values[3]?.replace(/^"|"$/g, ''),
      quantity: parseFloat(values[4]) || 0,
      unit: values[5]?.replace(/^"|"$/g, '') || 'rolls',
      cost_price: parseFloat(values[6]) || 0,
      selling_price: parseFloat(values[7]) || 0,
      supplier: values[8]?.replace(/^"|"$/g, ''),
      location: values[9]?.replace(/^"|"$/g, ''),
      reorder_point: parseFloat(values[10]) || 0,
      roll_width: parseFloat(values[11]) || null,
      roll_length: parseFloat(values[12]) || null,
      pattern_repeat_vertical: parseFloat(values[13]) || null,
      pattern_repeat_horizontal: parseFloat(values[14]) || null,
      metadata: {
        coverage_per_roll: parseFloat(values[15]) || null,
        material_type: values[18]?.replace(/^"|"$/g, ''),
        washability: values[19]?.replace(/^"|"$/g, ''),
        fire_rating: values[20]?.replace(/^"|"$/g, ''),
      },
      color: values[16]?.replace(/^"|"$/g, ''),
      collection_name: values[17]?.replace(/^"|"$/g, ''),
    };

    // Validation
    const nameError = validateRequired(item.name, 'Name');
    if (nameError) errors.push(nameError);

    const quantityError = validateNumber(item.quantity, 'Quantity', 0);
    if (quantityError) errors.push(quantityError);

    if (item.roll_width) {
      const widthError = validateNumber(item.roll_width, 'Roll Width', 0);
      if (widthError) errors.push(widthError);
    }

    if (!item.subcategory || !['wallpaper', 'wall_panels_murals', 'grasscloth'].includes(item.subcategory)) {
      errors.push('Invalid subcategory. Must be: wallpaper, wall_panels_murals, or grasscloth');
    }

    if (errors.length > 0) {
      invalid.push({ item, errors, row: i + 1 });
    } else {
      valid.push(item);
    }
  }

  return { valid, invalid };
};

// TRIMMINGS PARSER
export const parseTrimmingsCSV = (csvData: string): ValidationResult => {
  const lines = csvData.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0]);
  const valid: any[] = [];
  const invalid: { item: any; errors: string[]; row: number }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const errors: string[] = [];
    
    const item: any = {
      name: values[0]?.replace(/^"|"$/g, ''),
      sku: values[1]?.replace(/^"|"$/g, ''),
      description: values[2]?.replace(/^"|"$/g, ''),
      subcategory: values[3]?.replace(/^"|"$/g, ''),
      quantity: parseFloat(values[4]) || 0,
      unit: values[5]?.replace(/^"|"$/g, '') || 'meters',
      cost_price: parseFloat(values[6]) || 0,
      selling_price: parseFloat(values[7]) || 0,
      supplier: values[8]?.replace(/^"|"$/g, ''),
      location: values[9]?.replace(/^"|"$/g, ''),
      reorder_point: parseFloat(values[10]) || 0,
      metadata: {
        trimming_width: parseFloat(values[11]) || null,
        material_composition: values[13]?.replace(/^"|"$/g, ''),
      },
      color: values[12]?.replace(/^"|"$/g, ''),
      collection_name: values[14]?.replace(/^"|"$/g, ''),
      unit_price: parseFloat(values[15]) || null,
    };

    // Validation
    const nameError = validateRequired(item.name, 'Name');
    if (nameError) errors.push(nameError);

    const quantityError = validateNumber(item.quantity, 'Quantity', 0);
    if (quantityError) errors.push(quantityError);

    if (!item.subcategory || !['fringe', 'cord', 'tassel', 'braid', 'border'].includes(item.subcategory)) {
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

// EXPORT FUNCTIONS
export const exportCategoryInventory = (items: any[], category: string): string => {
  if (category === 'fabrics') {
    const headers = [
      'name', 'sku', 'description', 'subcategory', 'quantity', 'unit', 'cost_price', 'selling_price',
      'supplier', 'location', 'reorder_point', 'fabric_width', 'pattern_repeat_vertical',
      'pattern_repeat_horizontal', 'fabric_composition', 'fabric_grade', 'color', 'collection_name',
      'max_length', 'price_group'
    ];
    
    const rows = items.map(item => [
      `"${item.name || ''}"`,
      `"${item.sku || ''}"`,
      `"${item.description || ''}"`,
      `"${item.subcategory || ''}"`,
      item.quantity || 0,
      `"${item.unit || 'meters'}"`,
      item.cost_price || 0,
      item.selling_price || 0,
      `"${item.supplier || ''}"`,
      `"${item.location || ''}"`,
      item.reorder_point || 0,
      item.fabric_width || '',
      item.pattern_repeat_vertical || '',
      item.pattern_repeat_horizontal || '',
      `"${item.fabric_composition || ''}"`,
      `"${item.fabric_grade || ''}"`,
      `"${item.color || ''}"`,
      `"${item.collection_name || ''}"`,
      (item as any).metadata?.maxLength || '',
      `"${item.price_group || ''}"`
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }
  
  if (category === 'hardware') {
    const headers = [
      'name', 'sku', 'description', 'subcategory', 'quantity', 'unit', 'cost_price', 'selling_price',
      'supplier', 'location', 'reorder_point', 'hardware_type', 'material_finish',
      'hardware_load_capacity', 'hardware_weight', 'mounting_type', 'compatible_with', 'dimensions'
    ];
    
    const rows = items.map(item => [
      `"${item.name || ''}"`,
      `"${item.sku || ''}"`,
      `"${item.description || ''}"`,
      `"${item.subcategory || ''}"`,
      item.quantity || 0,
      `"${item.unit || 'pieces'}"`,
      item.cost_price || 0,
      item.selling_price || 0,
      `"${item.supplier || ''}"`,
      `"${item.location || ''}"`,
      item.reorder_point || 0,
      `"${item.hardware_type || ''}"`,
      `"${item.material_finish || ''}"`,
      item.hardware_load_capacity || '',
      item.hardware_weight || '',
      `"${item.mounting_type || ''}"`,
      `"${(item as any).metadata?.compatible_with || ''}"`,
      `"${(item as any).metadata?.dimensions || ''}"`
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }
  
  if (category === 'wallpaper') {
    const headers = [
      'name', 'sku', 'description', 'subcategory', 'quantity', 'unit', 'cost_price', 'selling_price',
      'supplier', 'location', 'reorder_point', 'roll_width', 'roll_length', 'pattern_repeat_vertical',
      'pattern_repeat_horizontal', 'coverage_per_roll', 'color', 'collection_name', 'material_type',
      'washability', 'fire_rating'
    ];
    
    const rows = items.map(item => [
      `"${item.name || ''}"`,
      `"${item.sku || ''}"`,
      `"${item.description || ''}"`,
      `"${item.subcategory || ''}"`,
      item.quantity || 0,
      `"${item.unit || 'rolls'}"`,
      item.cost_price || 0,
      item.selling_price || 0,
      `"${item.supplier || ''}"`,
      `"${item.location || ''}"`,
      item.reorder_point || 0,
      item.roll_width || '',
      item.roll_length || '',
      item.pattern_repeat_vertical || '',
      item.pattern_repeat_horizontal || '',
      (item as any).metadata?.coverage_per_roll || '',
      `"${item.color || ''}"`,
      `"${item.collection_name || ''}"`,
      `"${(item as any).metadata?.material_type || ''}"`,
      `"${(item as any).metadata?.washability || ''}"`,
      `"${(item as any).metadata?.fire_rating || ''}"`
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }
  
  if (category === 'trimmings') {
    const headers = [
      'name', 'sku', 'description', 'subcategory', 'quantity', 'unit', 'cost_price', 'selling_price',
      'supplier', 'location', 'reorder_point', 'trimming_width', 'color', 'material_composition',
      'collection_name', 'price_per_meter'
    ];
    
    const rows = items.map(item => [
      `"${item.name || ''}"`,
      `"${item.sku || ''}"`,
      `"${item.description || ''}"`,
      `"${item.subcategory || ''}"`,
      item.quantity || 0,
      `"${item.unit || 'meters'}"`,
      item.cost_price || 0,
      item.selling_price || 0,
      `"${item.supplier || ''}"`,
      `"${item.location || ''}"`,
      item.reorder_point || 0,
      (item as any).metadata?.trimming_width || '',
      `"${item.color || ''}"`,
      `"${(item as any).metadata?.material_composition || ''}"`,
      `"${item.collection_name || ''}"`,
      item.unit_price || item.selling_price || 0
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  return '';
};
