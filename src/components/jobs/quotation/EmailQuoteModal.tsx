import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EmailQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  client: any;
  onSend: (emailData: { to: string; subject: string; message: string }) => void;
  isSending?: boolean;
  quotePreview?: React.ReactNode;
}

export const EmailQuoteModal: React.FC<EmailQuoteModalProps> = ({
  isOpen,
  onClose,
  project,
  client,
  onSend,
  isSending = false,
  quotePreview
}) => {
  const [emailData, setEmailData] = useState({
    to: client?.email || "",
    subject: `Quote for ${project?.name || "Your Project"}`,
    message: `Dear ${client?.name || "Valued Customer"},\n\nPlease find attached the quote for your project.\n\nBest regards`
  });
  const [showPreview, setShowPreview] = useState(false);

  const handleSend = () => {
    onSend(emailData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Quote
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email-to">To</Label>
            <Input
              id="email-to"
              type="email"
              value={emailData.to}
              onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
              placeholder="client@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-subject">Subject</Label>
            <Input
              id="email-subject"
              value={emailData.subject}
              onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
              placeholder="Quote for Your Project"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-message">Message</Label>
            <Textarea
              id="email-message"
              value={emailData.message}
              onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
              placeholder="Enter your message here..."
              rows={8}
            />
          </div>

          <div className="bg-muted p-3 rounded-md text-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Attachment:</p>
              {quotePreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="h-auto py-1 px-2"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  {showPreview ? "Hide" : "Preview"} Quote
                </Button>
              )}
            </div>
            <p className="text-muted-foreground">Quote PDF will be attached automatically</p>
            
            {showPreview && quotePreview && (
              <div className="mt-3 border rounded-md bg-background">
                <ScrollArea className="h-[400px] w-full">
                  <div className="p-4 scale-75 origin-top-left" style={{ width: '133.33%' }}>
                    {quotePreview}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!emailData.to || isSending}>
            <Mail className="h-4 w-4 mr-2" />
            {isSending ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
