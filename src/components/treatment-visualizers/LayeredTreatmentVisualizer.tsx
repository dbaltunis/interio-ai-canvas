import { CurtainVisualizer } from "./CurtainVisualizer";
import { BlindVisualizer } from "./BlindVisualizer";
import { RomanBlindVisualizer } from "./RomanBlindVisualizer";
import { VenetianBlindVisualizer } from "./VenetianBlindVisualizer";
import { ShutterVisualizer } from "./ShutterVisualizer";
import { DynamicWindowRenderer } from "../window-types/DynamicWindowRenderer";

interface LayeredTreatment {
  id: string;
  type: string;
  template?: any;
  selectedItems?: {
    fabric?: any;
    hardware?: any;
    material?: any;
  };
  zIndex: number;
  opacity?: number;
}

interface LayeredTreatmentVisualizerProps {
  windowType: string;
  measurements: Record<string, any>;
  treatments: LayeredTreatment[];
  className?: string;
}

export const LayeredTreatmentVisualizer = ({
  windowType,
  measurements,
  treatments,
  className = ""
}: LayeredTreatmentVisualizerProps) => {
  
  const renderSingleTreatment = (treatment: LayeredTreatment) => {
    const treatmentProps = {
      windowType,
      measurements,
      template: treatment.template,
      className: "absolute inset-0",
      style: {
        zIndex: treatment.zIndex,
        opacity: treatment.opacity || 1
      }
    };

    switch (treatment.type) {
      case "curtains":
        return (
          <div key={treatment.id} style={treatmentProps.style} className={treatmentProps.className}>
            <CurtainVisualizer
              windowType={windowType}
              measurements={measurements}
              template={treatment.template}
              fabric={treatment.selectedItems?.fabric}
              hardware={treatment.selectedItems?.hardware}
            />
          </div>
        );
      
      case "roman_blinds":
        return (
          <div key={treatment.id} style={treatmentProps.style} className={treatmentProps.className}>
            <RomanBlindVisualizer
              windowType={windowType}
              measurements={measurements}
              template={treatment.template}
              material={treatment.selectedItems?.material}
              foldStyle={treatment.template?.fold_style || 'classic'}
              mounted={treatment.template?.mount_type || 'outside'}
            />
          </div>
        );
      
      case "venetian_blinds":
        return (
          <div key={treatment.id} style={treatmentProps.style} className={treatmentProps.className}>
            <VenetianBlindVisualizer
              windowType={windowType}
              measurements={measurements}
              template={treatment.template}
              material={treatment.selectedItems?.material}
              slatSize={treatment.template?.slat_size || '25mm'}
              slatAngle={treatment.template?.default_angle || 45}
              mounted={treatment.template?.mount_type || 'inside'}
            />
          </div>
        );
      
      case "shutters":
      case "plantation_shutters":
        return (
          <div key={treatment.id} style={treatmentProps.style} className={treatmentProps.className}>
            <ShutterVisualizer
              windowType={windowType}
              measurements={measurements}
              template={treatment.template}
              material={treatment.selectedItems?.material}
              panelConfig={treatment.template?.panel_config || 'bifold'}
              louverSize={treatment.template?.louver_size || '63mm'}
              frameStyle={treatment.template?.frame_style || 'L-frame'}
              mounted={treatment.template?.mount_type || 'inside'}
            />
          </div>
        );
      
      case "blinds":
      case "vertical_blinds":
      case "roller_blinds":
        return (
          <div key={treatment.id} style={treatmentProps.style} className={treatmentProps.className}>
            <BlindVisualizer
              windowType={windowType}
              measurements={measurements}
              template={treatment.template}
              material={treatment.selectedItems?.material}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  // Sort treatments by z-index to ensure proper layering
  const sortedTreatments = [...treatments].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className={`relative ${className}`}>
      {/* Base window renderer */}
      <DynamicWindowRenderer
        windowType={windowType}
        measurements={measurements}
        selectedTreatment={null}
        enhanced={true}
      />
      
      {/* Layered treatments */}
      {sortedTreatments.map(treatment => renderSingleTreatment(treatment))}
      
      {/* Treatment layers indicator */}
      <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded p-2 text-xs">
        <div className="font-medium">
          Layered Treatments ({treatments.length})
        </div>
        {treatments.map((treatment, index) => (
          <div key={treatment.id} className="text-muted-foreground text-[10px]">
            Layer {index + 1}: {treatment.type.replace('_', ' ')}
          </div>
        ))}
      </div>
    </div>
  );
};