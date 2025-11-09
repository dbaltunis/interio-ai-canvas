import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

interface SEOPanelProps {
  seoTitle: string;
  seoDescription: string;
  slug: string;
  onSEOTitleChange: (value: string) => void;
  onSEODescriptionChange: (value: string) => void;
  onSlugChange: (value: string) => void;
}

export const SEOPanel = ({
  seoTitle,
  seoDescription,
  slug,
  onSEOTitleChange,
  onSEODescriptionChange,
  onSlugChange,
}: SEOPanelProps) => {
  // Calculate SEO score
  const titleLength = seoTitle.length;
  const descLength = seoDescription.length;
  const hasSlug = slug.length > 0;
  
  const titleScore = titleLength >= 30 && titleLength <= 60 ? 100 : Math.min((titleLength / 60) * 100, 100);
  const descScore = descLength >= 120 && descLength <= 160 ? 100 : Math.min((descLength / 160) * 100, 100);
  const slugScore = hasSlug ? 100 : 0;
  
  const overallScore = Math.round((titleScore + descScore + slugScore) / 3);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (score >= 60) return <Info className="h-4 w-4 text-yellow-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">SEO Optimization</CardTitle>
            <CardDescription>Critical for search engines & AI discovery</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getScoreIcon(overallScore)}
            <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Meta Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Meta Title</Label>
            <span className={`text-xs ${titleLength > 60 ? 'text-red-600' : titleLength >= 30 ? 'text-green-600' : 'text-yellow-600'}`}>
              {titleLength}/60 characters
            </span>
          </div>
          <Input
            value={seoTitle}
            onChange={(e) => onSEOTitleChange(e.target.value)}
            placeholder="Compelling page title for search results"
            maxLength={70}
          />
          <Progress value={Math.min((titleLength / 60) * 100, 100)} className="h-1" />
          <p className="text-xs text-muted-foreground">
            Best: 30-60 characters. Include primary keyword.
          </p>
        </div>

        {/* Meta Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Meta Description</Label>
            <span className={`text-xs ${descLength > 160 ? 'text-red-600' : descLength >= 120 ? 'text-green-600' : 'text-yellow-600'}`}>
              {descLength}/160 characters
            </span>
          </div>
          <Textarea
            value={seoDescription}
            onChange={(e) => onSEODescriptionChange(e.target.value)}
            placeholder="Brief, engaging description for search results. Include target keywords naturally."
            rows={3}
            maxLength={170}
          />
          <Progress value={Math.min((descLength / 160) * 100, 100)} className="h-1" />
          <p className="text-xs text-muted-foreground">
            Best: 120-160 characters. Persuasive call-to-action.
          </p>
        </div>

        {/* URL Slug */}
        <div className="space-y-2">
          <Label>URL Slug</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">/store/your-store/</span>
            <Input
              value={slug}
              onChange={(e) => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              placeholder="page-url"
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Use lowercase, hyphens, include keywords
          </p>
        </div>

        <Separator />

        {/* SEO Checklist */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">SEO Checklist</Label>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {titleLength >= 30 && titleLength <= 60 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
              <span>Meta title length optimized</span>
            </div>
            <div className="flex items-center gap-2">
              {descLength >= 120 && descLength <= 160 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
              <span>Meta description length optimized</span>
            </div>
            <div className="flex items-center gap-2">
              {slug.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <span>URL slug configured</span>
            </div>
          </div>
        </div>

        {/* AI Search Tips */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-sm text-blue-900 dark:text-blue-100">
              AI Search Optimization Tips
            </span>
          </div>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 ml-6 list-disc">
            <li>Use natural, conversational language</li>
            <li>Answer specific questions your customers ask</li>
            <li>Include location and service details</li>
            <li>Structure content with clear headings</li>
            <li>Add FAQ sections for common queries</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
