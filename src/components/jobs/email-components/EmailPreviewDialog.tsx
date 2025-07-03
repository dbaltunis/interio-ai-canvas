import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";

interface EmailPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: any;
  clientData?: any;
  quoteData?: any;
  senderInfo?: {
    from_name: string;
    from_email: string;
  };
}

export const EmailPreviewDialog = ({ 
  open, 
  onOpenChange, 
  template, 
  clientData, 
  quoteData,
  senderInfo 
}: EmailPreviewDialogProps) => {
  const [previewContent, setPreviewContent] = useState("");
  const { data: businessSettings } = useBusinessSettings();

  useEffect(() => {
    if (template) {
      let content = template.content;
      
      // Replace template variables with actual data
      const replacements = {
        client_name: clientData?.name || "John Doe",
        company_name: businessSettings?.company_name || "Your Company",
        quote_number: quoteData?.quote_number || "Q-001234",
        quote_amount: quoteData?.total_amount || "2,500.00",
        installation_date: "March 15, 2024",
        installation_time: "10:00 AM - 2:00 PM",
        installer_name: "Mike Johnson",
        project_name: quoteData?.project_name || "Living Room Window Treatments",
        season: "Spring",
        discount_percentage: "15",
        offer_expires: "March 31, 2024",
        fabric_collection_name: "Premium Designer Collection"
      };

      // Replace all template variables
      Object.entries(replacements).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        content = content.replace(regex, value);
      });

      // Add company logo if available
      if (businessSettings?.company_logo_url) {
        content = content.replace(
          /<h1 style="color: #2c5530; margin-bottom: 10px;">([^<]+)<\/h1>/,
          `<div style="text-align: center; margin-bottom: 20px;">
            <img src="${businessSettings.company_logo_url}" alt="Company Logo" style="max-height: 60px; margin-bottom: 10px;" />
            <h1 style="color: #2c5530; margin-bottom: 10px;">$1</h1>
          </div>`
        );
      }

      setPreviewContent(content);
    }
  }, [template, clientData, quoteData, businessSettings]);

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Email Preview: {template.name}
            <Badge variant="outline">{template.category}</Badge>
          </DialogTitle>
          <DialogDescription>
            Preview how your email will look to recipients
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Header Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-600">From:</p>
                  <p>{senderInfo?.from_name || businessSettings?.company_name || "Your Company"}</p>
                  <p className="text-gray-500">{senderInfo?.from_email || "your-email@company.com"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">To:</p>
                  <p>{clientData?.name || "Selected Client"}</p>
                  <p className="text-gray-500">{clientData?.email || "client@example.com"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Subject:</p>
                  <p>{template.subject}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email Content Preview */}
          <Card>
            <CardContent className="p-0">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-600">Email Content</p>
                </div>
                <div 
                  className="p-6 bg-white"
                  dangerouslySetInnerHTML={{ __html: previewContent }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Template Variables */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Template Variables</h4>
              <div className="flex flex-wrap gap-2">
                {template.variables?.map((variable: string) => (
                  <Badge key={variable} variant="secondary" className="text-xs">
                    {variable}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close Preview
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Use This Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};