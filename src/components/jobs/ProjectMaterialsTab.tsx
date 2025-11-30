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
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/hooks/useProjects";
import { formatCurrency } from "@/utils/currency";
import { useTreatmentMaterialsStatus } from "@/hooks/useProjectMaterialsStatus";
import { MaterialsStatusBadge } from "./MaterialsStatusBadge";

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
  const { data: projects } = useProjects();
  const { data: queueItems } = useMaterialQueue({ status: 'pending' });
  const bulkAddToQueue = useBulkAddToQueue();
  const { data: materialStatusMap = {} } = useTreatmentMaterialsStatus(projectId);
  
  console.log('[COMPONENT MOUNT] ProjectMaterialsTab rendered', {
    projectId,
    treatmentMaterialsCount: treatmentMaterials.length,
    selectedCount: selectedMaterials.size,
    bulkAddToQueueExists: !!bulkAddToQueue
  });
  
  const currentQuote = quotes?.find(q => q.project_id === projectId);
  const currentProject = projects?.find(p => p.id === projectId);
  
  // Count materials already in queue for this project
  const materialsInQueue = useMemo(() => {
    return queueItems?.filter(item => item.project_id === projectId).length || 0;
  }, [queueItems, projectId]);
  
  const handleSendSelectedToPurchasing = async () => {
    console.log('[SEND TO PURCHASING] Button clicked', {
      selectedCount: selectedMaterials.size,
      displayMaterialsCount: displayMaterials.length
    });

    if (selectedMaterials.size === 0) {
      toast.error("No materials selected");
      return;
    }

    setIsProcessing(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('[SEND TO PURCHASING] Auth error:', userError);
        toast.error("Authentication required", {
          description: "Please log in to send materials to purchasing"
        });
        return;
      }
      
      console.log('[SEND TO PURCHASING] User authenticated:', user.id);
      
      const selectedMaterialsList = displayMaterials.filter(m => selectedMaterials.has(m.id));
      console.log('[SEND TO PURCHASING] Selected materials:', selectedMaterialsList);
      
      // Validate UUIDs - filter out materials with invalid IDs
      const isValidUuid = (str: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
      };
      
      const validMaterials = selectedMaterialsList.filter(material => {
        const isValid = isValidUuid(material.fabric_id);
        if (!isValid) {
          console.warn('[SEND TO PURCHASING] Skipping material with invalid UUID:', {
            id: material.fabric_id,
            name: material.name
          });
        }
        return isValid;
      });
      
      const skippedCount = selectedMaterialsList.length - validMaterials.length;
      
      if (validMaterials.length === 0) {
        toast.error("No valid materials to send", {
          description: `${skippedCount} material(s) couldn't be sent (missing inventory reference)`
        });
        setIsProcessing(false);
        return;
      }
      
      const queueItems = validMaterials.map(material => {
        const inventoryItem = inventory?.find(inv => inv.id === material.fabric_id);
        const neededQuantity = material.quantity;
        const hasStock = (material.currentQuantity || 0) >= neededQuantity;
        const shortfall = Math.max(0, neededQuantity - (material.currentQuantity || 0));
        
        return {
          user_id: user.id,
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
          status: 'pending' as const,
          metadata: {
            source_type: hasStock ? 'allocate_from_stock' : 'order_from_supplier',
            current_stock: material.currentQuantity || 0,
            required_quantity: neededQuantity,
            treatment_name: material.treatment_name,
            treatment_material_id: material.id
          }
        };
      });
      
      console.log('[SEND TO PURCHASING] Queue items to send:', queueItems);
      
      await bulkAddToQueue.mutateAsync(queueItems);
      
      const toOrder = queueItems.filter(q => q.metadata?.source_type === 'order_from_supplier').length;
      const toAllocate = queueItems.filter(q => q.metadata?.source_type === 'allocate_from_stock').length;
      
      let description = `${toOrder} to order from suppliers, ${toAllocate} to allocate from stock`;
      if (skippedCount > 0) {
        description += `. ${skippedCount} item(s) skipped (missing inventory reference)`;
      }
      
      toast.success("✓ Materials sent to Purchasing!", {
        description,
        action: {
          label: "View in Purchasing →",
          onClick: () => navigate('/?tab=ordering-hub')
        },
        duration: 10000
      });
      
      // Clear selection
      setSelectedMaterials(new Set());
    } catch (error: any) {
      console.error("[SEND TO PURCHASING] Failed to send materials:", {
        error,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      toast.error("Failed to send materials to purchasing", {
        description: error.message || error.hint || "Please check the console for details"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Transform materials for display and check queue status
  const { availableMaterials, sentMaterials } = useMemo(() => {
    console.log('[MATERIALS] Processing materials:', treatmentMaterials.length, 'items');
    
    const allMaterials = treatmentMaterials.map((material) => {
      const inventoryItem = inventory?.find(item => item.id === material.itemId);
      const unitCost = inventoryItem?.cost_price || 0;
      const totalCost = unitCost * material.quantityUsed;
      const materialId = `${material.itemId}-${material.surfaceId}`;
      
      // Check if this material is in the queue
      const isInQueue = queueItems?.some(
        item => item.metadata?.treatment_material_id === materialId
      ) || false;
      
      return {
        id: materialId,
        name: material.itemName,
        category: 'material',
        quantity: material.quantityUsed,
        unit: material.unit,
        unitCost,
        totalCost,
        supplier: inventoryItem?.supplier,
        source: 'Treatment Material',
        treatment_name: material.surfaceName || 'Window',
        fabric_id: material.itemId,
        currentQuantity: material.currentQuantity,
        lowStock: material.lowStock,
        isTracked: material.isTracked,
        status: isInQueue ? 'in_queue' : (materialStatusMap[materialId] || 'not_processed'),
        isInQueue
      };
    });
    
    // Separate materials into available and already sent
    const available = allMaterials.filter(m => !m.isInQueue);
    const sent = allMaterials.filter(m => m.isInQueue);
    
    console.log('[MATERIALS] Available:', available.length, 'Sent:', sent.length);
    
    return { availableMaterials: available, sentMaterials: sent };
  }, [treatmentMaterials, inventory, materialStatusMap, queueItems]);

  // Use only available materials for display and selection
  const displayMaterials = availableMaterials;


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
      {/* Removed MaterialsWorkflowStatus as requested by user */}
      
      {/* Warning Banner when no materials found */}
      {displayMaterials.length === 0 && sentMaterials.length === 0 && (
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
      
      {/* Already Sent Materials Section */}
      {sentMaterials.length > 0 && (
        <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <Info className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-900 dark:text-green-100">
            <span className="font-medium">{sentMaterials.length} material{sentMaterials.length !== 1 ? 's' : ''}</span> from this project {sentMaterials.length === 1 ? 'has' : 'have'} been sent to purchasing
            <Button
              variant="link"
              size="sm"
              className="ml-2 h-auto p-0 text-green-700 dark:text-green-300"
              onClick={() => navigate('/?tab=ordering-hub')}
            >
              View in Purchasing →
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Status Alert - Only show if there are unsent materials */}
      {materialsInQueue > 0 && displayMaterials.length > 0 && (
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
      
      {/* Auto-Extracted Materials from Treatments - Only Available Materials */}
      {displayMaterials.length > 0 && (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Available Materials to Send</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="ml-2">
                {displayMaterials.length} available
              </Badge>
              {selectedMaterials.size > 0 && (
                <Badge variant="default">
                  {selectedMaterials.size} selected
                </Badge>
              )}
            </div>
          </div>
          <CardDescription>
            Select materials to send to purchasing. Already-sent materials are not shown.
          </CardDescription>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('[BUTTON CLICK] Send to Purchasing button clicked', e);
                      handleSendSelectedToPurchasing();
                    }}
                    disabled={selectedMaterials.size === 0 || isProcessing}
                    variant="default"
                    size="sm"
                    className="gap-2 shadow-sm"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        <span className="hidden sm:inline">Send to Purchasing</span>
                        <span className="sm:hidden">Send</span>
                        <Badge variant="secondary" className="ml-1">
                          {selectedMaterials.size}
                        </Badge>
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
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
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
                      <TableCell>
                        <MaterialsStatusBadge status={material.status} />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {material.quantity > 0 ? `${material.quantity.toFixed(2)} ${material.unit}` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(material.unitCost)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(material.totalCost)}
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
      )}
      
      {/* Show message if all materials have been sent */}
      {displayMaterials.length === 0 && sentMaterials.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50 text-green-600" />
              <h3 className="font-medium text-lg mb-1">All materials sent to purchasing</h3>
              <p className="text-sm">All materials from this project have been sent to the purchasing queue.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => navigate('/?tab=ordering-hub')}
              >
                View in Purchasing Hub →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
