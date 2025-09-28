// Main component exports
export { MeasurementVisual } from "./MeasurementVisual";
export { 
  PreviewMeasurementVisual,
  CompactMeasurementVisual, 
  EditableMeasurementVisual,
  WorkOrderMeasurementVisual
} from "./MeasurementVisual";

// Core components
export { MeasurementVisualCore } from "./MeasurementVisualCore";
export { MeasurementInputs } from "./MeasurementInputs";
export { TreatmentControls } from "./TreatmentControls";
export { CalculationDisplay } from "./CalculationDisplay";
export { ProjectInfoDisplay } from "./ProjectInfoDisplay";

// Data provider
export { ProjectDataProvider, useProjectData, useProjectDataExtractor } from "./ProjectDataProvider";

// Hooks
export { useFabricCalculator } from "./hooks/useFabricCalculator";

// Types
export type {
  MeasurementData,
  TreatmentData,
  ProjectData,
  VisualConfig,
  FabricCalculation,
  MeasurementVisualProps
} from "./types";

// Utility function to create measurement visual configurations
import { VisualConfig } from "./types";

export const createVisualConfig = (overrides: Partial<VisualConfig> = {}): VisualConfig => ({
  showMeasurementInputs: false,
  showFabricSelection: false,
  showTreatmentOptions: false,
  showCalculations: false,
  readOnly: false,
  compact: false,
  hideHeader: false,
  allowEditing: true,
  ...overrides
});

// Pre-configured configs for common use cases
export const VISUAL_CONFIGS = {
  PREVIEW: createVisualConfig({
    readOnly: true,
    showCalculations: true,
  }),
  COMPACT: createVisualConfig({
    compact: true,
    hideHeader: true,
    readOnly: true,
  }),
  EDITABLE: createVisualConfig({
    showMeasurementInputs: true,
    showFabricSelection: true,
    showTreatmentOptions: true,
    showCalculations: true,
    allowEditing: true,
  }),
  WORK_ORDER: createVisualConfig({
    readOnly: true,
    showCalculations: true,
    customTitle: "Work Order - Window Specifications",
  }),
  CLIENT_PREVIEW: createVisualConfig({
    readOnly: true,
    showCalculations: false,
    customTitle: "Window Treatment Preview",
  }),
  QUOTE_DISPLAY: createVisualConfig({
    readOnly: true,
    showCalculations: true,
    customTitle: "Quote - Window Treatment Details",
  })
};