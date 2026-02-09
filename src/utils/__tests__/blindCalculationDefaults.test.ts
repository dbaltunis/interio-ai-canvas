/**
 * Unit Tests for Blind Calculation Defaults Utility
 * Tests sqm calculation for blinds with hem allowances
 */

import { describe, it, expect, vi } from 'vitest';
import {
  getBlindHemValues,
  calculateBlindSqm,
  BlindHemValues
} from '../blindCalculationDefaults';

describe('getBlindHemValues', () => {
  describe('Valid templates', () => {
    it('should extract hem values from template with blind_*_hem_cm fields', () => {
      const template = {
        name: 'Roller Blind',
        blind_header_hem_cm: 8,
        blind_bottom_hem_cm: 10,
        blind_side_hem_cm: 4,
        waste_percent: 5
      };

      const result = getBlindHemValues(template);

      expect(result.headerHemCm).toBe(8);
      expect(result.bottomHemCm).toBe(10);
      expect(result.sideHemCm).toBe(4);
      expect(result.wastePercent).toBe(5);
    });

    it('should prioritize user-editable fields over legacy fields', () => {
      const template = {
        name: 'Roller Blind',
        // User-editable fields (higher priority)
        header_allowance: 10,
        bottom_hem: 12,
        side_hem: 5,
        waste_percent: 3,
        // Legacy fields (lower priority)
        blind_header_hem_cm: 8,
        blind_bottom_hem_cm: 10,
        blind_side_hem_cm: 4
      };

      const result = getBlindHemValues(template);

      // Should use user-editable fields
      expect(result.headerHemCm).toBe(10);
      expect(result.bottomHemCm).toBe(12);
      expect(result.sideHemCm).toBe(5);
      expect(result.wastePercent).toBe(3);
    });

    it('should handle template with mixed field naming', () => {
      const template = {
        name: 'Mixed Template',
        header_hem_cm: 7,
        bottom_allowance: 11,
        side_hems: 3,
        waste_percentage: 2
      };

      const result = getBlindHemValues(template);

      expect(result.headerHemCm).toBe(7);
      expect(result.bottomHemCm).toBe(11);
      expect(result.sideHemCm).toBe(3);
      expect(result.wastePercent).toBe(2);
    });

    it('should default waste to 0 if not provided', () => {
      const template = {
        name: 'No Waste Template',
        blind_header_hem_cm: 8,
        blind_bottom_hem_cm: 10,
        blind_side_hem_cm: 4
        // no waste_percent
      };

      const result = getBlindHemValues(template);

      expect(result.wastePercent).toBe(0);
    });

    it('should handle zero values correctly', () => {
      const template = {
        name: 'Zero Hems Template',
        blind_header_hem_cm: 0,
        blind_bottom_hem_cm: 0,
        blind_side_hem_cm: 0,
        waste_percent: 0
      };

      const result = getBlindHemValues(template);

      expect(result.headerHemCm).toBe(0);
      expect(result.bottomHemCm).toBe(0);
      expect(result.sideHemCm).toBe(0);
      expect(result.wastePercent).toBe(0);
    });
  });

  describe('Invalid templates', () => {
    it('should throw error when template is null', () => {
      expect(() => getBlindHemValues(null)).toThrow('Template is required');
    });

    it('should throw error when template is undefined', () => {
      expect(() => getBlindHemValues(undefined)).toThrow('Template is required');
    });

    it('should return 0 defaults when header_hem is missing (TWC sync compatibility)', () => {
      const template = {
        name: 'Missing Header',
        blind_bottom_hem_cm: 10,
        blind_side_hem_cm: 4
      };

      const result = getBlindHemValues(template);
      expect(result.headerHemCm).toBe(0);
      expect(result.bottomHemCm).toBe(10);
      expect(result.sideHemCm).toBe(4);
    });

    it('should return 0 defaults when bottom_hem is missing (TWC sync compatibility)', () => {
      const template = {
        name: 'Missing Bottom',
        blind_header_hem_cm: 8,
        blind_side_hem_cm: 4
      };

      const result = getBlindHemValues(template);
      expect(result.headerHemCm).toBe(8);
      expect(result.bottomHemCm).toBe(0);
      expect(result.sideHemCm).toBe(4);
    });

    it('should return 0 defaults when side_hem is missing (TWC sync compatibility)', () => {
      const template = {
        name: 'Missing Side',
        blind_header_hem_cm: 8,
        blind_bottom_hem_cm: 10
      };

      const result = getBlindHemValues(template);
      expect(result.headerHemCm).toBe(8);
      expect(result.bottomHemCm).toBe(10);
      expect(result.sideHemCm).toBe(0);
    });

    it('should return all 0 defaults when all values missing (TWC sync compatibility)', () => {
      const template = {
        name: 'Missing All'
        // no hem values
      };

      const result = getBlindHemValues(template);
      expect(result.headerHemCm).toBe(0);
      expect(result.bottomHemCm).toBe(0);
      expect(result.sideHemCm).toBe(0);
      expect(result.wastePercent).toBe(0);
    });
  });
});

