import { Badge } from "@/components/ui/badge";
import { Users, Mail, Calendar, Send } from "lucide-react";
import { format } from "date-fns";
import { CampaignData } from "../CampaignWizard";

interface CampaignReviewStepProps {
  campaignData: CampaignData;
}

const TYPE_LABELS: Record<string, string> = {
  'outreach': 'New Lead Outreach',
  'follow-up': 'Follow-up',
  're-engagement': 'Re-engagement',
  'announcement': 'Announcement',
};

export const CampaignReviewStep = ({ campaignData }: CampaignReviewStepProps) => {
  // Strip HTML for preview
  const plainContent = campaignData.content.replace(/<[^>]*>/g, '').substring(0, 150);

  return (
    <div className="space-y-6">
      {/* Simple Summary Card */}
      <div className="bg-muted/30 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-lg">{campaignData.name}</h3>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Recipients:</span>
            <Badge variant="secondary">{campaignData.recipients.length}</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Type:</span>
            <span>{TYPE_LABELS[campaignData.type] || campaignData.type}</span>
          </div>
          
          <div className="col-span-2 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Schedule:</span>
            {campaignData.sendImmediately ? (
              <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                Send Immediately
              </Badge>
            ) : campaignData.scheduledAt ? (
              <span>{format(campaignData.scheduledAt, 'PPP')} at {format(campaignData.scheduledAt, 'p')}</span>
            ) : (
              <span className="text-muted-foreground">Not scheduled</span>
            )}
          </div>
        </div>
      </div>

      {/* Email Preview */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Email Preview</span>
        </div>
        <div className="p-4 space-y-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Subject: </span>
            <span className="font-medium">{campaignData.subject}</span>
          </div>
          <div className="text-sm text-muted-foreground border-t border-border pt-3 mt-3">
            {plainContent}
            {campaignData.content.length > 150 && '...'}
          </div>
        </div>
      </div>

      {/* Simple CTA */}
      <p className="text-center text-sm text-muted-foreground">
        Click <strong>Launch Campaign</strong> below to send your emails.
      </p>
    </div>
  );
};
