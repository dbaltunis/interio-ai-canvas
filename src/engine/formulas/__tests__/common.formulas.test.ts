/**
 * Common Formula Tests
 */

import { describe, it, expect } from 'vitest';
import {
  mmToCm,
  cmToMm,
  cmToM,
  mToCm,
  roundTo,
  applyWaste,
  calculateSeamCount,
  calculateSeamAllowance,
  alignToPatternRepeat,
  assertPositive,
  assertNonNegative,
} from '../common.formulas';

describe('Unit conversions', () => {
  it('mmToCm', () => {
    expect(mmToCm(1000)).toBe(100);
    expect(mmToCm(2600)).toBe(260);
  });

  it('cmToMm', () => {
    expect(cmToMm(100)).toBe(1000);
    expect(cmToMm(5.5)).toBe(55);
  });

  it('cmToM', () => {
    expect(cmToM(100)).toBe(1);
    expect(cmToM(1135)).toBe(11.35);
  });

  it('mToCm', () => {
    expect(mToCm(1)).toBe(100);
    expect(mToCm(11.35)).toBe(1135);
  });
});

describe('roundTo', () => {
  it('should round to 2 decimal places by default', () => {
    expect(roundTo(11.3549)).toBe(11.35);
    expect(roundTo(11.355)).toBe(11.36);
  });

  it('should round to specified decimals', () => {
    expect(roundTo(11.3549, 0)).toBe(11);
    expect(roundTo(11.3549, 1)).toBe(11.4);
    expect(roundTo(11.3549, 3)).toBe(11.355);
  });
});

describe('applyWaste', () => {
  it('should add waste percentage', () => {
    expect(applyWaste(10, 5)).toBe(10.5);
    expect(applyWaste(10, 10)).toBe(11);
  });

  it('should return unchanged for 0 waste', () => {
    expect(applyWaste(10, 0)).toBe(10);
  });

  it('should return unchanged for negative waste', () => {
    expect(applyWaste(10, -5)).toBe(10);
  });
});

describe('calculateSeamCount', () => {
  it('should return widths - 1', () => {
    expect(calculateSeamCount(1)).toBe(0);
    expect(calculateSeamCount(2)).toBe(1);
    expect(calculateSeamCount(5)).toBe(4);
  });

  it('should never return negative', () => {
    expect(calculateSeamCount(0)).toBe(0);
  });
});

describe('calculateSeamAllowance', () => {
  it('should multiply seams by seamHem (total per join)', () => {
    expect(calculateSeamAllowance(3, 5)).toBe(15);
    expect(calculateSeamAllowance(0, 5)).toBe(0);
  });
});

describe('alignToPatternRepeat', () => {
  it('should round up to next repeat', () => {
    expect(alignToPatternRepeat(280, 65)).toBe(325); // ceil(280/65)*65 = 5*65 = 325
    expect(alignToPatternRepeat(260, 30)).toBe(270); // ceil(260/30)*30 = 9*30 = 270
  });

  it('should return unchanged for 0 repeat', () => {
    expect(alignToPatternRepeat(280, 0)).toBe(280);
  });

  it('should return unchanged if already aligned', () => {
    expect(alignToPatternRepeat(300, 100)).toBe(300);
  });
});

describe('assertPositive', () => {
  it('should pass for positive values', () => {
    expect(() => assertPositive(1, 'test')).not.toThrow();
    expect(() => assertPositive(0.001, 'test')).not.toThrow();
  });

  it('should throw for zero', () => {
    expect(() => assertPositive(0, 'test')).toThrow();
  });

  it('should throw for negative', () => {
    expect(() => assertPositive(-1, 'test')).toThrow();
  });

  it('should throw for NaN', () => {
    expect(() => assertPositive(NaN, 'test')).toThrow();
  });
});

describe('assertNonNegative', () => {
  it('should pass for zero and positive', () => {
    expect(() => assertNonNegative(0, 'test')).not.toThrow();
    expect(() => assertNonNegative(1, 'test')).not.toThrow();
  });

  it('should throw for negative', () => {
    expect(() => assertNonNegative(-1, 'test')).toThrow();
  });
});
