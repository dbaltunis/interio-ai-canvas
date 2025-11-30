import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Package, Loader2 } from "lucide-react";
import { useTWCImportedProducts } from "@/hooks/useTWCProducts";

export const TWCImportedProducts = () => {
  const { data: importedProducts, isLoading } = useTWCImportedProducts();

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
    return null; // Don't show section if no products imported yet
  }

  return (
    <Card className="mb-6 border-primary/20 bg-primary/5">
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">My TWC Products</h3>
            <Badge variant="secondary">{importedProducts.length} imported</Badge>
          </div>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
          {importedProducts.map((product: any) => {
            const hasTemplate = product.templates && product.templates.length > 0;
            const hasPricing = hasTemplate && product.templates[0]?.pricing_grid_data;
            const twcItemNumber = product.metadata?.twc_item_number || product.sku;

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

                      {/* Status Indicators */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">In Inventory</span>
                        </div>
                        {hasTemplate ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">Template Created</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-amber-600" />
                            <span className="text-amber-600">No Template</span>
                          </div>
                        )}
                        {hasPricing ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">Pricing Configured</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3 text-amber-600" />
                            <span className="text-amber-600">No Pricing</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-1 shrink-0">
                      {!hasTemplate && (
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          Create Template
                        </Button>
                      )}
                      {!hasPricing && (
                        <Button size="sm" variant="outline" className="text-xs h-7">
                          Configure Pricing
                        </Button>
                      )}
                      {hasTemplate && hasPricing && (
                        <Button size="sm" variant="default" className="text-xs h-7">
                          View in Templates
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          💡 Configure pricing and templates to use TWC products in quotes
        </div>
      </CardContent>
    </Card>
  );
};
