import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, AlertCircle, Sparkles, FileDown, Wand2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEnhancedInventory } from "@/hooks/useEnhancedInventory";
import { useProjectMaterialsUsage } from "@/hooks/useProjectMaterialsUsage";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useConvertQuoteToMaterials } from "@/hooks/useConvertQuoteToMaterials";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCreateMaterialQueueItem } from "@/hooks/useMaterialQueue";
import { useNavigate } from "react-router-dom";
import { useQuotes } from "@/hooks/useQuotes";

interface ProjectMaterialsTabProps {
  projectId: string;
}

export function ProjectMaterialsTab({ projectId }: ProjectMaterialsTabProps) {
  const navigate = useNavigate();
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<Set<string>>(new Set());
  const { data: inventory } = useEnhancedInventory();
  const { data: treatmentMaterials = [], isLoading: materialsLoading } = useProjectMaterialsUsage(projectId);
  const { data: quotes } = useQuotes();
  const convertMaterials = useConvertQuoteToMaterials();
  const createQueueItem = useCreateMaterialQueueItem();
  
  const currentQuote = quotes?.find(q => q.project_id === projectId);
  
  const handleProcessMaterials = async () => {
    try {
      console.log('[MATERIALS] Processing materials - checking treatmentMaterials:', treatmentMaterials);
      
      if (treatmentMaterials.length === 0) {
        toast.error("No materials found to process", {
          description: "Go to 'Rooms & Treatments' tab, select a window, configure the treatment, select a fabric, and click 'Save Configuration' first.",
          duration: 8000
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
      
      const result = await convertMaterials.mutateAsync({ 
        projectId, 
        materials: materialsToProcess 
      });
      
      // Add out-of-stock materials to ordering queue
      const outOfStockItems = materialsToProcess.filter(m => m.currentQuantity < m.quantityUsed);
      
      if (outOfStockItems.length > 0 && currentQuote) {
        console.log('[MATERIALS] Adding out-of-stock items to ordering queue:', outOfStockItems);
        
        for (const item of outOfStockItems) {
          const inventoryItem = inventory?.find(inv => inv.id === item.itemId);
          const neededQuantity = item.quantityUsed - (item.currentQuantity || 0);
          
          await createQueueItem.mutateAsync({
            quote_id: currentQuote.id,
            project_id: projectId,
            client_id: currentQuote.client_id,
            inventory_item_id: item.itemId,
            material_name: item.itemName,
            material_type: inventoryItem?.category || 'material',
            quantity: neededQuantity,
            unit: item.unit,
            supplier_id: inventoryItem?.vendor_id,
            priority: 'high',
            unit_cost: inventoryItem?.cost_price || 0,
            status: 'pending'
          });
        }
        
        toast.success("✓ Materials processed successfully!", {
          description: `${result.inStockCount || 0} in stock, ${result.outOfStockCount || 0} sent to purchasing queue`,
          action: {
            label: "Go to Purchasing →",
            onClick: () => navigate('/?tab=ordering-hub')
          },
          duration: 10000
        });
      } else {
        toast.success("Materials processed successfully!", {
          description: `Processed ${materialsToProcess.length} material(s)`
        });
      }
      
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
                <Wand2 className="h-5 w-5 text-primary" />
                Automatic Material Processing
              </CardTitle>
              <CardDescription>
                Check inventory, allocate stock, and send items to purchasing queue automatically
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
              <span>Items in stock → Allocate from inventory</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span>Out of stock → Send to purchasing queue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Auto-match suppliers & create batches</span>
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
                  <p className="font-medium text-orange-900 dark:text-orange-100">Send to Purchasing Queue</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Out-of-stock materials are sent to the Purchasing tab where you can create supplier orders</p>
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
    </div>
  );
}
