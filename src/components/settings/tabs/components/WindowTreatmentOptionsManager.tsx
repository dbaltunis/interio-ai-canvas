import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, X, ChevronLeft, ChevronRight, Package, Upload, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAllTreatmentOptions, useCreateOptionValue, useUpdateOptionValue, useDeleteOptionValue, useCreateTreatmentOption } from "@/hooks/useTreatmentOptionsManagement";
import type { TreatmentOption, OptionValue } from "@/hooks/useTreatmentOptions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOptionTypeCategories, useCreateOptionTypeCategory } from "@/hooks/useOptionTypeCategories";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TREATMENT_CATEGORIES, TreatmentCategoryDbValue } from "@/types/treatmentCategories";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { InventoryStockBadge } from "./InventoryStockBadge";

export const WindowTreatmentOptionsManager = () => {
  const queryClient = useQueryClient();
  const { data: allTreatmentOptions = [], isLoading } = useAllTreatmentOptions();
  
  const [activeTreatment, setActiveTreatment] = useState<TreatmentCategoryDbValue>(TREATMENT_CATEGORIES.ROLLER_BLINDS.db_value);
  const [activeOptionType, setActiveOptionType] = useState<string>('');
  
  // Fetch curtain templates (including system defaults for viewing)
  const { data: allTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['curtain-templates-for-options'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      
      const { data, error } = await supabase
        .from('curtain_templates')
        .select('*')
        .eq('active', true)
        .or(`user_id.eq.${user.user.id},is_system_default.eq.true`);
      if (error) throw error;
      return data;
    },
  });
  
  // Fetch option type categories dynamically from database
  const { data: optionTypeCategories = [], isLoading: categoriesLoading } = useOptionTypeCategories(activeTreatment);
  
  const createTreatmentOption = useCreateTreatmentOption();
  const createOptionValue = useCreateOptionValue();
  const updateOptionValue = useUpdateOptionValue();
  const deleteOptionValue = useDeleteOptionValue();
  const createOptionTypeCategory = useCreateOptionTypeCategory();
  const { toast } = useToast();
  
  // Fetch inventory items for linking
  const { data: inventoryItems = [] } = useEnhancedInventory();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingValue, setEditingValue] = useState<OptionValue | null>(null);
  const [showCreateOptionTypeDialog, setShowCreateOptionTypeDialog] = useState(false);
  const [newOptionTypeData, setNewOptionTypeData] = useState({ type_label: '', type_key: '' });
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    price: 0 as number,
    inventory_item_id: null as string | null,
    pricing_method: 'fixed' as string,
    pricing_grid_data: [] as Array<{ width: number; price: number }>,
  });

  // Set first option type when categories load
  useEffect(() => {
    if (optionTypeCategories.length > 0 && !activeOptionType) {
      setActiveOptionType(optionTypeCategories[0].type_key);
    }
  }, [optionTypeCategories, activeOptionType]);

  const resetForm = () => {
    setFormData({
      name: '',
      value: '',
      price: 0,
      inventory_item_id: null,
      pricing_method: 'fixed',
      pricing_grid_data: [],
    });
  };

  // Get templates matching the active treatment category
  // Use normalized category matching - templates should have been standardized by migration
  const matchingTemplates = allTemplates.filter((t: any) => {
    // Check if treatment_category matches (post-migration, all should be normalized)
    return t.treatment_category === activeTreatment;
  });

  // Find treatment options for the active treatment category and option type
  const relevantOptions = allTreatmentOptions.filter((opt: any) => 
    opt.treatment_category === activeTreatment && opt.key === activeOptionType
  );

  // For display, we'll show all unique option values across all options
  const allOptionValues = relevantOptions.flatMap(opt => opt.option_values || []);
  
  // Deduplicate by code
  const uniqueOptionValues = allOptionValues.reduce((acc, val) => {
    if (!acc.find(v => v.code === val.code)) {
      acc.push(val);
    }
    return acc;
  }, [] as OptionValue[]);

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.value.trim()) {
      toast({
        title: "Required fields",
        description: "Please enter both name and value.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingValue) {
        // Update the existing option value
        const opt = relevantOptions[0];
        const existingVal = opt?.option_values?.find(v => v.code === editingValue.code);
        if (existingVal) {
          await updateOptionValue.mutateAsync({
            id: existingVal.id,
            updates: {
              code: formData.value.trim().toLowerCase().replace(/\s+/g, '_'),
              label: formData.name.trim(),
              extra_data: { 
                price: Number(formData.price) || 0,
                pricing_method: formData.pricing_method,
                pricing_grid_data: formData.pricing_grid_data,
              },
              inventory_item_id: formData.inventory_item_id || null,
            }
          });
        }
        setEditingValue(null);
        
        toast({
          title: "Option updated",
          description: "The option value has been updated.",
        });
      } else {
        // Check if this option category already exists
        let treatmentOption = allTreatmentOptions.find(
          (opt: any) => opt.treatment_category === activeTreatment && opt.key === activeOptionType
        );

        // Create option category if it doesn't exist
        if (!treatmentOption) {
          const optionTypeConfig = optionTypeCategories.find(
            opt => opt.type_key === activeOptionType
          );
          
          try {
            treatmentOption = await createTreatmentOption.mutateAsync({
              key: activeOptionType,
              label: optionTypeConfig?.type_label || activeOptionType,
              input_type: 'select',
              required: false,
              visible: true,
              order_index: 0,
              treatment_category: activeTreatment,
              is_system_default: false,
            });
          } catch (error: any) {
            // If duplicate key error, refetch and use existing option
            if (error.message.includes('already exists')) {
              await queryClient.invalidateQueries({ queryKey: ['all-treatment-options'] });
              toast({
                title: "Option Already Exists",
                description: "This treatment option already exists. Refreshing data...",
              });
              return;
            }
            throw error;
          }
        }

        // Check if this value already exists
        const uniqueOptionValues = treatmentOption?.option_values || [];
        const valueCode = formData.value.trim().toLowerCase().replace(/\s+/g, '_');
        const existingValue = uniqueOptionValues.find(v => v.code === valueCode);
        
        if (existingValue) {
          toast({
            title: "Duplicate value",
            description: "This value already exists. Please use a different value or edit the existing one.",
            variant: "destructive"
          });
          return;
        }

        // Now create the value for this option
        await createOptionValue.mutateAsync({
          option_id: treatmentOption.id,
          code: valueCode,
          label: formData.name.trim(),
          order_index: uniqueOptionValues.length,
          extra_data: { 
            price: Number(formData.price) || 0,
            pricing_method: formData.pricing_method,
            pricing_grid_data: formData.pricing_grid_data,
          },
          inventory_item_id: formData.inventory_item_id || null,
        });

        // Invalidate queries to refetch the updated data
        queryClient.invalidateQueries({ queryKey: ['treatment-options'] });
        queryClient.invalidateQueries({ queryKey: ['option-values'] });

        setIsCreating(false);
        
        toast({
          title: "Option created",
          description: `New option value has been added.`,
        });
      }
      resetForm();
    } catch (error: any) {
      console.error('Error saving option:', error);
      toast({
        title: "Save failed",
        description: error?.message || "Failed to save option. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (value: OptionValue) => {
    setFormData({
      name: value.label,
      value: value.code,
      price: Number(value.extra_data?.price) || 0,
      inventory_item_id: value.inventory_item_id || null,
      pricing_method: value.extra_data?.pricing_method || 'fixed',
      pricing_grid_data: value.extra_data?.pricing_grid_data || [],
    });
    setEditingValue(value);
    setIsCreating(false);
  };

  const handleDelete = async (valueCode: string) => {
    if (confirm('Are you sure you want to delete this option from all templates?')) {
      try {
        // Delete this value from all templates
        for (const opt of relevantOptions) {
          const existingVal = opt.option_values?.find(v => v.code === valueCode);
          if (existingVal) {
            await deleteOptionValue.mutateAsync(existingVal.id);
          }
        }
        toast({
          title: "Option deleted",
          description: "The option has been removed from all templates.",
        });
      } catch (error) {
        console.error('Error deleting option:', error);
        toast({
          title: "Delete failed",
          description: "Failed to delete option. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingValue(null);
    resetForm();
  };
  
  const handleAddOption = (optionType: string) => {
    setActiveOptionType(optionType);
    setIsCreating(true);
    setEditingValue(null);
    resetForm();
  };

  const handleCreateOptionType = async () => {
    if (!newOptionTypeData.type_label.trim() || !newOptionTypeData.type_key.trim()) {
      toast({
        title: "Required fields",
        description: "Please enter both type label and type key.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createOptionTypeCategory.mutateAsync({
        treatment_category: activeTreatment,
        type_key: newOptionTypeData.type_key.toLowerCase().replace(/\s+/g, '_'),
        type_label: newOptionTypeData.type_label.trim(),
      });
      
      setShowCreateOptionTypeDialog(false);
      setNewOptionTypeData({ type_label: '', type_key: '' });
      toast({
        title: "Option type created",
        description: "You can now add values to this option type.",
      });
    } catch (error: any) {
      console.error('Error creating option type:', error);
      toast({
        title: "Create failed",
        description: error?.message || "Failed to create option type. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCSVImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // Skip header row if it exists
        const dataLines = lines[0].toLowerCase().includes('width') || lines[0].toLowerCase().includes('price')
          ? lines.slice(1)
          : lines;
        
        const pricingData = dataLines
          .map(line => {
            const [width, price] = line.split(',').map(v => v.trim());
            return {
              width: parseFloat(width),
              price: parseFloat(price)
            };
          })
          .filter(item => !isNaN(item.width) && !isNaN(item.price))
          .sort((a, b) => a.width - b.width); // Sort by width ascending

        if (pricingData.length === 0) {
          toast({
            title: "Import failed",
            description: "No valid pricing data found in CSV. Expected format: width,price",
            variant: "destructive"
          });
          return;
        }

        setFormData({ ...formData, pricing_grid_data: pricingData });
        toast({
          title: "Import successful",
          description: `Imported ${pricingData.length} pricing tiers`,
        });
      } catch (error) {
        console.error('CSV parsing error:', error);
        toast({
          title: "Import failed",
          description: "Failed to parse CSV file. Please check the format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input so the same file can be imported again
    event.target.value = '';
  };

  const handleDownloadCSVTemplate = () => {
    const csvContent = "width,price\n60,300\n200,400\n300,450";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pricing_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Template downloaded",
      description: "Use this CSV template to format your pricing data",
    });
  };

  const getTreatmentLabel = (category: TreatmentCategoryDbValue) => {
    const labels: Record<TreatmentCategoryDbValue, string> = {
      roller_blinds: 'Roller Blinds',
      roman_blinds: 'Roman Blinds',
      venetian_blinds: 'Venetian Blinds',
      vertical_blinds: 'Vertical Blinds',
      shutters: 'Shutters',
      awning: 'Awnings',
      plantation_shutters: 'Plantation Shutters',
      cellular_blinds: 'Cellular Shades',
      curtains: 'Curtains',
      panel_glide: 'Panel Glides',
    };
    return labels[category];
  };

  if (isLoading || templatesLoading || categoriesLoading) {
    return <div className="text-center py-8">Loading options...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Window Treatment Options</CardTitle>
        <CardDescription>
          Manage configuration options for all window treatment types (blinds, shutters, awnings)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Treatment Type Selection */}
        <div className="mb-6">
          <Label>Treatment Type</Label>
          <Select 
            value={activeTreatment} 
            onValueChange={(v) => {
              setActiveTreatment(v as TreatmentCategoryDbValue);
              setActiveOptionType(''); // Will be set by useEffect when categories load
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TREATMENT_CATEGORIES).map(cat => (
                <SelectItem key={cat.db_value} value={cat.db_value}>
                  {cat.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {optionTypeCategories.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <div className="text-muted-foreground">
              <p className="font-medium text-lg">No option types configured</p>
              <p className="text-sm mt-2">
                Option types for {getTreatmentLabel(activeTreatment)} have been initialized.
              </p>
              <p className="text-xs mt-1">
                Refresh the page or click below to start adding option values.
              </p>
              <Button 
                className="mt-4"
                onClick={() => setShowCreateOptionTypeDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Option Type
              </Button>
            </div>
          </div>
        ) : (
          <Tabs value={activeOptionType} onValueChange={(v) => setActiveOptionType(v)} className="w-full">
          <div className="relative flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0"
              onClick={() => {
                const scrollEl = document.querySelector('[data-radix-scroll-area-viewport]');
                if (scrollEl) scrollEl.scrollBy({ left: -200, behavior: 'smooth' });
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="w-max">{/* wrapper for horizontal scroll */}
              <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-max">
              {optionTypeCategories.map(opt => (
                <div key={opt.type_key} className="relative group">
                  <TabsTrigger value={opt.type_key} className="px-3 pr-8">
                    {opt.type_label}
                  </TabsTrigger>
                  {!opt.is_system_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${opt.type_label}" type? This will remove all its options.`)) {
                          try {
                            await supabase
                              .from('option_type_categories')
                              .delete()
                              .eq('id', opt.id);
                            
                            queryClient.invalidateQueries({ queryKey: ['option-type-categories'] });
                            toast({
                              title: "Type deleted",
                              description: `${opt.type_label} has been deleted.`,
                            });
                            
                            // Switch to first available type
                            if (optionTypeCategories.length > 1) {
                              const nextType = optionTypeCategories.find(t => t.type_key !== opt.type_key);
                              if (nextType) setActiveOptionType(nextType.type_key);
                            }
                          } catch (error: any) {
                            toast({
                              title: "Delete failed",
                              description: error.message,
                              variant: "destructive"
                            });
                          }
                        }
                      }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateOptionTypeDialog(true)}
                className="ml-2"
              >
                <Plus className="h-3 w-3 mr-1" />
                New Type
              </Button>
              </TabsList>
              </div>
            </ScrollArea>
            
            <Button
              variant="outline"
              size="sm"
              className="flex-shrink-0"
              onClick={() => {
                const scrollEl = document.querySelector('[data-radix-scroll-area-viewport]');
                if (scrollEl) scrollEl.scrollBy({ left: 200, behavior: 'smooth' });
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {optionTypeCategories.map((optType) => {
            const isSystemOnly = matchingTemplates.length > 0 && matchingTemplates.every(t => t.is_system_default);
            
            return (
              <TabsContent key={optType.type_key} value={optType.type_key} className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    {isSystemOnly 
                      ? `Viewing system ${optType.type_label.toLowerCase()} (clone template to customize)`
                      : `Add ${optType.type_label.toLowerCase()} for ${getTreatmentLabel(activeTreatment).toLowerCase()}`
                    }
                  </p>
                  {!isSystemOnly && (
                    <Button onClick={() => handleAddOption(optType.type_key)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  )}
                </div>

              {/* Create/Edit Form */}
              {(isCreating || editingValue) && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingValue ? `Edit Option` : `Add New Option`}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Display Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. 38mm Tube"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="value">Value *</Label>
                      <Input
                        id="value"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="e.g. 38mm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Lowercase with underscores for multi-word values
                      </p>
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="pricing_method">Pricing Method</Label>
                      <Select
                        value={formData.pricing_method}
                        onValueChange={(value) => setFormData({ ...formData, pricing_method: value })}
                      >
                        <SelectTrigger id="pricing_method">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Price</SelectItem>
                          <SelectItem value="per-unit">Per Unit</SelectItem>
                          <SelectItem value="per-meter">Per Meter</SelectItem>
                          <SelectItem value="per-sqm">Per Square Meter</SelectItem>
                          <SelectItem value="per-panel">Per Panel</SelectItem>
                          <SelectItem value="per-drop">Per Drop</SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="pricing-grid">Price Table (Entered Width)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        How this option's price is calculated
                      </p>
                    </div>

                    {formData.pricing_method !== 'pricing-grid' ? (
                      <div className="col-span-2">
                        <Label htmlFor="price">
                          {formData.pricing_method === 'percentage' ? 'Percentage (%)' : 'Additional Price'}
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                          placeholder={formData.pricing_method === 'percentage' ? '10' : '0.00'}
                        />
                      </div>
                    ) : (
                      <div className="col-span-2 space-y-3">
                        <Label>Price Table</Label>
                        <div className="space-y-2">
                          <div className="grid grid-cols-[1fr,1fr,auto] gap-2 text-sm font-medium">
                            <div>Max width (cm)</div>
                            <div>Price</div>
                            <div className="w-10"></div>
                          </div>
                          {formData.pricing_grid_data.map((row, idx) => (
                            <div key={idx} className="grid grid-cols-[1fr,1fr,auto] gap-2">
                              <Input
                                type="number"
                                value={row.width}
                                onChange={(e) => {
                                  const newData = [...formData.pricing_grid_data];
                                  newData[idx].width = parseFloat(e.target.value) || 0;
                                  setFormData({ ...formData, pricing_grid_data: newData });
                                }}
                                placeholder="60"
                              />
                              <Input
                                type="number"
                                step="0.01"
                                value={row.price}
                                onChange={(e) => {
                                  const newData = [...formData.pricing_grid_data];
                                  newData[idx].price = parseFloat(e.target.value) || 0;
                                  setFormData({ ...formData, pricing_grid_data: newData });
                                }}
                                placeholder="300"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newData = formData.pricing_grid_data.filter((_, i) => i !== idx);
                                  setFormData({ ...formData, pricing_grid_data: newData });
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  pricing_grid_data: [...formData.pricing_grid_data, { width: 0, price: 0 }]
                                });
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add pricing
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('csv-upload')?.click()}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Import CSV
                            </Button>
                          </div>
                          <input
                            id="csv-upload"
                            type="file"
                            accept=".csv"
                            onChange={handleCSVImport}
                            className="hidden"
                          />
                        </div>
                        <div className="bg-muted/50 border rounded-lg p-3">
                          <div className="flex items-start gap-2 text-sm">
                            <div className="text-muted-foreground mt-0.5">ℹ️</div>
                            <div className="flex-1">
                              <div className="font-medium mb-1">CSV Import Instructions</div>
                              <div className="text-xs text-muted-foreground mb-2">
                                CSV format: width,price (one per line). Make sure width uses the same unit as your settings (cm for metric, in for imperial).
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownloadCSVTemplate}
                                className="h-7 text-xs"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download CSV template
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="col-span-2">
                      <Label htmlFor="inventory">Link to Inventory (Optional)</Label>
                      <Select
                        value={formData.inventory_item_id || 'none'}
                        onValueChange={(value) => setFormData({ ...formData, inventory_item_id: value === 'none' ? null : value })}
                      >
                        <SelectTrigger id="inventory">
                          <SelectValue placeholder="Select inventory item..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (No inventory tracking)</SelectItem>
                          {inventoryItems.filter(item => item.active).map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} - Stock: {item.quantity} {item.unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Link this option to inventory for automatic stock tracking
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleSave}>
                      {editingValue ? 'Update' : 'Create'}
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Options List */}
              <div className="space-y-2">
                {uniqueOptionValues.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p className="font-medium">No {optType.type_label.toLowerCase()} found</p>
                    <p className="text-xs mt-1">Click "Add Option" to create one</p>
                  </div>
                ) : (
                  uniqueOptionValues.map((value) => (
                    <div key={value.code} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium uppercase">{value.label}</div>
                          {value.extra_data?.pricing_method === 'pricing-grid' ? (
                            <Badge variant="secondary" className="text-xs">
                              Price Table
                            </Badge>
                          ) : value.extra_data?.price && value.extra_data.price > 0 ? (
                            <Badge variant="secondary" className="text-xs">
                              {value.extra_data?.pricing_method === 'percentage' 
                                ? `${value.extra_data.price}%`
                                : `+$${value.extra_data.price.toFixed(2)}`}
                            </Badge>
                          ) : null}
                          {value.extra_data?.pricing_method && value.extra_data.pricing_method !== 'fixed' && (
                            <Badge variant="outline" className="text-xs">
                              {value.extra_data.pricing_method === 'per-unit' ? 'Per Unit' :
                               value.extra_data.pricing_method === 'per-meter' ? 'Per Meter' :
                               value.extra_data.pricing_method === 'per-sqm' ? 'Per m²' :
                               value.extra_data.pricing_method === 'per-panel' ? 'Per Panel' :
                               value.extra_data.pricing_method === 'per-drop' ? 'Per Drop' :
                               value.extra_data.pricing_method === 'percentage' ? 'Percentage' :
                               value.extra_data.pricing_method === 'pricing-grid' ? 'Price Table' :
                               value.extra_data.pricing_method}
                            </Badge>
                          )}
                          {value.inventory_item_id && (
                            <Badge variant="outline" className="flex items-center gap-1 text-xs">
                              <Package className="h-3 w-3" />
                              Linked
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Value: {value.code}
                          {value.extra_data?.pricing_method === 'pricing-grid' 
                            ? ` • ${value.extra_data.pricing_grid_data?.length || 0} price tiers`
                            : value.extra_data?.price !== undefined 
                              ? ` • ${value.extra_data.price === 0 ? 'Included' : 
                                  value.extra_data?.pricing_method === 'percentage' 
                                    ? `${value.extra_data.price}%`
                                    : `+$${value.extra_data.price.toFixed(2)}`}`
                              : ''}
                        </div>
                      </div>
                      {value.inventory_item_id && (
                        <InventoryStockBadge itemId={value.inventory_item_id} />
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(value)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(value.code)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          );
        })}
        </Tabs>
        )}

        {/* Create Option Type Dialog */}
        <Dialog open={showCreateOptionTypeDialog} onOpenChange={setShowCreateOptionTypeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Option Type</DialogTitle>
              <DialogDescription>
                Add a new option type category for {getTreatmentLabel(activeTreatment)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="type_label">Option Type Label *</Label>
                <Input
                  id="type_label"
                  value={newOptionTypeData.type_label}
                  onChange={(e) => setNewOptionTypeData({ ...newOptionTypeData, type_label: e.target.value })}
                  placeholder="e.g. Motor Types"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Display name for this option type
                </p>
              </div>
              
              <div>
                <Label htmlFor="type_key">Option Type Key *</Label>
                <Input
                  id="type_key"
                  value={newOptionTypeData.type_key}
                  onChange={(e) => setNewOptionTypeData({ ...newOptionTypeData, type_key: e.target.value })}
                  placeholder="e.g. motor_type"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Technical key (lowercase with underscores)
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateOptionTypeDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateOptionType}>
                Create Option Type
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
