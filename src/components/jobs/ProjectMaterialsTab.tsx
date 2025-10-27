import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, AlertCircle, ShoppingCart, Sparkles, FileDown, Wand2 } from "lucide-react";
import { useProjectMaterialAllocations } from "@/hooks/useProjectMaterialAllocations";
import { AllocateMaterialDialog } from "./AllocateMaterialDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useProjectMaterialsUsage } from "@/hooks/useProjectMaterialsUsage";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useConvertQuoteToMaterials } from "@/hooks/useConvertQuoteToMaterials";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ProjectMaterialsTabProps {
  projectId: string;
}

export function ProjectMaterialsTab({ projectId }: ProjectMaterialsTabProps) {
  const [showAllocateDialog, setShowAllocateDialog] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set());
  const { data: allocations, isLoading } = useProjectMaterialAllocations(projectId);
  const { data: inventory } = useEnhancedInventory();
  const { data: suppliers } = useSuppliers();
  const { data: treatmentMaterials = [], isLoading: materialsLoading } = useProjectMaterialsUsage(projectId);
  const convertMaterials = useConvertQuoteToMaterials();
  
  const handleProcessMaterials = async () => {
    try {
      if (treatmentMaterials.length === 0) {
        toast.error("No materials found", {
          description: "Make sure you've saved treatments with fabrics selected in the Measurements tab"
        });
        setShowProcessDialog(false);
        return;
      }

      // Transform treatmentMaterials to the format needed by the hook
      const materialsToProcess = treatmentMaterials.map(m => ({
        itemId: m.itemId,
        itemName: m.itemName,
        quantityUsed: m.quantityUsed,
        unit: m.unit,
        currentQuantity: m.currentQuantity
      }));
      
      console.log('[MATERIALS] Processing materials:', materialsToProcess);
      
      await convertMaterials.mutateAsync({ 
        projectId, 
        materials: materialsToProcess 
      });
      setShowProcessDialog(false);
    } catch (error: any) {
      console.error("Failed to process materials:", error);
      toast.error("Failed to process materials", {
        description: error.message || "Please check console for details"
      });
    }
  };

  // Transform materials for display
  const displayMaterials = useMemo(() => {
    console.log('[MATERIALS] Processing materials:', treatmentMaterials.length, 'items');
    
    return treatmentMaterials.map((material) => ({
      id: `${material.itemId}-${material.surfaceId}`,
      name: material.itemName,
      category: 'material',
      quantity: material.quantityUsed,
      unit: material.unit,
      supplier: inventory?.find(item => item.id === material.itemId)?.supplier,
      source: 'Treatment Material',
      treatment_name: material.surfaceName || 'Window',
      fabric_id: material.itemId,
      currentQuantity: material.currentQuantity,
      lowStock: material.lowStock,
      isTracked: material.isTracked
    }));
  }, [treatmentMaterials, inventory]);


  // Toggle material selection
  const toggleMaterialSelection = (materialId: string) => {
    const newSelection = new Set(selectedMaterials);
    if (newSelection.has(materialId)) {
      newSelection.delete(materialId);
    } else {
      newSelection.add(materialId);
    }
    setSelectedMaterials(newSelection);
  };

  // Select all materials
  const selectAllMaterials = () => {
    setSelectedMaterials(new Set(displayMaterials.map(m => m.id)));
  };

  // Deselect all materials
  const deselectAllMaterials = () => {
    setSelectedMaterials(new Set());
  };

  // Export selected materials
  const exportSelectedMaterials = () => {
    const selected = displayMaterials.filter(m => selectedMaterials.has(m.id));
    if (selected.length === 0) {
      toast.error("No materials selected");
      return;
    }

    // Group by supplier
    const bySupplier = selected.reduce((acc, material) => {
      const supplier = material.supplier || "Unknown Supplier";
      if (!acc[supplier]) {
        acc[supplier] = [];
      }
      acc[supplier].push(material);
      return acc;
    }, {} as Record<string, typeof selected>);

    // Create order summary text
    let orderText = "MATERIALS ORDER\n\n";
    Object.entries(bySupplier).forEach(([supplier, materials]) => {
      orderText += `\n${supplier}\n${"=".repeat(50)}\n`;
      materials.forEach(mat => {
        orderText += `${mat.name} - ${mat.quantity.toFixed(2)} ${mat.unit}\n`;
        orderText += `  Category: ${mat.category}\n`;
        orderText += `  Treatment: ${mat.treatment_name}\n\n`;
      });
    });

    // Copy to clipboard
    navigator.clipboard.writeText(orderText);
    toast.success(`Order list for ${selected.length} items copied to clipboard!`);
  };

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

  if (isLoading || materialsLoading) {
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
      {/* Automatic Material Processing Card - PROMINENT */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Automatic Material Processing
              </CardTitle>
              <CardDescription>
                Extract all materials from your quote and automatically check inventory
              </CardDescription>
            </div>
            <Button onClick={() => setShowProcessDialog(true)} size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Process Quote Materials
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Items in stock → Deduct from inventory</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span>Items not in stock → Create purchase list</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Automatic vendor matching</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Auto-Extracted Materials from Treatments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Materials from Treatments</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="ml-2">
                {displayMaterials.length} items detected
              </Badge>
              {selectedMaterials.size > 0 && (
                <Badge variant="default">
                  {selectedMaterials.size} selected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {displayMaterials.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <h3 className="font-medium text-lg mb-1">No materials detected yet</h3>
              <p className="text-sm">Add treatments with fabrics and products to see them here</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAllMaterials}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAllMaterials}
                  >
                    Deselect All
                  </Button>
                </div>
                <Button
                  onClick={exportSelectedMaterials}
                  disabled={selectedMaterials.size === 0}
                  size="sm"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Export Order List ({selectedMaterials.size})
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                  <TableHead className="w-12">
                      <Checkbox
                        checked={selectedMaterials.size === displayMaterials.length && displayMaterials.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            selectAllMaterials();
                          } else {
                            deselectAllMaterials();
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Treatment</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayMaterials.map((material) => (
                    <TableRow 
                      key={material.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleMaterialSelection(material.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedMaterials.has(material.id)}
                          onCheckedChange={() => toggleMaterialSelection(material.id)}
                        />
                      </TableCell>
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
                        {material.quantity > 0 ? `${material.quantity.toFixed(2)} ${material.unit}` : 'N/A'}
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
            </>
          )}
        </CardContent>
      </Card>

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

      {/* Material Processing Confirmation Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Automatic Material Processing</DialogTitle>
            <DialogDescription>
              This will analyze your quote and automatically:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100">Deduct from Inventory</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Materials in stock will be automatically allocated and deducted from your inventory</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="h-2 w-2 rounded-full bg-orange-500 mt-2" />
                <div>
                  <p className="font-medium text-orange-900 dark:text-orange-100">Create Purchase Requirements</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Materials not in stock will be added to your purchase list with supplier information</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">Vendor Matching</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">System will automatically match materials to your preferred vendors</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleProcessMaterials} disabled={convertMaterials.isPending}>
                {convertMaterials.isPending ? 'Processing...' : 'Process Materials'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AllocateMaterialDialog
        projectId={projectId}
        open={showAllocateDialog}
        onOpenChange={setShowAllocateDialog}
      />
    </div>
  );
}
