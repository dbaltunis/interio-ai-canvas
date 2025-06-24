
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TreatmentCalculatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (treatmentData: any) => void;
  treatmentType: string;
}

export const TreatmentCalculatorDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  treatmentType 
}: TreatmentCalculatorDialogProps) => {
  const [formData, setFormData] = useState({
    treatmentName: treatmentType,
    quantity: 1,
    price: 0,
    windowPosition: "left",
    windowType: "single",
    lining: "",
    headingStyle: "",
    headingFullness: "",
    railWidth: "",
    curtainDrop: "",
    curtainPooling: "",
    fabricMode: "library", // "library" or "manual"
    fabricName: "",
    fabricWidth: "",
    verticalRepeat: "",
    horizontalRepeat: "",
    pricePerUnit: "",
    fabricWidthType: "standard" // "standard" or "wide"
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const calculatedPrice = calculatePrice();
    onSave({
      ...formData,
      price: calculatedPrice
    });
    onClose();
  };

  const calculatePrice = () => {
    // Basic calculation logic - can be enhanced with more complex formulas
    const railWidth = parseFloat(formData.railWidth) || 0;
    const curtainDrop = parseFloat(formData.curtainDrop) || 0;
    const pricePerUnit = parseFloat(formData.pricePerUnit) || 0;
    const quantity = formData.quantity;

    if (railWidth && curtainDrop && pricePerUnit) {
      const area = (railWidth * curtainDrop) / 10000; // Convert cm² to m²
      return area * pricePerUnit * quantity * 2.5; // Fabric multiplier for fullness
    }
    return 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit treatment items</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Treatment Details */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="treatmentName">Treatment name</Label>
              <Input
                id="treatmentName"
                value={formData.treatmentName}
                onChange={(e) => handleInputChange("treatmentName", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <Input
                  id="price"
                  className="pl-8"
                  value={calculatePrice().toFixed(2)}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Window Configuration */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-40 border-2 border-gray-300 rounded bg-gray-50 relative">
                {/* Window illustration */}
                <div className="absolute top-2 left-2 right-2 h-6 border border-gray-400 rounded-t">
                  <div className="w-full h-1 bg-gray-400 mt-1"></div>
                </div>
                <div className="absolute top-8 left-2 right-2 bottom-2 border border-gray-400 grid grid-cols-2">
                  <div className="border-r border-gray-400"></div>
                  <div></div>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <RadioGroup
                value={formData.windowPosition}
                onValueChange={(value) => handleInputChange("windowPosition", value)}
                className="flex space-x-8"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="left" id="left" />
                  <Label htmlFor="left">Left</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="right" id="right" />
                  <Label htmlFor="right">Right</Label>
                </div>
              </RadioGroup>

              <RadioGroup
                value={formData.windowType}
                onValueChange={(value) => handleInputChange("windowType", value)}
                className="flex space-x-8 mt-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single">Single</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pair" id="pair" />
                  <Label htmlFor="pair">Pair</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Add hardware button */}
          <Button variant="outline" className="w-fit">
            + Add hardware
          </Button>

          {/* Selections */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Select lining</Label>
              <Select value={formData.lining} onValueChange={(value) => handleInputChange("lining", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unlined">Unlined</SelectItem>
                  <SelectItem value="lined">Lined</SelectItem>
                  <SelectItem value="blackout">Blackout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Select curtain heading style</Label>
              <Select value={formData.headingStyle} onValueChange={(value) => handleInputChange("headingStyle", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pencil-pleat">Pencil Pleat</SelectItem>
                  <SelectItem value="eyelet">Eyelet Curtain</SelectItem>
                  <SelectItem value="triple-wave">Triple Wave</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Optional Enhancements */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Optional Enhancements</h3>
              <Button variant="outline" size="sm">Library</Button>
            </div>
            <p className="text-sm text-gray-600">
              Choose from the library or create a custom enhancement using the button below.
            </p>
            <Button variant="outline" className="w-fit">
              + Add Feature
            </Button>
          </div>

          {/* Heading Fullness */}
          <div>
            <Label htmlFor="headingFullness">Heading fullness</Label>
            <Input
              id="headingFullness"
              value={formData.headingFullness}
              onChange={(e) => handleInputChange("headingFullness", e.target.value)}
            />
          </div>

          {/* Treatment Measurements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Treatment measurements</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="railWidth">Rail width</Label>
                <div className="relative">
                  <Input
                    id="railWidth"
                    value={formData.railWidth}
                    onChange={(e) => handleInputChange("railWidth", e.target.value)}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500">cm</span>
                </div>
              </div>
              <div>
                <Label htmlFor="curtainDrop">Curtain drop</Label>
                <div className="relative">
                  <Input
                    id="curtainDrop"
                    value={formData.curtainDrop}
                    onChange={(e) => handleInputChange("curtainDrop", e.target.value)}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500">cm</span>
                </div>
              </div>
              <div>
                <Label htmlFor="curtainPooling">Curtain pooling</Label>
                <div className="relative">
                  <Input
                    id="curtainPooling"
                    value={formData.curtainPooling}
                    onChange={(e) => handleInputChange("curtainPooling", e.target.value)}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500">cm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fabric Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Fabric</h3>
            <div className="flex space-x-4">
              <Button
                variant={formData.fabricMode === "manual" ? "default" : "outline"}
                onClick={() => handleInputChange("fabricMode", "manual")}
              >
                Enter manually
              </Button>
              <Button
                variant={formData.fabricMode === "library" ? "default" : "outline"}
                onClick={() => handleInputChange("fabricMode", "library")}
              >
                Select fabric
              </Button>
            </div>

            {formData.fabricMode === "manual" && (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fabricName">Fabric name</Label>
                    <Input
                      id="fabricName"
                      placeholder="Enter fabric name"
                      value={formData.fabricName}
                      onChange={(e) => handleInputChange("fabricName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="fabricWidth">Fabric width</Label>
                    <div className="relative">
                      <Input
                        id="fabricWidth"
                        value={formData.fabricWidth}
                        onChange={(e) => handleInputChange("fabricWidth", e.target.value)}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-2.5 text-gray-500">cm</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="verticalRepeat">Vertical repeat</Label>
                    <div className="relative">
                      <Input
                        id="verticalRepeat"
                        value={formData.verticalRepeat}
                        onChange={(e) => handleInputChange("verticalRepeat", e.target.value)}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-2.5 text-gray-500">cm</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="horizontalRepeat">Horizontal repeat</Label>
                    <div className="relative">
                      <Input
                        id="horizontalRepeat"
                        value={formData.horizontalRepeat}
                        onChange={(e) => handleInputChange("horizontalRepeat", e.target.value)}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-2.5 text-gray-500">cm</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="pricePerUnit">Price/Unit</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <Input
                      id="pricePerUnit"
                      value={formData.pricePerUnit}
                      onChange={(e) => handleInputChange("pricePerUnit", e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <RadioGroup
                  value={formData.fabricWidthType}
                  onValueChange={(value) => handleInputChange("fabricWidthType", value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard">Standard width fabric ~ 140 cm</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wide" id="wide" />
                    <Label htmlFor="wide">Wide width fabric ~ 300 cm</Label>
                  </div>
                </RadioGroup>

                <div className="text-sm text-gray-600 flex items-center space-x-2">
                  <span>ℹ️</span>
                  <span>Enter the fabric details to view the calculation results.</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="text-sm text-gray-600 flex items-center space-x-2">
            <span>ℹ️</span>
            <span>Fabric selection becomes available after selecting a pricing option.</span>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} className="w-full bg-slate-600 hover:bg-slate-700">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
