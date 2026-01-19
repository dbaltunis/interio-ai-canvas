import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Mail, Calendar as CalendarIcon, Send, Zap, Clock, Info, AlertTriangle, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { CampaignData } from "../CampaignWizard";

interface CampaignReviewStepProps {
  campaignData: CampaignData;
  onUpdateSendImmediately: (value: boolean) => void;
  onUpdateScheduledAt: (date?: Date) => void;
}

const TYPE_LABELS: Record<string, string> = {
  'outreach': 'New Lead Outreach',
  'follow-up': 'Follow-up',
  're-engagement': 'Re-engagement',
  'announcement': 'Announcement',
};

const STAGE_COLORS: Record<string, string> = {
  'lead': 'bg-blue-100 text-blue-700 border-blue-200',
  'contacted': 'bg-purple-100 text-purple-700 border-purple-200',
  'quoted': 'bg-amber-100 text-amber-700 border-amber-200',
  'negotiating': 'bg-orange-100 text-orange-700 border-orange-200',
  'won': 'bg-green-100 text-green-700 border-green-200',
  'lost': 'bg-red-100 text-red-700 border-red-200',
};

export const CampaignReviewStep = ({ 
  campaignData, 
  onUpdateSendImmediately,
  onUpdateScheduledAt 
}: CampaignReviewStepProps) => {
  const [time, setTime] = useState("09:00");

  // Strip HTML for preview
  const plainContent = campaignData.content.replace(/<[^>]*>/g, '').substring(0, 120);

  const handleDateSelect = (date?: Date) => {
    if (date) {
      const [hours, minutes] = time.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      onUpdateScheduledAt(date);
    } else {
      onUpdateScheduledAt(undefined);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (campaignData.scheduledAt) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDate = new Date(campaignData.scheduledAt);
      newDate.setHours(hours, minutes, 0, 0);
      onUpdateScheduledAt(newDate);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-5">
      {/* Tracking Limitations Banner */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
        <BarChart3 className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
            Tracking Limitations
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Open and click tracking may be limited when using the shared InterioApp email service. Many email clients block tracking pixels by default. For accurate analytics, consider integrating SendGrid with your own domain.
          </p>
        </div>
      </div>

      {/* Schedule Options - Compact */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">When to send?</Label>
        <RadioGroup
          value={campaignData.sendImmediately ? 'now' : 'scheduled'}
          onValueChange={(value) => onUpdateSendImmediately(value === 'now')}
          className="grid grid-cols-2 gap-3"
        >
          <label
            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              campaignData.sendImmediately
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            <RadioGroupItem value="now" />
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Send Now</span>
            </div>
          </label>

          <label
            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              !campaignData.sendImmediately
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            <RadioGroupItem value="scheduled" />
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Schedule</span>
            </div>
          </label>
        </RadioGroup>

        {/* Date/Time Picker - Inline */}
        {!campaignData.sendImmediately && (
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50">
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left font-normal h-9"
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {campaignData.scheduledAt ? format(campaignData.scheduledAt, 'PP') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={campaignData.scheduledAt}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="time" className="text-xs">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        )}
      </div>

      {/* Recipients List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Recipients ({campaignData.recipients.length})
          </Label>
        </div>
        <ScrollArea className="h-[140px] border border-border rounded-lg">
          <div className="p-2 space-y-1">
            {campaignData.recipients.map((recipient) => (
              <div 
                key={recipient.id} 
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary text-xs font-medium">
                    {getInitials(recipient.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{recipient.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{recipient.email}</p>
                </div>
                {recipient.funnel_stage && (
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] capitalize ${STAGE_COLORS[recipient.funnel_stage] || 'bg-muted text-muted-foreground'}`}
                  >
                    {recipient.funnel_stage}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Compact Email Preview */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-3 py-2 border-b border-border flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">{campaignData.name}</span>
          <Badge variant="secondary" className="text-[10px] ml-auto">
            {TYPE_LABELS[campaignData.type]}
          </Badge>
        </div>
        <div className="p-3 space-y-1.5">
          <p className="text-sm font-medium">{campaignData.subject}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {plainContent}{campaignData.content.length > 120 && '...'}
          </p>
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
        <Info className="h-3.5 w-3.5 text-blue-600 mt-0.5" />
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> Emails sent 9-11 AM Tue-Thu get the highest open rates.
        </p>
      </div>
    </div>
  );
};
