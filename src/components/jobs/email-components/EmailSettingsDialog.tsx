
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface EmailSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailSettings: any;
  onSave: (settings: any) => void;
}

export const EmailSettingsDialog = ({ 
  open, 
  onOpenChange, 
  emailSettings, 
  onSave 
}: EmailSettingsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email Settings</DialogTitle>
          <DialogDescription>
            Configure your sender information for outgoing emails
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="from_email">From Email Address</Label>
            <Input
              id="from_email"
              type="email"
              placeholder="your-email@company.com"
              value={emailSettings.from_email}
              onChange={(e) => onSave({ ...emailSettings, from_email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="from_name">From Name</Label>
            <Input
              id="from_name"
              placeholder="Your Company Name"
              value={emailSettings.from_name}
              onChange={(e) => onSave({ ...emailSettings, from_name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="reply_to_email">Reply-To Email (Optional)</Label>
            <Input
              id="reply_to_email"
              type="email"
              placeholder="replies@company.com"
              value={emailSettings.reply_to_email}
              onChange={(e) => onSave({ ...emailSettings, reply_to_email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="signature">Email Signature</Label>
            <Textarea
              id="signature"
              placeholder="Best regards,&#10;Your Name&#10;Your Company&#10;&#10;📧 your@email.com | 📞 +1 (555) 123-4567&#10;🌐 www.yourcompany.com"
              value={emailSettings.signature}
              onChange={(e) => onSave({ ...emailSettings, signature: e.target.value })}
              className="min-h-[120px]"
            />
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Pro tip: Use emojis and formatting to make your signature stand out!</p>
              <p>Example: 📧 email | 📞 phone | 🌐 website | 📍 location</p>
            </div>
          </div>
          <Button onClick={() => onOpenChange(false)} className="w-full">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
