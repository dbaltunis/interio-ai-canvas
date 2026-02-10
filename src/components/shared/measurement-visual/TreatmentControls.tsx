import { TreatmentData } from "./types";

interface TreatmentControlsProps {
  treatmentData?: TreatmentData;
  onTreatmentChange?: (changes: Partial<TreatmentData>) => void;
  showFabricSelection?: boolean;
  showTreatmentOptions?: boolean;
  readOnly?: boolean;
}

export const TreatmentControls = ({
  treatmentData,
  onTreatmentChange,
  showFabricSelection = false,
  showTreatmentOptions = false,
  readOnly = false,
}: TreatmentControlsProps) => {
  return (
    <div className="space-y-4">
      {showFabricSelection && (
        <div>
          <p className="text-sm font-medium">Fabric</p>
          <p className="text-sm text-muted-foreground">
            {treatmentData?.fabric?.name || 'No fabric selected'}
          </p>
        </div>
      )}
      {showTreatmentOptions && treatmentData?.template && (
        <div>
          <p className="text-sm font-medium">Template</p>
          <p className="text-sm text-muted-foreground">
            {treatmentData.template.name}
          </p>
        </div>
      )}
    </div>
  );
};
