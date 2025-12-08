/**
 * useCurtainEngine.ts
 * 
 * React hook that wraps CalculationEngine for curtains/roman_blinds.
 * Uses the same builders from shadowModeRunner.
 * 
 * Returns null for non-curtain types or if required data is missing.
 */
import { useMemo } from "react";
import { CalculationEngine, type CalculationInput } from "./CalculationEngine";
import type { TreatmentCategoryDbValue, CalculationResultContract } from "@/contracts/TreatmentContract";
import {
  buildMeasurements,
  buildTemplate,
  buildFabric,
  buildOptions,
} from "./shadowModeRunner";

interface UseCurtainEngineArgs {
  treatmentCategory: string;
  surfaceId?: string;
  projectId?: string;
  measurements: Record<string, any>;
  selectedTemplate: any;
  selectedFabric: any;
  selectedOptions: any[];
  units: { length: string };
}

export interface CurtainEngineResult extends CalculationResultContract {
  // Additional convenience properties for display
  fullness?: number;
  totalWidthCm?: number;
  totalDropCm?: number;
}

export function useCurtainEngine({
  treatmentCategory,
  measurements,
  selectedTemplate,
  selectedFabric,
  selectedOptions,
  units,
}: UseCurtainEngineArgs): CurtainEngineResult | null {
  return useMemo(() => {
    // Only process curtains and roman_blinds
    if (
      treatmentCategory !== "curtains" &&
      treatmentCategory !== "roman_blinds"
    ) {
      return null;
    }

    try {
      // Build contracts using shared builders
      const measContract = buildMeasurements(measurements, units);
      if (!measContract) {
        console.debug("[CURTAIN_ENGINE] Missing measurements contract");
        return null;
      }

      const templateContract = buildTemplate(
        selectedTemplate,
        treatmentCategory as TreatmentCategoryDbValue
      );
      if (!templateContract) {
        console.debug("[CURTAIN_ENGINE] Missing template contract");
        return null;
      }

      const fabricContract = buildFabric(selectedFabric);
      if (!fabricContract) {
        console.debug("[CURTAIN_ENGINE] Missing fabric contract");
        return null;
      }

      const optionsContract = buildOptions(selectedOptions);

      // Build calculation input
      const input: CalculationInput = {
        category: treatmentCategory as TreatmentCategoryDbValue,
        measurements: measContract,
        template: templateContract,
        fabric: fabricContract,
        options: optionsContract,
      };

      // Run calculation
      const result = CalculationEngine.calculate(input);

      // Extract convenience values from formula breakdown
      const values = result.formula_breakdown?.values || {};
      
      return {
        ...result,
        fullness: values['fullness'] as number | undefined,
        totalWidthCm: values['total_width_cm'] as number | undefined,
        totalDropCm: values['total_drop_cm'] as number | undefined,
      };
    } catch (error) {
      console.warn("[CURTAIN_ENGINE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        treatmentCategory,
      });
      return null;
    }
  }, [
    treatmentCategory,
    measurements,
    selectedTemplate,
    selectedFabric,
    selectedOptions,
    units,
  ]);
}
