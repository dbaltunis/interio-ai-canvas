import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Search, Package, Wrench, Layers, ArrowLeft, Plus, Minus, ShoppingCart, PenLine, Upload, X, Calendar, Clock } from "lucide-react";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useActiveServiceOptions, SERVICE_UNITS, type ServiceOption } from "@/hooks/useServiceOptions";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getCurrencySymbol } from "@/utils/formatCurrency";

interface ProductServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  projectId?: string;
  clientId?: string;
  onAddProducts: (products: SelectedProduct[]) => void;
  onCreateCalendarEvent?: (serviceDetails: CalendarEventRequest) => void;
}

export interface SelectedProduct {
  inventoryItemId: string;
  name: string;
  category: string;
  subcategory: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl: string | null;
  unit: string;
  description?: string;
  notes?: string;
  isCustom?: boolean;
  isServiceOption?: boolean;
  serviceOptionId?: string;
}

export interface CalendarEventRequest {
  title: string;
  description: string;
  durationMinutes: number;
  serviceCategory: string;
  projectId?: string;
  clientId?: string;
}

interface CustomItem {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  imageUrl: string | null;
  unit: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  hardware: <Wrench className="h-5 w-5" />,
  service: <Wrench className="h-5 w-5" />,
  fabric: <Layers className="h-5 w-5" />,
  material: <Layers className="h-5 w-5" />,
  wallcovering: <Layers className="h-5 w-5" />,
  custom: <PenLine className="h-5 w-5" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  hardware: "Hardware",
  service: "Services",
  fabric: "Fabrics",
  material: "Materials",
  wallcovering: "Wallcoverings",
  custom: "Custom Item",
};

const getUnitLabel = (unit: string) => {
  return SERVICE_UNITS.find(u => u.value === unit)?.label || unit;
};

