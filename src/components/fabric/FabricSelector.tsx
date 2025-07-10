import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Search, Palette, Check, Package } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";

interface FabricSelectorProps {
  selectedFabricId?: string;
  onSelectFabric: (fabricId: string, fabric: any) => void;
}

export const FabricSelector = ({ selectedFabricId, onSelectFabric }: FabricSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedType, setSelectedType] = useState("");
  
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
                <div>
                  <div className="font-medium truncate">{selectedFabric.name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {selectedFabric.color} • {selectedFabric.pattern} • {selectedFabric.quantity} {selectedFabric.unit} available
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-medium">Select Fabric</div>
                  <div className="text-sm text-muted-foreground">Choose from fabric library</div>
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
            Fabric Library
            <Badge variant="secondary">{filteredFabrics.length} fabrics</Badge>
          </DialogTitle>
        </DialogHeader>

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
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
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
                    className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
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
                                  ${fabric.cost_per_unit}/{fabric.unit}
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
      </DialogContent>
    </Dialog>
  );
};