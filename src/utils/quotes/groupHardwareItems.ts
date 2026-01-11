/**
 * Option Item Grouping Utility
 * =============================
 * Groups related items (hardware, accessories, etc.) into collapsible sections
 * for client-friendly display. Shows total price first, with expandable breakdown.
 * 
 * UNIVERSAL: Works for ALL accounts and option types - no hardcoded emojis or names.
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
  image_url?: string;
  [key: string]: any;
}

interface GroupedOption {
  id: string;
  name: string;
  image_url?: string;  // Option's image (NOT hardcoded emoji)
  total: number;
  items: BreakdownItem[];
  category: string;
}

interface GroupedResult {
  hardwareGroup: GroupedOption | null;
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
 * Filters out zero-priced category selections (e.g., "Hardware Type: Rod" with ₹0)
 * These are just category choices, not actual products
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
 * Gets the primary image from hardware items (first non-accessory with an image)
 */
export function getGroupImage(items: BreakdownItem[]): string | undefined {
  // Priority: main hardware item image > any accessory image
  const mainItem = items.find(item => 
    isMainHardwareItem(item) && item.image_url
  );
  if (mainItem?.image_url) return mainItem.image_url;
  
  // Fallback to first item with an image
  const anyWithImage = items.find(item => item.image_url);
  return anyWithImage?.image_url;
}

/**
 * Gets the display name for the hardware group (based on main item type)
 */
export function getGroupName(items: BreakdownItem[]): string {
  const mainItem = items.find(item => isMainHardwareItem(item));
  
  if (mainItem) {
    const name = (mainItem.name || '').toLowerCase();
    if (name.includes('track')) return 'Track & Hardware';
    if (name.includes('rod')) return 'Rod & Hardware';
    if (name.includes('pole')) return 'Pole & Hardware';
  }
  
  return 'Hardware';
}

/**
 * Groups hardware items together and separates from other items
 * Returns group with image_url (from option) instead of hardcoded emoji
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
      id: 'hardware-group',
      name: getGroupName(hardwareItems),
      image_url: getGroupImage(hardwareItems),
      items: hardwareItems,
      total: hardwareTotal,
      category: 'hardware_group'
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
