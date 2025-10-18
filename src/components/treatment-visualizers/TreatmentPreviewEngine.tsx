import { CurtainVisualizer } from "./CurtainVisualizer";
import { BlindVisualizer } from "./BlindVisualizer";
import { RomanBlindVisualizer } from "./RomanBlindVisualizer";
import { VenetianBlindVisualizer } from "./VenetianBlindVisualizer";
import { ShutterVisualizer } from "./ShutterVisualizer";
import { CellularShadeVisualizer } from "./CellularShadeVisualizer";
import { VerticalBlindVisualizer } from "./VerticalBlindVisualizer";
import { PanelGlideVisualizer } from "./PanelGlideVisualizer";
import { AwningVisualizer } from "./AwningVisualizer";
import { LayeredTreatmentVisualizer } from "./LayeredTreatmentVisualizer";
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
  layeredTreatments?: LayeredTreatment[];
  hideDetails?: boolean;  // New prop to hide text overlays
  showProductOnly?: boolean;  // New prop to show only product image
}

export const TreatmentPreviewEngine = ({
  windowType,
  treatmentType,
  measurements,
  template,
  selectedItems = {},
  showWindowOnly = false,
  className = "",
  layeredTreatments = [],
  hideDetails = false,
  showProductOnly = false
}: TreatmentPreviewEngineProps) => {
  
  // If showing product only, prioritize fabric image when fabric is selected, otherwise use template
  if (showProductOnly) {
    // Priority: fabric (if selected from inventory) → material (for blinds/shutters) → template (default)
    const productImage = selectedItems.fabric?.image_url || selectedItems.material?.image_url || template?.image_url;
    const productName = selectedItems.fabric?.name || selectedItems.material?.name || template?.name || 'Product';
    
    console.log("🖼️ Product image data:", { 
      templateImage: template?.image_url?.substring(0, 50), 
      fabricImage: selectedItems.fabric?.image_url?.substring(0, 50),
      materialImage: selectedItems.material?.image_url?.substring(0, 50),
      productName,
      hasFallback: !productImage
    });
    
    // If we have a product image, display it
    if (productImage) {
      return (
        <div className={`relative w-full h-full ${className}`}>
          <img 
            src={productImage} 
            alt={productName} 
            className="w-full h-full object-cover rounded-md"
            onError={(e) => {
              console.error("❌ Failed to load image:", productImage?.substring(0, 100));
            }}
          />
        </div>
      );
    }
    
    // Fallback to treatment visualizer if no product image is available
    // This ensures the image area is never empty
  }
  
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

  // Handle layered treatments
  if (layeredTreatments.length > 0) {
    return (
      <LayeredTreatmentVisualizer
        windowType={windowType}
        measurements={measurements}
        treatments={layeredTreatments}
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
      
      case "roman_blinds":
        return (
          <RomanBlindVisualizer
            windowType={windowType}
            measurements={measurements}
            template={template}
            material={selectedItems.material}
            className={className}
            foldStyle={template?.fold_style || 'classic'}
            mounted={template?.mount_type || 'outside'}
          />
        );
      
      case "venetian_blinds":
        return (
          <VenetianBlindVisualizer
            windowType={windowType}
            measurements={measurements}
            template={template}
            material={selectedItems.material}
            className={className}
            slatSize={template?.slat_size || '25mm'}
            slatAngle={template?.default_angle || 45}
            mounted={template?.mount_type || 'inside'}
          />
        );
      
      case "shutters":
      case "plantation_shutters":
        return (
          <ShutterVisualizer
            windowType={windowType}
            measurements={measurements}
            template={template}
            material={selectedItems.material}
            className={className}
            panelConfig={template?.panel_config || 'bifold'}
            louverSize={template?.louver_size || '63mm'}
            frameStyle={template?.frame_style || 'L-frame'}
            mounted={template?.mount_type || 'inside'}
          />
        );
      
      case "cellular_blinds":
      case "cellular_shades":
        return (
          <CellularShadeVisualizer
            windowType={windowType}
            measurements={measurements}
            template={template}
            material={selectedItems.material}
            className={className}
            cellSize={template?.cell_size || 'double'}
            mounted={template?.mount_type || 'inside'}
          />
        );
      
      case "vertical_blinds":
        return (
          <VerticalBlindVisualizer
            windowType={windowType}
            measurements={measurements}
            template={template}
            material={selectedItems.material}
            className={className}
            slatWidth={template?.slat_width || 89}
            controlSide={template?.control_side || 'left'}
          />
        );
      
      case "panel_glide":
        return (
          <PanelGlideVisualizer
            windowType={windowType}
            measurements={measurements}
            template={template}
            material={selectedItems.material}
            className={className}
            numPanels={template?.num_panels || 4}
          />
        );
      
      case "awning":
        return (
          <AwningVisualizer
            windowType={windowType}
            measurements={measurements}
            template={template}
            material={selectedItems.material}
            className={className}
            isRetractable={template?.retractable !== false}
            frameType={measurements.frame_type || template?.frame_type || 'retractable'}
            controlType={measurements.control_type || template?.control_type || 'manual'}
            fabricPattern={measurements.fabric_pattern || template?.fabric_pattern || 'striped'}
            valanceStyle={measurements.valance_style || template?.valance_style || 'scalloped'}
            projection={measurements.projection ? parseFloat(measurements.projection) : undefined}
          />
        );
      
      case "blinds":
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
            enhanced={true}
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