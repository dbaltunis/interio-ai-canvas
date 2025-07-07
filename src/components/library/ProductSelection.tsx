
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";
import { Calculator, Package } from "lucide-react";

interface Product {
  id: string;
  name: string;
  type: 'fabric' | 'hardware';
  price: number;
  unit: string;
  inStock: number;
}

interface ProductSelectionProps {
  selectedProducts: string[];
  onCalculateUsage: (productId: string, quantity: number) => void;
  onAddToProject: (projectId: string) => void;
}

export const ProductSelection = ({ 
  selectedProducts, 
  onCalculateUsage, 
  onAddToProject 
}: ProductSelectionProps) => {
  const { formatFabric } = useMeasurementUnits();
  const [selectedProject, setSelectedProject] = useState("");
  const [calculationQuantity, setCalculationQuantity] = useState<Record<string, number>>({});

  // Mock projects - replace with actual project data
  const projects = [
    { id: "1", name: "Living Room Renovation" },
    { id: "2", name: "Master Bedroom Update" },
    { id: "3", name: "Office Makeover" }
  ];

  // Mock selected products data - replace with actual product data
  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Merlon Custard Linen",
      type: "fabric",
      price: 120.00,
      unit: "yard",
      inStock: 45.5
    },
    {
      id: "2", 
      name: "Professional Track System",
      type: "hardware",
      price: 45.00,
      unit: "meter",
      inStock: 125
    }
  ];

  const selectedProductsData = mockProducts.filter(p => 
    selectedProducts.includes(p.id)
  );

  const handleQuantityChange = (productId: string, quantity: number) => {
    setCalculationQuantity(prev => ({
      ...prev,
      [productId]: quantity
    }));
  };

  const handleCalculateForProduct = (productId: string) => {
    const quantity = calculationQuantity[productId] || 0;
    if (quantity > 0) {
      onCalculateUsage(productId, quantity);
    }
  };

  const handleAddAllToProject = () => {
    if (selectedProject) {
      onAddToProject(selectedProject);
    }
  };

  if (selectedProducts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No products selected</p>
          <p className="text-sm text-gray-400">Select products from the inventory to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Selected Products ({selectedProducts.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedProductsData.map(product => (
            <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{product.name}</h4>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant={product.type === 'fabric' ? 'default' : 'secondary'}>
                    {product.type}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    ${product.price.toFixed(2)}/{product.unit}
                  </span>
                  <span className="text-sm text-gray-600">
                    Stock: {formatFabric(product.inStock)}
                  </span>
                </div>
              </div>
              
              {product.type === 'fabric' && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    className="w-20"
                    value={calculationQuantity[product.id] || ''}
                    onChange={(e) => handleQuantityChange(product.id, Number(e.target.value))}
                  />
                  <Button
                    size="sm"
                    onClick={() => handleCalculateForProduct(product.id)}
                    disabled={!calculationQuantity[product.id]}
                  >
                    <Calculator className="h-4 w-4 mr-1" />
                    Calculate
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add to Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Project</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleAddAllToProject}
            disabled={!selectedProject}
            className="w-full"
          >
            Add All Products to Project
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