describe('calculateBlindSqm', () => {
  const standardHems: BlindHemValues = {
    headerHemCm: 8,
    bottomHemCm: 10,
    sideHemCm: 4,
    wastePercent: 0
  };

  describe('Basic calculations', () => {
    it('should calculate sqm correctly for standard blind', () => {
      // Rail width 100cm, drop 150cm
      // Effective width = 100 + 4 + 4 = 108cm
      // Effective height = 150 + 8 + 10 = 168cm
      // SQM = (108 * 168) / 10000 = 1.8144 sqm

      const result = calculateBlindSqm(100, 150, standardHems);

      expect(result.effectiveWidthCm).toBe(108);
      expect(result.effectiveHeightCm).toBe(168);
      expect(result.sqm).toBeCloseTo(1.81, 1);
    });

    it('should calculate sqm for small blind', () => {
      // Rail width 60cm, drop 100cm
      // Effective width = 60 + 4 + 4 = 68cm
      // Effective height = 100 + 8 + 10 = 118cm
      // SQM = (68 * 118) / 10000 = 0.8024 sqm

      const result = calculateBlindSqm(60, 100, standardHems);

      expect(result.effectiveWidthCm).toBe(68);
      expect(result.effectiveHeightCm).toBe(118);
      expect(result.sqm).toBeCloseTo(0.80, 1);
    });

    it('should calculate sqm for large blind', () => {
      // Rail width 240cm, drop 300cm
      // Effective width = 240 + 4 + 4 = 248cm
      // Effective height = 300 + 8 + 10 = 318cm
      // SQM = (248 * 318) / 10000 = 7.8864 sqm

      const result = calculateBlindSqm(240, 300, standardHems);

      expect(result.effectiveWidthCm).toBe(248);
      expect(result.effectiveHeightCm).toBe(318);
      expect(result.sqm).toBeCloseTo(7.89, 1);
    });
  });

  describe('Waste percentage', () => {
    it('should apply waste percentage correctly', () => {
      const hemsWithWaste: BlindHemValues = {
        ...standardHems,
        wastePercent: 5
      };

      // Base sqm = 1.8144
      // With 5% waste = 1.8144 * 1.05 = 1.9051

      const result = calculateBlindSqm(100, 150, hemsWithWaste);

      expect(result.sqm).toBeCloseTo(1.90, 1);
    });

    it('should handle 0% waste', () => {
      const hemsNoWaste: BlindHemValues = {
        ...standardHems,
        wastePercent: 0
      };

      const result = calculateBlindSqm(100, 150, hemsNoWaste);

      expect(result.sqm).toBeCloseTo(1.81, 1);
    });

    it('should handle large waste percentage', () => {
      const hemsLargeWaste: BlindHemValues = {
        ...standardHems,
        wastePercent: 20
      };

      // Base sqm = 1.8144
      // With 20% waste = 1.8144 * 1.20 = 2.1773

      const result = calculateBlindSqm(100, 150, hemsLargeWaste);

      expect(result.sqm).toBeCloseTo(2.18, 1);
    });
  });

  describe('Calculation notes', () => {
    it('should provide width calculation note', () => {
      const result = calculateBlindSqm(100, 150, standardHems);

      expect(result.widthCalcNote).toContain('100');
      expect(result.widthCalcNote).toContain('4');
      expect(result.widthCalcNote).toContain('108');
    });

    it('should provide height calculation note', () => {
      const result = calculateBlindSqm(100, 150, standardHems);

      expect(result.heightCalcNote).toContain('150');
      expect(result.heightCalcNote).toContain('8');
      expect(result.heightCalcNote).toContain('10');
      expect(result.heightCalcNote).toContain('168');
    });
  });

  describe('Edge cases', () => {
    it('should throw error for zero width', () => {
      expect(() => calculateBlindSqm(0, 150, standardHems)).toThrow('railWidthCm is required');
    });

    it('should throw error for negative width', () => {
      expect(() => calculateBlindSqm(-50, 150, standardHems)).toThrow('must be > 0');
    });

    it('should throw error for zero drop', () => {
      expect(() => calculateBlindSqm(100, 0, standardHems)).toThrow('dropCm is required');
    });

    it('should throw error for negative drop', () => {
      expect(() => calculateBlindSqm(100, -50, standardHems)).toThrow('must be > 0');
    });

    it('should handle very small dimensions', () => {
      const result = calculateBlindSqm(10, 10, standardHems);

      expect(result.effectiveWidthCm).toBe(18);  // 10 + 4 + 4
      expect(result.effectiveHeightCm).toBe(28); // 10 + 8 + 10
      expect(result.sqm).toBeCloseTo(0.05, 1);   // Very small sqm
    });

    it('should handle zero hem values', () => {
      const zeroHems: BlindHemValues = {
        headerHemCm: 0,
        bottomHemCm: 0,
        sideHemCm: 0,
        wastePercent: 0
      };

      const result = calculateBlindSqm(100, 150, zeroHems);

      // Effective dimensions = raw dimensions
      expect(result.effectiveWidthCm).toBe(100);
      expect(result.effectiveHeightCm).toBe(150);
      expect(result.sqm).toBeCloseTo(1.50, 1);
    });
  });
});
