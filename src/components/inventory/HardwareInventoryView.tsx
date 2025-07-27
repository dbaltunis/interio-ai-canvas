import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Wrench, Package, AlertTriangle, Edit, Eye, Settings } from "lucide-react";
import { useHardwareInventory } from "@/hooks/useHardwareInventory";

interface HardwareInventoryViewProps {
  searchQuery: string;
  viewMode: "grid" | "list";
}

export const HardwareInventoryView = ({ searchQuery, viewMode }: HardwareInventoryViewProps) => {
  const { data: hardware, isLoading } = useHardwareInventory();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all");

  const filteredItems = hardware?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.product_code?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-t-lg" />
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hardware Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="tracks">Tracks</SelectItem>
                  <SelectItem value="rods">Rods</SelectItem>
                  <SelectItem value="brackets">Brackets</SelectItem>
                  <SelectItem value="motors">Motors</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Material</label>
              <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                <SelectTrigger>
                  <SelectValue placeholder="All Materials" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Materials</SelectItem>
                  <SelectItem value="aluminum">Aluminum</SelectItem>
                  <SelectItem value="steel">Steel</SelectItem>
                  <SelectItem value="plastic">Plastic</SelectItem>
                  <SelectItem value="brass">Brass</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Installation</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ceiling">Ceiling Mount</SelectItem>
                  <SelectItem value="wall">Wall Mount</SelectItem>
                  <SelectItem value="recess">Recess Mount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Stock Status</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hardware Grid */}
      {viewMode === "grid" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-slate-50 to-slate-100 rounded-t-lg flex items-center justify-center">
                  <Wrench className="h-12 w-12 text-slate-300" />
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  {item.quantity <= item.reorder_point && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Low Stock
                    </Badge>
                  )}
                  {item.status === "in_stock" && (
                    <Badge variant="secondary" className="text-xs">In Stock</Badge>
                  )}
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.subcategory}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span>{item.material}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{item.quantity} {item.unit}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Specifications:</div>
                    <div className="text-sm">
                      {item.specifications?.weight_capacity && (
                        <span>Capacity: {item.specifications.weight_capacity}</span>
                      )}
                      {item.specifications?.length && (
                        <span className="ml-2">Length: {item.specifications.length}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold">${item.retail_price}</div>
                      <div className="text-xs text-muted-foreground">Cost: ${item.cost_per_unit}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Code: {item.product_code}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Hardware Inventory List</CardTitle>
            <CardDescription>
              Detailed view of all hardware items with specifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center">
                      <Wrench className="h-6 w-6 text-slate-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.subcategory} - {item.material}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Code: {item.product_code}</span>
                        <span>Finish: {item.finish}</span>
                        {item.specifications?.weight_capacity && (
                          <span>Capacity: {item.specifications.weight_capacity}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">${item.retail_price}</div>
                    <div className="text-sm text-muted-foreground">{item.quantity} {item.unit} available</div>
                    <div className="flex items-center gap-2 mt-2">
                      {item.quantity <= item.reorder_point && (
                        <Badge variant="destructive" className="text-xs">Low Stock</Badge>
                      )}
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};