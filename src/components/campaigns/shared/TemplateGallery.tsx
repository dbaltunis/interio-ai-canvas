import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, RefreshCw, Megaphone, UserPlus, Sparkles, Mail } from "lucide-react";
import { useGeneralEmailTemplates } from "@/hooks/useGeneralEmailTemplates";
import { getTemplateTypeLabel } from "@/utils/emailTemplateVariables";

interface EmailTemplate {
  id: string;
  name: string;
  category: 'outreach' | 'follow-up' | 're-engagement' | 'announcement';
  subject: string;
  content: string;
  description: string;
}

interface TemplateGalleryProps {
  onSelectTemplate: (template: EmailTemplate) => void;
  selectedCategory?: string;
}

// Map database template types to campaign categories
const mapTemplateToCategory = (templateType: string): 'outreach' | 'follow-up' | 're-engagement' | 'announcement' => {
  const mapping: Record<string, 'outreach' | 'follow-up' | 're-engagement' | 'announcement'> = {
    'outreach': 'outreach',
    'welcome': 'outreach',
    'lead_initial_contact': 'outreach',
    'quote': 'outreach',
    'follow_up': 'follow-up',
    'follow-up': 'follow-up',
    'project_follow_up': 'follow-up',
    'reminder': 'follow-up',
    're-engagement': 're-engagement',
    'thank_you': 're-engagement',
    'announcement': 'announcement',
    'booking_confirmation': 'announcement',
  };
  return mapping[templateType] || 'outreach';
};

const CATEGORY_ICONS: Record<string, any> = {
  'outreach': UserPlus,
  'follow-up': RefreshCw,
  're-engagement': Sparkles,
  'announcement': Megaphone,
};

const CATEGORY_COLORS: Record<string, string> = {
  'outreach': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  'follow-up': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  're-engagement': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
  'announcement': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
};

export const TemplateGallery = ({
  onSelectTemplate,
  selectedCategory
}: TemplateGalleryProps) => {
  const { data: dbTemplates = [], isLoading } = useGeneralEmailTemplates();

  // Convert database templates to gallery format
  const templates: EmailTemplate[] = dbTemplates.map(t => ({
    id: t.id,
    name: getTemplateTypeLabel(t.template_type),
    category: mapTemplateToCategory(t.template_type),
    subject: t.subject,
    content: t.content,
    description: t.subject,
  }));

  const filteredTemplates = selectedCategory 
    ? templates.filter(t => t.category === selectedCategory)
    : templates;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground">Select a Template</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-muted rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Select a Template</h4>
        <Badge variant="outline" className="text-xs">
          {filteredTemplates.length} templates
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-1">
        {/* Blank Template Option */}
        <Card 
          className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
          onClick={() => onSelectTemplate({
            id: 'blank',
            name: 'Start from Scratch',
            category: 'outreach',
            description: 'Write your own email from scratch',
            subject: '',
            content: ''
          })}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="font-medium text-sm text-foreground">Start from Scratch</h5>
                <p className="text-xs text-muted-foreground truncate">
                  Write your own custom email
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Cards from Database */}
        {filteredTemplates.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center">
              <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No templates available. Create templates in the Templates section.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTemplates.map((template) => {
            const Icon = CATEGORY_ICONS[template.category] || FileText;
            const colorClass = CATEGORY_COLORS[template.category] || CATEGORY_COLORS['outreach'];
            
            return (
              <Card 
                key={template.id}
                className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
                onClick={() => onSelectTemplate(template)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg border ${colorClass} transition-colors`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm text-foreground">{template.name}</h5>
                      <p className="text-xs text-muted-foreground truncate">
                        {template.subject || 'No subject'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
