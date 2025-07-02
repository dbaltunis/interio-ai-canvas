import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Settings } from "lucide-react";
import { useMakingCostOptionMappings } from "@/hooks/useMakingCostOptionMappings";
import { useWindowCoveringCategories } from "@/hooks/useWindowCoveringCategories";
import type { MakingCost } from "@/hooks/useMakingCosts";

interface MakingCostOptionMappingManagerProps {
  makingCost: MakingCost;
  onClose: () => void;
}

export const MakingCostOptionMappingManager = ({ makingCost, onClose }: MakingCostOptionMappingManagerProps) => {
  const { mappings, isLoading, createMapping, updateMapping, deleteMapping } = useMakingCostOptionMappings(makingCost.id);
  const { categories } = useWindowCoveringCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedOptionType, setSelectedOptionType] = useState<'heading' | 'hardware' | 'lining'>('heading');
  const [overridePricing, setOverridePricing] = useState<string>('');

  const availableCategories = categories.filter(cat => 
    !mappings.some(mapping => 
      mapping.option_category_id === cat.id && 
      mapping.option_type === selectedOptionType
    )
  );

  const handleAddMapping = async () => {
    if (!selectedCategory) return;

    try {
      await createMapping({
        making_cost_id: makingCost.id,
        option_category_id: selectedCategory,
        option_type: selectedOptionType,
        is_included: true,
        override_pricing: overridePricing ? parseFloat(overridePricing) : undefined
      });
      
      setSelectedCategory('');
      setOverridePricing('');
    } catch (error) {
      console.error('Failed to add mapping:', error);
    }
  };

  const handleToggleIncluded = async (mappingId: string, currentState: boolean) => {
    try {
      await updateMapping(mappingId, { is_included: !currentState });
    } catch (error) {
      console.error('Failed to toggle mapping:', error);
    }
  };

  const handleUpdateOverridePricing = async (mappingId: string, price?: number) => {
    try {
      await updateMapping(mappingId, { override_pricing: price });
    } catch (error) {
      console.error('Failed to update override pricing:', error);
    }
  };

  const getGroupedMappings = () => {
    return {
      heading: mappings.filter(m => m.option_type === 'heading'),
      hardware: mappings.filter(m => m.option_type === 'hardware'),
      lining: mappings.filter(m => m.option_type === 'lining')
    };
  };

  const groupedMappings = getGroupedMappings();

  if (isLoading) {
    return <div className="text-center py-8">Loading option mappings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">
            Manage Options: {makingCost.name}
          </h3>
          <p className="text-sm text-brand-neutral">
            Configure which option categories are bundled with this making cost
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Add New Mapping */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Option Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="option-type">Option Type</Label>
              <Select value={selectedOptionType} onValueChange={(value: any) => setSelectedOptionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heading">Heading</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="lining">Lining</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="category">Option Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select category</SelectItem>
                  {availableCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="override-pricing">Override Pricing (£)</Label>
              <Input
                id="override-pricing"
                type="number"
                step="0.01"
                placeholder="Optional"
                value={overridePricing}
                onChange={(e) => setOverridePricing(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleAddMapping} 
                disabled={!selectedCategory}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Option Mappings by Type */}
      <Tabs defaultValue="heading" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="heading" className="flex items-center gap-2">
            Heading Options ({groupedMappings.heading.length})
          </TabsTrigger>
          <TabsTrigger value="hardware" className="flex items-center gap-2">
            Hardware Options ({groupedMappings.hardware.length})
          </TabsTrigger>
          <TabsTrigger value="lining" className="flex items-center gap-2">
            Lining Options ({groupedMappings.lining.length})
          </TabsTrigger>
        </TabsList>

        {(['heading', 'hardware', 'lining'] as const).map(optionType => (
          <TabsContent key={optionType} value={optionType} className="space-y-4">
            {groupedMappings[optionType].length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-brand-neutral">No {optionType} options configured yet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add option categories to bundle them with this making cost.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {groupedMappings[optionType].map(mapping => (
                  <Card key={mapping.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-brand-primary">
                              {mapping.option_category?.name}
                            </h4>
                            <Badge variant={mapping.is_included ? "default" : "secondary"}>
                              {mapping.is_included ? "Included" : "Disabled"}
                            </Badge>
                            {mapping.option_category?.affects_fabric_calculation && (
                              <Badge variant="outline">
                                Affects Fabric
                              </Badge>
                            )}
                            {mapping.option_category?.affects_labor_calculation && (
                              <Badge variant="outline">
                                Affects Labor
                              </Badge>
                            )}
                          </div>
                          
                          {mapping.option_category?.description && (
                            <p className="text-sm text-brand-neutral mb-2">
                              {mapping.option_category.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Method: {mapping.option_category?.calculation_method || 'Default'}</span>
                            {mapping.option_category?.fabric_waste_factor && (
                              <span>Waste Factor: {(mapping.option_category.fabric_waste_factor * 100).toFixed(1)}%</span>
                            )}
                            {mapping.option_category?.pattern_repeat_factor && mapping.option_category.pattern_repeat_factor !== 1 && (
                              <span>Pattern Factor: {mapping.option_category.pattern_repeat_factor}x</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`included-${mapping.id}`} className="text-sm">
                              Included
                            </Label>
                            <Switch
                              id={`included-${mapping.id}`}
                              checked={mapping.is_included}
                              onCheckedChange={(checked) => handleToggleIncluded(mapping.id, mapping.is_included)}
                            />
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`override-${mapping.id}`} className="text-sm whitespace-nowrap">
                              Override £
                            </Label>
                            <Input
                              id={`override-${mapping.id}`}
                              type="number"
                              step="0.01"
                              className="w-20"
                              placeholder="Auto"
                              value={mapping.override_pricing || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                handleUpdateOverridePricing(
                                  mapping.id, 
                                  value ? parseFloat(value) : undefined
                                );
                              }}
                            />
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMapping(mapping.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};