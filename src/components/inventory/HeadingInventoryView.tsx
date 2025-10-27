import { useEnhancedInventoryByCategory } from "@/hooks/useEnhancedInventory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Ruler } from "lucide-react";
import { AddInventoryDialog } from "./AddInventoryDialog";
import { UnifiedInventoryDialog } from "./UnifiedInventoryDialog";
import { useToast } from "@/hooks/use-toast";
import { useDeleteEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { useState } from "react";

interface HeadingInventoryViewProps {
  searchQuery: string;
  viewMode: "grid" | "list";
}

export const HeadingInventoryView = ({ searchQuery, viewMode }: HeadingInventoryViewProps) => {
  const { data: headings = [], refetch } = useEnhancedInventoryByCategory('heading');
  const deleteItem = useDeleteEnhancedInventoryItem();
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<any>(null);

  const filteredHeadings = headings.filter(heading =>
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
          {filteredHeadings.map((heading) => (
            <Card key={heading.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{heading.name}</CardTitle>
                    {heading.treatment_type && (
                      <Badge variant="secondary" className="mt-1 text-xs capitalize">
                        {heading.treatment_type}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingItem(heading)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(heading.id, heading.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Price per meter:</span>
                  <span className="font-semibold">${heading.price_per_meter?.toFixed(2) || '0.00'}</span>
                </div>
                {heading.fullness_ratio && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fullness ratio:</span>
                    <Badge variant="outline">{heading.fullness_ratio}x</Badge>
                  </div>
                )}
                {heading.quantity && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">In stock:</span>
                    <Badge variant={heading.quantity > 0 ? "default" : "destructive"}>
                      {heading.quantity}m
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
