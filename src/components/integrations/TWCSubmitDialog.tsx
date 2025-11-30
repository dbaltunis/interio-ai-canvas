import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send } from "lucide-react";

interface TWCSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  quotationData: any;
  projectData?: any;
  clientData?: any;
}

export function TWCSubmitDialog({
  open,
  onOpenChange,
  quoteId,
  quotationData,
  projectData,
  clientData,
}: TWCSubmitDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    purchaseOrderNumber: `PO-${quoteId.slice(0, 8)}`,
    contactName: clientData?.name || "",
    email: clientData?.email || "",
    phone: clientData?.phone || "",
    address1: projectData?.address || clientData?.address || "",
    address2: "",
    city: projectData?.city || clientData?.city || "",
    state: projectData?.state || clientData?.state || "",
    postcode: projectData?.postcode || clientData?.postcode || "",
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Map quote items to TWC order format
      const twcItems = quotationData.items
        .filter((item: any) => item.metadata?.twc_item_number) // Only TWC products
        .map((item: any) => ({
          itemNumber: item.metadata.twc_item_number,
          itemName: item.metadata.twc_description || item.name,
          location: item.room || "Main",
          quantity: item.quantity || 1,
          width: item.width || 0,
          drop: item.height || item.drop || 0,
          material: item.product_name || item.name,
          colour: item.metadata?.selected_colour || "Standard",
          customFieldValues: item.metadata?.twc_custom_fields || [],
        }));

      if (twcItems.length === 0) {
        toast({
          title: "No TWC Products",
          description: "This quote doesn't contain any TWC products to submit.",
          variant: "destructive",
        });
        return;
      }

      // Call TWC submit order edge function
      const { data, error } = await supabase.functions.invoke('twc-submit-order', {
        body: {
          quoteId,
          orderDescription: `Order for ${clientData?.name || 'Client'} - Quote ${quoteId.slice(0, 8)}`,
          purchaseOrderNumber: formData.purchaseOrderNumber,
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          state: formData.state,
          postcode: formData.postcode,
          phone: formData.phone,
          email: formData.email,
          contactName: formData.contactName,
          items: twcItems,
        },
      });

      if (error) {
        console.error('TWC submission error:', error);
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Order Submitted to TWC",
          description: `TWC Order ID: ${data.orderId}`,
        });
        onOpenChange(false);
      } else {
        throw new Error(data?.error || 'Failed to submit order');
      }
    } catch (error: any) {
      console.error('Error submitting to TWC:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit order to TWC. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Submit Order to TWC
          </DialogTitle>
          <DialogDescription>
            Submit this quote to The Window Covering for manufacturing and delivery.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchaseOrderNumber">Purchase Order Number *</Label>
              <Input
                id="purchaseOrderNumber"
                value={formData.purchaseOrderNumber}
                onChange={(e) => setFormData({ ...formData, purchaseOrderNumber: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name *</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address1">Delivery Address Line 1 *</Label>
            <Input
              id="address1"
              value={formData.address1}
              onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address2">Delivery Address Line 2</Label>
            <Input
              id="address2"
              value={formData.address2}
              onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode *</Label>
              <Input
                id="postcode"
                value={formData.postcode}
                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h4 className="text-sm font-medium mb-2">Order Summary</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium">Items:</span>{" "}
                {quotationData.items.filter((i: any) => i.metadata?.twc_item_number).length} TWC products
              </p>
              <p>
                <span className="font-medium">Quote Total:</span>{" "}
                {quotationData.currency} {quotationData.total?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.purchaseOrderNumber || !formData.contactName}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit to TWC
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
