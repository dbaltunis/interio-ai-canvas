import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { CampaignData } from "../CampaignWizard";

interface CampaignReviewStepProps {
  campaignData: CampaignData;
}

const TYPE_LABELS = {
  'outreach': 'New Lead Outreach',
  'follow-up': 'Follow-up',
  're-engagement': 'Re-engagement',
  'announcement': 'Announcement',
};

export const CampaignReviewStep = ({ campaignData }: CampaignReviewStepProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-green-600 mb-4">
        <CheckCircle2 className="h-5 w-5" />
        <span className="font-medium">Ready to launch!</span>
      </div>

      {/* Campaign Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Campaign Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="font-medium">{campaignData.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Type</span>
            <Badge variant="outline">{TYPE_LABELS[campaignData.type]}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recipients */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Recipients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total recipients</span>
            <Badge variant="secondary">{campaignData.recipients.length} contacts</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Email Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm text-muted-foreground">Subject</span>
            <p className="font-medium mt-1">{campaignData.subject}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Content preview</span>
            <div className="mt-1 p-3 bg-muted/50 rounded-lg text-sm max-h-[120px] overflow-y-auto whitespace-pre-wrap">
              {campaignData.content.substring(0, 300)}
              {campaignData.content.length > 300 && '...'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Send time</span>
            {campaignData.sendImmediately ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Immediately
              </Badge>
            ) : campaignData.scheduledAt ? (
              <span className="font-medium">
                {format(campaignData.scheduledAt, 'PPP')} at {format(campaignData.scheduledAt, 'p')}
              </span>
            ) : (
              <span className="text-muted-foreground">Not set</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
