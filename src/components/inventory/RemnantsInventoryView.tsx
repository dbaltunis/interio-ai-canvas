import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Package } from "lucide-react";
import { AddInventoryDialog } from "./AddInventoryDialog";
import { UnifiedInventoryDialog } from "./UnifiedInventoryDialog";
import { useToast } from "@/hooks/use-toast";
import { useDeleteEnhancedInventoryItem } from "@/hooks/useEnhancedInventory";
import { format } from "date-fns";
import { useState } from "react";

interface RemnantsInventoryViewProps {
  searchQuery: string;
  viewMode: "grid" | "list";
}

export const RemnantsInventoryView = ({ searchQuery, viewMode }: RemnantsInventoryViewProps) => {
  const { data: allInventory = [], refetch } = useEnhancedInventory();
  const deleteItem = useDeleteEnhancedInventoryItem();
  const { toast } = useToast();
  const [editingItem, setEditingItem] = useState<any>(null);

  // Filter for remnants - just use category='remnant' for simplicity
  const remnants = allInventory.filter(item => {
    const isRemnant = item.category === 'remnant';
    
    if (!isRemnant) return false;
    
    if (!searchQuery) return true;
    
    return item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.location?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete ${name}? This remnant will be removed from inventory.`)) {
      try {
        await deleteItem.mutateAsync(id);
        toast({ title: "Remnant deleted successfully" });
      } catch (error) {
        toast({ title: "Failed to delete remnant", variant: "destructive" });
      }
    }
  };

  const getAge = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < 7) return `${days}d`;
    if (days < 30) return `${Math.floor(days / 7)}w`;
    return `${Math.floor(days / 30)}mo`;
  };

  if (remnants.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Remnants Found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "No remnants match your search." : "Project leftovers will appear here. Add manually or let the system capture them automatically."}
          </p>
          <AddInventoryDialog
            trigger={<Button>Add Remnant Manually</Button>}
            onSuccess={refetch}
            initialCategory="remnant"
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
            {remnants.length} remnant{remnants.length !== 1 ? 's' : ''} found • Total value: ${remnants.reduce((sum, r) => sum + ((r.cost_price || 0) * (r.quantity || 0)), 0).toFixed(2)}
          </p>
          <AddInventoryDialog
            trigger={<Button>Add Remnant</Button>}
            onSuccess={refetch}
            initialCategory="remnant"
          />
        </div>

        <div className={viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
          {remnants.map((remnant) => (
            <Card key={remnant.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{remnant.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {getAge(remnant.created_at)} old
                      </Badge>
                    </div>
                    {remnant.description && (
                      <CardDescription className="text-xs mt-1">{remnant.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingItem(remnant)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(remnant.id, remnant.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Remaining:</span>
                  <Badge variant="default">
                    {remnant.quantity || 0} {remnant.unit || 'm'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Value:</span>
                  <span className="font-semibold">
                    ${((remnant.cost_price || 0) * (remnant.quantity || 0)).toFixed(2)}
                  </span>
                </div>
                {remnant.location && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="text-xs">{remnant.location}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Added:</span>
                  <span className="text-xs">{format(new Date(remnant.created_at), 'MMM d, yyyy')}</span>
                </div>
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
