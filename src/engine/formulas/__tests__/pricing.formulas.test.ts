/**
 * Pricing Formula Tests
 */

import { describe, it, expect } from 'vitest';
import {
  pricePerRunningMeter,
  pricePerSqm,
  priceFixed,
  pricePerDrop,
  pricePercentage,
  lookupGridPrice,
  applyMarkup,
  calculateGrossMargin,
  calculateImpliedMarkup,
  getProfitStatus,
  PricingGrid,
} from '../pricing.formulas';

describe('pricePerRunningMeter', () => {
  it('should multiply meters by price', () => {
    expect(pricePerRunningMeter(10, 25.50)).toBe(255);
  });

  it('should handle fractional meters', () => {
    expect(pricePerRunningMeter(3.75, 18)).toBe(67.5);
  });

  it('should return 0 for 0 meters', () => {
    expect(pricePerRunningMeter(0, 25)).toBe(0);
  });
});

describe('pricePerSqm', () => {
  it('should multiply sqm by price', () => {
    expect(pricePerSqm(2.5, 120)).toBe(300);
  });
});

describe('priceFixed', () => {
  it('should return the fixed price', () => {
    expect(priceFixed(99.99)).toBe(99.99);
  });
});

describe('pricePerDrop', () => {
  it('should find matching range and return price * quantity', () => {
    const ranges = [
      { minDrop: 0, maxDrop: 150, price: 100 },
      { minDrop: 151, maxDrop: 250, price: 150 },
      { minDrop: 251, maxDrop: 350, price: 200 },
    ];

    expect(pricePerDrop(120, ranges)).toBe(100);
    expect(pricePerDrop(200, ranges)).toBe(150);
    expect(pricePerDrop(300, ranges, 2)).toBe(400);
  });

  it('should return 0 if no range matches', () => {
    const ranges = [
      { minDrop: 0, maxDrop: 150, price: 100 },
    ];
    expect(pricePerDrop(200, ranges)).toBe(0);
  });
});

describe('pricePercentage', () => {
  it('should calculate percentage of base amount', () => {
    expect(pricePercentage(500, 10)).toBe(50);
    expect(pricePercentage(1000, 50)).toBe(500);
  });
});

describe('lookupGridPrice', () => {
  const grid: PricingGrid = {
    widthColumns: [100, 150, 200, 250],
    dropRows: [150, 200, 250, 300],
    prices: {
      '100_150': 50,
      '100_200': 65,
      '150_150': 70,
      '150_200': 85,
      '200_200': 110,
      '200_250': 130,
      '250_300': 180,
    },
  };

  it('should find exact match', () => {
    expect(lookupGridPrice(grid, 100, 150)).toBe(50);
    expect(lookupGridPrice(grid, 200, 200)).toBe(110);
  });

  it('should round UP to next grid step', () => {
    // 80cm width → rounds up to 100 column, 130cm drop → rounds up to 150 row
    expect(lookupGridPrice(grid, 80, 130)).toBe(50);
  });

  it('should return null if exceeds max grid dimension', () => {
    expect(lookupGridPrice(grid, 300, 150)).toBeNull(); // width exceeds max 250
    expect(lookupGridPrice(grid, 100, 350)).toBeNull(); // drop exceeds max 300
  });

  it('should return null for empty grid', () => {
    expect(lookupGridPrice({ widthColumns: [], dropRows: [], prices: {} }, 100, 100)).toBeNull();
  });

  it('should return null if price key not found in grid', () => {
    // 250_150 key doesn't exist in our test grid
    expect(lookupGridPrice(grid, 250, 150)).toBeNull();
  });
});

describe('applyMarkup', () => {
  it('should apply markup percentage', () => {
    expect(applyMarkup(100, 50)).toBe(150);
    expect(applyMarkup(200, 25)).toBe(250);
  });

  it('should handle 0% markup', () => {
    expect(applyMarkup(100, 0)).toBe(100);
  });

  it('should return cost price if <= 0', () => {
    expect(applyMarkup(0, 50)).toBe(0);
    expect(applyMarkup(-10, 50)).toBe(-10);
  });
});

describe('calculateGrossMargin', () => {
  it('should calculate margin correctly', () => {
    // GP% = (150 - 100) / 150 * 100 = 33.3%
    expect(calculateGrossMargin(100, 150)).toBe(33.3);
  });

  it('should return 0 for zero selling price', () => {
    expect(calculateGrossMargin(100, 0)).toBe(0);
  });
});

describe('calculateImpliedMarkup', () => {
  it('should calculate implied markup from cost and selling', () => {
    // markup% = (150 - 100) / 100 * 100 = 50%
    expect(calculateImpliedMarkup(100, 150)).toBe(50);
  });

  it('should return 0 for missing prices', () => {
    expect(calculateImpliedMarkup(0, 150)).toBe(0);
    expect(calculateImpliedMarkup(100, 0)).toBe(0);
  });
});

describe('getProfitStatus', () => {
  it('should return correct status for different margins', () => {
    expect(getProfitStatus(-5).status).toBe('loss');
    expect(getProfitStatus(10).status).toBe('low');
    expect(getProfitStatus(30).status).toBe('normal');
    expect(getProfitStatus(45).status).toBe('good');
  });
});
