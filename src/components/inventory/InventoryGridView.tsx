import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Edit, 
  ShoppingCart, 
  AlertTriangle,
  Package,
  Palette,
  Wrench,
  Scissors,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  quantity: number;
  unit?: string;
  unit_price?: number;
  cost_price?: number;
  supplier?: string;
  location?: string;
}

interface InventoryGridViewProps {
  inventory: InventoryItem[];
  lowStockItems: InventoryItem[];
}

export const InventoryGridView = ({ inventory, lowStockItems }: InventoryGridViewProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCategoryIcon = (category?: string) => {
    if (!category) return Package;
    
    const cat = category.toLowerCase();
    if (cat.includes("fabric") || cat.includes("textile")) return Palette;
    if (cat.includes("hardware") || cat.includes("track") || cat.includes("rod")) return Wrench;
    if (cat.includes("accessories") || cat.includes("trim")) return Scissors;
    return Package;
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return "bg-gray-50 text-gray-600 border-gray-200";
    
    const cat = category.toLowerCase();
    if (cat.includes("fabric") || cat.includes("textile")) 
      return "bg-blue-50 text-blue-700 border-blue-200";
    if (cat.includes("hardware") || cat.includes("track") || cat.includes("rod")) 
      return "bg-purple-50 text-purple-700 border-purple-200";
    if (cat.includes("accessories") || cat.includes("trim")) 
      return "bg-green-50 text-green-700 border-green-200";
    return "bg-gray-50 text-gray-600 border-gray-200";
  };

  const isLowStock = (item: InventoryItem) => {
    return lowStockItems.some(lowItem => lowItem.id === item.id);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {inventory.map((item) => {
        const CategoryIcon = getCategoryIcon(item.category);
        const categoryColorClass = getCategoryColor(item.category);
        const lowStock = isLowStock(item);
        
        return (
          <Card key={item.id} className="group hover:shadow-lg transition-all duration-200 relative overflow-hidden">
            {/* Low stock indicator */}
            {lowStock && (
              <div className="absolute top-0 right-0 bg-orange-500 text-white px-2 py-1 text-xs font-medium rounded-bl-md z-10">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Low Stock
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${categoryColorClass.split(' ')[0]} border ${categoryColorClass.split(' ')[2]}`}>
                  <CategoryIcon className={`h-5 w-5 ${categoryColorClass.split(' ')[1]}`} />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Item
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Reorder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="space-y-2">
                <CardTitle className="text-lg leading-tight">{item.name}</CardTitle>
                {item.sku && (
                  <p className="text-sm text-muted-foreground font-mono">{item.sku}</p>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={categoryColorClass}>
                    {item.category || "Uncategorized"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Stock</p>
                  <p className={`font-semibold ${lowStock ? 'text-orange-600' : 'text-foreground'}`}>
                    {item.quantity} {item.unit || 'units'}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground">Unit Price</p>
                  <p className="font-semibold">
                    {item.unit_price ? formatCurrency(item.unit_price) : 'N/A'}
                  </p>
                </div>
              </div>

              {item.supplier && (
                <div>
                  <p className="text-xs text-muted-foreground">Supplier</p>
                  <p className="text-sm truncate">{item.supplier}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                {lowStock && (
                  <Button size="sm" className="flex-1 bg-orange-600 hover:bg-orange-700">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Reorder
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};