import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, DollarSign, Ruler, Package, Store, TrendingUp, Trash2, ImageIcon, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateEnhancedInventoryItem, useUpdateEnhancedInventoryItem, useDeleteEnhancedInventoryItem, useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useVendors } from "@/hooks/useVendors";
import { useUserRole } from "@/hooks/useUserRole";
import { FieldHelp } from "@/components/ui/field-help";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessSettings, defaultMeasurementUnits } from "@/hooks/useBusinessSettings";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check } from "lucide-react";

const STORAGE_KEY = "inventory_draft_data";

interface UnifiedInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  item?: any;
  onSuccess?: () => void;
  initialCategory?: string;
  initialSubcategory?: string;
}

export const UnifiedInventoryDialog = ({ 
  open, 
  onOpenChange, 
  mode, 
  item, 
  onSuccess,
  initialCategory,
  initialSubcategory
}: UnifiedInventoryDialogProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [trackInventory, setTrackInventory] = useState(mode === "edit" ? (item?.quantity > 0) : false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { toast } = useToast();
  const createMutation = useCreateEnhancedInventoryItem();
  const updateMutation = useUpdateEnhancedInventoryItem();
  const deleteMutation = useDeleteEnhancedInventoryItem();
  const { data: vendors = [] } = useVendors();
  const { data: userRole } = useUserRole();
  const canViewMarkup = userRole?.canViewMarkup || false;
  const { data: businessSettings } = useBusinessSettings();
  const { data: userPreferences } = useUserPreferences();
  const { data: allInventory = [] } = useEnhancedInventory();

  // Get user's measurement units and currency
  const measurementUnits = businessSettings?.measurement_units 
    ? (typeof businessSettings.measurement_units === 'string' 
        ? JSON.parse(businessSettings.measurement_units) 
        : businessSettings.measurement_units)
    : defaultMeasurementUnits;
  
  const currency = userPreferences?.currency || measurementUnits.currency || 'USD';
  const lengthUnit = measurementUnits.fabric || measurementUnits.length || 'm';
  
  // Currency symbols
  const currencySymbols: Record<string, string> = {
    'NZD': 'NZ$',
    'AUD': 'A$',
    'USD': '$',
    'GBP': '£',
    'EUR': '€',
    'ZAR': 'R'
  };
  const currencySymbol = currencySymbols[currency] || currency;

  // Unit labels
  const unitLabels: Record<string, string> = {
    'mm': 'mm',
    'cm': 'cm',
    'm': 'm',
    'inches': 'in',
    'feet': 'ft',
    'yards': 'yd'
  };
  const lengthLabel = unitLabels[lengthUnit] || lengthUnit;

  const [pricingGridRows, setPricingGridRows] = useState<Array<{ length: string; price: string }>>([]);
  const [variants, setVariants] = useState<Array<{ 
    type: string; 
    name: string; 
    sku: string; 
    priceModifier: string;
    source: 'manual' | 'inventory';
    inventoryItemId?: string;
    quantityPerUnit?: number;
  }>>([]);
  const [openPopoverIndex, setOpenPopoverIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    category: "",
    subcategory: "",
    quantity: 0,
    unit: "meters",
    cost_price: 0,
    selling_price: 0,
    supplier: "",
    vendor_id: "",
    location: "",
    reorder_point: 5,
    fabric_width: 0,
    pattern_repeat_vertical: 0,
    pattern_repeat_horizontal: 0,
    fabric_composition: "",
    fabric_care_instructions: "",
    collection_name: "",
    color: "",
    image_url: "",
    hardware_finish: "",
    hardware_material: "",
    weight: 0,
    wallpaper_roll_width: 0,
    wallpaper_roll_length: 0,
    wallpaper_sold_by: "per_roll",
    wallpaper_unit_of_measure: "cm",
    wallpaper_match_type: "straight",
    wallpaper_horizontal_repeat: 0,
    wallpaper_waste_factor: 10,
    wallpaper_pattern_offset: 0
  });

  // Load draft data on mount for create mode
  useEffect(() => {
    if (mode === "create" && open) {
      const savedDraft = localStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setFormData(parsed.formData);
          setTrackInventory(parsed.trackInventory);
          setActiveTab(parsed.activeTab || "basic");
          toast({
            title: "Draft Restored",
            description: "Your unsaved work has been restored.",
          });
        } catch (e) {
          console.error("Failed to parse draft data", e);
        }
      } else if (initialCategory || initialSubcategory) {
        // Pre-populate with initial values if provided
        setFormData(prev => ({
          ...prev,
          category: initialCategory || prev.category,
          subcategory: initialSubcategory || prev.subcategory,
        }));
        toast({
          title: "Context Applied",
          description: `Pre-filled with ${initialCategory || 'current'} category${initialSubcategory ? ` and ${initialSubcategory} subcategory` : ''}.`,
        });
      }
    } else if (mode === "edit" && item) {
      setFormData({
        name: item.name || "",
        description: item.description || "",
        sku: item.sku || "",
        category: item.category || "",
        subcategory: item.subcategory || "",
        quantity: item.quantity || 0,
        unit: item.unit || "meters",
        cost_price: item.cost_price || 0,
        selling_price: item.selling_price || 0,
        supplier: item.supplier || "",
        vendor_id: item.vendor_id || "",
        location: item.location || "",
        reorder_point: item.reorder_point || 5,
        fabric_width: item.fabric_width || 0,
        pattern_repeat_vertical: item.pattern_repeat_vertical || 0,
        pattern_repeat_horizontal: item.pattern_repeat_horizontal || 0,
        fabric_composition: item.fabric_composition || "",
        fabric_care_instructions: item.fabric_care_instructions || "",
        collection_name: item.collection_name || "",
        color: item.color || "",
        image_url: item.image_url || "",
        hardware_finish: item.hardware_finish || "",
        hardware_material: item.hardware_material || "",
        weight: item.weight || 0,
        wallpaper_roll_width: item.wallpaper_roll_width || 0,
        wallpaper_roll_length: item.wallpaper_roll_length || 0,
        wallpaper_sold_by: item.wallpaper_sold_by || "per_roll",
        wallpaper_unit_of_measure: item.wallpaper_unit_of_measure || "cm",
        wallpaper_match_type: item.wallpaper_match_type || "straight",
        wallpaper_horizontal_repeat: item.wallpaper_horizontal_repeat || 0,
        wallpaper_waste_factor: item.wallpaper_waste_factor || 10,
        wallpaper_pattern_offset: item.wallpaper_pattern_offset || 0
      });
      setTrackInventory(item.quantity > 0);
    }
  }, [mode, item, open, toast]);

  // Save draft when form data changes (only for create mode)
  const saveDraft = useCallback(() => {
    if (mode === "create" && open && formData.name) {
      const draftData = {
        formData,
        trackInventory,
        activeTab,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
    }
  }, [mode, open, formData, trackInventory, activeTab]);

  // Auto-save draft periodically
  useEffect(() => {
    const interval = setInterval(saveDraft, 2000); // Save every 2 seconds
    return () => clearInterval(interval);
  }, [saveDraft]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveDraft();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveDraft]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload images');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `inventory-${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
      toast({
        title: "Image uploaded successfully",
        description: "The product image has been uploaded.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image_url: "" });
  };

  // Prevent dialog from closing when user switches tabs/windows
  useEffect(() => {
    if (!open || mode === "edit") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Save that dialog should remain open
        sessionStorage.setItem('inventory_dialog_open', 'true');
      }
    };

    const handleFocus = () => {
      // Ensure dialog stays open when returning to tab
      const shouldBeOpen = sessionStorage.getItem('inventory_dialog_open');
      if (shouldBeOpen === 'true' && !open) {
        // Dialog was force-closed, notify parent to reopen
        console.log('[Dialog] Preventing unexpected close on tab return');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Mark dialog as open
    if (open) {
      sessionStorage.setItem('inventory_dialog_open', 'true');
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      if (!open) {
        sessionStorage.removeItem('inventory_dialog_open');
      }
    };
  }, [open, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const cleanData = {
        ...formData,
        cost_price: formData.cost_price || 0,
        selling_price: formData.selling_price || 0,
        quantity: trackInventory ? formData.quantity : 0,
        reorder_point: trackInventory ? formData.reorder_point : 0
      };
      
      // Remove empty fields
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === "" || cleanData[key] === undefined || cleanData[key] === null) {
          delete cleanData[key];
        }
      });
      
      if (mode === "create") {
        await createMutation.mutateAsync({ ...cleanData, active: true });
        // Clear draft on successful creation
        localStorage.removeItem(STORAGE_KEY);
      } else {
        await updateMutation.mutateAsync({ id: item.id, ...cleanData });
      }
      
      onOpenChange(false);
      onSuccess?.();
      
      if (mode === "create") {
        // Reset form for create mode
        setFormData({
          name: "",
          description: "",
          sku: "",
          category: "",
          subcategory: "",
          quantity: 0,
          unit: "meters",
          cost_price: 0,
          selling_price: 0,
          supplier: "",
          vendor_id: "",
          location: "",
          reorder_point: 5,
          fabric_width: 0,
          pattern_repeat_vertical: 0,
          pattern_repeat_horizontal: 0,
          fabric_composition: "",
          fabric_care_instructions: "",
          collection_name: "",
          color: "",
          image_url: "",
          hardware_finish: "",
          hardware_material: "",
          weight: 0,
          wallpaper_roll_width: 0,
          wallpaper_roll_length: 0,
          wallpaper_sold_by: "per_roll",
          wallpaper_unit_of_measure: "cm",
          wallpaper_match_type: "straight",
          wallpaper_horizontal_repeat: 0,
          wallpaper_waste_factor: 10,
          wallpaper_pattern_offset: 0
        });
        setTrackInventory(false);
      }
      
    } catch (error: any) {
      console.error(`Error ${mode === "create" ? "creating" : "updating"} inventory item:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${mode === "create" ? "create" : "update"} inventory item.`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(item.id);
        onOpenChange(false);
        onSuccess?.();
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  };

  const isRollerBlindFabric = formData.category === "fabric" && formData.subcategory === "roller_fabric";
  const isCurtainOrBlindFabric = formData.category === "fabric" && ["curtain_fabric", "blind_fabric"].includes(formData.subcategory);
  const isFabric = formData.category === "fabric";
  const isHardware = formData.category === "hardware";
  const isWallcovering = formData.category === "wallcovering";

  const profitPerUnit = formData.selling_price - formData.cost_price;
  const markupPercentage = formData.cost_price > 0 
    ? ((formData.selling_price - formData.cost_price) / formData.cost_price) * 100 
    : 0;
  const marginPercentage = formData.selling_price > 0 
    ? ((formData.selling_price - formData.cost_price) / formData.selling_price) * 100 
    : 0;

  const getMarginColor = () => {
    if (marginPercentage >= 30) return "text-green-600";
    if (marginPercentage >= 15) return "text-yellow-600";
    return "text-red-600";
  };

  const handleOpenChange = (newOpen: boolean) => {
    // Prevent accidental closes - require explicit user action
    if (!newOpen && mode === "create" && formData.name) {
      const confirmClose = window.confirm("You have unsaved changes. Your draft will be saved. Close anyway?");
      if (!confirmClose) {
        return; // Don't close
      }
    }
    
    if (!newOpen) {
      sessionStorage.removeItem('inventory_dialog_open');
    }
    
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={true}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New Product" : `Edit ${item?.name}`}</DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Create a new fabric, hardware, or material item" 
              : `Update the details for ${item?.name}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Type Selection - Only for Create */}
          {mode === "create" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Main Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: "" })}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select main category" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border" position="popper" sideOffset={4}>
                      <SelectItem value="fabric">Fabrics</SelectItem>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="wallcovering">Wallcoverings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.category && (
                  <div>
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Select 
                      value={formData.subcategory} 
                      onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border max-h-[300px]" position="popper" sideOffset={4}>
                        {formData.category === "fabric" && (
                          <>
                            <SelectItem value="curtain_fabric">Curtain Fabric</SelectItem>
                            <SelectItem value="roller_fabric">Roller Blind Fabric</SelectItem>
                            <SelectItem value="blind_fabric">Roman Blind Fabric</SelectItem>
                            <SelectItem value="furniture_fabric">Furniture Fabric</SelectItem>
                            <SelectItem value="sheer_fabric">Sheer Fabric</SelectItem>
                          </>
                        )}
                        {formData.category === "hardware" && (
                          <>
                            <SelectItem value="track">Track System</SelectItem>
                            <SelectItem value="rod">Rod System</SelectItem>
                            <SelectItem value="bracket">Bracket</SelectItem>
                            <SelectItem value="motor">Motor</SelectItem>
                            <SelectItem value="accessory">Accessory</SelectItem>
                          </>
                        )}
                        {formData.category === "wallcovering" && (
                          <>
                            <SelectItem value="plain_wallpaper">Plain Wallpaper</SelectItem>
                            <SelectItem value="patterned_wallpaper">Patterned Wallpaper</SelectItem>
                            <SelectItem value="wall_panels_murals">Wall Panels / Murals</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {formData.subcategory && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="inventory">Vendor & Stock</TabsTrigger>
              </TabsList>

              {/* BASIC INFO TAB */}
              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="flex items-center">
                        <Label htmlFor="name">Product Name</Label>
                        <FieldHelp content="A descriptive name that clearly identifies the product." />
                      </div>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Luxury Velvet Navy"
                        required
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center">
                        <Label htmlFor="sku">SKU</Label>
                        <FieldHelp content="Stock Keeping Unit - unique identifier for this product." />
                      </div>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="e.g., LVN-001"
                      />
                    </div>

                    {/* Category selection - only show in edit mode */}
                    {mode === "edit" && (
                      <div>
                        <div className="flex items-center gap-1 mb-2">
                          <Label htmlFor="category">Category</Label>
                          <FieldHelp content="Choose the specific fabric or hardware type for better organization" />
                        </div>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger id="category" className="bg-background hover:bg-accent cursor-pointer">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border border-border max-h-[300px]" position="popper" sideOffset={4}>
                            <SelectItem value="fabric">Fabric (General)</SelectItem>
                            <SelectItem value="curtain_fabric">Curtain Fabrics</SelectItem>
                            <SelectItem value="roller_fabric">Roller Fabrics</SelectItem>
                            <SelectItem value="furniture_fabric">Furniture Fabrics</SelectItem>
                            <SelectItem value="sheer_fabric">Sheer Fabrics</SelectItem>
                            <SelectItem value="blind_fabric">Blind Fabric</SelectItem>
                            <SelectItem value="upholstery_fabric">Upholstery Fabric</SelectItem>
                            <SelectItem value="lining">Lining/Interlining</SelectItem>
                            <SelectItem value="trimming">Trimming/Passementerie</SelectItem>
                            <SelectItem value="hardware">Hardware (General)</SelectItem>
                            <SelectItem value="track_system">Track System</SelectItem>
                            <SelectItem value="rod_system">Rod System</SelectItem>
                            <SelectItem value="bracket">Bracket/Mounting</SelectItem>
                            <SelectItem value="motor">Motorization</SelectItem>
                            <SelectItem value="chain">Chain/Cord</SelectItem>
                            <SelectItem value="venetian_slats">Venetian Slats</SelectItem>
                            <SelectItem value="shutter_panels">Shutter Panels</SelectItem>
                            <SelectItem value="wallcovering">Wallcovering (General)</SelectItem>
                            <SelectItem value="wallpaper">Wallpaper</SelectItem>
                            <SelectItem value="accessory">Accessory</SelectItem>
                            <SelectItem value="service">Service/Labor</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Choose the specific fabric or hardware type for better organization
                        </p>
                      </div>
                    )}

                    {/* Shopify-compatible Product Type */}

                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Product description..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SPECIFICATIONS TAB */}
              <TabsContent value="specifications" className="space-y-4">
                {/* Roller Blind Fabric Specifications */}
                {isRollerBlindFabric && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Ruler className="h-5 w-5" />
                        Roller Blind Fabric Specifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="fabric_width">Fabric Roll Width (cm)</Label>
                        <Input
                          id="fabric_width"
                          type="number"
                          step="0.1"
                          value={formData.fabric_width || ""}
                          onChange={(e) => setFormData({ ...formData, fabric_width: parseFloat(e.target.value) || 0 })}
                          placeholder="240"
                        />
                      </div>

                      <div>
                        <Label htmlFor="fabric_composition">Composition</Label>
                        <Input
                          id="fabric_composition"
                          value={formData.fabric_composition}
                          onChange={(e) => setFormData({ ...formData, fabric_composition: e.target.value })}
                          placeholder="e.g., 100% Polyester"
                        />
                      </div>

                      <div>
                        <Label htmlFor="color">Color</Label>
                        <Input
                          id="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          placeholder="e.g., Pearl White"
                        />
                      </div>

                      <div>
                        <Label htmlFor="collection_name">Collection</Label>
                        <Input
                          id="collection_name"
                          value={formData.collection_name}
                          onChange={(e) => setFormData({ ...formData, collection_name: e.target.value })}
                          placeholder="e.g., Sunscreen Collection"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <ImageIcon className="h-4 w-4" />
                          <Label>Product Image</Label>
                        </div>
                        
                        {formData.image_url ? (
                          <div className="relative">
                            <img 
                              src={formData.image_url} 
                              alt="Product preview" 
                              className="w-full h-32 object-cover rounded-md border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={removeImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('image-upload-input')?.click()}
                              disabled={uploadingImage}
                              className="flex-1"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {uploadingImage ? 'Uploading...' : 'Upload Image'}
                            </Button>
                            <input
                              id="image-upload-input"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="fabric_care_instructions">Care Instructions</Label>
                        <Textarea
                          id="fabric_care_instructions"
                          value={formData.fabric_care_instructions}
                          onChange={(e) => setFormData({ ...formData, fabric_care_instructions: e.target.value })}
                          placeholder="e.g., Wipe clean with damp cloth"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Curtain/Roman Blind Fabric Specifications */}
                {isCurtainOrBlindFabric && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Ruler className="h-5 w-5" />
                        Fabric Specifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="fabric_width">Fabric Width (cm)</Label>
                        <Input
                          id="fabric_width"
                          type="number"
                          step="0.1"
                          value={formData.fabric_width || ""}
                          onChange={(e) => setFormData({ ...formData, fabric_width: parseFloat(e.target.value) || 0 })}
                          placeholder="137"
                        />
                      </div>

                      <div>
                        <Label htmlFor="fabric_composition">Composition</Label>
                        <Input
                          id="fabric_composition"
                          value={formData.fabric_composition}
                          onChange={(e) => setFormData({ ...formData, fabric_composition: e.target.value })}
                          placeholder="e.g., 100% Cotton"
                        />
                      </div>

                      <div>
                        <Label htmlFor="pattern_repeat_vertical">Vertical Pattern Repeat (cm)</Label>
                        <Input
                          id="pattern_repeat_vertical"
                          type="number"
                          step="0.1"
                          value={formData.pattern_repeat_vertical || ""}
                          onChange={(e) => setFormData({ ...formData, pattern_repeat_vertical: parseFloat(e.target.value) || 0 })}
                          placeholder="64"
                        />
                      </div>

                      <div>
                        <Label htmlFor="pattern_repeat_horizontal">Horizontal Pattern Repeat (cm)</Label>
                        <Input
                          id="pattern_repeat_horizontal"
                          type="number"
                          step="0.1"
                          value={formData.pattern_repeat_horizontal || ""}
                          onChange={(e) => setFormData({ ...formData, pattern_repeat_horizontal: parseFloat(e.target.value) || 0 })}
                          placeholder="32"
                        />
                      </div>

                      <div>
                        <Label htmlFor="collection_name">Collection</Label>
                        <Input
                          id="collection_name"
                          value={formData.collection_name}
                          onChange={(e) => setFormData({ ...formData, collection_name: e.target.value })}
                          placeholder="e.g., Luxury Collection"
                        />
                      </div>

                      <div>
                        <Label htmlFor="color">Color</Label>
                        <Input
                          id="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          placeholder="e.g., Navy Blue"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <ImageIcon className="h-4 w-4" />
                          <Label>Product Image</Label>
                        </div>
                        
                        {formData.image_url ? (
                          <div className="relative">
                            <img 
                              src={formData.image_url} 
                              alt="Product preview" 
                              className="w-full h-32 object-cover rounded-md border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={removeImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById('image-upload-input-hardware')?.click()}
                              disabled={uploadingImage}
                              className="flex-1"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {uploadingImage ? 'Uploading...' : 'Upload Image'}
                            </Button>
                            <input
                              id="image-upload-input-hardware"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="fabric_care_instructions">Care Instructions</Label>
                        <Textarea
                          id="fabric_care_instructions"
                          value={formData.fabric_care_instructions}
                          onChange={(e) => setFormData({ ...formData, fabric_care_instructions: e.target.value })}
                          placeholder="e.g., Dry clean only"
                          rows={2}
                        />
                      </div>
                    </CardContent>

                    {/* Wallpaper-specific fields */}
                    {formData.category === "wallcovering" && (
                      <CardContent className="border-t">
                        <h4 className="font-medium mb-4">Wallpaper Specifications</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <div className="flex items-center">
                              <Label htmlFor="wallpaper_roll_width">Roll Width</Label>
                              <FieldHelp content="The width of one wallpaper roll (typically 53cm or 68cm)" />
                            </div>
                            <div className="flex gap-2">
                              <Input
                                id="wallpaper_roll_width"
                                type="number"
                                step="0.1"
                                value={formData.wallpaper_roll_width || ""}
                                onChange={(e) => setFormData({ ...formData, wallpaper_roll_width: parseFloat(e.target.value) || 0 })}
                                placeholder="53"
                              />
                              <Select
                                value={formData.wallpaper_unit_of_measure}
                                onValueChange={(value) => setFormData({ ...formData, wallpaper_unit_of_measure: value })}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cm">cm</SelectItem>
                                  <SelectItem value="inch">inch</SelectItem>
                                  <SelectItem value="mm">mm</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center">
                              <Label htmlFor="wallpaper_roll_length">Roll Length</Label>
                              <FieldHelp content="The length of one wallpaper roll (typically 10m)" />
                            </div>
                            <div className="flex gap-2">
                              <Input
                                id="wallpaper_roll_length"
                                type="number"
                                step="0.1"
                                value={formData.wallpaper_roll_length || ""}
                                onChange={(e) => setFormData({ ...formData, wallpaper_roll_length: parseFloat(e.target.value) || 0 })}
                                placeholder="10"
                              />
                              <div className="w-24 flex items-center justify-center text-sm text-muted-foreground">
                                meters
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center">
                              <Label htmlFor="wallpaper_sold_by">Sold By</Label>
                              <FieldHelp content="How this wallpaper is sold - per roll, per unit, or per square meter" />
                            </div>
                            <Select
                              value={formData.wallpaper_sold_by}
                              onValueChange={(value) => setFormData({ ...formData, wallpaper_sold_by: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="per_roll">Per Roll</SelectItem>
                                <SelectItem value="per_unit">Per Unit</SelectItem>
                                <SelectItem value="per_sqm">Per Square Meter</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <Label htmlFor="wallpaper_match_type">Pattern Match Type</Label>
                              <FieldHelp content="This determines how the wallpaper pattern aligns between strips and directly affects how much material is needed. Pattern matching requires extra wallpaper to align the design properly." />
                            </div>
                            <Select
                              value={formData.wallpaper_match_type}
                              onValueChange={(value) => setFormData({ ...formData, wallpaper_match_type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select pattern type..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="straight">
                                  <div className="flex flex-col">
                                    <span className="font-medium">Straight Match</span>
                                    <span className="text-xs text-muted-foreground">Pattern aligns horizontally - adds 1 repeat per strip</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="drop">
                                  <div className="flex flex-col">
                                    <span className="font-medium">Drop Match (Half Drop)</span>
                                    <span className="text-xs text-muted-foreground">Pattern drops by half - adds 1 repeat per strip</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="offset">
                                  <div className="flex flex-col">
                                    <span className="font-medium">Offset Match</span>
                                    <span className="text-xs text-muted-foreground">Pattern offset diagonally - adds 1 repeat per strip</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="random">
                                  <div className="flex flex-col">
                                    <span className="font-medium">Random Match</span>
                                    <span className="text-xs text-muted-foreground">No pattern to match - most efficient, no extra needed</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="none">
                                  <div className="flex flex-col">
                                    <span className="font-medium">No Pattern (Plain)</span>
                                    <span className="text-xs text-muted-foreground">Solid color/texture - most efficient, no extra needed</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              💡 {formData.wallpaper_match_type === 'straight' || formData.wallpaper_match_type === 'drop' || formData.wallpaper_match_type === 'offset' 
                                ? 'Pattern matching adds one vertical repeat to each strip length for alignment'
                                : formData.wallpaper_match_type === 'random' || formData.wallpaper_match_type === 'none'
                                ? 'No extra material needed - strips can be cut to exact height'
                                : 'Select a pattern type to see how it affects material calculations'}
                            </p>
                          </div>

                          <div>
                            <div className="flex items-center">
                              <Label htmlFor="wallpaper_waste_factor">Waste Factor (%)</Label>
                              <FieldHelp content="Recommended extra material for cutting errors and future repairs (typically 10-15%)" />
                            </div>
                            <Input
                              id="wallpaper_waste_factor"
                              type="number"
                              step="1"
                              min="0"
                              max="100"
                              value={formData.wallpaper_waste_factor || ""}
                              onChange={(e) => setFormData({ ...formData, wallpaper_waste_factor: parseFloat(e.target.value) || 10 })}
                              placeholder="10"
                            />
                          </div>

                          {(formData.wallpaper_match_type === 'drop' || formData.wallpaper_match_type === 'offset') && (
                            <div>
                              <div className="flex items-center">
                                <Label htmlFor="wallpaper_horizontal_repeat">Horizontal Repeat (cm)</Label>
                                <FieldHelp content="For drop/offset matches - how far the pattern shifts horizontally" />
                              </div>
                              <Input
                                id="wallpaper_horizontal_repeat"
                                type="number"
                                step="0.1"
                                value={formData.wallpaper_horizontal_repeat || ""}
                                onChange={(e) => setFormData({ ...formData, wallpaper_horizontal_repeat: parseFloat(e.target.value) || 0 })}
                                placeholder="26.5"
                              />
                            </div>
                          )}
                        </div>

                        {/* Calculation Preview */}
                        {formData.wallpaper_roll_width > 0 && formData.wallpaper_roll_length > 0 && (
                          <div className="mt-4 p-4 bg-muted rounded-lg">
                            <h5 className="font-medium mb-2">Roll Coverage</h5>
                            <p className="text-sm text-muted-foreground">
                              Each roll covers approximately{" "}
                              <strong>
                                {((formData.wallpaper_roll_width / 100) * formData.wallpaper_roll_length).toFixed(2)} m²
                              </strong>
                              {" "}(based on {formData.wallpaper_roll_width}cm × {formData.wallpaper_roll_length}m)
                            </p>
                            {formData.pattern_repeat_vertical > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                With {formData.pattern_repeat_vertical}cm pattern repeat, actual coverage may be reduced
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    )}

                    {/* Roll Direction Info */}
                    {isFabric && formData.category !== "wallcovering" && formData.fabric_width > 0 && (
                      <CardContent>
                        <div className="p-4 bg-muted rounded-lg space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">Fabric Orientation</h4>
                            <Badge variant={formData.fabric_width <= 200 ? "default" : "secondary"}>
                              {formData.fabric_width <= 200 ? "Standard/Narrow" : "Railroaded/Wide"}
                            </Badge>
                          </div>
                          
                          <div className="text-sm space-y-2">
                            <p className="text-muted-foreground">
                              This {formData.fabric_width}cm fabric is classified as <strong>{formData.fabric_width <= 200 ? "Standard/Narrow" : "Railroaded/Wide"}</strong> width.
                            </p>
                            
                            <div className="p-3 bg-background/50 rounded border border-border/50 space-y-2 text-xs">
                              <div>
                                <span className="font-medium text-foreground">Standard/Narrow (140-150cm):</span>
                                <p className="text-muted-foreground mt-0.5">Pattern runs vertically along the roll length. For wide curtains, multiple drops are sewn together with vertical seams.</p>
                              </div>
                              <div>
                                <span className="font-medium text-foreground">Railroaded/Wide (280cm+):</span>
                                <p className="text-muted-foreground mt-0.5">Pattern runs horizontally across the roll width. Allows wide curtains without vertical seams - fabric is turned sideways.</p>
                              </div>
                            </div>
                            
                            <p className="text-xs text-muted-foreground italic">
                              {formData.fabric_width <= 200 
                                ? "For a 450cm wide rail, this fabric will require multiple drops joined with seams." 
                                : "Wide enough to make large curtains without vertical joins."}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Hardware Specifications */}
                {isHardware && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Hardware Specifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="hardware_material">Material</Label>
                        <Input
                          id="hardware_material"
                          value={formData.hardware_material}
                          onChange={(e) => setFormData({ ...formData, hardware_material: e.target.value })}
                          placeholder="e.g., Aluminum"
                        />
                      </div>

                      <div>
                        <Label htmlFor="hardware_finish">Finish</Label>
                        <Input
                          id="hardware_finish"
                          value={formData.hardware_finish}
                          onChange={(e) => setFormData({ ...formData, hardware_finish: e.target.value })}
                          placeholder="e.g., Chrome"
                        />
                      </div>

                      <div>
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={formData.weight || ""}
                          onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                          placeholder="2.5"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* PRICING TAB */}
              <TabsContent value="pricing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Pricing Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {canViewMarkup && (
                      <Alert className="bg-primary/5 border-primary/20">
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>Admin Privileges Active:</strong> As an administrator, you have access to view cost prices, profit margins, and markup calculations. Regular staff members will only see selling prices.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Show simple pricing for non-track/rod items */}
                    {formData.subcategory !== "track" && formData.subcategory !== "rod" && (
                      <>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor="unit">Unit</Label>
                            <Select 
                              value={formData.unit} 
                              onValueChange={(value) => setFormData({ ...formData, unit: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="meters">Meters</SelectItem>
                                <SelectItem value="yards">Yards</SelectItem>
                                <SelectItem value="sqm">Square Meters</SelectItem>
                                <SelectItem value="pieces">Pieces</SelectItem>
                                <SelectItem value="rolls">Rolls</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="cost_price">
                              Cost Price (Buying) per {formData.unit} ({currencySymbol})
                            </Label>
                            <Input
                              id="cost_price"
                              type="number"
                              step="0.01"
                              value={formData.cost_price || ""}
                              onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                              placeholder="20.00"
                              required
                            />
                            <p className="text-xs text-muted-foreground mt-1">What you pay to supplier</p>
                          </div>

                          <div>
                            <Label htmlFor="selling_price">
                              Selling Price (Retail) per {formData.unit} ({currencySymbol})
                            </Label>
                            <Input
                              id="selling_price"
                              type="number"
                              step="0.01"
                              value={formData.selling_price || ""}
                              onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                              placeholder="40.00"
                              required
                            />
                            <p className="text-xs text-muted-foreground mt-1">What customer pays</p>
                          </div>
                        </div>

                        {/* Profit Analysis - Admin Only */}
                        {canViewMarkup && formData.cost_price > 0 && formData.selling_price > 0 && (
                          <Card className="bg-muted/50">
                            <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Profit Analysis
                              </CardTitle>
                              <CardDescription>Calculated automatically based on your pricing</CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3 md:grid-cols-3">
                              <div>
                                <Label className="text-xs text-muted-foreground">Profit per Unit</Label>
                                <p className="text-xl font-bold">${profitPerUnit.toFixed(2)}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Markup %</Label>
                                <p className="text-xl font-bold">{markupPercentage.toFixed(1)}%</p>
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Profit Margin %</Label>
                                <p className={`text-xl font-bold ${getMarginColor()}`}>
                                  {marginPercentage.toFixed(1)}%
                                  {marginPercentage >= 30 && " 🟢"}
                                  {marginPercentage >= 15 && marginPercentage < 30 && " 🟡"}
                                  {marginPercentage < 15 && " 🔴"}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}

                    {/* Info for track/rod items - they use pricing grid below */}
                    {(formData.subcategory === "track" || formData.subcategory === "rod") && (
                      <Alert>
                        <DollarSign className="h-4 w-4" />
                        <AlertDescription className="space-y-1">
                          <div><strong>Length-Based Pricing:</strong> Tracks and rods use a pricing grid instead of fixed prices.</div>
                          <div className="text-xs text-muted-foreground">
                            • Define prices for different lengths in {lengthLabel} (e.g., 1.0{lengthLabel} = {currencySymbol}20, 1.5{lengthLabel} = {currencySymbol}25, 2.0{lengthLabel} = {currencySymbol}30)<br />
                            • Set your typical length range (min/max) in the grid below<br />
                            • The system will charge the price matching the closest length in your grid<br />
                            • Common range: {lengthUnit === 'm' ? '0.3m (30cm) to 6.0m (600cm)' : lengthUnit === 'feet' ? '1ft to 20ft' : lengthUnit === 'inches' ? '12in to 240in' : `0.3${lengthLabel} to 6.0${lengthLabel}`}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* CSV Pricing Grid - Track/Rod Hardware Only */}
                {(formData.subcategory === "track" || formData.subcategory === "rod") && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Length-Based Pricing Grid</CardTitle>
                      <CardDescription>
                        Define selling prices for different lengths. Add rows for each length you offer (e.g., 0.3{lengthLabel} to 6.0{lengthLabel} range). 
                        The system will use the closest matching length when calculating quotes.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          type="file"
                          accept=".csv"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const csv = event.target?.result as string;
                                const rows = csv.split('\n').slice(1); // Skip header
                                const parsedRows = rows
                                  .filter(row => row.trim())
                                  .map(row => {
                                    const [length, price] = row.split(',');
                                    return { length: length?.trim() || '', price: price?.trim() || '' };
                                  });
                                setPricingGridRows(parsedRows);
                                toast({ title: "CSV uploaded", description: `${parsedRows.length} pricing rows loaded` });
                              };
                              reader.readAsText(file);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const csv = `Length (${lengthLabel}),Price (${currencySymbol})\n1.0,20.00\n1.5,25.00\n2.0,30.00`;
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'pricing-template.csv';
                            a.click();
                          }}
                        >
                          Download Template
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {pricingGridRows.map((row, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder={`Length (${lengthLabel})`}
                              value={row.length}
                              onChange={(e) => {
                                const updated = [...pricingGridRows];
                                updated[index].length = e.target.value;
                                setPricingGridRows(updated);
                              }}
                            />
                            <Input
                              placeholder={`Price (${currencySymbol})`}
                              value={row.price}
                              onChange={(e) => {
                                const updated = [...pricingGridRows];
                                updated[index].price = e.target.value;
                                setPricingGridRows(updated);
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setPricingGridRows(pricingGridRows.filter((_, i) => i !== index));
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPricingGridRows([...pricingGridRows, { length: '', price: '' }])}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Row
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Hardware Variants - Track/Rod Hardware Only */}
                {(formData.subcategory === "track" || formData.subcategory === "rod") && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Product Components (BOM)</CardTitle>
                      <CardDescription>
                        Select components from your inventory (brackets, finials, etc.) to create a complete product bundle. 
                        The system will track stock and pricing from your actual inventory items.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {variants.map((variant, index) => {
                        const selectedItem = variant.inventoryItemId 
                          ? allInventory.find(item => item.id === variant.inventoryItemId)
                          : null;
                        
                        return (
                          <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                            {/* Source Toggle */}
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Component {index + 1}</Label>
                              <div className="flex items-center gap-2">
                                <Label className="text-xs text-muted-foreground">Source:</Label>
                                <Select
                                  value={variant.source}
                                  onValueChange={(value: 'manual' | 'inventory') => {
                                    const updated = [...variants];
                                    updated[index].source = value;
                                    // Reset fields when switching
                                    if (value === 'inventory') {
                                      updated[index].inventoryItemId = undefined;
                                      updated[index].priceModifier = '';
                                    }
                                    setVariants(updated);
                                  }}
                                >
                                  <SelectTrigger className="h-8 w-[140px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="inventory">From Inventory</SelectItem>
                                    <SelectItem value="manual">Create New</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Inventory Selection Mode */}
                            {variant.source === 'inventory' ? (
                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="col-span-2">
                                  <Label className="text-xs">Select Inventory Item</Label>
                                  <Popover 
                                    open={openPopoverIndex === index} 
                                    onOpenChange={(open) => setOpenPopoverIndex(open ? index : null)}
                                    modal={true}
                                  >
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openPopoverIndex === index}
                                        className="w-full justify-between h-9"
                                        type="button"
                                      >
                                        {selectedItem ? (
                                          <span className="flex items-center gap-2">
                                            <span className="font-medium">{selectedItem.name}</span>
                                            <span className="text-xs text-muted-foreground">({selectedItem.sku || 'No SKU'})</span>
                                          </span>
                                        ) : (
                                          "Search inventory..."
                                        )}
                                        <Package className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent 
                                      className="w-[400px] p-0" 
                                      align="start"
                                      style={{ zIndex: 99999 }}
                                      onInteractOutside={(e) => {
                                        // Prevent closing when clicking inside the dialog
                                        const target = e.target as HTMLElement;
                                        if (target.closest('[role="dialog"]')) {
                                          e.preventDefault();
                                        }
                                      }}
                                    >
                                      <Command>
                                        <CommandInput placeholder="Search items..." className="h-9" />
                                        <CommandEmpty>No inventory items found.</CommandEmpty>
                                        <CommandList>
                                          <CommandGroup>
                                            {allInventory
                                              .filter(item => item.category === 'hardware')
                                              .map((item) => (
                                                <CommandItem
                                                  key={item.id}
                                                  value={`${item.name} ${item.sku || ''}`}
                                                  onSelect={() => {
                                                    const updated = [...variants];
                                                    updated[index].inventoryItemId = item.id;
                                                    updated[index].name = item.name || '';
                                                    updated[index].sku = item.sku || '';
                                                    updated[index].priceModifier = item.selling_price?.toString() || '0';
                                                    setVariants(updated);
                                                    setOpenPopoverIndex(null); // Close popover after selection
                                                  }}
                                                >
                                                  <div className="flex items-center justify-between w-full">
                                                    <div className="flex-1">
                                                      <div className="font-medium">{item.name}</div>
                                                      <div className="text-xs text-muted-foreground">
                                                        {item.sku || 'No SKU'} • {currencySymbol}{item.selling_price || 0}
                                                      </div>
                                                    </div>
                                                    {selectedItem?.id === item.id && (
                                                      <Check className="h-4 w-4" />
                                                    )}
                                                  </div>
                                                </CommandItem>
                                              ))}
                                          </CommandGroup>
                                        </CommandList>
                                      </Command>
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                {selectedItem && (
                                  <>
                                    <div>
                                      <Label className="text-xs">Type</Label>
                                      <Select
                                        value={variant.type}
                                        onValueChange={(value) => {
                                          const updated = [...variants];
                                          updated[index].type = value;
                                          setVariants(updated);
                                        }}
                                      >
                                        <SelectTrigger className="h-9">
                                          <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="finial">Finial</SelectItem>
                                          <SelectItem value="bracket">Bracket</SelectItem>
                                          <SelectItem value="ring">Ring</SelectItem>
                                          <SelectItem value="end_cap">End Cap</SelectItem>
                                          <SelectItem value="connector">Connector</SelectItem>
                                          <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label className="text-xs">Quantity per {lengthLabel}</Label>
                                      <Input
                                        className="h-9"
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="e.g., 2"
                                        value={variant.quantityPerUnit || ''}
                                        onChange={(e) => {
                                          const updated = [...variants];
                                          updated[index].quantityPerUnit = parseFloat(e.target.value) || 0;
                                          setVariants(updated);
                                        }}
                                      />
                                    </div>

                                    <div className="col-span-2 p-3 bg-primary/5 rounded-md border border-primary/20">
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                          <span className="text-muted-foreground">Item Price:</span>
                                          <span className="ml-2 font-medium">{currencySymbol}{selectedItem.selling_price || 0}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">Stock:</span>
                                          <span className="ml-2 font-medium">{selectedItem.quantity || 0} units</span>
                                        </div>
                                        <div className="col-span-2">
                                          <span className="text-muted-foreground">Cost per {lengthLabel}:</span>
                                          <span className="ml-2 font-medium">
                                            {currencySymbol}{((selectedItem.selling_price || 0) * (variant.quantityPerUnit || 0)).toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            ) : (
                              /* Manual Creation Mode */
                              <div className="grid gap-2 md:grid-cols-4">
                                <div>
                                  <Label className="text-xs">Type</Label>
                                  <Select
                                    value={variant.type}
                                    onValueChange={(value) => {
                                      const updated = [...variants];
                                      updated[index].type = value;
                                      setVariants(updated);
                                    }}
                                  >
                                    <SelectTrigger className="h-9">
                                      <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="finial">Finial</SelectItem>
                                      <SelectItem value="bracket">Bracket</SelectItem>
                                      <SelectItem value="color">Color</SelectItem>
                                      <SelectItem value="finish">Finish</SelectItem>
                                      <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-xs">Name</Label>
                                  <Input
                                    className="h-9"
                                    placeholder="e.g., Chrome Finial"
                                    value={variant.name}
                                    onChange={(e) => {
                                      const updated = [...variants];
                                      updated[index].name = e.target.value;
                                      setVariants(updated);
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">SKU (optional)</Label>
                                  <Input
                                    className="h-9"
                                    placeholder="Optional"
                                    value={variant.sku}
                                    onChange={(e) => {
                                      const updated = [...variants];
                                      updated[index].sku = e.target.value;
                                      setVariants(updated);
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Price + ({currencySymbol})</Label>
                                  <Input
                                    className="h-9"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={variant.priceModifier}
                                    onChange={(e) => {
                                      const updated = [...variants];
                                      updated[index].priceModifier = e.target.value;
                                      setVariants(updated);
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Delete Button */}
                            <div className="flex justify-end pt-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setVariants(variants.filter((_, i) => i !== index));
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Component
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setVariants([...variants, { 
                          type: '', 
                          name: '', 
                          sku: '', 
                          priceModifier: '',
                          source: 'inventory',
                          quantityPerUnit: 1
                        }])}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Component
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* VENDOR & STOCK TAB */}
              <TabsContent value="inventory" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      Vendor & Stock Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="vendor_id">Vendor</Label>
                        <Select 
                          value={formData.vendor_id} 
                          onValueChange={(value) => setFormData({ ...formData, vendor_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                          <SelectContent>
                            {vendors.map((vendor) => (
                              <SelectItem key={vendor.id} value={vendor.id}>
                                {vendor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="supplier">Supplier Name (Legacy)</Label>
                        <Input
                          id="supplier"
                          value={formData.supplier}
                          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                          placeholder="Supplier name"
                        />
                      </div>

                      <div>
                        <Label htmlFor="location">Storage Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g., Warehouse A - Shelf 12"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="track_inventory"
                        checked={trackInventory}
                        onCheckedChange={setTrackInventory}
                      />
                      <Label htmlFor="track_inventory" className="cursor-pointer">
                        Track inventory quantity
                      </Label>
                    </div>

                    {trackInventory && (
                      <div className="grid gap-4 md:grid-cols-2 pt-2">
                        <div>
                          <Label htmlFor="quantity">Current Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                            placeholder="100"
                          />
                        </div>

                        <div>
                          <Label htmlFor="reorder_point">Reorder Point</Label>
                          <Input
                            id="reorder_point"
                            type="number"
                            value={formData.reorder_point}
                            onChange={(e) => setFormData({ ...formData, reorder_point: parseInt(e.target.value) || 0 })}
                            placeholder="5"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Alert when quantity falls below this level
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex items-center justify-between pt-4">
            {mode === "edit" && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Item
              </Button>
            )}
            {mode === "create" && <div />}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {mode === "create" 
                  ? (createMutation.isPending ? "Creating..." : "Create Item")
                  : (updateMutation.isPending ? "Updating..." : "Update Item")}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
