import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Lightbulb, 
  AlertTriangle, 
  Loader2, 
  Eye,
  Edit3,
  CheckCircle2,
  User,
  Building2,
  Rocket,
  RefreshCw,
  Heart,
  Megaphone,
  Shield,
  Users,
  Mail
} from "lucide-react";
import { RichTextEditor } from "@/components/jobs/email-components/RichTextEditor";
import { EmailPreviewPane } from "@/components/campaigns/shared/EmailPreviewPane";
import { TemplateGallery } from "@/components/campaigns/shared/TemplateGallery";
import { DeliverabilityScoreCard } from "@/components/campaigns/DeliverabilityScoreCard";
import { useEmailDeliverability, analyzeEmailContent, calculateDeliverabilityScore } from "@/hooks/useEmailDeliverability";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SelectedClient } from "@/hooks/useClientSelection";

interface CampaignContentStepProps {
  name: string;
  type: 'outreach' | 'follow-up' | 're-engagement' | 'announcement';
  subject: string;
  content: string;
  recipientCount?: number;
  recipients?: SelectedClient[];
  fromTemplate?: boolean;
  templateName?: string;
  onUpdateName: (name: string) => void;
  onUpdateType: (type: 'outreach' | 'follow-up' | 're-engagement' | 'announcement') => void;
  onUpdateSubject: (subject: string) => void;
  onUpdateContent: (content: string) => void;
}

const PERSONALIZATION_TOKENS = [
  { token: '{{client_name}}', label: 'Client Name', icon: User },
  { token: '{{company_name}}', label: 'Company', icon: Building2 },
];

const CAMPAIGN_TYPES = [
  { value: 'outreach' as const, label: 'Outreach', icon: Rocket, color: 'text-blue-500 bg-blue-50 border-blue-200' },
  { value: 'follow-up' as const, label: 'Follow-up', icon: RefreshCw, color: 'text-purple-500 bg-purple-50 border-purple-200' },
  { value: 're-engagement' as const, label: 'Re-engage', icon: Heart, color: 'text-pink-500 bg-pink-50 border-pink-200' },
  { value: 'announcement' as const, label: 'Announce', icon: Megaphone, color: 'text-orange-500 bg-orange-50 border-orange-200' },
];

