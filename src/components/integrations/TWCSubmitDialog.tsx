import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, ChevronDown, AlertCircle, CheckCircle2 } from "lucide-react";

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

  // Extract TWC items from quote data with correct data mapping
  const twcItems = useMemo(() => {
    if (!quotationData?.items) return [];
    
    return quotationData.items
      .filter((item: any) => {
        // Check multiple locations for TWC identifier
        const productDetails = item.product_details || {};
        const metadata = item.metadata || {};
        return productDetails.twc_item_number || 
               metadata.twc_item_number ||
               productDetails.metadata?.twc_item_number;
      })
      .map((item: any) => {
        const productDetails = item.product_details || {};
        const metadata = item.metadata || {};
        const measurements = productDetails.measurements || {};
        const breakdown = Array.isArray(item.breakdown) ? item.breakdown[0] : (item.breakdown || {});
        
        // Get TWC item number from various locations
        const twcItemNumber = productDetails.twc_item_number || 
                              metadata.twc_item_number ||
                              productDetails.metadata?.twc_item_number;
        
        // Get measurements (stored in MM)
        const widthMM = measurements.rail_width || 
                        breakdown.rail_width || 
                        productDetails.rail_width ||
                        parseFloat(item.width) || 0;
        const dropMM = measurements.drop || 
                       breakdown.drop || 
                       productDetails.drop ||
                       parseFloat(item.height) || parseFloat(item.drop) || 0;
        
        // Get room/location info
        const roomName = productDetails.room_name || item.room || 'Main';
        const surfaceName = productDetails.surface_name || 'Window';
        const location = `${roomName} - ${surfaceName}`;
        
        // Get colour from TWC-specific selection
        const colour = productDetails.twc_selected_colour || 
                       metadata.selected_colour ||
                       breakdown.color || 
                       'TO CONFIRM';
        
        // Get custom field values (TWC manufacturing questions)
        const twcFields = productDetails.twc_custom_fields || metadata.twc_custom_fields || [];
        const customFieldValues = twcFields.map((field: any) => ({
          name: field.name,
          value: field.value
        }));
        
        return {
          itemNumber: twcItemNumber,
          itemName: productDetails.treatment_type || item.name,
          location,
          quantity: item.quantity || 1,
          width: Math.round(widthMM),
          drop: Math.round(dropMM),
          material: productDetails.twc_selected_material || '', // Usually empty for TWC
          colour,
          customFieldValues,
          // Validation helpers (not sent to API)
          _hasValidDimensions: widthMM > 0 && dropMM > 0,
          _hasColour: colour !== 'TO CONFIRM',
          _requiredFieldsComplete: customFieldValues.length > 0,
        };
      });
  }, [quotationData]);

  // Validation state
  const validationIssues = useMemo(() => {
    const issues: string[] = [];
    twcItems.forEach((item: any, idx: number) => {
      if (!item._hasValidDimensions) {
        issues.push(`Item ${idx + 1} (${item.itemName}): Missing width or drop measurements`);
      }
      if (!item._hasColour) {
        issues.push(`Item ${idx + 1} (${item.itemName}): Colour not selected`);
      }
    });
    return issues;
  }, [twcItems]);

  const handleSubmit = async () => {
    if (twcItems.length === 0) {
      toast({
        title: "No TWC Products",
        description: "This quote doesn't contain any TWC products to submit.",
        variant: "destructive",
      });
      return;
    }

    if (validationIssues.length > 0) {
      toast({
        title: "Validation Issues",
        description: validationIssues[0], // Show first issue
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Clean items for API (remove validation helpers)
      const cleanItems = twcItems.map((item: any) => ({
        itemNumber: item.itemNumber,
        itemName: item.itemName,
        location: item.location,
        quantity: item.quantity,
        width: item.width,
        drop: item.drop,
        material: item.material,
        colour: item.colour,
        customFieldValues: item.customFieldValues,
      }));

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
          items: cleanItems,
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
