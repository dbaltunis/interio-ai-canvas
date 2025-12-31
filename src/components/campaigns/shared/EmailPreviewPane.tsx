import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone } from "lucide-react";

interface EmailPreviewPaneProps {
  subject: string;
  content: string;
  sampleData?: {
    client_name?: string;
    company_name?: string;
  };
}

export const EmailPreviewPane = ({
  subject,
  content,
  sampleData = { client_name: "John Smith", company_name: "Acme Corp" }
}: EmailPreviewPaneProps) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Replace personalization tokens with sample data
  const personalizeContent = (text: string) => {
    return text
      .replace(/\{\{client_name\}\}/g, sampleData.client_name || "John Smith")
      .replace(/\{\{company_name\}\}/g, sampleData.company_name || "Acme Corp");
  };

  const personalizedSubject = personalizeContent(subject);
  const personalizedContent = personalizeContent(content);

  return (
    <div className="flex flex-col h-full">
      {/* Preview Toggle */}
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
        <span className="text-sm font-medium text-foreground">Preview</span>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewMode === 'desktop' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-2"
            onClick={() => setViewMode('desktop')}
          >
            <Monitor className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={viewMode === 'mobile' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-2"
            onClick={() => setViewMode('mobile')}
          >
            <Smartphone className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Email Preview Frame */}
      <div className="flex-1 overflow-hidden">
        <div 
          className={`mx-auto transition-all duration-300 ${
            viewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
          }`}
        >
          <Card className="overflow-hidden shadow-lg border-2 border-border">
            {/* Email Header */}
            <div className="bg-muted/50 p-3 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground font-medium">From:</span>
                  <span className="text-foreground">Your Business</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground font-medium">To:</span>
                  <span className="text-foreground">{sampleData.client_name} &lt;email@example.com&gt;</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground font-medium">Subject:</span>
                  <span className="text-foreground font-medium">
                    {personalizedSubject || "Your subject line here..."}
                  </span>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div 
              className="p-4 bg-background min-h-[200px] max-h-[400px] overflow-y-auto"
              style={{
                lineHeight: '1.6',
                fontSize: viewMode === 'mobile' ? '14px' : '15px'
              }}
            >
              {personalizedContent ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: personalizedContent }}
                  className="prose prose-sm max-w-none"
                />
              ) : (
                <p className="text-muted-foreground italic">
                  Start typing to see your email preview...
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Preview Note */}
      <p className="text-xs text-muted-foreground mt-3 text-center">
        Personalization tokens replaced with sample data
      </p>
    </div>
  );
};
