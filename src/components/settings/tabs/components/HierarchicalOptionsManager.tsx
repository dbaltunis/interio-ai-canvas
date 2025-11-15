import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, ChevronDown, ChevronRight, Link as LinkIcon, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TREATMENT_CATEGORIES, TreatmentCategoryDbValue } from "@/types/treatmentCategories";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { InventorySyncDialog } from "./InventorySyncDialog";
import { useInventorySync } from "@/hooks/useInventorySync";

interface HierarchicalCategory {
  id: string;
  name: string;
  description?: string;
  treatment_type: string;
  subcategories?: HierarchicalSubcategory[];
}

interface HierarchicalSubcategory {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  pricing_method: string;
  base_price: number;
  inventory_item_id?: string;
  synced_from_inventory?: boolean;
  last_sync_date?: string;
  sub_subcategories?: HierarchicalSubSubcategory[];
}

interface HierarchicalSubSubcategory {
  id: string;
  subcategory_id: string;
  name: string;
  description?: string;
  pricing_method: string;
  base_price: number;
  inventory_item_id?: string;
  synced_from_inventory?: boolean;
  last_sync_date?: string;
  extras?: HierarchicalExtra[];
}

interface HierarchicalExtra {
  id: string;
  sub_subcategory_id: string;
  name: string;
  description?: string;
  pricing_method: string;
  base_price: number;
  is_required: boolean;
  is_default: boolean;
  inventory_item_id?: string;
  synced_from_inventory?: boolean;
  last_sync_date?: string;
}

