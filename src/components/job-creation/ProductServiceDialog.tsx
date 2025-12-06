import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Package, Wrench, Layers, ArrowLeft, Plus, Minus, ShoppingCart } from "lucide-react";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { getCurrencySymbol } from "@/utils/formatCurrency";

interface ProductServiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  onAddProducts: (products: SelectedProduct[]) => void;
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
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  hardware: <Wrench className="h-5 w-5" />,
  service: <Package className="h-5 w-5" />,
  fabric: <Layers className="h-5 w-5" />,
  material: <Layers className="h-5 w-5" />,
  wallcovering: <Layers className="h-5 w-5" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  hardware: "Hardware",
  service: "Services",
  fabric: "Fabrics",
  material: "Materials",
  wallcovering: "Wallcoverings",
};

export const ProductServiceDialog = ({
  isOpen,
  onClose,
  roomId,
  onAddProducts,
}: ProductServiceDialogProps) => {
  const [step, setStep] = useState<"category" | "browse" | "quantity">("category");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedProduct>>(new Map());
  
  const { data: inventoryItems = [], isLoading } = useEnhancedInventory();
  const { units } = useMeasurementUnits();
  const currencySymbol = getCurrencySymbol(units.currency);

  // Get unique categories from inventory
  const categories = useMemo(() => {
    const cats = new Set<string>();
    inventoryItems.forEach(item => {
      if (item.category) cats.add(item.category.toLowerCase());
    });
    return Array.from(cats).filter(c => 
      ['hardware', 'service', 'fabric', 'material', 'wallcovering'].includes(c)
    );
  }, [inventoryItems]);

  // Filter items by selected category and search
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesCategory = item.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = !searchQuery || 
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subcategory?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [inventoryItems, selectedCategory, searchQuery]);

  // Get unique subcategories for current category
  const subcategories = useMemo(() => {
    const subs = new Set<string>();
    filteredItems.forEach(item => {
      if (item.subcategory) subs.add(item.subcategory);
    });
    return Array.from(subs).sort();
  }, [filteredItems]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setStep("browse");
  };

  const handleItemToggle = (item: any) => {
    const newSelected = new Map(selectedItems);
    if (newSelected.has(item.id)) {
      newSelected.delete(item.id);
    } else {
      const price = item.selling_price || item.cost_price || 0;
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
      });
    }
    setSelectedItems(newSelected);
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    const newSelected = new Map(selectedItems);
    const item = newSelected.get(itemId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      item.totalPrice = item.quantity * item.unitPrice;
      newSelected.set(itemId, item);
      setSelectedItems(newSelected);
    }
  };

  const handleConfirm = () => {
    const products = Array.from(selectedItems.values());
    onAddProducts(products);
    handleClose();
  };

  const handleClose = () => {
    setStep("category");
    setSelectedCategory("");
    setSearchQuery("");
    setSelectedItems(new Map());
    onClose();
  };

  const handleBack = () => {
    if (step === "quantity") {
      setStep("browse");
    } else if (step === "browse") {
      setStep("category");
      setSelectedCategory("");
      setSearchQuery("");
    }
  };

  const totalSelected = selectedItems.size;
  const grandTotal = Array.from(selectedItems.values()).reduce(
    (sum, item) => sum + item.totalPrice, 0
  );

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
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Category Selection */}
        {step === "category" && (
          <div className="grid grid-cols-2 gap-4 py-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5"
                onClick={() => handleCategorySelect(category)}
              >
                {CATEGORY_ICONS[category] || <Package className="h-5 w-5" />}
                <span className="font-medium">{CATEGORY_LABELS[category] || category}</span>
              </Button>
            ))}
            {categories.length === 0 && (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                No products or services in inventory yet.
                <br />
                Add items in Library first.
              </div>
            )}
          </div>
        )}

        {/* Step 2: Browse & Select Items */}
        {step === "browse" && (
          <div className="flex flex-col flex-1 min-h-0">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
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
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items found in this category.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 pb-4">
                  {filteredItems.map((item) => {
                    const isSelected = selectedItems.has(item.id);
                    const price = item.selling_price || item.cost_price || 0;
                    
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
                          {item.subcategory && (
                            <Badge variant="secondary" className="text-xs capitalize mt-1">
                              {item.subcategory.replace(/_/g, " ")}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium">
                            {currencySymbol}{price.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            per {item.unit || "each"}
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
                {Array.from(selectedItems.values()).map((item) => (
                  <div
                    key={item.inventoryItemId}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border"
                  >
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
                        onClick={() => handleQuantityChange(item.inventoryItemId, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.inventoryItemId, parseFloat(e.target.value) || 1)}
                        className="w-16 text-center"
                        min={0.01}
                        step={0.01}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityChange(item.inventoryItemId, item.quantity + 1)}
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
                ))}
              </div>
            </ScrollArea>

            {/* Total & Confirm */}
            <div className="flex items-center justify-between pt-4 border-t mt-4">
              <div>
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-xl font-bold">
                  {currencySymbol}{grandTotal.toFixed(2)}
                </div>
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
