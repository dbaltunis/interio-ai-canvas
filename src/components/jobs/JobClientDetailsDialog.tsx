import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  User, 
  Calendar,
  FileText,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { MessagePreviewDrawer } from "@/components/messaging/MessagePreviewDrawer";

interface JobClientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: any;
}

export const JobClientDetailsDialog = ({ open, onOpenChange, client }: JobClientDetailsDialogProps) => {
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  
  if (!client) return null;

  const handleEmailClient = () => {
    if (client.email) {
      window.open(`mailto:${client.email}`, '_blank');
    }
  };

  const handleCallClient = () => {
    if (client.phone) {
      window.open(`tel:${client.phone}`, '_blank');
    }
  };

  const handleWhatsApp = () => {
    setShowWhatsAppDialog(true);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Client Details</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Client Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                {client.client_type === 'B2B' ? (
                  <Building2 className="h-5 w-5 text-blue-600" />
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
                <h3 className="text-lg font-semibold">
                  {client.client_type === 'B2B' ? client.company_name : client.name}
                </h3>
              </div>
              
              {client.client_type === 'B2B' && client.contact_person && (
                <p className="text-sm text-muted-foreground">
                  Contact: {client.contact_person}
                </p>
              )}
            </div>
            
            <Badge variant="outline" className={`${
              client.client_type === 'B2B' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-secondary/20 text-secondary-foreground border-secondary'
            }`}>
              {client.client_type || 'B2C'}
            </Badge>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="font-medium">Contact Information</h4>
            
            {client.email && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{client.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleEmailClient}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              </div>
            )}
            
            {client.phone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{client.phone}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleWhatsApp}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCallClient}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Address */}
          {(client.address || client.city || client.state || client.zip_code) && (
            <div className="space-y-2">
              <h4 className="font-medium">Address</h4>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  {client.address && <div>{client.address}</div>}
                  <div>
                    {client.city && `${client.city}, `}
                    {client.state && `${client.state} `}
                    {client.zip_code}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Client Notes */}
          {client.notes && (
            <div className="space-y-2">
              <h4 className="font-medium">Notes</h4>
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {client.notes}
              </div>
            </div>
          )}

          {/* Client Info */}
          <div className="space-y-2">
            <h4 className="font-medium">Client Information</h4>
            <div className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Client since {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              View All Jobs
            </Button>
            <Button variant="outline" className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              Edit Client
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    
    {/* WhatsApp Conversation Drawer */}
    <MessagePreviewDrawer
      open={showWhatsAppDialog}
      onOpenChange={setShowWhatsAppDialog}
      clientId={client.id}
      clientName={client.name}
      clientPhone={client.phone || undefined}
      channelFilter="whatsapp"
    />
    </>
  );
};