
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WindowCoveringSelectionDialog } from "./WindowCoveringSelectionDialog";
import { TreatmentCalculatorDialog } from "./TreatmentCalculatorDialog";
import { TreatmentPricingForm } from "./TreatmentPricingForm";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";

interface SurfaceCardProps {
  surface: any;
  treatments: any[];
  onAddTreatment: (surfaceId: string, treatmentType: string, treatmentData?: any) => void;
  onDeleteSurface: (surfaceId: string) => void;
  onUpdateSurface: (surfaceId: string, updates: any) => void;
}

export const SurfaceCard = ({ 
  surface, 
  treatments, 
  onAddTreatment, 
  onDeleteSurface, 
  onUpdateSurface 
}: SurfaceCardProps) => {
  const { windowCoverings, isLoading: windowCoveringsLoading } = useWindowCoverings();
  const [isEditing, setIsEditing] = useState(false);
  const [showWindowCoveringDialog, setShowWindowCoveringDialog] = useState(false);
  const [showTreatmentCalculator, setShowTreatmentCalculator] = useState(false);
  const [showTreatmentPricing, setShowTreatmentPricing] = useState(false);
  const [selectedTreatmentType, setSelectedTreatmentType] = useState<string>("");
  const [selectedWindowCovering, setSelectedWindowCovering] = useState<any>(null);
  const [editData, setEditData] = useState({
    name: surface.name,
    width: surface.width || surface.surface_width || 0,
    height: surface.height || surface.surface_height || 0,
    surface_type: surface.surface_type || 'window'
  });

  const surfaceTotal = treatments.reduce((sum, t) => sum + (t.total_price || 0), 0);

  const handleSave = () => {
    onUpdateSurface(surface.id, editData);
    setIsEditing(false);
  };

  const getSurfaceIcon = (type: string) => {
    return type === 'wall' ? '🧱' : '🪟';
  };

  const handleWindowCoveringSelect = (windowCovering: any, selectedOptions: string[]) => {
    console.log("Selected window covering:", windowCovering);
    console.log("Selected options:", selectedOptions);
    
    // Auto-save the window covering as a treatment
    const treatmentData = {
      product_name: windowCovering.name,
      selected_options: selectedOptions,
      window_covering: windowCovering
    };
    
    onAddTreatment(surface.id, windowCovering.name, treatmentData);
    setShowWindowCoveringDialog(false);
  };

  const handleTreatmentTypeSelect = (treatmentType: string) => {
    // Find the selected window covering
    const windowCovering = windowCoverings.find(wc => wc.name === treatmentType);
    
    if (windowCovering) {
      setSelectedWindowCovering(windowCovering);
      setSelectedTreatmentType(treatmentType);
      setShowTreatmentPricing(true);
    }
  };

  const handleTreatmentPricingSave = (treatmentData: any) => {
    onAddTreatment(surface.id, selectedTreatmentType, treatmentData);
    setShowTreatmentPricing(false);
    setSelectedWindowCovering(null);
  };

  const handleTreatmentPricingClose = () => {
    // Auto-save even if user closes the popup
    if (selectedWindowCovering) {
      const treatmentData = {
        product_name: selectedWindowCovering.name,
        selected_options: [],
        window_covering: selectedWindowCovering
      };
      onAddTreatment(surface.id, selectedTreatmentType, treatmentData);
    }
    setShowTreatmentPricing(false);
    setSelectedWindowCovering(null);
  };

  // Filter window coverings based on surface type
  const getAvailableWindowCoverings = () => {
    if (windowCoveringsLoading || !windowCoverings) return [];
    
    return windowCoverings.filter(wc => {
      if (surface.surface_type === 'wall') {
        // For walls, show only wall coverings (you can add a category field to distinguish)
        // For now, we'll assume all window coverings can be used on walls
        return wc.active;
      } else {
        // For windows, show only window coverings
        return wc.active;
      }
    });
  };

  const availableWindowCoverings = getAvailableWindowCoverings();

  return (
    <>
      <Card className="mb-4 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getSurfaceIcon(surface.surface_type || 'window')}</span>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="w-32"
                  />
                  <Select 
                    value={editData.surface_type} 
                    onValueChange={(value) => setEditData({...editData, surface_type: value})}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="window">Window</SelectItem>
                      <SelectItem value="wall">Wall</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <CardTitle className="text-lg">{surface.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {surface.surface_type === 'wall' ? 'Wall' : 'Window'}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-green-600">${surfaceTotal.toFixed(2)}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDeleteSurface(surface.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isEditing && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="text-xs text-gray-500">Width</label>
                <Input
                  type="number"
                  value={editData.width}
                  onChange={(e) => setEditData({...editData, width: parseFloat(e.target.value) || 0})}
                  className="h-8"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Height</label>
                <Input
                  type="number"
                  value={editData.height}
                  onChange={(e) => setEditData({...editData, height: parseFloat(e.target.value) || 0})}
                  className="h-8"
                />
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            {treatments.map((treatment) => (
              <div key={treatment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{treatment.product_name || treatment.treatment_type}</span>
                  <div className="text-xs text-gray-500">
                    Material: ${treatment.material_cost || 0} | Labor: ${treatment.labor_cost || 0}
                  </div>
                </div>
                <span className="font-bold">${treatment.total_price?.toFixed(2) || '0.00'}</span>
              </div>
            ))}
            
            <Select onValueChange={handleTreatmentTypeSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={
                  surface.surface_type === 'wall' 
                    ? "Add wall covering" 
                    : "Add window covering"
                } />
              </SelectTrigger>
              <SelectContent>
                {windowCoveringsLoading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : availableWindowCoverings.length > 0 ? (
                  availableWindowCoverings.map((wc) => (
                    <SelectItem key={wc.id} value={wc.name}>
                      {wc.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No {surface.surface_type === 'wall' ? 'wall' : 'window'} coverings available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <TreatmentPricingForm
        isOpen={showTreatmentPricing}
        onClose={handleTreatmentPricingClose}
        onSave={handleTreatmentPricingSave}
        treatmentType={selectedTreatmentType}
        surfaceType={surface.surface_type || 'window'}
        windowCovering={selectedWindowCovering}
        projectId={surface.project_id}
      />
    </>
  );
};
