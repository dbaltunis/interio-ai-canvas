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
 * UNIVERSAL: Works for curtains, roman blinds, roller/zebra blinds, venetians, etc.
 */
export function isHardwareItem(item: BreakdownItem): boolean {
  const category = (item.category || '').toLowerCase();
  const optionKey = (item.optionKey || item.id || '').toLowerCase();
  const name = (item.name || '').toLowerCase();
  
  // Check by category
  if (category === 'hardware' || category === 'hardware_accessory') {
    return true;
  }
  
  // Check by option key patterns - UNIVERSAL for all treatments
  if (
    // Curtain hardware
    optionKey.includes('hardware') ||
    optionKey.includes('track_selection') ||
    optionKey.includes('rod_selection') ||
    optionKey.includes('track') ||
    optionKey.includes('rod') ||
    optionKey.includes('pole') ||
    // Roman Blind hardware
    optionKey.includes('headrail') ||
    optionKey.includes('head_rail') ||
    optionKey.includes('control_system') ||
    optionKey.includes('chain_length') ||
    optionKey.includes('motor_type') ||
    optionKey.includes('remote_type') ||
    // Roller/Zebra/Venetian hardware
    optionKey.includes('bottom_rail') ||
    optionKey.includes('fascia') ||
    optionKey.includes('cassette') ||
    optionKey.includes('valance')
  ) {
    return true;
  }
  
  // Check by name patterns (hardware-related names) - UNIVERSAL
  if (
    // Curtain hardware
    name.includes('track') ||
    name.includes('rod') ||
    name.includes('pole') ||
    name.includes('finial') ||
    name.includes('bracket') ||
    name.includes('runner') ||
    name.includes('end cap') ||
    name.includes('endcap') ||
    name.includes('glider') ||
    name.includes('curtain rail') ||
    // Roman Blind hardware
    name.includes('headrail') ||
    name.includes('head rail') ||
    name.includes('control system') ||
    name.includes('chain length') ||
    name.includes('chain') ||
    name.includes('motor') ||
    name.includes('remote') ||
    // Roller/Zebra/Venetian hardware
    name.includes('bottom rail') ||
    name.includes('fascia') ||
    name.includes('cassette') ||
    name.includes('valance')
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
 * UNIVERSAL: Returns appropriate group names for all treatment types
 */
export function getGroupName(items: BreakdownItem[]): string {
  const mainItem = items.find(item => isMainHardwareItem(item));
  
  if (mainItem) {
    const name = (mainItem.name || '').toLowerCase();
    const optionKey = (mainItem.optionKey || mainItem.id || '').toLowerCase();
    
    // Curtain hardware
    if (name.includes('track') || optionKey.includes('track')) return 'Track & Hardware';
    if (name.includes('rod') || optionKey.includes('rod')) return 'Rod & Hardware';
    if (name.includes('pole') || optionKey.includes('pole')) return 'Pole & Hardware';
    
    // Roman Blind hardware
    if (name.includes('headrail') || name.includes('head rail') || 
        optionKey.includes('headrail') || optionKey.includes('head_rail')) {
      // Check if motorised
      const hasMotor = items.some(i => 
        (i.name || '').toLowerCase().includes('motor') || 
        (i.optionKey || i.id || '').toLowerCase().includes('motor')
      );
      return hasMotor ? 'Motorised System' : 'Headrail & Control';
    }
    
    // Roller/Zebra/Venetian hardware  
    if (name.includes('cassette') || optionKey.includes('cassette')) return 'Cassette & Hardware';
    if (name.includes('fascia') || optionKey.includes('fascia')) return 'Fascia & Hardware';
    if (name.includes('bottom rail') || optionKey.includes('bottom_rail')) return 'Rails & Hardware';
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
 * UNIVERSAL: Recognizes main hardware items for all treatment types
 */
export function isMainHardwareItem(item: BreakdownItem): boolean {
  const category = (item.category || '').toLowerCase();
  const optionKey = (item.optionKey || item.id || '').toLowerCase();
  const name = (item.name || '').toLowerCase();
  
  // Accessories have their own category - never main item
  if (category === 'hardware_accessory') {
    return false;
  }
  
  // Curtain hardware - Track/Rod selections are main items
  if (
    optionKey.includes('track_selection') ||
    optionKey.includes('rod_selection') ||
    optionKey === 'track' ||
    optionKey === 'rod' ||
    optionKey === 'pole'
  ) {
    return true;
  }
  
  // Roman Blind hardware - Headrail is the main item
  if (
    optionKey === 'headrail' ||
    optionKey === 'head_rail' ||
    name.includes('headrail') ||
    name.includes('head rail')
  ) {
    return true;
  }
  
  // Roller/Zebra/Venetian hardware - Cassette/Fascia/Bottom Rail are main items
  if (
    optionKey === 'cassette' ||
    optionKey === 'fascia' ||
    optionKey === 'bottom_rail' ||
    name.includes('cassette') ||
    name.includes('fascia')
  ) {
    return true;
  }
  
  // Hardware category is main item
  if (category === 'hardware') {
    return true;
  }
  
  return false;
}
