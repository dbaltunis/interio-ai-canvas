import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, AlertCircle, ShoppingCart, Sparkles } from "lucide-react";
import { useProjectMaterialAllocations } from "@/hooks/useProjectMaterialAllocations";
import { AllocateMaterialDialog } from "./AllocateMaterialDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useTreatments } from "@/hooks/useTreatments";

interface ProjectMaterialsTabProps {
  projectId: string;
}

export function ProjectMaterialsTab({ projectId }: ProjectMaterialsTabProps) {
  const [showAllocateDialog, setShowAllocateDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const { data: allocations, isLoading } = useProjectMaterialAllocations(projectId);
  const { data: inventory } = useEnhancedInventory();
  const { data: suppliers } = useSuppliers();
  const { data: treatments } = useTreatments(projectId);

  // Extract materials from treatments
  const treatmentMaterials = useMemo(() => {
    if (!treatments || !inventory) return [];

    const materials: Array<{
      id: string;
      name: string;
      category: string;
      quantity: number;
      unit: string;
      supplier?: string;
      source: string;
      treatment_name: string;
      fabric_id?: string;
    }> = [];

    treatments.forEach((treatment) => {
      // Extract fabric materials
      const fabricDetails = typeof treatment.fabric_details === 'object' && treatment.fabric_details 
        ? treatment.fabric_details as Record<string, any> 
        : {};
      
      const calculationDetails = typeof treatment.calculation_details === 'object' && treatment.calculation_details
        ? treatment.calculation_details as Record<string, any>
        : {};
        
      if (fabricDetails.fabricId) {
        const fabricItem = inventory.find(item => item.id === fabricDetails.fabricId);
        if (fabricItem) {
          // Calculate fabric usage from treatment
          const fabricUsage = calculationDetails.fabricUsage || 
                            fabricDetails.fabricUsage || 
                            0;

          materials.push({
            id: `${treatment.id}-fabric`,
            name: fabricItem.name,
            category: fabricItem.category || 'fabric',
            quantity: parseFloat(String(fabricUsage)) || 0,
            unit: fabricItem.unit || 'meter',
            supplier: fabricItem.supplier,
            source: 'Treatment Fabric',
            treatment_name: treatment.treatment_type || 'Treatment',
            fabric_id: fabricItem.id,
          });
        }
      }

      // Extract lining materials
      if (fabricDetails.liningFabricId) {
        const liningItem = inventory.find(item => item.id === fabricDetails.liningFabricId);
        if (liningItem) {
          const liningUsage = calculationDetails.liningUsage || 
                            fabricDetails.liningUsage || 
                            0;

          materials.push({
            id: `${treatment.id}-lining`,
            name: liningItem.name,
            category: liningItem.category || 'lining',
            quantity: parseFloat(String(liningUsage)) || 0,
            unit: liningItem.unit || 'meter',
            supplier: liningItem.supplier,
            source: 'Treatment Lining',
            treatment_name: treatment.treatment_type || 'Treatment',
            fabric_id: liningItem.id,
          });
        }
      }

      // Extract hardware/components
      const treatmentDetails = typeof treatment.treatment_details === 'object' && treatment.treatment_details
        ? treatment.treatment_details as Record<string, any>
        : {};
        
      if (treatmentDetails.hardwareId) {
        const hardwareItem = inventory.find(item => item.id === treatmentDetails.hardwareId);
        if (hardwareItem) {
          materials.push({
            id: `${treatment.id}-hardware`,
            name: hardwareItem.name,
            category: hardwareItem.category || 'hardware',
            quantity: treatment.quantity || 1,
            unit: hardwareItem.unit || 'unit',
            supplier: hardwareItem.supplier,
            source: 'Treatment Hardware',
            treatment_name: treatment.treatment_type || 'Treatment',
          });
        }
      }
    });

    return materials;
  }, [treatments, inventory]);

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

  // Calculate products that need to be ordered
  const productsToOrder = allocations?.map((allocation) => {
    const item = getInventoryItem(allocation.inventory_item_id);
    if (!item) return null;

    const needed = allocation.allocated_quantity;
    const available = item.quantity;
    const shortfall = Math.max(0, needed - available);

    if (shortfall > 0) {
      return {
        allocation,
        item,
        needed,
        available,
        shortfall,
        supplier: item.supplier,
      };
    }
    return null;
  }).filter(Boolean) || [];

  // Get unique suppliers from products to order
  const uniqueSuppliers = Array.from(new Set(productsToOrder.map(p => p?.supplier).filter(Boolean)));

  // Filter products to order
  const filteredProducts = productsToOrder.filter((product) => {
    if (!product) return false;
    
    const matchesVendor = vendorFilter === "all" || product.supplier === vendorFilter;
    const matchesStatus = statusFilter === "all" || statusFilter === "to_order";
    
    return matchesVendor && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Auto-Extracted Materials from Treatments */}
      {treatmentMaterials.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Materials from Treatments</CardTitle>
              </div>
              <Badge variant="secondary" className="ml-2">
                {treatmentMaterials.length} items auto-detected
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Treatment</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treatmentMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {material.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {material.treatment_name}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {material.quantity.toFixed(2)} {material.unit}
                    </TableCell>
                    <TableCell>
                      {material.supplier ? (
                        <Badge variant="outline" className="text-xs">
                          {material.supplier}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">No supplier</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {material.source}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Products to Order Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <CardTitle>Products to Order from Suppliers</CardTitle>
            </div>
            <Badge variant="secondary" className="ml-2">
              {productsToOrder.length} items
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="to_order">To Order</SelectItem>
              </SelectContent>
            </Select>

            <Select value={vendorFilter} onValueChange={setVendorFilter}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="All Vendors" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Vendors</SelectItem>
                {uniqueSuppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier || "unknown"}>
                    {supplier || "Unknown Supplier"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No products need to be ordered</h3>
              <p className="text-sm text-muted-foreground">
                All allocated materials are available in stock
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Needed</TableHead>
                  <TableHead className="text-right">In Stock</TableHead>
                  <TableHead className="text-right">To Order</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  if (!product) return null;
                  
                  return (
                    <TableRow key={product.allocation.id}>
                      <TableCell className="font-medium">
                        <div>{product.item.name}</div>
                        {product.item.sku && (
                          <div className="text-xs text-muted-foreground">{product.item.sku}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {product.supplier || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {product.needed} {product.item.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.available} {product.item.unit}
                      </TableCell>
                      <TableCell className="text-right font-medium text-orange-500">
                        {product.shortfall} {product.item.unit}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                          To Order
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
