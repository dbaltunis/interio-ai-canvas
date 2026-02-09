import { useState, useMemo, useEffect } from "react";
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
    contactName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postcode: "",
  });

  // Re-sync form data when dialog opens or client/project data changes
  useEffect(() => {
    if (open) {
      setFormData({
        purchaseOrderNumber: `PO-${quoteId.slice(0, 8)}`,
        contactName: clientData?.name || "",
        email: clientData?.email || "",
        phone: clientData?.phone || "",
        address1: projectData?.address || clientData?.address || "",
        address2: "",
        city: projectData?.city || clientData?.city || "",
        state: projectData?.state || clientData?.state || "",
        postcode: projectData?.postcode || clientData?.postcode || clientData?.zip_code || "",
      });
    }
  }, [open, clientData, projectData, quoteId]);

  // Mapping from your option keys to TWC API field names
  // Includes snake_case keys AND label-based keys for TWC question names
  const OPTION_TO_TWC_MAPPING: Record<string, string> = {
    // Snake_case keys (from app's option system)
    'control_type': 'Control Type',
    'chain_side': 'Cont Side',
    'cont_side': 'Cont Side',
    'control_side': 'Cont Side',
    'control_length': 'Control Length',
    'roller_chain_length': 'Control Length',
    'roller_installation': 'Fixing',
    'fixing': 'Fixing',
    'installation': 'Fixing',
    'finish': 'Finish',
    'hold_down': 'Hold Down Clips',
    'hold_down_clips': 'Hold Down Clips',
    'fascia': 'Fascia',
    'fascia_type': 'Fascia',
    'bottom_bar': 'Bottom Bar',
    'headrail': 'Headrail',
    'slat_size': 'Slat Size',
    'tilt_mechanism': 'Tilt Mechanism',
    'cord_position': 'Cord Position',
    'spring_assist': 'Spring Assist',
    'motor_side': 'Motor Side',
    'remote_type': 'Remote Type',
    'valance': 'Valance',
    'pelmets': 'Pelmets',
    'pelmet': 'Pelmets',
    'woven_tape': 'Woven Tape',
    'acorn': 'Acorn',
    'cut_out': 'Cut Out',
    'ladder_tape': 'Ladder Tape',
    // Label-based keys (TWC question labels used directly as option keys)
    'Control Type': 'Control Type',
    'Cont Side': 'Cont Side',
    'Control Length': 'Control Length',
    'Fixing': 'Fixing',
    'Finish': 'Finish',
    'Hold Down Clips': 'Hold Down Clips',
    'Fascia': 'Fascia',
    'Bottom Bar': 'Bottom Bar',
    'Headrail': 'Headrail',
    'Slat Size': 'Slat Size',
    'Tilt Mechanism': 'Tilt Mechanism',
    'Cord Position': 'Cord Position',
    'Spring Assist': 'Spring Assist',
    'Motor Side': 'Motor Side',
    'Remote Type': 'Remote Type',
    'Valance': 'Valance',
    'Pelmets': 'Pelmets',
    'Woven Tape': 'Woven Tape',
    'Acorn': 'Acorn',
    'Cut Out': 'Cut Out',
    'Ladder Tape': 'Ladder Tape',
  };

  // Set of valid TWC API field names - only these get sent
  const VALID_TWC_FIELDS = new Set(Object.values(OPTION_TO_TWC_MAPPING));

  // Helper function to strip TWC item suffixes from option keys
  // e.g., "control_type_ce115355" → "control_type"
  // Template IDs are first 8 hex chars of UUID - match any 8-char hex suffix
  const stripTwcSuffix = (key: string): string => {
    return key.replace(/_[a-f0-9]{8}$/i, '');
  };

  // Helper: extract colour name from potentially combined "CODE NAME" format
  // TWC API expects just the colour name, not the code
  const extractColourName = (rawColour: string): string => {
    if (!rawColour || rawColour === 'TO CONFIRM') return rawColour;
    // Strip leading numeric code: "3095 LIGHT CREAM" → "LIGHT CREAM"
    const codeNameMatch = rawColour.match(/^\d+\s+(.+)$/);
    if (codeNameMatch) return codeNameMatch[1].trim();
    // Strip "CODE - NAME" format: "3095 - LIGHT CREAM" → "LIGHT CREAM"
    const dashMatch = rawColour.match(/^\d+\s*-\s*(.+)$/);
    if (dashMatch) return dashMatch[1].trim();
    return rawColour;
  };

  // Map your option values to TWC expected values (where different)
  const VALUE_MAPPINGS: Record<string, Record<string, string>> = {
    'Control Type': {
      'chain': 'Cord operated',
      'Chain': 'Cord operated',
      'cordless': 'Cordless',
      'Cordless': 'Cordless',
      'motorised': 'Motorised',
      'Motorised': 'Motorised',
      'spring': 'Spring Operated',
      'Spring': 'Spring Operated',
    },
    'Cont Side': {
      'left': 'L',
      'Left': 'L',
      'right': 'R',
      'Right': 'R',
    },
    'Fixing': {
      'face': 'Face',
      'Face': 'Face',
      'top': 'Top',
      'Top': 'Top',
      'inside': 'Inside',
      'Inside': 'Inside',
      'outside': 'Outside',
      'Outside': 'Outside',
    },
  };

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
        
        // Get colour - check material/fabric details as well
        // Then strip any leading numeric code (TWC expects name only, not "3095 LIGHT CREAM")
        const rawColour = productDetails.twc_selected_colour ||
                       metadata.selected_colour ||
                       productDetails.selected_color ||
                       breakdown.color ||
                       'TO CONFIRM';
        const colour = extractColourName(rawColour);
        
        // MAP YOUR OPTIONS TO TWC FORMAT
        // First, try to get custom fields from existing twc_custom_fields
        let customFieldValues: Array<{name: string, value: string}> = [];
        
        const twcFields = productDetails.twc_custom_fields || metadata.twc_custom_fields || [];
        if (Array.isArray(twcFields) && twcFields.length > 0) {
          // Only include fields that TWC recognizes - filter out invalid/unknown fields
          customFieldValues = twcFields
            .filter((field: any) => field.name && VALID_TWC_FIELDS.has(field.name))
            .map((field: any) => ({
              name: field.name,
              value: field.value
            }));
        }
        
        // Then, map your selected_options to TWC format (fills in any missing fields)
        const selectedOptions = productDetails.selected_options || [];
        if (Array.isArray(selectedOptions)) {
          selectedOptions.forEach((opt: any) => {
            const optionKey = opt.optionKey || opt.key || '';
            const optionName = opt.name || opt.label || '';
            const optionValue = opt.value || opt.selectedValue || '';

            // Skip base items (fabric, lining, heading) - not TWC custom fields
            if (optionKey === 'fabric_base' || optionKey === 'lining_base' || optionKey === 'heading_base') {
              return;
            }

            // Skip N/A, empty, or null values - TWC doesn't want them
            if (!optionValue ||
                optionValue === 'N/A' ||
                optionValue === 'n/a' ||
                optionValue === 'NA' ||
                optionValue === 'None' ||
                optionValue === 'none') {
              return;
            }

            // Strip TWC item suffix (e.g., "control_type_a1b2c3d4" → "control_type")
            const baseKey = stripTwcSuffix(optionKey);

            // Try to find TWC field name from multiple sources:
            // 1. Base key (after stripping suffix)
            // 2. Lowercase base key
            // 3. Original option key (unchanged)
            // 4. Option name/label (TWC question label like "Control Type")
            const twcFieldName = OPTION_TO_TWC_MAPPING[baseKey] ||
                                 OPTION_TO_TWC_MAPPING[baseKey.toLowerCase()] ||
                                 OPTION_TO_TWC_MAPPING[optionKey] ||
                                 OPTION_TO_TWC_MAPPING[optionKey.toLowerCase()] ||
                                 OPTION_TO_TWC_MAPPING[optionName] ||
                                 OPTION_TO_TWC_MAPPING[optionName.toLowerCase()];

            if (twcFieldName) {
              // Check if we already have this field
              const existingField = customFieldValues.find(f => f.name === twcFieldName);
              if (!existingField) {
                // Apply value mapping if needed
                const valueMap = VALUE_MAPPINGS[twcFieldName];
                const mappedValue = valueMap?.[optionValue] || optionValue;

                customFieldValues.push({
                  name: twcFieldName,
                  value: mappedValue
                });
              }
            }
          });
        }
        
        // Also check breakdown for option values that might be stored there
        if (breakdown && typeof breakdown === 'object') {
          Object.entries(breakdown).forEach(([key, value]) => {
            if (typeof value === 'string' && OPTION_TO_TWC_MAPPING[key]) {
              const twcFieldName = OPTION_TO_TWC_MAPPING[key];
              const existingField = customFieldValues.find(f => f.name === twcFieldName);
              if (!existingField) {
                const valueMap = VALUE_MAPPINGS[twcFieldName];
                const mappedValue = valueMap?.[value] || value;
                customFieldValues.push({ name: twcFieldName, value: mappedValue });
              }
            }
          });
        }
        
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

  // Group TWC items by itemNumber (product type) - TWC requires one product type per order
  const itemGroups = useMemo(() => {
    const groups: Record<string, { itemNumber: string; itemName: string; items: any[] }> = {};
    twcItems.forEach((item: any) => {
      const key = item.itemNumber;
      if (!groups[key]) {
        groups[key] = { itemNumber: key, itemName: item.itemName, items: [] };
      }
      groups[key].items.push(item);
    });
    return Object.values(groups);
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

    const successfulOrders: string[] = [];
    const failedOrders: string[] = [];

    try {
      // Submit each product type group as a separate order (TWC requirement)
      for (let groupIdx = 0; groupIdx < itemGroups.length; groupIdx++) {
        const group = itemGroups[groupIdx];

        // Clean items for API (remove validation helpers)
        const cleanItems = group.items.map((item: any) => ({
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

        // Append group suffix to PO number if multiple groups
        const poNumber = itemGroups.length > 1
          ? `${formData.purchaseOrderNumber}-${groupIdx + 1}`
          : formData.purchaseOrderNumber;

        try {
          const { data, error } = await supabase.functions.invoke('twc-submit-order', {
            body: {
              quoteId,
              orderDescription: `Order for ${clientData?.name || 'Client'} - Quote ${quoteId.slice(0, 8)} (${group.itemName})`,
              purchaseOrderNumber: poNumber,
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
            console.error(`TWC submission error for group ${group.itemName}:`, error);
            failedOrders.push(`${group.itemName}: ${error.message}`);
            continue;
          }

          if (data?.success) {
            successfulOrders.push(`${group.itemName}: Order #${data.orderId}`);
          } else {
            const errorDetails = data?.message || data?.error || 'Unknown error';
            failedOrders.push(`${group.itemName}: ${errorDetails}`);
          }
        } catch (groupError: any) {
          failedOrders.push(`${group.itemName}: ${groupError.message}`);
        }
      }

      // Show results
      if (successfulOrders.length > 0 && failedOrders.length === 0) {
        toast({
          title: "Orders Submitted to TWC",
          description: successfulOrders.join('\n'),
        });
        onOpenChange(false);
      } else if (successfulOrders.length > 0 && failedOrders.length > 0) {
        toast({
          title: "Partial Success",
          description: `Submitted: ${successfulOrders.join(', ')}\nFailed: ${failedOrders.join(', ')}`,
          variant: "destructive",
        });
      } else {
        const formattedErrors = failedOrders.join('\n').replace(/\s*\/n\s*/g, '\n');
        toast({
          title: "Submission Failed",
          description: formattedErrors,
          variant: "destructive",
          importance: 'important',
        });
      }
    } catch (error: any) {
      console.error('Error submitting to TWC:', error);
      const errorMessage = error.message || "Failed to submit order to TWC. Please try again.";
      const formattedMessage = errorMessage.replace(/\s*\/n\s*/g, '\n');
      toast({
        title: "Submission Failed",
        description: formattedMessage,
        variant: "destructive",
        importance: 'important',
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
                {twcItems.length} TWC product{twcItems.length !== 1 ? 's' : ''}
              </p>
              {itemGroups.length > 1 && (
                <p className="text-xs text-amber-600">
                  {itemGroups.length} separate orders will be submitted (TWC requires one product type per order)
                </p>
              )}
              {itemGroups.map((group: any) => (
                <p key={group.itemNumber} className="text-xs">
                  {group.itemName}: {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                </p>
              ))}
              <p>
                <span className="font-medium">Quote Total:</span>{" "}
                {quotationData.currency} {(quotationData.total_amount ?? quotationData.total)?.toFixed(2) || "0.00"}
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
