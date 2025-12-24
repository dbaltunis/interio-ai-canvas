import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Sparkles, AlertTriangle, Loader2, Wand2 } from "lucide-react";
import { useCampaignAssistant } from "@/hooks/useCampaignAssistant";

interface CampaignContentStepProps {
  subject: string;
  content: string;
  campaignType: string;
  recipientCount?: number;
  onUpdateSubject: (subject: string) => void;
  onUpdateContent: (content: string) => void;
}

const PERSONALIZATION_TOKENS = [
  { token: '{{client_name}}', label: 'Client Name' },
  { token: '{{company_name}}', label: 'Company' },
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
    onUpdateContent(content + token);
  };

  return (
    <div className="space-y-5">
      {/* Subject Line */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="subject">Email Subject</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGetAISubjects}
            disabled={isLoading}
            className="text-xs"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Wand2 className="h-3.5 w-3.5 mr-1" />
            )}
            AI Suggestions
          </Button>
        </div>
        <Input
          id="subject"
          placeholder="Write a compelling subject line..."
          value={subject}
          onChange={(e) => onUpdateSubject(e.target.value)}
          className="text-base"
        />
        
        {/* AI Subject Suggestions */}
        {aiSubjects.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
            <span className="text-xs text-muted-foreground w-full mb-1">AI Suggestions:</span>
            {aiSubjects.map((suggestion, i) => (
              <Badge
                key={i}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10"
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
        <Label>Personalization</Label>
        <div className="flex flex-wrap gap-2">
          {PERSONALIZATION_TOKENS.map((item) => (
            <Badge
              key={item.token}
              variant="secondary"
              className="cursor-pointer hover:bg-primary/20"
              onClick={() => insertToken(item.token)}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {item.label}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Click to insert personalization tokens into your content
        </p>
      </div>

      {/* Email Content */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Email Content</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCheckSpam}
            disabled={isLoading || content.length < 20}
            className="text-xs"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            )}
            Check Spam Risk
          </Button>
        </div>
        <Textarea
          id="content"
          placeholder="Write your email message here...

Use personalization tokens like {{client_name}} to make each email personal.

Keep it short and friendly!"
          value={content}
          onChange={(e) => onUpdateContent(e.target.value)}
          className="min-h-[200px] resize-none"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{content.length} characters</span>
          <span>{content.split(/\s+/).filter(Boolean).length} words</span>
        </div>
      </div>

      {/* AI Spam Check Result */}
      {spamScore !== null && (
        <div className={`flex items-start gap-2 p-3 rounded-lg border ${
          spamScore > 50 ? 'bg-red-50 border-red-200' : 
          spamScore > 25 ? 'bg-amber-50 border-amber-200' : 
          'bg-green-50 border-green-200'
        }`}>
          <AlertTriangle className={`h-4 w-4 mt-0.5 ${
            spamScore > 50 ? 'text-red-600' : 
            spamScore > 25 ? 'text-amber-600' : 
            'text-green-600'
          }`} />
          <div className="text-sm">
            <strong>Spam Score: {spamScore}/100</strong>
            {spamIssues.length > 0 && (
              <ul className="mt-1 text-muted-foreground list-disc list-inside">
                {spamIssues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Local Spam Warning */}
      {hasLocalSpamWords && spamScore === null && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Spam Risk:</strong> Your content contains words that may trigger spam filters.
            Consider removing words like "free", "urgent", or excessive punctuation.
          </div>
        </div>
      )}
    </div>
  );
};
