
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { Edit, Copy, Package, AlertTriangle, Calendar, MapPin } from "lucide-react";

interface ProductDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
  productType: "fabric" | "hardware" | "vendor";
}

export const ProductDetailsDialog = ({ open, onOpenChange, product, productType }: ProductDetailsDialogProps) => {
  const { formatFabric } = useMeasurementUnits();

  const formatCurrency = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$',
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    return `NZ$${amount.toFixed(2)}`;
  };

  if (!product) return null;

  const renderFabricDetails = () => (
    <div className="space-y-6">
      {/* Header with Image */}
      <div className="flex gap-6">
        <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-2">Code: {product.code}</p>
            <div className="flex gap-2 mb-4">
              <Badge variant="outline">{product.category}</Badge>
              <Badge variant="secondary">{product.pattern}</Badge>
              {product.inStock <= product.reorderPoint && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Low Stock
                </Badge>
              )}
            </div>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(product.price)}/{product.unit}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Product Information Grid */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Stock Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Stock:</span>
                <span className="font-medium">{formatFabric(product.inStock)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reorder Point:</span>
                <span className="font-medium">{formatFabric(product.reorderPoint)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{product.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Fabric Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Composition:</span>
                <span className="font-medium">{product.composition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Width:</span>
                <span className="font-medium">{product.width}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pattern Repeat:</span>
                <span className="font-medium">{product.patternRepeat}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor and Collection */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">Source Information</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Vendor:</span>
              <p className="font-medium">{product.vendor}</p>
            </div>
            <div>
              <span className="text-gray-600">Collection:</span>
              <p className="font-medium">{product.collection}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Details
        </Button>
        <Button variant="outline">
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </Button>
        <Button className="bg-green-600 hover:bg-green-700">
          Add to Project
        </Button>
      </div>
    </div>
  );

  const renderHardwareDetails = () => (
    <div className="space-y-6">
      {/* Header with Image */}
      <div className="flex gap-6">
        <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-2">Code: {product.code}</p>
            <Badge variant="secondary" className="mb-4">{product.category}</Badge>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(product.price)}/{product.unit}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Hardware Information */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Stock & Location</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">In Stock:</span>
                <span className="font-medium">{product.inStock} {product.unit}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{product.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Specifications</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Material:</span>
                <span className="font-medium">{product.material}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Weight:</span>
                <span className="font-medium">{product.maxWeight}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Details
        </Button>
        <Button variant="outline">
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </Button>
        <Button className="bg-green-600 hover:bg-green-700">
          Add to Project
        </Button>
      </div>
    </div>
  );

  const renderVendorDetails = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
        <Badge variant="outline" className="mb-4">{product.type}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Contact Information</h4>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Country:</span>
                <p className="font-medium">{product.country}</p>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <p className="font-medium">{product.contact}</p>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <p className="font-medium">{product.phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Business Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Products:</span>
                <span className="font-medium">{product.products}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Order:</span>
                <span className="font-medium">{product.lastOrder}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Vendor
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700">
          View Products
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {productType === 'fabric' ? 'Fabric Details' : 
             productType === 'hardware' ? 'Hardware Details' : 'Vendor Details'}
          </DialogTitle>
        </DialogHeader>
        
        {productType === 'fabric' && renderFabricDetails()}
        {productType === 'hardware' && renderHardwareDetails()}
        {productType === 'vendor' && renderVendorDetails()}
      </DialogContent>
    </Dialog>
  );
};
