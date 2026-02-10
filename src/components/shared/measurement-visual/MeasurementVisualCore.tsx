import { MeasurementData, TreatmentData, VisualConfig } from "./types";

interface MeasurementVisualCoreProps {
  measurements: MeasurementData;
  treatmentData?: TreatmentData;
  config?: VisualConfig;
}

export const MeasurementVisualCore = ({
  measurements,
  treatmentData,
  config = {},
}: MeasurementVisualCoreProps) => {
  const railWidth = parseFloat(measurements.rail_width || '0');
  const drop = parseFloat(measurements.drop || '0');

  return (
    <div className="relative w-full aspect-[4/3] border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center bg-muted/10">
      {/* Window visual */}
      <div className="relative w-3/4 h-3/4 border-2 border-primary/40 bg-primary/5 rounded flex flex-col items-center justify-center">
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground">
            {railWidth > 0 ? `W: ${railWidth}` : 'Width: --'}
          </p>
          <p className="text-sm font-medium text-foreground">
            {drop > 0 ? `D: ${drop}` : 'Drop: --'}
          </p>
          {treatmentData?.template?.name && (
            <p className="text-xs text-muted-foreground mt-2">
              {treatmentData.template.name}
            </p>
          )}
          {treatmentData?.fabric?.name && (
            <p className="text-xs text-muted-foreground">
              {treatmentData.fabric.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
