import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Ruler, Palette, Package, AlertTriangle, Edit, Eye } from "lucide-react";
import { useInventory } from "@/hooks/useInventory";

interface FabricInventoryViewProps {
  searchQuery: string;
  viewMode: "grid" | "list";
}

export const FabricInventoryView = ({ searchQuery, viewMode }: FabricInventoryViewProps) => {
  const { data: inventory, isLoading } = useInventory();
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [widthFilter, setWidthFilter] = useState<string>("all");

  const fabricItems = inventory?.filter(item => 
    item.category === "fabric" ||
    item.category === "curtain_fabric" ||
    item.category === "blind_fabric"
  ) || [];

  const filteredItems = fabricItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
          <CardTitle className="text-lg">Fabric Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Collection</label>
              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger>
                  <SelectValue placeholder="All Collections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Collections</SelectItem>
                  <SelectItem value="luxury">Luxury Collection</SelectItem>
                  <SelectItem value="modern">Modern Collection</SelectItem>
                  <SelectItem value="classic">Classic Collection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="curtain">Curtain Fabric</SelectItem>
                  <SelectItem value="blind">Blind Material</SelectItem>
                  <SelectItem value="sheer">Sheer Fabric</SelectItem>
                  <SelectItem value="blackout">Blackout Fabric</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Width</label>
              <Select value={widthFilter} onValueChange={setWidthFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Widths" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Widths</SelectItem>
                  <SelectItem value="narrow">Up to 140cm</SelectItem>
                  <SelectItem value="medium">140-280cm</SelectItem>
                  <SelectItem value="wide">280cm+</SelectItem>
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

      {/* Fabric Grid */}
      {viewMode === "grid" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-t-lg flex items-center justify-center">
                  <Palette className="h-12 w-12 text-blue-300" />
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  {item.quantity <= (item.reorder_point || 5) && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Low Stock
                    </Badge>
                  )}
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <span>137cm wide</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{item.quantity} {item.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold">${item.unit_price}/m</div>
                      <div className="text-xs text-muted-foreground">Pattern repeat: 64cm</div>
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
                    <span>SKU: {item.sku}</span>
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
            <CardTitle>Fabric Inventory List</CardTitle>
            <CardDescription>
              Detailed view of all fabric items with specifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                      <Palette className="h-6 w-6 text-blue-300" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>SKU: {item.sku}</span>
                        <span>Width: 137cm</span>
                        <span>Pattern: 64cm repeat</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">${item.unit_price}/m</div>
                    <div className="text-sm text-muted-foreground">{item.quantity} {item.unit} available</div>
                    <div className="flex items-center gap-2 mt-2">
                      {item.quantity <= (item.reorder_point || 5) && (
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