import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Package, Loader2, RefreshCw, Trash2, Settings, Palette } from "lucide-react";
import { useTWCImportedProducts, useResyncTWCProducts, useDeleteTWCProduct, useUpdateExistingTWCProducts } from "@/hooks/useTWCProducts";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TWCPricingConfigSheet } from "./TWCPricingConfigSheet";

export const TWCImportedProducts = () => {
  const { data: importedProducts, isLoading } = useTWCImportedProducts();
  const resyncMutation = useResyncTWCProducts();
  const updateExistingMutation = useUpdateExistingTWCProducts();
  const deleteMutation = useDeleteTWCProduct();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [pricingProduct, setPricingProduct] = useState<any>(null);

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading your TWC products...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!importedProducts || importedProducts.length === 0) {
    return null;
  }

  const handleResync = () => {
    resyncMutation.mutate();
  };

  const handleUpdateColors = () => {
    updateExistingMutation.mutate();
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleCreateTemplate = (product: any) => {
    // Navigate to templates tab with product data for pre-filling
    navigate('/settings', { 
      state: { 
        activeTab: 'templates',
        createTemplate: {
          name: product.name,
          category: product.category,
          description: `TWC Product: ${product.metadata?.twc_item_number || product.sku}`,
          inventoryItemId: product.id
        }
      }
    });
  };

  const handleConfigurePricing = (product: any) => {
    // Open inline pricing configuration sheet
    setPricingProduct(product);
  };

  const handleViewTemplate = (product: any) => {
    const templateId = product.templates?.[0]?.id;
    if (templateId) {
      navigate('/settings', {
        state: {
          activeTab: 'templates',
          editTemplateId: templateId
        }
      });
    } else {
      toast.error("Template not found. Please create a template first.");
    }
  };

  return (
    <>
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">My TWC Products</h3>
              <Badge variant="secondary">{importedProducts.length} imported</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleUpdateColors}
                disabled={updateExistingMutation.isPending}
                className="gap-1.5"
              >
                {updateExistingMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Palette className="h-4 w-4" />
                    Update Colors
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleResync}
                disabled={resyncMutation.isPending}
                className="gap-1.5"
              >
                {resyncMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Re-syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Re-sync Options
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {importedProducts.map((product: any) => {
              const hasTemplate = product.templates && product.templates.length > 0;
              const hasPricing = product.metadata?.pricing_grid_data || (hasTemplate && product.templates[0]?.pricing_grid_data);
              const twcItemNumber = product.metadata?.twc_item_number || product.sku;
              const hasOptions = product.metadata?.twc_questions?.length > 0;
              const priceGroup = product.price_group || product.metadata?.pricingGroup;

              return (
                <Card key={product.id} className="bg-background">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm truncate">{product.name}</h4>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {product.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          Item #: {twcItemNumber || product.sku}
                        </p>

                        {/* Status Indicators - PHASE 3: Simplified, less misleading */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {hasTemplate ? (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Template Ready
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                              Needs Template
                            </Badge>
                          )}
                          {priceGroup && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                              Group {priceGroup}
                            </Badge>
                          )}
                          {hasOptions && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                              {product.metadata.twc_questions.length} Options
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-1 shrink-0">
                        {!hasTemplate && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-7"
                            onClick={() => handleCreateTemplate(product)}
                          >
                            Create Template
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant={hasPricing ? "ghost" : "outline"}
                          className="text-xs h-7"
                          onClick={() => handleConfigurePricing(product)}
                        >
                          <Settings className="h-3.5 w-3.5 mr-1" />
                          {hasPricing ? "Edit Pricing" : "Configure Pricing"}
                        </Button>
                        {hasTemplate && hasPricing && (
                          <Button 
                            size="sm" 
                            variant="default" 
                            className="text-xs h-7"
                            onClick={() => handleViewTemplate(product)}
                          >
                            View Template
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            💡 Use "Re-sync Options" to import all TWC product options to your account
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete TWC Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.name}" from your inventory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <TWCPricingConfigSheet
        open={!!pricingProduct}
        onOpenChange={(open) => !open && setPricingProduct(null)}
        product={pricingProduct}
      />
    </>
  );
};
