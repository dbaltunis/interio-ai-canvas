import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProductTemplates, mockTemplates } from "@/hooks/useProductTemplates";
import { useToast } from "@/hooks/use-toast";

interface ProductDetailsStepProps {
  selectedProducts: any[];
  onProductsChange: (products: any[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export const ProductDetailsStep = ({ 
  selectedProducts, 
  onProductsChange, 
  onNext, 
  onBack 
}: ProductDetailsStepProps) => {
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const { data: templates = mockTemplates } = useProductTemplates();
  const { toast } = useToast();

  const handleProductSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      toast({
        title: "Error",
        description: "Product template not found",
        variant: "destructive"
      });
      return;
    }

    const newProduct = {
      id: template.id,
      name: template.name,
      template: template,
      quantity: 1,
      options: {}
    };

    onProductsChange([...selectedProducts, newProduct]);
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    const updatedProducts = selectedProducts.map(product => {
      if (product.id === productId) {
        return { ...product, quantity: quantity };
      }
      return product;
    });
    onProductsChange(updatedProducts);
  };

  const handleRemoveProduct = (productId: string) => {
    const updatedProducts = selectedProducts.filter(product => product.id !== productId);
    onProductsChange(updatedProducts);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Select Products</CardTitle>
          <CardDescription>Choose the products for this job</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {templates.map((template) => (
            <Button 
              key={template.id} 
              variant="outline"
              onClick={() => handleProductSelect(template.id)}
            >
              {template.name} <Badge>{template.product_type}</Badge>
            </Button>
          ))}
        </CardContent>
      </Card>

      {selectedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Products</CardTitle>
            <CardDescription>Adjust quantities and options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProducts.map((product) => (
              <div key={product.id} className="border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleQuantityChange(product.id, Number(e.target.value))}
                      className="w-20 border rounded-md px-2 py-1"
                    />
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveProduct(product.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
                {/* Options Configuration (To be implemented) */}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={selectedProducts.length === 0}>
          Next
        </Button>
      </div>
    </div>
  );
};
