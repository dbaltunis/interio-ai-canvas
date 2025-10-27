/**
 * Centralized wallpaper calculation utility
 * Ensures consistent calculations across all components
 */

export interface WallpaperCalculation {
  stripsNeeded: number;
  rollsNeeded: number;
  totalMeters: number;
  quantity: number;
  unitLabel: string;
  pricePerUnit: number;
  totalCost: number;
  lengthPerStripM: number;
  lengthPerStripCm: number;
  soldBy: 'per_roll' | 'per_meter' | 'per_sqm';
  squareMeters: number;
  stripsPerRoll: number;
  leftoverStrips: number;
  leftoverLengthM: number;
  wastePercentage: number;
  patternRepeatsInStrip: number;
  matchType: string;
}

export const calculateWallpaperCost = (
  wallWidthCm: number,
  wallHeightCm: number,
  wallpaper: any
): WallpaperCalculation | null => {
  console.log('📐 calculateWallpaperCost called:', {
    wallWidthCm,
    wallHeightCm,
    wallpaperName: wallpaper?.name,
    wallpaperData: wallpaper
  });
  
  if (!wallWidthCm || !wallHeightCm || !wallpaper) {
    console.warn('❌ calculateWallpaperCost: Missing required data', {
      hasWidth: !!wallWidthCm,
      hasHeight: !!wallHeightCm,
      hasWallpaper: !!wallpaper
    });
    return null;
  }

  const rollWidth = wallpaper.wallpaper_roll_width || 53; // cm
  const rollLength = wallpaper.wallpaper_roll_length || 10; // meters
  const patternRepeat = wallpaper.pattern_repeat_vertical || 0; // cm
  const matchType = wallpaper.wallpaper_match_type || 'straight';
  const wasteFactor = wallpaper.wallpaper_waste_factor || 10; // percentage
  
  // Calculate length per strip based on pattern matching
  let lengthPerStripCm = wallHeightCm;
  let patternRepeatsInStrip = 0;
  
  if (patternRepeat > 0 && matchType !== 'none' && matchType !== 'random') {
    // Add ONE pattern repeat for matching
    lengthPerStripCm = wallHeightCm + patternRepeat;
    patternRepeatsInStrip = Math.ceil(wallHeightCm / patternRepeat);
  }
  const lengthPerStripM = lengthPerStripCm / 100;
  
  // Calculate strips and rolls
  const stripsNeeded = Math.ceil(wallWidthCm / rollWidth);
  const stripsPerRoll = Math.floor(rollLength / lengthPerStripM);
  const rollsNeeded = stripsPerRoll > 0 ? Math.ceil(stripsNeeded / stripsPerRoll) : 0;
  const totalMeters = stripsNeeded * lengthPerStripM;
  
  // Calculate leftover material
  const totalStripsFromRolls = rollsNeeded * stripsPerRoll;
  const leftoverStrips = totalStripsFromRolls - stripsNeeded;
  const leftoverLengthM = leftoverStrips * lengthPerStripM;
  
  // Calculate cost based on selling method
  const pricePerUnit = wallpaper.unit_price || wallpaper.selling_price || wallpaper.price_per_meter || 0;
  const soldBy = (wallpaper.wallpaper_sold_by || 'per_meter') as 'per_roll' | 'per_meter' | 'per_sqm';
  
  let quantity = totalMeters;
  let unitLabel = 'meter';
  
  if (soldBy === 'per_roll') {
    quantity = rollsNeeded;
    unitLabel = 'roll';
  } else if (soldBy === 'per_sqm') {
    quantity = (wallWidthCm * wallHeightCm) / 10000; // cm² to m²
    unitLabel = 'm²';
  }
  
  const totalCost = quantity * pricePerUnit;
  const squareMeters = (wallWidthCm * wallHeightCm) / 10000;
  
  const result = {
    stripsNeeded,
    rollsNeeded,
    totalMeters,
    quantity,
    unitLabel,
    pricePerUnit,
    totalCost,
    lengthPerStripM,
    lengthPerStripCm,
    soldBy,
    squareMeters,
    stripsPerRoll,
    leftoverStrips,
    leftoverLengthM,
    wastePercentage: wasteFactor,
    patternRepeatsInStrip,
    matchType
  };
  
  console.log('✅ calculateWallpaperCost result:', result);
  
  return result;
};
