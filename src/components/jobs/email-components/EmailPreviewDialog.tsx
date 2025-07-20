
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface EmailPreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    id: string;
    name: string;
    subject: string;
    content: string;
    category: string;
    variables: any[];
  };
  clientData?: any;
  quoteData?: any;
  senderInfo?: any;
}

export const EmailPreviewDialog: React.FC<EmailPreviewDialogProps> = ({
  isOpen,
  onOpenChange,
  template,
  clientData,
  quoteData,
  senderInfo
}) => {
  const processTemplate = (content: string) => {
    let processedContent = content;
    
    // Replace client variables
    if (clientData) {
      processedContent = processedContent.replace(/{{client\.name}}/g, clientData.name || '');
      processedContent = processedContent.replace(/{{client\.email}}/g, clientData.email || '');
    }
    
    // Replace quote variables
    if (quoteData) {
      processedContent = processedContent.replace(/{{quote\.number}}/g, quoteData.quote_number || '');
      processedContent = processedContent.replace(/{{quote\.total}}/g, quoteData.total_amount || '0');
    }

    // Replace sender variables
    if (senderInfo) {
      processedContent = processedContent.replace(/{{sender\.name}}/g, senderInfo.from_name || '');
      processedContent = processedContent.replace(/{{sender\.email}}/g, senderInfo.from_email || '');
    }
    
    return processedContent;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Preview: {template.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="font-semibold">Subject:</label>
            <p className="bg-gray-50 p-2 rounded">{template.subject}</p>
          </div>
          
          <div>
            <label className="font-semibold">Content:</label>
            <div 
              className="bg-gray-50 p-4 rounded border min-h-[300px]"
              dangerouslySetInnerHTML={{ 
                __html: processTemplate(template.content) 
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
