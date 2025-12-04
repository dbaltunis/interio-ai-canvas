import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, DollarSign, Ruler, Package, Store, Trash2, ImageIcon, Upload, X, QrCode } from "lucide-react";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { InventoryTrackingInfo } from "./InventoryTrackingInfo";
import { useToast } from "@/hooks/use-toast";
import { useCreateEnhancedInventoryItem, useUpdateEnhancedInventoryItem, useDeleteEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { useVendors } from "@/hooks/useVendors";
import { useUserRole } from "@/hooks/useUserRole";
import { FieldHelp } from "@/components/ui/field-help";
import { supabase } from "@/integrations/supabase/client";
import { useBusinessSettings, defaultMeasurementUnits } from "@/hooks/useBusinessSettings";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { usePricingGrids } from "@/hooks/usePricingGrids";
import { ColorSelector } from "./ColorSelector";
import { ColorSlatPreview, getColorHex } from "./ColorSlatPreview";
import { COLOR_PALETTE } from "@/constants/inventoryCategories";

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
  const [pricingMethod, setPricingMethod] = useState<'grid' | 'linear' | 'fixed'>('linear');
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
  const { data: pricingGrids = [] } = usePricingGrids();

  // Get user's measurement units and currency
  const measurementUnits = businessSettings?.measurement_units 
    ? (typeof businessSettings.measurement_units === 'string' 
        ? JSON.parse(businessSettings.measurement_units) 
        : businessSettings.measurement_units)
    : defaultMeasurementUnits;
  
  const currency = userPreferences?.currency || measurementUnits.currency || 'USD';
  const lengthUnit = measurementUnits.fabric || measurementUnits.length || 'm';
  
  const currencySymbols: Record<string, string> = {
    'NZD': 'NZ$',
    'AUD': 'A$',
    'USD': '$',
    'GBP': '£',
    'EUR': '€',
    'ZAR': 'R'
  };
  const currencySymbol = currencySymbols[currency] || currency;
  
  const getPricingUnitLabel = () => {
    if (lengthUnit === 'mm') return 'running meter';
    if (lengthUnit === 'cm') return 'running meter';
    if (lengthUnit === 'm') return 'running meter';
    if (lengthUnit === 'inches') return 'running foot';
    if (lengthUnit === 'feet') return 'running foot';
    if (lengthUnit === 'yards') return 'running yard';
    return lengthUnit;
  };
  const pricingUnitLabel = getPricingUnitLabel();

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
    price_per_meter: 0, // For linear pricing (fabric pricing per running meter/yard)
    supplier: "",
    vendor_id: "",
    collection_id: null as string | null,
    location: "",
    reorder_point: 5,
    fabric_width: 0,
    pattern_repeat_vertical: 0,
    pattern_repeat_horizontal: 0,
    fabric_composition: "",
    collection_name: "",
    color: "",
    image_url: "",
    hardware_finish: "",
    hardware_material: "",
    pricing_grid_id: null as string | null, // Direct grid assignment
    product_category: null as string | null,
    price_group: null as string | null,
    tags: [] as string[],
    specifications: {} as Record<string, any>,
  });
  
  const [customColors, setCustomColors] = useState<Array<{ name: string; value: string; hex: string }>>([]);
  
  // Track which item we've initialized to prevent re-initialization on cache updates
  const initializedItemId = useRef<string | null>(null);

  // Load custom colors from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('custom_inventory_colors');
    if (stored) {
      try {
        setCustomColors(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse custom colors:', e);
      }
    }
  }, []);

  const handleCustomColorsChange = (colors: Array<{ name: string; value: string; hex: string }>) => {
    setCustomColors(colors);
    localStorage.setItem('custom_inventory_colors', JSON.stringify(colors));
  };

  // Main categories
  const MAIN_CATEGORIES = [
    { value: "fabric", label: "Fabrics" },
    { value: "material", label: "Blind Materials" },
    { value: "hardware", label: "Hardware" },
    { value: "wallcovering", label: "Wallcoverings" },
    { value: "service", label: "Services" }
  ];

  // Subcategories
  const SUBCATEGORIES: Record<string, { value: string; label: string }[]> = {
    fabric: [
      { value: "curtain_fabric", label: "Curtain & Roman Fabrics" },
      { value: "roller_fabric", label: "Roller Blind Fabrics" },
      { value: "cellular", label: "Cellular/Honeycomb" },
      { value: "vertical_fabric", label: "Vertical Blind Fabrics" },
      { value: "awning_fabric", label: "Awning Fabrics" },
      { value: "lining_fabric", label: "Lining Fabrics" },
    ],
    material: [
      { value: "venetian", label: "Venetian Blinds" },
      { value: "vertical", label: "Vertical Blinds" }
    ],
    hardware: [
      { value: "rod", label: "Rods/Poles" },
      { value: "track", label: "Tracks" },
      { value: "motor", label: "Motors" },
      { value: "bracket", label: "Brackets" },
      { value: "accessory", label: "Accessories" }
    ],
    wallcovering: [
      { value: "wallpaper", label: "Wallpaper" },
      { value: "vinyl", label: "Vinyl" },
      { value: "mural", label: "Murals" },
      { value: "other_wallcovering", label: "Other" }
    ],
    service: [
      { value: "installation", label: "Installation Services" },
      { value: "fitting", label: "Fitting Services" },
      { value: "other_service", label: "Other Services" }
    ]
  };

  const subcategories = SUBCATEGORIES[formData.category] || [];
  const isFabric = formData.category === "fabric";

  // Load data on mount - only initialize once per item
  useEffect(() => {
    if (mode === "create" && open) {
      // Reset the initialized item tracking for create mode
      initializedItemId.current = null;
      
      const savedDraft = localStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setFormData(parsed.formData);
          setTrackInventory(parsed.trackInventory);
          setActiveTab(parsed.activeTab || "basic");
        } catch (e) {
          console.error("Failed to parse draft data", e);
        }
      } else if (initialCategory || initialSubcategory) {
        setFormData(prev => ({
          ...prev,
          category: initialCategory || prev.category,
          subcategory: initialSubcategory || prev.subcategory,
        }));
      }
    } else if (mode === "edit" && item && open) {
      // Only initialize form if this is a different item than we already loaded
      // This prevents resetting form data when query cache updates after save
      if (initializedItemId.current === item.id) {
        return; // Already initialized this item, don't reset
      }
      
      initializedItemId.current = item.id;
      
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
        price_per_meter: item.price_per_meter || item.selling_price || 0, // Use price_per_meter or fallback to selling_price
        supplier: item.supplier || "",
        vendor_id: item.vendor_id || "",
        collection_id: item.collection_id || null,
        location: item.location || "",
        reorder_point: item.reorder_point || 5,
        fabric_width: item.fabric_width || 0,
        pattern_repeat_vertical: item.pattern_repeat_vertical || 0,
        pattern_repeat_horizontal: item.pattern_repeat_horizontal || 0,
        fabric_composition: item.fabric_composition || "",
        collection_name: item.collection_name || "",
        color: item.color || "",
        image_url: item.image_url || "",
        hardware_finish: item.hardware_finish || "",
        hardware_material: item.hardware_material || "",
        pricing_grid_id: item.pricing_grid_id || null,
        product_category: item.product_category || null,
        price_group: item.price_group || null,
        tags: item.tags || [],
        specifications: item.specifications || {},
      });
      
      // Detect pricing method from item data
      if (item.pricing_grid_id || item.price_group) {
        setPricingMethod('grid');
      } else if (item.category === 'fabric' || item.category === 'material') {
        setPricingMethod('linear');
      } else {
        setPricingMethod('fixed');
      }
      
      setTrackInventory(item.quantity > 0);
    }
    
    // Reset tracking when dialog closes
    if (!open) {
      initializedItemId.current = null;
    }
  }, [mode, item?.id, open, initialCategory, initialSubcategory]);

  // Auto-save draft - save if any meaningful data exists (category, subcategory, or name)
  const saveDraft = useCallback(() => {
    const hasMeaningfulData = formData.name || formData.category || formData.subcategory;
    if (mode === "create" && open && hasMeaningfulData) {
      const draftData = { formData, trackInventory, activeTab, timestamp: Date.now() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
    }
  }, [mode, open, formData, trackInventory, activeTab]);

  useEffect(() => {
    const interval = setInterval(saveDraft, 2000);
    return () => clearInterval(interval);
  }, [saveDraft]);

  // Image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🖼️ handleImageUpload triggered');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    console.log('📁 File selected:', file.name, file.size, file.type);

    try {
      setUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `inventory/${fileName}`;

      console.log('⬆️ Uploading to Supabase storage:', filePath);

      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ Upload successful, getting public URL');

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      console.log('🔗 Public URL:', publicUrl);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      console.log('✅ FormData updated with image_url');
      toast({ title: "Image uploaded successfully" });
    } catch (error: any) {
      console.error('💥 Image upload error:', error);
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => setFormData(prev => ({ ...prev, image_url: "" }));

  // Profit calculations
  const profitPerUnit = formData.selling_price - formData.cost_price;
  const markupPercentage = formData.cost_price > 0 ? ((formData.selling_price - formData.cost_price) / formData.cost_price) * 100 : 0;
  const marginPercentage = formData.selling_price > 0 ? ((formData.selling_price - formData.cost_price) / formData.selling_price) * 100 : 0;

  const getMarginColor = () => {
    if (marginPercentage >= 30) return "text-green-600";
    if (marginPercentage >= 15) return "text-yellow-600";
    return "text-red-600";
  };

  // Form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    console.log('🟡 handleSubmit called');
    console.log('📋 Current formData at submit time:', JSON.stringify(formData, null, 2));
    e?.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      toast({ title: "Error", description: "Product name is required", variant: "destructive" });
      return;
    }
    if (!formData.category) {
      toast({ title: "Error", description: "Category is required", variant: "destructive" });
      return;
    }
    if (!formData.subcategory) {
      toast({ title: "Error", description: "Subcategory is required", variant: "destructive" });
      return;
    }

    // Auto-generate SKU if not provided
    const generatedSku = formData.sku || `${formData.category.toUpperCase().substring(0, 3)}-${Date.now().toString().slice(-6)}`;

    const itemData = {
      ...formData,
      name: formData.name.trim(),
      sku: generatedSku,
      quantity: trackInventory ? formData.quantity : 0,
      // Ensure empty strings become null for UUID fields
      pricing_grid_id: formData.pricing_grid_id || null,
      product_category: formData.product_category || null,
      price_group: formData.price_group || null,
      vendor_id: formData.vendor_id || null,
      collection_id: formData.collection_id || null,
      // Ensure numeric fields are properly set
      cost_price: Number(formData.cost_price) || 0,
      selling_price: Number(formData.selling_price) || 0,
      // CRITICAL: Save price_per_meter for linear pricing (fabric pricing)
      price_per_meter: pricingMethod === 'linear' ? Number(formData.selling_price) || 0 : (formData.price_per_meter || null),
      fabric_width: Number(formData.fabric_width) || null,
      pattern_repeat_vertical: Number(formData.pattern_repeat_vertical) || null,
      pattern_repeat_horizontal: Number(formData.pattern_repeat_horizontal) || null,
      // Ensure tags array is included
      tags: Array.isArray(formData.tags) ? formData.tags : [],
    };

    console.log('🔍 Submitting inventory item:', JSON.stringify(itemData, null, 2));

    try {
      if (mode === "create") {
        console.log('📤 Calling create mutation...');
        const result = await createMutation.mutateAsync(itemData);
        console.log('✅ Create mutation result:', result);
        localStorage.removeItem(STORAGE_KEY);
        toast({ title: "Item created successfully" });
      } else {
        console.log('📤 Calling update mutation...');
        const result = await updateMutation.mutateAsync({ id: item.id, ...itemData });
        console.log('✅ Update mutation result:', result);
        
        // Update form state with DB result to prevent stale data on reopen
        setFormData(prev => ({
          ...prev,
          name: result.name || "",
          description: result.description || "",
          sku: result.sku || "",
          category: result.category || "fabric",
          subcategory: result.subcategory || "",
          quantity: result.quantity || 0,
          unit: result.unit || "meters",
          cost_price: result.cost_price || 0,
          selling_price: result.selling_price || 0,
          price_per_meter: result.price_per_meter || 0,
          reorder_point: result.reorder_point || 0,
          location: result.location || "",
          vendor_id: result.vendor_id || "",
          image_url: result.image_url || "",
          color: result.color || "",
          tags: result.tags || [],
          active: result.active ?? true,
        }));
        
        // Update tracking to prevent useEffect from overwriting
        initializedItemId.current = result.id;
        
        toast({ title: "Item updated successfully" });
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('❌ Save error:', error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteMutation.mutateAsync(item.id);
      toast({ title: "Item deleted successfully" });
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New Inventory Item" : "Edit Inventory Item"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new product or service to your inventory" : "Update inventory item details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* Category Selection */}
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value, subcategory: "" }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAIN_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {subcategories.length > 0 && (
                  <div>
                    <Label>Subcategory</Label>
                    <Select
                      value={formData.subcategory}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, subcategory: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories.map(sub => (
                          <SelectItem key={sub.value} value={sub.value}>{sub.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {formData.subcategory && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="pricing_method">Pricing</TabsTrigger>
                <TabsTrigger value="product_details">Details</TabsTrigger>
                <TabsTrigger value="inventory">Stock</TabsTrigger>
                {mode === "edit" && <TabsTrigger value="qrcode">QR</TabsTrigger>}
              </TabsList>

              {/* BASIC INFO TAB */}
              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Luxury Velvet Navy"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="sku">SKU (Optional)</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                        placeholder="e.g., LVN-001"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Auto-generated if left blank. Shared across color variants.</p>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Product description..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={formData.tags.join(', ')}
                        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) }))}
                        placeholder="e.g., plain, linen, luxury"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <ColorSelector
                        selectedColors={formData.tags.filter(tag => {
                          const isPredefinedColor = COLOR_PALETTE.some(c => c.value === tag);
                          const isCustomColor = customColors.some(c => c.value === tag);
                          return isPredefinedColor || isCustomColor;
                        })}
                        onChange={(colors) => {
                          const allColorValues = [
                            ...COLOR_PALETTE.map(c => c.value),
                            ...customColors.map(c => c.value)
                          ];
                          setFormData(prev => {
                            const nonColorTags = prev.tags.filter(tag => !allColorValues.includes(tag));
                            return { ...prev, tags: [...nonColorTags, ...colors] };
                          });
                        }}
                        customColors={customColors}
                        onCustomColorsChange={handleCustomColorsChange}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* PRICING METHOD TAB */}
              <TabsContent value="pricing_method" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pricing Method</CardTitle>
                    <CardDescription>Choose how this product will be priced</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Context-aware pricing method buttons - hide Grid for fabric subcategories */}
                    {(() => {
                      const isFabricSubcategory = ['curtain_fabric', 'lining_fabric', 'roman_fabric', 'upholstery_fabric', 'sheer_fabric'].includes(formData.subcategory);
                      const showGridOption = !isFabricSubcategory;
                      
                      return (
                        <div className={`grid gap-3 ${showGridOption ? 'grid-cols-3' : 'grid-cols-2'}`}>
                          {showGridOption && (
                            <button
                              type="button"
                              onClick={() => setPricingMethod('grid')}
                              className={`p-4 border-2 rounded-lg text-left transition-all ${
                                pricingMethod === 'grid' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="font-medium mb-1">Pricing Grid</div>
                              <div className="text-xs text-muted-foreground">For blinds/shutters</div>
                            </button>
                          )}
                          
                          <button
                            type="button"
                            onClick={() => setPricingMethod('linear')}
                            className={`p-4 border-2 rounded-lg text-left transition-all ${
                              pricingMethod === 'linear' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="font-medium mb-1">Per {pricingUnitLabel}</div>
                            <div className="text-xs text-muted-foreground">For curtains/fabrics</div>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setPricingMethod('fixed')}
                            className={`p-4 border-2 rounded-lg text-left transition-all ${
                              pricingMethod === 'fixed' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="font-medium mb-1">Fixed Price</div>
                            <div className="text-xs text-muted-foreground">Per piece/roll</div>
                          </button>
                        </div>
                      );
                    })()}

                    {pricingMethod === 'grid' && (
                      <div className="space-y-4 p-4 border rounded-lg">
                        <Alert>
                          <AlertDescription>
                            Select which pricing grid to use for this fabric/material. When this item is selected in job creation, prices will be looked up from the assigned grid.
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-3">
                          <div>
                            <Label>Select Pricing Grid</Label>
                            <Select
                              value={formData.pricing_grid_id || undefined}
                              onValueChange={(value) => setFormData(prev => ({ ...prev, pricing_grid_id: value === 'none' ? null : value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Choose a pricing grid" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {pricingGrids.map(grid => (
                                  <SelectItem key={grid.id} value={grid.id}>
                                    {grid.name} {grid.markup_percentage ? `(+${grid.markup_percentage}% markup)` : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {pricingGrids.length === 0 && (
                              <p className="text-xs text-amber-600 mt-1">
                                ⚠️ No pricing grids found. Upload grids in Settings → Products → Pricing Grids
                              </p>
                            )}
                            {formData.pricing_grid_id && (
                              <p className="text-xs text-green-600 mt-1">
                                ✓ Grid assigned - prices will be calculated automatically during job creation
                              </p>
                            )}
                          </div>
                          
                          {/* Inline Grid Preview */}
                          {formData.pricing_grid_id && (() => {
                            const selectedGrid = pricingGrids.find(g => g.id === formData.pricing_grid_id);
                            const gridData = selectedGrid?.grid_data as { widthRanges?: string[]; dropRanges?: string[]; prices?: number[][] } | null;
                            
                            if (!gridData?.widthRanges || !gridData?.dropRanges || !gridData?.prices) {
                              return (
                                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                                  Grid data not available for preview
                                </div>
                              );
                            }
                            
                            // Show compact preview (first 5 columns and rows)
                            const maxCols = Math.min(gridData.widthRanges.length, 5);
                            const maxRows = Math.min(gridData.dropRanges.length, 5);
                            
                            return (
                              <div className="border rounded-lg overflow-hidden">
                                <div className="bg-muted/50 px-3 py-1.5 border-b flex justify-between items-center">
                                  <span className="text-xs font-medium">{selectedGrid?.name} Preview</span>
                                  <span className="text-xs text-muted-foreground">
                                    {gridData.dropRanges.length} × {gridData.widthRanges.length} prices
                                  </span>
                                </div>
                                <div className="overflow-auto max-h-48">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="bg-muted/30">
                                        <th className="px-2 py-1 text-left border-r font-medium">Drop/Width</th>
                                        {gridData.widthRanges.slice(0, maxCols).map((w, i) => (
                                          <th key={i} className="px-2 py-1 text-center font-medium">{w}</th>
                                        ))}
                                        {gridData.widthRanges.length > maxCols && (
                                          <th className="px-2 py-1 text-center text-muted-foreground">...</th>
                                        )}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {gridData.dropRanges.slice(0, maxRows).map((d, di) => (
                                        <tr key={di} className="border-t">
                                          <td className="px-2 py-1 font-medium bg-muted/20 border-r">{d}</td>
                                          {gridData.prices[di]?.slice(0, maxCols).map((p, pi) => (
                                            <td key={pi} className="px-2 py-1 text-center">${p}</td>
                                          ))}
                                          {gridData.widthRanges.length > maxCols && (
                                            <td className="px-2 py-1 text-center text-muted-foreground">...</td>
                                          )}
                                        </tr>
                                      ))}
                                      {gridData.dropRanges.length > maxRows && (
                                        <tr className="border-t">
                                          <td className="px-2 py-1 text-muted-foreground" colSpan={maxCols + 2}>
                                            ... {gridData.dropRanges.length - maxRows} more rows
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {pricingMethod === 'linear' && (
                      <div className="space-y-4 p-4 border rounded-lg">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label>Cost Price ({currencySymbol} per {pricingUnitLabel})</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.cost_price || ""}
                              onChange={(e) => setFormData(prev => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
                              placeholder="20.00"
                            />
                          </div>

                          <div>
                            <Label>Selling Price ({currencySymbol} per {pricingUnitLabel})</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.selling_price || ""}
                              onChange={(e) => setFormData(prev => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))}
                              placeholder="40.00"
                            />
                          </div>
                        </div>

                        {canViewMarkup && formData.cost_price > 0 && formData.selling_price > 0 && (
                          <div className="grid gap-3 md:grid-cols-3 p-3 bg-muted/50 rounded">
                            <div>
                              <div className="text-xs text-muted-foreground">Profit</div>
                              <div className="text-lg font-bold">{currencySymbol}{profitPerUnit.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Markup %</div>
                              <div className="text-lg font-bold">{markupPercentage.toFixed(1)}%</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Margin %</div>
                              <div className={`text-lg font-bold ${getMarginColor()}`}>
                                {marginPercentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {pricingMethod === 'fixed' && (
                      <div className="space-y-4 p-4 border rounded-lg">
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <Label>Unit</Label>
                            <Select 
                              value={formData.unit} 
                              onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pieces">Pieces</SelectItem>
                                <SelectItem value="rolls">Rolls</SelectItem>
                                <SelectItem value="meters">Meters</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Cost Price ({currencySymbol})</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.cost_price || ""}
                              onChange={(e) => setFormData(prev => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
                              placeholder="20.00"
                            />
                          </div>

                          <div>
                            <Label>Selling Price ({currencySymbol})</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={formData.selling_price || ""}
                              onChange={(e) => setFormData(prev => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))}
                              placeholder="40.00"
                            />
                          </div>
                        </div>

                        {canViewMarkup && formData.cost_price > 0 && formData.selling_price > 0 && (
                          <div className="grid gap-3 md:grid-cols-3 p-3 bg-muted/50 rounded">
                            <div>
                              <div className="text-xs text-muted-foreground">Profit</div>
                              <div className="text-lg font-bold">{currencySymbol}{profitPerUnit.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Markup %</div>
                              <div className="text-lg font-bold">{markupPercentage.toFixed(1)}%</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Margin %</div>
                              <div className={`text-lg font-bold ${getMarginColor()}`}>
                                {marginPercentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* PRODUCT DETAILS TAB */}
              <TabsContent value="product_details" className="space-y-4">
                {/* Fabric Details */}
                {isFabric && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Fabric Specifications</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Fabric Width (cm)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.fabric_width || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, fabric_width: parseFloat(e.target.value) || 0 }))}
                          placeholder="140"
                        />
                      </div>

                      <div>
                        <Label>Composition</Label>
                        <Input
                          value={formData.fabric_composition}
                          onChange={(e) => setFormData(prev => ({ ...prev, fabric_composition: e.target.value }))}
                          placeholder="e.g., 100% Polyester"
                        />
                      </div>

                      <div>
                        <Label>Collection</Label>
                        <Input
                          value={formData.collection_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, collection_name: e.target.value }))}
                          placeholder="Collection name"
                        />
                      </div>

                      <div>
                        <Label>Pattern Repeat - Vertical (cm)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.pattern_repeat_vertical || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, pattern_repeat_vertical: parseFloat(e.target.value) || 0 }))}
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <Label>Pattern Repeat - Horizontal (cm)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.pattern_repeat_horizontal || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, pattern_repeat_horizontal: parseFloat(e.target.value) || 0 }))}
                          placeholder="0"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label>Product Image</Label>
                        {formData.image_url ? (
                          <div className="relative">
                            <img 
                              src={formData.image_url} 
                              alt="Product" 
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
                          <div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                console.log('🔵 Upload button clicked');
                                document.getElementById('image-upload')?.click();
                              }}
                              disabled={uploadingImage}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {uploadingImage ? 'Uploading...' : 'Upload Image'}
                            </Button>
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageUpload}
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Blind Materials Details - Product Preview Only */}
                {formData.category === 'material' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Preview</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Slat width and material type are configured via template options during quote creation
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <Label>Product Preview</Label>
                        <div className="space-y-3">
                          {/* Auto-generated slat/vane preview from colors */}
                          {(() => {
                            const materialSelectedColors = formData.tags.filter(tag => 
                              COLOR_PALETTE.some(c => c.value === tag) || customColors.some(c => c.value === tag)
                            );
                            if (materialSelectedColors.length > 0 && !formData.image_url) {
                              return (
                                <div className="space-y-2">
                                  <ColorSlatPreview 
                                    hexColor={getColorHex(materialSelectedColors[0], [...COLOR_PALETTE], customColors)}
                                    slatWidth={formData.specifications?.slat_width || (formData.subcategory === 'vertical' ? 89 : 50)}
                                    materialType={formData.specifications?.material_type}
                                    orientation={formData.subcategory === 'vertical' ? 'vertical' : 'horizontal'}
                                    showLabel
                                    size="lg"
                                  />
                                  <p className="text-xs text-muted-foreground text-center">
                                    Auto-generated from first selected color
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          })()}
                          
                          {/* Uploaded image */}
                          {formData.image_url ? (
                            <div className="relative">
                              <img src={formData.image_url} alt="Product" className="w-full h-32 object-cover rounded-md border" />
                              <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={removeImage}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()} disabled={uploadingImage}>
                                <Upload className="h-4 w-4 mr-2" />
                                {uploadingImage ? 'Uploading...' : formData.tags.some(tag => COLOR_PALETTE.some(c => c.value === tag) || customColors.some(c => c.value === tag)) ? 'Override with Custom Image' : 'Upload Image'}
                              </Button>
                              <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Hardware Details */}
                {formData.category === 'hardware' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Hardware Specifications</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Mounting Type</Label>
                        <Select
                          value={formData.specifications?.mounting_type || ""}
                          onValueChange={(value) => setFormData(prev => ({ 
                            ...prev, 
                            specifications: { ...prev.specifications, mounting_type: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wall">Wall Mount</SelectItem>
                            <SelectItem value="ceiling">Ceiling Mount</SelectItem>
                            <SelectItem value="top_fix">Top Fix</SelectItem>
                            <SelectItem value="face_fix">Face Fix</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Weight Capacity (kg)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.specifications?.weight_capacity || ""}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            specifications: { ...prev.specifications, weight_capacity: parseFloat(e.target.value) || 0 }
                          }))}
                          placeholder="e.g., 15"
                        />
                      </div>

                      <div>
                        <Label>Material</Label>
                        <Input
                          value={formData.specifications?.material || ""}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            specifications: { ...prev.specifications, material: e.target.value }
                          }))}
                          placeholder="e.g., Stainless Steel"
                        />
                      </div>

                      <div>
                        <Label>Finish/Color</Label>
                        <Input
                          value={formData.specifications?.finish || ""}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            specifications: { ...prev.specifications, finish: e.target.value }
                          }))}
                          placeholder="e.g., Brushed Nickel"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label>Product Image</Label>
                        {formData.image_url ? (
                          <div className="relative">
                            <img src={formData.image_url} alt="Product" className="w-full h-32 object-cover rounded-md border" />
                            <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={removeImage}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()} disabled={uploadingImage}>
                              <Upload className="h-4 w-4 mr-2" />
                              {uploadingImage ? 'Uploading...' : 'Upload Image'}
                            </Button>
                            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Wallcoverings Details */}
                {formData.category === 'wallcovering' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Wallcovering Specifications</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Roll Width (cm)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.specifications?.roll_width || ""}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            specifications: { ...prev.specifications, roll_width: parseFloat(e.target.value) || 0 }
                          }))}
                          placeholder="e.g., 52"
                        />
                      </div>

                      <div>
                        <Label>Roll Length (m)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.specifications?.roll_length || ""}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            specifications: { ...prev.specifications, roll_length: parseFloat(e.target.value) || 0 }
                          }))}
                          placeholder="e.g., 10"
                        />
                      </div>

                      <div>
                        <Label>Pattern Repeat (cm)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={formData.specifications?.pattern_repeat || ""}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            specifications: { ...prev.specifications, pattern_repeat: parseFloat(e.target.value) || 0 }
                          }))}
                          placeholder="e.g., 64"
                        />
                      </div>

                      <div>
                        <Label>Match Type</Label>
                        <Select
                          value={formData.specifications?.match_type || ""}
                          onValueChange={(value) => setFormData(prev => ({ 
                            ...prev, 
                            specifications: { ...prev.specifications, match_type: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select match" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free_match">Free Match</SelectItem>
                            <SelectItem value="straight_match">Straight Match</SelectItem>
                            <SelectItem value="offset_match">Offset/Drop Match</SelectItem>
                            <SelectItem value="reverse_hang">Reverse Hang</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <Label>Product Image</Label>
                        {formData.image_url ? (
                          <div className="relative">
                            <img src={formData.image_url} alt="Product" className="w-full h-32 object-cover rounded-md border" />
                            <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={removeImage}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload')?.click()} disabled={uploadingImage}>
                              <Upload className="h-4 w-4 mr-2" />
                              {uploadingImage ? 'Uploading...' : 'Upload Image'}
                            </Button>
                            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Services Details */}
                {formData.category === 'service' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Service Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Estimated Duration</Label>
                        <Input
                          value={formData.specifications?.duration || ""}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            specifications: { ...prev.specifications, duration: e.target.value }
                          }))}
                          placeholder="e.g., 2 hours"
                        />
                      </div>

                      <div>
                        <Label>Service Type</Label>
                        <Select
                          value={formData.specifications?.service_type || ""}
                          onValueChange={(value) => setFormData(prev => ({ 
                            ...prev, 
                            specifications: { ...prev.specifications, service_type: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="installation">Installation</SelectItem>
                            <SelectItem value="fitting">Fitting</SelectItem>
                            <SelectItem value="consultation">Consultation</SelectItem>
                            <SelectItem value="measurement">Measurement</SelectItem>
                            <SelectItem value="repair">Repair</SelectItem>
                            <SelectItem value="removal">Removal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2">
                        <Label>Requirements/Notes</Label>
                        <Textarea
                          value={formData.specifications?.requirements || ""}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            specifications: { ...prev.specifications, requirements: e.target.value }
                          }))}
                          placeholder="Any special requirements or notes for this service..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* VENDOR & STOCK TAB */}
              <TabsContent value="inventory" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Vendor & Stock</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Vendor</Label>
                        <Select 
                          value={formData.vendor_id} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, vendor_id: value }))}
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
                        <Label>Storage Location</Label>
                        <Input
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="e.g., Warehouse A"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="track_inventory"
                        checked={trackInventory}
                        onCheckedChange={setTrackInventory}
                      />
                      <Label htmlFor="track_inventory">Track inventory quantity</Label>
                    </div>

                    {trackInventory && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label>Current Quantity</Label>
                          <Input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                            placeholder="100"
                          />
                        </div>

                        <div>
                          <Label>Reorder Point</Label>
                          <Input
                            type="number"
                            value={formData.reorder_point}
                            onChange={(e) => setFormData(prev => ({ ...prev, reorder_point: parseInt(e.target.value) || 0 }))}
                            placeholder="5"
                          />
                        </div>
                      </div>
                    )}
                    
                    <InventoryTrackingInfo />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* QR CODE TAB */}
              {mode === "edit" && item?.id && (
                <TabsContent value="qrcode" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>QR Code</CardTitle>
                      <CardDescription>Scan to quickly access this item</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-8">
                      <QRCodeDisplay
                        itemId={item.id}
                        itemName={item.name}
                        size={256}
                        showActions={true}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
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
                Delete
              </Button>
            )}
            {mode === "create" && <div />}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit"
                onClick={(e) => {
                  console.log('🔴 Update button clicked');
                  e.preventDefault();
                  handleSubmit();
                }}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {mode === "create" ? "Create" : "Update"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
