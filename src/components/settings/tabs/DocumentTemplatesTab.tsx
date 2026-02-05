import { SimpleTemplateManager } from "../templates/SimpleTemplateManager";
import { QuoteTemplateStyleSelector } from "../templates/QuoteTemplateStyleSelector";
import { SectionHelpButton } from "@/components/help/SectionHelpButton";
import { Separator } from "@/components/ui/separator";

export const DocumentTemplatesTab = () => {
  return (
    <div className="space-y-8">
      {/* Header with Help */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Document Templates</h3>
          <p className="text-sm text-muted-foreground">Customize quotes, invoices, and work orders</p>
        </div>
        <SectionHelpButton sectionId="documents" />
      </div>

      {/* Quote Template Style Selector */}
      <QuoteTemplateStyleSelector />

      <Separator />

      {/* Block-Based Template Editor */}
      <SimpleTemplateManager />
    </div>
  );
};
