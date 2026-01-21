import { Card } from "@/components/ui/card";
import { Mail, Phone, Globe, MapPin, Building2 } from "lucide-react";

interface EmailPreviewProps {
  fromName: string;
  fromEmail: string;
  signature: string;
  footer: {
    companyName?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  className?: string;
}

export const EmailPreview = ({ 
  fromName, 
  fromEmail, 
  signature, 
  footer,
  className 
}: EmailPreviewProps) => {
  const hasFooterContent = footer.companyName || footer.phone || footer.email || footer.website || footer.address;
  
  const formatAddress = () => {
    const parts = [footer.address, footer.city, footer.state, footer.country].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <Card className={`overflow-hidden border-2 ${className}`}>
      {/* Email Header */}
      <div className="bg-muted/50 px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">{fromName || 'Your Business Name'}</p>
            <p className="text-xs text-muted-foreground">{fromEmail || 'email@example.com'}</p>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-dashed">
          <p className="text-xs text-muted-foreground">Subject: <span className="text-foreground">Sample Email Preview</span></p>
        </div>
      </div>
      
      {/* Email Body */}
      <div className="p-4 min-h-[120px] bg-background">
        <p className="text-sm text-muted-foreground">
          Hi [Client Name],
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          This is a preview of how your emails will appear to recipients. 
          The signature and footer below will be automatically added.
        </p>
        
        {/* Signature */}
        {signature && (
          <div className="mt-4 pt-4 border-t border-dashed">
            <p className="text-sm whitespace-pre-line">{signature}</p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      {hasFooterContent && (
        <div className="bg-muted/30 px-4 py-3 border-t">
          <div className="text-center space-y-1">
            {footer.companyName && (
              <p className="font-medium text-sm flex items-center justify-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                {footer.companyName}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {footer.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {footer.phone}
                </span>
              )}
              {footer.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {footer.email}
                </span>
              )}
              {footer.website && (
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {footer.website}
                </span>
              )}
            </div>
            {formatAddress() && (
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" />
                {formatAddress()}
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
