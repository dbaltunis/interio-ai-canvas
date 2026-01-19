import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, Search, FileText, Send, Calendar, Users, 
  Trash2, Copy, MoreHorizontal, Star, Sparkles, Edit, Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  useGeneralEmailTemplates, 
  useDeleteGeneralEmailTemplate, 
  useDuplicateGeneralEmailTemplate,
  useCreateGeneralEmailTemplate,
  EmailTemplate 
} from "@/hooks/useGeneralEmailTemplates";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { getTemplateTypeLabel } from "@/utils/emailTemplateVariables";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailTemplateLibraryProps {
  onSelectTemplate?: (template: { subject: string; content: string }) => void;
  onCreateNew?: () => void;
  onEditTemplate?: (template: EmailTemplate) => void;
}

const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: FileText },
  { id: 'quote', label: 'Quotes', icon: FileText },
  { id: 'follow_up', label: 'Follow-ups', icon: Calendar },
  { id: 'announcement', label: 'Announcements', icon: Send },
  { id: 'welcome', label: 'Welcome', icon: Users },
];

// Helper to strip HTML and get plain text preview
const getPlainTextPreview = (html: string): string => {
  // Remove style tags and their content
  let text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // Remove script tags
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  // Replace common block elements with spaces
  text = text.replace(/<\/(p|div|h[1-6]|li|br|tr)>/gi, ' ');
  // Remove remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');
  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
};

// Check if template is a "default" system template based on type
const isDefaultTemplate = (templateType: string): boolean => {
  const defaultTypes = [
    'quote', 'booking_confirmation', 'reminder', 'thank_you', 
    'lead_initial_contact', 'welcome', 'payment_reminder'
  ];
  return defaultTypes.includes(templateType);
};

export const EmailTemplateLibrary = ({ onSelectTemplate, onCreateNew, onEditTemplate }: EmailTemplateLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  
  // AI Generation state
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiTemplateType, setAiTemplateType] = useState('outreach');
  const [aiDescription, setAiDescription] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  const { data: templates = [], isLoading } = useGeneralEmailTemplates();
  const deleteTemplate = useDeleteGeneralEmailTemplate();
  const duplicateTemplate = useDuplicateGeneralEmailTemplate();
  const createTemplate = useCreateGeneralEmailTemplate();

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = 
      template.template_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Map template types to categories
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

  const handleDuplicate = async (template: EmailTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    await duplicateTemplate.mutateAsync(template);
  };

  const handleDeleteClick = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplateToDelete(templateId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (templateToDelete) {
      await deleteTemplate.mutateAsync(templateToDelete);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const handleEdit = (template: EmailTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditTemplate) {
      onEditTemplate(template);
    }
  };

  const handleGenerateWithAI = async () => {
    setIsGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('campaign-assistant', {
        body: { 
          action: 'generate-content', 
          context: {
            campaignType: aiTemplateType,
            recipientCount: 1,
            description: aiDescription,
          }
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      const result = data.result as { subject: string; content: string };
      
      // Create the template in database
      await createTemplate.mutateAsync({
        template_type: aiTemplateType,
        subject: result.subject,
        content: result.content,
        variables: [],
        active: true,
      });

      toast.success('AI template created successfully!');
      setAiDialogOpen(false);
      setAiDescription('');
      setAiTemplateType('outreach');
    } catch (error) {
      console.error('Failed to generate AI template:', error);
      toast.error('Failed to generate template with AI');
    } finally {
      setIsGeneratingAI(false);
    }
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
            <Button 
              variant="outline" 
              size="sm" 
              className="shrink-0"
              onClick={() => setAiDialogOpen(true)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
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
          {filteredTemplates.map((template) => {
            const isDefault = isDefaultTemplate(template.template_type);
            const plainTextPreview = getPlainTextPreview(template.content);
            
            return (
              <Card 
                key={template.id} 
                className="group hover:shadow-md transition-all hover:border-primary/30 cursor-pointer"
                onClick={() => handleUseTemplate(template)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Default
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {getTemplateTypeLabel(template.template_type)}
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
                        <DropdownMenuItem 
                          onClick={(e) => handleDuplicate(template, e)}
                          disabled={duplicateTemplate.isPending}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {!isDefault && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => handleDeleteClick(template.id, e)}
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
                    {getTemplateTypeLabel(template.template_type)}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3 truncate">
                    {template.subject}
                  </p>

                  {/* Preview - clean text only */}
                  <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground line-clamp-3">
                    {plainTextPreview.slice(0, 150)}{plainTextPreview.length > 150 ? '...' : ''}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the email template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTemplate.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI Generation Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate Template with AI
            </DialogTitle>
            <DialogDescription>
              Describe the type of email you need and AI will create a template for you
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template Type</Label>
              <Select value={aiTemplateType} onValueChange={setAiTemplateType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outreach">Outreach</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="re-engagement">Re-engagement</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="quote">Quote</SelectItem>
                  <SelectItem value="thank_you">Thank You</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input 
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                placeholder="e.g., Professional follow-up for interior design services..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAiDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleGenerateWithAI}
                disabled={isGeneratingAI}
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Template
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
