import { SavedTemplatesManager } from "../templates/SavedTemplatesManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuoteTemplateSettingsTab } from "./QuoteTemplateSettingsTab";
import { WorkOrderTemplateSettingsTab } from "./WorkOrderTemplateSettingsTab";
import { FileText, Settings, Wrench } from "lucide-react";

export const DocumentTemplatesTab = () => {
  return (
    <div className="space-y-6">
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">✨ Professional Quote & Document Templates</h3>
        <p className="text-sm text-blue-700">
          Create professional quotations with our template system featuring: itemized breakdowns with images,
          room-by-room organization, automatic cost calculations, and high-quality PDF generation.
        </p>
      </div>
      
      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visual">
            <FileText className="h-4 w-4 mr-2" />
            Visual Templates
          </TabsTrigger>
          <TabsTrigger value="quotes">
            <Settings className="h-4 w-4 mr-2" />
            Quote Settings
          </TabsTrigger>
          <TabsTrigger value="workorders">
            <Wrench className="h-4 w-4 mr-2" />
            Work Orders
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="visual">
          <SavedTemplatesManager />
        </TabsContent>
        
        <TabsContent value="quotes">
          <QuoteTemplateSettingsTab />
        </TabsContent>
        
        <TabsContent value="workorders">
          <WorkOrderTemplateSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
