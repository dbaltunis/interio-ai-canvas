import { useMemo } from "react";
import { MeasurementData, TreatmentData, FabricCalculation } from "../types";

interface UseFabricCalculatorProps {
  measurements: MeasurementData;
  treatmentData?: TreatmentData;
}

export const useFabricCalculator = ({ 
  measurements, 
  treatmentData 
}: UseFabricCalculatorProps): FabricCalculation | null => {
  
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
      
      // Parse measurements
      const width = parseFloat(measurements.rail_width);
      const height = parseFloat(measurements.drop);
      const pooling = parseFloat(measurements.pooling_amount || "0");
      
      if (isNaN(width) || isNaN(height)) {
        return null;
      }

      // Fabric and template properties
      const fabricWidthCm = fabric.fabric_width || 137;
      const fullnessRatio = template.fullness_ratio || 2.0;
      
      // Manufacturing allowances from template
      const headerHem = template.header_allowance || 8;
      const bottomHem = template.bottom_hem || 8;
      const sideHems = template.side_hems || 0;
      const seamHems = template.seam_hems || 0;
      const returnLeft = template.return_left || 0;
      const returnRight = template.return_right || 0;
      const wastePercent = template.waste_percent || 0;
      
      // Calculate required width with fullness
      const requiredWidth = width * fullnessRatio;
      
      // Calculate curtain count
      const curtainCount = template.curtain_type === 'pair' ? 2 : 1;
      
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
      
      // Calculate linear metres needed
      const linearMeters = ((totalDrop + totalSeamAllowance) / 100) * widthsRequired * wasteMultiplier;
      
      // Calculate total cost
      const totalCost = linearMeters * fabric.price_per_meter;

      return {
        linearMeters,
        totalCost,
        pricePerMeter: fabric.price_per_meter,
        widthsRequired,
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
        curtainType: template.curtain_type,
        totalWidthWithAllowances
      };
    } catch (error) {
      console.error('Error calculating fabric usage:', error);
      return null;
    }
  }, [measurements, treatmentData]);
};