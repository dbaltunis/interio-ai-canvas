import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, ArrowLeft, Package, Settings, Calculator } from "lucide-react";
import { useWindowCoverings } from "@/hooks/useWindowCoverings";
import { useWindowCoveringOptions } from "@/hooks/useWindowCoveringOptions";
import { useInventory } from "@/hooks/useInventory";

interface ProductDetailsStepProps {
  product: any;
  selectedRooms: string[];
  existingRooms: any[];
  onNext: () => void;
  onBack: () => void;
}

export const ProductDetailsStep = ({
  product,
  selectedRooms,
  existingRooms,
  onNext,
  onBack
}: ProductDetailsStepProps) => {
  const { windowCoverings, isLoading: windowCoveringsLoading } = useWindowCoverings();
  const { data: fabrics, isLoading: fabricsLoading } = useInventory();
  
  const [selectedWindowCovering, setSelectedWindowCovering] = useState('');
  const [selectedFabric, setSelectedFabric] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
  const [measurements, setMeasurements] = useState({
    width: '',
    height: '',
    drop: ''
  });
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  
  const { hierarchicalOptions, isLoading: optionsLoading } = useWindowCoveringOptions(selectedWindowCovering);
  
  const [productDetails, setProductDetails] = useState({
    quantity: 1,
    fabric: '',
    color: '',
    measurements: '',
    notes: ''
  });

  const getRoomNames = () => {
    return selectedRooms.map(roomId => {
      const room = existingRooms.find(r => r.id === roomId);
      return room?.name || `Room ${roomId}`;
    }).join(', ');
  };

  const handleInputChange = (field: string, value: string | number) => {
    setProductDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getProductSpecificFields = () => {
    switch (product?.id) {
      case 'curtains':
        return [
          { key: 'fabric', label: 'Fabric Type', placeholder: 'Silk, Cotton, Linen...' },
          { key: 'style', label: 'Style', placeholder: 'Panel, Valance, Swag...' },
          { key: 'mounting', label: 'Mounting', placeholder: 'Rod, Track, Rings...' }
        ];
      case 'blinds':
        return [
          { key: 'material', label: 'Material', placeholder: 'Wood, Aluminum, Fabric...' },
          { key: 'operation', label: 'Operation', placeholder: 'Cordless, Motorized, Chain...' },
          { key: 'slat_size', label: 'Slat Size', placeholder: '1", 2", 2.5"...' }
        ];
      case 'wallpaper':
        return [
          { key: 'pattern', label: 'Pattern', placeholder: 'Floral, Geometric, Solid...' },
          { key: 'material', label: 'Material', placeholder: 'Vinyl, Fabric, Paper...' },
          { key: 'coverage', label: 'Coverage', placeholder: 'Full wall, Accent wall...' }
        ];
      case 'services':
        return [
          { key: 'service_type', label: 'Service Type', placeholder: 'Installation, Consultation, Repair...' },
          { key: 'duration', label: 'Estimated Duration', placeholder: '2 hours, Half day...' },
          { key: 'requirements', label: 'Requirements', placeholder: 'Tools, access, preparation...' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Product Details</h3>
        <p className="text-sm text-muted-foreground">
          Configure {product?.name} for your selected rooms
        </p>
      </div>

      {/* Selected Rooms Summary */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center space-x-3">
          <Package className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">Adding to {selectedRooms.length} room(s)</p>
            <p className="text-sm text-blue-700">{getRoomNames()}</p>
          </div>
        </div>
      </Card>

      {/* Window Covering Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <h4 className="font-medium">Window Covering Selection</h4>
        </div>
        
        <div className="space-y-2">
          <Label>Select Window Covering Type</Label>
          <Select value={selectedWindowCovering} onValueChange={setSelectedWindowCovering}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a window covering from your settings" />
            </SelectTrigger>
            <SelectContent>
              {windowCoveringsLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : windowCoverings.filter(wc => wc.active).length === 0 ? (
                <SelectItem value="none" disabled>No active window coverings found</SelectItem>
              ) : (
                windowCoverings.filter(wc => wc.active).map((covering) => (
                  <SelectItem key={covering.id} value={covering.id}>
                    {covering.name} - {covering.fabrication_pricing_method?.replace('-', ' ')}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedWindowCovering && (
          <>
            <Separator />
            
            {/* Fabric Selection */}
            <div className="space-y-2">
              <Label>Select Fabric</Label>
              <Select value={selectedFabric} onValueChange={setSelectedFabric}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose fabric from inventory" />
                </SelectTrigger>
                <SelectContent>
                  {fabricsLoading ? (
                    <SelectItem value="loading" disabled>Loading fabrics...</SelectItem>
                  ) : fabrics?.filter(f => f.category === 'fabric').length === 0 ? (
                    <SelectItem value="none" disabled>No fabrics found in inventory</SelectItem>
                  ) : (
                    fabrics?.filter(f => f.category === 'fabric').map((fabric) => (
                      <SelectItem key={fabric.id} value={fabric.id}>
                        {fabric.name} - {fabric.color} ({fabric.quantity} {fabric.unit} available)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Measurements */}
            <div className="space-y-4">
              <Label>Measurements</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Width (cm)</Label>
                  <Input
                    type="number"
                    placeholder="150"
                    value={measurements.width}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, width: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Height (cm)</Label>
                  <Input
                    type="number"
                    placeholder="200"
                    value={measurements.height}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, height: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Drop (cm)</Label>
                  <Input
                    type="number"
                    placeholder="180"
                    value={measurements.drop}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, drop: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Options Selection */}
            {hierarchicalOptions.length > 0 && (
              <div className="space-y-4">
                <Label>Window Covering Options</Label>
                {hierarchicalOptions.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <Label className="text-sm">{option.name}</Label>
                    {option.subcategories && option.subcategories.length > 0 ? (
                      <Select 
                        value={selectedOptions[option.id] || ''} 
                        onValueChange={(value) => setSelectedOptions(prev => ({ ...prev, [option.id]: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${option.name.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {option.subcategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id}>
                              {sub.name} - £{sub.base_price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {option.description || 'No subcategories available'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Basic Details */}
            <Separator />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantity per room</Label>
                <Input
                  type="number"
                  min="1"
                  value={productDetails.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label>Additional Color/Finish</Label>
                <Input
                  placeholder="Custom finish, trim color..."
                  value={productDetails.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                />
              </div>
            </div>

            {/* Price Calculation */}
            <Card className="p-4 bg-amber-50 border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="h-4 w-4 text-amber-600" />
                <h4 className="font-medium text-amber-900">Estimated Pricing</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base price per item:</span>
                  <span>£{windowCoverings.find(wc => wc.id === selectedWindowCovering)?.unit_price || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selected options:</span>
                  <span>£{Object.values(selectedOptions).reduce((total, optionId) => {
                    const option = hierarchicalOptions.flatMap(h => h.subcategories || []).find(s => s.id === optionId);
                    return total + (option?.base_price || 0);
                  }, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity per room:</span>
                  <span>{productDetails.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of rooms:</span>
                  <span>{selectedRooms.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total estimated cost:</span>
                  <span>£{(
                    ((windowCoverings.find(wc => wc.id === selectedWindowCovering)?.unit_price || 0) +
                    Object.values(selectedOptions).reduce((total, optionId) => {
                      const option = hierarchicalOptions.flatMap(h => h.subcategories || []).find(s => s.id === optionId);
                      return total + (option?.base_price || 0);
                    }, 0)) * productDetails.quantity * selectedRooms.length
                  ).toFixed(2)}</span>
                </div>
                <p className="text-xs text-amber-700 mt-2">
                  * This is an estimate. Final pricing will include fabric calculations and labor costs.
                </p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Measurements */}
      <div className="space-y-2">
        <Label>Measurements & Dimensions</Label>
        <Textarea
          placeholder="Width x Height, special requirements, mounting details..."
          value={productDetails.measurements}
          onChange={(e) => handleInputChange('measurements', e.target.value)}
          rows={3}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label>Additional Notes</Label>
        <Textarea
          placeholder="Special instructions, preferences, client requirements..."
          value={productDetails.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={2}
        />
      </div>

      {/* Summary Card */}
      <Card className="p-4 bg-green-50 border-green-200">
        <h4 className="font-medium text-green-900 mb-2">Summary</h4>
        <div className="text-sm text-green-700 space-y-1">
          <p>• {product?.name} × {productDetails.quantity} per room</p>
          <p>• Total items: {productDetails.quantity * selectedRooms.length}</p>
          <p>• Rooms: {selectedRooms.length}</p>
          {productDetails.color && <p>• Color: {productDetails.color}</p>}
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Rooms
        </Button>
        <Button onClick={onNext}>
          Open Product Canvas
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};