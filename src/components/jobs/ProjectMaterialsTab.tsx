import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, AlertCircle } from "lucide-react";
import { useProjectMaterialAllocations } from "@/hooks/useProjectMaterialAllocations";
import { AllocateMaterialDialog } from "./AllocateMaterialDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";

interface ProjectMaterialsTabProps {
  projectId: string;
}

export function ProjectMaterialsTab({ projectId }: ProjectMaterialsTabProps) {
  const [showAllocateDialog, setShowAllocateDialog] = useState(false);
  const { data: allocations, isLoading } = useProjectMaterialAllocations(projectId);
  const { data: inventory } = useEnhancedInventory();

  const getInventoryItem = (itemId: string) => {
    return inventory?.find((item) => item.id === itemId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "allocated":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "used":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "returned":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading materials...</div>;
  }

  const totalAllocated = allocations?.reduce((sum, a) => sum + a.allocated_quantity, 0) || 0;
  const totalUsed = allocations?.reduce((sum, a) => sum + a.used_quantity, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items Allocated</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allocations?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantity Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAllocated}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantity Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Materials List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Allocated Materials</CardTitle>
            <Button onClick={() => setShowAllocateDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Allocate Material
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!allocations || allocations.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No materials allocated</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start tracking materials by allocating inventory items to this project
              </p>
              <Button onClick={() => setShowAllocateDialog(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Allocate First Material
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Allocated</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.map((allocation) => {
                  const item = getInventoryItem(allocation.inventory_item_id);
                  const remaining = allocation.allocated_quantity - allocation.used_quantity;
                  
                  return (
                    <TableRow key={allocation.id}>
                      <TableCell className="font-medium">
                        {item?.name || "Unknown Item"}
                        {item?.sku && (
                          <div className="text-xs text-muted-foreground">{item.sku}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item?.category || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {allocation.allocated_quantity} {item?.unit || "units"}
                      </TableCell>
                      <TableCell className="text-right">
                        {allocation.used_quantity} {item?.unit || "units"}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={remaining < 0 ? "text-destructive font-medium" : ""}>
                          {remaining} {item?.unit || "units"}
                        </span>
                        {remaining < 0 && (
                          <AlertCircle className="h-3 w-3 inline ml-1 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(allocation.status)}>
                          {allocation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {new Date(allocation.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AllocateMaterialDialog
        projectId={projectId}
        open={showAllocateDialog}
        onOpenChange={setShowAllocateDialog}
      />
    </div>
  );
}
