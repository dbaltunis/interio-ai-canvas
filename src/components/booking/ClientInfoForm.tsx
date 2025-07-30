import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Check } from "lucide-react";

interface ClientInfo {
  name: string;
  email: string;
  phone: string;
  notes: string;
  timezone: string;
}

interface ClientInfoFormProps {
  clientInfo: ClientInfo;
  onClientInfoChange: (info: ClientInfo) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}

export const ClientInfoForm = ({
  clientInfo,
  onClientInfoChange,
  onSubmit,
  isSubmitting,
  isValid
}: ClientInfoFormProps) => {
  const updateClientInfo = (field: keyof ClientInfo, value: string) => {
    onClientInfoChange({ ...clientInfo, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Your Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={clientInfo.name}
            onChange={(e) => updateClientInfo('name', e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={clientInfo.email}
            onChange={(e) => updateClientInfo('email', e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            value={clientInfo.phone}
            onChange={(e) => updateClientInfo('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        
        <div>
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={clientInfo.notes}
            onChange={(e) => updateClientInfo('notes', e.target.value)}
            placeholder="Any additional information or questions..."
            rows={3}
          />
        </div>

        <Button
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Confirming Booking...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Confirm Booking
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};