import { useState } from "react";
import { TemplateGallery } from "./TemplateGallery";
import { VisualQuoteDesigner } from "./VisualQuoteDesigner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const DocumentBuilderContainer = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showGallery, setShowGallery] = useState(true);

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setShowGallery(false);
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setShowGallery(false);
  };

  const handleBackToGallery = () => {
    setShowGallery(true);
    setSelectedTemplate(null);
  };

  if (showGallery) {
    return (
      <TemplateGallery
        onSelectTemplate={handleSelectTemplate}
        onCreateNew={handleCreateNew}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-background">
        <Button
          variant="ghost"
          onClick={handleBackToGallery}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Templates
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <VisualQuoteDesigner template={selectedTemplate} />
      </div>
    </div>
  );
};
