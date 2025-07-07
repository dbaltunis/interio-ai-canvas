
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, AlertTriangle, Edit, Copy, Eye } from "lucide-react";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface ProductCardsProps {
  vendors: any[];
  fabrics: any[];
  hardware: any[];
  selectedProducts: string[];
  onProductSelect: (productId: string, checked: boolean) => void;
  onProductDetails: (product: any, type: "fabric" | "hardware" | "vendor") => void;
}

export const ProductCards = ({ 
  vendors, 
  fabrics, 
  hardware, 
  selectedProducts, 
  onProductSelect, 
  onProductDetails 
}: ProductCardsProps) => {
  const { units, getFabricUnitLabel, formatFabric } = useMeasurementUnits();

  const formatCurrency = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$',
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    return `${currencySymbols[units.currency] || units.currency}${amount.toFixed(2)}`;
  };

  const getStockStatus = (current: number, reorderPoint: number) => {
    if (current <= reorderPoint * 0.5) return { status: "Critical", color: "bg-red-500" };
    if (current <= reorderPoint) return { status: "Low Stock", color: "bg-orange-500" };
    return { status: "In Stock", color: "bg-green-500" };
  };

  const renderVendorCard = (vendor: any) => {
    const isSelected = selectedProducts.includes(vendor.id.toString());
    
    return (
      <Card key={vendor.id} className="relative group hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onProductSelect(vendor.id.toString(), checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold mb-1">{vendor.name}</CardTitle>
                <Badge variant="outline" className="mb-2">{vendor.company_type || 'Supplier'}</Badge>
                <p className="text-sm text-gray-600 mb-1">{vendor.country}</p>
                <p className="text-sm text-gray-500">{vendor.email}</p>
                <p className="text-sm text-gray-500">{vendor.phone}</p>
              </div>
            </div>
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Lead Time</p>
              <p className="font-semibold">{vendor.lead_time_days || 7} days</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Terms</p>
              <p className="font-semibold">{vendor.payment_terms || 'NET30'}</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-500 hover:text-blue-700"
                onClick={() => onProductDetails(vendor, 'vendor')}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Badge variant={vendor.active ? "default" : "secondary"}>
              {vendor.active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFabricCard = (fabric: any) => {
    const stockStatus = getStockStatus(fabric.quantity || 0, fabric.reorder_point || 10);
    const isSelected = selectedProducts.includes(fabric.id.toString());
    const mainImage = fabric.images && fabric.images.length > 0 ? fabric.images[0] : null;
    
    return (
      <Card key={fabric.id} className="relative group hover:shadow-lg transition-shadow">
        <CardHeader className="p-0">
          <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
            {mainImage ? (
              <img 
                src={mainImage} 
                alt={fabric.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="absolute top-2 right-2 flex gap-2">
              <Badge className={`${stockStatus.color} text-white`}>
                {stockStatus.status}
              </Badge>
            </div>
            <div className="absolute top-2 left-2 flex gap-2">
              {fabric.tags && fabric.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {isSelected && (
                <Badge variant="default" className="bg-blue-500">
                  Selected
                </Badge>
              )}
            </div>
            <div className="absolute bottom-2 left-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onProductSelect(fabric.id.toString(), checked as boolean)}
                className="bg-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg font-semibold mb-2">{fabric.name}</CardTitle>
          <p className="text-sm text-gray-600 mb-1">{fabric.product_code || fabric.sku}</p>
          <p className="text-sm text-gray-500 mb-1">{fabric.vendor?.name}</p>
          <p className="text-sm text-gray-500 mb-1">{fabric.category}</p>
          <p className="text-sm text-gray-500 mb-3">{fabric.collection?.name}</p>
          
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div>
              <p className="text-gray-500">Price</p>
              <p className="font-semibold">{formatCurrency(fabric.cost_per_unit || 0)}/{fabric.unit}</p>
            </div>
            <div>
              <p className="text-gray-500">In Stock</p>
              <p className="font-semibold">{fabric.quantity || 0} {fabric.unit}</p>
            </div>
            <div>
              <p className="text-gray-500">Width</p>
              <p className="font-semibold">{fabric.fabric_width || fabric.width || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-semibold">{fabric.location || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-500 hover:text-blue-700"
                onClick={() => onProductDetails(fabric, 'fabric')}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {(fabric.quantity || 0) <= (fabric.reorder_point || 10) && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderHardwareCard = (hardware: any) => {
    const stockStatus = getStockStatus(hardware.quantity || 0, hardware.reorder_point || 5);
    const isSelected = selectedProducts.includes(hardware.id.toString());
    const mainImage = hardware.images && hardware.images.length > 0 ? hardware.images[0] : null;
    
    return (
      <Card key={hardware.id} className="relative group hover:shadow-lg transition-shadow">
        <CardHeader className="p-0">
          <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
            {mainImage ? (
              <img 
                src={mainImage} 
                alt={hardware.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="absolute top-2 right-2 flex gap-2">
              <Badge className={`${stockStatus.color} text-white`}>
                {stockStatus.status}
              </Badge>
            </div>
            <div className="absolute top-2 left-2 flex gap-2">
              {hardware.tags && hardware.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {isSelected && (
                <Badge variant="default" className="bg-blue-500">
                  Selected
                </Badge>
              )}
            </div>
            <div className="absolute bottom-2 left-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onProductSelect(hardware.id.toString(), checked as boolean)}
                className="bg-white"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg font-semibold mb-2">{hardware.name}</CardTitle>
          <p className="text-sm text-gray-600 mb-1">{hardware.product_code}</p>
          <p className="text-sm text-gray-500 mb-1">{hardware.vendor?.name}</p>
          <Badge variant="secondary" className="mb-3 text-xs">{hardware.category}</Badge>
          
          <div className="grid grid-cols-2 gap-2 text-xs mb-3">
            <div>
              <p className="text-gray-500">Price</p>
              <p className="font-semibold">{formatCurrency(hardware.cost_per_unit || 0)}/{hardware.unit}</p>
            </div>
            <div>
              <p className="text-gray-500">In Stock</p>
              <p className="font-semibold">{hardware.quantity || 0} {hardware.unit}s</p>
            </div>
            <div>
              <p className="text-gray-500">Material</p>
              <p className="font-semibold">{hardware.material || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-semibold">{hardware.location || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-500 hover:text-blue-700"
                onClick={() => onProductDetails(hardware, 'hardware')}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {(hardware.quantity || 0) <= (hardware.reorder_point || 5) && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return {
    renderVendorCard,
    renderFabricCard,
    renderHardwareCard
  };
};
