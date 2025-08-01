import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CurtainTemplateForm } from "./CurtainTemplateForm";
import { CurtainTemplatesList } from "./CurtainTemplatesList";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CurtainTemplate } from "@/hooks/useCurtainTemplates";

export const CurtainTemplatesManager = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CurtainTemplate | null>(null);

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  };

  const handleEditTemplate = (template: CurtainTemplate) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Curtain Templates</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage your curtain templates with predefined measurements and configurations
          </p>
        </div>
        <Button onClick={handleAddTemplate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Curtain Template
        </Button>
      </div>

      <CurtainTemplatesList onEdit={handleEditTemplate} />

      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="w-full sm:max-w-6xl">
          <SheetHeader>
            <SheetTitle>
              {editingTemplate ? "Edit Curtain Template" : "Add Curtain Template"}
            </SheetTitle>
            <SheetDescription>
              {editingTemplate 
                ? "Update the curtain template configuration"
                : "Create a new curtain template with measurements and options"
              }
            </SheetDescription>
          </SheetHeader>
          <CurtainTemplateForm 
            template={editingTemplate}
            onClose={handleCloseForm}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};