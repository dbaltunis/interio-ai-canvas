import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, RefreshCw, Megaphone, UserPlus } from "lucide-react";

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

const TEMPLATES: EmailTemplate[] = [
  {
    id: 'outreach-intro',
    name: 'Professional Introduction',
    category: 'outreach',
    description: 'A warm introduction to new prospects',
    subject: 'Quick question, {{client_name}}',
    content: `<p>Hi {{client_name}},</p>
<p>I came across {{company_name}} and was impressed by what you're building.</p>
<p>I'd love to explore how we might be able to help you achieve your goals. Would you be open to a quick 15-minute chat this week?</p>
<p>Looking forward to connecting!</p>
<p>Best regards</p>`
  },
  {
    id: 'outreach-value',
    name: 'Value Proposition',
    category: 'outreach',
    description: 'Lead with the value you provide',
    subject: 'An idea for {{company_name}}',
    content: `<p>Hi {{client_name}},</p>
<p>I've been working with companies similar to {{company_name}} and helped them achieve significant results.</p>
<p>I have a specific idea that could work for your team - would you be interested in hearing more?</p>
<p>Cheers</p>`
  },
  {
    id: 'followup-gentle',
    name: 'Gentle Follow-up',
    category: 'follow-up',
    description: 'A friendly nudge after initial contact',
    subject: 'Following up, {{client_name}}',
    content: `<p>Hi {{client_name}},</p>
<p>I wanted to follow up on my previous message. I understand you're busy, so I'll keep this brief.</p>
<p>Is there a better time to connect, or would you prefer I reach out in a few weeks?</p>
<p>Best</p>`
  },
  {
    id: 'followup-value-add',
    name: 'Value-Add Follow-up',
    category: 'follow-up',
    description: 'Share something valuable in your follow-up',
    subject: 'Thought you might find this useful',
    content: `<p>Hi {{client_name}},</p>
<p>I came across this article/resource that made me think of {{company_name}} and wanted to share it with you.</p>
<p>Hope you find it helpful! Happy to chat whenever works for you.</p>
<p>Best regards</p>`
  },
  {
    id: 'reengagement-missed',
    name: 'We Miss You',
    category: 're-engagement',
    description: 'Reconnect with inactive clients',
    subject: 'It\'s been a while, {{client_name}}',
    content: `<p>Hi {{client_name}},</p>
<p>It's been some time since we last connected, and I wanted to reach out to see how things are going at {{company_name}}.</p>
<p>Is there anything we can help you with? We'd love to catch up and hear about your current priorities.</p>
<p>Looking forward to reconnecting!</p>`
  },
  {
    id: 'reengagement-new',
    name: 'What\'s New',
    category: 're-engagement',
    description: 'Share updates to re-engage past clients',
    subject: 'Exciting updates from our team',
    content: `<p>Hi {{client_name}},</p>
<p>A lot has changed since we last spoke, and I wanted to share some updates that might interest you.</p>
<p>We've been working on some new features that I think could really benefit {{company_name}}.</p>
<p>Would love to show you what's new. When would be a good time for a quick call?</p>
<p>Best</p>`
  },
  {
    id: 'announcement-product',
    name: 'Product Announcement',
    category: 'announcement',
    description: 'Announce new products or features',
    subject: 'Introducing something new for {{company_name}}',
    content: `<p>Hi {{client_name}},</p>
<p>We're excited to announce a new addition that we think you'll love!</p>
<p>[Describe the new product/feature here]</p>
<p>As a valued client, we wanted to make sure you were among the first to know.</p>
<p>Let me know if you have any questions!</p>
<p>Best regards</p>`
  },
  {
    id: 'announcement-event',
    name: 'Event Invitation',
    category: 'announcement',
    description: 'Invite clients to events or webinars',
    subject: 'You\'re invited, {{client_name}}!',
    content: `<p>Hi {{client_name}},</p>
<p>We'd love for you to join us for an upcoming event!</p>
<p><strong>[Event Name]</strong></p>
<p>[Date, Time, Location/Link]</p>
<p>This is a great opportunity to [describe benefits].</p>
<p>Hope to see you there!</p>`
  },
];

const CATEGORY_ICONS = {
  'outreach': UserPlus,
  'follow-up': RefreshCw,
  're-engagement': Sparkles,
  'announcement': Megaphone,
};

const CATEGORY_COLORS = {
  'outreach': 'bg-blue-100 text-blue-700 border-blue-200',
  'follow-up': 'bg-amber-100 text-amber-700 border-amber-200',
  're-engagement': 'bg-purple-100 text-purple-700 border-purple-200',
  'announcement': 'bg-green-100 text-green-700 border-green-200',
};

export const TemplateGallery = ({
  onSelectTemplate,
  selectedCategory
}: TemplateGalleryProps) => {
  const filteredTemplates = selectedCategory 
    ? TEMPLATES.filter(t => t.category === selectedCategory)
    : TEMPLATES;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">Quick Start Templates</h4>
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

        {/* Template Cards */}
        {filteredTemplates.map((template) => {
          const Icon = CATEGORY_ICONS[template.category];
          const colorClass = CATEGORY_COLORS[template.category];
          
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
                      {template.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
