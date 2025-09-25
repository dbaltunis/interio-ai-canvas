import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Edit, Trash2, Settings, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { MakingCost } from "@/hooks/useMakingCosts";
import { useOptionCategories, type OptionCategory } from "@/hooks/useOptionCategories";
import { useMakingCostOptionMappings } from "@/hooks/useMakingCostOptionMappings";

interface MakingCostOptionMappingManagerProps {
  makingCost: MakingCost;
  onClose: () => void;
}

export const MakingCostOptionMappingManager = ({ 
  makingCost, 
  onClose 
}: MakingCostOptionMappingManagerProps) => {
  const { data: optionCategories, isLoading: categoriesLoading } = useOptionCategories();
  const { data: mappings, isLoading: mappingsLoading } = useMakingCostOptionMappings(makingCost.id);
  const [activeTab, setActiveTab] = useState("assign");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const renderOptionCategory = (category: OptionCategory) => {
    const isExpanded = expandedCategories.includes(category.id);
    
    return (
      <Card key={category.id} className="mb-4">
        <Collapsible>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleCategory(category.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <div>
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={category.is_required ? "default" : "secondary"}>
                    {category.is_required ? "Required" : "Optional"}
                  </Badge>
                  <Badge variant="outline">{category.category_type}</Badge>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {category.subcategories && category.subcategories.length > 0 ? (
                <div className="space-y-3">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory.id} className="border rounded-lg p-3 bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{subcategory.name}</h5>
                        <Badge variant="outline" className="text-xs">
                          £{subcategory.base_price} {subcategory.pricing_method}
                        </Badge>
                      </div>
                      {subcategory.description && (
                        <p className="text-sm text-muted-foreground mb-2">{subcategory.description}</p>
                      )}
                      
                      {/* Sub-subcategories */}
                      {subcategory.sub_subcategories && subcategory.sub_subcategories.length > 0 && (
                        <div className="ml-4 space-y-2 mt-3">
                          {subcategory.sub_subcategories.map((subSub) => (
                            <div key={subSub.id} className="border rounded-md p-2 bg-background">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{subSub.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  £{subSub.base_price} {subSub.pricing_method}
                                </span>
                              </div>
                              
                              {/* Extras */}
                              {subSub.extras && subSub.extras.length > 0 && (
                                <div className="ml-4 mt-2 space-y-1">
                                  {subSub.extras.map((extra) => (
                                    <div key={extra.id} className="flex items-center justify-between text-xs">
                                      <span className="text-muted-foreground">
                                        {extra.name} {extra.is_required && "(Required)"}
                                      </span>
                                      <span className="text-muted-foreground">£{extra.base_price}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No subcategories configured</p>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  if (categoriesLoading || mappingsLoading) {
    return <div className="text-center py-8">Loading option categories...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-semibold">Configure Options for {makingCost.name}</h3>
          <p className="text-sm text-muted-foreground">
            Assign option categories and configure pricing for this product type
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assign">Assign Categories</TabsTrigger>
          <TabsTrigger value="preview">Preview Structure</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="assign" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Option Categories</CardTitle>
              <CardDescription>
                Select which option categories apply to {makingCost.name}. 
                Each category can contain multiple subcategories and pricing options.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {optionCategories && optionCategories.length > 0 ? (
                <div className="space-y-4">
                  {optionCategories.map(renderOptionCategory)}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-muted-foreground mb-2">No Option Categories</h4>
                  <p className="text-muted-foreground mb-4">
                    Create option categories first to assign them to products
                  </p>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Option Category
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Option Structure Preview</CardTitle>
              <CardDescription>
                Preview how options will appear in the calculator for {makingCost.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {optionCategories?.map((category) => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{category.name}</h4>
                      <Badge variant={category.is_required ? "default" : "secondary"}>
                        {category.is_required ? "Required" : "Optional"}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-2">
                      {category.subcategories?.map((sub) => (
                        <div key={sub.id} className="text-sm p-2 bg-muted rounded">
                          <span className="font-medium">{sub.name}</span>
                          <span className="text-muted-foreground ml-2">
                            (£{sub.base_price} {sub.pricing_method})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Configuration Settings</CardTitle>
              <CardDescription>
                Configure specific settings for how {makingCost.name} behaves in calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Measurement Unit</Label>
                  <Select defaultValue="meters">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meters">Meters</SelectItem>
                      <SelectItem value="yards">Yards</SelectItem>
                      <SelectItem value="feet">Feet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Order Quantity</Label>
                  <Input type="number" defaultValue="1" min="1" />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="allow-custom-sizing" />
                  <Label htmlFor="allow-custom-sizing">Allow Custom Sizing</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="require-installation" />
                  <Label htmlFor="require-installation">Require Installation</Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h5 className="font-medium">Calculation Rules</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Waste Factor (%)</Label>
                    <Input type="number" defaultValue="10" min="0" max="50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Labor Multiplier</Label>
                    <Input type="number" defaultValue="1.0" min="0.1" step="0.1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};