import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Truck, Check, Send, Package, AlertCircle } from "lucide-react";
import { useProjectSuppliers, type DetectedSupplier } from "@/hooks/useProjectSuppliers";
import { useActiveSupplierIntegrations } from "@/hooks/useActiveSupplierIntegrations";
import { useJobStatuses } from "@/hooks/useJobStatuses";
import { SupplierOrderConfirmDialog } from "./SupplierOrderConfirmDialog";
import { TWCSubmitDialog } from "@/components/integrations/TWCSubmitDialog";
import { cn } from "@/lib/utils";

interface SupplierOrderingDropdownProps {
  projectId: string;
  projectStatusId?: string;
  projectStatusName?: string;
  quoteId: string;
  quoteItems: any[];
  quoteData?: any;
  supplierOrders?: any;
  clientData?: any;
  projectData?: any;
  quotationData?: any;
}

// Statuses that enable supplier ordering
const APPROVED_STATUS_NAMES = [
  "approved",
  "accepted",
  "order confirmed",
  "materials ordered",
  "in progress",
  "manufacturing",
];

export function SupplierOrderingDropdown({
  projectId,
  projectStatusId,
  projectStatusName,
  quoteId,
  quoteItems,
  quoteData,
  supplierOrders,
  clientData,
  projectData,
  quotationData,
}: SupplierOrderingDropdownProps) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<DetectedSupplier | null>(null);
  const [twcDialogOpen, setTwcDialogOpen] = useState(false);

  // Get supplier integrations
  const { data: integrations = [], isLoading: integrationsLoading } = useActiveSupplierIntegrations();
  
  // Get job statuses to check action type
  const { data: jobStatuses = [] } = useJobStatuses();

  // Detect suppliers from quote items
  const { suppliers, allOrdersSubmitted } = useProjectSuppliers({
    quoteItems,
    quoteData,
    supplierOrders,
  });

  // Check if TWC integration is active in production mode
  const hasTwcProduction = integrations.some((i) => i.type === "twc");

  // Determine if dropdown should be enabled based on status
  const isEnabled = useMemo(() => {
    // Check by status name first
    const statusNameLower = (projectStatusName || "").toLowerCase();
    const isApprovedByName = APPROVED_STATUS_NAMES.some((s) =>
      statusNameLower.includes(s)
    );

    // Check by status action type (locked or progress_only implies approved)
    const statusDetails = jobStatuses.find((s) => s.id === projectStatusId);
    const isApprovedByAction =
      statusDetails?.action === "locked" ||
      statusDetails?.action === "progress_only";

    return isApprovedByName || isApprovedByAction;
  }, [projectStatusName, projectStatusId, jobStatuses]);

  // Filter suppliers to only show those with active integrations
  const availableSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      if (supplier.type === "twc") {
        return hasTwcProduction;
      }
      // For vendor-type suppliers, show them but they'll have "coming soon" status
      return true;
    });
  }, [suppliers, hasTwcProduction]);

  // Don't render if no suppliers detected
  if (availableSuppliers.length === 0) {
    return null;
  }

  const handleSupplierClick = (supplier: DetectedSupplier) => {
    if (supplier.isOrdered) return;
    setSelectedSupplier(supplier);
    setConfirmDialogOpen(true);
  };

  const handleConfirmOrder = () => {
    setConfirmDialogOpen(false);
    if (!selectedSupplier) return;

    if (selectedSupplier.type === "twc") {
      setTwcDialogOpen(true);
    } else {
      // Future: Handle other supplier types
      console.log("Order to vendor:", selectedSupplier);
    }
  };

  const getButtonLabel = () => {
    if (allOrdersSubmitted) {
      return "Ordered";
    }
    return "Supplier Ordering";
  };

  return (
    <>
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={!isEnabled || integrationsLoading}
            className={cn(
              "h-8 px-2 lg:px-3 gap-1",
              !isEnabled && "opacity-50 cursor-not-allowed",
              allOrdersSubmitted && "border-primary/30 text-primary",
              !allOrdersSubmitted && isEnabled && "border-accent text-accent-foreground hover:bg-accent/10"
            )}
            title={
              !isEnabled
                ? "Order available when job is approved"
                : "Send orders to suppliers"
            }
          >
            {allOrdersSubmitted ? (
              <Check className="h-4 w-4" />
            ) : (
              <Truck className="h-4 w-4" />
            )}
            <span className="hidden lg:inline">{getButtonLabel()}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 bg-background">
          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
            Suppliers in this job
          </div>
          <DropdownMenuSeparator />

          {availableSuppliers.map((supplier, index) => (
            <div key={supplier.id}>
              {index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                disabled={supplier.isOrdered || (supplier.type === 'vendor' && !hasTwcProduction)}
                onClick={() => handleSupplierClick(supplier)}
                className={cn(
                  "flex flex-col items-start gap-1 py-2",
                  supplier.isOrdered && "opacity-60"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{supplier.name}</span>
                  {supplier.isOrdered ? (
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                      <Check className="h-3 w-3 mr-1" />
                      Ordered
                    </Badge>
                  ) : supplier.type === 'vendor' ? (
                    <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
                      Coming Soon
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs bg-accent/10 text-accent-foreground border-accent/30">
                      <Send className="h-3 w-3 mr-1" />
                      Send Order
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {supplier.items.length} {supplier.items.length === 1 ? "item" : "items"}
                  {supplier.orderInfo && (
                    <span className="ml-2">• ID: {supplier.orderInfo.orderId}</span>
                  )}
                </div>
              </DropdownMenuItem>
            </div>
          ))}

          {availableSuppliers.length === 0 && (
            <div className="px-2 py-3 text-sm text-muted-foreground text-center">
              <AlertCircle className="h-4 w-4 mx-auto mb-1" />
              No suppliers detected
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Dialog */}
      <SupplierOrderConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        supplierName={selectedSupplier?.name || ""}
        itemCount={selectedSupplier?.items.length || 0}
        onConfirm={handleConfirmOrder}
      />

      {/* TWC Submit Dialog */}
      {selectedSupplier?.type === "twc" && (
        <TWCSubmitDialog
          open={twcDialogOpen}
          onOpenChange={setTwcDialogOpen}
          quoteId={quoteId}
          quotationData={quotationData || { items: quoteItems, ...quoteData }}
          projectData={projectData}
          clientData={clientData}
        />
      )}
    </>
  );
}
