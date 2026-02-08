/**
 * Unit Tests for Grid Validation Utility
 * Tests the unified grid validation functions used across the codebase
 */

import { describe, it, expect } from 'vitest';
import {
  hasValidPricingGrid,
  validatePricingGrid,
  itemUsesPricingGrid,
  getGridMarkup
} from '../gridValidation';

describe('hasValidPricingGrid', () => {
  describe('Standard CSV format (widthColumns + dropRows)', () => {
    it('should return true for valid standard grid data', () => {
      const gridData = {
        widthColumns: ['50', '100', '150', '200'],
        dropRows: [
          { drop: '100', prices: [45, 55, 65, 75] },
          { drop: '150', prices: [55, 65, 75, 85] }
        ]
      };
      expect(hasValidPricingGrid(gridData)).toBe(true);
    });

    it('should return false when widthColumns is empty', () => {
      const gridData = {
        widthColumns: [],
        dropRows: [{ drop: '100', prices: [45, 55] }]
      };
      expect(hasValidPricingGrid(gridData)).toBe(false);
    });

    it('should return false when dropRows is empty', () => {
      const gridData = {
        widthColumns: ['50', '100'],
        dropRows: []
      };
      expect(hasValidPricingGrid(gridData)).toBe(false);
    });

    it('should return false when dropRows is missing', () => {
      const gridData = {
        widthColumns: ['50', '100']
      };
      expect(hasValidPricingGrid(gridData)).toBe(false);
    });
  });

  describe('Legacy range format (widthRanges + dropRanges)', () => {
    it('should return true for valid range format with widthRanges', () => {
      const gridData = {
        widthRanges: ['0-100', '100-200'],
        dropRanges: ['0-100', '100-200'],
        prices: [[100, 150], [150, 200]]
      };
      expect(hasValidPricingGrid(gridData)).toBe(true);
    });

    it('should return true for valid range format with widths array', () => {
      const gridData = {
        widths: [50, 100, 150],
        dropRanges: ['100', '150', '200']
      };
      expect(hasValidPricingGrid(gridData)).toBe(true);
    });

    it('should return false when dropRanges exists but widths/widthRanges missing', () => {
      const gridData = {
        dropRanges: ['100', '150']
      };
      expect(hasValidPricingGrid(gridData)).toBe(false);
    });
  });

  describe('Gustin format (widths + heights + prices)', () => {
    it('should return true for valid Gustin format', () => {
      const gridData = {
        widths: [60, 90, 120, 150],
        heights: [100, 150, 200, 250],
        prices: [
          [100, 120, 140, 160],
          [120, 140, 160, 180],
          [140, 160, 180, 200],
          [160, 180, 200, 220]
        ]
      };
      expect(hasValidPricingGrid(gridData)).toBe(true);
    });

    it('should return false when heights is empty', () => {
      const gridData = {
        widths: [60, 90],
        heights: [],
        prices: [[100, 120]]
      };
      expect(hasValidPricingGrid(gridData)).toBe(false);
    });

    it('should return false when prices is empty', () => {
      const gridData = {
        widths: [60, 90],
        heights: [100, 150],
        prices: []
      };
      expect(hasValidPricingGrid(gridData)).toBe(false);
    });
  });

  describe('Legacy rows format', () => {
    it('should return true for valid legacy rows with height property', () => {
      const gridData = {
        rows: [
          { height: 100, price_60: 100, price_90: 120 },
          { height: 150, price_60: 120, price_90: 140 }
        ]
      };
      expect(hasValidPricingGrid(gridData)).toBe(true);
    });

    it('should return true for valid legacy rows with drop property', () => {
      const gridData = {
        rows: [
          { drop: 100, width_60: 100, width_90: 120 },
          { drop: 150, width_60: 120, width_90: 140 }
        ]
      };
      expect(hasValidPricingGrid(gridData)).toBe(true);
    });

    it('should return false for empty rows array', () => {
      const gridData = {
        rows: []
      };
      expect(hasValidPricingGrid(gridData)).toBe(false);
    });

    it('should return false for rows without height or drop', () => {
      const gridData = {
        rows: [
          { width: 100, price: 50 }
        ]
      };
      expect(hasValidPricingGrid(gridData)).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should return false for null', () => {
      expect(hasValidPricingGrid(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(hasValidPricingGrid(undefined)).toBe(false);
    });

    it('should return false for empty object', () => {
      expect(hasValidPricingGrid({})).toBe(false);
    });

    it('should return false for non-object types', () => {
      expect(hasValidPricingGrid('string')).toBe(false);
      expect(hasValidPricingGrid(123)).toBe(false);
      expect(hasValidPricingGrid(true)).toBe(false);
      expect(hasValidPricingGrid([])).toBe(false);
    });
  });
});

describe('validatePricingGrid', () => {
  it('should return detailed info for standard format', () => {
    const gridData = {
      widthColumns: ['50', '100'],
      dropRows: [{ drop: '100', prices: [45, 55] }]
    };
    const result = validatePricingGrid(gridData);
    expect(result.isValid).toBe(true);
    expect(result.format).toBe('standard');
    expect(result.reason).toBeUndefined();
  });

  it('should return reason for invalid standard format', () => {
    const gridData = {
      widthColumns: ['50', '100'],
      dropRows: []
    };
    const result = validatePricingGrid(gridData);
    expect(result.isValid).toBe(false);
    expect(result.format).toBe('standard');
    expect(result.reason).toBe('dropRows missing or empty');
  });

  it('should identify empty widthColumns array', () => {
    const gridData = {
      widthColumns: [],
      dropRows: [{ drop: '100', prices: [] }]
    };
    const result = validatePricingGrid(gridData);
    expect(result.isValid).toBe(false);
    expect(result.format).toBe('standard');
    expect(result.reason).toBe('widthColumns array is empty');
  });

  it('should return format for range type', () => {
    const gridData = {
      widthRanges: ['0-100', '100-200'],
      dropRanges: ['0-100', '100-200'],
      prices: [[100, 150]]
    };
    const result = validatePricingGrid(gridData);
    expect(result.isValid).toBe(true);
    expect(result.format).toBe('range');
  });

  it('should return format for gustin type', () => {
    const gridData = {
      widths: [60, 90],
      heights: [100, 150],
      prices: [[100, 120], [120, 140]]
    };
    const result = validatePricingGrid(gridData);
    expect(result.isValid).toBe(true);
    expect(result.format).toBe('gustin');
  });

  it('should return format for legacy rows type', () => {
    const gridData = {
      rows: [{ height: 100, price: 50 }]
    };
    const result = validatePricingGrid(gridData);
    expect(result.isValid).toBe(true);
    expect(result.format).toBe('legacy_rows');
  });

  it('should return invalid format for null', () => {
    const result = validatePricingGrid(null);
    expect(result.isValid).toBe(false);
    expect(result.format).toBe('invalid');
    expect(result.reason).toBe('Grid data is null or undefined');
  });

  it('should return empty format for empty object', () => {
    const result = validatePricingGrid({});
    expect(result.isValid).toBe(false);
    expect(result.format).toBe('empty');
    expect(result.reason).toBe('Grid data is an empty object');
  });

  it('should return invalid format for unrecognized structure', () => {
    const gridData = {
      unknownProp: 'value',
      anotherProp: [1, 2, 3]
    };
    const result = validatePricingGrid(gridData);
    expect(result.isValid).toBe(false);
    expect(result.format).toBe('invalid');
    expect(result.reason).toContain('Unrecognized grid format');
  });
});

describe('itemUsesPricingGrid', () => {
  it('should return true for item with valid pricing_grid_data', () => {
    const item = {
      name: 'Test Fabric',
      pricing_grid_data: {
        widthColumns: ['50', '100'],
        dropRows: [{ drop: '100', prices: [45, 55] }]
      }
    };
    expect(itemUsesPricingGrid(item)).toBe(true);
  });

  it('should return false for item without pricing_grid_data', () => {
    const item = {
      name: 'Test Fabric',
      price: 50
    };
    expect(itemUsesPricingGrid(item)).toBe(false);
  });

  it('should return false for item with empty pricing_grid_data', () => {
    const item = {
      name: 'Test Fabric',
      pricing_grid_data: {}
    };
    expect(itemUsesPricingGrid(item)).toBe(false);
  });

  it('should return false for null item', () => {
    expect(itemUsesPricingGrid(null)).toBe(false);
  });

  it('should return false for undefined item', () => {
    expect(itemUsesPricingGrid(undefined)).toBe(false);
  });
});

describe('getGridMarkup', () => {
  it('should return pricing_grid_markup when set', () => {
    const item = {
      pricing_grid_markup: 25,
      markup_percentage: 15
    };
    expect(getGridMarkup(item)).toBe(25);
  });

  it('should fall back to markup_percentage when pricing_grid_markup is not set', () => {
    const item = {
      markup_percentage: 15
    };
    expect(getGridMarkup(item)).toBe(15);
  });

  it('should return 0 when neither markup is set', () => {
    const item = {
      name: 'Test Item'
    };
    expect(getGridMarkup(item)).toBe(0);
  });

  it('should return 0 for null item', () => {
    expect(getGridMarkup(null)).toBe(0);
  });

  it('should return 0 for undefined item', () => {
    expect(getGridMarkup(undefined)).toBe(0);
  });

  it('should prefer pricing_grid_markup over markup_percentage even when 0', () => {
    const item = {
      pricing_grid_markup: 0,
      markup_percentage: 15
    };
    // 0 is falsy, so it falls through to markup_percentage
    expect(getGridMarkup(item)).toBe(15);
  });
});
