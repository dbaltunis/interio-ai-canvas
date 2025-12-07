import { useMemo } from "react";
import { MeasurementData, TreatmentData, FabricCalculation } from "../types";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { convertLength } from "@/hooks/useBusinessSettings";

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
      
      // Parse measurements - these are in the user's preferred unit
      const widthInUserUnit = parseFloat(measurements.rail_width);
      const heightInUserUnit = parseFloat(measurements.drop);
      const poolingInUserUnit = parseFloat(measurements.pooling_amount || "0");
      
      if (isNaN(widthInUserUnit) || isNaN(heightInUserUnit)) {
        return null;
      }

      // Convert all measurements to cm (internal calculation unit)
      const width = convertLength(widthInUserUnit, units.length, 'cm');
      const height = convertLength(heightInUserUnit, units.length, 'cm');
      const pooling = convertLength(poolingInUserUnit, units.length, 'cm');

      // Fabric width is stored in cm, no conversion needed
      const fabricWidthCm = fabric.fabric_width || 137;
      
      // CRITICAL FIX: Prioritize user's heading_fullness selection over template default
      // measurements.heading_fullness = what user selected in fullness dropdown
      // template.fullness_ratio = template default (fallback only)
      const measurementsAny = measurements as any;
      const fullnessRatio = measurementsAny.heading_fullness || measurementsAny.fullness_ratio || template.fullness_ratio || 2.0;
      
      console.log('📐 Fullness calculation:', {
        userSelection: measurementsAny.heading_fullness,
        measurementsFallback: measurementsAny.fullness_ratio,
        templateDefault: template.fullness_ratio,
        USED: fullnessRatio
      });
      
      // Manufacturing allowances - prioritize measurements, fallback to template
      // Use nullish coalescing (??) to ONLY apply defaults when value is null/undefined, NOT when it's 0
      const templateAny = template as any;
      const headerHem = measurementsAny.header_hem ?? measurementsAny.header_allowance ?? templateAny.header_allowance ?? templateAny.header_hem ?? 8;
      const bottomHem = measurementsAny.bottom_hem ?? measurementsAny.bottom_allowance ?? templateAny.bottom_hem ?? templateAny.bottom_allowance ?? 15;
      const sideHems = measurementsAny.side_hems ?? measurementsAny.side_hem ?? templateAny.side_hem ?? template.side_hems ?? 7.5;
      const seamHems = measurementsAny.seam_hems ?? measurementsAny.seam_hem ?? templateAny.seam_allowance ?? template.seam_hems ?? 1.5;
      const returnLeft = measurementsAny.return_left ?? template.return_left ?? 0;
      const returnRight = measurementsAny.return_right ?? template.return_right ?? 0;
      const wastePercent = measurementsAny.waste_percent ?? template.waste_percent ?? 5;
      
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
      const totalSeamAllowance = widthsRequired > 1 ? (widthsRequired - 1) * seamHems * 2 : 0;
      
      // Calculate total drop including all allowances
      const totalDrop = height + headerHem + bottomHem + pooling;
      
      // Apply waste multiplier
      const wasteMultiplier = 1 + (wastePercent / 100);
      
      // Calculate linear metres needed (actual fabric used)
      const linearMeters = ((totalDrop + totalSeamAllowance) / 100) * widthsRequired * wasteMultiplier;
      
      // 🆕 Calculate ORDERED fabric (full widths must be purchased)
      const dropPerWidthMeters = (totalDrop / 100) * wasteMultiplier;
      const orderedLinearMeters = dropPerWidthMeters * widthsRequired;
      
      // 🆕 Calculate remnant (difference between ordered and used)
      const remnantMeters = orderedLinearMeters - linearMeters;
      
      // 🆕 Calculate seaming labor (if multiple widths)
      const seamsCount = widthsRequired > 1 ? widthsRequired - 1 : 0;
      const seamLaborHours = seamsCount * 0.25; // 15 minutes per seam
      
      // Calculate total cost based on ORDERED fabric (not just used)
      const fabricCost = orderedLinearMeters * fabric.price_per_meter;
      const totalCost = fabricCost;

      return {
        linearMeters,
        orderedLinearMeters,
        remnantMeters,
        totalCost,
        fabricCost,
        pricePerMeter: fabric.price_per_meter,
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
        dropPerWidthMeters
      };
    } catch (error) {
      console.error('Error calculating fabric usage:', error);
      return null;
    }
  }, [measurements, treatmentData, units.length]);
};