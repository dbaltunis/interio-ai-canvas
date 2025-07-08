import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";
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
  const [showTemplates, setShowTemplates] = useState(false);
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

  const handleTemplateSelect = (windowCovering: any) => {
    console.log("Selected template:", windowCovering);
    onAddTreatment(surface.id, windowCovering.name, windowCovering);
    setShowTemplates(false);
  };

  const getAvailableWindowCoverings = () => {
    if (windowCoveringsLoading || !windowCoverings) {
      return [];
    }
    
    return windowCoverings?.filter(wc => wc.active === true) || [];
  };

  const availableWindowCoverings = getAvailableWindowCoverings();

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <>
      <Card className="border-2 border-brand-secondary bg-gradient-to-r from-brand-light to-blue-50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4 bg-brand-light/90 backdrop-blur-sm rounded-t-lg border-b border-brand-secondary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-brand-light text-xl font-bold shadow-md">
                {getSurfaceIcon(surface.surface_type || 'window')}
              </div>
              {isEditing ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    className="w-32 border-brand-secondary focus:border-brand-primary"
                  />
                  <Select 
                    value={editData.surface_type} 
                    onValueChange={(value) => setEditData({...editData, surface_type: value})}
                  >
                    <SelectTrigger className="w-28 border-brand-secondary">
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
                  <CardTitle className="text-xl text-brand-primary font-bold">{surface.name}</CardTitle>
                  <Badge variant="outline" className="text-sm bg-brand-secondary/10 text-brand-primary border-brand-secondary">
                    {surface.surface_type === 'wall' ? 'Wall' : 'Window'}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(surfaceTotal)}</div>
                <div className="text-sm text-brand-neutral">{treatments.length} treatment{treatments.length !== 1 ? 's' : ''}</div>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className="hover:bg-brand-secondary/10 text-brand-primary"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteSurface(surface.id)}
                  className="hover:bg-red-100 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {isEditing && (
            <div className="grid grid-cols-2 gap-3 mt-4 p-4 bg-brand-secondary/10 rounded-lg border border-brand-secondary/20">
              <div>
                <label className="text-sm font-medium text-brand-primary">Width</label>
                <Input
                  type="number"
                  value={editData.width}
                  onChange={(e) => setEditData({...editData, width: parseFloat(e.target.value) || 0})}
                  className="h-9 border-brand-secondary focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-brand-primary">Height</label>
                <Input
                  type="number"
                  value={editData.height}
                  onChange={(e) => setEditData({...editData, height: parseFloat(e.target.value) || 0})}
                  className="h-9 border-brand-secondary focus:border-brand-primary"
                />
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          {/* Existing Treatments */}
          {treatments.map((treatment) => (
            <div key={treatment.id} className="border-2 border-brand-secondary/20 rounded-xl p-4 bg-brand-light shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                {treatment.window_covering?.image_url && (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden border-2 border-brand-secondary/20">
                    <img 
                      src={treatment.window_covering.image_url} 
                      alt={treatment.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-brand-primary text-lg">
                      {treatment.product_name || treatment.treatment_type}
                    </h4>
                    <span className="font-bold text-green-600 text-lg">
                      {formatCurrency(treatment.total_price || 0)}
                    </span>
                  </div>
                  
                  {/* Measurements */}
                  {treatment.measurements && (
                    <div className="grid grid-cols-2 gap-2 text-xs text-brand-neutral mb-2">
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
                    <div className="text-xs text-brand-neutral mb-2">
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
                    <div className="mt-2 text-xs text-brand-neutral">
                      <div className="font-medium">Notes:</div>
                      <div>{treatment.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Add Treatment Button */}
          <Button
            onClick={() => setShowTemplates(true)}
            className="w-full bg-gradient-to-r from-brand-primary to-brand-accent hover:from-brand-primary/90 hover:to-brand-accent/90 text-brand-light font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Treatment</span>
          </Button>
        </CardContent>
      </Card>

      {/* Product Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-brand-light rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-brand-secondary/20 bg-gradient-to-r from-brand-primary to-brand-accent text-brand-light">
              <h2 className="text-2xl font-bold">Select Treatment Type</h2>
              <p className="text-brand-light/80 mt-1">Choose from your configured product templates</p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {windowCoveringsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
                </div>
              ) : availableWindowCoverings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableWindowCoverings.map((wc) => (
                    <div
                      key={wc.id}
                      onClick={() => handleTemplateSelect(wc)}
                      className="border-2 border-brand-secondary/20 rounded-xl p-4 cursor-pointer hover:border-brand-primary hover:shadow-lg transition-all duration-200 bg-brand-light hover:bg-brand-secondary/5 group"
                    >
                      <div className="aspect-square w-full bg-gray-100 rounded-lg mb-3 overflow-hidden border border-brand-secondary/20">
                        {wc.image_url ? (
                          <img 
                            src={wc.image_url} 
                            alt={wc.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-brand-neutral text-6xl">
                            🪟
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-brand-primary text-lg mb-2 group-hover:text-brand-accent transition-colors">
                        {wc.name}
                      </h3>
                      
                      {wc.description && (
                        <p className="text-sm text-brand-neutral mb-3 line-clamp-2">
                          {wc.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs border-brand-secondary text-brand-primary">
                          {wc.fabrication_pricing_method?.replace('-', ' ') || 'Standard'}
                        </Badge>
                        <Badge variant="secondary" className="text-xs bg-brand-secondary/10 text-brand-primary">
                          {wc.margin_percentage}% margin
                        </Badge>
                        {wc.making_cost_id && (
                          <Badge className="text-xs bg-green-100 text-green-800">
                            Smart Calculator
                          </Badge>
                        )}
                      </div>
                      
                      {wc.unit_price && (
                        <div className="text-right">
                          <span className="font-semibold text-brand-primary">
                            ${wc.unit_price}
                          </span>
                          <span className="text-xs text-brand-neutral ml-1">base price</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-brand-neutral mb-2">No Product Templates Found</h3>
                  <p className="text-brand-neutral">Create window covering templates in Settings → Product Templates</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-brand-secondary/20 bg-gray-50">
              <Button 
                onClick={() => setShowTemplates(false)}
                variant="outline"
                className="w-full border-brand-secondary hover:bg-brand-secondary/10 text-brand-primary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
