import { CurtainVisualizer } from "./CurtainVisualizer";
import { BlindVisualizer } from "./BlindVisualizer";
import { RomanBlindVisualizer } from "./RomanBlindVisualizer";
import { VenetianBlindVisualizer } from "./VenetianBlindVisualizer";
import { ShutterVisualizer } from "./ShutterVisualizer";
import { CellularShadeVisualizer } from "./CellularShadeVisualizer";
import { VerticalBlindVisualizer } from "./VerticalBlindVisualizer";
import { PanelGlideVisualizer } from "./PanelGlideVisualizer";
import { AwningVisualizer } from "./AwningVisualizer";
import { WallpaperVisualizer } from "./WallpaperVisualizer";
import { LayeredTreatmentVisualizer } from "./LayeredTreatmentVisualizer";
import { DynamicWindowRenderer } from "../window-types/DynamicWindowRenderer";
import { ProductImageWithColorFallback } from "@/components/ui/ProductImageWithColorFallback";

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
  hideDetails?: boolean;
  showProductOnly?: boolean;
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
  
  // If showing product only, use ProductImageWithColorFallback for clean display
  if (showProductOnly) {
    // ✅ PRIORITY: Template image FIRST, then fabric/material image
    // This ensures treatment templates with custom images are shown even when fabric has no image
    const productImage = template?.image_url || template?.display_image_url || selectedItems.fabric?.image_url || selectedItems.material?.image_url;
    const productName = selectedItems.fabric?.name || selectedItems.material?.name || template?.name || 'Product';
    const productColor = selectedItems.fabric?.color || selectedItems.material?.color;
    
    // Determine category for icon fallback
    const isMaterialBased = ['venetian_blinds', 'vertical_blinds', 'cellular_blinds', 'cellular_shades', 'shutters', 'plantation_shutters'].includes(treatmentType);
    const category = isMaterialBased ? 'material' : 'fabric';
    
    // Use ProductImageWithColorFallback - handles image, color swatch, or category icon
    return (
      <div className={`relative w-full h-full ${className}`}>
        <ProductImageWithColorFallback
          imageUrl={productImage}
          color={productColor}
          productName={productName}
          category={category}
          size={96}
          rounded="md"
          className="w-full h-full"
        />
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
            hideDetails={hideDetails}
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
            configuration={measurements?.curtain_type || 'single'}
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
      
      case "shutter":
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
            selectedColor={selectedItems.material?.color}
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
            material={selectedItems.fabric || selectedItems.material}
            className={className}
            isRetractable={template?.retractable !== false}
            frameType={measurements.frame_type || template?.frame_type || 'retractable'}
            controlType={measurements.control_type || template?.control_type || 'manual'}
            fabricPattern={measurements.fabric_pattern || template?.fabric_pattern || 'striped'}
            valanceStyle={measurements.valance_style || template?.valance_style || 'scalloped'}
            projection={measurements.projection ? parseFloat(measurements.projection) : undefined}
          />
        );
      
      case "wallpaper":
        return (
          <WallpaperVisualizer
            measurements={{
              wall_width: measurements.rail_width || measurements.width || 300,
              wall_height: measurements.drop || measurements.height || 260
            }}
            wallpaper={{
              image_url: selectedItems.fabric?.image_url || selectedItems.material?.image_url,
              name: selectedItems.fabric?.name || selectedItems.material?.name,
              roll_width: template?.roll_width || 53,
              pattern_repeat: template?.pattern_repeat
            }}
            className={className}
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
    </div>
  );
};