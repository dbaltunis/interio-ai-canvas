import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Calendar, Users, Edit, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RichTextEditor } from "@/components/jobs/email-components/RichTextEditor";
import { useToast } from "@/hooks/use-toast";

// Campaign templates - stored in localStorage for persistence
const DEFAULT_TEMPLATES = {
  newsletter: {
    id: 'newsletter',
    label: 'Newsletter',
    description: 'Share updates with clients',
    icon: Send,
    name: 'Newsletter Campaign',
    type: 'announcement' as const,
    subject: 'Latest Updates from {{company_name}}',
    content: `<p>Hi {{client_name}},</p>
<p>We're excited to share the latest updates from our team!</p>
<p>[Add your newsletter content here]</p>
<p>Best regards,<br/>The Team</p>`,
  },
  followup: {
    id: 'followup',
    label: 'Follow-up',
    description: 'Quote and project updates',
    icon: Calendar,
    name: 'Follow-up Campaign',
    type: 'follow-up' as const,
    subject: 'Following up on your recent inquiry',
    content: `<p>Hi {{client_name}},</p>
<p>I wanted to follow up on our recent conversation and see if you have any questions about the quote we provided.</p>
<p>We'd love to help you move forward with your project. Please let me know if there's anything I can assist with.</p>
<p>Best regards</p>`,
  },
  promotion: {
    id: 'promotion',
    label: 'Promotion',
    description: 'Special offers and services',
    icon: Users,
    name: 'Promotional Campaign',
    type: 'outreach' as const,
    subject: 'Special Offer for You!',
    content: `<p>Hi {{client_name}},</p>
<p>We have an exclusive offer just for you!</p>
<p>[Add your promotional details here]</p>
<p>Don't miss out on this limited-time opportunity.</p>
<p>Best regards</p>`,
  },
};

export type CampaignTemplateKey = keyof typeof DEFAULT_TEMPLATES;
export type CampaignTemplate = typeof DEFAULT_TEMPLATES[CampaignTemplateKey];

// Helper to get templates from localStorage or defaults
const getStoredTemplates = (): typeof DEFAULT_TEMPLATES => {
  try {
    const stored = localStorage.getItem('campaign_templates');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all fields exist
      return {
        newsletter: { ...DEFAULT_TEMPLATES.newsletter, ...parsed.newsletter },
        followup: { ...DEFAULT_TEMPLATES.followup, ...parsed.followup },
        promotion: { ...DEFAULT_TEMPLATES.promotion, ...parsed.promotion },
      };
    }
  } catch (e) {
    console.error('Failed to load templates from localStorage:', e);
  }
  return DEFAULT_TEMPLATES;
};

// Helper to save templates to localStorage
const saveTemplates = (templates: typeof DEFAULT_TEMPLATES) => {
  try {
    localStorage.setItem('campaign_templates', JSON.stringify(templates));
  } catch (e) {
    console.error('Failed to save templates to localStorage:', e);
  }
};

// Export function to get templates for use in campaigns
export const getCampaignTemplates = () => getStoredTemplates();

interface EmailTemplateLibraryProps {
  onSelectTemplate?: (template: { subject: string; content: string }) => void;
}

export const EmailTemplateLibrary = ({ onSelectTemplate }: EmailTemplateLibraryProps) => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState(getStoredTemplates);
  const [editingTemplate, setEditingTemplate] = useState<CampaignTemplateKey | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editContent, setEditContent] = useState("");

  const handleEdit = (key: CampaignTemplateKey) => {
    const template = templates[key];
    setEditSubject(template.subject);
    setEditContent(template.content);
    setEditingTemplate(key);
  };

  const handleSave = () => {
    if (!editingTemplate) return;

    const updatedTemplates = {
      ...templates,
      [editingTemplate]: {
        ...templates[editingTemplate],
        subject: editSubject,
        content: editContent,
      },
    };

    setTemplates(updatedTemplates);
    saveTemplates(updatedTemplates);
    setEditingTemplate(null);

    toast({
      title: "Template Saved",
      description: "Your changes have been saved successfully.",
    });
  };

  const handleUse = (key: CampaignTemplateKey) => {
    if (onSelectTemplate) {
      const template = templates[key];
      onSelectTemplate({ subject: template.subject, content: template.content });
    }
  };

  // Strip HTML for preview
  const getPlainTextPreview = (html: string): string => {
    let text = html.replace(/<[^>]+>/g, ' ');
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  };

  const templateKeys = Object.keys(templates) as CampaignTemplateKey[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Campaign Templates</h2>
        <p className="text-sm text-muted-foreground">Edit these templates to use in your email campaigns</p>
      </div>

      {/* Template Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {templateKeys.map((key) => {
          const template = templates[key];
          const Icon = template.icon;
          const preview = getPlainTextPreview(template.content);

          return (
            <Card key={key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{template.label}</h3>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Subject:</span>
                    <p className="text-sm truncate">{template.subject}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Preview:</span>
                    <p className="text-sm text-muted-foreground line-clamp-2">{preview}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(key)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  {onSelectTemplate && (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleUse(key)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Use
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit {editingTemplate ? templates[editingTemplate].label : ''} Template
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                placeholder="Enter email subject..."
              />
              <p className="text-xs text-muted-foreground">
                Use {`{{client_name}}`} and {`{{company_name}}`} for personalization
              </p>
            </div>

            <div className="space-y-2">
              <Label>Email Content</Label>
              <RichTextEditor
                value={editContent}
                onChange={setEditContent}
                placeholder="Write your email content..."
                className="min-h-[300px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
