/**
 * Hardware Item Grouping Utility
 * ===============================
 * Groups hardware-related items into a single collapsible section for client-friendly display.
 * Shows total hardware price first, with expandable breakdown of components.
 */

interface BreakdownItem {
  id?: string;
  name?: string;
  total_cost?: number;
  price?: number;
  calculatedPrice?: number;
  category?: string;
  optionKey?: string;
  pricingDetails?: string;
  quantity?: number;
  unit_price?: number;
  unit?: string;
  [key: string]: any;
}

interface GroupedHardware {
  items: BreakdownItem[];
  total: number;
}

interface GroupedResult {
  hardwareGroup: GroupedHardware | null;
  otherItems: BreakdownItem[];
}

/**
 * Detects if an item is hardware-related based on category or option key
 */
export function isHardwareItem(item: BreakdownItem): boolean {
  const category = (item.category || '').toLowerCase();
  const optionKey = (item.optionKey || '').toLowerCase();
  const name = (item.name || '').toLowerCase();
  
  // Check by category
  if (category === 'hardware' || category === 'hardware_accessory') {
    return true;
  }
  
  // Check by option key patterns
  if (
    optionKey.includes('hardware') ||
    optionKey.includes('track_selection') ||
    optionKey.includes('rod_selection') ||
    optionKey.includes('track') ||
    optionKey.includes('rod') ||
    optionKey.includes('pole')
  ) {
    return true;
  }
  
  // Check by name patterns (hardware-related names)
  if (
    name.includes('track') ||
    name.includes('rod') ||
    name.includes('pole') ||
    name.includes('finial') ||
    name.includes('bracket') ||
    name.includes('runner') ||
    name.includes('end cap') ||
    name.includes('endcap') ||
    name.includes('glider') ||
    name.includes('curtain rail')
  ) {
    return true;
  }
  
  return false;
}

/**
 * Gets the display price from various possible fields
 */
export function getItemPrice(item: BreakdownItem): number {
  return item.calculatedPrice ?? item.total_cost ?? item.price ?? 0;
}

/**
 * Filters out hardware "type" selections that have ₹0 price
 * These are just category choices (track vs rod), not actual products
 */
export function filterMeaningfulHardwareItems(items: BreakdownItem[]): BreakdownItem[] {
  return items.filter(item => {
    const price = getItemPrice(item);
    const optionKey = (item.optionKey || '').toLowerCase();
    
    // If it's hardware_type with ₹0, hide it (just a category selection)
    if (optionKey === 'hardware_type' && price === 0) {
      return false;
    }
    
    return true;
  });
}

/**
 * Groups hardware items together and separates from other items
 */
export function groupHardwareItems<T extends BreakdownItem>(items: T[]): GroupedResult {
  const hardwareItems: T[] = [];
  const otherItems: T[] = [];
  
  items.forEach(item => {
    if (isHardwareItem(item)) {
      hardwareItems.push(item);
    } else {
      otherItems.push(item);
    }
  });
  
  if (hardwareItems.length === 0) {
    return {
      hardwareGroup: null,
      otherItems: items
    };
  }
  
  const hardwareTotal = hardwareItems.reduce((sum, item) => sum + getItemPrice(item), 0);
  
  return {
    hardwareGroup: {
      items: hardwareItems,
      total: hardwareTotal
    },
    otherItems
  };
}

/**
 * Determines if an item is the main hardware item (not an accessory)
 */
export function isMainHardwareItem(item: BreakdownItem): boolean {
  const category = (item.category || '').toLowerCase();
  const optionKey = (item.optionKey || '').toLowerCase();
  
  // Accessories have their own category
  if (category === 'hardware_accessory') {
    return false;
  }
  
  // Track/Rod selections are main items
  if (
    optionKey.includes('track_selection') ||
    optionKey.includes('rod_selection')
  ) {
    return true;
  }
  
  // Hardware type is main item
  if (category === 'hardware') {
    return true;
  }
  
  return false;
}
