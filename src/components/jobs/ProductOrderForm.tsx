
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useVendors, useCreateVendor } from "@/hooks/useVendors";
import { useCreateProductOrder, useUpdateProductOrder } from "@/hooks/useProductOrders";
import { Plus, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductOrderFormProps {
  projectId: string;
  productOrder?: any;
  onClose?: () => void;
  trigger?: React.ReactNode;
}

export const ProductOrderForm = ({ projectId, productOrder, onClose, trigger }: ProductOrderFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_type: productOrder?.product_type || "fabric",
    product_name: productOrder?.product_name || "",
    quantity: productOrder?.quantity || 1,
    unit_price: productOrder?.unit_price || 0,
    vendor_id: productOrder?.vendor_id || "",
    order_status: productOrder?.order_status || "to_order",
    planned_order_date: productOrder?.planned_order_date || "",
    actual_order_date: productOrder?.actual_order_date || "",
    notes: productOrder?.notes || "",
  });

  const { data: vendors } = useVendors();
  const createProductOrder = useCreateProductOrder();
  const updateProductOrder = useUpdateProductOrder();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const orderData = {
        ...formData,
        project_id: projectId,
        quantity: Number(formData.quantity),
        unit_price: Number(formData.unit_price),
        vendor_id: formData.vendor_id || null,
      };

      if (productOrder) {
        await updateProductOrder.mutateAsync({ id: productOrder.id, ...orderData });
      } else {
        await createProductOrder.mutateAsync(orderData);
      }

      setIsOpen(false);
      onClose?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product order",
        variant: "destructive",
      });
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product Order
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {productOrder ? "Edit Product Order" : "Add Product Order"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product_type">Product Type</Label>
              <Select value={formData.product_type} onValueChange={(value) => updateFormData("product_type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fabric">Fabric</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="track">Track</SelectItem>
                  <SelectItem value="accessory">Accessory</SelectItem>
                  <SelectItem value="lining">Lining</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="product_name">Product Name</Label>
              <Input
                id="product_name"
                value={formData.product_name}
                onChange={(e) => updateFormData("product_name", e.target.value)}
                placeholder="e.g. Wave Track 5m"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => updateFormData("quantity", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="unit_price">Unit Price ($)</Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => updateFormData("unit_price", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="vendor_id">Vendor</Label>
            <Select value={formData.vendor_id} onValueChange={(value) => updateFormData("vendor_id", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors?.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="order_status">Order Status</Label>
              <Select value={formData.order_status} onValueChange={(value) => updateFormData("order_status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to_order">To Order</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="planned_order_date">Planned Order Date</Label>
              <Input
                id="planned_order_date"
                type="date"
                value={formData.planned_order_date}
                onChange={(e) => updateFormData("planned_order_date", e.target.value)}
              />
            </div>
          </div>

          {formData.order_status !== "to_order" && (
            <div>
              <Label htmlFor="actual_order_date">Actual Order Date</Label>
              <Input
                id="actual_order_date"
                type="date"
                value={formData.actual_order_date}
                onChange={(e) => updateFormData("actual_order_date", e.target.value)}
              />
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateFormData("notes", e.target.value)}
              placeholder="e.g. Urgent, Check stock first"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {productOrder ? "Update" : "Create"} Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
