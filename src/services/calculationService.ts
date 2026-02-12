/**
 * Calculation Service - SaaS-Grade Abstraction
 * 
 * SaaS Best Practice: Service layer pattern
 * - Single responsibility
 * - Dependency injection ready
 * - Testable in isolation
 * - Consistent error handling
 */

import { Result, ok, err } from '@/utils/resultTypes';
import { logError } from '@/utils/errorHandling';

// ============================================
// Types
// ============================================

export interface FabricCalculationInput {
  widthMm: number;
  dropMm: number;
  fullness: number;
  fabricWidthCm: number;
  orientation: 'vertical' | 'horizontal';
  headerHemCm?: number;
  bottomHemCm?: number;
  sideHemCm?: number;
  wastePercent?: number;
  returnLeftCm?: number;
  returnRightCm?: number;
  overlapCm?: number;
}

export interface FabricCalculationOutput {
  linearMeters: number;
  squareMeters: number;
  widthsRequired: number;
  cutsRequired: number;
  formula: string;
}

export interface BlindCalculationInput {
  widthMm: number;
  dropMm: number;
  headerHemCm?: number;
  bottomHemCm?: number;
  sideHemCm?: number;
  wastePercent?: number;
}

export interface BlindCalculationOutput {
  squareMeters: number;
  effectiveWidthCm: number;
  effectiveHeightCm: number;
  formula: string;
}

// ============================================
// Validation
// ============================================

function validateMeasurement(value: number, name: string): string | null {
  if (typeof value !== 'number' || isNaN(value)) {
    return `${name} must be a valid number`;
  }
  if (value <= 0) {
    return `${name} must be positive`;
  }
  if (value > 100000) {
    return `${name} exceeds maximum (100m)`;
  }
  return null;
}

function validateFullness(value: number): string | null {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'Fullness must be a valid number';
  }
  if (value < 1 || value > 5) {
    return 'Fullness must be between 1.0 and 5.0';
  }
  return null;
}

// ============================================
// Calculation Service
// ============================================

