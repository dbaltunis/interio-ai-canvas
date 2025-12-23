import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Sparkles, AlertTriangle } from "lucide-react";

interface CampaignContentStepProps {
  subject: string;
  content: string;
  campaignType: string;
  onUpdateSubject: (subject: string) => void;
  onUpdateContent: (content: string) => void;
}

const SUBJECT_SUGGESTIONS: Record<string, string[]> = {
  'outreach': [
    'Quick question about your project',
    'Can we help with your window treatments?',
    'Introducing ourselves',
  ],
  'follow-up': [
    'Following up on our conversation',
    'Just checking in',
    'Any questions about our proposal?',
  ],
  're-engagement': [
    'We miss you!',
    'It\'s been a while',
    'Something new for you',
  ],
  'announcement': [
    'Exciting news from our team',
    'You\'re invited',
    'New services available',
  ],
};

const PERSONALIZATION_TOKENS = [
  { token: '{{client_name}}', label: 'Client Name' },
  { token: '{{company_name}}', label: 'Company' },
];

export const CampaignContentStep = ({
  subject,
  content,
  campaignType,
  onUpdateSubject,
  onUpdateContent,
}: CampaignContentStepProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const suggestions = SUBJECT_SUGGESTIONS[campaignType] || SUBJECT_SUGGESTIONS['outreach'];
  
  // Basic spam word detection
  const spamWords = ['free', 'urgent', 'act now', 'limited time', '!!!', 'click here'];
  const hasSpamWords = spamWords.some(word => 
    subject.toLowerCase().includes(word) || content.toLowerCase().includes(word)
  );

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
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-xs"
          >
            <Lightbulb className="h-3.5 w-3.5 mr-1" />
            Suggestions
          </Button>
        </div>
        <Input
          id="subject"
          placeholder="Write a compelling subject line..."
          value={subject}
          onChange={(e) => onUpdateSubject(e.target.value)}
          className="text-base"
        />
        
        {/* Subject Suggestions */}
        {showSuggestions && (
          <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg">
            {suggestions.map((suggestion, i) => (
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
        <Label htmlFor="content">Email Content</Label>
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

      {/* Spam Warning */}
      {hasSpamWords && (
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
