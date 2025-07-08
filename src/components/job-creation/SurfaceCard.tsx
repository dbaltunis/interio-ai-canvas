import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [editData, setEditData] = useState({
    name: surface.name,
    width: surface.width || surface.surface_width || 0,
    height: surface.height || surface.surface_height || 0,
    surface_type: surface.surface_type || 'window'
  });

  // Debug window coverings
  console.log("=== SURFACE CARD WINDOW COVERINGS DEBUG ===");
  console.log("Window coverings loading:", windowCoveringsLoading);
  console.log("Window coverings array:", windowCoverings);
  console.log("Window coverings count:", windowCoverings?.length);
  console.log("Active window coverings:", windowCoverings?.filter(wc => wc.active));
  console.log("Active count:", windowCoverings?.filter(wc => wc.active)?.length);

  const surfaceTotal = treatments.reduce((sum, t) => sum + (t.total_price || 0), 0);

  const handleSave = () => {
    onUpdateSurface(surface.id, editData);
    setIsEditing(false);
  };

  const getSurfaceIcon = (type: string) => {
    return type === 'wall' ? '🧱' : '🪟';
  };

  const handleTreatmentTypeSelect = (treatmentType: string) => {
    console.log("=== SURFACE CARD TREATMENT SELECTION ===");
    console.log("Selected treatment type:", treatmentType);
    console.log("Available window coverings:", windowCoverings);
    console.log("Active window coverings:", windowCoverings?.filter(wc => wc.active));
    
    const windowCovering = windowCoverings?.find(wc => wc.name === treatmentType && wc.active);
    console.log("Found matching window covering:", windowCovering);
    
    if (windowCovering) {
      console.log("✅ Using window covering data from settings:", windowCovering.name);
      onAddTreatment(surface.id, treatmentType, windowCovering);
    } else {
      console.log("⚠️ No active window covering found, creating basic treatment");
      onAddTreatment(surface.id, treatmentType);
    }
  };

  // Get available window coverings from Product Templates (Settings)
  const getAvailableWindowCoverings = () => {
    console.log("=== GETTING WINDOW COVERINGS FROM SETTINGS ===");
    console.log("Window coverings loading:", windowCoveringsLoading);
    console.log("Total window coverings:", windowCoverings?.length || 0);
    
    if (windowCoveringsLoading || !windowCoverings) {
      console.log("Still loading window coverings...");
      return [];
    }
    
    // Filter for active window coverings only
    const activeWindowCoverings = windowCoverings?.filter(wc => {
      const isActive = wc.active === true;
      console.log(`Window covering: ${wc.name}, active: ${wc.active}, included: ${isActive}`);
      return isActive;
    }) || [];
    
    console.log("✅ Active window coverings found:", activeWindowCoverings.length);
    console.log("Active window covering names:", activeWindowCoverings.map(wc => wc.name));
    
    return activeWindowCoverings;
  };

  const availableWindowCoverings = getAvailableWindowCoverings();

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  console.log("=== SURFACE CARD RENDER DEBUG ===");
  console.log("Surface:", surface?.name);
  console.log("Window coverings loading:", windowCoveringsLoading);
  console.log("Window coverings raw data:", windowCoverings);
  console.log("Available window coverings for dropdown:", availableWindowCoverings.length);
  console.log("Window covering names:", availableWindowCoverings.map(wc => wc.name));
  console.log("=== END SURFACE CARD DEBUG ===");

  return (
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
          
          {/* ADD WINDOW COVERING DROPDOWN - SHOWS PRODUCTS FROM SETTINGS */}
          <Select onValueChange={handleTreatmentTypeSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Add window covering from Product Templates" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-300 shadow-lg z-50 max-h-96 overflow-y-auto">
              {windowCoveringsLoading ? (
                <SelectItem value="loading" disabled>Loading window coverings...</SelectItem>
              ) : availableWindowCoverings.length > 0 ? (
                <>
                  <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50">
                    Product Templates from Settings ({availableWindowCoverings.length} available)
                  </div>
                  {availableWindowCoverings.map((wc) => (
                    <SelectItem key={wc.id} value={wc.name} className="hover:bg-gray-100 py-2">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <span className="font-medium">{wc.name}</span>
                          {wc.description && (
                            <span className="text-xs text-gray-500 truncate max-w-xs">
                              {wc.description}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {wc.making_cost_id && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Smart Calculator
                            </span>
                          )}
                          <span className="text-xs text-gray-600">
                            {wc.margin_percentage}% margin
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </>
              ) : (
                <SelectItem value="none" disabled>
                  <div className="text-center py-2">
                    <div className="font-medium text-gray-700">No window coverings found</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Create window coverings in Settings → Product Templates → Window Coverings
                    </div>
                  </div>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
