import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Package, Settings } from "lucide-react";
import { useCurtainTemplates } from "@/hooks/useCurtainTemplates";
import { useStoreProductCatalog } from "@/hooks/useStoreProductCatalog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

interface TemplateAssignmentManagerProps {
  storeId: string;
  productIds: string[];
  onComplete: () => void;
}

export const TemplateAssignmentManager = ({
  storeId,
  productIds,
  onComplete,
}: TemplateAssignmentManagerProps) => {
  const { data: templates = [] } = useCurtainTemplates();
  const { products, bulkUpdateTemplates } = useStoreProductCatalog(storeId);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const selectedProducts = products.filter(p => productIds.includes(p.id));

  // Check which products need templates (fabric products without templates)
  const productsNeedingTemplates = selectedProducts.filter(p => {
    const category = p.inventory_item?.category?.toLowerCase() || '';
    const isFabric = category === 'fabric' || category.includes('fabric');
    return isFabric && !p.template_id;
  });

  const handleAssign = async () => {
    if (!selectedTemplate) return;

    await bulkUpdateTemplates.mutateAsync({
      productIds,
      templateId: selectedTemplate,
    });

    onComplete();
  };

  if (productsNeedingTemplates.length === 0) {
    return (
      <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-900 dark:text-green-100">
          All selected fabric products already have templates assigned.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Assign Templates to Products
        </CardTitle>
        <CardDescription>
          {productsNeedingTemplates.length} fabric product(s) need template assignment to display as treatments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Products needing templates */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Products Missing Templates:</Label>
          <div className="space-y-2">
            {productsNeedingTemplates.map(product => (
              <div
                key={product.id}
                className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded"
              >
                <Package className="h-4 w-4 text-amber-600" />
                <span className="text-sm">{product.inventory_item?.name}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {product.inventory_item?.category}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Template selector */}
        <div className="space-y-2">
          <Label htmlFor="template-select">Select Template</Label>
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger id="template-select">
              <SelectValue placeholder="Choose a template..." />
            </SelectTrigger>
            <SelectContent>
              {templates.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  No templates available
                </div>
              ) : (
                templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={handleAssign}
            disabled={!selectedTemplate || bulkUpdateTemplates.isPending}
            className="flex-1"
          >
            {bulkUpdateTemplates.isPending ? "Assigning..." : "Assign Template"}
          </Button>
          <Button variant="outline" onClick={onComplete}>
            Skip
          </Button>
        </div>

        {templates.length === 0 && (
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription className="text-sm">
              You need to create window treatment templates first.{" "}
              <Link to="/?tab=settings" className="underline hover:no-underline font-medium">
                Go to Settings → Window Coverings
              </Link>{" "}
              to create templates that match your product categories.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
