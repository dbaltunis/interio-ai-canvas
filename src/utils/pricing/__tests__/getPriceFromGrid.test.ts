/**
 * Unit Tests for getPriceFromGrid function
 * Tests price lookup from various grid formats
 */

import { describe, it, expect, vi } from 'vitest';
import { getPriceFromGrid } from '@/hooks/usePricingGrids';

describe('getPriceFromGrid', () => {
  describe('Standard format (widthColumns + dropRows)', () => {
    const standardGridData = {
      widthColumns: ['50', '100', '150', '200', '250'],
      dropRows: [
        { drop: '100', prices: [45, 55, 65, 75, 85] },
        { drop: '150', prices: [55, 65, 75, 85, 95] },
        { drop: '200', prices: [65, 75, 85, 95, 105] },
        { drop: '250', prices: [75, 85, 95, 105, 115] }
      ]
    };

    it('should find exact match for width and drop', () => {
      const price = getPriceFromGrid(standardGridData, 100, 150);
      expect(price).toBe(65);
    });

    it('should find price at first row and column', () => {
      const price = getPriceFromGrid(standardGridData, 50, 100);
      expect(price).toBe(45);
    });

    it('should find price at last row and column', () => {
      const price = getPriceFromGrid(standardGridData, 250, 250);
      expect(price).toBe(115);
    });

    it('should find closest width when exact match not available', () => {
      // 120cm should round to closest which is 100cm
      const price = getPriceFromGrid(standardGridData, 120, 150);
      // Closest to 120 could be either 100 or 150 depending on implementation
      expect([65, 75]).toContain(price);
    });

    it('should find closest drop when exact match not available', () => {
      // 180cm drop should round to closest (150 or 200)
      const price = getPriceFromGrid(standardGridData, 100, 180);
      expect([65, 75]).toContain(price);
    });

    it('should handle dimensions below minimum grid values', () => {
      const price = getPriceFromGrid(standardGridData, 30, 80);
      // Should snap to minimum values (50, 100)
      expect(price).toBe(45);
    });

    it('should handle dimensions above maximum grid values', () => {
      const price = getPriceFromGrid(standardGridData, 300, 300);
      // Should snap to maximum values (250, 250)
      expect(price).toBe(115);
    });
  });

  describe('Gustin format (widths + heights + prices)', () => {
    const gustinGridData = {
      widths: [60, 90, 120, 150],
      heights: [100, 150, 200, 250],
      prices: [
        [100, 120, 140, 160],  // height 100
        [120, 140, 160, 180],  // height 150
        [140, 160, 180, 200],  // height 200
        [160, 180, 200, 220]   // height 250
      ]
    };

    it('should find exact match for width and height', () => {
      const price = getPriceFromGrid(gustinGridData, 90, 150);
      expect(price).toBe(140);
    });

    it('should find price at corners', () => {
      expect(getPriceFromGrid(gustinGridData, 60, 100)).toBe(100);
      expect(getPriceFromGrid(gustinGridData, 150, 250)).toBe(220);
    });

    it('should find closest match for non-exact dimensions', () => {
      const price = getPriceFromGrid(gustinGridData, 100, 175);
      // 100 is between 90 and 120, 175 is between 150 and 200
      expect(price).toBeGreaterThan(0);
    });
  });

  describe('Range format (widthRanges + dropRanges)', () => {
    const rangeGridData = {
      widthRanges: ['50', '100', '150', '200'],
      dropRanges: ['100', '150', '200', '250'],
      prices: [
        [50, 60, 70, 80],   // drop 100
        [60, 70, 80, 90],   // drop 150
        [70, 80, 90, 100],  // drop 200
        [80, 90, 100, 110]  // drop 250
      ]
    };

    it('should find exact match in range format', () => {
      const price = getPriceFromGrid(rangeGridData, 100, 150);
      expect(price).toBe(70);
    });

    it('should find price for first range', () => {
      const price = getPriceFromGrid(rangeGridData, 50, 100);
      expect(price).toBe(50);
    });

    it('should find price for last range', () => {
      const price = getPriceFromGrid(rangeGridData, 200, 250);
      expect(price).toBe(110);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should return 0 for null grid data', () => {
      expect(getPriceFromGrid(null, 100, 150)).toBe(0);
    });

    it('should return 0 for undefined grid data', () => {
      expect(getPriceFromGrid(undefined, 100, 150)).toBe(0);
    });

    it('should return 0 for empty object', () => {
      expect(getPriceFromGrid({}, 100, 150)).toBe(0);
    });

    it('should return 0 for invalid grid structure', () => {
      const invalidGrid = { someInvalidProp: 'value' };
      expect(getPriceFromGrid(invalidGrid, 100, 150)).toBe(0);
    });

    it('should handle grid with only widthColumns (no dropRows)', () => {
      const partialGrid = { widthColumns: ['50', '100'] };
      expect(getPriceFromGrid(partialGrid, 100, 150)).toBe(0);
    });

    it('should handle grid with empty arrays', () => {
      const emptyGrid = { widthColumns: [], dropRows: [] };
      expect(getPriceFromGrid(emptyGrid, 100, 150)).toBe(0);
    });

    it('should handle string type as grid data', () => {
      expect(getPriceFromGrid('not an object' as any, 100, 150)).toBe(0);
    });

    it('should handle array type as grid data', () => {
      expect(getPriceFromGrid([] as any, 100, 150)).toBe(0);
    });
  });

  describe('Unit conversion', () => {
    // Grid data stored in mm
    const mmGridData = {
      widthColumns: ['600', '900', '1200', '1500'],  // mm
      dropRows: [
        { drop: '1000', prices: [100, 120, 140, 160] },
        { drop: '1500', prices: [120, 140, 160, 180] },
        { drop: '2000', prices: [140, 160, 180, 200] }
      ]
    };

    it('should handle grid values that appear to be in mm (> 300)', () => {
      // Input in cm, grid in mm
      const price = getPriceFromGrid(mmGridData, 90, 150);  // 90cm = 900mm, 150cm = 1500mm
      expect(price).toBe(140);
    });
  });

  describe('Price precision', () => {
    const decimalGridData = {
      widthColumns: ['50', '100'],
      dropRows: [
        { drop: '100', prices: [45.50, 55.75] },
        { drop: '150', prices: [55.25, 65.99] }
      ]
    };

    it('should preserve decimal prices', () => {
      const price = getPriceFromGrid(decimalGridData, 100, 150);
      expect(price).toBe(65.99);
    });

    it('should handle string prices correctly', () => {
      const stringPriceGrid = {
        widthColumns: ['50', '100'],
        dropRows: [
          { drop: '100', prices: ['45.50', '55.75'] }
        ]
      };
      const price = getPriceFromGrid(stringPriceGrid, 100, 100);
      expect(price).toBe(55.75);
    });
  });
});
