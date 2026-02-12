/**
 * Blind Formula Tests
 *
 * Tests use REAL-WORLD examples.
 * Reference: Measurement guide section 6.4 (venetian), 6.5 (vertical)
 */

import { describe, it, expect } from 'vitest';
import {
  calculateBlindSqm,
  calculateVenetianBlind,
  calculateVerticalBlind,
  BlindInput,
} from '../blind.formulas';

describe('calculateBlindSqm', () => {
  it('should calculate SQM for a standard roller blind', () => {
    const result = calculateBlindSqm({
      railWidthCm: 120,
      dropCm: 150,
      headerHemCm: 8,
      bottomHemCm: 10,
      sideHemCm: 4,
      wastePercent: 0,
    });

    // effectiveWidth = 120 + (4 * 2) = 128cm
    // effectiveHeight = 150 + 8 + 10 = 168cm
    // sqm = (128/100) * (168/100) = 1.28 * 1.68 = 2.1504 → 2.15

    expect(result.effectiveWidthCm).toBe(128);
    expect(result.effectiveHeightCm).toBe(168);
    expect(result.sqm).toBe(2.15);
  });

  it('should calculate SQM for inside-mount roller blind (example from guide)', () => {
    // Example A: Recess 1196mm x 1497mm, order size 1192mm x 1487mm
    // But for blind SQM we use the recess width/height with hems
    const result = calculateBlindSqm({
      railWidthCm: 119.2, // order width in cm
      dropCm: 148.7,      // order height in cm
      headerHemCm: 5,
      bottomHemCm: 5,
      sideHemCm: 2,
      wastePercent: 0,
    });

    // effectiveWidth = 119.2 + 4 = 123.2cm
    // effectiveHeight = 148.7 + 5 + 5 = 158.7cm
    // sqm = (123.2/100) * (158.7/100) = 1.955

    expect(result.effectiveWidthCm).toBe(123.2);
    expect(result.effectiveHeightCm).toBe(158.7);
    expect(result.sqm).toBe(1.96);
  });

  it('should apply waste percentage', () => {
    const result = calculateBlindSqm({
      railWidthCm: 100,
      dropCm: 200,
      headerHemCm: 0,
      bottomHemCm: 0,
      sideHemCm: 0,
      wastePercent: 10,
    });

    // Raw sqm = (100/100) * (200/100) = 2.0
    // With 10% waste = 2.0 * 1.1 = 2.2
    expect(result.sqmRaw).toBe(2.0);
    expect(result.sqm).toBe(2.2);
  });

  it('should handle zero hems', () => {
    const result = calculateBlindSqm({
      railWidthCm: 100,
      dropCm: 100,
      headerHemCm: 0,
      bottomHemCm: 0,
      sideHemCm: 0,
      wastePercent: 0,
    });

    expect(result.sqm).toBe(1.0);
  });

  it('should throw for invalid inputs', () => {
    expect(() => calculateBlindSqm({
      railWidthCm: 0,
      dropCm: 100,
      headerHemCm: 0,
      bottomHemCm: 0,
      sideHemCm: 0,
      wastePercent: 0,
    })).toThrow('railWidthCm must be a positive number');
  });

  it('should include formula breakdown', () => {
    const result = calculateBlindSqm({
      railWidthCm: 120,
      dropCm: 150,
      headerHemCm: 8,
      bottomHemCm: 10,
      sideHemCm: 4,
      wastePercent: 0,
    });

    expect(result.breakdown.steps.length).toBeGreaterThan(0);
    expect(result.breakdown.summary).toContain('sqm');
  });
});

describe('calculateVenetianBlind', () => {
  it('should calculate SQM and stack height', () => {
    const result = calculateVenetianBlind({
      railWidthCm: 120,
      dropCm: 150,
      headerHemCm: 5,
      bottomHemCm: 5,
      sideHemCm: 3,
      wastePercent: 0,
      slatWidthMm: 25,
      stackFactor: 0.07,
      headrailAllowanceCm: 5,
    });

    // SQM same as standard
    expect(result.effectiveWidthCm).toBe(126);
    expect(result.effectiveHeightCm).toBe(160);

    // Stack height = 0.07 * 150 + 5 = 10.5 + 5 = 15.5cm
    expect(result.stackHeightCm).toBe(15.5);
  });
});

describe('calculateVerticalBlind', () => {
  it('should calculate SQM and louver count for 89mm louvers', () => {
    const result = calculateVerticalBlind({
      railWidthCm: 200,
      dropCm: 220,
      headerHemCm: 5,
      bottomHemCm: 5,
      sideHemCm: 3,
      wastePercent: 0,
      louverWidthCm: 8.9, // 89mm
      overlapFactor: 1.0,
    });

    // louverCount = ceil(200 / (8.9 * 1.0)) = ceil(22.47) = 23
    expect(result.louverCount).toBe(23);
  });

  it('should calculate SQM and louver count for 127mm louvers', () => {
    const result = calculateVerticalBlind({
      railWidthCm: 200,
      dropCm: 220,
      headerHemCm: 5,
      bottomHemCm: 5,
      sideHemCm: 3,
      wastePercent: 0,
      louverWidthCm: 12.7, // 127mm
      overlapFactor: 1.0,
    });

    // louverCount = ceil(200 / (12.7 * 1.0)) = ceil(15.75) = 16
    expect(result.louverCount).toBe(16);
  });
});
