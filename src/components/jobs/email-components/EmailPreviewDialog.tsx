
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmailTemplateWithBusiness } from "@/components/email/EmailTemplateWithBusiness";

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Preview: {template.name}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <EmailTemplateWithBusiness
            subject={template.subject}
            content={template.content}
            clientData={clientData ? {
              name: clientData.name || '',
              email: clientData.email || '',
              company_name: clientData.company || ''
            } : undefined}
            quoteData={quoteData ? {
              quote_number: quoteData.quote_number || '',
              total_amount: quoteData.total_amount || 0,
              status: 'draft'
            } : undefined}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
