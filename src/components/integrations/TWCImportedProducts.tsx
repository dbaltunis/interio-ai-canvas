import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Loader2, RefreshCw, Trash2, ExternalLink, AlertTriangle } from "lucide-react";
import { useTWCImportedProducts, useResyncTWCProducts, useDeleteTWCProduct, useDeleteAllTWCData } from "@/hooks/useTWCProducts";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const TWCImportedProducts = () => {
  const { data: importedProducts, isLoading } = useTWCImportedProducts();
  const resyncMutation = useResyncTWCProducts();
  const deleteMutation = useDeleteTWCProduct();
  const deleteAllMutation = useDeleteAllTWCData();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading TWC products...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!importedProducts || importedProducts.length === 0) {
    return null;
  }

  const handleResync = () => {
    resyncMutation.mutate();
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleDeleteAll = () => {
    setShowDeleteAllConfirm(true);
  };

  const confirmDeleteAll = () => {
    deleteAllMutation.mutate();
    setShowDeleteAllConfirm(false);
  };

  const handleCreateTemplate = (product: any) => {
    navigate('/settings', { 
      state: { 
        activeTab: 'templates',
        createTemplate: {
          name: product.name,
          category: product.category,
          description: `TWC Product: ${product.metadata?.twc_item_number || product.sku}`,
          inventoryItemId: product.id
        }
      }
    });
  };

  const handleViewTemplate = (product: any) => {
    const templateId = product.templates?.[0]?.id;
    if (templateId) {
      navigate('/settings', {
        state: {
          activeTab: 'templates',
          editTemplateId: templateId
        }
      });
    } else {
      toast.error("Template not found. Create a template first.");
    }
  };

  return (
    <>
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">TWC Products</h3>
              <Badge variant="secondary">{importedProducts.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleResync}
                disabled={resyncMutation.isPending}
                className="gap-1.5"
              >
                {resyncMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Re-sync Options
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteAll}
                disabled={deleteAllMutation.isPending}
                className="gap-1.5"
              >
                {deleteAllMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete All
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {importedProducts.map((product: any) => {
              const hasTemplate = product.templates && product.templates.length > 0;
              const twcItemNumber = product.metadata?.twc_item_number || product.sku;
              const optionsCount = product.metadata?.twc_questions?.length || 0;

              return (
                <div key={product.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{product.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>#{twcItemNumber}</span>
                      {optionsCount > 0 && <span>• {optionsCount} options in API</span>}
                      {hasTemplate ? (
                        <Badge className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Template Ready</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Needs Template</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!hasTemplate && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleCreateTemplate(product)}>
                        Create Template
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(product.id, product.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Delete single product dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete TWC Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.name}" and all related templates, options, and materials.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete ALL TWC data dialog */}
      <AlertDialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete ALL TWC Data?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This will permanently delete ALL TWC data from your account:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>All {importedProducts.length} TWC products</li>
                <li>All related materials and fabrics</li>
                <li>All TWC templates</li>
                <li>All TWC options and values</li>
                <li>All template option settings</li>
              </ul>
              <p className="font-medium text-destructive">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All TWC Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};