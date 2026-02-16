// Color schemes for curtain-professional quote templates
export interface QuoteColorScheme {
  id: string;
  name: string;
  // Primary accent (table headers, borders, section dividers)
  primary: string;
  // Dark text color for headings
  headingText: string;
  // Medium text for secondary content
  secondaryText: string;
  // Light border/separator color
  border: string;
  // Lighter border for dashes
  borderLight: string;
  // Very light background for image placeholders etc.
  surfaceLight: string;
  // Default page background
  pageBackground: string;
  // Preview swatch colors for the selector
  swatchColors: [string, string, string];
}

export const QUOTE_COLOR_SCHEMES: QuoteColorScheme[] = [
  {
    id: 'warm-brown',
    name: 'Warm Brown',
    primary: '#8b7355',
    headingText: '#3d2e1f',
    secondaryText: '#6b5c4c',
    border: '#d4c5b0',
    borderLight: '#c4b5a0',
    surfaceLight: '#f0ebe3',
    pageBackground: '#faf6f1',
    swatchColors: ['#8b7355', '#faf6f1', '#d4c5b0'],
  },
  {
    id: 'modern-navy',
    name: 'Modern Navy',
    primary: '#2c4a6e',
    headingText: '#1a2a3a',
    secondaryText: '#4a6580',
    border: '#b8cce0',
    borderLight: '#a8bdd4',
    surfaceLight: '#edf2f7',
    pageBackground: '#f7f9fc',
    swatchColors: ['#2c4a6e', '#f7f9fc', '#b8cce0'],
  },
  {
    id: 'classic-charcoal',
    name: 'Classic Charcoal',
    primary: '#4a4a4a',
    headingText: '#1a1a1a',
    secondaryText: '#666666',
    border: '#d0d0d0',
    borderLight: '#c0c0c0',
    surfaceLight: '#f0f0f0',
    pageBackground: '#f8f8f8',
    swatchColors: ['#4a4a4a', '#f8f8f8', '#d0d0d0'],
  },
];

export const getColorScheme = (schemeId?: string): QuoteColorScheme => {
  return QUOTE_COLOR_SCHEMES.find(s => s.id === schemeId) || QUOTE_COLOR_SCHEMES[0];
};
