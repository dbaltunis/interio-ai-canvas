import { useMemo } from "react";
import { MeasurementData, TreatmentData, FabricCalculation } from "../types";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
// Note: convertLength removed - we now always assume MM input from database

interface UseFabricCalculatorProps {
  measurements: MeasurementData;
  treatmentData?: TreatmentData;
}

export const useFabricCalculator = ({ 
  measurements, 
  treatmentData 
}: UseFabricCalculatorProps): FabricCalculation | null => {
  const { units } = useMeasurementUnits();
  
  return useMemo(() => {
    // Check if we have minimum required data
    if (!treatmentData?.fabric || 
        !treatmentData?.template || 
        !measurements.rail_width || 
        !measurements.drop) {
      return null;
    }

    try {
      const { fabric, template } = treatmentData;
      
      // CRITICAL: measurements are ALWAYS stored in MM in the database
      // Convert from MM → CM at calculation boundary (MM / 10 = CM)
      const rawWidth = parseFloat(measurements.rail_width);
      const rawHeight = parseFloat(measurements.drop);
      const rawPooling = parseFloat(measurements.pooling_amount || "0");
      
      if (isNaN(rawWidth) || isNaN(rawHeight)) {
        return null;
      }

      // FIXED: Always assume MM input (database standard), convert to CM for calculations
      // This is the THREE-BOUNDARY PATTERN: DB stores MM, calculations use CM
      const width = rawWidth / 10;   // MM to CM
      const height = rawHeight / 10; // MM to CM
      const pooling = rawPooling / 10; // MM to CM
      
      console.log('📐 useFabricCalculator CONVERSION (MM→CM):', { 
        input: { rawWidthMM: rawWidth, rawHeightMM: rawHeight },
        output: { widthCm: width, heightCm: height },
        userDisplayUnit: units.length // for reference only, not used in calculation
      });

      // CRITICAL: Fabric width MUST come from inventory - no hardcoded fallbacks
      const fabricWidthCm = fabric.fabric_width;
      if (!fabricWidthCm) {
        console.error('❌ FABRIC_WIDTH_MISSING: Fabric width not set in inventory for', fabric.name);
        return null; // Return null to show error in UI instead of guessing
      }
      
      // CRITICAL FIX: Prioritize user's heading_fullness selection over template default
      // measurements.heading_fullness = what user selected in fullness dropdown
      // template.fullness_ratio = template default (fallback only)
      const measurementsAny = measurements as any;
      const fullnessRatio = measurementsAny.heading_fullness || measurementsAny.fullness_ratio || template.fullness_ratio;
      if (!fullnessRatio) {
        console.error('❌ FULLNESS_MISSING: No fullness ratio set - select a heading style');
        return null; // Return null to show error in UI instead of guessing
      }
      
      console.log('📐 Fullness calculation:', {
        userSelection: measurementsAny.heading_fullness,
        measurementsFallback: measurementsAny.fullness_ratio,
        templateDefault: template.fullness_ratio,
        USED: fullnessRatio
      });
      
      // Manufacturing allowances - MUST come from template, no hardcoded defaults
      // Use nullish coalescing (??) to ONLY apply defaults when value is null/undefined
      const templateAny = template as any;
      // ✅ FIX: Template is AUTHORITATIVE for manufacturing settings
      // Template values checked FIRST — saved measurement values may be stale 0s
      const headerHem = templateAny.header_allowance ?? templateAny.header_hem ?? measurementsAny.header_hem ?? measurementsAny.header_allowance;
      const bottomHem = templateAny.bottom_hem ?? templateAny.bottom_allowance ?? measurementsAny.bottom_hem ?? measurementsAny.bottom_allowance;
      const sideHems = templateAny.side_hems ?? templateAny.side_hem ?? measurementsAny.side_hems ?? measurementsAny.side_hem;
      const seamHems = templateAny.seam_hems ?? templateAny.seam_allowance ?? measurementsAny.seam_hems ?? measurementsAny.seam_hem;
      const returnLeft = template.return_left ?? measurementsAny.return_left ?? 0;
      const returnRight = template.return_right ?? measurementsAny.return_right ?? 0;
      const wastePercent = template.waste_percent ?? measurementsAny.waste_percent ?? 0;
      
      // Log warning if critical values are missing
      if (headerHem === undefined || bottomHem === undefined) {
        console.warn('[FABRIC_CALC] Missing hem values - template may be incomplete:', { headerHem, bottomHem });
      }
      
      console.log('📏 Fabric calculator using values:', {
        headerHem, bottomHem, sideHems, seamHems, returnLeft, returnRight, wastePercent,
        fromMeasurements: {
          header_hem: measurementsAny.header_hem,
          bottom_hem: measurementsAny.bottom_hem,
          side_hems: measurementsAny.side_hems,
          seam_hems: measurementsAny.seam_hems,
          return_left: measurementsAny.return_left,
          return_right: measurementsAny.return_right
        },
        fromTemplate: {
          header_hem: templateAny.header_hem,
          bottom_hem: templateAny.bottom_hem,
          side_hems: template.side_hems,
          seam_hems: template.seam_hems,
          return_left: template.return_left,
          return_right: template.return_right
        }
      });
      
      // Calculate required width with fullness
      const requiredWidth = width * fullnessRatio;
      
      // Calculate curtain/blind count (supports 'pair' for curtains, 'double' for roman blinds)
      const curtainCount = (template.panel_configuration === 'pair' || template.panel_configuration === 'double') ? 2 : 1;
      
      // Add side hems to width calculation
      const totalSideHems = sideHems * 2 * curtainCount;
      
      // Calculate total width including returns and side hems
      const totalWidthWithAllowances = requiredWidth + returnLeft + returnRight + totalSideHems;
      
      // Calculate how many fabric widths are needed
      const widthsRequired = Math.ceil(totalWidthWithAllowances / fabricWidthCm);

      // Calculate seam allowances for joining fabric pieces
      // CRITICAL FIX: seamHems is TOTAL per join (not per side), so do NOT multiply by 2
      // See ALGORITHM_SPECIFICATION.md section 8.1
      const seamsCount = Math.max(0, widthsRequired - 1);
      const totalSeamAllowance = seamsCount * seamHems;  // Fixed: removed × 2
      
      // Calculate total drop including all allowances
      const totalDrop = height + headerHem + bottomHem + pooling;
      
      // Apply waste multiplier
      const wasteMultiplier = 1 + (wastePercent / 100);
      
      // CRITICAL FIX: Check if fabric is rotated (railroaded/horizontal)
      const isRailroaded = measurementsAny.fabric_rotated === true || measurementsAny.fabric_rotated === 'true';
      
      let linearMeters: number;
      let orderedLinearMeters: number;
      let dropPerWidthMeters: number;
      let horizontalPiecesNeeded = 1; // ✅ CRITICAL FIX: Declare outside if block with default
      let linearMetersPerPiece: number | undefined; // ✅ NEW: Per-piece value for accurate display
      
      if (isRailroaded) {
        // HORIZONTAL/RAILROADED: Fabric width covers drop, buy length for curtain width
        // Linear meters = total curtain width (with fullness + allowances)
        horizontalPiecesNeeded = Math.ceil(totalDrop / fabricWidthCm); // ✅ FIX: Assign to outer variable
        linearMetersPerPiece = (totalWidthWithAllowances / 100) * wasteMultiplier; // ✅ NEW: Per-piece value
        linearMeters = linearMetersPerPiece * horizontalPiecesNeeded; // ✅ Total = per-piece × pieces
        orderedLinearMeters = linearMeters;
        dropPerWidthMeters = linearMetersPerPiece;
        
        console.log('📐 RAILROADED calculation:', {
          totalWidthWithAllowances,
          totalDrop,
          fabricWidthCm,
          horizontalPiecesNeeded,
          linearMeters: `${linearMeters.toFixed(2)}m`
        });
      } else {
        // VERTICAL/STANDARD: Calculate linear metres needed (actual fabric used)
        // ✅ FIX: Seam allowance is added ONCE (between widths), not multiplied per width
        // Formula: (totalDrop × widths + seams) / 100 × waste
        linearMeters = ((totalDrop * widthsRequired) + totalSeamAllowance) / 100 * wasteMultiplier;

        // Calculate ORDERED fabric (full widths must be purchased)
        dropPerWidthMeters = (totalDrop / 100) * wasteMultiplier;
        orderedLinearMeters = dropPerWidthMeters * widthsRequired;
      }
      
      // Calculate remnant (difference between ordered and used)
      const remnantMeters = orderedLinearMeters - linearMeters;

      // 🆕 Calculate seaming labor (if multiple widths)
      // Note: seamsCount is already calculated above at line 129
      const seamLaborHours = seamsCount * 0.25; // 15 minutes per seam

      // ✅ SMART PRICE BASE: Use cost_price when both exist (markup system handles implied markup),
      // otherwise fall back to selling_price or price_per_meter
      const hasBothPrices = (fabric.cost_price || 0) > 0 && (fabric.selling_price || 0) > 0;
      const effectivePricePerMeter = hasBothPrices
        ? fabric.cost_price                    // Scenario A: markup system will add implied markup
        : (fabric.selling_price || fabric.price_per_meter || fabric.cost_price || 0);  // Scenario B/C/D

      // Flag for downstream: does this price already include markup?
      const priceIsAlreadySelling = !hasBothPrices && (fabric.selling_price || 0) > 0;

      // Calculate total cost based on ORDERED fabric (not just used)
      const fabricCost = orderedLinearMeters * effectivePricePerMeter;
      const totalCost = fabricCost;

      return {
        linearMeters,
        orderedLinearMeters,
        remnantMeters,
        totalCost,
        fabricCost,
        pricePerMeter: effectivePricePerMeter,
        widthsRequired,
        seamsCount,
        seamLaborHours,
        railWidth: width,
        fullnessRatio,
        drop: height,
        headerHem,
        bottomHem,
        pooling,
        totalDrop,
        returns: returnLeft + returnRight,
        wastePercent,
        sideHems,
        seamHems,
        totalSeamAllowance,
        totalSideHems,
        returnLeft,
        returnRight,
        curtainCount,
        curtainType: template.panel_configuration || 'pair',
        totalWidthWithAllowances,
        dropPerWidthMeters,
        // ✅ CRITICAL FIX: Add missing fields for display synchronization
        horizontalPiecesNeeded,                    // Number of horizontal pieces (now always returned)
        fabricRotated: isRailroaded,               // Whether fabric is rotated/railroaded
        fabricOrientation: isRailroaded ? 'horizontal' : 'vertical',
        linearMetersPerPiece,                      // Per-piece meters for accurate horizontal display
        leftoverFromLastPiece: undefined,          // For future leftover tracking
        hasBothPrices,                             // Whether fabric has both cost and selling prices
        priceIsAlreadySelling,                     // Whether base price is already the selling price
      };
    } catch (error) {
      console.error('Error calculating fabric usage:', error);
      return null;
    }
  }, [measurements, treatmentData, units.length]);
};