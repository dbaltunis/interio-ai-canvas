import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Lightbulb, 
  Sparkles, 
  AlertTriangle, 
  Loader2, 
  Wand2,
  Eye,
  Edit3,
  CheckCircle2,
  User,
  Building2,
  Rocket,
  RefreshCw,
  Heart,
  Megaphone
} from "lucide-react";
import { useCampaignAssistant } from "@/hooks/useCampaignAssistant";
import { RichTextEditor } from "@/components/jobs/email-components/RichTextEditor";
import { EmailPreviewPane } from "@/components/campaigns/shared/EmailPreviewPane";
import { TemplateGallery } from "@/components/campaigns/shared/TemplateGallery";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CampaignContentStepProps {
  name: string;
  type: 'outreach' | 'follow-up' | 're-engagement' | 'announcement';
  subject: string;
  content: string;
  recipientCount?: number;
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

// Comprehensive spam word list for local detection
const SPAM_WORDS = [
  'free', 'urgent', 'act now', 'limited time', 'click here', 'buy now',
  'order now', 'don\'t miss', 'exclusive deal', 'special offer', 'winner',
  'congratulations', 'you won', 'cash prize', 'make money', 'earn money',
  'extra income', 'no obligation', 'risk free', 'satisfaction guaranteed',
  'double your', 'increase your', 'unlimited', '100% free', 'best price',
  'lowest price', 'amazing', 'incredible', 'unbelievable', 'miracle',
  '!!!', '???', 'URGENT', 'IMPORTANT', 'ACT NOW', 'LIMITED',
  'credit card', 'no credit check', 'no questions asked', 'apply now',
  'call now', 'subscribe', 'unsubscribe', 'opt-in', 'opt-out'
];

export const CampaignContentStep = ({
  name,
  type,
  subject,
  content,
  recipientCount = 0,
  onUpdateName,
  onUpdateType,
  onUpdateSubject,
  onUpdateContent,
}: CampaignContentStepProps) => {
  const [aiSubjects, setAiSubjects] = useState<string[]>([]);
  const [spamScore, setSpamScore] = useState<number | null>(null);
  const [spamIssues, setSpamIssues] = useState<string[]>([]);
  const [isCheckingSpam, setIsCheckingSpam] = useState(false);
  const [spamCheckProgress, setSpamCheckProgress] = useState(0);
  const [spamCheckPhase, setSpamCheckPhase] = useState<string>('');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [showTemplates, setShowTemplates] = useState(!content);
  const [activeTab, setActiveTab] = useState<string>("edit");
  const { isLoading, getSubjectIdeas } = useCampaignAssistant();

  // Auto spam check with debounce - LOCAL ONLY (no AI for faster response)
  const checkSpamLocal = useCallback(() => {
    const textToCheck = (subject + ' ' + content).toLowerCase();
    const foundWords: string[] = [];
    
    SPAM_WORDS.forEach(word => {
      if (textToCheck.includes(word.toLowerCase())) {
        foundWords.push(word);
      }
    });

    const score = Math.min(100, foundWords.length * 15);
    return { score, issues: foundWords.slice(0, 5).map(w => `Contains spam trigger: "${w}"`) };
  }, [subject, content]);

  // Auto-check spam when content changes (debounced) - Fast local check
  useEffect(() => {
    if (subject.length < 3 && content.length < 10) {
      setSpamScore(null);
      setSpamIssues([]);
      setSpamCheckProgress(0);
      setSpamCheckPhase('');
      return;
    }

    setIsCheckingSpam(true);
    setSpamCheckProgress(0);
    setSpamCheckPhase('Analyzing subject line...');
    
    // Progress simulation with phases
    const phases = [
      { progress: 25, phase: 'Analyzing subject line...' },
      { progress: 50, phase: 'Scanning email body...' },
      { progress: 75, phase: 'Checking spam triggers...' },
      { progress: 100, phase: 'Generating score...' },
    ];
    
    let phaseIndex = 0;
    const progressInterval = setInterval(() => {
      if (phaseIndex < phases.length) {
        setSpamCheckProgress(phases[phaseIndex].progress);
        setSpamCheckPhase(phases[phaseIndex].phase);
        phaseIndex++;
      }
    }, 200);

    const timer = setTimeout(() => {
      clearInterval(progressInterval);
      // Use fast local check
      const local = checkSpamLocal();
      setSpamScore(local.score);
      setSpamIssues(local.issues);
      setIsCheckingSpam(false);
      setSpamCheckProgress(0);
      setSpamCheckPhase('');
    }, 1000); // 1 second for smooth UX

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [subject, content, checkSpamLocal]);

  const handleGetAISubjects = async () => {
    const result = await getSubjectIdeas({
      recipientCount,
      campaignType: type as any,
    });
    if (result?.subjects) {
      setAiSubjects(result.subjects);
    }
  };

  const handleGenerateContent = async () => {
    setIsGeneratingContent(true);
    try {
      const templates: Record<string, string> = {
        'outreach': `<p>Hi {{client_name}},</p>
<p>I hope this email finds you well. I wanted to reach out because I believe we could help {{company_name}} achieve its goals.</p>
<p>Would you be open to a brief conversation to explore how we might work together?</p>
<p>Looking forward to connecting!</p>
<p>Best regards</p>`,
        'follow-up': `<p>Hi {{client_name}},</p>
<p>I wanted to follow up on my previous message. I understand how busy things can get at {{company_name}}.</p>
<p>Is there a better time for us to connect? I'd love to learn more about your current priorities.</p>
<p>Best regards</p>`,
        're-engagement': `<p>Hi {{client_name}},</p>
<p>It's been a while since we last connected, and I wanted to check in to see how things are going at {{company_name}}.</p>
<p>We've made some exciting updates that I think could benefit you. Would you like to catch up sometime this week?</p>
<p>Looking forward to reconnecting!</p>`,
        'announcement': `<p>Hi {{client_name}},</p>
<p>I'm excited to share some news with you!</p>
<p>[Your announcement here]</p>
<p>As a valued connection, I wanted to make sure you were among the first to know. Let me know if you have any questions!</p>
<p>Best regards</p>`,
      };
      
      await new Promise(resolve => setTimeout(resolve, 800));
      onUpdateContent(templates[type] || templates['outreach']);
      setShowTemplates(false);
    } finally {
      setIsGeneratingContent(false);
    }
  };

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

  return (
    <div className="space-y-5">
      {/* Campaign Name & Type - Compact Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="campaign-name" className="text-sm font-medium">Campaign Name</Label>
          <Input
            id="campaign-name"
            placeholder="e.g., Q4 Outreach Campaign"
            value={name}
            onChange={(e) => onUpdateName(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Type</Label>
          <div className="flex gap-1.5">
            {CAMPAIGN_TYPES.map((ct) => {
              const Icon = ct.icon;
              const isSelected = type === ct.value;
              return (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => onUpdateType(ct.value)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-medium transition-all",
                    isSelected ? ct.color : "border-border text-muted-foreground hover:border-muted-foreground/50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{ct.label}</span>
                </button>
              );
            })}
          </div>
        </div>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGetAISubjects}
                disabled={isLoading}
                className="h-7 text-xs gap-1.5"
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wand2 className="h-3.5 w-3.5" />
                )}
                AI Suggestions
              </Button>
            </div>
            <Input
              id="subject"
              placeholder="Write a compelling subject line..."
              value={subject}
              onChange={(e) => onUpdateSubject(e.target.value)}
              className="text-base h-11"
            />
            
            {/* AI Subject Suggestions */}
            {aiSubjects.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-primary/5 rounded-xl border border-primary/20">
                <span className="text-xs text-muted-foreground w-full mb-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI Suggestions:
                </span>
                {aiSubjects.map((suggestion, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 hover:border-primary/40 transition-colors py-1.5 px-3"
                    onClick={() => onUpdateSubject(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            )}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateContent}
                  disabled={isGeneratingContent}
                  className="h-7 text-xs gap-1.5"
                >
                  {isGeneratingContent ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Wand2 className="h-3.5 w-3.5" />
                  )}
                  Generate with AI
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

            {/* Stats Bar with Spam Check Progress */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <span>{charCount} characters • {wordCount} words</span>
              <div className="flex items-center gap-2">
                {isCheckingSpam ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-primary">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-xs">{spamCheckPhase}</span>
                    </div>
                    <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-200 rounded-full"
                        style={{ width: `${spamCheckProgress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{spamCheckProgress}%</span>
                  </div>
                ) : spamScore !== null ? (
                  <span className={`flex items-center gap-1 ${
                    spamScore > 50 ? 'text-destructive' : 
                    spamScore > 25 ? 'text-amber-600' : 
                    'text-green-600'
                  }`}>
                    {spamScore > 25 ? (
                      <AlertTriangle className="h-3 w-3" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    Spam: {spamScore}/100
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Spam Issues (only show if there are issues) */}
          {spamScore !== null && spamScore > 25 && spamIssues.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <span className="font-medium">Suggestions: </span>
                {spamIssues.slice(0, 3).join(' • ')}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
