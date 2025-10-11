import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallpaper, Trash2, Image as ImageIcon } from "lucide-react";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { AddInventoryDialog } from "./AddInventoryDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WallcoveringInventoryViewProps {
  searchQuery: string;
  viewMode: "grid" | "list";
}

export const WallcoveringInventoryView = ({ searchQuery, viewMode }: WallcoveringInventoryViewProps) => {
  const { data: inventory, refetch } = useEnhancedInventory();
  const { toast } = useToast();

  // Filter wallcovering items
  const wallcoveringItems = inventory?.filter(item => 
    item.category === 'wallcovering' || 
    item.category === 'wallpaper'
  ) || [];

  // Apply search filter
  const filteredItems = wallcoveringItems.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wallcovering?')) return;

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete wallcovering",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Wallcovering deleted successfully",
      });
      refetch();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Wallcoverings</h2>
            <p className="text-sm text-muted-foreground">
              Manage your wallpaper and wallcovering inventory
            </p>
          </div>
          <AddInventoryDialog
            trigger={
              <Button>
                <Wallpaper className="h-4 w-4 mr-2" />
                Add Wallcovering
              </Button>
            }
            onSuccess={() => refetch()}
          />
        </div>

        <div className="rounded-md border">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Image</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Roll Size</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Pattern Repeat</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="h-12 w-12 rounded object-cover" />
                    ) : (
                      <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{item.sku || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {(item as any).wallpaper_roll_width && (item as any).wallpaper_roll_length ? (
                      <span>{(item as any).wallpaper_roll_width}cm × {(item as any).wallpaper_roll_length}m</span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {item.pattern_repeat_vertical ? `${item.pattern_repeat_vertical}cm` : '-'}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatPrice(item.price_per_meter || item.selling_price || 0)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={(item as any).stock_quantity && (item as any).stock_quantity > 0 ? "default" : "secondary"}>
                      {(item as any).stock_quantity || 0} rolls
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              No wallcoverings found
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Wallcoverings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your wallpaper and wallcovering inventory
          </p>
        </div>
        <AddInventoryDialog
          trigger={
            <Button>
              <Wallpaper className="h-4 w-4 mr-2" />
              Add Wallcovering
            </Button>
          }
          onSuccess={() => refetch()}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="group hover:shadow-lg transition-all overflow-hidden">
            <div className="aspect-square relative overflow-hidden bg-muted">
              {item.image_url ? (
                <img 
                  src={item.image_url} 
                  alt={item.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Wallpaper className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-base line-clamp-1">{item.name}</CardTitle>
              <CardDescription className="text-xs">{item.sku || 'No SKU'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Roll Size:</span>
                  <span className="font-medium">
                    {(item as any).wallpaper_roll_width && (item as any).wallpaper_roll_length 
                      ? `${(item as any).wallpaper_roll_width}cm × ${(item as any).wallpaper_roll_length}m`
                      : '-'}
                  </span>
                </div>
                {item.pattern_repeat_vertical && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pattern Repeat:</span>
                    <span className="font-medium">{item.pattern_repeat_vertical}cm</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-bold text-primary">
                    {formatPrice(item.price_per_meter || item.selling_price || 0)}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Stock:</span>
                  <Badge variant={(item as any).stock_quantity && (item as any).stock_quantity > 0 ? "default" : "secondary"}>
                    {(item as any).stock_quantity || 0} rolls
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 rounded-full bg-muted">
              <Wallpaper className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No wallcoverings found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? 'Try adjusting your search' : 'Add your first wallcovering to get started'}
              </p>
            </div>
            {!searchQuery && (
              <AddInventoryDialog
                trigger={
                  <Button>
                    <Wallpaper className="h-4 w-4 mr-2" />
                    Add Wallcovering
                  </Button>
                }
                onSuccess={() => refetch()}
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
