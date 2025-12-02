import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CurtainTemplateForm } from "./CurtainTemplateForm";
import { CurtainTemplatesList } from "./CurtainTemplatesList";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { CurtainTemplate } from "@/hooks/useCurtainTemplates";

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
}

export const CurtainTemplatesManager = ({ 
  highlightedTemplateId,
  createTemplateData,
  onTemplateCreated
}: CurtainTemplatesManagerProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CurtainTemplate | null>(null);
  const [prefilledData, setPrefilledData] = useState<CreateTemplateData | null>(null);

  // Auto-open form when createTemplateData is provided
  useEffect(() => {
    if (createTemplateData) {
      setEditingTemplate(null);
      setPrefilledData(createTemplateData);
      setIsFormOpen(true);
    }
  }, [createTemplateData]);

  const handleAddTemplate = () => {
    console.log("Add Template button clicked");
    setEditingTemplate(null);
    setPrefilledData(null);
    setIsFormOpen(true);
  };
  const handleEditTemplate = (template: CurtainTemplate) => {
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
        <div>
          <h3 className="text-lg font-semibold">Window Covering Templates</h3>
          
        </div>
        <Button onClick={handleAddTemplate} className="flex items-center gap-2 pointer-events-auto z-50" type="button">
          <Plus className="h-4 w-4" />
          Add Template
        </Button>
      </div>

      <CurtainTemplatesList onEdit={handleEditTemplate} highlightedTemplateId={highlightedTemplateId} />

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