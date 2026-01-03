import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Phone, ExternalLink } from 'lucide-react';
import { WhatsAppMessageDialog } from './WhatsAppMessageDialog';

interface ContactClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  };
}

export const ContactClientDialog: React.FC<ContactClientDialogProps> = ({
  open,
  onOpenChange,
  client,
}) => {
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);

  const handleEmail = () => {
    if (client.email) {
      window.open(`mailto:${client.email}`, '_blank');
      onOpenChange(false);
    }
  };

  const handleCall = () => {
    if (client.phone) {
      window.open(`tel:${client.phone}`, '_blank');
      onOpenChange(false);
    }
  };

  const handleWhatsApp = () => {
    setShowWhatsAppDialog(true);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Contact {client.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {/* Email Option */}
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={handleEmail}
              disabled={!client.email}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="p-2 rounded-full bg-blue-100">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium">Send Email</p>
                  <p className="text-sm text-muted-foreground">
                    {client.email || 'No email address'}
                  </p>
                </div>
                {client.email && <ExternalLink className="h-4 w-4 text-muted-foreground" />}
              </div>
            </Button>

            {/* WhatsApp Option */}
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4 border-green-200 hover:bg-green-50"
              onClick={handleWhatsApp}
              disabled={!client.phone}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="p-2 rounded-full bg-green-100">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium">Send WhatsApp</p>
                  <p className="text-sm text-muted-foreground">
                    {client.phone || 'No phone number'}
                  </p>
                  {client.phone && (
                    <p className="text-xs text-green-600 mt-0.5">
                      Sent from InterioApp Business Number
                    </p>
                  )}
                </div>
              </div>
            </Button>

            {/* Call Option */}
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={handleCall}
              disabled={!client.phone}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="p-2 rounded-full bg-purple-100">
                  <Phone className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium">Call Client</p>
                  <p className="text-sm text-muted-foreground">
                    {client.phone || 'No phone number'}
                  </p>
                </div>
                {client.phone && <ExternalLink className="h-4 w-4 text-muted-foreground" />}
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Dialog */}
      {client.phone && (
        <WhatsAppMessageDialog
          open={showWhatsAppDialog}
          onOpenChange={setShowWhatsAppDialog}
          client={{
            id: client.id,
            name: client.name,
            phone: client.phone,
          }}
        />
      )}
    </>
  );
};
