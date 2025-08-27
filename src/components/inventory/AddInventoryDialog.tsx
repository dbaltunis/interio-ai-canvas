import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, DollarSign, Ruler, Package, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCreateEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { useVendors } from "@/hooks/useVendors";
import { supabase } from "@/integrations/supabase/client";

interface AddInventoryDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const AddInventoryDialog = ({ trigger, onSuccess }: AddInventoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [itemType, setItemType] = useState<string>("");
  const [trackInventory, setTrackInventory] = useState(false);
  const { toast } = useToast();
  const createInventoryItem = useCreateEnhancedInventoryItem();
  const { data: vendors = [] } = useVendors();

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
    vendor_id: "",
    location: "",
    reorder_point: 5,
    
    // Fabric-specific
    fabric_width: 0,
    pattern_repeat_vertical: 0,
    pattern_repeat_horizontal: 0,
    fabric_composition: "",
    fabric_care_instructions: "",
    collection_name: "",
    color: "",
    
    // Hardware-specific
    hardware_finish: "",
    hardware_material: "",
    weight: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create inventory items.",
          variant: "destructive",
        });
        return;
      }

      const cleanData = {
        ...formData,
        user_id: user.id, // This is required for RLS policy
        category: itemType,
        active: true,
        selling_price: formData.unit_price,
        cost_price: formData.unit_price * 0.7,
        quantity: trackInventory ? formData.quantity : 0,
        reorder_point: trackInventory ? formData.reorder_point : 0
      };
      
      // Remove empty fields to avoid database issues
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === "" || cleanData[key] === undefined || cleanData[key] === null) {
          delete cleanData[key];
        }
      });
      
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
        hardware_finish: "",
        hardware_material: "",
        weight: 0
      });
      setTrackInventory(false);
      
      toast({
        title: "Success",
        description: "Product created successfully!",
      });
      
    } catch (error: any) {
      console.error("Error creating inventory item:", error);
      toast({
        title: "Error",
        description: "Failed to create inventory item. Please try again.",
        variant: "destructive",
      });
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
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Create a new fabric, hardware, or blind material item
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={itemType} onValueChange={setItemType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product type" />
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
                <TabsTrigger value="inventory">Vendor & Stock</TabsTrigger>
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
                        <Label htmlFor="hardware_finish">Material & Finish</Label>
                        <Input
                          id="hardware_finish"
                          value={formData.hardware_finish}
                          onChange={(e) => setFormData({ ...formData, hardware_finish: e.target.value })}
                          placeholder="e.g., Aluminum, Chrome Finish"
                        />
                      </div>

                      <div>
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                          placeholder="2.5"
                        />
                      </div>
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inventory" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store className="h-5 w-5" />
                      Vendor & Ordering
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="vendor">Vendor</Label>
                      <Select 
                        value={formData.vendor_id} 
                        onValueChange={(value) => {
                          setFormData({ ...formData, vendor_id: value });
                          const selectedVendor = vendors.find(v => v.id === value);
                          if (selectedVendor) {
                            setFormData(prev => ({ ...prev, supplier: selectedVendor.name }));
                          }
                        }}
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
                      <Label htmlFor="location">Storage Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Warehouse A, Shelf B-1"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="track-inventory"
                        checked={trackInventory}
                        onCheckedChange={setTrackInventory}
                      />
                      <Label htmlFor="track-inventory">Track inventory levels</Label>
                    </div>

                    {trackInventory && (
                      <div className="grid gap-4 md:grid-cols-2 border-l-2 border-primary/20 pl-4">
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!itemType || !formData.name}>
              Create Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};