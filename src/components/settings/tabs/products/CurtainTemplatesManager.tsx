import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CurtainTemplateForm } from "./CurtainTemplateForm";
import { CurtainTemplatesList } from "./CurtainTemplatesList";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CurtainTemplate, useCurtainTemplates } from "@/hooks/useCurtainTemplates";
import { useHasPermission } from "@/hooks/usePermissions";
import { SectionHelpButton } from "@/components/help/SectionHelpButton";

interface CreateTemplateData {
  name: string;
  category: string;
  description: string;
  inventoryItemId: string;
}

interface CurtainTemplatesManagerProps {
  highlightedTemplateId?: string | null;
  createTemplateData?: CreateTemplateData | null;
  onTemplateCreated?: () => void;
  editTemplateId?: string | null;
  onTemplateEdited?: () => void;
}

export const CurtainTemplatesManager = ({
  highlightedTemplateId,
  createTemplateData,
  onTemplateCreated,
  editTemplateId,
  onTemplateEdited
}: CurtainTemplatesManagerProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CurtainTemplate | null>(null);
  const [prefilledData, setPrefilledData] = useState<CreateTemplateData | null>(null);
  const { data: templates } = useCurtainTemplates();

  // Permission check using centralized hook
  const canManageTemplates = useHasPermission('manage_templates') !== false;

  // Auto-open form when createTemplateData is provided - only if user has permission
  useEffect(() => {
    if (createTemplateData && canManageTemplates) {
      setEditingTemplate(null);
      setPrefilledData(createTemplateData);
      setIsFormOpen(true);
    }
  }, [createTemplateData, canManageTemplates]);

  // Auto-open form when editTemplateId is provided - only if user has permission
  useEffect(() => {
    if (editTemplateId && templates && canManageTemplates) {
      const templateToEdit = templates.find(t => t.id === editTemplateId);
      if (templateToEdit) {
        setEditingTemplate(templateToEdit);
        setPrefilledData(null);
        setIsFormOpen(true);
        onTemplateEdited?.();
      }
    }
  }, [editTemplateId, templates, canManageTemplates]);

  const handleAddTemplate = () => {
    if (!canManageTemplates) {
      return;
    }
    console.log("Add Template button clicked");
    setEditingTemplate(null);
    setPrefilledData(null);
    setIsFormOpen(true);
  };
  const handleEditTemplate = (template: CurtainTemplate) => {
    if (!canManageTemplates) {
      return;
    }
    setEditingTemplate(template);
    setPrefilledData(null);
    setIsFormOpen(true);
  };
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTemplate(null);
    setPrefilledData(null);
    onTemplateCreated?.();
  };
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Window Covering Templates</h3>
          <SectionHelpButton sectionId="products-templates" />
        </div>
        <Button
          onClick={handleAddTemplate}
          className="flex items-center gap-2 pointer-events-auto z-50"
          type="button"
          disabled={!canManageTemplates}
          title={!canManageTemplates ? "You don't have permission to manage templates" : undefined}
        >
          <Plus className="h-4 w-4" />
          Add Template
        </Button>
      </div>

      <CurtainTemplatesList
        onEdit={handleEditTemplate}
        highlightedTemplateId={highlightedTemplateId}
        canManageTemplates={canManageTemplates}
      />

      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="w-full sm:max-w-6xl">
          <SheetHeader>
            <SheetTitle>
              {editingTemplate ? "Edit Window Covering Template" : "Add Window Covering Template"}
            </SheetTitle>
            <SheetDescription>
              {editingTemplate ? "Update the window covering template configuration" : "Create a new template for curtains, blinds, shutters or other window coverings"}
            </SheetDescription>
          </SheetHeader>
          <CurtainTemplateForm
            template={editingTemplate}
            onClose={handleCloseForm}
            prefilledData={prefilledData}
          />
        </SheetContent>
      </Sheet>
    </div>;
};
