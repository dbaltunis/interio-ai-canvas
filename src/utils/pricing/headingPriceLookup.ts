/**
 * Heading-specific price lookup utility
 * 
 * When "Different prices by heading" is enabled in the template,
 * this function looks up the heading-specific price override.
 */

export interface HeadingPriceEntry {
  machine_price?: number;
  hand_price?: number;
  machine_available?: boolean;  // defaults to true if undefined
  hand_available?: boolean;     // defaults to true if undefined
}

export interface HeadingPrices {
  [headingId: string]: HeadingPriceEntry;
}

export interface PriceResolutionResult {
  price: number;
  source: 'heading_override' | 'pricing_method' | 'template_default' | 'none';
  headingId?: string;
}

export interface MethodAvailability {
  machineAvailable: boolean;
  handAvailable: boolean;
}

/**
 * Check which manufacturing methods are available for a heading
 */
export function getMethodAvailability(
  selectedHeadingId: string | undefined | null,
  headingPrices: HeadingPrices | undefined | null,
  templateOffersHandFinished: boolean = true
): MethodAvailability {
  // Default: both available if template offers hand-finished, otherwise only machine
  const defaultAvailability: MethodAvailability = {
    machineAvailable: true,
    handAvailable: templateOffersHandFinished
  };

  // If no heading selected or no heading prices, return defaults
  if (!selectedHeadingId || !headingPrices || !headingPrices[selectedHeadingId]) {
    return defaultAvailability;
  }

  const headingEntry = headingPrices[selectedHeadingId];

  return {
    // Default to true if not explicitly set to false
    machineAvailable: headingEntry.machine_available !== false,
    handAvailable: templateOffersHandFinished && headingEntry.hand_available !== false
  };
}

/**
 * Resolve the manufacturing price per meter for curtains
 * Priority:
 * 1. Heading-specific override (if heading is selected and has override)
 * 2. Pricing method price (if pricing method is selected)
 * 3. Template default price
 */
export function resolveManufacturingPrice(
  isHandFinished: boolean,
  selectedHeadingId: string | undefined | null,
  headingPrices: HeadingPrices | undefined | null,
  pricingMethodPrices: {
    machine_price_per_metre?: number;
    hand_price_per_metre?: number;
  } | undefined | null,
  templatePrices: {
    machine_price_per_metre?: number;
    hand_price_per_metre?: number;
  } | undefined | null
): PriceResolutionResult {
  const priceKey = isHandFinished ? 'hand_price' : 'machine_price';
  const priceKeyMethod = isHandFinished ? 'hand_price_per_metre' : 'machine_price_per_metre';

  // PRIORITY 1: Heading-specific override
  if (selectedHeadingId && headingPrices && headingPrices[selectedHeadingId]) {
    const headingPrice = headingPrices[selectedHeadingId][priceKey];
    if (headingPrice != null && headingPrice > 0) {
      console.log('✅ [HEADING_PRICE] Using heading-specific price:', {
        headingId: selectedHeadingId,
        priceKey,
        price: headingPrice,
      });
      return {
        price: headingPrice,
        source: 'heading_override',
        headingId: selectedHeadingId,
      };
    }
  }

  // PRIORITY 2: Pricing method price
  if (pricingMethodPrices) {
    const methodPrice = pricingMethodPrices[priceKeyMethod];
    if (methodPrice != null && methodPrice > 0) {
      return {
        price: methodPrice,
        source: 'pricing_method',
      };
    }
  }

  // PRIORITY 3: Template default price
  if (templatePrices) {
    const templatePrice = templatePrices[priceKeyMethod];
    if (templatePrice != null && templatePrice > 0) {
      return {
        price: templatePrice,
        source: 'template_default',
      };
    }
  }

  // No price found
  return {
    price: 0,
    source: 'none',
  };
}

/**
 * Simple helper to get manufacturing price (returns just the number)
 */
export function getManufacturingPrice(
  isHandFinished: boolean,
  selectedHeadingId: string | undefined | null,
  headingPrices: HeadingPrices | undefined | null,
  pricingMethodPrices: {
    machine_price_per_metre?: number;
    hand_price_per_metre?: number;
  } | undefined | null,
  templatePrices: {
    machine_price_per_metre?: number;
    hand_price_per_metre?: number;
  } | undefined | null
): number {
  return resolveManufacturingPrice(
    isHandFinished,
    selectedHeadingId,
    headingPrices,
    pricingMethodPrices,
    templatePrices
  ).price;
}
