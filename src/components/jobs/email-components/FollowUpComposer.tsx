
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, Send, X } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";

interface Email {
  id: string;
  subject: string;
  content: string;
  recipient_email: string;
  recipient_name?: string;
  status: string;
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  open_count: number;
  click_count: number;
  time_spent_seconds: number;
  bounce_reason?: string;
}

interface FollowUpComposerProps {
  email: Email;
  onSend: (followUpEmail: { subject: string; content: string }) => void;
  onCancel: () => void;
  isSending: boolean;
}

export const FollowUpComposer = ({ 
  email, 
  onSend, 
  onCancel, 
  isSending 
}: FollowUpComposerProps) => {
  // Generate suggested follow-up content
  const generateFollowUpContent = () => {
    const timeSinceSent = email.sent_at ? Math.floor((Date.now() - new Date(email.sent_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    let suggestedContent = "";
    if (email.open_count === 0) {
      suggestedContent = `<p>Hi ${email.recipient_name || "there"},</p><p>I wanted to follow up on the email I sent ${timeSinceSent > 0 ? `${timeSinceSent} days ago` : 'recently'} regarding "${email.subject}".</p><p>I understand you're probably busy, but I wanted to make sure you received my message and see if you have any questions.</p><p>Please let me know if there's a better time to discuss this or if you need any additional information.</p><p>Best regards</p>`;
    } else {
      suggestedContent = `<p>Hi ${email.recipient_name || "there"},</p><p>Thank you for opening my previous email about "${email.subject}". I wanted to follow up to see if you have any questions or if you'd like to discuss this further.</p><p>I'm happy to provide additional details or schedule a call at your convenience.</p><p>Looking forward to hearing from you.</p><p>Best regards</p>`;
    }
    
    return suggestedContent;
  };

  const [followUpEmail, setFollowUpEmail] = useState({
    subject: `Re: ${email.subject}`,
    content: generateFollowUpContent()
  });

  const handleSend = () => {
    onSend(followUpEmail);
  };

  return (
    <>
      <Separator />
      <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-blue-800 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Follow-up Email
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-blue-600 hover:text-blue-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-blue-800">Subject</label>
            <Input
              value={followUpEmail.subject}
              onChange={(e) => setFollowUpEmail(prev => ({ ...prev, subject: e.target.value }))}
              className="bg-white border-blue-300 focus:border-blue-500"
              placeholder="Follow-up subject..."
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-blue-800">Message</label>
            <RichTextEditor
              value={followUpEmail.content}
              onChange={(content) => setFollowUpEmail(prev => ({ ...prev, content }))}
              placeholder="Write your follow-up message..."
              className="min-h-[200px] bg-white"
            />
            <p className="text-xs text-blue-600 mt-1">
              AI has suggested content based on the original email's engagement
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending ? "Sending..." : "Send Follow-up"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