export const HierarchicalOptionsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTreatment, setActiveTreatment] = useState<TreatmentCategoryDbValue>(TREATMENT_CATEGORIES.CURTAINS.db_value);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showSubcategoryDialog, setShowSubcategoryDialog] = useState(false);
  const [showSubSubcategoryDialog, setShowSubSubcategoryDialog] = useState(false);
  const [showExtraDialog, setShowExtraDialog] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  
  // Inventory sync states
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncTarget, setSyncTarget] = useState<{ type: 'subcategory' | 'sub_subcategory'; id: string } | null>(null);
  const { syncSubSubcategories, syncExtras, refreshFromInventory } = useInventorySync();
  
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    name: "",
    description: "",
    pricing_method: "fixed",
    base_price: 0,
  });

  const [subSubcategoryForm, setSubSubcategoryForm] = useState({
    name: "",
    description: "",
    pricing_method: "fixed",
    base_price: 0,
  });

  const [extraForm, setExtraForm] = useState({
    name: "",
    description: "",
    pricing_method: "fixed",
    base_price: 0,
    is_required: false,
    is_default: false,
  });

  // Fetch hierarchical options
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['hierarchical-options', activeTreatment],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      const { data, error } = await supabase
        .from('_legacy_option_categories')
        .select(`
          *,
          subcategories:_legacy_option_subcategories(
            *,
            sub_subcategories:_legacy_option_sub_subcategories(
              *,
              extras:_legacy_option_extras(*)
            )
          )
        `)
        .eq('treatment_type', activeTreatment)
        .eq('active', true)
        .order('sort_order');

      if (error) throw error;
      return data as HierarchicalCategory[];
    },
  });

  // Create category mutation
  const createCategory = useMutation({
    mutationFn: async (data: typeof categoryForm) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data: result, error } = await supabase
        .from('_legacy_option_categories')
        .insert({
          ...data,
          treatment_type: activeTreatment,
          user_id: user.user.id,
          category_type: 'hardware',
          active: true,
          sort_order: categories.length,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hierarchical-options'] });
      toast({ title: "Success", description: "Category created" });
      setShowCategoryDialog(false);
      setCategoryForm({ name: "", description: "" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Create subcategory mutation
  const createSubcategory = useMutation({
    mutationFn: async (data: typeof subcategoryForm & { category_id: string }) => {
      const { data: result, error } = await supabase
        .from('_legacy_option_subcategories')
        .insert({
          ...data,
          active: true,
          sort_order: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hierarchical-options'] });
      toast({ title: "Success", description: "Subcategory created" });
      setShowSubcategoryDialog(false);
      setSubcategoryForm({ name: "", description: "", pricing_method: "fixed", base_price: 0 });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Create sub-subcategory mutation
  const createSubSubcategory = useMutation({
    mutationFn: async (data: typeof subSubcategoryForm & { subcategory_id: string }) => {
      const { data: result, error } = await supabase
        .from('_legacy_option_sub_subcategories')
        .insert({
          ...data,
          active: true,
          sort_order: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hierarchical-options'] });
      toast({ title: "Success", description: "Item created" });
      setShowSubSubcategoryDialog(false);
      setSubSubcategoryForm({ name: "", description: "", pricing_method: "fixed", base_price: 0 });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Create extra mutation
  const createExtra = useMutation({
    mutationFn: async (data: typeof extraForm & { sub_subcategory_id: string }) => {
      const { data: result, error } = await supabase
        .from('_legacy_option_extras')
        .insert({
          ...data,
          active: true,
          sort_order: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hierarchical-options'] });
      toast({ title: "Success", description: "Extra option created" });
      setShowExtraDialog(false);
      setExtraForm({ name: "", description: "", pricing_method: "fixed", base_price: 0, is_required: false, is_default: false });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Inventory sync handlers
  const handleSyncDialogOpen = (type: 'subcategory' | 'sub_subcategory', id: string) => {
    setSyncTarget({ type, id });
    setSyncDialogOpen(true);
  };

  const handleSyncConfirm = async (
    selectedIds: string[],
    pricingMode: 'selling' | 'cost' | 'cost_with_markup',
    markupPercentage: number
  ) => {
    if (!syncTarget) return false;

    if (syncTarget.type === 'subcategory') {
      return await syncSubSubcategories(syncTarget.id, selectedIds, pricingMode, markupPercentage);
    } else {
      return await syncExtras(syncTarget.id, selectedIds, pricingMode, markupPercentage);
    }
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Hierarchical Hardware Options</CardTitle>
        <CardDescription>
          Create nested hardware configurations: Category → Motorised/Regular → Rods/Tracks → Specific Items & Extras
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Treatment Type Selection */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label>Treatment Type</Label>
            <Select value={activeTreatment} onValueChange={(v) => setActiveTreatment(v as TreatmentCategoryDbValue)}>
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TREATMENT_CATEGORIES).map((cat) => (
                  <SelectItem key={cat.db_value} value={cat.db_value}>
                    {cat.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setShowCategoryDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Hierarchical Options Display */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading options...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hierarchical options yet. Click "Add Category" to create your first hardware configuration.
          </div>
        ) : (
          <Accordion type="multiple" value={expandedCategories} onValueChange={setExpandedCategories}>
            {categories.map((category) => (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{category.name}</span>
                    {category.description && (
                      <span className="text-sm text-muted-foreground">- {category.description}</span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pl-4 space-y-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedParentId(category.id);
                      setShowSubcategoryDialog(true);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Subcategory (Motorised/Regular)
                  </Button>

                  {category.subcategories?.map((subcategory) => (
                    <div key={subcategory.id} className="border-l-2 border-muted pl-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{subcategory.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            {subcategory.pricing_method} - ${subcategory.base_price}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedParentId(subcategory.id);
                            setShowSubSubcategoryDialog(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Item (Rod/Track)
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSyncDialogOpen('subcategory', subcategory.id)}
                        >
                          <LinkIcon className="h-3 w-3 mr-1" />
                          Sync from Inventory
                        </Button>
                      </div>

                      {subcategory.sub_subcategories?.map((subSub) => (
                        <div key={subSub.id} className="border-l-2 border-muted pl-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h6 className="font-medium text-sm">{subSub.name}</h6>
                              <p className="text-xs text-muted-foreground">
                                {subSub.pricing_method} - ${subSub.base_price}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedParentId(subSub.id);
                                  setShowExtraDialog(true);
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Extra
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSyncDialogOpen('sub_subcategory', subSub.id)}
                              >
                                <LinkIcon className="h-3 w-3 mr-1" />
                                Sync Extras
                              </Button>
                            </div>
                          </div>

                          {subSub.inventory_item_id && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Badge variant="secondary" className="text-xs">
                                <LinkIcon className="h-3 w-3 mr-1" />
                                Linked to Inventory
                              </Badge>
                              {subSub.last_sync_date && (
                                <span>Last synced: {new Date(subSub.last_sync_date).toLocaleDateString()}</span>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => refreshFromInventory(subSub.id, 'sub_subcategory', subSub.inventory_item_id!, 'selling', 0)}
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            </div>
                          )}

                          {subSub.extras && subSub.extras.length > 0 && (
                            <div className="pl-4 space-y-1">
                              {subSub.extras.map((extra) => (
                                <div key={extra.id} className="text-xs flex items-center justify-between py-1">
                                  <span>
                                    • {extra.name}
                                    {extra.is_required && <span className="text-red-500 ml-1">*</span>}
                                    {extra.is_default && <span className="text-blue-500 ml-1">(default)</span>}
                                  </span>
                                  <span className="text-muted-foreground">${extra.base_price}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        {/* Category Dialog */}
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Hardware Category</DialogTitle>
              <DialogDescription>
                Create a top-level category (e.g., "Hardware Options", "Control Systems")
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g., Hardware Options"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Cancel</Button>
              <Button onClick={() => createCategory.mutate(categoryForm)} disabled={!categoryForm.name}>
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Subcategory Dialog */}
        <Dialog open={showSubcategoryDialog} onOpenChange={setShowSubcategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Subcategory</DialogTitle>
              <DialogDescription>
                Create a subcategory like "Motorised" or "Regular/Manual"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={subcategoryForm.name}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                  placeholder="e.g., Motorised or Regular"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={subcategoryForm.description}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pricing Method</Label>
                  <Select value={subcategoryForm.pricing_method} onValueChange={(v) => setSubcategoryForm({ ...subcategoryForm, pricing_method: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="per-unit">Per Unit</SelectItem>
                      <SelectItem value="per-meter">Per Meter</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Base Price</Label>
                  <Input
                    type="number"
                    value={subcategoryForm.base_price}
                    onChange={(e) => setSubcategoryForm({ ...subcategoryForm, base_price: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubcategoryDialog(false)}>Cancel</Button>
              <Button 
                onClick={() => createSubcategory.mutate({ ...subcategoryForm, category_id: selectedParentId })}
                disabled={!subcategoryForm.name}
              >
                Create Subcategory
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Sub-Subcategory Dialog */}
        <Dialog open={showSubSubcategoryDialog} onOpenChange={setShowSubSubcategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Item Type</DialogTitle>
              <DialogDescription>
                Create an item type like "Rods" or "Tracks"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={subSubcategoryForm.name}
                  onChange={(e) => setSubSubcategoryForm({ ...subSubcategoryForm, name: e.target.value })}
                  placeholder="e.g., Rods or Tracks"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={subSubcategoryForm.description}
                  onChange={(e) => setSubSubcategoryForm({ ...subSubcategoryForm, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pricing Method</Label>
                  <Select value={subSubcategoryForm.pricing_method} onValueChange={(v) => setSubSubcategoryForm({ ...subSubcategoryForm, pricing_method: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="per-unit">Per Unit</SelectItem>
                      <SelectItem value="per-meter">Per Meter</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Base Price</Label>
                  <Input
                    type="number"
                    value={subSubcategoryForm.base_price}
                    onChange={(e) => setSubSubcategoryForm({ ...subSubcategoryForm, base_price: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubSubcategoryDialog(false)}>Cancel</Button>
              <Button 
                onClick={() => createSubSubcategory.mutate({ ...subSubcategoryForm, subcategory_id: selectedParentId })}
                disabled={!subSubcategoryForm.name}
              >
                Create Item Type
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Extra Dialog */}
        <Dialog open={showExtraDialog} onOpenChange={setShowExtraDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Extra Option</DialogTitle>
              <DialogDescription>
                Add specific items like colors, finials, brackets, motor sides, etc.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={extraForm.name}
                  onChange={(e) => setExtraForm({ ...extraForm, name: e.target.value })}
                  placeholder="e.g., Black, Chrome, Left Side, etc."
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={extraForm.description}
                  onChange={(e) => setExtraForm({ ...extraForm, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pricing Method</Label>
                  <Select value={extraForm.pricing_method} onValueChange={(v) => setExtraForm({ ...extraForm, pricing_method: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="per-unit">Per Unit</SelectItem>
                      <SelectItem value="per-item">Per Item</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Base Price</Label>
                  <Input
                    type="number"
                    value={extraForm.base_price}
                    onChange={(e) => setExtraForm({ ...extraForm, base_price: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={extraForm.is_required}
                    onChange={(e) => setExtraForm({ ...extraForm, is_required: e.target.checked })}
                  />
                  <span className="text-sm">Required</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={extraForm.is_default}
                    onChange={(e) => setExtraForm({ ...extraForm, is_default: e.target.checked })}
                  />
                  <span className="text-sm">Default Selection</span>
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowExtraDialog(false)}>Cancel</Button>
              <Button 
                onClick={() => createExtra.mutate({ ...extraForm, sub_subcategory_id: selectedParentId })}
                disabled={!extraForm.name}
              >
                Create Extra
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>

    {/* Inventory Sync Dialog */}
    <InventorySyncDialog
      open={syncDialogOpen}
      onOpenChange={setSyncDialogOpen}
      onSync={handleSyncConfirm}
      title={syncTarget?.type === 'subcategory' ? "Sync Sub-subcategories from Inventory" : "Sync Extras from Inventory"}
      description={syncTarget?.type === 'subcategory' 
        ? "Select inventory items to create sub-subcategories. Each item will become a selectable option."
        : "Select inventory items to create extras. These will be additional options for the selected sub-subcategory."}
    />
    </>
  );
};
