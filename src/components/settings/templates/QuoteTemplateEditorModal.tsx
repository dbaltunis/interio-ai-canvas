
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Eye, Upload, X } from "lucide-react";
import { TemplateHeaderEditor } from "./TemplateHeaderEditor";
import { TemplateBodyEditor } from "./TemplateBodyEditor";
import { TemplateFooterEditor } from "./TemplateFooterEditor";
import { TemplateStylingControls } from "./TemplateStylingControls";
import { TemplatePreview } from "./TemplatePreview";

interface QuoteTemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: any;
  onSave: (template: any) => void;
}

export const QuoteTemplateEditorModal = ({ 
  isOpen, 
  onClose, 
  template, 
  onSave 
}: QuoteTemplateEditorModalProps) => {
  const [templateData, setTemplateData] = useState({
    name: template?.name || "New Quote Template",
    header: {
      showLogo: true,
      logoPosition: "top-left",
      companyInfo: {
        name: "{{company_name}}",
        address: "{{company_address}}",
        phone: "{{company_phone}}",
        email: "{{company_email}}"
      },
      clientInfo: {
        label: "Bill To:",
        fields: ["{{client_name}}", "{{client_email}}", "{{client_address}}"]
      }
    },
    body: {
      layout: "table",
      columns: [
        { key: "room", label: "Room", visible: true },
        { key: "treatment", label: "Treatment", visible: true },
        { key: "quantity", label: "Qty", visible: true },
        { key: "unitPrice", label: "Unit Price", visible: true },
        { key: "total", label: "Total", visible: true }
      ],
      showSubtotal: true,
      showTax: true,
      showTotal: true
    },
    footer: {
      introText: "Thank you for choosing our services. Please review the quote details below.",
      termsText: "Payment terms: Net 30 days. Quote valid for 30 days.",
      showSignature: true
    },
    styling: {
      fontFamily: "Inter",
      fontSize: "14px",
      primaryColor: "#3B82F6",
      borderStyle: "solid",
      spacing: "normal"
    },
    ...template
  });

  const [showPreview, setShowPreview] = useState(false);

  const handleSave = () => {
    onSave(templateData);
    onClose();
  };

  const updateTemplateData = (section: string, data: any) => {
    setTemplateData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], ...data }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Quote Template Editor
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Template
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateData.name}
                onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex h-full overflow-hidden">
          {!showPreview ? (
            <div className="flex-1 overflow-auto">
              <Tabs defaultValue="header" className="h-full">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                  <TabsTrigger value="header">Header</TabsTrigger>
                  <TabsTrigger value="body">Body</TabsTrigger>
                  <TabsTrigger value="footer">Footer</TabsTrigger>
                  <TabsTrigger value="styling">Styling</TabsTrigger>
                </TabsList>

                <TabsContent value="header" className="space-y-4">
                  <TemplateHeaderEditor
                    data={templateData.header}
                    onChange={(data) => updateTemplateData('header', data)}
                  />
                </TabsContent>

                <TabsContent value="body" className="space-y-4">
                  <TemplateBodyEditor
                    data={templateData.body}
                    onChange={(data) => updateTemplateData('body', data)}
                  />
                </TabsContent>

                <TabsContent value="footer" className="space-y-4">
                  <TemplateFooterEditor
                    data={templateData.footer}
                    onChange={(data) => updateTemplateData('footer', data)}
                  />
                </TabsContent>

                <TabsContent value="styling" className="space-y-4">
                  <TemplateStylingControls
                    data={templateData.styling}
                    onChange={(data) => updateTemplateData('styling', data)}
                  />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <TemplatePreview template={templateData} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
