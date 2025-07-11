import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Palette, Check, Package, Plus } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { formatCurrency } from "@/hooks/useBusinessSettings";

interface FabricSelectorProps {
  selectedFabricId?: string;
  onSelectFabric: (fabricId: string, fabric: any) => void;
}

export const FabricSelector = ({ selectedFabricId, onSelectFabric }: FabricSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedType, setSelectedType] = useState("");
  
  const { units, getFabricUnitLabel } = useMeasurementUnits();
  
  // Manual fabric entry state
  const [manualFabric, setManualFabric] = useState({
    name: "",
    color: "",
    pattern: "",
    type: "",
    width: "",
    cost_per_unit: "",
    unit: units.fabric,
    rotation: "vertical" as "vertical" | "horizontal",
    notes: ""
  });
  
  const { data: inventory, isLoading } = useInventory();
  
  // Filter fabrics from inventory
  const fabrics = useMemo(() => {
    console.log('FabricSelector - Raw inventory data:', inventory);
    console.log('FabricSelector - Total inventory items:', inventory?.length);
    
    const filteredFabrics = inventory?.filter(item => {
      const isMatchingCategory = item.category?.toLowerCase() === 'fabric';
      const isMatchingType = item.type?.toLowerCase().includes('fabric');
      const isMatchingName = item.name?.toLowerCase().includes('fabric');
      const matches = isMatchingCategory || isMatchingType || isMatchingName;
      
      if (matches) {
        console.log('FabricSelector - Found fabric item:', item);
      }
      
      return matches;
    }) || [];
    
    console.log('FabricSelector - Filtered fabrics:', filteredFabrics);
    console.log('FabricSelector - Found fabrics count:', filteredFabrics.length);
    
    return filteredFabrics;
  }, [inventory]);

  // Get selected fabric details
  const selectedFabric = fabrics.find(f => f.id === selectedFabricId);

  // Filter fabrics based on search and filters
  const filteredFabrics = useMemo(() => {
    return fabrics.filter(fabric => {
      const matchesSearch = searchTerm === "" || 
        fabric.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fabric.pattern?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fabric.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fabric.sku?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesColor = selectedColor === "" || 
        fabric.color?.toLowerCase().includes(selectedColor.toLowerCase());
      
      const matchesType = selectedType === "" || 
        fabric.type?.toLowerCase().includes(selectedType.toLowerCase());

      return matchesSearch && matchesColor && matchesType;
    });
  }, [fabrics, searchTerm, selectedColor, selectedType]);

  // Get unique colors and types for filters
  const availableColors = useMemo(() => {
    const colors = fabrics.map(f => f.color).filter(Boolean);
    return [...new Set(colors)].sort();
  }, [fabrics]);

  const availableTypes = useMemo(() => {
    const types = fabrics.map(f => f.type).filter(Boolean);
    return [...new Set(types)].sort();
  }, [fabrics]);

  const handleSelectFabric = (fabric: any) => {
    onSelectFabric(fabric.id, fabric);
    setIsOpen(false);
  };

  const handleManualFabricSubmit = () => {
    if (!manualFabric.name.trim()) {
      return; // Basic validation
    }
    
    // Create a unique ID for manual fabric
    const manualId = `manual-${Date.now()}`;
    const fabricData = {
      id: manualId,
      ...manualFabric,
      cost_per_unit: parseFloat(manualFabric.cost_per_unit) || 0,
      width: parseFloat(manualFabric.width) || 0,
      quantity: 0, // Manual entries don't have inventory quantity
      category: 'fabric'
    };
    
    onSelectFabric(manualId, fabricData);
    setIsOpen(false);
    
    // Reset manual form
    setManualFabric({
      name: "",
      color: "",
      pattern: "",
      type: "",
      width: "",
      cost_per_unit: "",
      unit: units.fabric,
      rotation: "vertical" as "vertical" | "horizontal",
      notes: ""
    });
  };

  const handleManualInputChange = (field: string, value: string) => {
    setManualFabric(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedColor("");
    setSelectedType("");
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
                         {(selectedFabric as any).rotation ? ` • ${(selectedFabric as any).rotation}` : ''}
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
      
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Select Fabric
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="library" className="flex flex-col h-full min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              From Library
              <Badge variant="secondary">{filteredFabrics.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="library" className="flex-1 min-h-0 mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading fabrics...</span>
              </div>
            ) : (
              <div className="flex flex-col h-full min-h-0">
                {/* Search and Filters */}
                <div className="space-y-4 mb-4 flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search fabrics by name, color, pattern, or SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex-1 min-w-32">
                      <Label className="text-xs">Color</Label>
                      <select 
                        value={selectedColor} 
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm bg-white"
                      >
                        <option value="">All Colors</option>
                        {availableColors.map(color => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex-1 min-w-32">
                      <Label className="text-xs">Type</Label>
                      <select 
                        value={selectedType} 
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm bg-white"
                      >
                        <option value="">All Types</option>
                        {availableTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Fabric Grid */}
                <div className="flex-1 min-h-0">
                  <ScrollArea className="h-full">
                    {filteredFabrics.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="font-medium">No fabrics found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-1">
                        {filteredFabrics.map((fabric) => (
                          <Card
                            key={fabric.id}
                            className={`p-3 cursor-pointer transition-all hover:shadow-md border-2 ${
                              selectedFabricId === fabric.id 
                                ? 'border-primary bg-primary/5' 
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => handleSelectFabric(fabric)}
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm truncate">{fabric.name}</h4>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {fabric.sku && `SKU: ${fabric.sku}`}
                                  </p>
                                </div>
                                {selectedFabricId === fabric.id && (
                                  <Check className="h-4 w-4 text-primary flex-shrink-0 ml-2" />
                                )}
                              </div>
                              
                              <div className="space-y-1">
                                {fabric.color && (
                                  <Badge variant="outline" className="text-xs">
                                    {fabric.color}
                                  </Badge>
                                )}
                                {fabric.pattern && (
                                  <Badge variant="outline" className="text-xs ml-1">
                                    {fabric.pattern}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="text-xs text-muted-foreground space-y-1">
                                {fabric.type && (
                                  <div>Type: {fabric.type}</div>
                                )}
                                <div className="flex justify-between">
                                  <span>Available:</span>
                                  <span className="font-medium">
                                    {fabric.quantity} {fabric.unit}
                                  </span>
                                </div>
                                 {fabric.cost_per_unit && (
                                   <div className="flex justify-between">
                                     <span>Cost:</span>
                                     <span className="font-medium">
                                       {formatCurrency(fabric.cost_per_unit, units.currency)}/{fabric.unit}
                                     </span>
                                   </div>
                                 )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="flex-1 min-h-0 mt-4">
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium">Manual Fabric Entry</h3>
                <p className="text-sm text-muted-foreground">Enter fabric details manually</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fabric-name">Fabric Name *</Label>
                  <Input
                    id="fabric-name"
                    placeholder="e.g., Premium Cotton Velvet"
                    value={manualFabric.name}
                    onChange={(e) => handleManualInputChange('name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fabric-color">Color</Label>
                  <Input
                    id="fabric-color"
                    placeholder="e.g., Navy Blue"
                    value={manualFabric.color}
                    onChange={(e) => handleManualInputChange('color', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fabric-pattern">Pattern</Label>
                  <Input
                    id="fabric-pattern"
                    placeholder="e.g., Solid, Striped, Floral"
                    value={manualFabric.pattern}
                    onChange={(e) => handleManualInputChange('pattern', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fabric-type">Type</Label>
                  <Input
                    id="fabric-type"
                    placeholder="e.g., Cotton, Silk, Linen"
                    value={manualFabric.type}
                    onChange={(e) => handleManualInputChange('type', e.target.value)}
                  />
                </div>
                
                 <div className="space-y-2">
                   <Label htmlFor="fabric-width">Width ({units.length === 'inches' ? 'inches' : 'cm'})</Label>
                   <Input
                     id="fabric-width"
                     type="number"
                     placeholder={units.length === 'inches' ? '54' : '137'}
                     value={manualFabric.width}
                     onChange={(e) => handleManualInputChange('width', e.target.value)}
                   />
                 </div>
                
                 <div className="space-y-2">
                   <Label htmlFor="fabric-cost">Cost per {getFabricUnitLabel()} ({units.currency})</Label>
                   <Input
                     id="fabric-cost"
                     type="number"
                     step="0.01"
                     placeholder="25.00"
                     value={manualFabric.cost_per_unit}
                     onChange={(e) => handleManualInputChange('cost_per_unit', e.target.value)}
                   />
                 </div>
                
                 <div className="space-y-2">
                   <Label>Fabric Rotation</Label>
                   <div className="flex gap-4">
                     <label className="flex items-center space-x-2 cursor-pointer">
                       <input
                         type="radio"
                         name="fabric-rotation"
                         value="vertical"
                         checked={manualFabric.rotation === 'vertical'}
                         onChange={(e) => handleManualInputChange('rotation', e.target.value)}
                         className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                       />
                       <span className="text-sm">Vertical</span>
                     </label>
                     <label className="flex items-center space-x-2 cursor-pointer">
                       <input
                         type="radio"
                         name="fabric-rotation"
                         value="horizontal"
                         checked={manualFabric.rotation === 'horizontal'}
                         onChange={(e) => handleManualInputChange('rotation', e.target.value)}
                         className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                       />
                       <span className="text-sm">Horizontal</span>
                     </label>
                   </div>
                 </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fabric-notes">Notes (Optional)</Label>
                <Input
                  id="fabric-notes"
                  placeholder="Additional fabric details..."
                  value={manualFabric.notes}
                  onChange={(e) => handleManualInputChange('notes', e.target.value)}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleManualFabricSubmit}
                  disabled={!manualFabric.name.trim()}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Fabric
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};