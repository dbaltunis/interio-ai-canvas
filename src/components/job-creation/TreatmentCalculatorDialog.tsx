
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calculator, Fabric, Settings, Plus, X } from "lucide-react";

interface TreatmentCalculatorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (treatmentData: any) => void;
  treatmentType: string;
}

interface FabricLibraryItem {
  id: string;
  name: string;
  code: string;
  pricePerYard: number;
  width: number;
  type: string;
  collection: string;
}

interface AdditionalFeature {
  id: string;
  name: string;
  price: number;
  selected: boolean;
}

export const TreatmentCalculatorDialog = ({ 
  isOpen, 
  onClose, 
  onSave, 
  treatmentType 
}: TreatmentCalculatorDialogProps) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'fabric' | 'features' | 'calculation'>('basic');
  
  const [formData, setFormData] = useState({
    // Basic Details
    treatmentName: treatmentType === 'curtains' ? 'Custom Curtains' : treatmentType === 'roman-shades' ? 'Roman Shades' : treatmentType,
    quantity: 1,
    windowPosition: "center",
    windowType: "single",
    
    // Treatment Specifications
    headingStyle: "",
    headingFullness: "2.5",
    lining: "",
    mounting: "inside",
    
    // Measurements
    railWidth: "",
    curtainDrop: "",
    curtainPooling: "0",
    returnDepth: "4",
    
    // Fabric Selection
    fabricMode: "library", // "library" or "manual"
    selectedFabric: null as FabricLibraryItem | null,
    fabricName: "",
    fabricWidth: "140",
    fabricPricePerYard: "",
    verticalRepeat: "0",
    horizontalRepeat: "0",
    
    // Hardware
    hardware: "",
    hardwareFinish: "",
    
    // Additional Features
    additionalFeatures: [] as AdditionalFeature[],
    
    // Pricing
    laborRate: 65,
    markupPercentage: 40,
  });

  // Mock fabric library data
  const fabricLibrary: FabricLibraryItem[] = [
    { id: '1', name: 'Premium Linen Blend', code: 'LB001', pricePerYard: 45, width: 140, type: 'Linen', collection: 'Natural' },
    { id: '2', name: 'Velvet Luxe', code: 'VL002', pricePerYard: 65, width: 140, type: 'Velvet', collection: 'Premium' },
    { id: '3', name: 'Cotton Damask', code: 'CD003', pricePerYard: 35, width: 140, type: 'Cotton', collection: 'Classic' },
    { id: '4', name: 'Silk Dupioni', code: 'SD004', pricePerYard: 85, width: 140, type: 'Silk', collection: 'Luxury' },
    { id: '5', name: 'Blackout Thermal', code: 'BT005', pricePerYard: 55, width: 140, type: 'Blackout', collection: 'Functional' },
  ];

  // Available additional features
  const availableFeatures: AdditionalFeature[] = [
    { id: '1', name: 'French Pleats', price: 25, selected: false },
    { id: '2', name: 'Contrast Trim', price: 15, selected: false },
    { id: '3', name: 'Blackout Lining', price: 20, selected: false },
    { id: '4', name: 'Thermal Interlining', price: 30, selected: false },
    { id: '5', name: 'Weighted Hem', price: 12, selected: false },
    { id: '6', name: 'Cord Tidy', price: 8, selected: false },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotalPrice = () => {
    const railWidth = parseFloat(formData.railWidth) || 0;
    const curtainDrop = parseFloat(formData.curtainDrop) || 0;
    const fullness = parseFloat(formData.headingFullness) || 2.5;
    const quantity = formData.quantity;
    
    if (!railWidth || !curtainDrop) return 0;

    // Calculate fabric requirements
    const fabricWidthRequired = railWidth * fullness;
    const fabricLengthRequired = curtainDrop + parseFloat(formData.curtainPooling || "0") + 20; // Add allowances
    
    // Calculate drops per width
    const fabricWidth = formData.selectedFabric?.width || parseFloat(formData.fabricWidth) || 140;
    const dropsPerWidth = Math.floor(fabricWidth / (fabricWidthRequired / quantity));
    const widthsRequired = Math.ceil(quantity / Math.max(dropsPerWidth, 1));
    
    // Total fabric needed in yards
    const totalFabricYards = (widthsRequired * fabricLengthRequired) / 91.44; // Convert cm to yards
    
    // Fabric cost
    const fabricPricePerYard = formData.selectedFabric?.pricePerYard || parseFloat(formData.fabricPricePerYard) || 0;
    const fabricCost = totalFabricYards * fabricPricePerYard;
    
    // Labor cost (based on complexity and size)
    const laborHours = Math.max(4, (railWidth * curtainDrop) / 10000); // Minimum 4 hours
    const laborCost = laborHours * formData.laborRate;
    
    // Additional features cost
    const featuresCost = formData.additionalFeatures.reduce((sum, feature) => 
      feature.selected ? sum + feature.price : sum, 0
    );
    
    // Subtotal
    const subtotal = fabricCost + laborCost + featuresCost;
    
    // Apply markup
    const total = subtotal * (1 + formData.markupPercentage / 100);
    
    return {
      fabricYards: Math.ceil(totalFabricYards * 10) / 10,
      fabricCost,
      laborHours: Math.ceil(laborHours * 10) / 10,
      laborCost,
      featuresCost,
      subtotal,
      total
    };
  };

  const calculation = calculateTotalPrice();

  const handleFeatureToggle = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      additionalFeatures: prev.additionalFeatures.map(feature =>
        feature.id === featureId ? { ...feature, selected: !feature.selected } : feature
      )
    }));
  };

  const addFeature = (feature: AdditionalFeature) => {
    setFormData(prev => ({
      ...prev,
      additionalFeatures: [...prev.additionalFeatures, { ...feature, selected: true }]
    }));
  };

  const handleSave = () => {
    onSave({
      ...formData,
      price: calculation.total,
      calculation: calculation
    });
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calculator className="mr-2 h-5 w-5" />
            {treatmentType === 'curtains' ? 'Curtain' : treatmentType === 'roman-shades' ? 'Roman Shade' : 'Treatment'} Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Navigation Tabs */}
          <div className="flex space-x-1 border-b mb-4">
            {[
              { key: 'basic', label: 'Basic Details' },
              { key: 'fabric', label: 'Fabric Selection' },
              { key: 'features', label: 'Features' },
              { key: 'calculation', label: 'Calculation' }
            ].map(tab => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.key as any)}
                className="rounded-b-none"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Basic Details Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="treatmentName">Treatment Name</Label>
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
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange("quantity", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label>Window Type</Label>
                    <Select value={formData.windowType} onValueChange={(value) => handleInputChange("windowType", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Window</SelectItem>
                        <SelectItem value="pair">Pair of Windows</SelectItem>
                        <SelectItem value="bay">Bay Window</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Treatment Specifications</Label>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <Label>Heading Style</Label>
                      <Select value={formData.headingStyle} onValueChange={(value) => handleInputChange("headingStyle", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select heading style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pencil-pleat">Pencil Pleat</SelectItem>
                          <SelectItem value="triple-pleat">Triple Pleat</SelectItem>
                          <SelectItem value="goblet">Goblet Pleat</SelectItem>
                          <SelectItem value="eyelet">Eyelet</SelectItem>
                          <SelectItem value="tab-top">Tab Top</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Fullness Ratio</Label>
                      <Select value={formData.headingFullness} onValueChange={(value) => handleInputChange("headingFullness", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2:1 (Economical)</SelectItem>
                          <SelectItem value="2.5">2.5:1 (Standard)</SelectItem>
                          <SelectItem value="3">3:1 (Luxury)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Lining</Label>
                      <Select value={formData.lining} onValueChange={(value) => handleInputChange("lining", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lining" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Unlined</SelectItem>
                          <SelectItem value="standard">Standard Lining</SelectItem>
                          <SelectItem value="blackout">Blackout Lining</SelectItem>
                          <SelectItem value="thermal">Thermal Lining</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Mounting</Label>
                      <Select value={formData.mounting} onValueChange={(value) => handleInputChange("mounting", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inside">Inside Mount</SelectItem>
                          <SelectItem value="outside">Outside Mount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Measurements (cm)</Label>
                  <div className="grid grid-cols-4 gap-4 mt-3">
                    <div>
                      <Label htmlFor="railWidth">Rail Width *</Label>
                      <Input
                        id="railWidth"
                        type="number"
                        value={formData.railWidth}
                        onChange={(e) => handleInputChange("railWidth", e.target.value)}
                        placeholder="e.g. 200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="curtainDrop">Curtain Drop *</Label>
                      <Input
                        id="curtainDrop"
                        type="number"
                        value={formData.curtainDrop}
                        onChange={(e) => handleInputChange("curtainDrop", e.target.value)}
                        placeholder="e.g. 250"
                      />
                    </div>
                    <div>
                      <Label htmlFor="curtainPooling">Pooling</Label>
                      <Input
                        id="curtainPooling"
                        type="number"
                        value={formData.curtainPooling}
                        onChange={(e) => handleInputChange("curtainPooling", e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="returnDepth">Return Depth</Label>
                      <Input
                        id="returnDepth"
                        type="number"
                        value={formData.returnDepth}
                        onChange={(e) => handleInputChange("returnDepth", e.target.value)}
                        placeholder="4"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fabric Selection Tab */}
            {activeTab === 'fabric' && (
              <div className="space-y-6">
                <div className="flex space-x-4">
                  <Button
                    variant={formData.fabricMode === "library" ? "default" : "outline"}
                    onClick={() => handleInputChange("fabricMode", "library")}
                    className="flex items-center"
                  >
                    <Fabric className="mr-2 h-4 w-4" />
                    Select from Library
                  </Button>
                  <Button
                    variant={formData.fabricMode === "manual" ? "default" : "outline"}
                    onClick={() => handleInputChange("fabricMode", "manual")}
                  >
                    Enter Manually
                  </Button>
                </div>

                {formData.fabricMode === "library" ? (
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Fabric Library</Label>
                    <div className="grid gap-3 max-h-96 overflow-y-auto">
                      {fabricLibrary.map((fabric) => (
                        <Card 
                          key={fabric.id} 
                          className={`cursor-pointer transition-colors ${
                            formData.selectedFabric?.id === fabric.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => handleInputChange("selectedFabric", fabric)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{fabric.name}</h4>
                                <p className="text-sm text-muted-foreground">Code: {fabric.code}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="secondary">{fabric.type}</Badge>
                                  <Badge variant="outline">{fabric.collection}</Badge>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{formatCurrency(fabric.pricePerYard)}/yard</p>
                                <p className="text-sm text-muted-foreground">{fabric.width}cm width</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Manual Fabric Entry</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fabricName">Fabric Name</Label>
                        <Input
                          id="fabricName"
                          value={formData.fabricName}
                          onChange={(e) => handleInputChange("fabricName", e.target.value)}
                          placeholder="Enter fabric name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fabricPricePerYard">Price per Yard</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            id="fabricPricePerYard"
                            type="number"
                            step="0.01"
                            value={formData.fabricPricePerYard}
                            onChange={(e) => handleInputChange("fabricPricePerYard", e.target.value)}
                            className="pl-8"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="fabricWidth">Fabric Width (cm)</Label>
                        <Input
                          id="fabricWidth"
                          type="number"
                          value={formData.fabricWidth}
                          onChange={(e) => handleInputChange("fabricWidth", e.target.value)}
                          placeholder="140"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="verticalRepeat">Vertical Repeat (cm)</Label>
                        <Input
                          id="verticalRepeat"
                          type="number"
                          value={formData.verticalRepeat}
                          onChange={(e) => handleInputChange("verticalRepeat", e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="horizontalRepeat">Horizontal Repeat (cm)</Label>
                        <Input
                          id="horizontalRepeat"
                          type="number"
                          value={formData.horizontalRepeat}
                          onChange={(e) => handleInputChange("horizontalRepeat", e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Hardware Selection</Label>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <Label>Hardware Type</Label>
                      <Select value={formData.hardware} onValueChange={(value) => handleInputChange("hardware", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hardware" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="curtain-pole">Curtain Pole</SelectItem>
                          <SelectItem value="curtain-track">Curtain Track</SelectItem>
                          <SelectItem value="bay-track">Bay Track</SelectItem>
                          <SelectItem value="motorized">Motorized Track</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Finish</Label>
                      <Select value={formData.hardwareFinish} onValueChange={(value) => handleInputChange("hardwareFinish", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select finish" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chrome">Chrome</SelectItem>
                          <SelectItem value="brass">Brass</SelectItem>
                          <SelectItem value="black">Black</SelectItem>
                          <SelectItem value="white">White</SelectItem>
                          <SelectItem value="wood">Wood</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label className="text-base font-medium">Additional Features</Label>
                    <p className="text-sm text-muted-foreground">
                      Selected: {formData.additionalFeatures.filter(f => f.selected).length}
                    </p>
                  </div>
                  
                  <div className="grid gap-3 max-h-64 overflow-y-auto">
                    {availableFeatures.map((feature) => {
                      const isAdded = formData.additionalFeatures.some(f => f.id === feature.id);
                      const addedFeature = formData.additionalFeatures.find(f => f.id === feature.id);
                      
                      return (
                        <Card key={feature.id}>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{feature.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Additional cost: {formatCurrency(feature.price)}
                                </p>
                              </div>
                              {isAdded ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={addedFeature?.selected || false}
                                    onChange={() => handleFeatureToggle(feature.id)}
                                    className="rounded"
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setFormData(prev => ({
                                        ...prev,
                                        additionalFeatures: prev.additionalFeatures.filter(f => f.id !== feature.id)
                                      }));
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addFeature(feature)}
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Pricing Settings</Label>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <Label htmlFor="laborRate">Labor Rate ($/hour)</Label>
                      <Input
                        id="laborRate"
                        type="number"
                        value={formData.laborRate}
                        onChange={(e) => handleInputChange("laborRate", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="markupPercentage">Markup Percentage (%)</Label>
                      <Input
                        id="markupPercentage"
                        type="number"
                        value={formData.markupPercentage}
                        onChange={(e) => handleInputChange("markupPercentage", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Calculation Tab */}
            {activeTab === 'calculation' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calculator className="mr-2 h-5 w-5" />
                      Cost Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="font-medium">Material Requirements</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Fabric needed:</span>
                            <span className="font-medium">{calculation.fabricYards} yards</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Labor hours:</span>
                            <span className="font-medium">{calculation.laborHours} hours</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Selected Fabric</h4>
                        <div className="text-sm">
                          {formData.selectedFabric ? (
                            <div className="space-y-1">
                              <p className="font-medium">{formData.selectedFabric.name}</p>
                              <p className="text-muted-foreground">Code: {formData.selectedFabric.code}</p>
                              <p>{formatCurrency(formData.selectedFabric.pricePerYard)}/yard</p>
                            </div>
                          ) : formData.fabricName ? (
                            <div className="space-y-1">
                              <p className="font-medium">{formData.fabricName}</p>
                              <p>{formatCurrency(parseFloat(formData.fabricPricePerYard) || 0)}/yard</p>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">No fabric selected</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-medium">Cost Breakdown</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Fabric cost:</span>
                          <span>{formatCurrency(calculation.fabricCost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Labor cost:</span>
                          <span>{formatCurrency(calculation.laborCost)}</span>
                        </div>
                        {calculation.featuresCost > 0 && (
                          <div className="flex justify-between">
                            <span>Additional features:</span>
                            <span>{formatCurrency(calculation.featuresCost)}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-2">
                          <span>Subtotal:</span>
                          <span className="font-medium">{formatCurrency(calculation.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Markup ({formData.markupPercentage}%):</span>
                          <span>{formatCurrency(calculation.total - calculation.subtotal)}</span>
                        </div>
                        <div className="flex justify-between border-t-2 pt-2 text-lg font-bold">
                          <span>Total Price:</span>
                          <span className="text-primary">{formatCurrency(calculation.total)}</span>
                        </div>
                      </div>
                    </div>

                    {formData.additionalFeatures.filter(f => f.selected).length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <h4 className="font-medium">Selected Features</h4>
                          <div className="space-y-1">
                            {formData.additionalFeatures.filter(f => f.selected).map(feature => (
                              <div key={feature.id} className="flex justify-between text-sm">
                                <span>{feature.name}</span>
                                <span>{formatCurrency(feature.price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Total: <span className="font-bold text-lg text-primary">{formatCurrency(calculation.total)}</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-slate-600 hover:bg-slate-700">
                Save Treatment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
