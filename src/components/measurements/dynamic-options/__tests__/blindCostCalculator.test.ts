/**
 * Unit Tests for Blind Cost Calculator
 * Tests the calculateBlindCosts function
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateBlindCosts, isBlindCategory } from '../utils/blindCostCalculator';

// Mock dependencies
vi.mock('@/hooks/usePricingGrids', () => ({
  getPriceFromGrid: vi.fn((gridData, width, height) => {
    if (!gridData || !gridData.widthColumns) return 0;
    // Simple mock: return sum of width and height as price
    return width + height;
  })
}));

vi.mock('@/utils/blindCalculationDefaults', () => ({
  getBlindHemDefaults: vi.fn(() => ({
    headerHemCm: 8,
    bottomHemCm: 10,
    sideHemCm: 4,
    wastePercent: 0
  })),
  calculateBlindSqm: vi.fn((width, height, hems) => {
    const effectiveWidthCm = width + (hems.sideHemCm * 2);
    const effectiveHeightCm = height + hems.headerHemCm + hems.bottomHemCm;
    const sqm = (effectiveWidthCm * effectiveHeightCm) / 10000;
    return {
      sqm,
      effectiveWidthCm,
      effectiveHeightCm,
      widthCalcNote: `${width} + ${hems.sideHemCm}*2 = ${effectiveWidthCm}`,
      heightCalcNote: `${height} + ${hems.headerHemCm} + ${hems.bottomHemCm} = ${effectiveHeightCm}`
    };
  }),
  logBlindCalculation: vi.fn()
}));

vi.mock('@/utils/treatmentTypeUtils', () => ({
  isManufacturedItem: vi.fn((category) => {
    const blindTypes = ['roller_blinds', 'venetian_blinds', 'vertical_blinds', 'roman_blind'];
    return blindTypes.includes(category?.toLowerCase().replace(/ /g, '_'));
  }),
  inferCategoryFromName: vi.fn((name) => {
    if (name?.toLowerCase().includes('roller')) return 'roller_blinds';
    if (name?.toLowerCase().includes('venetian')) return 'venetian_blinds';
    return null;
  })
}));

vi.mock('@/utils/pricing/gridValidation', () => ({
  hasValidPricingGrid: vi.fn((gridData) => {
    return gridData &&
           typeof gridData === 'object' &&
           Object.keys(gridData).length > 0 &&
           gridData.widthColumns &&
           Array.isArray(gridData.widthColumns) &&
           gridData.widthColumns.length > 0;
  }),
  getGridMarkup: vi.fn((item) => item?.pricing_grid_markup || item?.markup_percentage || 0)
}));

describe('calculateBlindCosts', () => {
  const mockTemplate = {
    name: 'Roller Blind Template',
    treatment_category: 'roller_blinds',
    blind_header_hem_cm: 8,
    blind_bottom_hem_cm: 10,
    blind_side_hem_cm: 4,
    waste_percent: 0
  };

  describe('Basic calculations with per-sqm pricing', () => {
    it('should calculate fabric cost based on sqm', () => {
      const fabric = {
        name: 'Test Fabric',
        price_per_sqm: 50
      };

      const result = calculateBlindCosts(100, 150, mockTemplate, fabric, []);

      // 100cm x 150cm with hems = 108cm x 168cm = 1.8144 sqm
      expect(result.squareMeters).toBeCloseTo(1.81, 1);
      expect(result.fabricCost).toBeCloseTo(90.72, 0); // 1.8144 * 50
    });

    it('should use cost_price when available', () => {
      const fabric = {
        name: 'Library Fabric',
        cost_price: 30,
        selling_price: 50
      };

      const result = calculateBlindCosts(100, 150, mockTemplate, fabric, []);

      // Should use cost_price (30) not selling_price (50)
      expect(result.fabricCost).toBeCloseTo(54.43, 0); // 1.8144 * 30
    });

    it('should return 0 fabric cost when no fabric provided', () => {
      const result = calculateBlindCosts(100, 150, mockTemplate, null, []);

      expect(result.fabricCost).toBe(0);
    });
  });

  describe('Pricing grid handling', () => {
    it('should use pricing grid when fabric has valid grid data', () => {
      const fabricWithGrid = {
        name: 'Grid Fabric',
        pricing_grid_data: {
          widthColumns: ['50', '100', '150'],
          dropRows: [
            { drop: '100', prices: [100, 150, 200] },
            { drop: '150', prices: [150, 200, 250] }
          ]
        }
      };

      const result = calculateBlindCosts(100, 150, mockTemplate, fabricWithGrid, []);

      // Grid price is mocked to return width + height
      expect(result.fabricCost).toBe(250); // 100 + 150
      // When fabric has grid, manufacturing should be 0
      expect(result.manufacturingCost).toBe(0);
    });

    it('should NOT apply grid markup in calculator (markup applied in display/save layer)', () => {
      // CRITICAL: Grid markup is now applied in the display/save layer (CostCalculationSummary/DynamicWindowWorksheet)
      // NOT in blindCostCalculator. This prevents double-markup issues.
      const fabricWithGridAndMarkup = {
        name: 'Grid Fabric With Markup',
        pricing_grid_data: {
          widthColumns: ['50', '100'],
          dropRows: [{ drop: '100', prices: [100, 150] }]
        },
        pricing_grid_markup: 20 // 20% markup - stored but NOT applied here
      };

      const result = calculateBlindCosts(100, 150, mockTemplate, fabricWithGridAndMarkup, []);

      // Grid price = 250 (base cost from grid lookup)
      // Markup is NOT applied here - it will be applied in display/save layer
      expect(result.fabricCost).toBe(250);
    });
  });

  describe('Manufacturing cost calculation', () => {
    it('should set manufacturing to 0 when fabric has pricing grid', () => {
      const fabricWithGrid = {
        name: 'Grid Fabric',
        pricing_grid_data: {
          widthColumns: ['50', '100'],
          dropRows: [{ drop: '100', prices: [100, 150] }]
        }
      };

      const result = calculateBlindCosts(100, 150, mockTemplate, fabricWithGrid, []);

      expect(result.manufacturingCost).toBe(0);
    });

    it('should use template manufacturing grid when fabric has no grid', () => {
      const templateWithMfgGrid = {
        ...mockTemplate,
        pricing_type: 'pricing_grid',
        pricing_grid_data: {
          widthColumns: ['50', '100', '150'],
          dropRows: [{ drop: '100', prices: [50, 75, 100] }]
        }
      };

      const fabric = {
        name: 'Simple Fabric',
        price_per_sqm: 30
      };

      const result = calculateBlindCosts(100, 150, templateWithMfgGrid, fabric, []);

      // Manufacturing grid price = 100 + 150 = 250
      expect(result.manufacturingCost).toBe(250);
    });

    it('should use machine_price_per_panel as fallback', () => {
      const templateWithPanelPrice = {
        ...mockTemplate,
        machine_price_per_panel: 100
      };

      const fabric = {
        name: 'Simple Fabric',
        price_per_sqm: 30
      };

      const result = calculateBlindCosts(100, 150, templateWithPanelPrice, fabric, []);

      expect(result.manufacturingCost).toBe(100);
    });
  });

  describe('Double configuration', () => {
    const measurements = { curtain_type: 'double' };

    it('should double square meters for double config', () => {
      const fabric = {
        name: 'Test Fabric',
        price_per_sqm: 50
      };

      const singleResult = calculateBlindCosts(100, 150, mockTemplate, fabric, []);
      const doubleResult = calculateBlindCosts(100, 150, mockTemplate, fabric, [], measurements);

      expect(doubleResult.squareMeters).toBeCloseTo(singleResult.squareMeters * 2, 1);
    });

    it('should double fabric cost for double config', () => {
      const fabric = {
        name: 'Test Fabric',
        price_per_sqm: 50
      };

      const singleResult = calculateBlindCosts(100, 150, mockTemplate, fabric, []);
      const doubleResult = calculateBlindCosts(100, 150, mockTemplate, fabric, [], measurements);

      expect(doubleResult.fabricCost).toBeCloseTo(singleResult.fabricCost * 2, 0);
    });

    it('should double grid price for double config', () => {
      const fabricWithGrid = {
        name: 'Grid Fabric',
        pricing_grid_data: {
          widthColumns: ['50', '100'],
          dropRows: [{ drop: '100', prices: [100, 150] }]
        }
      };

      const singleResult = calculateBlindCosts(100, 150, mockTemplate, fabricWithGrid, []);
      const doubleResult = calculateBlindCosts(100, 150, mockTemplate, fabricWithGrid, [], measurements);

      expect(doubleResult.fabricCost).toBe(singleResult.fabricCost * 2);
    });
  });

  describe('Options pricing', () => {
    const fabric = {
      name: 'Test Fabric',
      price_per_sqm: 50
    };

    it('should calculate fixed price options', () => {
      const options = [
        { name: 'Motor', price: 150, pricingMethod: 'fixed' }
      ];

      const result = calculateBlindCosts(100, 150, mockTemplate, fabric, options);

      expect(result.optionsCost).toBe(150);
      expect(result.optionDetails).toHaveLength(1);
      expect(result.optionDetails[0].cost).toBe(150);
    });

    it('should calculate per-meter options', () => {
      const options = [
        { name: 'Bottom Weight', price: 10, pricingMethod: 'per-meter' }
      ];

      const result = calculateBlindCosts(100, 150, mockTemplate, fabric, options);

      // 100cm = 1m, price per meter = 10
      expect(result.optionsCost).toBe(10);
    });

    it('should calculate per-sqm options', () => {
      const options = [
        { name: 'Special Coating', price: 20, pricingMethod: 'per-sqm' }
      ];

      const result = calculateBlindCosts(100, 150, mockTemplate, fabric, options);

      // sqm ≈ 1.81, price per sqm = 20
      expect(result.optionsCost).toBeCloseTo(36.29, 0); // 1.8144 * 20
    });

    it('should filter out lining options for blinds', () => {
      const options = [
        { name: 'Motor', price: 150, pricingMethod: 'fixed' },
        { name: 'Blackout Lining', price: 50, pricingMethod: 'per-sqm' }
      ];

      const result = calculateBlindCosts(100, 150, mockTemplate, fabric, options);

      // Only motor should be included
      expect(result.optionsCost).toBe(150);
      expect(result.optionDetails).toHaveLength(1);
    });

    it('should calculate per-panel options with blind multiplier', () => {
      const options = [
        { name: 'Cassette', price: 50, pricingMethod: 'per-panel' }
      ];

      const result = calculateBlindCosts(100, 150, mockTemplate, fabric, options);

      expect(result.optionsCost).toBe(50);

      // With double configuration
      const doubleResult = calculateBlindCosts(100, 150, mockTemplate, fabric, options, { curtain_type: 'double' });

      expect(doubleResult.optionsCost).toBe(100); // 50 * 2
    });

    it('should sum multiple options correctly', () => {
      const options = [
        { name: 'Motor', price: 150, pricingMethod: 'fixed' },
        { name: 'Remote', price: 30, pricingMethod: 'fixed' },
        { name: 'Bottom Weight', price: 10, pricingMethod: 'per-meter' }
      ];

      const result = calculateBlindCosts(100, 150, mockTemplate, fabric, options);

      // 150 + 30 + (10 * 1) = 190
      expect(result.optionsCost).toBe(190);
      expect(result.optionDetails).toHaveLength(3);
    });
  });

  describe('Total cost calculation', () => {
    it('should sum all costs correctly', () => {
      const fabric = {
        name: 'Test Fabric',
        price_per_sqm: 50
      };

      const templateWithMfg = {
        ...mockTemplate,
        machine_price_per_panel: 75
      };

      const options = [
        { name: 'Motor', price: 150, pricingMethod: 'fixed' }
      ];

      const result = calculateBlindCosts(100, 150, templateWithMfg, fabric, options);

      // Fabric (90.72) + Manufacturing (75) + Options (150) = 315.72
      expect(result.totalCost).toBeCloseTo(
        result.fabricCost + result.manufacturingCost + result.optionsCost,
        0
      );
    });
  });

  describe('Display text', () => {
    it('should generate correct display text for single blind', () => {
      const fabric = { name: 'Test', price_per_sqm: 50 };

      const result = calculateBlindCosts(100, 150, mockTemplate, fabric, []);

      expect(result.displayText).toContain('sqm');
      expect(result.displayText).not.toContain('2 blinds');
    });

    it('should generate correct display text for double blind', () => {
      const fabric = { name: 'Test', price_per_sqm: 50 };

      const result = calculateBlindCosts(100, 150, mockTemplate, fabric, [], { curtain_type: 'double' });

      expect(result.displayText).toContain('2 blinds');
    });
  });
});

describe('isBlindCategory', () => {
  it('should return true for roller_blinds', () => {
    expect(isBlindCategory('roller_blinds')).toBe(true);
  });

  it('should return true for venetian_blinds', () => {
    expect(isBlindCategory('venetian_blinds')).toBe(true);
  });

  it('should return true for vertical_blinds', () => {
    expect(isBlindCategory('vertical_blinds')).toBe(true);
  });

  it('should return false for curtains', () => {
    expect(isBlindCategory('curtains')).toBe(false);
  });

  it('should infer category from template name', () => {
    expect(isBlindCategory('unknown', 'My Roller Blind Template')).toBe(true);
  });

  it('should return false when category and name do not match blind types', () => {
    expect(isBlindCategory('unknown', 'Drapes Template')).toBe(false);
  });
});
