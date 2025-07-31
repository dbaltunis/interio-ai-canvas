import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Upload, DollarSign, Ruler, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { PricingGridEditor } from "./PricingGridEditor";

interface AddInventoryDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const AddInventoryDialog = ({ trigger, onSuccess }: AddInventoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [itemType, setItemType] = useState<string>("");
  const { toast } = useToast();
  const createInventoryItem = useCreateEnhancedInventoryItem();

  const [formData, setFormData] = useState({
    // Basic fields
    name: "",
    description: "",
    sku: "",
    category: "",
    quantity: 0,
    unit: "meters",
    unit_price: 0,
    supplier: "",
    location: "",
    reorder_point: 5,
    reorder_quantity: 10,
    
    // Fabric-specific
    fabric_width: 0,
    pattern_repeat_vertical: 0,
    pattern_repeat_horizontal: 0,
    // No fullness_ratio for fabrics
    composition: "",
    care_instructions: "",
    roll_direction: "either",
    collection_name: "",
    color_code: "",
    pattern_direction: "straight",
    transparency_level: "screen",
    fire_rating: "",
    
    // Hardware-specific
    hardware_type: "" as "track" | "rod" | "bracket" | "motor" | "accessory" | "",
    material_finish: "",
    weight_capacity: 0,
    max_length: 0,
    installation_type: "",
    compatibility_tags: [] as string[],
    pricing_method: "per_unit",
    pricing_grid: {},
    specifications: {}
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Clean up the data before submission
      const cleanData = {
        ...formData,
        category_type: itemType === 'curtain_fabric' || itemType === 'blind_fabric' || itemType === 'wallcovering' ? 'fabric' : 'hardware',
        category: itemType,
        active: true,
        selling_price: formData.unit_price,
        cost_price: formData.unit_price * 0.7, // Default 30% markup
        hardware_type: formData.hardware_type || undefined,
      };
      
      // Remove empty hardware_type if not a hardware item
      if (!["track", "rod", "bracket", "motor", "accessory"].includes(itemType)) {
        delete cleanData.hardware_type;
      }
      
      // Only include transparency_level for blind fabrics
      if (itemType !== "blind_fabric") {
        delete cleanData.transparency_level;
      }
      
      await createInventoryItem.mutateAsync(cleanData);
      
      setOpen(false);
      onSuccess?.();
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        sku: "",
        category: "",
        quantity: 0,
        unit: "meters",
        unit_price: 0,
        supplier: "",
        location: "",
        reorder_point: 5,
        reorder_quantity: 10,
        fabric_width: 0,
        pattern_repeat_vertical: 0,
        pattern_repeat_horizontal: 0,
        // No fullness_ratio for fabrics
        composition: "",
        care_instructions: "",
        roll_direction: "either",
        collection_name: "",
        color_code: "",
        pattern_direction: "straight",
        transparency_level: "screen",
        fire_rating: "",
        hardware_type: "" as "track" | "rod" | "bracket" | "motor" | "accessory" | "",
        material_finish: "",
        weight_capacity: 0,
        max_length: 0,
        installation_type: "",
        compatibility_tags: [],
        pricing_method: "per_unit",
        pricing_grid: {},
        specifications: {}
      });
      
    } catch (error: any) {
      console.error("Error creating inventory item:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
          <DialogDescription>
            Create a new fabric, hardware, or blind material item
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Item Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={itemType} onValueChange={setItemType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curtain_fabric">Curtain Fabric</SelectItem>
                  <SelectItem value="blind_fabric">Blind Fabric</SelectItem>
                  <SelectItem value="wallcovering">Wallcovering</SelectItem>
                  <SelectItem value="track">Track System</SelectItem>
                  <SelectItem value="rod">Rod System</SelectItem>
                  <SelectItem value="bracket">Bracket</SelectItem>
                  <SelectItem value="motor">Motor</SelectItem>
                  <SelectItem value="accessory">Accessory</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {itemType && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
              </TabsList>

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
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Luxury Velvet Navy"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="e.g., LVN-001"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Product description..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="supplier">Supplier</Label>
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
                        placeholder="e.g., Warehouse A, Shelf B-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specifications" className="space-y-4">
                {/* Fabric Specifications */}
                {(itemType === "curtain_fabric" || itemType === "blind_fabric" || itemType === "wallcovering") && (
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
                          value={formData.fabric_width}
                          onChange={(e) => setFormData({ ...formData, fabric_width: parseFloat(e.target.value) })}
                          placeholder="137"
                        />
                      </div>

                      {/* Fullness ratio only belongs to headings, not fabrics */}

                      <div>
                        <Label htmlFor="pattern_repeat_vertical">Vertical Pattern Repeat (cm)</Label>
                        <Input
                          id="pattern_repeat_vertical"
                          type="number"
                          value={formData.pattern_repeat_vertical}
                          onChange={(e) => setFormData({ ...formData, pattern_repeat_vertical: parseFloat(e.target.value) })}
                          placeholder="64"
                        />
                      </div>

                      <div>
                        <Label htmlFor="pattern_repeat_horizontal">Horizontal Pattern Repeat (cm)</Label>
                        <Input
                          id="pattern_repeat_horizontal"
                          type="number"
                          value={formData.pattern_repeat_horizontal}
                          onChange={(e) => setFormData({ ...formData, pattern_repeat_horizontal: parseFloat(e.target.value) })}
                          placeholder="32"
                        />
                      </div>

                      <div>
                        <Label htmlFor="composition">Composition</Label>
                        <Input
                          id="composition"
                          value={formData.composition}
                          onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                          placeholder="e.g., 100% Cotton"
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

                      {itemType === "blind_fabric" && (
                        <>
                          <div>
                            <Label htmlFor="transparency_level">Transparency Level</Label>
                            <Select 
                              value={formData.transparency_level} 
                              onValueChange={(value) => setFormData({ ...formData, transparency_level: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select transparency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="blackout">Blackout</SelectItem>
                                <SelectItem value="dim_out">Dim Out</SelectItem>
                                <SelectItem value="screen">Screen</SelectItem>
                                <SelectItem value="transparent">Transparent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="fire_rating">Fire Rating</Label>
                            <Input
                              id="fire_rating"
                              value={formData.fire_rating}
                              onChange={(e) => setFormData({ ...formData, fire_rating: e.target.value })}
                              placeholder="e.g., M1, Class 1"
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Hardware Specifications */}
                {(itemType === "track" || itemType === "rod" || itemType === "bracket" || itemType === "motor" || itemType === "accessory") && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Hardware Specifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="material_finish">Material & Finish</Label>
                        <Input
                          id="material_finish"
                          value={formData.material_finish}
                          onChange={(e) => setFormData({ ...formData, material_finish: e.target.value })}
                          placeholder="e.g., Aluminum, Chrome Finish"
                        />
                      </div>

                      <div>
                        <Label htmlFor="installation_type">Installation Type</Label>
                        <Select 
                          value={formData.installation_type} 
                          onValueChange={(value) => setFormData({ ...formData, installation_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select installation type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ceiling_mount">Ceiling Mount</SelectItem>
                            <SelectItem value="wall_mount">Wall Mount</SelectItem>
                            <SelectItem value="recess_mount">Recess Mount</SelectItem>
                            <SelectItem value="face_fix">Face Fix</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(itemType === "track" || itemType === "rod") && (
                        <>
                          <div>
                            <Label htmlFor="weight_capacity">Weight Capacity (kg)</Label>
                            <Input
                              id="weight_capacity"
                              type="number"
                              value={formData.weight_capacity}
                              onChange={(e) => setFormData({ ...formData, weight_capacity: parseFloat(e.target.value) })}
                              placeholder="15"
                            />
                          </div>

                          <div>
                            <Label htmlFor="max_length">Maximum Length (m)</Label>
                            <Input
                              id="max_length"
                              type="number"
                              step="0.1"
                              value={formData.max_length}
                              onChange={(e) => setFormData({ ...formData, max_length: parseFloat(e.target.value) })}
                              placeholder="6.0"
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Pricing Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
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
                        <Label htmlFor="pricing_method">Pricing Method</Label>
                        <Select 
                          value={formData.pricing_method} 
                          onValueChange={(value) => setFormData({ ...formData, pricing_method: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="per_unit">Per Unit</SelectItem>
                            <SelectItem value="per_meter">Per Meter</SelectItem>
                            <SelectItem value="per_sqm">Per Square Meter</SelectItem>
                            <SelectItem value="price_grid">Price Grid (CSV)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="unit_price">Unit Price ($)</Label>
                        <Input
                          id="unit_price"
                          type="number"
                          step="0.01"
                          value={formData.unit_price}
                          onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                          placeholder="25.50"
                        />
                      </div>
                    </div>

                    {formData.pricing_method === "price_grid" && (
                      <div className="mt-6">
                        <PricingGridEditor 
                          itemType={itemType}
                          onGridChange={(grid) => setFormData({ ...formData, pricing_grid: grid })}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inventory" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Management</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="quantity">Current Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                        placeholder="100"
                      />
                    </div>

                    <div>
                      <Label htmlFor="reorder_point">Reorder Point</Label>
                      <Input
                        id="reorder_point"
                        type="number"
                        value={formData.reorder_point}
                        onChange={(e) => setFormData({ ...formData, reorder_point: parseInt(e.target.value) })}
                        placeholder="5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="reorder_quantity">Reorder Quantity</Label>
                      <Input
                        id="reorder_quantity"
                        type="number"
                        value={formData.reorder_quantity}
                        onChange={(e) => setFormData({ ...formData, reorder_quantity: parseInt(e.target.value) })}
                        placeholder="50"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <Separator />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!itemType || !formData.name}>
              Create Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};