import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, Search, FileText, Send, Calendar, Users, 
  Edit, Trash2, Copy, MoreHorizontal, Star, Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGeneralEmailTemplates, useUpdateGeneralEmailTemplate } from "@/hooks/useGeneralEmailTemplates";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface EmailTemplateLibraryProps {
  onSelectTemplate?: (template: { subject: string; content: string }) => void;
  onCreateNew?: () => void;
}

const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: FileText },
  { id: 'quote', label: 'Quotes', icon: FileText },
  { id: 'follow_up', label: 'Follow-ups', icon: Calendar },
  { id: 'announcement', label: 'Announcements', icon: Send },
  { id: 'welcome', label: 'Welcome', icon: Users },
];

const DEFAULT_TEMPLATES = [
  {
    id: 'quote_sent',
    type: 'quote',
    name: 'Quote Sent',
    subject: 'Your Quote from {{company_name}}',
    content: '<p>Hi {{client_name}},</p><p>Please find attached your quote for the project we discussed.</p><p>Let me know if you have any questions!</p>',
    isDefault: true,
  },
  {
    id: 'follow_up',
    type: 'follow_up',
    name: 'Project Follow-up',
    subject: 'Following up on your project',
    content: '<p>Hi {{client_name}},</p><p>I wanted to check in and see how everything is going with your project.</p>',
    isDefault: true,
  },
  {
    id: 'welcome',
    type: 'welcome',
    name: 'Welcome New Client',
    subject: 'Welcome to {{company_name}}!',
    content: '<p>Hi {{client_name}},</p><p>Welcome aboard! We\'re excited to work with you.</p>',
    isDefault: true,
  },
];

export const EmailTemplateLibrary = ({ onSelectTemplate, onCreateNew }: EmailTemplateLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: customTemplates = [], isLoading } = useGeneralEmailTemplates();
  const { toast } = useToast();

  // Combine default and custom templates
  const allTemplates = [...DEFAULT_TEMPLATES, ...customTemplates.map(t => ({
    id: t.id,
    type: t.template_type,
    name: t.template_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    subject: t.subject,
    content: t.content,
    isDefault: false,
  }))];

  // Filter templates
  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: { subject: string; content: string }) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
      toast({
        title: "Template Applied",
        description: "The template has been loaded into the composer.",
      });
    }
  };

  const handleDuplicate = (template: typeof allTemplates[0]) => {
    toast({
      title: "Template Duplicated",
      description: `"${template.name}" has been duplicated.`,
    });
  };

  const handleDelete = (templateId: string) => {
    toast({
      title: "Template Deleted",
      description: "The template has been removed.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Email Templates</h2>
          <p className="text-sm text-muted-foreground">Reusable templates for faster email composition</p>
        </div>
        {onCreateNew && (
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        )}
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

      {/* AI Suggestion Banner */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">AI-Powered Templates</h4>
              <p className="text-xs text-muted-foreground">Let AI help you craft the perfect email for any situation</p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0">
              Generate with AI
            </Button>
          </div>
        </CardContent>
      </Card>

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
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm ? "Try a different search term" : "Create your first template to get started"}
              </p>
              {onCreateNew && (
                <Button variant="outline" onClick={onCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="group hover:shadow-md transition-all hover:border-primary/30 cursor-pointer"
              onClick={() => handleUseTemplate({ subject: template.subject, content: template.content })}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {template.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Default
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs capitalize">
                      {template.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  
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
                        handleUseTemplate({ subject: template.subject, content: template.content });
                      }}>
                        <Send className="h-4 w-4 mr-2" />
                        Use Template
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(template);
                      }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {!template.isDefault && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(template.id);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                  {template.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-3 truncate">
                  {template.subject}
                </p>

                {/* Preview */}
                <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground line-clamp-3">
                  {template.content.replace(/<[^>]*>/g, '').slice(0, 120)}...
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
