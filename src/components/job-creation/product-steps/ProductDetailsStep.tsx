import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Package } from "lucide-react";

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

      {/* Basic Details */}
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
          <Label>Color</Label>
          <Input
            placeholder="White, Beige, Custom..."
            value={productDetails.color}
            onChange={(e) => handleInputChange('color', e.target.value)}
          />
        </div>
      </div>

      {/* Product-Specific Fields */}
      <div className="space-y-4">
        <h4 className="font-medium">Product Specifications</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getProductSpecificFields().map((field) => (
            <div key={field.key} className="space-y-2">
              <Label>{field.label}</Label>
              <Input
                placeholder={field.placeholder}
                value={productDetails[field.key] || ''}
                onChange={(e) => handleInputChange(field.key, e.target.value)}
              />
            </div>
          ))}
        </div>
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