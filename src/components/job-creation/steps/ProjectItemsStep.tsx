
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Package, Scissors, Wrench } from "lucide-react";

interface ProjectItem {
  id: string;
  type: "fabric" | "product" | "service";
  name: string;
  quantity: number;
  unit: string;
  price: number;
  supplier?: string;
  notes?: string;
}

interface ProjectItemsStepProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export const ProjectItemsStep = ({ formData, updateFormData }: ProjectItemsStepProps) => {
  const [items, setItems] = useState<ProjectItem[]>(formData.project_items || []);

  const addItem = (type: ProjectItem['type']) => {
    const newItem: ProjectItem = {
      id: Date.now().toString(),
      type,
      name: "",
      quantity: 1,
      unit: type === "fabric" ? "yards" : "units",
      price: 0,
      supplier: "",
      notes: ""
    };
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    updateFormData("project_items", updatedItems);
  };

  const updateItem = (id: string, field: keyof ProjectItem, value: any) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setItems(updatedItems);
    updateFormData("project_items", updatedItems);
  };

  const removeItem = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    updateFormData("project_items", updatedItems);
  };

  const getItemIcon = (type: ProjectItem['type']) => {
    switch (type) {
      case "fabric": return <Scissors className="h-4 w-4" />;
      case "product": return <Package className="h-4 w-4" />;
      case "service": return <Wrench className="h-4 w-4" />;
    }
  };

  const getTotalValue = () => {
    return items.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Project Items</h3>
        <p className="text-sm text-gray-500">
          Add fabrics, products, and services for this job. This helps with inventory tracking and ordering.
        </p>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={() => addItem("fabric")} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Scissors className="h-4 w-4" />
          Add Fabric
        </Button>
        <Button 
          onClick={() => addItem("product")} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Package className="h-4 w-4" />
          Add Product
        </Button>
        <Button 
          onClick={() => addItem("service")} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Wrench className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No items added yet</p>
            <p className="text-sm text-gray-400">Add fabrics, products, or services to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {getItemIcon(item.type)}
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </CardTitle>
                  <Button 
                    onClick={() => removeItem(item.id)}
                    variant="ghost" 
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`name-${item.id}`}>Name *</Label>
                    <Input
                      id={`name-${item.id}`}
                      value={item.name}
                      onChange={(e) => updateItem(item.id, "name", e.target.value)}
                      placeholder={`${item.type} name`}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`supplier-${item.id}`}>Supplier</Label>
                    <Input
                      id={`supplier-${item.id}`}
                      value={item.supplier || ""}
                      onChange={(e) => updateItem(item.id, "supplier", e.target.value)}
                      placeholder="Supplier name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`quantity-${item.id}`}>Quantity *</Label>
                    <Input
                      id={`quantity-${item.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`unit-${item.id}`}>Unit</Label>
                    <Select 
                      value={item.unit} 
                      onValueChange={(value) => updateItem(item.id, "unit", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {item.type === "fabric" ? (
                          <>
                            <SelectItem value="yards">Yards</SelectItem>
                            <SelectItem value="meters">Meters</SelectItem>
                            <SelectItem value="feet">Feet</SelectItem>
                          </>
                        ) : (
                          <>
                            <SelectItem value="units">Units</SelectItem>
                            <SelectItem value="pieces">Pieces</SelectItem>
                            <SelectItem value="sets">Sets</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`price-${item.id}`}>Unit Price ($)</Label>
                    <Input
                      id={`price-${item.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`notes-${item.id}`}>Notes</Label>
                  <Textarea
                    id={`notes-${item.id}`}
                    value={item.notes || ""}
                    onChange={(e) => updateItem(item.id, "notes", e.target.value)}
                    placeholder="Additional notes about this item..."
                    rows={2}
                  />
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Total: ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Project Value:</span>
                <span className="text-lg font-bold text-green-600">
                  ${getTotalValue().toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
