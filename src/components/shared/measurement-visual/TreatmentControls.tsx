import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCurtainTemplates } from "@/hooks/useCurtainTemplates";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
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
  showFabricSelection = true,
  showTreatmentOptions = true,
  readOnly = false
}: TreatmentControlsProps) => {
  const { data: templates = [] } = useCurtainTemplates();
  const { data: inventory = [] } = useEnhancedInventory();

  const fabrics = inventory.filter(item => 
    item.category === 'fabric' || item.name?.toLowerCase().includes('fabric')
  );

  const handleTemplateChange = (templateId: string) => {
    if (readOnly) return;
    
    const template = templates.find(t => t.id === templateId);
    if (template && onTreatmentChange) {
      onTreatmentChange({
        template: {
          id: template.id,
          name: template.name,
          curtain_type: template.curtain_type,
          fullness_ratio: template.fullness_ratio,
          header_allowance: template.header_allowance,
          bottom_hem: template.bottom_hem,
          side_hems: template.side_hems,
          seam_hems: template.seam_hems,
          return_left: template.return_left,
          return_right: template.return_right,
          waste_percent: template.waste_percent,
          compatible_hardware: template.compatible_hardware || []
        }
      });
    }
  };

  const handleFabricChange = (fabricId: string) => {
    if (readOnly) return;
    
    const fabric = fabrics.find(f => f.id === fabricId);
    if (fabric && onTreatmentChange) {
      onTreatmentChange({
        fabric: {
          id: fabric.id,
          name: fabric.name,
          fabric_width: fabric.fabric_width || 137,
          price_per_meter: fabric.price_per_meter || fabric.selling_price || 0
        }
      });
    }
  };

  return (
    <div className="space-y-3">
      {showTreatmentOptions && (
        <div className="space-y-1">
          <Label className="text-sm font-medium">Treatment Template</Label>
          <Select
            value={treatmentData?.template?.id || ""}
            onValueChange={handleTemplateChange}
            disabled={readOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a treatment template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex flex-col">
                    <span>{template.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {template.curtain_type} • {template.fullness_ratio}x fullness
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showFabricSelection && (
        <div className="space-y-1">
          <Label className="text-sm font-medium">Fabric Selection</Label>
          <Select
            value={treatmentData?.fabric?.id || ""}
            onValueChange={handleFabricChange}
            disabled={readOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a fabric" />
            </SelectTrigger>
            <SelectContent>
              {fabrics.map((fabric) => (
                <SelectItem key={fabric.id} value={fabric.id}>
                  <div className="flex flex-col">
                    <span>{fabric.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {fabric.fabric_width || 137}cm wide • 
                      ${(fabric.price_per_meter || fabric.selling_price || 0).toFixed(2)}/m
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {treatmentData?.template && (
        <div className="p-2 bg-muted rounded-lg space-y-1">
          <h4 className="font-medium text-sm">Template Details</h4>
          <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
            <div>Type: {treatmentData.template.curtain_type}</div>
            <div>Fullness: {treatmentData.template.fullness_ratio}x</div>
            <div>Header: {treatmentData.template.header_allowance}cm</div>
            <div>Bottom Hem: {treatmentData.template.bottom_hem}cm</div>
            <div>Side Hems: {treatmentData.template.side_hems}cm</div>
            <div>Waste: {treatmentData.template.waste_percent}%</div>
          </div>
        </div>
      )}

      {treatmentData?.fabric && (
        <div className="p-2 bg-muted rounded-lg space-y-1">
          <h4 className="font-medium text-sm">Fabric Details</h4>
          <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
            <div>Name: {treatmentData.fabric.name}</div>
            <div>Width: {treatmentData.fabric.fabric_width}cm</div>
            <div>Price: ${treatmentData.fabric.price_per_meter.toFixed(2)}/m</div>
          </div>
        </div>
      )}
    </div>
  );
};