import { useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MeasurementVisualCore } from "./MeasurementVisualCore";
import { MeasurementInputs } from "./MeasurementInputs";
import { TreatmentControls } from "./TreatmentControls";
import { CalculationDisplay } from "./CalculationDisplay";
import { ProjectInfoDisplay } from "./ProjectInfoDisplay";
import { useFabricCalculator } from "./hooks/useFabricCalculator";
import { MeasurementVisualProps, FabricCalculation } from "./types";

export const MeasurementVisual = ({
  measurements,
  treatmentData,
  projectData,
  config = {},
  onMeasurementChange,
  onTreatmentChange,
  onCalculationChange,
  className = ""
}: MeasurementVisualProps) => {
  
  // Calculate fabric usage
  const fabricCalculation = useFabricCalculator({
    measurements,
    treatmentData
  });

  // Notify parent when calculation changes
  useEffect(() => {
    onCalculationChange?.(fabricCalculation);
  }, [fabricCalculation, onCalculationChange]);

  const {
    showMeasurementInputs = false,
    showFabricSelection = false,
    showTreatmentOptions = false,
    showCalculations = false,
    readOnly = false,
    compact = false,
    hideHeader = false,
    customTitle,
    allowEditing = true
  } = config;

  const title = customTitle || 
    (projectData?.name ? `${projectData.name} - Window Measurement` : "Window Measurement Worksheet");

  if (compact) {
    return (
      <div className={`w-full ${className}`}>
        <MeasurementVisualCore
          measurements={measurements}
          treatmentData={treatmentData}
          config={config}
        />
        {showCalculations && fabricCalculation && (
          <div className="mt-4">
            <CalculationDisplay calculation={fabricCalculation} compact />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full container-level-1 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      {!hideHeader && (
        <div className="container-level-2 border-b-2 border-border px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-card-foreground">{title}</h2>
            {projectData && (
              <ProjectInfoDisplay projectData={projectData} />
            )}
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Visual Diagram */}
          <div className="lg:w-1/2 lg:flex-shrink-0 lg:sticky lg:top-4 lg:h-fit lg:max-h-[calc(100vh-120px)] lg:overflow-visible">
            <MeasurementVisualCore
              measurements={measurements}
              treatmentData={treatmentData}
              config={config}
            />
          </div>

          {/* Controls and Information */}
          <div className="lg:w-1/2 space-y-6">
            {/* Project Information */}
            {projectData && !hideHeader && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectInfoDisplay projectData={projectData} detailed />
                </CardContent>
              </Card>
            )}

            {/* Measurement Inputs */}
            {showMeasurementInputs && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Measurements</CardTitle>
                </CardHeader>
                <CardContent>
                  <MeasurementInputs
                    measurements={measurements}
                    onMeasurementChange={onMeasurementChange}
                    readOnly={readOnly || !allowEditing}
                  />
                </CardContent>
              </Card>
            )}

            {/* Treatment Controls */}
            {(showFabricSelection || showTreatmentOptions) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Treatment Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <TreatmentControls
                    treatmentData={treatmentData}
                    onTreatmentChange={onTreatmentChange}
                    showFabricSelection={showFabricSelection}
                    showTreatmentOptions={showTreatmentOptions}
                    readOnly={readOnly || !allowEditing}
                  />
                </CardContent>
              </Card>
            )}

            {/* Calculation Display */}
            {showCalculations && fabricCalculation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fabric Calculation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CalculationDisplay calculation={fabricCalculation} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Export convenience components for different use cases
export const PreviewMeasurementVisual = (props: Omit<MeasurementVisualProps, 'config'>) => (
  <MeasurementVisual
    {...props}
    config={{
      readOnly: true,
      showCalculations: true,
      compact: false,
    }}
  />
);

export const CompactMeasurementVisual = (props: Omit<MeasurementVisualProps, 'config'>) => (
  <MeasurementVisual
    {...props}
    config={{
      compact: true,
      hideHeader: true,
      readOnly: true,
    }}
  />
);

export const EditableMeasurementVisual = (props: Omit<MeasurementVisualProps, 'config'>) => (
  <MeasurementVisual
    {...props}
    config={{
      showMeasurementInputs: true,
      showFabricSelection: true,
      showTreatmentOptions: true,
      showCalculations: true,
      allowEditing: true,
    }}
  />
);

export const WorkOrderMeasurementVisual = (props: Omit<MeasurementVisualProps, 'config'>) => (
  <MeasurementVisual
    {...props}
    config={{
      readOnly: true,
      showCalculations: true,
      customTitle: "Work Order - Window Specifications",
    }}
  />
);