import { useEnhancedInventoryByCategory } from "@/hooks/useEnhancedInventory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Ruler, EyeOff } from "lucide-react";
import { AddInventoryDialog } from "./AddInventoryDialog";
import { UnifiedInventoryDialog } from "./UnifiedInventoryDialog";
import { useToast } from "@/hooks/use-toast";
import { useDeleteEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { useState } from "react";
import { EyeletRing } from "./EyeletRingSelector";

interface HeadingInventoryViewProps {
  searchQuery: string;
  viewMode: "grid" | "list";
}

export const HeadingInventoryView = ({ searchQuery, viewMode }: HeadingInventoryViewProps) => {
  const { data: headings = [], refetch } = useEnhancedInventoryByCategory('heading');
  const deleteItem = useDeleteEnhancedInventoryItem();
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<any>(null);

  // Filter and clean data - ensure we're only showing heading items from enhanced_inventory
  const filteredHeadings = headings
    .filter(heading => heading.category === 'heading') // Only show heading category items
    .filter(heading =>
      heading.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      heading.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete ${name}?`)) {
      try {
        await deleteItem.mutateAsync(id);
        toast({ title: "Heading deleted successfully" });
      } catch (error) {
        toast({ title: "Failed to delete heading", variant: "destructive" });
      }
    }
  };

  if (filteredHeadings.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Ruler className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Heading Tapes Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "No headings match your search." : "Add pleating tapes, wave tapes, eyelet tapes, and rings to your inventory."}
          </p>
          <AddInventoryDialog
            trigger={<Button>Add Heading Tape</Button>}
            onSuccess={refetch}
            initialCategory="heading"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {filteredHeadings.length} heading{filteredHeadings.length !== 1 ? 's' : ''} found
          </p>
          <AddInventoryDialog
            trigger={<Button>Add Heading</Button>}
            onSuccess={refetch}
            initialCategory="heading"
          />
        </div>

        <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
          {filteredHeadings.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{item.name || 'Unnamed Heading'}</CardTitle>
                    {item.description && (
                      <CardDescription className="text-xs mt-1 line-clamp-2">
                        {item.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingItem(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id, item.name || 'this heading')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {item.subcategory && (
                    <Badge variant="outline" className="text-xs capitalize">
                      {item.subcategory.replace(/_/g, ' ')}
                    </Badge>
                  )}
                  
                  {item.fullness_ratio && item.fullness_ratio > 0 && (
                    <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs">
                      {item.fullness_ratio}x Fullness
                    </Badge>
                  )}

                  {(item as any).show_in_quote === false && (
                    <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400 text-xs">
                      <EyeOff className="h-3 w-3 mr-1" />
                      Hidden
                    </Badge>
                  )}

                  {!item.subcategory && !item.fullness_ratio && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Legacy Item - Click Edit to Update
                    </Badge>
                  )}
                </div>

                {(item.cost_price || item.selling_price) ? (
                  <div className="flex gap-2 text-sm">
                    {item.cost_price && item.cost_price > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Cost: ${item.cost_price.toFixed(2)}/m
                      </Badge>
                    )}
                    {item.selling_price && item.selling_price > 0 && (
                      <Badge variant="default" className="text-xs">
                        Price: ${item.selling_price.toFixed(2)}/m
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No pricing set</p>
                )}

                {(item as any).eyelet_ring_ids && (item as any).eyelet_ring_ids.length > 0 && (
                  <div className="p-2 bg-muted/30 rounded-lg">
                    <p className="text-xs font-medium mb-1.5">Eyelet Rings:</p>
                    <Badge variant="secondary" className="text-xs">
                      {(item as any).eyelet_ring_ids.length} ring{(item as any).eyelet_ring_ids.length !== 1 ? 's' : ''} selected
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {editingItem && (
        <UnifiedInventoryDialog
          mode="edit"
          item={editingItem}
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          onSuccess={() => {
            setEditingItem(null);
            refetch();
          }}
        />
      )}
    </>
  );
};
