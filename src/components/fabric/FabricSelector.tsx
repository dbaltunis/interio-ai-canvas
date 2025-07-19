import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Palette } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface FabricSelectorProps {
  selectedFabricId?: string;
  onSelectFabric: (fabricId: string, fabric: any) => void;
}

export const FabricSelector = ({ selectedFabricId, onSelectFabric }: FabricSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedFabric, setSelectedFabric] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('library');
  
  const [manualFabric, setManualFabric] = useState({
    name: '',
    width: '',
    pricePerUnit: '',
    color: '',
    pattern: '',
    type: '',
    rotation: 'vertical' as 'vertical' | 'horizontal'
  });

  const { data: inventory, isLoading } = useInventory();
  const { units } = useMeasurementUnits();
  
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Filter inventory to only show fabrics
  const fabrics = useMemo(() => {
    if (!inventory) {
      console.log('FabricSelector - No inventory data available');
      return [];
    }
    
    const fabricItems = inventory.filter(item => 
      item.category?.toLowerCase() === 'fabric' || 
      item.description?.toLowerCase().includes('fabric')
    ).map(item => ({
      ...item,
      // Map inventory fields to fabric fields for backward compatibility
      color: item.description?.includes('color:') ? item.description.split('color:')[1]?.split(',')[0]?.trim() : '',
      pattern: item.description?.includes('pattern:') ? item.description.split('pattern:')[1]?.split(',')[0]?.trim() : '',
      type: item.category || 'fabric',
      width: 137, // Default fabric width
      cost_per_unit: item.unit_price || 0,
      unit: 'yard'
    }));
    
    console.log('FabricSelector - Found fabrics:', fabricItems.length);
    return fabricItems;
  }, [inventory]);

  // Filter fabrics based on search and filters
  const filteredFabrics = useMemo(() => {
    return fabrics.filter(fabric => {
      const matchesSearch = !searchTerm || 
        fabric.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fabric.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fabric.pattern?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesColor = !selectedColor || fabric.color === selectedColor;
      const matchesType = !selectedType || fabric.type === selectedType;
      
      return matchesSearch && matchesColor && matchesType;
    });
  }, [fabrics, searchTerm, selectedColor, selectedType]);

  // Get unique colors and types for filter options
  const { uniqueColors, uniqueTypes } = useMemo(() => {
    const colors = new Set(fabrics.map(f => f.color).filter(Boolean));
    const types = new Set(fabrics.map(f => f.type).filter(Boolean));
    
    return {
      uniqueColors: Array.from(colors),
      uniqueTypes: Array.from(types)
    };
  }, [fabrics]);

  // Update selected fabric when selectedFabricId changes and populate manual form if it's a manual fabric
  useEffect(() => {
    if (selectedFabricId) {
      // First check if it's from inventory
      const inventoryFabric = fabrics.find(f => f.id === selectedFabricId);
      if (inventoryFabric) {
        setSelectedFabric(inventoryFabric);
        setActiveTab('library');
      } else {
        // Check if it's a manual fabric (stored in selectedFabric)
        if (selectedFabric && selectedFabric.id === selectedFabricId && selectedFabric.isManual) {
          // Populate manual form with existing data
          setManualFabric({
            name: selectedFabric.name || '',
            width: selectedFabric.width?.toString() || '',
            pricePerUnit: selectedFabric.cost_per_unit?.toString() || '',
            color: selectedFabric.color || '',
            pattern: selectedFabric.pattern || '',
            type: selectedFabric.type || '',
            rotation: selectedFabric.rotation || 'vertical'
          });
          setActiveTab('manual');
        }
      }
    }
  }, [selectedFabricId, fabrics, selectedFabric]);

  // When dialog opens, restore the current fabric data
  useEffect(() => {
    if (isOpen && selectedFabric && selectedFabric.isManual) {
      setManualFabric({
        name: selectedFabric.name || '',
        width: selectedFabric.width?.toString() || '',
        pricePerUnit: selectedFabric.cost_per_unit?.toString() || '',
        color: selectedFabric.color || '',
        pattern: selectedFabric.pattern || '',
        type: selectedFabric.type || '',
        rotation: selectedFabric.rotation || 'vertical'
      });
      setActiveTab('manual');
    }
  }, [isOpen, selectedFabric]);

  const handleSelectFabric = (fabric: any) => {
    console.log('FabricSelector - Fabric selected:', fabric);
    setSelectedFabric(fabric);
    onSelectFabric(fabric.id, fabric);
    setIsOpen(false);
  };

  const handleManualFabricSubmit = () => {
    if (!manualFabric.name || !manualFabric.width || !manualFabric.pricePerUnit) {
      return; // Don't submit if required fields are missing
    }

    const fabricData = {
      id: selectedFabric?.isManual && selectedFabric?.id ? selectedFabric.id : `manual-${Date.now()}`,
      name: manualFabric.name,
      width: parseFloat(manualFabric.width),
      cost_per_unit: parseFloat(manualFabric.pricePerUnit),
      color: manualFabric.color,
      pattern: manualFabric.pattern,
      type: manualFabric.type,
      rotation: manualFabric.rotation,
      unit: units.fabric,
      isManual: true,
      quantity: 999 // Set high quantity for manual fabrics
    };
    
    console.log('FabricSelector - Manual fabric saved:', fabricData);
    setSelectedFabric(fabricData);
    onSelectFabric(fabricData.id, fabricData);
    setIsOpen(false);
  };

  const handleManualInputChange = (field: string, value: string) => {
    setManualFabric(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedColor('');
    setSelectedType('');
  };

  const resetManualForm = () => {
    setManualFabric({
      name: '',
      width: '',
      pricePerUnit: '',
      color: '',
      pattern: '',
      type: '',
      rotation: 'vertical'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start h-auto p-3 text-left"
        >
          <div className="flex items-center w-full">
            <Palette className="h-4 w-4 mr-2 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              {selectedFabric ? (
                <div className="space-y-1">
                  <div className="font-medium truncate">{selectedFabric.name}</div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedFabric.color && (
                        <Badge variant="outline" className="text-xs">{selectedFabric.color}</Badge>
                      )}
                      {selectedFabric.pattern && (
                        <Badge variant="outline" className="text-xs">{selectedFabric.pattern}</Badge>
                      )}
                      {selectedFabric.type && (
                        <Badge variant="outline" className="text-xs">{selectedFabric.type}</Badge>
                      )}
                    </div>
                     <div className="mt-1 flex items-center justify-between text-xs">
                       <span>
                         {selectedFabric.width ? `${selectedFabric.width}" wide` : ''}
                         {selectedFabric.rotation ? ` • ${selectedFabric.rotation}` : ''}
                       </span>
                      {selectedFabric.cost_per_unit && (
                        <span className="font-medium">
                          {formatCurrency(selectedFabric.cost_per_unit, units.currency)}/{selectedFabric.unit || units.fabric}
                        </span>
                      )}
                    </div>
                    {selectedFabric.quantity !== undefined && (
                      <div className="text-xs text-green-600 mt-1">
                        ✓ {selectedFabric.quantity} {selectedFabric.unit || units.fabric} available
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-medium">Select Fabric</div>
                  <div className="text-sm text-muted-foreground">Choose from library or enter manually</div>
                </div>
              )}
            </div>
          </div>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select Fabric</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">From Library</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>
          
          <TabsContent value="library" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Search and Filters */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search fabrics..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <Select value={selectedColor} onValueChange={setSelectedColor}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Color" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueColors.map(color => (
                          <SelectItem key={color} value={color}>{color}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                </div>
                
                {/* Results */}
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredFabrics.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {fabrics.length === 0 ? 'No fabrics in inventory' : 'No fabrics match your search'}
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {filteredFabrics.map((fabric) => (
                        <Card 
                          key={fabric.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleSelectFabric(fabric)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <h3 className="font-medium">{fabric.name}</h3>
                                <div className="flex gap-2 flex-wrap">
                                  {fabric.color && (
                                    <Badge variant="secondary" className="text-xs">{fabric.color}</Badge>
                                  )}
                                  {fabric.pattern && (
                                    <Badge variant="secondary" className="text-xs">{fabric.pattern}</Badge>
                                  )}
                                  {fabric.type && (
                                    <Badge variant="secondary" className="text-xs">{fabric.type}</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {fabric.width && `${fabric.width}" wide`}
                                  {fabric.quantity !== undefined && ` • ${fabric.quantity} ${fabric.unit || 'units'} available`}
                                </div>
                              </div>
                              <div className="text-right">
                                {fabric.cost_per_unit && (
                                  <div className="font-medium">
                                    {formatCurrency(fabric.cost_per_unit, units.currency)}/{fabric.unit || units.fabric}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fabric-name">Fabric Name *</Label>
                <Input
                  id="fabric-name"
                  value={manualFabric.name}
                  onChange={(e) => handleManualInputChange('name', e.target.value)}
                  placeholder="Enter fabric name"
                />
              </div>
              
              <div>
                <Label htmlFor="fabric-width">Width ({units.fabric}) *</Label>
                <Input
                  id="fabric-width"
                  type="number"
                  value={manualFabric.width}
                  onChange={(e) => handleManualInputChange('width', e.target.value)}
                  placeholder="Enter width"
                />
              </div>
              
              <div>
                <Label htmlFor="fabric-price">Price per {units.fabric} *</Label>
                <Input
                  id="fabric-price"
                  type="number"
                  step="0.01"
                  value={manualFabric.pricePerUnit}
                  onChange={(e) => handleManualInputChange('pricePerUnit', e.target.value)}
                  placeholder="Enter price"
                />
              </div>
              
              <div>
                <Label htmlFor="fabric-color">Color</Label>
                <Input
                  id="fabric-color"
                  value={manualFabric.color}
                  onChange={(e) => handleManualInputChange('color', e.target.value)}
                  placeholder="Enter color"
                />
              </div>
              
              <div>
                <Label htmlFor="fabric-pattern">Pattern</Label>
                <Input
                  id="fabric-pattern"
                  value={manualFabric.pattern}
                  onChange={(e) => handleManualInputChange('pattern', e.target.value)}
                  placeholder="Enter pattern"
                />
              </div>
              
              <div>
                <Label htmlFor="fabric-type">Type</Label>
                <Input
                  id="fabric-type"
                  value={manualFabric.type}
                  onChange={(e) => handleManualInputChange('type', e.target.value)}
                  placeholder="Enter type"
                />
              </div>
            </div>
            
            <div>
              <Label>Fabric Rotation</Label>
              <RadioGroup 
                value={manualFabric.rotation} 
                onValueChange={(value: 'vertical' | 'horizontal') => handleManualInputChange('rotation', value)}
                className="flex gap-6 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vertical" id="vertical" />
                  <Label htmlFor="vertical">Vertical</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="horizontal" id="horizontal" />
                  <Label htmlFor="horizontal">Horizontal</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button 
                variant="outline"
                onClick={resetManualForm}
              >
                Clear Form
              </Button>
              <Button 
                onClick={handleManualFabricSubmit}
                disabled={!manualFabric.name || !manualFabric.width || !manualFabric.pricePerUnit}
              >
                {selectedFabric?.isManual ? 'Update Fabric' : 'Add Fabric'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
