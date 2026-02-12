/**
 * Curtain Formula Tests
 *
 * Tests use REAL-WORLD examples from the measurement guide.
 * Settings reference: Header 10cm, Bottom 10cm, Sides 5cm, Seams 5cm,
 * Left Return 5cm, Right Return 5cm, Overlap 5cm
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCurtainVertical,
  calculateCurtainHorizontal,
  calculateCurtain,
  CurtainInput,
} from '../curtain.formulas';

// Standard test settings matching user's configuration
const STANDARD_SETTINGS: Omit<CurtainInput, 'railWidthCm' | 'dropCm' | 'fabricWidthCm' | 'fullness' | 'panelCount'> = {
  headerHemCm: 10,
  bottomHemCm: 10,
  sideHemCm: 5,
  seamHemCm: 5,
  returnLeftCm: 5,
  returnRightCm: 5,
  overlapCm: 5,
  poolingCm: 0,
  wastePercent: 0,
};

describe('calculateCurtainVertical', () => {
  it('should calculate correctly for 200cm rail, 2.0x fullness, single panel', () => {
    const result = calculateCurtainVertical({
      ...STANDARD_SETTINGS,
      railWidthCm: 200,
      dropCm: 260,
      fabricWidthCm: 140,
      fullness: 2.0,
      panelCount: 1,
    });

    // Step by step:
    // totalDrop = 260 + 10 + 10 + 0 = 280cm
    // finishedWidth = (200 + 5) * 2.0 = 410cm
    // totalSideHems = 5 * 2 * 1 = 10cm
    // totalReturns = 5 + 5 = 10cm
    // totalWidth = 410 + 10 + 10 = 430cm
    // widthsRequired = ceil(430 / 140) = 4
    // seams = 4 - 1 = 3
    // seamAllowance = 3 * 5 = 15cm
    // totalFabric = (4 * 280) + 15 = 1135cm
    // linearMeters = 1135 / 100 = 11.35m

    expect(result.totalDropCm).toBe(280);
    expect(result.finishedWidthCm).toBe(410);
    expect(result.totalSideHemsCm).toBe(10);
    expect(result.totalReturnsCm).toBe(10);
    expect(result.totalWidthCm).toBe(430);
    expect(result.widthsRequired).toBe(4);
    expect(result.seamsCount).toBe(3);
    expect(result.seamAllowanceCm).toBe(15);
    expect(result.linearMeters).toBe(11.35);
  });

  it('should calculate correctly for 500cm rail, 2.0x fullness, pair', () => {
    const result = calculateCurtainVertical({
      ...STANDARD_SETTINGS,
      railWidthCm: 500,
      dropCm: 260,
      fabricWidthCm: 140,
      fullness: 2.0,
      panelCount: 2,
    });

    // totalDrop = 260 + 10 + 10 + 0 = 280cm
    // finishedWidth = (500 + 5) * 2.0 = 1010cm
    // totalSideHems = 5 * 2 * 2 = 20cm
    // totalReturns = 5 + 5 = 10cm
    // totalWidth = 1010 + 10 + 20 = 1040cm
    // widthsRequired = ceil(1040 / 140) = 8
    // seams = 8 - 1 = 7
    // seamAllowance = 7 * 5 = 35cm
    // totalFabric = (8 * 280) + 35 = 2275cm
    // linearMeters = 2275 / 100 = 22.75m

    expect(result.totalDropCm).toBe(280);
    expect(result.finishedWidthCm).toBe(1010);
    expect(result.totalSideHemsCm).toBe(20);
    expect(result.totalWidthCm).toBe(1040);
    expect(result.widthsRequired).toBe(8);
    expect(result.seamsCount).toBe(7);
    expect(result.seamAllowanceCm).toBe(35);
    expect(result.linearMeters).toBe(22.75);
  });

  it('should handle zero overlap correctly', () => {
    const result = calculateCurtainVertical({
      ...STANDARD_SETTINGS,
      railWidthCm: 200,
      dropCm: 250,
      fabricWidthCm: 140,
      fullness: 2.0,
      panelCount: 1,
      overlapCm: 0,
    });

    // finishedWidth = (200 + 0) * 2.0 = 400cm (no overlap)
    expect(result.finishedWidthCm).toBe(400);
  });

  it('should apply waste percentage correctly', () => {
    const result = calculateCurtainVertical({
      ...STANDARD_SETTINGS,
      railWidthCm: 200,
      dropCm: 260,
      fabricWidthCm: 140,
      fullness: 2.0,
      panelCount: 1,
      wastePercent: 5,
    });

    // Raw = 11.35m, with 5% waste = 11.35 * 1.05 = 11.92m
    expect(result.linearMetersRaw).toBe(11.35);
    expect(result.linearMeters).toBe(11.92);
  });

  it('should handle single width (narrow curtain, no seams)', () => {
    const result = calculateCurtainVertical({
      ...STANDARD_SETTINGS,
      railWidthCm: 50,
      dropCm: 200,
      fabricWidthCm: 140,
      fullness: 2.0,
      panelCount: 1,
    });

    // finishedWidth = (50 + 5) * 2.0 = 110cm
    // totalWidth = 110 + 10 + 10 = 130cm
    // widthsRequired = ceil(130 / 140) = 1
    // seams = 0
    expect(result.widthsRequired).toBe(1);
    expect(result.seamsCount).toBe(0);
    expect(result.seamAllowanceCm).toBe(0);
  });

  it('should throw for invalid inputs', () => {
    expect(() => calculateCurtainVertical({
      ...STANDARD_SETTINGS,
      railWidthCm: 0,
      dropCm: 260,
      fabricWidthCm: 140,
      fullness: 2.0,
      panelCount: 1,
    })).toThrow('railWidthCm must be a positive number');

    expect(() => calculateCurtainVertical({
      ...STANDARD_SETTINGS,
      railWidthCm: 200,
      dropCm: 260,
      fabricWidthCm: 140,
      fullness: -1,
      panelCount: 1,
    })).toThrow('fullness must be a positive number');
  });

  it('should include formula breakdown for transparency', () => {
    const result = calculateCurtainVertical({
      ...STANDARD_SETTINGS,
      railWidthCm: 200,
      dropCm: 260,
      fabricWidthCm: 140,
      fullness: 2.0,
      panelCount: 1,
    });

    expect(result.breakdown.steps.length).toBeGreaterThan(0);
    expect(result.breakdown.summary).toContain('VERTICAL');
    expect(result.breakdown.values.totalDropCm).toBe(280);
  });
});

describe('calculateCurtainHorizontal', () => {
  it('should calculate correctly for railroaded fabric', () => {
    const result = calculateCurtainHorizontal({
      ...STANDARD_SETTINGS,
      railWidthCm: 200,
      dropCm: 260,
      fabricWidthCm: 140,
      fullness: 2.0,
      panelCount: 1,
    });

    // totalDrop = 260 + 10 + 10 + 0 = 280cm
    // finishedWidth = (200 + 5) * 2.0 = 410cm
    // totalWidth = 410 + 10 + 10 = 430cm
    // horizontalPieces = ceil(280 / 140) = 2
    // seams = 2 - 1 = 1
    // seamAllowance = 1 * 5 = 5cm
    // totalFabric = (2 * 430) + 5 = 865cm
    // linearMeters = 8.65m

    expect(result.totalDropCm).toBe(280);
    expect(result.totalWidthCm).toBe(430);
    expect(result.widthsRequired).toBe(2); // horizontal pieces
    expect(result.seamsCount).toBe(1);
    expect(result.seamAllowanceCm).toBe(5);
    expect(result.linearMeters).toBe(8.65);
  });

  it('should include RAILROADED in summary', () => {
    const result = calculateCurtainHorizontal({
      ...STANDARD_SETTINGS,
      railWidthCm: 200,
      dropCm: 260,
      fabricWidthCm: 140,
      fullness: 2.0,
      panelCount: 1,
    });

    expect(result.breakdown.summary).toContain('RAILROADED');
  });
});

describe('calculateCurtain (auto-select orientation)', () => {
  it('should call vertical when orientation is vertical', () => {
    const result = calculateCurtain('vertical', {
      ...STANDARD_SETTINGS,
      railWidthCm: 200,
      dropCm: 260,
      fabricWidthCm: 140,
      fullness: 2.0,
      panelCount: 1,
    });
    expect(result.breakdown.summary).toContain('VERTICAL');
  });

  it('should call horizontal when orientation is horizontal', () => {
    const result = calculateCurtain('horizontal', {
      ...STANDARD_SETTINGS,
      railWidthCm: 200,
      dropCm: 260,
      fabricWidthCm: 140,
      fullness: 2.0,
      panelCount: 1,
    });
    expect(result.breakdown.summary).toContain('RAILROADED');
  });
});

describe('Wave heading curtains (worked example from measurement guide)', () => {
  it('should calculate wave heading at 2.0x fullness for 3.2m track', () => {
    // Example B from measurement guide: Track 3.2m, fullness 2.0
    const result = calculateCurtainVertical({
      railWidthCm: 320,
      dropCm: 270, // ceiling to 10mm above floor
      fabricWidthCm: 140,
      fullness: 2.0,
      panelCount: 2,
      headerHemCm: 10,
      bottomHemCm: 10,
      sideHemCm: 5,
      seamHemCm: 5,
      returnLeftCm: 5,
      returnRightCm: 5,
      overlapCm: 5,
      poolingCm: 0,
      wastePercent: 0,
    });

    // finishedWidth = (320 + 5) * 2.0 = 650cm
    // totalSideHems = 5 * 2 * 2 = 20cm
    // totalWidth = 650 + 10 + 20 = 680cm
    // widthsRequired = ceil(680 / 140) = 5
    // totalDrop = 270 + 10 + 10 = 290cm
    // seams = 4, seamAllowance = 20cm
    // totalFabric = (5 * 290) + 20 = 1470cm = 14.70m

    expect(result.finishedWidthCm).toBe(650);
    expect(result.totalWidthCm).toBe(680);
    expect(result.widthsRequired).toBe(5);
    expect(result.totalDropCm).toBe(290);
    expect(result.linearMeters).toBe(14.70);
  });
});
