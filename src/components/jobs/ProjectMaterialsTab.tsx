import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, AlertCircle, ShoppingCart, FileDown, Loader2, Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useProjectMaterialsUsage } from "@/hooks/useProjectMaterialsUsage";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useMaterialQueue, useBulkAddToQueue } from "@/hooks/useMaterialQueue";
import { useNavigate } from "react-router-dom";
import { useQuotes } from "@/hooks/useQuotes";

interface ProjectMaterialsTabProps {
  projectId: string;
}

export function ProjectMaterialsTab({ projectId }: ProjectMaterialsTabProps) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set());
  const { data: inventory } = useEnhancedInventory();
  const { data: treatmentMaterials = [], isLoading: materialsLoading } = useProjectMaterialsUsage(projectId);
  const { data: quotes } = useQuotes();
  const { data: queueItems } = useMaterialQueue({ status: 'pending' });
  const bulkAddToQueue = useBulkAddToQueue();
  
  const currentQuote = quotes?.find(q => q.project_id === projectId);
  
  // Count materials already in queue for this project
  const materialsInQueue = useMemo(() => {
    return queueItems?.filter(item => item.project_id === projectId).length || 0;
  }, [queueItems, projectId]);
  
  const handleSendSelectedToPurchasing = async () => {
    if (selectedMaterials.size === 0) {
      toast.error("No materials selected");
      return;
    }

    setIsProcessing(true);
    try {
      const selectedMaterialsList = displayMaterials.filter(m => selectedMaterials.has(m.id));
      
      const queueItems = selectedMaterialsList.map(material => {
        const inventoryItem = inventory?.find(inv => inv.id === material.fabric_id);
        const neededQuantity = material.quantity;
        const hasStock = (material.currentQuantity || 0) >= neededQuantity;
        const shortfall = Math.max(0, neededQuantity - (material.currentQuantity || 0));
        
        return {
          quote_id: currentQuote?.id,
          project_id: projectId,
          client_id: currentQuote?.client_id,
          inventory_item_id: material.fabric_id,
          material_name: material.name,
          material_type: material.category || 'material',
          quantity: hasStock ? neededQuantity : shortfall,
          unit: material.unit,
          supplier_id: inventoryItem?.vendor_id,
          priority: hasStock ? 'normal' as const : 'high' as const,
          unit_cost: inventoryItem?.cost_price || 0,
          total_cost: (inventoryItem?.cost_price || 0) * (hasStock ? neededQuantity : shortfall),
          status: 'pending' as const,
          metadata: {
            source_type: hasStock ? 'allocate_from_stock' : 'order_from_supplier',
            current_stock: material.currentQuantity || 0,
            required_quantity: neededQuantity,
            treatment_name: material.treatment_name
          }
        };
      });
      
      await bulkAddToQueue.mutateAsync(queueItems);
      
      const toOrder = queueItems.filter(q => q.metadata?.source_type === 'order_from_supplier').length;
      const toAllocate = queueItems.filter(q => q.metadata?.source_type === 'allocate_from_stock').length;
      
      toast.success("✓ Materials sent to Purchasing!", {
        description: `${toOrder} to order from suppliers, ${toAllocate} to allocate from stock`,
        action: {
          label: "View in Purchasing →",
          onClick: () => navigate('/?tab=ordering-hub')
        },
        duration: 10000
      });
      
      // Clear selection after successful send
      setSelectedMaterials(new Set());
    } catch (error: any) {
      console.error("Failed to send materials:", error);
      toast.error("Failed to send materials", {
        description: error.message || "Please try again"
      });
    } finally {
      setIsProcessing(false);
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
    let orderText = `MATERIALS ORDER\n`;
    orderText += `Generated: ${new Date().toLocaleString()}\n`;
    orderText += `Total Items: ${selected.length}\n\n`;
    
    Object.entries(bySupplier).forEach(([supplier, materials]) => {
      orderText += `\n${supplier}\n${"=".repeat(50)}\n`;
      materials.forEach(mat => {
        orderText += `• ${mat.name}\n`;
        orderText += `  Quantity: ${mat.quantity.toFixed(2)} ${mat.unit}\n`;
        orderText += `  Category: ${mat.category}\n`;
        orderText += `  Treatment: ${mat.treatment_name}\n\n`;
      });
    });

    // Download as text file
    const blob = new Blob([orderText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `materials-order-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Also copy to clipboard
    navigator.clipboard.writeText(orderText).then(() => {
      toast.success(`Order list downloaded and copied to clipboard! (${selected.length} items)`);
    }).catch(() => {
      toast.success(`Order list downloaded! (${selected.length} items)`);
    });
  };

  if (materialsLoading) {
    return <div className="p-4">Loading materials...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Warning Banner when no materials found */}
      {displayMaterials.length === 0 && (
        <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100">No Materials Detected</h3>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  To process materials for this job, you need to:
                </p>
                <ol className="text-sm text-orange-800 dark:text-orange-200 list-decimal list-inside space-y-1 ml-2">
                  <li>Go to the <strong>Rooms & Treatments</strong> tab</li>
                  <li>Select a window/surface from the room</li>
                  <li>Configure the treatment (select type, fabric, dimensions)</li>
                  <li>Click <strong>Save Configuration</strong> button</li>
                  <li>Return here to process the materials</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Status Alert */}
      {materialsInQueue > 0 && (
        <Alert className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-900 dark:text-blue-100">
            <span className="font-medium">{materialsInQueue} material{materialsInQueue !== 1 ? 's' : ''}</span> from this project are in the purchasing queue
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/?tab=ordering-hub')}
              className="ml-2 p-0 h-auto text-blue-600 dark:text-blue-400"
            >
              View in Purchasing →
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Auto-Extracted Materials from Treatments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
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
                <div className="flex gap-2">
                  <Button
                    onClick={handleSendSelectedToPurchasing}
                    disabled={selectedMaterials.size === 0 || isProcessing}
                    variant="default"
                    size="sm"
                    className="gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        Send to Purchasing ({selectedMaterials.size})
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={exportSelectedMaterials}
                    disabled={selectedMaterials.size === 0}
                    variant="outline"
                    size="sm"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Export ({selectedMaterials.size})
                  </Button>
                </div>
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
    </div>
  );
}
