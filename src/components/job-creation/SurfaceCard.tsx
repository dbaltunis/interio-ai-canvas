
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const handleTreatmentTypeSelect = (treatmentType: string) => {
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
        window_covering: selectedWindowCovering,
        material_cost: 0,
        labor_cost: 0,
        total_price: selectedWindowCovering.unit_price || 0
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
        // For walls, show only wall coverings
        return wc.active;
      } else {
        // For windows, show only window coverings
        return wc.active;
      }
    });
  };

  const availableWindowCoverings = getAvailableWindowCoverings();

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

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
              <span className="font-bold text-green-600">{formatCurrency(surfaceTotal)}</span>
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
          <div className="space-y-3">
            {treatments.map((treatment) => (
              <div key={treatment.id} className="border rounded-lg p-3 bg-white">
                <div className="flex items-start space-x-3">
                  {/* Treatment Image */}
                  {treatment.window_covering?.image_url && (
                    <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                      <img 
                        src={treatment.window_covering.image_url} 
                        alt={treatment.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Treatment Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {treatment.product_name || treatment.treatment_type}
                      </h4>
                      <span className="font-bold text-green-600">
                        {formatCurrency(treatment.total_price || 0)}
                      </span>
                    </div>
                    
                    {/* Measurements */}
                    {treatment.measurements && (
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                        {treatment.measurements.rail_width && (
                          <div>Rail Width: {treatment.measurements.rail_width}cm</div>
                        )}
                        {treatment.measurements.drop && (
                          <div>Drop: {treatment.measurements.drop}cm</div>
                        )}
                        {treatment.measurements.fabric_usage && (
                          <div>Fabric Usage: {treatment.measurements.fabric_usage}m</div>
                        )}
                      </div>
                    )}
                    
                    {/* Fabric Details */}
                    {treatment.fabric_details && (
                      <div className="text-xs text-gray-600 mb-2">
                        {treatment.fabric_details.fabric_type && (
                          <div>Fabric: {treatment.fabric_details.fabric_type}</div>
                        )}
                        {treatment.fabric_details.fabric_code && (
                          <div>Code: {treatment.fabric_details.fabric_code}</div>
                        )}
                        {treatment.fabric_details.heading_fullness && (
                          <div>Fullness: {treatment.fabric_details.heading_fullness}</div>
                        )}
                      </div>
                    )}
                    
                    {/* Cost Breakdown */}
                    <div className="flex justify-between text-xs text-gray-500 border-t pt-2">
                      <span>Material: {formatCurrency(treatment.material_cost || 0)}</span>
                      <span>Labor: {formatCurrency(treatment.labor_cost || 0)}</span>
                      <span>Qty: {treatment.quantity || 1}</span>
                    </div>
                    
                    {/* Selected Options */}
                    {treatment.selected_options && treatment.selected_options.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">Options:</div>
                        <div className="flex flex-wrap gap-1">
                          {treatment.selected_options.map((optionId: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              Option {index + 1}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Notes */}
                    {treatment.notes && (
                      <div className="mt-2 text-xs text-gray-600">
                        <div className="font-medium">Notes:</div>
                        <div>{treatment.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
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
