/**
 * Converts common color names to hex values
 * Supports CSS color names plus common fabric/material color names
 */

const COLOR_NAME_MAP: Record<string, string> = {
  // Standard CSS colors
  white: '#FFFFFF',
  black: '#000000',
  red: '#FF0000',
  green: '#008000',
  blue: '#0000FF',
  yellow: '#FFFF00',
  orange: '#FFA500',
  purple: '#800080',
  pink: '#FFC0CB',
  brown: '#A52A2A',
  gray: '#808080',
  grey: '#808080',
  
  // Common fabric/material colors
  navy: '#001F3F',
  ivory: '#FFFFF0',
  cream: '#FFFDD0',
  beige: '#F5F5DC',
  tan: '#D2B48C',
  gold: '#FFD700',
  silver: '#C0C0C0',
  charcoal: '#36454F',
  slate: '#708090',
  taupe: '#483C32',
  burgundy: '#800020',
  maroon: '#800000',
  teal: '#008080',
  turquoise: '#40E0D0',
  coral: '#FF7F50',
  salmon: '#FA8072',
  peach: '#FFCBA4',
  lavender: '#E6E6FA',
  lilac: '#C8A2C8',
  mint: '#98FF98',
  olive: '#808000',
  khaki: '#C3B091',
  sand: '#C2B280',
  stone: '#928E85',
  pewter: '#8E9196',
  bronze: '#CD7F32',
  copper: '#B87333',
  rust: '#B7410E',
  wine: '#722F37',
  plum: '#8E4585',
  eggplant: '#614051',
  chocolate: '#7B3F00',
  espresso: '#3C2218',
  walnut: '#5D432C',
  oak: '#806517',
  maple: '#C9A959',
  ash: '#B2BEB5',
  birch: '#F5F5DC',
  mahogany: '#C04000',
  cherry: '#DE3163',
  cedar: '#A0522D',
  pine: '#01796F',
  
  // Whites and off-whites
  snowwhite: '#FFFAFA',
  offwhite: '#FAF9F6',
  pearl: '#F0EAD6',
  linen: '#FAF0E6',
  eggshell: '#F0EAD6',
  alabaster: '#EDEAE0',
  bone: '#E3DAC9',
  
  // Grays
  lightgray: '#D3D3D3',
  darkgray: '#A9A9A9',
  dimgray: '#696969',
  graphite: '#383838',
  steel: '#71797E',
  iron: '#48494B',
  
  // Blues
  skyblue: '#87CEEB',
  lightblue: '#ADD8E6',
  darkblue: '#00008B',
  royalblue: '#4169E1',
  cobalt: '#0047AB',
  sapphire: '#0F52BA',
  indigo: '#4B0082',
  midnight: '#191970',
  denim: '#1560BD',
  ocean: '#006994',
  
  // Greens
  sage: '#9DC183',
  moss: '#8A9A5B',
  forest: '#228B22',
  hunter: '#355E3B',
  emerald: '#50C878',
  jade: '#00A86B',
  seafoam: '#93E9BE',
  
  // Neutrals
  mushroom: '#BAA78F',
  oatmeal: '#D1C7B5',
  natural: '#E5D3B3',
  wheat: '#F5DEB3',
  camel: '#C19A6B',
  fawn: '#E5AA70',
  mocha: '#967117',
  cocoa: '#D2691E',
  coffee: '#6F4E37',
};

/**
 * Check if a string is a valid hex color
 */
export const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * Check if a string is a valid CSS color (hex, rgb, hsl, or named)
 */
export const isValidCssColor = (color: string): boolean => {
  if (!color) return false;
  
  // Check hex
  if (isValidHexColor(color)) return true;
  
  // Check rgb/rgba
  if (/^rgba?\([\d\s,%.]+\)$/i.test(color)) return true;
  
  // Check hsl/hsla
  if (/^hsla?\([\d\s,%.]+\)$/i.test(color)) return true;
  
  // Check named color
  const normalized = color.toLowerCase().replace(/[\s-_]/g, '');
  return normalized in COLOR_NAME_MAP;
};

/**
 * Convert a color name to hex value
 * Returns the original string if it's already a valid hex/css color
 * Returns null if the color cannot be converted
 */
export const colorNameToHex = (colorName: string | null | undefined): string | null => {
  if (!colorName) return null;
  
  const trimmed = colorName.trim();
  
  // Already a hex color
  if (isValidHexColor(trimmed)) {
    return trimmed.toUpperCase();
  }
  
  // Try to match in our color map
  const normalized = trimmed.toLowerCase().replace(/[\s-_]/g, '');
  
  if (normalized in COLOR_NAME_MAP) {
    return COLOR_NAME_MAP[normalized];
  }
  
  // Try partial match (e.g., "Light Blue" -> "lightblue")
  for (const [name, hex] of Object.entries(COLOR_NAME_MAP)) {
    if (normalized.includes(name) || name.includes(normalized)) {
      return hex;
    }
  }
  
  return null;
};

/**
 * Get a contrasting text color (black or white) for a given background color
 */
export const getContrastingTextColor = (hexColor: string | null): string => {
  if (!hexColor) return '#000000';
  
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

/**
 * Generate a gradient from a base color for visual interest
 */
export const generateColorGradient = (hexColor: string | null): string => {
  if (!hexColor) return 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground) / 0.2) 100%)';
  
  // Create a subtle gradient using the color
  return `linear-gradient(135deg, ${hexColor} 0%, ${hexColor}DD 50%, ${hexColor}BB 100%)`;
};
