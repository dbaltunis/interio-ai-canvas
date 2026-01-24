import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useCurtainTemplates, useDeleteCurtainTemplate, useCreateCurtainTemplate, useUpdateCurtainTemplate, CurtainTemplate } from "@/hooks/useCurtainTemplates";
import { useHeadingInventory } from "@/hooks/useHeadingInventory";
import { useQueryClient } from "@tanstack/react-query";
import { CompactTemplateCard } from "./CompactTemplateCard";

interface CurtainTemplatesListProps {
  onEdit: (template: CurtainTemplate) => void;
  highlightedTemplateId?: string | null;
  canManageTemplates?: boolean;
}

export const CurtainTemplatesList = ({ onEdit, highlightedTemplateId, canManageTemplates = false }: CurtainTemplatesListProps) => {
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
      queryClient.setQueryData(['curtain-templates'], 
        (old: any) => old?.filter((t: any) => t.id !== templateId)
      );
      
      await deleteTemplate.mutateAsync(templateId);
      toast({
        title: "Template Deleted",
        description: "The template has been removed",
      });
    } catch (error) {
      console.error("Error deleting template:", error);
      // Rollback on error
      queryClient.invalidateQueries({ queryKey: ['curtain-templates'] });
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
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
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <p>No templates found.</p>
            <p className="text-sm">Create your first template to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {/* Bulk Actions Header */}
      {templates.length > 0 && canManageTemplates && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedIds.length === templates.length && templates.length > 0}
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
                  Delete ({selectedIds.length})
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

      {/* Template Cards */}
      {templates.map((template) => (
        <div
          key={template.id}
          ref={(el) => templateRefs.current[template.id] = el}
        >
          <CompactTemplateCard
            template={template}
            isSelected={selectedIds.includes(template.id)}
            isHighlighted={highlightedTemplateId === template.id}
            canManage={canManageTemplates}
            headingStyles={headingStyles}
            onSelect={toggleSelect}
            onEdit={onEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onToggleStoreVisibility={handleToggleStoreVisibility}
            isDeleting={deleteTemplate.isPending}
            isDuplicating={createTemplate.isPending}
          />
        </div>
      ))}
    </div>
  );
};