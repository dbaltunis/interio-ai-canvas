
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useProductTypes } from "@/hooks/useProductTypes";
import { ProductTypeForm } from "./ProductTypeForm";
import { ProductTypeList } from "./ProductTypeList";

export const ProductTypesManager = () => {
  const { productTypes, isLoading, createProductType, updateProductType, deleteProductType } = useProductTypes();
  const [isCreating, setIsCreating] = useState(false);
  const [editingProductType, setEditingProductType] = useState<any>(null);

  const handleSave = async (productTypeData: any) => {
    try {
      if (editingProductType) {
        await updateProductType.mutateAsync({ id: editingProductType.id, ...productTypeData });
        setEditingProductType(null);
      } else {
        await createProductType.mutateAsync(productTypeData);
        setIsCreating(false);
      }
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading product types...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Types</CardTitle>
          <CardDescription>
            Define curtain and blind types with their calculation methods and default settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-brand-neutral">
              Create types like "Traditional Curtains", "Roman Blinds", etc. with specific calculation rules
            </p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-brand-primary hover:bg-brand-accent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product Type
            </Button>
          </div>

          {/* Create/Edit Product Type Form */}
          {(isCreating || editingProductType) && (
            <div className="mb-6">
              <ProductTypeForm
                productType={editingProductType}
                onSave={handleSave}
                onCancel={() => {
                  setIsCreating(false);
                  setEditingProductType(null);
                }}
                isEditing={!!editingProductType}
              />
            </div>
          )}

          {/* Product Types List */}
          <ProductTypeList
            productTypes={productTypes}
            onEdit={setEditingProductType}
            onDelete={deleteProductType.mutateAsync}
          />
        </CardContent>
      </Card>
    </div>
  );
};
