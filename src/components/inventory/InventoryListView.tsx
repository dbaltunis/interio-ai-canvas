import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Edit, 
  ShoppingCart, 
  AlertTriangle,
  Package,
  Palette,
  Wrench,
  Scissors,
  Eye,
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

interface InventoryListViewProps {
  inventory: InventoryItem[];
  lowStockItems: InventoryItem[];
}

export const InventoryListView = ({ inventory, lowStockItems }: InventoryListViewProps) => {
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
    if (!category) return "secondary";
    
    const cat = category.toLowerCase();
    if (cat.includes("fabric") || cat.includes("textile")) return "default";
    if (cat.includes("hardware") || cat.includes("track") || cat.includes("rod")) return "secondary";
    if (cat.includes("accessories") || cat.includes("trim")) return "outline";
    return "secondary";
  };

  const isLowStock = (item: InventoryItem) => {
    return lowStockItems.some(lowItem => lowItem.id === item.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory Items ({inventory.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Item Details</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => {
              const CategoryIcon = getCategoryIcon(item.category);
              const lowStock = isLowStock(item);
              const totalValue = (item.unit_price || item.cost_price || 0) * item.quantity;
              
              return (
                <TableRow key={item.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="p-2 rounded-lg bg-muted/50 w-fit">
                      <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{item.name}</div>
                      {item.sku && (
                        <div className="text-sm text-muted-foreground font-mono">{item.sku}</div>
                      )}
                      {item.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={getCategoryColor(item.category) as any}>
                      {item.category || "Uncategorized"}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className={`font-medium ${lowStock ? 'text-orange-600' : 'text-foreground'}`}>
                        {item.quantity} {item.unit || 'units'}
                      </div>
                      {item.location && (
                        <div className="text-xs text-muted-foreground">
                          📍 {item.location}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-medium">
                      {item.unit_price ? formatCurrency(item.unit_price) : 'N/A'}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-medium">
                      {formatCurrency(totalValue)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      {item.supplier || 'N/A'}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {lowStock ? (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        In Stock
                      </Badge>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
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
                        {lowStock && (
                          <DropdownMenuItem>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Reorder Now
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};