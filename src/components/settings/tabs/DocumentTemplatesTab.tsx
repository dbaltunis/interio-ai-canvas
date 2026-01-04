import { SavedTemplatesManager } from "../templates/SavedTemplatesManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuoteTemplateSettingsTab } from "./QuoteTemplateSettingsTab";
import { FileText, Settings } from "lucide-react";

export const DocumentTemplatesTab = () => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-9">
          <TabsTrigger value="visual" className="text-xs">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="quotes" className="text-xs">
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="visual" className="mt-4">
          <SavedTemplatesManager />
        </TabsContent>
        
        <TabsContent value="quotes" className="mt-4">
          <QuoteTemplateSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
