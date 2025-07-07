
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Calculator, X, Package } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { toast } from "sonner";

interface SelectedProductsPanelProps {
  selectedProducts: string[];
  onClearSelection: () => void;
  onRemoveProduct: (productId: string) => void;
  onAddToProject: () => void;
  onCalculateUsage: () => void;
}

export const SelectedProductsPanel = ({
  selectedProducts,
  onClearSelection,
  onRemoveProduct,
  onAddToProject,
  onCalculateUsage
}: SelectedProductsPanelProps) => {
  const { formatFabric } = useMeasurementUnits();

  // Mock projects - replace with actual project data
  const projects = [
    { id: "1", name: "Living Room Renovation" },
    { id: "2", name: "Master Bedroom Update" },
    { id: "3", name: "Office Makeover" }
  ];

  // Mock selected products data - replace with actual product data
  const mockProducts = [
    {
      id: "1",
      name: "Merlon Custard Linen",
      type: "fabric",
      price: 120.00,
      unit: "yard",
      inStock: 45.5,
      category: "Upholstery Fabrics"
    },
    {
      id: "2", 
      name: "Professional Track System",
      type: "hardware",
      price: 45.00,
      unit: "meter",
      inStock: 125,
      category: "Curtain Tracks"
    }
  ];

  const selectedProductsData = mockProducts.filter(p => 
    selectedProducts.includes(p.id)
  );

  if (selectedProducts.length === 0) return null;

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Selected Products ({selectedProducts.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Selected Products List */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {selectedProductsData.map(product => (
            <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={product.type === 'fabric' ? 'default' : 'secondary'} className="text-xs">
                    {product.type}
                  </Badge>
                  <span className="text-xs text-gray-500">{product.category}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveProduct(product.id)}
                className="text-red-500 hover:text-red-700 p-1 h-auto"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={onCalculateUsage}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!selectedProductsData.some(p => p.type === 'fabric')}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Fabric Usage
          </Button>
          
          <Button
            onClick={onAddToProject}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Project
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <p className="text-sm text-gray-600 mb-2">Quick Actions:</p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toast.success("Generating quote for selected products...")}
            >
              Generate Quote
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => toast.success("Checking stock levels...")}
            >
              Check Stock
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