export const ProductServiceDialog = ({
  isOpen,
  onClose,
  roomId,
  projectId,
  clientId,
  onAddProducts,
  onCreateCalendarEvent,
}: ProductServiceDialogProps) => {
  const [step, setStep] = useState<"category" | "browse" | "quantity" | "custom">("category");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedProduct>>(new Map());
  const [createCalendarEvents, setCreateCalendarEvents] = useState<Set<string>>(new Set());
  const [customItem, setCustomItem] = useState<CustomItem>({
    name: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    imageUrl: null,
    unit: "each",
  });

  const { data: inventoryItems = [], isLoading } = useEnhancedInventory();
  const { data: serviceOptions = [], isLoading: servicesLoading } = useActiveServiceOptions();
  const { units } = useMeasurementUnits();
  const currencySymbol = getCurrencySymbol(units.currency);

  // Always show all main categories, regardless of inventory content
  const categories = ['material', 'fabric', 'hardware', 'service', 'wallcovering', 'custom'];

  // Build unified items list: inventory items + service_options (for service category)
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'service') {
      // For services: merge service_options + inventory items with category='service'
      const inventoryServices = inventoryItems.filter(item => {
        const matchesCategory = item.category?.toLowerCase() === 'service';
        const matchesSearch = !searchQuery ||
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subcategory?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      }).map(item => ({
        ...item,
        _source: 'inventory' as const,
      }));

      const serviceOptionItems = serviceOptions.filter(svc => {
        const matchesSearch = !searchQuery ||
          svc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          svc.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
      }).map(svc => ({
        id: `svc-${svc.id}`,
        _serviceOption: svc,
        _source: 'service_option' as const,
        name: svc.name,
        category: 'service',
        subcategory: (svc as any).category || '',
        selling_price: svc.price,
        cost_price: (svc as any).cost_price || 0,
        image_url: null as string | null,
        unit: svc.unit,
        description: svc.description,
        is_schedulable: (svc as any).is_schedulable || false,
        estimated_duration_minutes: (svc as any).estimated_duration_minutes || 0,
      }));

      // Service options first, then inventory services
      return [...serviceOptionItems, ...inventoryServices];
    }

    return inventoryItems.filter(item => {
      const matchesCategory = item.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = !searchQuery ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subcategory?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [inventoryItems, serviceOptions, selectedCategory, searchQuery]);

  // Get unique subcategories for current category
  const subcategories = useMemo(() => {
    const subs = new Set<string>();
    filteredItems.forEach((item: any) => {
      if (item.subcategory) subs.add(item.subcategory);
    });
    return Array.from(subs).sort();
  }, [filteredItems]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    if (category === "custom") {
      setStep("custom");
    } else {
      setStep("browse");
    }
  };

  const handleItemToggle = (item: any) => {
    const newSelected = new Map(selectedItems);
    if (newSelected.has(item.id)) {
      newSelected.delete(item.id);
      // Remove from calendar events tracking
      const newCalendarEvents = new Set(createCalendarEvents);
      newCalendarEvents.delete(item.id);
      setCreateCalendarEvents(newCalendarEvents);
    } else {
      const price = item.selling_price || item.cost_price || 0;
      const isServiceOption = item._source === 'service_option';
      newSelected.set(item.id, {
        inventoryItemId: item.id,
        name: item.name,
        category: item.category,
        subcategory: item.subcategory || "",
        quantity: 1,
        unitPrice: price,
        totalPrice: price,
        imageUrl: item.image_url,
        unit: item.unit || "each",
        description: item.description || "",
        isCustom: isServiceOption, // Service options are added as custom room products
        isServiceOption,
        serviceOptionId: isServiceOption ? item._serviceOption?.id : undefined,
      });

      // Auto-enable calendar event for schedulable services
      if (item.is_schedulable) {
        const newCalendarEvents = new Set(createCalendarEvents);
        newCalendarEvents.add(item.id);
        setCreateCalendarEvents(newCalendarEvents);
      }
    }
    setSelectedItems(newSelected);
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const newSelected = new Map(selectedItems);
    const item = newSelected.get(itemId);
    if (item) {
      item.quantity = Math.max(0.01, quantity);
      item.totalPrice = item.quantity * item.unitPrice;
      newSelected.set(itemId, item);
      setSelectedItems(newSelected);
    }
  };

  const toggleCalendarEvent = (itemId: string) => {
    const newCalendarEvents = new Set(createCalendarEvents);
    if (newCalendarEvents.has(itemId)) {
      newCalendarEvents.delete(itemId);
    } else {
      newCalendarEvents.add(itemId);
    }
    setCreateCalendarEvents(newCalendarEvents);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomItem(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomItem = () => {
    if (!customItem.name || customItem.unitPrice <= 0) return;

    const customProduct: SelectedProduct = {
      inventoryItemId: `custom-${Date.now()}`,
      name: customItem.name,
      category: "custom",
      subcategory: "",
      quantity: customItem.quantity,
      unitPrice: customItem.unitPrice,
      totalPrice: customItem.quantity * customItem.unitPrice,
      imageUrl: customItem.imageUrl,
      unit: customItem.unit,
      description: customItem.description,
      notes: customItem.description,
      isCustom: true,
    };

    onAddProducts([customProduct]);
    handleClose();
  };

  const handleConfirm = () => {
    const products = Array.from(selectedItems.values());
    onAddProducts(products);

    // Create calendar events for schedulable services
    if (onCreateCalendarEvent) {
      products.forEach(product => {
        if (createCalendarEvents.has(product.inventoryItemId) && product.isServiceOption) {
          // Find the original service option for duration info
          const svcItem = filteredItems.find((item: any) => item.id === product.inventoryItemId) as any;
          onCreateCalendarEvent({
            title: product.name,
            description: product.description || `${product.name} service`,
            durationMinutes: svcItem?.estimated_duration_minutes || 60,
            serviceCategory: product.subcategory || 'service',
            projectId,
            clientId,
          });
        }
      });
    }

    handleClose();
  };

  const handleClose = () => {
    setStep("category");
    setSelectedCategory("");
    setSearchQuery("");
    setSelectedItems(new Map());
    setCreateCalendarEvents(new Set());
    setCustomItem({
      name: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      imageUrl: null,
      unit: "each",
    });
    onClose();
  };

  const handleBack = () => {
    if (step === "quantity") {
      setStep("browse");
    } else if (step === "browse" || step === "custom") {
      setStep("category");
      setSelectedCategory("");
      setSearchQuery("");
    }
  };

  const totalSelected = selectedItems.size;
  const grandTotal = Array.from(selectedItems.values()).reduce(
    (sum, item) => sum + item.totalPrice, 0
  );

  const customTotal = customItem.quantity * customItem.unitPrice;

  const isLoadingItems = selectedCategory === 'service' ? (isLoading || servicesLoading) : isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step !== "category" && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {step === "category" && "Add Product or Service"}
            {step === "browse" && `Select ${CATEGORY_LABELS[selectedCategory] || selectedCategory}`}
            {step === "quantity" && "Set Quantities"}
            {step === "custom" && "Create Custom Item"}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Category Selection */}
        {step === "category" && (
          <div className="grid grid-cols-2 gap-4 py-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                className={`h-24 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 ${
                  category === "custom" ? "border-dashed" : ""
                }`}
                onClick={() => handleCategorySelect(category)}
              >
                {CATEGORY_ICONS[category] || <Package className="h-5 w-5" />}
                <span className="font-medium">{CATEGORY_LABELS[category] || category}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Custom Item Form */}
        {step === "custom" && (
          <div className="flex flex-col gap-4 py-4">
            {/* Image Upload */}
            <div className="flex items-start gap-4">
              <div className="relative">
                {customItem.imageUrl ? (
                  <div className="relative w-24 h-24">
                    <img
                      src={customItem.imageUrl}
                      alt="Custom item"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => setCustomItem(prev => ({ ...prev, imageUrl: null }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <label className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <Label htmlFor="custom-name">Title *</Label>
                  <Input
                    id="custom-name"
                    placeholder="Item name"
                    value={customItem.name}
                    onChange={(e) => setCustomItem(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="custom-unit">Unit</Label>
                  <Input
                    id="custom-unit"
                    placeholder="e.g., each, meter, hour"
                    value={customItem.unit}
                    onChange={(e) => setCustomItem(prev => ({ ...prev, unit: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="custom-description">Description</Label>
              <Textarea
                id="custom-description"
                placeholder="Optional description..."
                value={customItem.description}
                onChange={(e) => setCustomItem(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="custom-quantity">Quantity</Label>
                <Input
                  id="custom-quantity"
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={customItem.quantity}
                  onChange={(e) => setCustomItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="custom-price">Price per {customItem.unit || "unit"}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {currencySymbol}
                  </span>
                  <Input
                    id="custom-price"
                    type="number"
                    min={0}
                    step={0.01}
                    value={customItem.unitPrice}
                    onChange={(e) => setCustomItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label>Total</Label>
                <div className="h-10 px-3 flex items-center bg-muted rounded-md font-medium">
                  {currencySymbol}{customTotal.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleAddCustomItem}
                disabled={!customItem.name || customItem.unitPrice <= 0}
              >
                Add to Room
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Browse & Select Items */}
        {step === "browse" && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={selectedCategory === 'service' ? "Search services..." : "Search items..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Subcategory Tabs */}
            {subcategories.length > 1 && (
              <Tabs defaultValue="all" className="mb-4">
                <TabsList className="w-full flex-wrap h-auto gap-1">
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                  {subcategories.slice(0, 6).map((sub) => (
                    <TabsTrigger key={sub} value={sub} className="text-xs capitalize">
                      {sub.replace(/_/g, " ")}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}

            {/* Items Grid */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              {isLoadingItems ? (
                <div className="grid grid-cols-1 gap-2 pb-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="w-12 h-12 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {selectedCategory === 'service' ? (
                    <div>
                      <Wrench className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p>No services found.</p>
                      <p className="text-xs mt-1">Create services in Settings &gt; Products &gt; Services</p>
                    </div>
                  ) : (
                    <p>No items found in this category.</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 pb-4">
                  {/* Section header for service options */}
                  {selectedCategory === 'service' && serviceOptions.length > 0 && (
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1 pt-1 pb-0.5">
                      Your Services
                    </div>
                  )}
                  {filteredItems.map((item: any) => {
                    const isSelected = selectedItems.has(item.id);
                    const price = item.selling_price || item.cost_price || 0;
                    const isServiceOption = item._source === 'service_option';
                    const isSchedulable = item.is_schedulable;

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleItemToggle(item)}
                      >
                        <Checkbox checked={isSelected} className="pointer-events-none" />

                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            {CATEGORY_ICONS[selectedCategory] || <Package className="h-5 w-5 text-muted-foreground" />}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            {item.subcategory && (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {item.subcategory.replace(/_/g, " ")}
                              </Badge>
                            )}
                            {isSchedulable && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="h-3 w-3 mr-0.5" />
                                Schedulable
                              </Badge>
                            )}
                            {item.estimated_duration_minutes > 0 && (
                              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                <Clock className="h-3 w-3" />
                                {item.estimated_duration_minutes}min
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="font-medium">
                            {currencySymbol}{price.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isServiceOption ? getUnitLabel(item.unit).toLowerCase() : `per ${item.unit || "each"}`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Selected Items Footer */}
            {totalSelected > 0 && (
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-sm font-medium">{totalSelected} selected</span>
                </div>
                <Button onClick={() => setStep("quantity")}>
                  Set Quantities
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Quantity Entry */}
        {step === "quantity" && (
          <div className="flex flex-col flex-1 min-h-0">
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-3 pb-4">
                {Array.from(selectedItems.values()).map((item) => {
                  const itemId = item.inventoryItemId;
                  const svcItem = filteredItems.find((fi: any) => fi.id === itemId) as any;
                  const isSchedulable = svcItem?.is_schedulable;
                  const wantsCalendarEvent = createCalendarEvents.has(itemId);

                  return (
                    <div
                      key={itemId}
                      className="p-3 rounded-lg border border-border space-y-2"
                    >
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {currencySymbol}{item.unitPrice.toFixed(2)} per {item.unit}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(itemId, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(itemId, parseFloat(e.target.value) || 1)}
                            className="w-16 text-center"
                            min={0.01}
                            step={0.01}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(itemId, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-right min-w-[80px]">
                          <div className="font-medium">
                            {currencySymbol}{item.totalPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Calendar event toggle for schedulable services */}
                      {isSchedulable && onCreateCalendarEvent && (
                        <div className="flex items-center gap-2 pl-[60px] pt-1 border-t border-dashed">
                          <Switch
                            id={`cal-${itemId}`}
                            checked={wantsCalendarEvent}
                            onCheckedChange={() => toggleCalendarEvent(itemId)}
                          />
                          <Label htmlFor={`cal-${itemId}`} className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer">
                            <Calendar className="h-3 w-3" />
                            Create calendar event
                            {svcItem?.estimated_duration_minutes > 0 && (
                              <span>({svcItem.estimated_duration_minutes}min)</span>
                            )}
                          </Label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Total & Confirm */}
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div>
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-xl font-bold">
                  {currencySymbol}{grandTotal.toFixed(2)}
                </div>
                {createCalendarEvents.size > 0 && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {createCalendarEvents.size} calendar event(s) will be created
                  </div>
                )}
              </div>
              <Button onClick={handleConfirm} size="lg">
                Add to Room
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
