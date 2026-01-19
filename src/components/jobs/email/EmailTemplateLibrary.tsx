import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, FileText, Send, Calendar, Users, 
  MoreHorizontal, Edit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  useGeneralEmailTemplates, 
  EmailTemplate 
} from "@/hooks/useGeneralEmailTemplates";
import { cn } from "@/lib/utils";
import { getTemplateTypeLabel } from "@/utils/emailTemplateVariables";

interface EmailTemplateLibraryProps {
  onSelectTemplate?: (template: { subject: string; content: string }) => void;
  onEditTemplate?: (template: EmailTemplate) => void;
}

const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All', icon: FileText },
  { id: 'quote', label: 'Quotes', icon: FileText },
  { id: 'follow_up', label: 'Follow-ups', icon: Calendar },
  { id: 'announcement', label: 'Announcements', icon: Send },
  { id: 'welcome', label: 'Welcome', icon: Users },
];

// Helper to strip HTML and get plain text preview
const getPlainTextPreview = (html: string): string => {
  let text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<\/(p|div|h[1-6]|li|br|tr)>/gi, ' ');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/\s+/g, ' ').trim();
  return text;
};

export const EmailTemplateLibrary = ({ onSelectTemplate, onEditTemplate }: EmailTemplateLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { data: templates = [], isLoading } = useGeneralEmailTemplates();

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.template_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const typeToCategory: Record<string, string> = {
      'quote': 'quote',
      'quote_sent': 'quote',
      'quote_approved': 'quote',
      'quote_rejected': 'quote',
      'follow_up': 'follow_up',
      'project_follow_up': 'follow_up',
      'booking_confirmation': 'announcement',
      'reminder': 'announcement',
      'welcome': 'welcome',
      'lead_initial_contact': 'welcome',
      'outreach': 'welcome',
      'follow-up': 'follow_up',
      're-engagement': 'follow_up',
      'announcement': 'announcement',
    };
    
    const templateCategory = typeToCategory[template.template_type] || 'other';
    const matchesCategory = selectedCategory === 'all' || templateCategory === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: EmailTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate({ subject: template.subject, content: template.content });
    }
  };

  const handleEdit = (template: EmailTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditTemplate) {
      onEditTemplate(template);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Email Templates</h2>
        <p className="text-sm text-muted-foreground">Reusable templates for campaigns and emails</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {TEMPLATE_CATEGORIES.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground"
                )}
              >
                <Icon className="h-3 w-3" />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Template Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                <div className="h-3 bg-muted rounded w-1/2 mb-4" />
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card className="bg-muted/20">
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No templates found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? "Try a different search term" : "No templates available"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const plainTextPreview = getPlainTextPreview(template.content);
            
            return (
              <Card 
                key={template.id} 
                className="group hover:shadow-md transition-all hover:border-primary/30 cursor-pointer"
                onClick={() => handleUseTemplate(template)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="text-xs capitalize">
                      {getTemplateTypeLabel(template.template_type)}
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleUseTemplate(template);
                        }}>
                          <Send className="h-4 w-4 mr-2" />
                          Use Template
                        </DropdownMenuItem>
                        {onEditTemplate && (
                          <DropdownMenuItem onClick={(e) => handleEdit(template, e)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                    {getTemplateTypeLabel(template.template_type)}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 truncate">
                    {template.subject}
                  </p>

                  {/* Preview */}
                  <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground line-clamp-3">
                    {plainTextPreview.slice(0, 150)}{plainTextPreview.length > 150 ? '...' : ''}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
