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
    
    // Parse track_inventory column (index 6)
    const trackInventoryValue = values[6]?.replace(/^"|"$/g, '').toLowerCase();
    const shouldTrack = trackInventoryValue === 'yes' || trackInventoryValue === 'true' || trackInventoryValue === '1';
    
    const rotationValue = values[23]?.replace(/^"|"$/g, '').toLowerCase();
    const canRotate = rotationValue === 'yes' || rotationValue === 'true' || rotationValue === '1';
    
    // Parse colors column (index 5) - comma-separated colors that go into tags
    const colorsRaw = values[5]?.replace(/^"|"$/g, '') || '';
    const colorValues = colorsRaw.split(',').map(c => c.trim().toLowerCase()).filter(c => c);
    
    const item: any = {
      category: 'fabric',
      name: values[0]?.replace(/^"|"$/g, ''),
      sku: values[1]?.replace(/^"|"$/g, ''),
      description: values[2]?.replace(/^"|"$/g, ''),
      subcategory: values[3]?.replace(/^"|"$/g, ''),
      product_category: values[4]?.replace(/^"|"$/g, ''),
      tags: colorValues, // Colors go directly into tags for ColorSelector
      supplier: values[7]?.replace(/^"|"$/g, ''),
      collection_name: values[8]?.replace(/^"|"$/g, ''),
      location: values[9]?.replace(/^"|"$/g, ''),
      quantity: shouldTrack ? (parseFloat(values[10]) || 0) : null,
      unit: values[11]?.replace(/^"|"$/g, '') || 'meters',
      reorder_point: shouldTrack ? (parseFloat(values[12]) || 0) : null,
      cost_price: parseFloat(values[13]) || 0,
      selling_price: parseFloat(values[14]) || 0,
      price_per_meter: parseFloat(values[14]) || 0,
      fabric_width: parseFloat(values[16]) || null,
      fabric_composition: values[17]?.replace(/^"|"$/g, ''),
      fabric_grade: values[18]?.replace(/^"|"$/g, ''),
      pattern_repeat_vertical: parseFloat(values[19]) || null,
      pattern_repeat_horizontal: parseFloat(values[20]) || null,
      image_url: values[23]?.replace(/^"|"$/g, ''),
      metadata: {
        maxLength: parseFloat(values[21]) || null,
        rotationAllowance: canRotate,
        priceGroup: values[15]?.replace(/^"|"$/g, '') || null,
      },
    };

    // Validation
    const nameError = validateRequired(item.name, 'Name');
    if (nameError) errors.push(nameError);
    
    const widthError = item.fabric_width ? validateNumber(item.fabric_width, 'Fabric Width', 0) : null;
    if (widthError) errors.push(widthError);

    // Only validate quantity if tracking is enabled
    if (shouldTrack) {
      const quantityError = validateNumber(item.quantity, 'Quantity', 0);
      if (quantityError) errors.push(quantityError);
    }

    const validSubcategories = [
      'curtain_fabric',
      'roller_fabric',
      'blind_fabric',
      'furniture_fabric',
      'sheer_fabric'
    ];
    
    if (!item.subcategory || !validSubcategories.includes(item.subcategory)) {
      errors.push(`Invalid subcategory. Must be one of: ${validSubcategories.join(', ')}`);
    }

    const validProductCategories = [
      'roller_blinds',
      'venetian_blinds', 
      'vertical_blinds',
      'roman_blinds',
      'curtains',
      'shutters',
      'panel_blinds',
      'other'
    ];
    
    if (item.product_category && !validProductCategories.includes(item.product_category)) {
      errors.push(`Invalid product_category. Must be one of: ${validProductCategories.join(', ')}`);
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
    
    // Parse track_inventory column (index 5)
    const trackInventoryValue = values[5]?.replace(/^"|"$/g, '').toLowerCase();
    const shouldTrack = trackInventoryValue === 'yes' || trackInventoryValue === 'true' || trackInventoryValue === '1';
    
    const item: any = {
      name: values[0]?.replace(/^"|"$/g, ''),
      sku: values[1]?.replace(/^"|"$/g, ''),
      description: values[2]?.replace(/^"|"$/g, ''),
      subcategory: values[3]?.replace(/^"|"$/g, ''),
      tags: values[4]?.replace(/^"|"$/g, '').split(',').map(t => t.trim()).filter(t => t) || [],
      quantity: shouldTrack ? (parseFloat(values[6]) || 0) : null,
      unit: values[7]?.replace(/^"|"$/g, '') || 'pieces',
      cost_price: parseFloat(values[8]) || 0,
      selling_price: parseFloat(values[9]) || 0,
      supplier: values[10]?.replace(/^"|"$/g, ''),
      location: values[13]?.replace(/^"|"$/g, ''),
      reorder_point: shouldTrack ? (parseFloat(values[14]) || 0) : null,
      hardware_type: values[15]?.replace(/^"|"$/g, ''),
      material_finish: values[16]?.replace(/^"|"$/g, ''),
      hardware_load_capacity: parseFloat(values[17]) || null,
      hardware_weight: parseFloat(values[18]) || null,
      mounting_type: values[19]?.replace(/^"|"$/g, ''),
      collection_name: values[12]?.replace(/^"|"$/g, ''),
      metadata: {
        compatible_with: values[20]?.replace(/^"|"$/g, ''),
        dimensions: values[21]?.replace(/^"|"$/g, ''),
        vendor_name: values[11]?.replace(/^"|"$/g, ''),
      },
    };

    // Validation
    const nameError = validateRequired(item.name, 'Name');
    if (nameError) errors.push(nameError);

    // Only validate quantity if tracking is enabled
    if (shouldTrack) {
      const quantityError = validateNumber(item.quantity, 'Quantity', 0);
      if (quantityError) errors.push(quantityError);
    }

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
    
    // Parse track_inventory column (index 5)
    const trackInventoryValue = values[5]?.replace(/^"|"$/g, '').toLowerCase();
    const shouldTrack = trackInventoryValue === 'yes' || trackInventoryValue === 'true' || trackInventoryValue === '1';
    
    // Parse tags and colors - colors (index 20) go into tags for ColorSelector
    const tagsRaw = values[4]?.replace(/^"|"$/g, '') || '';
    const baseTags = tagsRaw.split(',').map(t => t.trim()).filter(t => t);
    const colorsRaw = values[20]?.replace(/^"|"$/g, '') || '';
    const colorValues = colorsRaw.split(',').map(c => c.trim().toLowerCase()).filter(c => c);
    
    const item: any = {
      name: values[0]?.replace(/^"|"$/g, ''),
      sku: values[1]?.replace(/^"|"$/g, ''),
      description: values[2]?.replace(/^"|"$/g, ''),
      subcategory: values[3]?.replace(/^"|"$/g, ''),
      tags: [...baseTags, ...colorValues], // Merge tags and colors
      supplier: values[6]?.replace(/^"|"$/g, ''),
      collection_name: values[7]?.replace(/^"|"$/g, ''),
      location: values[8]?.replace(/^"|"$/g, ''),
      quantity: shouldTrack ? (parseFloat(values[9]) || 0) : null,
      unit: values[10]?.replace(/^"|"$/g, '') || 'rolls',
      reorder_point: shouldTrack ? (parseFloat(values[11]) || 0) : null,
      cost_price: parseFloat(values[12]) || 0,
      selling_price: parseFloat(values[13]) || 0,
      roll_width: parseFloat(values[15]) || null,
      roll_length: parseFloat(values[16]) || null,
      pattern_repeat_vertical: parseFloat(values[17]) || null,
      pattern_repeat_horizontal: parseFloat(values[18]) || null,
      metadata: {
        coverage_per_roll: parseFloat(values[19]) || null,
        material_type: values[21]?.replace(/^"|"$/g, ''),
        washability: values[22]?.replace(/^"|"$/g, ''),
        fire_rating: values[23]?.replace(/^"|"$/g, ''),
        price_group: values[14]?.replace(/^"|"$/g, '') || null,
      },
      image_url: values[24]?.replace(/^"|"$/g, ''),
    };

    // Validation
    const nameError = validateRequired(item.name, 'Name');
    if (nameError) errors.push(nameError);

    // Only validate quantity if tracking is enabled
    if (shouldTrack) {
      const quantityError = validateNumber(item.quantity, 'Quantity', 0);
      if (quantityError) errors.push(quantityError);
    }

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
    
    // Parse track_inventory column (index 5)
    const trackInventoryValue = values[5]?.replace(/^"|"$/g, '').toLowerCase();
    const shouldTrack = trackInventoryValue === 'yes' || trackInventoryValue === 'true' || trackInventoryValue === '1';
    
    // Parse tags and colors - colors (index 16) go into tags for ColorSelector
    const tagsRaw = values[4]?.replace(/^"|"$/g, '') || '';
    const baseTags = tagsRaw.split(',').map(t => t.trim()).filter(t => t);
    const colorsRaw = values[16]?.replace(/^"|"$/g, '') || '';
    const colorValues = colorsRaw.split(',').map(c => c.trim().toLowerCase()).filter(c => c);
    
    const item: any = {
      name: values[0]?.replace(/^"|"$/g, ''),
      sku: values[1]?.replace(/^"|"$/g, ''),
      description: values[2]?.replace(/^"|"$/g, ''),
      subcategory: values[3]?.replace(/^"|"$/g, ''),
      tags: [...baseTags, ...colorValues], // Merge tags and colors
      quantity: shouldTrack ? (parseFloat(values[6]) || 0) : null,
      unit: values[7]?.replace(/^"|"$/g, '') || 'meters',
      cost_price: parseFloat(values[8]) || 0,
      selling_price: parseFloat(values[9]) || 0,
      supplier: values[10]?.replace(/^"|"$/g, ''),
      collection_name: values[12]?.replace(/^"|"$/g, ''),
      location: values[13]?.replace(/^"|"$/g, ''),
      reorder_point: shouldTrack ? (parseFloat(values[14]) || 0) : null,
      unit_price: parseFloat(values[18]) || null,
      metadata: {
        trimming_width: parseFloat(values[15]) || null,
        material_composition: values[17]?.replace(/^"|"$/g, ''),
        vendor_name: values[11]?.replace(/^"|"$/g, ''),
      },
    };

    // Validation
    const nameError = validateRequired(item.name, 'Name');
    if (nameError) errors.push(nameError);

    // Only validate quantity if tracking is enabled
    if (shouldTrack) {
      const quantityError = validateNumber(item.quantity, 'Quantity', 0);
      if (quantityError) errors.push(quantityError);
    }

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
      'name', 'sku', 'description', 'subcategory', 'product_category', 'colors', 'track_inventory',
      'supplier', 'collection_name', 'location', 'quantity', 'unit', 'reorder_point', 'cost_price', 'selling_price', 'price_group',
      'fabric_width', 'fabric_composition', 'fabric_grade', 'pattern_repeat_vertical',
      'pattern_repeat_horizontal', 'max_length', 'rotation_allowance', 'image_url'
    ];
    
    const rows = items.map(item => {
      const isTracked = item.quantity != null ? 'yes' : 'no';
      // Extract colors from tags for export
      const { colors } = extractColorsFromTags(item.tags);
      const colorsStr = colors.join(',');
      
      return [
        `"${item.name || ''}"`,
        `"${item.sku || ''}"`,
        `"${item.description || ''}"`,
        `"${item.subcategory || ''}"`,
        `"${item.product_category || ''}"`,
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

  return '';
};
