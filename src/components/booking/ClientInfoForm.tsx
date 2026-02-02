import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, Mail, Phone, MessageSquare, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Your Information</h3>
        <p className="text-sm text-muted-foreground">Please provide your details to complete the booking</p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Full Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={clientInfo.name}
            onChange={(e) => updateClientInfo('name', e.target.value)}
            placeholder="John Smith"
            className={cn(
              "h-11 transition-all duration-200",
              "focus:ring-2 focus:ring-primary/20 focus:border-primary"
            )}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Email Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={clientInfo.email}
            onChange={(e) => updateClientInfo('email', e.target.value)}
            placeholder="john@example.com"
            className={cn(
              "h-11 transition-all duration-200",
              "focus:ring-2 focus:ring-primary/20 focus:border-primary"
            )}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Phone Number <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={clientInfo.phone}
            onChange={(e) => updateClientInfo('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className={cn(
              "h-11 transition-all duration-200",
              "focus:ring-2 focus:ring-primary/20 focus:border-primary"
            )}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Additional Notes <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <Textarea
            id="notes"
            value={clientInfo.notes}
            onChange={(e) => updateClientInfo('notes', e.target.value)}
            placeholder="Any specific topics you'd like to discuss or questions you have..."
            rows={3}
            className={cn(
              "resize-none transition-all duration-200",
              "focus:ring-2 focus:ring-primary/20 focus:border-primary"
            )}
          />
        </div>
      </div>

      {/* Submit Button */}
      <motion.div
        whileHover={{ scale: isValid && !isSubmitting ? 1.01 : 1 }}
        whileTap={{ scale: isValid && !isSubmitting ? 0.99 : 1 }}
      >
        <Button
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          className={cn(
            "w-full h-12 text-base font-semibold transition-all duration-300",
            "shadow-lg hover:shadow-xl",
            isValid && !isSubmitting && "bg-primary hover:bg-primary/90"
          )}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Confirming Booking...
            </>
          ) : (
            <>
              <Check className="h-5 w-5 mr-2" />
              Confirm Booking
            </>
          )}
        </Button>
      </motion.div>

      {/* Privacy Notice */}
      <p className="text-xs text-center text-muted-foreground">
        By confirming, you agree to receive booking confirmations via email.
        Your information is secure and will not be shared.
      </p>
    </div>
  );
};
