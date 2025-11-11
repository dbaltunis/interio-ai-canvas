import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Edit, Trash2, Copy, Store } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useCurtainTemplates, useDeleteCurtainTemplate, useCreateCurtainTemplate, useUpdateCurtainTemplate, CurtainTemplate } from "@/hooks/useCurtainTemplates";
import { useHeadingInventory } from "@/hooks/useHeadingInventory";
import { getDisplayNameFromSingular } from "@/types/treatmentCategories";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface CurtainTemplatesListProps {
  onEdit: (template: CurtainTemplate) => void;
  highlightedTemplateId?: string | null;
}

export const CurtainTemplatesList = ({ onEdit, highlightedTemplateId }: CurtainTemplatesListProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: templates = [], isLoading } = useCurtainTemplates();
  const { data: headingStyles = [] } = useHeadingInventory();
  const deleteTemplate = useDeleteCurtainTemplate();
  const createTemplate = useCreateCurtainTemplate();
  const updateTemplate = useUpdateCurtainTemplate();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const templateRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Scroll to highlighted template
  useEffect(() => {
    if (highlightedTemplateId && templateRefs.current[highlightedTemplateId]) {
      setTimeout(() => {
        templateRefs.current[highlightedTemplateId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [highlightedTemplateId, templates]);

  const handleToggleStoreVisibility = async (templateId: string, currentValue: boolean) => {
    try {
      await updateTemplate.mutateAsync({
        id: templateId,
        is_store_visible: !currentValue,
      });
      toast({
        title: "Store Visibility Updated",
        description: !currentValue 
          ? "Template is now visible in online store" 
          : "Template is hidden from online store",
      });
    } catch (error) {
      console.error("Error updating store visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update store visibility. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (templateId: string) => {
    try {
      // Optimistic update - immediately remove from UI
      const previousTemplates = templates;
      queryClient.setQueryData(['curtain-templates'], 
        (old: any) => old?.filter((t: any) => t.id !== templateId)
      );
      
      await deleteTemplate.mutateAsync(templateId);
    } catch (error) {
      console.error("Error deleting template:", error);
      // Rollback on error
      queryClient.invalidateQueries({ queryKey: ['curtain-templates'] });
    }
  };

  const handleDuplicate = async (template: CurtainTemplate) => {
    try {
      const duplicatedTemplate = {
        ...template,
        name: `${template.name} - Copy`,
        description: `Copy of ${template.description || template.name}`,
        active: true
      };
      
      // Remove fields that shouldn't be copied
      const { id, user_id, created_at, updated_at, pricing_grid_id, ...templateData } = duplicatedTemplate as any;
      
      await createTemplate.mutateAsync(templateData);
      
      toast({
        title: "Template Duplicated",
        description: "A copy of the template has been created"
      });
    } catch (error) {
      console.error("Error duplicating template:", error);
      toast({
        title: "Error",
        description: "Failed to duplicate template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedIds.map(id => deleteTemplate.mutateAsync(id)));
      setSelectedIds([]);
      toast({
        title: "Templates Deleted",
        description: `Successfully deleted ${selectedIds.length} template(s)`
      });
    } catch (error) {
      console.error("Error deleting templates:", error);
      toast({
        title: "Error",
        description: "Failed to delete some templates. Please try again.",
        variant: "destructive"
      });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === templates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(templates.map(t => t.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p>Loading curtain templates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p>No curtain templates found.</p>
            <p className="text-sm">Create your first template to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {templates.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedIds.length === templates.length}
              onCheckedChange={toggleSelectAll}
              id="select-all"
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
              Select All ({selectedIds.length}/{templates.length})
            </label>
          </div>
          {selectedIds.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedIds.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {selectedIds.length} Template(s)</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedIds.length} template(s)? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}

      {templates.map((template) => (
        <Card 
          key={template.id}
          ref={(el) => templateRefs.current[template.id] = el}
          className={cn(
            "transition-all duration-300",
            highlightedTemplateId === template.id && "ring-2 ring-primary ring-offset-2 animate-pulse"
          )}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Checkbox
                  checked={selectedIds.includes(template.id)}
                  onCheckedChange={() => toggleSelect(template.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                  
                  {/* Store Visibility Toggle */}
                  <div className="flex items-center gap-3 mt-3 p-3 bg-muted/50 rounded-lg">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <Label htmlFor={`store-${template.id}`} className="text-sm font-medium cursor-pointer">
                        Available for Online Store
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {template.is_store_visible 
                          ? "Customers can use this template in your online store" 
                          : "Hidden from online store product catalog"}
                      </p>
                    </div>
                    <Switch
                      id={`store-${template.id}`}
                      checked={template.is_store_visible ?? true}
                      onCheckedChange={() => handleToggleStoreVisibility(template.id, template.is_store_visible ?? true)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDuplicate(template)}
                  disabled={createTemplate.isPending}
                >
                  {createTemplate.isPending ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(template)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Template</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{template.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(template.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{getDisplayNameFromSingular(template.curtain_type)}</Badge>
                
                {/* Curtain-specific badges */}
                {template.curtain_type === 'curtain' && (
                  <>
                    {(template as any).panel_configuration && (
                      <Badge variant="outline">{(template as any).panel_configuration}</Badge>
                    )}
                    {template.selected_heading_ids && template.selected_heading_ids.length > 0 ? (
                      template.selected_heading_ids.map((headingId) => {
                        const heading = headingStyles.find(h => h.id === headingId);
                        return heading ? (
                          <Badge key={headingId} variant="outline">{heading.name}</Badge>
                        ) : null;
                      })
                    ) : (
                      template.heading_name && <Badge variant="outline">{template.heading_name}</Badge>
                    )}
                    <Badge variant="outline">Fullness: {template.fullness_ratio}</Badge>
                    {template.is_railroadable && <Badge variant="outline">Railroadable</Badge>}
                  </>
                )}
                
                <Badge variant="outline">{template.manufacturing_type}</Badge>
                <Badge variant="outline">Pricing: {template.pricing_type.replace('_', ' ')}</Badge>
              </div>
              
              {/* Curtain-specific details */}
              {template.curtain_type === 'curtain' && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Returns:</span> L:{template.return_left}cm R:{template.return_right}cm
                  </div>
                  <div>
                    <span className="font-medium">Overlap:</span> {template.overlap}cm
                  </div>
                  <div>
                    <span className="font-medium">Header Allowance:</span> {template.header_allowance}cm
                  </div>
                  <div>
                    <span className="font-medium">Waste:</span> {template.waste_percent}%
                  </div>
                </div>
              )}
              
              {/* Blind/Shutter-specific details */}
              {template.curtain_type !== 'curtain' && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {(template as any).bracket_deduction && (
                    <div>
                      <span className="font-medium">Bracket Deduction:</span> {(template as any).bracket_deduction}cm
                    </div>
                  )}
                  {(template as any).stack_allowance && (
                    <div>
                      <span className="font-medium">Stack Allowance:</span> {(template as any).stack_allowance}cm
                    </div>
                  )}
                  {template.waste_percent > 0 && (
                    <div>
                      <span className="font-medium">Waste:</span> {template.waste_percent}%
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};