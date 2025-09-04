import { CurtainVisualizer } from "./CurtainVisualizer";
import { BlindVisualizer } from "./BlindVisualizer";
import { DynamicWindowRenderer } from "../window-types/DynamicWindowRenderer";

interface TreatmentPreviewEngineProps {
  windowType: string;
  treatmentType: string;
  measurements: Record<string, any>;
  template?: any;
  selectedItems?: {
    fabric?: any;
    hardware?: any;
    material?: any;
  };
  showWindowOnly?: boolean;
  className?: string;
}

export const TreatmentPreviewEngine = ({
  windowType,
  treatmentType,
  measurements,
  template,
  selectedItems = {},
  showWindowOnly = false,
  className = ""
}: TreatmentPreviewEngineProps) => {
  
  if (showWindowOnly) {
    return (
      <DynamicWindowRenderer
        windowType={windowType}
        measurements={measurements}
        selectedTreatment={null}
        className={className}
      />
    );
  }

  const renderTreatmentVisualizer = () => {
    switch (treatmentType) {
      case "curtains":
        return (
          <CurtainVisualizer
            windowType={windowType}
            measurements={measurements}
            template={template}
            fabric={selectedItems.fabric}
            hardware={selectedItems.hardware}
            className={className}
          />
        );
      
      case "blinds":
      case "venetian_blinds":
      case "vertical_blinds":
      case "roller_blinds":
        return (
          <BlindVisualizer
            windowType={windowType}
            measurements={measurements}
            template={template}
            material={selectedItems.material}
            className={className}
          />
        );
      
      default:
        return (
          <DynamicWindowRenderer
            windowType={windowType}
            measurements={measurements}
            selectedTreatment={{ type: treatmentType, template, selectedItems }}
            className={className}
          />
        );
    }
  };

  return (
    <div className="relative">
      {renderTreatmentVisualizer()}
      
      {/* Treatment type indicator */}
      <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded p-2 text-xs">
        <div className="font-medium">
          {treatmentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
        {template?.name && (
          <div className="text-muted-foreground">
            {template.name}
          </div>
        )}
      </div>
    </div>
  );
};