export const CalculationService = {
  /**
   * Calculate fabric requirements for curtains
   */
  calculateCurtainFabric(input: FabricCalculationInput): Result<FabricCalculationOutput, string> {
    // Validate inputs
    const widthError = validateMeasurement(input.widthMm, 'Width');
    if (widthError) return err(widthError);

    const dropError = validateMeasurement(input.dropMm, 'Drop');
    if (dropError) return err(dropError);

    const fullnessError = validateFullness(input.fullness);
    if (fullnessError) return err(fullnessError);

    const fabricWidthError = validateMeasurement(input.fabricWidthCm * 10, 'Fabric width');
    if (fabricWidthError) return err(fabricWidthError);

    try {
      const widthCm = input.widthMm / 10;
      const dropCm = input.dropMm / 10;
      const fabricWidthCm = input.fabricWidthCm;

      // Apply allowances
      const headerHem = input.headerHemCm ?? 0;
      const bottomHem = input.bottomHemCm ?? 0;
      const sideHem = input.sideHemCm ?? 0;
      const wastePercent = input.wastePercent ?? 0;
      const returnLeft = input.returnLeftCm ?? 0;
      const returnRight = input.returnRightCm ?? 0;
      const overlap = input.overlapCm ?? 0;

      const totalDropCm = dropCm + headerHem + bottomHem;
      // Industry standard: overlap added BEFORE fullness, returns and side hems added after
      const totalWidthCm = ((widthCm + overlap) * input.fullness) + returnLeft + returnRight + (sideHem * 2);

      let linearMeters: number;
      let widthsRequired: number;
      let cutsRequired: number;
      let formula: string;

      if (input.orientation === 'vertical') {
        // Vertical: fabric runs top to bottom
        widthsRequired = Math.ceil(totalWidthCm / fabricWidthCm);
        cutsRequired = widthsRequired;
        linearMeters = (widthsRequired * totalDropCm) / 100;
        formula = `(${widthsRequired} widths × ${totalDropCm.toFixed(1)}cm drop) ÷ 100`;
      } else {
        // Horizontal: fabric runs side to side (railroaded)
        cutsRequired = Math.ceil(totalDropCm / fabricWidthCm);
        widthsRequired = cutsRequired;
        linearMeters = (cutsRequired * totalWidthCm) / 100;
        formula = `(${cutsRequired} cuts × ${totalWidthCm.toFixed(1)}cm width) ÷ 100`;
      }

      // Apply waste
      if (wastePercent > 0) {
        linearMeters *= (1 + wastePercent / 100);
        formula += ` × ${1 + wastePercent / 100} waste`;
      }

      const squareMeters = (totalWidthCm * totalDropCm) / 10000;

      return ok({
        linearMeters: Math.round(linearMeters * 100) / 100,
        squareMeters: Math.round(squareMeters * 100) / 100,
        widthsRequired,
        cutsRequired,
        formula,
      });
    } catch (error) {
      logError(error, { context: 'CalculationService.calculateCurtainFabric', input });
      return err('Fabric calculation failed unexpectedly');
    }
  },

  /**
   * Calculate square meters for blinds
   */
  calculateBlindSqm(input: BlindCalculationInput): Result<BlindCalculationOutput, string> {
    // Validate inputs
    const widthError = validateMeasurement(input.widthMm, 'Width');
    if (widthError) return err(widthError);

    const dropError = validateMeasurement(input.dropMm, 'Drop');
    if (dropError) return err(dropError);

    try {
      const widthCm = input.widthMm / 10;
      const dropCm = input.dropMm / 10;

      // Apply allowances
      const headerHem = input.headerHemCm ?? 0;
      const bottomHem = input.bottomHemCm ?? 0;
      const sideHem = input.sideHemCm ?? 0;
      const wastePercent = input.wastePercent ?? 0;

      const effectiveWidthCm = widthCm + (sideHem * 2);
      const effectiveHeightCm = dropCm + headerHem + bottomHem;

      let squareMeters = (effectiveWidthCm * effectiveHeightCm) / 10000;

      // Apply waste
      if (wastePercent > 0) {
        squareMeters *= (1 + wastePercent / 100);
      }

      const formula = `(${effectiveWidthCm.toFixed(1)}cm × ${effectiveHeightCm.toFixed(1)}cm) ÷ 10000${wastePercent > 0 ? ` × ${1 + wastePercent / 100}` : ''}`;

      return ok({
        squareMeters: Math.round(squareMeters * 100) / 100,
        effectiveWidthCm: Math.round(effectiveWidthCm * 10) / 10,
        effectiveHeightCm: Math.round(effectiveHeightCm * 10) / 10,
        formula,
      });
    } catch (error) {
      logError(error, { context: 'CalculationService.calculateBlindSqm', input });
      return err('Blind SQM calculation failed unexpectedly');
    }
  },

  /**
   * Lookup price from pricing grid
   */
  lookupGridPrice(
    grid: { widthColumns: number[]; dropRows: number[]; prices: Record<string, number> },
    widthCm: number,
    dropCm: number
  ): Result<number, string> {
    if (!grid?.widthColumns?.length || !grid?.dropRows?.length) {
      return err('Invalid pricing grid structure');
    }

    try {
      // Find matching width column (first column >= width)
      const widthIndex = grid.widthColumns.findIndex(col => col >= widthCm);
      if (widthIndex === -1) {
        return err(`Width ${widthCm}cm exceeds maximum grid width ${grid.widthColumns[grid.widthColumns.length - 1]}cm`);
      }

      // Find matching drop row (first row >= drop)
      const dropIndex = grid.dropRows.findIndex(row => row >= dropCm);
      if (dropIndex === -1) {
        return err(`Drop ${dropCm}cm exceeds maximum grid drop ${grid.dropRows[grid.dropRows.length - 1]}cm`);
      }

      const matchedWidth = grid.widthColumns[widthIndex];
      const matchedDrop = grid.dropRows[dropIndex];

      // Try different key formats
      const keyFormats = [
        `${matchedWidth}_${matchedDrop}`,
        `${matchedWidth}-${matchedDrop}`,
        `${matchedWidth}x${matchedDrop}`,
      ];

      for (const key of keyFormats) {
        if (grid.prices[key] !== undefined) {
          return ok(grid.prices[key]);
        }
      }

      return err(`No price found for ${matchedWidth}cm × ${matchedDrop}cm`);
    } catch (error) {
      logError(error, { context: 'CalculationService.lookupGridPrice', widthCm, dropCm });
      return err('Grid price lookup failed');
    }
  },
};

export default CalculationService;
