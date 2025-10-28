import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, AlertCircle, ShoppingCart, FileDown, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useProjectMaterialsUsage } from "@/hooks/useProjectMaterialsUsage";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useConvertQuoteToMaterials } from "@/hooks/useConvertQuoteToMaterials";
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
  const convertMaterials = useConvertQuoteToMaterials();
  const bulkAddToQueue = useBulkAddToQueue();
  
  const currentQuote = quotes?.find(q => q.project_id === projectId);
  
  // Count materials already in queue for this project
  const materialsInQueue = useMemo(() => {
    return queueItems?.filter(item => item.project_id === projectId).length || 0;
  }, [queueItems, projectId]);
  
  const handleProcessMaterials = async () => {
    setIsProcessing(true);
    try {
      if (treatmentMaterials.length === 0) {
        toast.error("No materials found to process", {
          description: "Go to 'Rooms & Treatments' tab, select a window, configure the treatment, select a fabric, and click 'Save Configuration' first.",
          duration: 8000
        });
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
      
      const result = await convertMaterials.mutateAsync({ 
        projectId, 
        materials: materialsToProcess 
      });
      
      // Add out-of-stock materials to ordering queue
      const outOfStockItems = materialsToProcess.filter(m => m.currentQuantity < m.quantityUsed);
      
      if (outOfStockItems.length > 0) {
        const queueItems = outOfStockItems.map(item => {
          const inventoryItem = inventory?.find(inv => inv.id === item.itemId);
          const neededQuantity = item.quantityUsed - (item.currentQuantity || 0);
          
          return {
            quote_id: currentQuote?.id,
            project_id: projectId,
            client_id: currentQuote?.client_id,
            inventory_item_id: item.itemId,
            material_name: item.itemName,
            material_type: inventoryItem?.category || 'material',
            quantity: neededQuantity,
            unit: item.unit,
            supplier_id: inventoryItem?.vendor_id,
            priority: 'high' as const,
            unit_cost: inventoryItem?.cost_price || 0,
            total_cost: (inventoryItem?.cost_price || 0) * neededQuantity,
            status: 'pending' as const
          };
        });
        
        await bulkAddToQueue.mutateAsync(queueItems);
        
        toast.success("✓ Materials sent to purchasing!", {
          description: `${result.inStockCount || 0} in stock, ${result.outOfStockCount || 0} sent to purchasing queue`,
          action: {
            label: "View in Purchasing →",
            onClick: () => navigate('/?tab=ordering-hub')
          },
          duration: 10000
        });
      } else {
        toast.success("All materials are in stock!", {
          description: `${result.inStockCount || 0} material(s) available in inventory`
        });
      }
    } catch (error: any) {
      console.error("Failed to process materials:", error);
      toast.error("Failed to process materials", {
        description: error.message || "Please check console for details"
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
      
      {/* Automatic Material Processing Card - PROMINENT */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Send to Purchasing
              </CardTitle>
              <CardDescription>
                Check inventory levels and send out-of-stock items to purchasing queue
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {materialsInQueue > 0 && (
                <Badge variant="secondary" className="gap-1.5">
                  <Package className="h-3 w-3" />
                  {materialsInQueue} in queue
                </Badge>
              )}
              <Button 
                onClick={handleProcessMaterials} 
                size="lg" 
                className="gap-2"
                disabled={isProcessing || treatmentMaterials.length === 0}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    Send to Purchasing
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>In stock → No action needed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span>Out of stock → Added to purchasing queue</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
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
    </div>
  );
}
