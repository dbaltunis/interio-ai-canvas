/**
 * Safe Measurement Accessor Hook
 * 
 * CRITICAL: This hook ensures all measurements are returned in MILLIMETERS (MM)
 * regardless of how they're stored or what unit system the user has configured.
 * 
 * This is the ONLY way measurement data should be accessed throughout the app
 * to prevent unit conversion bugs.
 */

import { useMemo } from 'react';
import { toMM, mmToCM, fromMM } from '@/types/measurements';
import { useMeasurementUnits } from './useMeasurementUnits';

export interface SafeMeasurements {
  /** Rail/headrail width in MM */
  getRailWidthMM: () => number;
  /** Drop/height in MM */
  getDropMM: () => number;
  /** Pooling amount in MM */
  getPoolingMM: () => number;
  /** Return left in MM */
  getReturnLeftMM: () => number;
  /** Return right in MM */
  getReturnRightMM: () => number;
  /** Stackback left in MM */
  getStackbackLeftMM: () => number;
  /** Stackback right in MM */
  getStackbackRightMM: () => number;
  /** Wall width in MM (for wallpaper) */
  getWallWidthMM: () => number;
  /** Wall height in MM (for wallpaper) */
  getWallHeightMM: () => number;
  
  // CM conversions for fabric calculations (fabric industry uses CM)
  /** Rail width in CM for fabric calculations */
  getRailWidthCM: () => number;
  /** Drop in CM for fabric calculations */
  getDropCM: () => number;
  
  // Display format helpers
  /** Format rail width for display in user's preferred unit */
  formatRailWidth: () => string;
  /** Format drop for display in user's preferred unit */
  formatDrop: () => string;
}

/**
 * Hook to safely access measurement data
 * 
 * @param measurements - Raw measurement object from database/form (assumes MM internally)
 * @returns Safe accessor methods that always return MM values
 */
export const useSafeMeasurements = (measurements: Record<string, any>): SafeMeasurements => {
  const { units, formatLength } = useMeasurementUnits();
  
  return useMemo(() => {
    // Parse helpers - database stores in MM
    const parseValue = (key: string): number => {
      const value = parseFloat(measurements[key]) || 0;
      // Database values are stored in MM - return as-is
      return value;
    };
    
    return {
      // MM accessors (internal standard)
      getRailWidthMM: () => parseValue('rail_width'),
      getDropMM: () => parseValue('drop'),
      getPoolingMM: () => parseValue('pooling_amount') || parseValue('pooling'),
      getReturnLeftMM: () => parseValue('return_left'),
      getReturnRightMM: () => parseValue('return_right'),
      getStackbackLeftMM: () => parseValue('stackback_left'),
      getStackbackRightMM: () => parseValue('stackback_right'),
      getWallWidthMM: () => parseValue('wall_width'),
      getWallHeightMM: () => parseValue('wall_height'),
      
      // CM accessors for fabric calculations
      getRailWidthCM: () => mmToCM(parseValue('rail_width')),
      getDropCM: () => mmToCM(parseValue('drop')),
      
      // Display formatters
      formatRailWidth: () => {
        const mm = parseValue('rail_width');
        const converted = fromMM(mm, units.length);
        return formatLength(converted);
      },
      formatDrop: () => {
        const mm = parseValue('drop');
        const converted = fromMM(mm, units.length);
        return formatLength(converted);
      }
    };
  }, [measurements, units, formatLength]);
};
