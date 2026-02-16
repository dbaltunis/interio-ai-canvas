export const FINDER_COLORS = [
  { key: 'red', hex: '#FF3B30', label: 'Red' },
  { key: 'orange', hex: '#FF9500', label: 'Orange' },
  { key: 'yellow', hex: '#FFCC00', label: 'Yellow' },
  { key: 'green', hex: '#34C759', label: 'Green' },
  { key: 'blue', hex: '#007AFF', label: 'Blue' },
  { key: 'purple', hex: '#AF52DE', label: 'Purple' },
  { key: 'gray', hex: '#8E8E93', label: 'Gray' },
] as const;

export type FinderColorKey = typeof FINDER_COLORS[number]['key'];

export const getFinderColor = (key: string | null | undefined) => {
  return FINDER_COLORS.find(c => c.key === key);
};
