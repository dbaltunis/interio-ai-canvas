import { CurtainVisualizer } from "./CurtainVisualizer";
import { BlindVisualizer } from "./BlindVisualizer";
import { RomanBlindVisualizer } from "./RomanBlindVisualizer";
import { VenetianBlindVisualizer } from "./VenetianBlindVisualizer";
import { ShutterVisualizer } from "./ShutterVisualizer";
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
  
  // If showing product only, display the template image or fabric/material image
  if (showProductOnly) {
    const productImage = template?.image_url || selectedItems.fabric?.image_url || selectedItems.material?.image_url;
    const productName = template?.name || selectedItems.fabric?.name || selectedItems.material?.name || 'Product';
    
    console.log("🖼️ Product image data:", { 
      templateImage: template?.image_url?.substring(0, 50), 
      fabricImage: selectedItems.fabric?.image_url?.substring(0, 50),
      materialImage: selectedItems.material?.image_url?.substring(0, 50),
      productName 
    });
    
    return (
      <div className={`relative w-full h-full ${className}`}>
        {productImage ? (
          <img 
            src={productImage} 
            alt={productName} 
            className="w-full h-full object-cover rounded-md"
            onError={(e) => {
              console.error("❌ Failed to load image:", productImage?.substring(0, 100));
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-full h-full bg-gradient-to-br from-muted to-muted/50 rounded-md flex items-center justify-center ${productImage ? 'hidden' : ''}`}>
          <div className="text-center text-muted-foreground">
            <p className="text-sm">No image available</p>
          </div>
        </div>
      </div>
    );
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
      
      case "blinds":
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