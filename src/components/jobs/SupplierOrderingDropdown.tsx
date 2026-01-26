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
import {
  ChevronDown,
  Truck,
  Check,
  Send,
  AlertCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useProjectSuppliers, type DetectedSupplier } from "@/hooks/useProjectSuppliers";
import {
  useActiveSupplierIntegrations,
  useAllSupplierIntegrations,
} from "@/hooks/useActiveSupplierIntegrations";
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

  // Get ALL supplier integrations (production + test mode)
  const { data: allIntegrations = [], isLoading: allIntegrationsLoading } =
    useAllSupplierIntegrations();

  // Get only production-mode integrations
  const { data: productionIntegrations = [], isLoading: productionLoading } =
    useActiveSupplierIntegrations();

  // Get job statuses to check action type
  const { data: jobStatuses = [] } = useJobStatuses();

  // Detect suppliers from quote items
  const { suppliers, allOrdersSubmitted } = useProjectSuppliers({
    quoteItems,
    quoteData,
    supplierOrders,
  });

  // Check if TWC integration is active in production mode
  const hasTwcProduction = productionIntegrations.some((i) => i.type === "twc");

  // Determine states
  const hasAnyIntegration = allIntegrations.length > 0;
  const hasProductionIntegration = productionIntegrations.length > 0;
  const allTestMode = hasAnyIntegration && !hasProductionIntegration;
  const hasProducts = suppliers.length > 0;
  const isLoading = allIntegrationsLoading || productionLoading;

  // Determine if dropdown should be enabled based on status
  const isApprovedStatus = useMemo(() => {
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

  // Check which integrations are in test mode
  const getIsTestMode = (supplierType: string) => {
    const integration = allIntegrations.find((i) => i.type === supplierType);
    return integration ? !integration.isProduction : false;
  };

  // Get test mode integrations for display
  const testModeIntegrations = allIntegrations.filter((i) => !i.isProduction);

  // Hide completely only if no integrations at all
  if (!hasAnyIntegration && !isLoading) {
    return null;
  }

  const handleSupplierClick = (supplier: DetectedSupplier) => {
    if (supplier.isOrdered) return;
    if (getIsTestMode(supplier.type)) return; // Don't allow clicking test mode suppliers
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
    if (allTestMode) {
      return "Supplier Ordering";
    }
    if (allOrdersSubmitted && hasProducts) {
      return "Ordered";
    }
    return "Supplier Ordering";
  };

  // Determine if button should be disabled
  const isButtonDisabled =
    isLoading ||
    (!isApprovedStatus && hasProducts && hasProductionIntegration) ||
    allTestMode;

  // Get tooltip text
  const getTooltipText = () => {
    if (allTestMode) {
      return "All suppliers in testing mode";
    }
    if (!isApprovedStatus && hasProducts) {
      return "Order available when job is approved";
    }
    if (!hasProducts && hasProductionIntegration) {
      return "No supplier products in this quote";
    }
    return "Send orders to suppliers";
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isButtonDisabled}
            className={cn(
              "h-8 px-2 lg:px-3 gap-1",
              isButtonDisabled && "opacity-50 cursor-not-allowed",
              allTestMode && "border-amber-400/50 text-amber-600",
              allOrdersSubmitted &&
                hasProducts &&
                !allTestMode &&
                "border-primary/30 text-primary",
              !allOrdersSubmitted &&
                !allTestMode &&
                isApprovedStatus &&
                hasProducts &&
                "border-accent text-accent-foreground hover:bg-accent/10"
            )}
            title={getTooltipText()}
          >
            {allTestMode ? (
              <AlertTriangle className="h-4 w-4" />
            ) : allOrdersSubmitted && hasProducts ? (
              <Check className="h-4 w-4" />
            ) : (
              <Truck className="h-4 w-4" />
            )}
            <span className="hidden lg:inline">{getButtonLabel()}</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64 bg-background">
          {/* Test Mode Warning Banner */}
          {allTestMode && (
            <div className="px-3 py-2 text-xs text-amber-700 bg-amber-50 border-b border-amber-200 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>
                All suppliers in Testing Mode - orders won't be processed
              </span>
            </div>
          )}

          {/* Not Approved Warning */}
          {!isApprovedStatus && hasProducts && hasProductionIntegration && !allTestMode && (
            <div className="px-3 py-2 text-xs text-muted-foreground bg-muted/50 border-b flex items-start gap-2">
              <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>Order available when job is approved</span>
            </div>
          )}

          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
            Suppliers in this job
          </div>
          <DropdownMenuSeparator />

          {/* Show detected products with suppliers */}
          {availableSuppliers.map((supplier, index) => {
            const isTestMode = getIsTestMode(supplier.type);
            return (
              <div key={supplier.id}>
                {index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  disabled={
                    supplier.isOrdered ||
                    isTestMode ||
                    (supplier.type === "vendor" && !hasTwcProduction) ||
                    !isApprovedStatus
                  }
                  onClick={() => handleSupplierClick(supplier)}
                  className={cn(
                    "flex flex-col items-start gap-1 py-2",
                    (supplier.isOrdered || isTestMode) && "opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{supplier.name}</span>
                    {isTestMode ? (
                      <Badge
                        variant="outline"
                        className="text-xs bg-amber-50 text-amber-700 border-amber-300"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Testing
                      </Badge>
                    ) : supplier.isOrdered ? (
                      <Badge
                        variant="outline"
                        className="text-xs bg-primary/10 text-primary border-primary/30"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Ordered
                      </Badge>
                    ) : supplier.type === "vendor" ? (
                      <Badge
                        variant="outline"
                        className="text-xs bg-muted text-muted-foreground"
                      >
                        Coming Soon
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs bg-accent/10 text-accent-foreground border-accent/30"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Send Order
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {supplier.items.length}{" "}
                    {supplier.items.length === 1 ? "item" : "items"}
                    {supplier.orderInfo && (
                      <span className="ml-2">
                        • ID: {supplier.orderInfo.orderId}
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              </div>
            );
          })}

          {/* Show test mode integrations that don't have products */}
          {testModeIntegrations
            .filter(
              (integration) =>
                !availableSuppliers.some((s) => s.type === integration.type)
            )
            .map((integration, index) => (
              <div key={integration.type}>
                {(availableSuppliers.length > 0 || index > 0) && (
                  <DropdownMenuSeparator />
                )}
                <DropdownMenuItem disabled className="flex flex-col items-start gap-1 py-2 opacity-60">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{integration.name}</span>
                    <Badge
                      variant="outline"
                      className="text-xs bg-amber-50 text-amber-700 border-amber-300"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Testing
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    No products detected
                  </div>
                </DropdownMenuItem>
              </div>
            ))}

          {/* No products detected message for production integrations */}
          {!hasProducts && hasProductionIntegration && !allTestMode && (
            <div className="px-3 py-3 text-sm text-muted-foreground text-center border-t">
              <AlertCircle className="h-4 w-4 mx-auto mb-1.5" />
              <p>No supplier products detected</p>
              <p className="text-xs mt-0.5">
                Add products from TWC catalog to enable ordering
              </p>
            </div>
          )}

          {/* Completely empty state - only test mode integrations, no products */}
          {!hasProducts && allTestMode && testModeIntegrations.length === 0 && (
            <div className="px-3 py-3 text-sm text-muted-foreground text-center">
              <AlertCircle className="h-4 w-4 mx-auto mb-1" />
              No suppliers configured
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
