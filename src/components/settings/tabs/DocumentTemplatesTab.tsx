import { SimpleTemplateManager } from "../templates/SimpleTemplateManager";
import { SectionHelpButton } from "@/components/help/SectionHelpButton";

export const DocumentTemplatesTab = () => {
  return (
    <div className="space-y-6">
      {/* Header with Help */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Document Templates</h3>
          <p className="text-sm text-muted-foreground">Customize quotes, invoices, and work orders</p>
        </div>
        <SectionHelpButton sectionId="documents" />
      </div>

      <SimpleTemplateManager />
    </div>
  );
};