export const CampaignContentStep = ({
  name,
  type,
  subject,
  content,
  recipientCount = 0,
  recipients = [],
  fromTemplate = false,
  templateName,
  onUpdateName,
  onUpdateType,
  onUpdateSubject,
  onUpdateContent,
}: CampaignContentStepProps) => {
  const [showTemplates, setShowTemplates] = useState(!content);
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [showRecipientList, setShowRecipientList] = useState(false);
  
  // Fetch deliverability data
  const { data: deliverabilityData, isLoading: isLoadingDeliverability } = useEmailDeliverability();

  // Calculate content analysis and deliverability score
  const contentAnalysis = useMemo(() => 
    analyzeEmailContent(subject, content),
    [subject, content]
  );

  const deliverabilityScore = useMemo(() => 
    calculateDeliverabilityScore(deliverabilityData, contentAnalysis, []),
    [deliverabilityData, contentAnalysis]
  );

  const insertToken = (token: string, label: string) => {
    onUpdateContent(content + ' ' + token);
    toast.success(`Inserted ${label}`, { duration: 1500 });
  };

  const handleSelectTemplate = (template: { subject: string; content: string }) => {
    if (template.subject) onUpdateSubject(template.subject);
    if (template.content) onUpdateContent(template.content);
    setShowTemplates(false);
  };

  // Calculate character and word counts (strip HTML for content)
  const plainTextContent = content.replace(/<[^>]*>/g, '');
  const charCount = plainTextContent.length;
  const wordCount = plainTextContent.split(/\s+/).filter(Boolean).length;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const actualRecipientCount = recipients.length || recipientCount;

  return (
    <div className="space-y-5">
      {/* Recipient Count Banner */}
      {actualRecipientCount > 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Sending to <span className="text-primary">{actualRecipientCount}</span> recipient{actualRecipientCount !== 1 ? 's' : ''}
            </span>
          </div>
          {recipients.length > 0 && (
            <Dialog open={showRecipientList} onOpenChange={setShowRecipientList}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  View List
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Campaign Recipients ({recipients.length})
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] mt-4">
                  <div className="space-y-2 pr-4">
                    {recipients.map((recipient) => (
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
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}

      {/* Campaign Name - With optional template badge */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="campaign-name" className="text-sm font-medium">Campaign Name</Label>
          {fromTemplate && templateName && (
            <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary border-primary/20">
              <CheckCircle2 className="h-3 w-3" />
              {templateName} Template
            </Badge>
          )}
        </div>
        <Input
          id="campaign-name"
          placeholder="e.g., Q4 Outreach Campaign"
          value={name}
          onChange={(e) => onUpdateName(e.target.value)}
          className="h-10"
        />
      </div>

      {/* Template Selection (shown initially or when empty) */}
      {showTemplates && (
        <div className="space-y-3">
          <TemplateGallery 
            onSelectTemplate={handleSelectTemplate}
            selectedCategory={type}
          />
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTemplates(false)}
              className="text-xs text-muted-foreground"
            >
              Skip templates, start writing
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Editor */}
      {!showTemplates && (
        <>
          {/* Subject Line */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="subject" className="text-sm font-medium">Email Subject</Label>
            </div>
            <Input
              id="subject"
              placeholder="Write a compelling subject line..."
              value={subject}
              onChange={(e) => onUpdateSubject(e.target.value)}
              className="text-base h-11"
            />
          </div>

          {/* Email Content with Split View */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Email Content</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplates(true)}
                  className="h-7 text-xs gap-1.5"
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  Templates
                </Button>
              </div>
            </div>

            {/* Personalization Tokens - Clickable Buttons */}
            <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg border border-border">
              <span className="text-xs text-muted-foreground mr-1">Click to insert:</span>
              {PERSONALIZATION_TOKENS.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.token}
                    variant="secondary"
                    size="sm"
                    onClick={() => insertToken(item.token, item.label)}
                    className="h-7 text-xs gap-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Icon className="h-3 w-3" />
                    {item.label}
                  </Button>
                );
              })}
            </div>

            {/* Tabs for Edit/Preview on Mobile, Split on Desktop */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:hidden">
                <TabsTrigger value="edit" className="gap-1.5">
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </TabsTrigger>
              </TabsList>

              {/* Mobile: Tabbed View */}
              <div className="md:hidden">
                <TabsContent value="edit" className="mt-3">
                  <RichTextEditor
                    value={content}
                    onChange={onUpdateContent}
                    placeholder="Write your email message here...

Use personalization tokens like {{client_name}} to make each email personal."
                    className="min-h-[200px]"
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-3">
                  <EmailPreviewPane
                    subject={subject}
                    content={content}
                  />
                </TabsContent>
              </div>

              {/* Desktop: Split View */}
              <div className="hidden md:grid md:grid-cols-2 gap-4 mt-3">
                <div>
                  <RichTextEditor
                    value={content}
                    onChange={onUpdateContent}
                    placeholder="Write your email message here...

Use personalization tokens like {{client_name}} to make each email personal."
                    className="min-h-[220px]"
                  />
                </div>
                <div className="border border-border rounded-xl p-4 bg-muted/30">
                  <EmailPreviewPane
                    subject={subject}
                    content={content}
                  />
                </div>
              </div>
            </Tabs>

            {/* Stats Bar with Deliverability Score */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <span>{charCount} characters • {wordCount} words</span>
              <div className="flex items-center gap-2">
                {isLoadingDeliverability ? (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Checking...</span>
                  </div>
                ) : (
                  <DeliverabilityScoreCard
                    percentage={deliverabilityScore.percentage}
                    breakdown={deliverabilityScore.breakdown}
                    recommendations={deliverabilityScore.recommendations}
                    compact={true}
                    usingSharedService={deliverabilityScore.usingSharedService}
                    serviceInfo={deliverabilityScore.serviceInfo}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Deliverability Warning (show if score is low) */}
          {deliverabilityScore.warningLevel !== 'none' && deliverabilityScore.recommendations.length > 0 && (
            <div className={cn(
              "flex items-start gap-3 p-3 rounded-lg border",
              deliverabilityScore.warningLevel === 'high' 
                ? "border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800"
                : "border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800"
            )}>
              <Shield className={cn(
                "h-4 w-4 mt-0.5 shrink-0",
                deliverabilityScore.warningLevel === 'high' ? "text-red-600" : "text-amber-600"
              )} />
              <div className={cn(
                "text-sm",
                deliverabilityScore.warningLevel === 'high' 
                  ? "text-red-800 dark:text-red-200"
                  : "text-amber-800 dark:text-amber-200"
              )}>
                <span className="font-medium">Improve deliverability: </span>
                {deliverabilityScore.recommendations.slice(0, 2).join(' • ')}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
