import { useState, useRef } from "react";
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
  Plus,
  Eye,
  Edit3
} from "lucide-react";
import { useCampaignAssistant } from "@/hooks/useCampaignAssistant";
import { RichTextEditor } from "@/components/jobs/email-components/RichTextEditor";
import { EmailPreviewPane } from "@/components/campaigns/shared/EmailPreviewPane";
import { TemplateGallery } from "@/components/campaigns/shared/TemplateGallery";

interface CampaignContentStepProps {
  subject: string;
  content: string;
  campaignType: string;
  recipientCount?: number;
  onUpdateSubject: (subject: string) => void;
  onUpdateContent: (content: string) => void;
}

const PERSONALIZATION_TOKENS = [
  { token: '{{client_name}}', label: 'Client Name', icon: '👤' },
  { token: '{{company_name}}', label: 'Company', icon: '🏢' },
];

export const CampaignContentStep = ({
  subject,
  content,
  campaignType,
  recipientCount = 0,
  onUpdateSubject,
  onUpdateContent,
}: CampaignContentStepProps) => {
  const [aiSubjects, setAiSubjects] = useState<string[]>([]);
  const [spamScore, setSpamScore] = useState<number | null>(null);
  const [spamIssues, setSpamIssues] = useState<string[]>([]);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [showTemplates, setShowTemplates] = useState(!content);
  const [activeTab, setActiveTab] = useState<string>("edit");
  const { isLoading, getSubjectIdeas, checkSpamRisk } = useCampaignAssistant();
  
  // Basic spam word detection (local fallback)
  const spamWords = ['free', 'urgent', 'act now', 'limited time', '!!!', 'click here'];
  const hasLocalSpamWords = spamWords.some(word => 
    subject.toLowerCase().includes(word) || content.toLowerCase().includes(word)
  );

  const handleGetAISubjects = async () => {
    const result = await getSubjectIdeas({
      recipientCount,
      campaignType: campaignType as any,
    });
    if (result?.subjects) {
      setAiSubjects(result.subjects);
    }
  };

  const handleGenerateContent = async () => {
    setIsGeneratingContent(true);
    try {
      // Generate content based on campaign type
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
      
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 800));
      onUpdateContent(templates[campaignType] || templates['outreach']);
      setShowTemplates(false);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleCheckSpam = async () => {
    if (subject.length > 5 && content.length > 20) {
      const result = await checkSpamRisk(subject, content);
      if (result) {
        setSpamScore(result.score);
        setSpamIssues(result.issues || []);
      }
    }
  };

  const insertToken = (token: string) => {
    // Insert at cursor position if possible, otherwise append
    onUpdateContent(content + ' ' + token);
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
      {/* Template Selection (shown initially or when empty) */}
      {showTemplates && (
        <div className="space-y-3">
          <TemplateGallery 
            onSelectTemplate={handleSelectTemplate}
            selectedCategory={campaignType}
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

          {/* Personalization Tokens */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Personalization Tokens</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(true)}
                className="h-7 text-xs gap-1.5"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                Browse Templates
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {PERSONALIZATION_TOKENS.map((item) => (
                <Badge
                  key={item.token}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/20 hover:border-primary/40 transition-colors py-1.5 px-3 gap-1.5"
                  onClick={() => insertToken(item.token)}
                >
                  <Plus className="h-3 w-3" />
                  <span>{item.icon}</span>
                  {item.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Email Content with Split View */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Email Content</Label>
              <div className="flex items-center gap-2">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCheckSpam}
                  disabled={isLoading || plainTextContent.length < 20}
                  className="h-7 text-xs gap-1.5"
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  Spam Check
                </Button>
              </div>
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
                    className="min-h-[280px]"
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
                    className="min-h-[320px]"
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

            {/* Stats Bar */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
              <span>{charCount} characters • {wordCount} words</span>
              {spamScore === null && hasLocalSpamWords && (
                <span className="text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Potential spam words detected
                </span>
              )}
            </div>
          </div>

          {/* AI Spam Check Result */}
          {spamScore !== null && (
            <div className={`flex items-start gap-3 p-4 rounded-xl border ${
              spamScore > 50 ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800' : 
              spamScore > 25 ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800' : 
              'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800'
            }`}>
              <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                spamScore > 50 ? 'text-red-600' : 
                spamScore > 25 ? 'text-amber-600' : 
                'text-green-600'
              }`} />
              <div className="text-sm flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <strong>Spam Score: {spamScore}/100</strong>
                  <Badge variant={spamScore > 50 ? 'destructive' : spamScore > 25 ? 'secondary' : 'default'} className="text-xs">
                    {spamScore > 50 ? 'High Risk' : spamScore > 25 ? 'Medium Risk' : 'Low Risk'}
                  </Badge>
                </div>
                {spamIssues.length > 0 && (
                  <ul className="mt-2 text-muted-foreground list-disc list-inside space-y-0.5">
                    {spamIssues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
