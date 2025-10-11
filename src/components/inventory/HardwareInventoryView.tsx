import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Minus, Plus, Search, Image as ImageIcon, Trash2, Edit } from "lucide-react";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { AddInventoryDialog } from "./AddInventoryDialog";
import { EditInventoryDialog } from "./EditInventoryDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HardwareInventoryViewProps {
  searchQuery: string;
  viewMode: "grid" | "list";
}

const HARDWARE_CATEGORIES = [
  { key: "all", label: "All Hardware" },
  { key: "poles", label: "Poles" },
  { key: "tracks", label: "Tracks" },
  { key: "motors", label: "Motorisation" },
  { key: "components", label: "Components" }
];

export const HardwareInventoryView = ({ searchQuery, viewMode }: HardwareInventoryViewProps) => {
  const { data: inventory, refetch } = useEnhancedInventory();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("all");
  const [localSearch, setLocalSearch] = useState("");

  const hardwareItems = inventory?.filter(item => 
    item.category === 'track' || 
    item.category === 'rod' || 
    item.category === 'bracket' ||
    item.category === 'motor' ||
    item.category === 'accessory'
  ) || [];

  const filteredItems = hardwareItems.filter(item => {
    const matchesGlobalSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocalSearch = item.name?.toLowerCase().includes(localSearch.toLowerCase()) ||
      item.sku?.toLowerCase().includes(localSearch.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(localSearch.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || 
      (activeCategory === "poles" && item.category === "rod") ||
      (activeCategory === "tracks" && item.category === "track") ||
      (activeCategory === "motors" && item.category === "motor") ||
      (activeCategory === "components" && (item.category === "bracket" || item.category === "accessory"));

    return matchesGlobalSearch && matchesLocalSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hardware item?')) return;

    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete hardware",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Hardware deleted successfully",
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-lg">
            <Minus className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Hardware</h2>
            <p className="text-sm text-muted-foreground">
              {filteredItems.length} hardware items in inventory
            </p>
          </div>
        </div>
        {/* Search - Compact */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hardware..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="bg-background border-b border-border/50 rounded-none p-0 h-auto flex w-full justify-start gap-0">
          {HARDWARE_CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.key}
              value={cat.key}
              className="px-4 py-3 transition-all duration-200 text-sm font-medium border-b-2 border-transparent data-[state=active]:text-foreground data-[state=active]:border-primary data-[state=active]:font-semibold rounded-none text-muted-foreground hover:text-foreground"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {HARDWARE_CATEGORIES.map((cat) => (
          <TabsContent key={cat.key} value={cat.key} className="mt-6">
            {viewMode === "grid" ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredItems.map((item) => (
                  <Card key={item.id} className="group hover:shadow-lg transition-all overflow-hidden">
                    <div className="aspect-[16/5] relative overflow-hidden bg-muted">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Minus className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <EditInventoryDialog 
                          item={item}
                          trigger={
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          }
                        />
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
                        {item.supplier && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Supplier:</span>
                            <span className="font-medium">{item.supplier}</span>
                          </div>
                        )}
                        {(item as any).material && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Material:</span>
                            <span className="font-medium">{(item as any).material}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-bold text-primary">
                            {formatPrice(item.selling_price || 0)}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Stock:</span>
                          <Badge variant={item.quantity && item.quantity > 0 ? "default" : "secondary"}>
                            {item.quantity || 0} units
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-md border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Image</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">SKU</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Supplier</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Material</th>
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
                        <td className="px-4 py-3 text-sm">{item.supplier || '-'}</td>
                        <td className="px-4 py-3 text-sm">{(item as any).material || '-'}</td>
                        <td className="px-4 py-3 font-medium">
                          {formatPrice(item.selling_price || 0)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={item.quantity && item.quantity > 0 ? "default" : "secondary"}>
                            {item.quantity || 0} units
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <EditInventoryDialog 
                              item={item}
                              trigger={
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              }
                            />
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
                    No hardware items found
                  </div>
                )}
              </div>
            )}

            {filteredItems.length === 0 && viewMode === "grid" && (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-muted">
                    <Minus className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">No hardware found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {localSearch || searchQuery ? 'Try adjusting your search' : 'Add your first hardware item to get started'}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};