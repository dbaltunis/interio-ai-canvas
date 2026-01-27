import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, X, ChevronLeft, ChevronRight, ChevronDown, Package, Upload, Download, Search, Eye, EyeOff, GripVertical, Info, Link as LinkIcon } from "lucide-react";
import { PricingGridUpload, PricingGridRow, PricingGridType } from "@/components/pricing/PricingGridUpload";
import { PricingHierarchyBadge } from "@/components/pricing/PricingHierarchyBadge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAllTreatmentOptions, useCreateOptionValue, useUpdateOptionValue, useDeleteOptionValue, useCreateTreatmentOption } from "@/hooks/useTreatmentOptionsManagement";
import type { TreatmentOption, OptionValue } from "@/hooks/useTreatmentOptions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOptionTypeCategories, useCreateOptionTypeCategory, useToggleOptionTypeVisibility, useDeleteOptionTypeCategory, useGetOptionTypeDeleteInfo } from "@/hooks/useOptionTypeCategories";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TREATMENT_CATEGORIES, TreatmentCategoryDbValue } from "@/types/treatmentCategories";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { InventoryStockBadge } from "./InventoryStockBadge";
import { useInventoryCategories } from "@/hooks/useInventoryCategories";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableOptionItem } from "./SortableOptionItem";
import { InventorySyncDialog } from "./InventorySyncDialog";
import { HeadingFilter, HEADING_TYPES } from "./HeadingFilter";
import { SectionHelpButton } from "@/components/help/SectionHelpButton";

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
        .eq('user_id', user.user.id);
      if (error) throw error;
      return data;
    },
  });
  
  // Fetch option type categories dynamically from database
  const { data: optionTypeCategories = [], isLoading: categoriesLoading } = useOptionTypeCategories(activeTreatment);
  
  // Fetch hidden option types for restore functionality
  const { data: hiddenCategories = [] } = useQuery({
    queryKey: ['hidden-option-categories', activeTreatment],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      // RLS handles account isolation, just filter by hidden_by_user and treatment_category
      const { data, error } = await supabase
        .from('option_type_categories')
        .select('*')
        .eq('active', true)
        .eq('hidden_by_user', true)
        .eq('treatment_category', activeTreatment)
        .order('type_label', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!activeTreatment,
  });
  
  const createTreatmentOption = useCreateTreatmentOption();
  const createOptionValue = useCreateOptionValue();
  const updateOptionValue = useUpdateOptionValue();
  const deleteOptionValue = useDeleteOptionValue();
  const createOptionTypeCategory = useCreateOptionTypeCategory();
  const toggleOptionTypeVisibility = useToggleOptionTypeVisibility();
  const deleteOptionTypeCategory = useDeleteOptionTypeCategory();
  const getDeleteInfo = useGetOptionTypeDeleteInfo();
  const { toast } = useToast();
  
  // Fetch inventory items for linking
  const { data: inventoryItems = [] } = useEnhancedInventory();
  
  // Derive categories from actual inventory items instead of inventory_categories table
  const inventoryCategoriesFromItems = useMemo(() => {
    const uniqueCategories = [...new Set(
      inventoryItems
        .filter(item => item.category) // Only items with categories
        .map(item => item.category)
    )].sort();
    
    return uniqueCategories.map(cat => ({ 
      id: cat, 
      name: cat 
    }));
  }, [inventoryItems]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingValue, setEditingValue] = useState<OptionValue | null>(null);
  const [showCreateOptionTypeDialog, setShowCreateOptionTypeDialog] = useState(false);
  const [showHiddenOptionsDialog, setShowHiddenOptionsDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [deleteTypeInfo, setDeleteTypeInfo] = useState<{ id: string; label: string; valueCount: number } | null>(null);
  const [newOptionTypeData, setNewOptionTypeData] = useState({ type_label: '', type_key: '' });
  const [customizeKey, setCustomizeKey] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    price: 0 as number,
    inventory_item_id: null as string | null,
    pricing_method: 'fixed' as string,
    pricing_grid_data: [] as PricingGridRow[],
    pricing_grid_type: 'width' as PricingGridType,
    applies_to_headings: [] as string[],
    sub_options: [] as Array<{
      id: string;
      label: string;
      key: string;
      choices: Array<{ id: string; label: string; value: string; price: number; pricing_method?: string; inventory_item_id?: string }>;
    }>
  });
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [selectedInventoryCategoryId, setSelectedInventoryCategoryId] = useState<string | null>(null);
  const [showCreateInventoryForm, setShowCreateInventoryForm] = useState(false);
  const [expandedOptions, setExpandedOptions] = useState<Set<string>>(new Set());
  const editFormRef = useRef<HTMLDivElement>(null);
  
  // Inventory sync states
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncTargetOptionType, setSyncTargetOptionType] = useState<string>('');
  const [syncTargetSubOption, setSyncTargetSubOption] = useState<number | null>(null);
  const [newInventoryItem, setNewInventoryItem] = useState({
    name: '',
    description: '',
    category: '',
    quantity: 0,
    unit: 'units',
    cost_price: 0,
  });

  // Reset and set first option type when treatment or categories change
  useEffect(() => {
    if (optionTypeCategories.length > 0) {
      // Always set to first available option type when treatment changes
      setActiveOptionType(optionTypeCategories[0].type_key);
    } else {
      setActiveOptionType('');
    }
  }, [activeTreatment, optionTypeCategories]);

  const resetForm = () => {
    setFormData({
      name: '',
      value: '',
      price: 0,
      inventory_item_id: null,
      pricing_method: 'fixed',
      pricing_grid_data: [],
      pricing_grid_type: 'width',
      applies_to_headings: [],
      sub_options: []
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
  
  // Deduplicate by code - keep all options including hidden ones so they can be unhidden
  const uniqueOptionValues = allOptionValues
    .reduce((acc, val) => {
      if (!acc.find(v => v.code === val.code)) {
        acc.push(val);
      }
      return acc;
    }, [] as OptionValue[])
    .sort((a, b) => {
      // Sort: visible items first (by order_index), then hidden items at the bottom
      if (a.hidden_by_user && !b.hidden_by_user) return 1;
      if (!a.hidden_by_user && b.hidden_by_user) return -1;
      return (a.order_index || 0) - (b.order_index || 0);
    });

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
                applies_to_headings: formData.applies_to_headings,
                sub_options: formData.sub_options
              },
              inventory_item_id: formData.inventory_item_id || null,
            }
          });
        }
        setEditingValue(null);
        
        toast({
          title: "Option updated",
          description: "The option value has been updated.",
          importance: 'silent'
        });
      } else {
        const valueCode = formData.value.trim().toLowerCase().replace(/\s+/g, '_');
        
        // First, check locally if this option category already exists
        let treatmentOption = allTreatmentOptions.find(
          (opt: any) => opt.treatment_category === activeTreatment && opt.key === activeOptionType
        );

        // If not found locally, try to fetch from database directly (handles stale cache)
        if (!treatmentOption) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('user_id, parent_account_id')
              .eq('user_id', user.id)
              .single();
            
            const accountId = profile?.parent_account_id || user.id;
            
            // Direct database check for existing treatment option
            const { data: existingOption } = await supabase
              .from('treatment_options')
              .select(`*, option_values (*)`)
              .eq('account_id', accountId)
              .eq('treatment_category', activeTreatment)
              .eq('key', activeOptionType)
              .is('template_id', null)
              .maybeSingle();
            
            if (existingOption) {
              treatmentOption = existingOption;
              // Refresh the cache since we found data the cache was missing
              queryClient.invalidateQueries({ queryKey: ['all-treatment-options'] });
            }
          }
        }

        // Create option category if it still doesn't exist
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
            });
          } catch (error: any) {
            // If duplicate key error, refetch from database and use existing option
            if (error.message.includes('already exists') || error.code === '23505') {
              await queryClient.invalidateQueries({ queryKey: ['all-treatment-options'] });
              
              // Try one more time to fetch the existing option
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                const { data: profile } = await supabase
                  .from('user_profiles')
                  .select('user_id, parent_account_id')
                  .eq('user_id', user.id)
                  .single();
                
                const accountId = profile?.parent_account_id || user.id;
                
                const { data: existingOption } = await supabase
                  .from('treatment_options')
                  .select(`*, option_values (*)`)
                  .eq('account_id', accountId)
                  .eq('treatment_category', activeTreatment)
                  .eq('key', activeOptionType)
                  .is('template_id', null)
                  .maybeSingle();
                
                if (existingOption) {
                  treatmentOption = existingOption;
                } else {
                  toast({
                    title: "Error",
                    description: "Could not find or create option category. Please refresh and try again.",
                    variant: "destructive"
                  });
                  return;
                }
              }
            } else {
              throw error;
            }
          }
        }

        // Check if this value already exists - both locally and in database
        const localValues = treatmentOption?.option_values || [];
        let existingValue = localValues.find(v => v.code === valueCode);
        
        // Also check database directly for existing value (handles cache staleness)
        if (!existingValue && treatmentOption) {
          const { data: dbValue } = await supabase
            .from('option_values')
            .select('*')
            .eq('option_id', treatmentOption.id)
            .eq('code', valueCode)
            .maybeSingle();
          
          if (dbValue) {
            existingValue = dbValue;
          }
        }
        
        if (existingValue) {
          setIsCreating(false);
          setEditingValue(null);
          resetForm();
          
          // Refresh data to show the existing value
          await queryClient.invalidateQueries({ queryKey: ['all-treatment-options'] });
          
          toast({
            title: "Value Already Exists",
            description: `"${formData.name}" already exists. The list has been refreshed - you can now edit the existing value.`,
            variant: "default"
          });
          return;
        }

        // Now create the value for this option
        try {
          await createOptionValue.mutateAsync({
            option_id: treatmentOption.id,
            code: valueCode,
            label: formData.name.trim(),
            order_index: localValues.length,
            extra_data: { 
              price: Number(formData.price) || 0,
              pricing_method: formData.pricing_method,
              pricing_grid_data: formData.pricing_grid_data,
              pricing_grid_type: formData.pricing_grid_type,
              applies_to_headings: formData.applies_to_headings,
              sub_options: formData.sub_options
            },
            inventory_item_id: formData.inventory_item_id || null,
          });
        } catch (valueError: any) {
          // Handle duplicate value error from database constraint
          if (valueError.code === '23505' || valueError.message?.includes('duplicate')) {
            await queryClient.invalidateQueries({ queryKey: ['all-treatment-options'] });
            toast({
              title: "Value Already Exists",
              description: `"${formData.name}" already exists in the database. Refreshing to show current data.`,
              variant: "default"
            });
            setIsCreating(false);
            resetForm();
            return;
          }
          throw valueError;
        }

        // Invalidate queries to refetch the updated data
        queryClient.invalidateQueries({ queryKey: ['treatment-options'] });
        queryClient.invalidateQueries({ queryKey: ['option-values'] });

        setIsCreating(false);
        
        toast({
          title: "Option created",
          description: `New option value has been added.`,
          importance: 'silent'
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
      pricing_grid_type: value.extra_data?.pricing_grid_type || 'width',
      applies_to_headings: value.extra_data?.applies_to_headings || [],
      sub_options: value.extra_data?.sub_options || []
    });
    setEditingValue(value);
    setIsCreating(false);
    
    // Scroll to edit form after state update
    setTimeout(() => {
      editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleDelete = async (value: OptionValue) => {
    if (confirm('Are you sure you want to delete this option from all templates?')) {
      try {
        // Delete this value from all templates
        for (const opt of relevantOptions) {
          const existingVal = opt.option_values?.find(v => v.code === value.code);
          if (existingVal) {
            await deleteOptionValue.mutateAsync(existingVal.id);
          }
        }
        toast({
          title: "Option deleted",
          description: "The option has been removed from all templates.",
          importance: 'silent'
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

  // Inventory sync handlers
  const handleSyncFromInventory = (optionTypeKey: string, subOptionIdx?: number) => {
    setSyncTargetOptionType(optionTypeKey);
    setSyncTargetSubOption(subOptionIdx !== undefined ? subOptionIdx : null);
    setSyncDialogOpen(true);
  };

  const handleInventorySyncConfirm = async (
    selectedIds: string[],
    pricingMode: 'selling' | 'cost' | 'cost_with_markup',
    markupPercentage: number
  ) => {
    try {
      // Check if we're syncing to a sub-category choice
      if (syncTargetSubOption !== null) {
        // Fetch inventory items
        const { data: inventoryItems, error: fetchError } = await supabase
          .from('enhanced_inventory_items')
          .select('*')
          .in('id', selectedIds);

        if (fetchError) throw fetchError;

        // Add choices to the sub-option
        const newSubOptions = [...formData.sub_options];
        
        for (const item of inventoryItems) {
          let basePrice = 0;
          
          if (pricingMode === 'selling') {
            basePrice = item.selling_price || item.price_per_unit || item.price_per_meter || item.price_per_yard || 0;
          } else if (pricingMode === 'cost') {
            basePrice = item.cost_price || 0;
          } else if (pricingMode === 'cost_with_markup') {
            const costPrice = item.cost_price || 0;
            basePrice = costPrice > 0 ? costPrice * (1 + markupPercentage / 100) : 0;
          }

          newSubOptions[syncTargetSubOption].choices.push({
            id: crypto.randomUUID(),
            label: item.name,
            value: item.name.trim().toLowerCase().replace(/\s+/g, '_'),
            price: basePrice,
            inventory_item_id: item.id,
          });
        }
        
        setFormData({ ...formData, sub_options: newSubOptions });

        // Check if any items had no price
        const itemsWithoutPrice = inventoryItems.filter(item => {
          if (pricingMode === 'selling') {
            return !(item.selling_price || item.price_per_unit || item.price_per_meter || item.price_per_yard);
          } else if (pricingMode === 'cost') {
            return !item.cost_price;
          } else {
            return !item.cost_price;
          }
        });

        if (itemsWithoutPrice.length > 0) {
          toast({
            title: "Warning: Some items have no price",
            description: `${itemsWithoutPrice.length} item(s) were added with $0 price. Set prices in Inventory to update.`,
            variant: "default",
          });
        } else {
          toast({
            title: "Choices added",
            description: `Added ${inventoryItems.length} choice(s) from inventory with pricing.`,
          });
        }

        setSyncTargetSubOption(null);
        return true;
      }

      // Original logic for syncing to treatment options
      if (!syncTargetOptionType) return false;

      // Get or create the treatment option
      let treatmentOption = relevantOptions.find(opt => opt.key === syncTargetOptionType);
      
      if (!treatmentOption) {
        // Create the treatment option first
        try {
          treatmentOption = await createTreatmentOption.mutateAsync({
            key: syncTargetOptionType,
            label: optionTypeCategories.find(o => o.type_key === syncTargetOptionType)?.type_label || syncTargetOptionType,
            input_type: 'select',
            visible: true,
            order_index: 0,
            treatment_category: activeTreatment,
            required: false,
          });
        } catch (error: any) {
          toast({
            title: "Failed to create option",
            description: error.message,
            variant: "destructive",
          });
          return false;
        }
      }

      // Fetch inventory items
      const { data: inventoryItems, error: fetchError } = await supabase
        .from('enhanced_inventory_items')
        .select('*')
        .in('id', selectedIds);

      if (fetchError) throw fetchError;

      // Create option values from inventory items
      for (const item of inventoryItems) {
        let basePrice = 0;
        
        if (pricingMode === 'selling') {
          basePrice = item.selling_price || item.price_per_unit || item.price_per_meter || item.price_per_yard || 0;
        } else if (pricingMode === 'cost') {
          basePrice = item.cost_price || 0;
        } else if (pricingMode === 'cost_with_markup') {
          const costPrice = item.cost_price || 0;
          basePrice = costPrice > 0 ? costPrice * (1 + markupPercentage / 100) : 0;
        }

        const valueCode = item.name.trim().toLowerCase().replace(/\s+/g, '_');
        
        await createOptionValue.mutateAsync({
          option_id: treatmentOption.id,
          code: valueCode,
          label: item.name,
          order_index: treatmentOption.option_values?.length || 0,
          extra_data: {
            price: basePrice,
            pricing_method: 'fixed',
            synced_from_inventory: true,
          },
          inventory_item_id: item.id,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['treatment-options'] });
      queryClient.invalidateQueries({ queryKey: ['option-values'] });
      queryClient.invalidateQueries({ queryKey: ['all-treatment-options'] });

      toast({
        title: "Sync successful",
        description: `Created ${inventoryItems.length} option(s) from inventory.`,
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const handleToggleVisibility = async (value: OptionValue) => {
    try {
      const newHiddenState = !value.hidden_by_user;
      
      // Update all instances of this option value
      for (const opt of relevantOptions) {
        const existingVal = opt.option_values?.find(v => v.code === value.code);
        if (existingVal) {
          await updateOptionValue.mutateAsync({
            id: existingVal.id,
            updates: { hidden_by_user: newHiddenState }
          });
        }
      }
      
      toast({
        title: newHiddenState ? "Option hidden" : "Option visible",
        description: newHiddenState 
          ? "This option is now hidden from your setup" 
          : "This option is now visible in your setup",
      });
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        title: "Update failed",
        description: "Failed to update option visibility. Please try again.",
        variant: "destructive"
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = uniqueOptionValues.findIndex(v => v.id === active.id);
    const newIndex = uniqueOptionValues.findIndex(v => v.id === over.id);

    const reorderedValues = arrayMove(uniqueOptionValues, oldIndex, newIndex);

    // Update order_index for all reordered items
    try {
      for (let i = 0; i < reorderedValues.length; i++) {
        const value = reorderedValues[i];
        
        // Update all instances of this option value
        for (const opt of relevantOptions) {
          const existingVal = opt.option_values?.find(v => v.code === value.code);
          if (existingVal) {
            await updateOptionValue.mutateAsync({
              id: existingVal.id,
              updates: { order_index: i }
            });
          }
        }
      }
      
      toast({
        title: "Order updated",
        description: "Options have been reordered successfully.",
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Reorder failed",
        description: "Failed to update option order. Please try again.",
        variant: "destructive"
      });
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

  // Auto-generate key from label
  const generateKeyFromLabel = (label: string): string => {
    return label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_'); // Replace spaces with underscores
  };

  const handleCreateOptionType = async () => {
    if (!newOptionTypeData.type_label.trim()) {
      toast({
        title: "Required field",
        description: "Please enter an option type label.",
        variant: "destructive"
      });
      return;
    }

    // Use auto-generated key if not customized
    const finalKey = customizeKey 
      ? newOptionTypeData.type_key.trim()
      : generateKeyFromLabel(newOptionTypeData.type_label);

    if (!finalKey) {
      toast({
        title: "Invalid key",
        description: "Please enter a valid option type label or customize the key.",
        variant: "destructive"
      });
      return;
    }

    // Validate custom key format
    if (customizeKey && !/^[a-z0-9_]+$/.test(finalKey)) {
      toast({
        title: "Invalid key format",
        description: "Key must contain only lowercase letters, numbers, and underscores.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createOptionTypeCategory.mutateAsync({
        treatment_category: activeTreatment,
        type_key: finalKey,
        type_label: newOptionTypeData.type_label.trim(),
      });
      
      setShowCreateOptionTypeDialog(false);
      setNewOptionTypeData({ type_label: '', type_key: '' });
      setCustomizeKey(false);
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

  // Filter inventory items based on search query and category
  const filteredInventoryItems = useMemo(() => {
    let filtered = inventoryItems.filter(item => item.active);
    
    // Filter by category if selected (using category name directly)
    if (selectedInventoryCategoryId) {
      filtered = filtered.filter(item => item.category === selectedInventoryCategoryId);
    }
    
    // Filter by search query
    if (inventorySearchQuery.trim()) {
      const query = inventorySearchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [inventoryItems, inventorySearchQuery, selectedInventoryCategoryId]);

  const selectedInventoryItem = inventoryItems.find(item => item.id === formData.inventory_item_id);

  const handleSelectInventoryItem = (itemId: string | null) => {
    if (itemId) {
      // Find the selected inventory item and auto-fill form fields
      const selectedItem = inventoryItems.find(item => item.id === itemId);
      if (selectedItem) {
        // Auto-generate value from inventory item name
        const autoValue = selectedItem.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '')
          .replace(/_+/g, '_');
        
        // Auto-fill price from inventory item (try selling_price first, then cost_price)
        const autoPrice = selectedItem.selling_price || selectedItem.cost_price || 0;
        
        // Check if inventory item has color tags and auto-create color sub-options
        const NON_COLOR_TAGS = ['wide_width', 'blockout', 'sheer', 'dimout', 'sunscreen', 'lining', 'fabric', 'material'];
        const colorTags = (selectedItem.tags || []).filter(
          (tag: string) => !NON_COLOR_TAGS.includes(tag.toLowerCase())
        );
        
        // Build sub_options with colors if present
        let newSubOptions = [...formData.sub_options];
        if (colorTags.length > 0) {
          // Check if a "Color" sub-option already exists
          const existingColorSubOption = newSubOptions.find(
            sub => sub.label.toLowerCase() === 'color' || sub.label.toLowerCase() === 'colour'
          );
          
          if (existingColorSubOption) {
            // Add colors to existing sub-option (avoid duplicates)
            const existingLabels = new Set(existingColorSubOption.choices.map(c => c.label.toLowerCase()));
            colorTags.forEach((color: string) => {
              if (!existingLabels.has(color.toLowerCase())) {
                existingColorSubOption.choices.push({
                  id: crypto.randomUUID(),
                  label: color,
                  value: color.toLowerCase().replace(/\s+/g, '_'),
                  price: 0,
                  pricing_method: 'fixed'
                });
              }
            });
          } else {
            // Create new Color sub-option
            newSubOptions.push({
              id: crypto.randomUUID(),
              label: 'Color',
              key: 'color',
              choices: colorTags.map((color: string) => ({
                id: crypto.randomUUID(),
                label: color,
                value: color.toLowerCase().replace(/\s+/g, '_'),
                price: 0,
                pricing_method: 'fixed'
              }))
            });
          }
        }
        
        setFormData({
          ...formData,
          inventory_item_id: itemId,
          // Always update with selected item data
          name: selectedItem.name,
          value: autoValue,
          // Auto-fill price - user can still change it after selection
          price: autoPrice,
          // Preserve existing pricing_method if already set, otherwise default to 'fixed'
          pricing_method: formData.pricing_method || 'fixed',
          // Include auto-generated sub_options with colors
          sub_options: newSubOptions,
        });
        
        const colorMessage = colorTags.length > 0 ? ` ${colorTags.length} color(s) added as sub-options.` : '';
        
        if (autoPrice > 0) {
          toast({
            title: "Inventory item linked",
            description: `Auto-filled with "${selectedItem.name}" - $${autoPrice.toFixed(2)}.${colorMessage}`,
          });
        } else {
          toast({
            title: "Inventory item linked",
            description: `"${selectedItem.name}" has no price in inventory. Please set the price below.${colorMessage}`,
            variant: "default",
          });
        }
      }
    } else {
      // Just clear the inventory link
      setFormData({ ...formData, inventory_item_id: null });
    }
    
    setShowInventoryDialog(false);
    setInventorySearchQuery('');
    setSelectedInventoryCategoryId(null);
  };

  const handleCreateInventoryItem = async () => {
    if (!newInventoryItem.name.trim()) {
      toast({
        title: "Required field",
        description: "Please enter an item name.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('enhanced_inventory_items')
        .insert({
          user_id: user.user.id,
          name: newInventoryItem.name.trim(),
          description: newInventoryItem.description.trim() || null,
          category: newInventoryItem.category.trim() || null,
          quantity: newInventoryItem.quantity,
          unit: newInventoryItem.unit,
          cost_price: newInventoryItem.cost_price,
          active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh inventory items
      queryClient.invalidateQueries({ queryKey: ['enhanced-inventory'] });

      // Select the newly created item
      setFormData({ ...formData, inventory_item_id: data.id });
      
      // Reset and close
      setNewInventoryItem({
        name: '',
        description: '',
        category: '',
        quantity: 0,
        unit: 'units',
        cost_price: 0,
      });
      setShowCreateInventoryForm(false);
      setShowInventoryDialog(false);

      toast({
        title: "Inventory item created",
        description: "The item has been added to your inventory and linked to this option.",
      });
    } catch (error: any) {
      console.error('Error creating inventory item:', error);
      toast({
        title: "Create failed",
        description: error?.message || "Failed to create inventory item.",
        variant: "destructive"
      });
    }
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

  // Export full option data as CSV
  const handleExportOptionsCSV = () => {
    if (uniqueOptionValues.length === 0) {
      toast({
        title: "No options to export",
        description: "Add some options first before exporting.",
        variant: "destructive"
      });
      return;
    }

    const optType = optionTypeCategories.find(opt => opt.type_key === activeOptionType);
    const headers = ['label', 'code', 'price', 'pricing_method', 'sub_options'];
    const rows = uniqueOptionValues.map(val => {
      const price = val.extra_data?.price || 0;
      const pricingMethod = val.extra_data?.pricing_method || 'fixed';
      const subOptions = val.extra_data?.sub_options ? JSON.stringify(val.extra_data.sub_options) : '';
      return [
        `"${val.label.replace(/"/g, '""')}"`,
        `"${val.code}"`,
        price,
        `"${pricingMethod}"`,
        `"${subOptions.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTreatment}_${activeOptionType}_options.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Options exported",
      description: `Exported ${uniqueOptionValues.length} options to CSV`,
    });
  };

  // Import full option data from CSV
  const handleImportOptionsCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({
            title: "Import failed",
            description: "CSV file must have a header row and at least one data row",
            variant: "destructive"
          });
          return;
        }

        // Parse header to determine columns
        const headerRow = lines[0].toLowerCase();
        const hasLabel = headerRow.includes('label');
        const hasCode = headerRow.includes('code');
        const hasPrice = headerRow.includes('price');
        const hasPricingMethod = headerRow.includes('pricing_method');

        if (!hasLabel && !hasCode) {
          toast({
            title: "Invalid CSV format",
            description: "CSV must have 'label' or 'code' column",
            variant: "destructive"
          });
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const labelIdx = headers.findIndex(h => h === 'label');
        const codeIdx = headers.findIndex(h => h === 'code');
        const priceIdx = headers.findIndex(h => h === 'price');
        const pricingMethodIdx = headers.findIndex(h => h === 'pricing_method');
        const subOptionsIdx = headers.findIndex(h => h === 'sub_options');

        // Get or create treatment option for this category
        let treatmentOption = allTreatmentOptions.find(
          (opt: any) => opt.treatment_category === activeTreatment && opt.key === activeOptionType
        );

        if (!treatmentOption) {
          const optionTypeConfig = optionTypeCategories.find(opt => opt.type_key === activeOptionType);
          treatmentOption = await createTreatmentOption.mutateAsync({
            key: activeOptionType,
            label: optionTypeConfig?.type_label || activeOptionType,
            input_type: 'select',
            required: false,
            visible: true,
            order_index: 0,
            treatment_category: activeTreatment,
          });
        }

        let importedCount = 0;
        
        // Parse data rows (skip header)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Simple CSV parse (handles quoted values)
          const values: string[] = [];
          let current = '';
          let inQuotes = false;
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              if (inQuotes && line[j + 1] === '"') {
                current += '"';
                j++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());

          const label = labelIdx >= 0 ? values[labelIdx]?.replace(/^"|"$/g, '') : '';
          const code = codeIdx >= 0 ? values[codeIdx]?.replace(/^"|"$/g, '') : label.toLowerCase().replace(/\s+/g, '_');
          const price = priceIdx >= 0 ? parseFloat(values[priceIdx]) || 0 : 0;
          const pricingMethod = pricingMethodIdx >= 0 ? values[pricingMethodIdx]?.replace(/^"|"$/g, '') || 'fixed' : 'fixed';
          
          let subOptions = [];
          if (subOptionsIdx >= 0 && values[subOptionsIdx]) {
            try {
              const subOptionsStr = values[subOptionsIdx].replace(/^"|"$/g, '').replace(/""/g, '"');
              if (subOptionsStr) {
                subOptions = JSON.parse(subOptionsStr);
              }
            } catch {
              // Invalid JSON, skip sub_options
            }
          }

          if (!label && !code) continue;

          // Check if already exists
          const existingVal = treatmentOption?.option_values?.find(v => v.code === code);
          if (existingVal) {
            // Update existing
            await updateOptionValue.mutateAsync({
              id: existingVal.id,
              updates: {
                label: label || existingVal.label,
                extra_data: {
                  price,
                  pricing_method: pricingMethod,
                  sub_options: subOptions.length > 0 ? subOptions : existingVal.extra_data?.sub_options
                }
              }
            });
          } else {
            // Create new
            await createOptionValue.mutateAsync({
              option_id: treatmentOption.id,
              code,
              label: label || code,
              order_index: (treatmentOption?.option_values?.length || 0) + importedCount,
              extra_data: {
                price,
                pricing_method: pricingMethod,
                sub_options: subOptions
              }
            });
          }
          importedCount++;
        }

        queryClient.invalidateQueries({ queryKey: ['treatment-options'] });
        queryClient.invalidateQueries({ queryKey: ['all-treatment-options'] });

        toast({
          title: "Import successful",
          description: `Imported ${importedCount} options`,
        });
      } catch (error: any) {
        console.error('CSV import error:', error);
        toast({
          title: "Import failed",
          description: error.message || "Failed to parse CSV file",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const getTreatmentLabel = (category: TreatmentCategoryDbValue) => {
    const labels: Record<TreatmentCategoryDbValue, string> = {
      roller_blinds: 'Roller Blinds',
      zebra_blinds: 'Zebra Blinds',
      roman_blinds: 'Roman Blinds',
      venetian_blinds: 'Venetian Blinds',
      vertical_blinds: 'Vertical Blinds',
      shutters: 'Shutters',
      awning: 'Awnings',
      plantation_shutters: 'Plantation Shutters',
      cellular_blinds: 'Cellular Shades',
      curtains: 'Curtains',
      panel_glide: 'Panel Glides',
      wallpaper: 'Wallpaper',
    };
    return labels[category];
  };

  if (isLoading || templatesLoading || categoriesLoading) {
    return <div className="text-center py-8">Loading options...</div>;
  }

  return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Window Treatment Options</CardTitle>
            <SectionHelpButton sectionId="products-options" />
          </div>
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
                <TabsTrigger key={opt.type_key} value={opt.type_key} className="px-4">
                  {opt.type_label}
                </TabsTrigger>
              ))}
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

            {/* Quick Actions for Types */}
            <div className="flex items-center gap-2 ml-2 border-l pl-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateOptionTypeDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Type
              </Button>
              {hiddenCategories.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHiddenOptionsDialog(true)}
                  title={`${hiddenCategories.length} hidden option type${hiddenCategories.length > 1 ? 's' : ''} - click to restore`}
                  className="relative"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Hidden
                  <Badge variant="secondary" className="ml-2 h-5 min-w-5 flex items-center justify-center px-1.5">
                    {hiddenCategories.length}
                  </Badge>
                </Button>
              )}
            </div>
          </div>

          {/* Option Type Management Bar - Only for Active Type */}
          {activeOptionType && optionTypeCategories.find(opt => opt.type_key === activeOptionType) && (
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border mt-3">
              <div className="flex items-center gap-2">
                <div className="font-medium">
                  Manage: {optionTypeCategories.find(opt => opt.type_key === activeOptionType)?.type_label}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={toggleOptionTypeVisibility.isPending}
                  onClick={async () => {
                    const currentType = optionTypeCategories.find(opt => opt.type_key === activeOptionType);
                    if (!currentType) return;
                    
                    console.log('🎯 Hiding option type:', currentType);
                    
                    try {
                      // Wait for mutation to complete
                      const result = await toggleOptionTypeVisibility.mutateAsync({ 
                        id: currentType.id, 
                        hidden: true
                      });
                      
                      console.log('✅ Hide mutation completed:', result);
                      
                      // Force immediate query refresh
                      await queryClient.refetchQueries({ 
                        queryKey: ['option-type-categories', activeTreatment],
                        type: 'active'
                      });
                      
                      console.log('🔄 Queries refetched, switching tabs');
                      
                      // Switch to first available type after hiding
                      setTimeout(() => {
                        if (optionTypeCategories.length > 1) {
                          const nextType = optionTypeCategories.find(t => t.type_key !== activeOptionType);
                          if (nextType) {
                            console.log('➡️ Switching to:', nextType.type_key);
                            setActiveOptionType(nextType.type_key);
                          }
                        }
                      }, 100);
                    } catch (error: any) {
                      console.error('❌ Hide failed:', error);
                      toast({
                        title: "Failed to hide type",
                        description: error.message || "Could not hide option type",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  {toggleOptionTypeVisibility.isPending ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Hiding...
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Type
                    </>
                  )}
                </Button>
                
                <Button
                  variant="destructive"
                    size="sm"
                    onClick={async () => {
                      const currentType = optionTypeCategories.find(opt => opt.type_key === activeOptionType);
                      if (!currentType) return;

                      // Get delete info first
                      try {
                        const info = await getDeleteInfo.mutateAsync({
                          typeKey: currentType.type_key,
                          treatmentCategory: activeTreatment,
                        });

                        setDeleteTypeInfo({
                          id: currentType.id,
                          label: currentType.type_label,
                          valueCount: info.valueCount,
                        });
                        setShowDeleteConfirmDialog(true);
                      } catch (error: any) {
                        toast({
                          title: "Failed to fetch delete info",
                          description: error.message,
                          variant: "destructive"
                        });
                      }
                    }}
                    disabled={getDeleteInfo.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Type
                  </Button>
              </div>
            </div>
          )}

          {optionTypeCategories.map((optType) => {
            // Remove system default check - all templates are now account-specific
            
            return (
              <TabsContent key={optType.type_key} value={optType.type_key} className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Add {optType.type_label.toLowerCase()} for {getTreatmentLabel(activeTreatment).toLowerCase()}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportOptionsCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <label htmlFor="import-options-csv" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Import
                        </span>
                      </Button>
                      <input
                        id="import-options-csv"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleImportOptionsCSV}
                      />
                    </label>
                    <Button onClick={() => handleAddOption(optType.type_key)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                </div>

              {/* Create/Edit Form */}
              {(isCreating || editingValue) && (
                <div ref={editFormRef} className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingValue ? `Edit Option` : `Add New Option`}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Display Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          // Auto-generate value from name: lowercase, spaces/special chars to underscores
                          const value = name
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '_') // Replace non-alphanumeric with underscore
                            .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
                            .replace(/_+/g, '_'); // Replace multiple underscores with single
                          
                          setFormData({ ...formData, name, value });
                        }}
                        placeholder="e.g., 38mm Tube"
                        className="bg-white dark:bg-background"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="value">Auto-Generated Value</Label>
                      <Input
                        id="value"
                        value={formData.value}
                        readOnly
                        disabled
                        className="bg-muted cursor-not-allowed"
                        placeholder="Generated automatically"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Auto-generated from display name (lowercase with underscores)
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
                          <SelectItem value="per-meter">Per Running Meter</SelectItem>
                          <SelectItem value="per-sqm">Per Square Meter</SelectItem>
                          <SelectItem value="per-panel">Per Panel/Drop</SelectItem>
                          <SelectItem value="pricing-grid">Pricing Grid</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Fixed: flat price • Per Meter: price × width • Per m²: price × area • Per Panel: price × drops • Grid: lookup
                      </p>
                    </div>

                    {formData.pricing_method !== 'pricing-grid' ? (
                      <div className="col-span-2">
                        <Label htmlFor="price">
                          {formData.pricing_method === 'per-meter' ? 'Price per Linear Meter' : 'Fixed Price'}
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="bg-white dark:bg-background"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {formData.pricing_method === 'per-meter' 
                            ? 'Price multiplied by width (in meters)' 
                            : 'Flat price added to quote'}
                        </p>
                      </div>
                    ) : (
                      <div className="col-span-2 space-y-3">
                        <PricingGridUpload
                          value={formData.pricing_grid_data}
                          onChange={(data) => setFormData({ ...formData, pricing_grid_data: data })}
                          gridType={formData.pricing_grid_type}
                          onGridTypeChange={(type) => setFormData({ ...formData, pricing_grid_type: type, pricing_grid_data: [] })}
                        />
                      </div>
                    )}

                    <div className="col-span-2">
                      <Label htmlFor="inventory">Link to Inventory (Optional)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => setShowInventoryDialog(true)}
                      >
                        <span className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          {selectedInventoryItem ? (
                            <span>{selectedInventoryItem.name}</span>
                          ) : (
                            <span className="text-muted-foreground">Select inventory item...</span>
                          )}
                        </span>
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        Selecting an item auto-fills the name and price. Price is stored in THIS option, not inventory.
                      </p>
                    </div>

                    {/* Applies to Headings - only show for curtain-related treatments */}
                    {(activeTreatment === 'curtains' || activeTreatment === 'roman_blinds') && (
                      <div className="col-span-2">
                        <HeadingFilter
                          selectedHeadings={formData.applies_to_headings}
                          onChange={(headings) => setFormData({ ...formData, applies_to_headings: headings })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave empty to apply to all headings, or select specific headings this option applies to
                        </p>
                      </div>
                    )}

                    {/* Sub-Categories Section */}
                    <div className="col-span-2 space-y-3 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Sub-Categories</Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Add additional choices that appear when this option is selected
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              sub_options: [
                                ...formData.sub_options,
                                {
                                  id: crypto.randomUUID(),
                                  label: '',
                                  key: '',
                                  choices: []
                                }
                              ]
                            });
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Sub-Category
                        </Button>
                      </div>

                      {formData.sub_options.map((subOption, subIdx) => (
                        <div key={subOption.id} className="p-3 border rounded-lg bg-background space-y-3">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Sub-category name (e.g. Color)"
                              value={subOption.label}
                              onChange={(e) => {
                                const newSubOptions = [...formData.sub_options];
                                newSubOptions[subIdx].label = e.target.value;
                                newSubOptions[subIdx].key = e.target.value.toLowerCase().replace(/\s+/g, '_');
                                setFormData({ ...formData, sub_options: newSubOptions });
                              }}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newSubOptions = formData.sub_options.filter((_, i) => i !== subIdx);
                                setFormData({ ...formData, sub_options: newSubOptions });
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>

                          {/* Choices for this sub-category */}
                          <div className="ml-4 space-y-2">
                            <Label className="text-xs text-muted-foreground">Choices</Label>
                            {subOption.choices.map((choice, choiceIdx) => {
                              const linkedInventoryItem = choice.inventory_item_id 
                                ? inventoryItems.find(item => item.id === choice.inventory_item_id)
                                : null;
                              
                              // Use the stored price from choice.price (set during sync)
                              const displayPrice = choice.price || 0;
                              
                              return (
                                <div key={choice.id} className="space-y-1">
                                  <div className="grid grid-cols-[1fr,80px,1fr,auto] gap-2">
                                    <Input
                                      placeholder="Label (e.g. Red)"
                                      value={choice.label}
                                      onChange={(e) => {
                                        const newSubOptions = [...formData.sub_options];
                                        newSubOptions[subIdx].choices[choiceIdx].label = e.target.value;
                                        newSubOptions[subIdx].choices[choiceIdx].value = e.target.value.toLowerCase().replace(/\s+/g, '_');
                                        setFormData({ ...formData, sub_options: newSubOptions });
                                      }}
                                      className="bg-white dark:bg-background"
                                    />
                                    <Select
                                      value={choice.pricing_method || 'fixed'}
                                      onValueChange={(val) => {
                                        const newSubOptions = [...formData.sub_options];
                                        newSubOptions[subIdx].choices[choiceIdx].pricing_method = val;
                                        setFormData({ ...formData, sub_options: newSubOptions });
                                      }}
                                    >
                                      <SelectTrigger className="h-9">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="fixed">Fixed</SelectItem>
                                        <SelectItem value="per-meter">Per m</SelectItem>
                                        <SelectItem value="per-sqm">Per m²</SelectItem>
                                        <SelectItem value="per-panel">Per Panel</SelectItem>
                                        <SelectItem value="per-unit">Per Unit</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <div className="relative">
                                      <Input
                                        type="number"
                                        step="0.01"
                                        placeholder={linkedInventoryItem ? "From inventory" : "Price"}
                                        value={displayPrice}
                                        onChange={(e) => {
                                          if (!linkedInventoryItem) {
                                            const newSubOptions = [...formData.sub_options];
                                            newSubOptions[subIdx].choices[choiceIdx].price = parseFloat(e.target.value) || 0;
                                            setFormData({ ...formData, sub_options: newSubOptions });
                                          }
                                        }}
                                        disabled={!!linkedInventoryItem}
                                        className={linkedInventoryItem ? 'bg-muted cursor-not-allowed' : 'bg-white dark:bg-background'}
                                      />
                                      {linkedInventoryItem && (
                                        <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs">
                                          <LinkIcon className="h-3 w-3 mr-1" />
                                          Inv
                                        </Badge>
                                      )}
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const newSubOptions = [...formData.sub_options];
                                        newSubOptions[subIdx].choices = newSubOptions[subIdx].choices.filter((_, i) => i !== choiceIdx);
                                        setFormData({ ...formData, sub_options: newSubOptions });
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                  {linkedInventoryItem && (
                                    <div className="ml-2 text-xs text-muted-foreground flex items-center gap-2">
                                      <LinkIcon className="h-3 w-3" />
                                      <span>Price from: <span className="font-medium">{linkedInventoryItem.name}</span></span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newSubOptions = [...formData.sub_options];
                                  newSubOptions[subIdx].choices.push({
                                    id: crypto.randomUUID(),
                                    label: '',
                                    value: '',
                                    price: 0,
                                    pricing_method: 'fixed'
                                  });
                                  setFormData({ ...formData, sub_options: newSubOptions });
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Choice
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleSyncFromInventory(activeOptionType, subIdx)}
                              >
                                <LinkIcon className="h-4 w-4 mr-2" />
                                Select from Inventory
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={uniqueOptionValues.map(v => v.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {uniqueOptionValues.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <p className="font-medium">No {optType.type_label.toLowerCase()} found</p>
                        <p className="text-xs mt-1">Click "Add Option" to create one</p>
                      </div>
                    ) : (
                      uniqueOptionValues.map((value) => (
                        <SortableOptionItem
                          key={value.id}
                          value={value}
                          relevantOptions={relevantOptions}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggleVisibility={handleToggleVisibility}
                          expandedOptions={expandedOptions}
                          setExpandedOptions={setExpandedOptions}
                          inventoryItems={inventoryItems}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
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
                  onChange={(e) => {
                    const label = e.target.value;
                    setNewOptionTypeData({ 
                      ...newOptionTypeData, 
                      type_label: label,
                      // Auto-update key if not customized
                      type_key: customizeKey ? newOptionTypeData.type_key : generateKeyFromLabel(label)
                    });
                  }}
                  placeholder="e.g. Motor Types"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Display name shown to users
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="type_key">Technical Key</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1 px-2 text-xs"
                    onClick={() => setCustomizeKey(!customizeKey)}
                  >
                    {customizeKey ? "Use Auto-Generated" : "Customize"}
                  </Button>
                </div>
                <Input
                  id="type_key"
                  value={customizeKey ? newOptionTypeData.type_key : generateKeyFromLabel(newOptionTypeData.type_label)}
                  onChange={(e) => setNewOptionTypeData({ ...newOptionTypeData, type_key: e.target.value })}
                  placeholder="Auto-generated from label"
                  readOnly={!customizeKey}
                  className={!customizeKey ? "bg-muted cursor-not-allowed" : ""}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {customizeKey 
                    ? "Use lowercase letters, numbers, and underscores only" 
                    : "Automatically generated from label above"}
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

        {/* Show Hidden Options Dialog */}
        <Dialog open={showHiddenOptionsDialog} onOpenChange={setShowHiddenOptionsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hidden Option Types</DialogTitle>
              <DialogDescription>
                These option types are hidden from your {getTreatmentLabel(activeTreatment)} options. Click to show them again.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-2 py-4 max-h-[400px] overflow-y-auto">
              {hiddenCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <EyeOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">No hidden options</p>
                  <p className="text-sm mt-1">All option types are currently visible</p>
                </div>
              ) : (
                hiddenCategories.map((opt) => (
                  <div 
                    key={opt.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{opt.type_label}</div>
                      <div className="text-xs text-muted-foreground">{opt.type_key}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        await toggleOptionTypeVisibility.mutateAsync({ 
                          id: opt.id, 
                          hidden: false 
                        });
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Show
                    </Button>
                  </div>
                ))
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHiddenOptionsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Type Confirmation Dialog */}
        <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Option Type</DialogTitle>
              <DialogDescription>
                This action will permanently delete this option type and all its values from YOUR ACCOUNT ONLY.
              </DialogDescription>
            </DialogHeader>
            
            {deleteTypeInfo && (
              <div className="py-4 space-y-4">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <p className="font-medium text-sm">
                        Delete "{deleteTypeInfo.label}" type?
                      </p>
                      <p className="text-sm text-muted-foreground">
                        This will remove <span className="font-semibold text-foreground">{deleteTypeInfo.valueCount} option value(s)</span> from your account.
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                        ✓ Only your account data will be deleted<br/>
                        ✓ Other accounts are not affected<br/>
                        ✓ System default types cannot be deleted
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteConfirmDialog(false);
                  setDeleteTypeInfo(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                disabled={deleteOptionTypeCategory.isPending}
                onClick={async () => {
                  if (!deleteTypeInfo) return;
                  
                  const currentType = optionTypeCategories.find(opt => opt.type_key === activeOptionType);
                  if (!currentType) return;

                  await deleteOptionTypeCategory.mutateAsync({
                    id: deleteTypeInfo.id,
                    typeKey: currentType.type_key,
                    treatmentCategory: activeTreatment,
                  });

                  setShowDeleteConfirmDialog(false);
                  setDeleteTypeInfo(null);

                  // Switch to first available type
                  if (optionTypeCategories.length > 1) {
                    const nextType = optionTypeCategories.find(t => t.type_key !== activeOptionType);
                    if (nextType) setActiveOptionType(nextType.type_key);
                  }
                }}
              >
                {deleteOptionTypeCategory.isPending ? 'Deleting...' : 'Delete Type'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Inventory Selection Dialog */}
        <Dialog open={showInventoryDialog} onOpenChange={setShowInventoryDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Select Inventory Item</DialogTitle>
              <DialogDescription>
                Search and select an inventory item to link, or create a new one
              </DialogDescription>
            </DialogHeader>
            
            {!showCreateInventoryForm ? (
              <>
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, description, or category..."
                    value={inventorySearchQuery}
                    onChange={(e) => setInventorySearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Category Filter */}
                {inventoryCategoriesFromItems.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={!selectedInventoryCategoryId ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedInventoryCategoryId(null)}
                    >
                      All
                    </Button>
                    {inventoryCategoriesFromItems.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedInventoryCategoryId === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedInventoryCategoryId(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Inventory Items List */}
                <ScrollArea className="h-[400px] -mx-6 px-6">
                  <div className="space-y-2 py-2">
                    {/* None Option */}
                    <div
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        !formData.inventory_item_id ? 'bg-muted border-primary' : ''
                      }`}
                      onClick={() => handleSelectInventoryItem(null)}
                    >
                      <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                        <X className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">None (No inventory tracking)</div>
                        <div className="text-sm text-muted-foreground">Don't link to inventory</div>
                      </div>
                    </div>

                    {/* Inventory Items */}
                    {filteredInventoryItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="font-medium">No items found</p>
                        <p className="text-sm mt-1">Try a different search or create a new item</p>
                      </div>
                    ) : (
                      filteredInventoryItems.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                            formData.inventory_item_id === item.id ? 'bg-muted border-primary' : ''
                          }`}
                          onClick={() => handleSelectInventoryItem(item.id)}
                        >
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.category && <span className="mr-2">• {item.category}</span>}
                              Stock: {item.quantity} {item.unit}
                              {item.cost_price > 0 && <span className="ml-2">• ${item.cost_price.toFixed(2)}</span>}
                            </div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground truncate mt-1">
                                {item.description}
                              </div>
                            )}
                          </div>
                          {item.quantity <= 10 && (
                            <Badge variant="destructive" className="text-xs">
                              Low Stock
                            </Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowInventoryDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowCreateInventoryForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Item
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                {/* Create Inventory Form */}
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="new_item_name">Item Name *</Label>
                      <Input
                        id="new_item_name"
                        value={newInventoryItem.name}
                        onChange={(e) => setNewInventoryItem({ ...newInventoryItem, name: e.target.value })}
                        placeholder="e.g. Premium Motor XL"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label htmlFor="new_item_description">Description</Label>
                      <Input
                        id="new_item_description"
                        value={newInventoryItem.description}
                        onChange={(e) => setNewInventoryItem({ ...newInventoryItem, description: e.target.value })}
                        placeholder="Brief description of the item"
                      />
                    </div>

                    <div>
                      <Label htmlFor="new_item_category">Category</Label>
                      <Input
                        id="new_item_category"
                        value={newInventoryItem.category}
                        onChange={(e) => setNewInventoryItem({ ...newInventoryItem, category: e.target.value })}
                        placeholder="e.g. Motors"
                      />
                    </div>

                    <div>
                      <Label htmlFor="new_item_unit">Unit</Label>
                      <Select
                        value={newInventoryItem.unit}
                        onValueChange={(value) => setNewInventoryItem({ ...newInventoryItem, unit: value })}
                      >
                        <SelectTrigger id="new_item_unit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="units">Units</SelectItem>
                          <SelectItem value="meters">Meters</SelectItem>
                          <SelectItem value="pieces">Pieces</SelectItem>
                          <SelectItem value="rolls">Rolls</SelectItem>
                          <SelectItem value="boxes">Boxes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="new_item_quantity">Initial Quantity</Label>
                      <Input
                        id="new_item_quantity"
                        type="number"
                        value={newInventoryItem.quantity}
                        onChange={(e) => setNewInventoryItem({ ...newInventoryItem, quantity: parseFloat(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="new_item_cost">Cost Price</Label>
                      <Input
                        id="new_item_cost"
                        type="number"
                        step="0.01"
                        value={newInventoryItem.cost_price}
                        onChange={(e) => setNewInventoryItem({ ...newInventoryItem, cost_price: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setShowCreateInventoryForm(false);
                    setNewInventoryItem({
                      name: '',
                      description: '',
                      category: '',
                      quantity: 0,
                      unit: 'units',
                      cost_price: 0,
                    });
                  }}>
                    Back to Search
                  </Button>
                  <Button onClick={handleCreateInventoryItem}>
                    Create & Link Item
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Inventory Sync Dialog */}
        <InventorySyncDialog
          open={syncDialogOpen}
          onOpenChange={setSyncDialogOpen}
          onSync={handleInventorySyncConfirm}
          title="Sync Options from Inventory"
          description="Select inventory items to create as selectable options. Each item will become an option with its price and details."
        />
      </CardContent>
    </Card>
  );
};
