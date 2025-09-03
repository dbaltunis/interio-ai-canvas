import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedTemplateEditor } from "./visual-editor/EnhancedTemplateEditor";
import { DocumentTypeSelector } from "./DocumentTypeSelector";
import { SmartTemplateCreator } from "./SmartTemplateCreator";
import { ProfessionalTemplateLibrary } from "./ProfessionalTemplateLibrary";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  FileText, 
  Calendar,
  Users,
  DollarSign,
  Sparkles,
  FolderOpen
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  template_style: string;
  type?: string;
  blocks: any[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface SavedTemplatesManagerProps {
  projectId?: string;
}

export const SavedTemplatesManager: React.FC<SavedTemplatesManagerProps> = ({ projectId }) => {
  const [isEnhancedEditorOpen, setIsEnhancedEditorOpen] = useState(false);
  const [isDocumentSelectorOpen, setIsDocumentSelectorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<QuoteTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'my-templates'>('my-templates');
  const queryClient = useQueryClient();

  // Helper: keep only the first 'products' block
  const removeDuplicateProductsBlocks = (blocks: any[] = []) => {
    let seen = false;
    return (blocks || []).filter((b) => {
      if (b?.type !== 'products') return true;
      if (!seen) {
        seen = true;
        return true;
      }
      return false;
    });
  };


  // Fetch saved templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['quote-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quote_templates')
        .select('*')
        .eq('active', true)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as QuoteTemplate[];
    }
  });

  // Auto-clean templates that contain duplicate 'products' blocks
  useEffect(() => {
    const runCleanup = async () => {
      if (!templates || templates.length === 0) return;
      let changed = false;
      for (const t of templates) {
        if (!Array.isArray(t.blocks)) continue;
        const cleaned = removeDuplicateProductsBlocks(t.blocks);
        if (cleaned.length !== t.blocks.length) {
          const { error } = await supabase
            .from('quote_templates')
            .update({ blocks: cleaned })
            .eq('id', t.id);
          if (!error) changed = true;
        }
      }
      if (changed) {
        queryClient.invalidateQueries({ queryKey: ['quote-templates'] });
      }
    };
    runCleanup();
  }, [templates, queryClient]);


  // Delete template mutation
  const deleteTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('quote_templates')
        .update({ active: false })
        .eq('id', templateId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-templates'] });
    }
  });

  // Duplicate template mutation
  const duplicateTemplate = useMutation({
    mutationFn: async (template: QuoteTemplate) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('quote_templates')
        .insert([{
          name: `${template.name} (Copy)`,
          description: template.description,
          template_style: template.template_style,
          blocks: template.blocks,
          user_id: user.id
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-templates'] });
    }
  });

  const handleCreateTemplate = () => {
    setIsDocumentSelectorOpen(true);
  };

  const handleSelectDocumentTemplate = async (documentType: string, templateId: string) => {
    console.log('Creating template from:', { documentType, templateId });
    
    try {
      // Import the professional templates
      const { getTemplateByTypeAndId } = await import('./professional-templates/TemplateLibrary');
      const professionalTemplate = getTemplateByTypeAndId(documentType, templateId);
      
      if (professionalTemplate && professionalTemplate.blocks) {
        console.log('Loading professional template with', professionalTemplate.blocks.length, 'blocks');
        console.log('Template blocks:', professionalTemplate.blocks.map(b => ({ id: b.id, type: b.type })));
        
        // Create a new template with the professional template blocks
        const templateData = {
          id: null as any,
          name: `${professionalTemplate.name} - ${new Date().toLocaleDateString()}`,
          description: professionalTemplate.description || `Professional ${documentType} template`,
          template_style: 'enhanced',
          blocks: professionalTemplate.blocks,
          is_default: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('Setting selected template:', templateData);
        setSelectedTemplate(templateData);
      } else {
        console.error('Professional template not found or has no blocks:', { documentType, templateId });
        setSelectedTemplate(null);
      }
    } catch (error) {
      console.error('Error loading professional template:', error);
      setSelectedTemplate(null);
    }
    
    setIsEnhancedEditorOpen(true);
    setIsDocumentSelectorOpen(false);
  };

  const handleEditEnhancedTemplate = (template: QuoteTemplate) => {
    setSelectedTemplate(template);
    setIsEnhancedEditorOpen(true);
  };

  const handleSaveTemplate = () => {
    queryClient.invalidateQueries({ queryKey: ['quote-templates'] });
  };

  const handleTemplateCreated = (template: any) => {
    queryClient.invalidateQueries({ queryKey: ['quote-templates'] });
    setActiveTab('my-templates');
    toast.success('Template created successfully!');
  };

  const getTemplateIcon = (style: string) => {
    switch (style) {
      case 'simple': return FileText;
      case 'detailed': return Users;
      case 'brochure': return DollarSign;
      case 'luxury': return Sparkles;
      default: return FileText;
    }
  };

  const getTemplateStyleColor = (style: string) => {
    switch (style) {
      case 'simple': return 'bg-blue-100 text-blue-700';
      case 'detailed': return 'bg-green-100 text-green-700';
      case 'brochure': return 'bg-secondary/20 text-secondary-foreground';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Template Manager</h1>
        <p className="text-muted-foreground">
          Create professional quotes, invoices, and proposals with intelligent templates
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === 'browse' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('browse')}
            className="px-6"
          >
            <FileText className="mr-2 h-4 w-4" />
            Browse Templates
          </Button>
          <Button
            variant={activeTab === 'create' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('create')}
            className="px-6"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Create New
          </Button>
          <Button
            variant={activeTab === 'my-templates' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('my-templates')}
            className="px-6"
          >
            <FolderOpen className="mr-2 h-4 w-4" />
            My Templates ({templates.length})
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'browse' && (
        <ProfessionalTemplateLibrary 
          onSelectTemplate={(template) => {
            setSelectedTemplate(template);
            setIsEnhancedEditorOpen(true);
          }}
          onClose={() => {}}
        />
      )}

      {activeTab === 'create' && (
        <SmartTemplateCreator 
          onTemplateCreated={handleTemplateCreated}
          projectId={projectId}
        />
      )}

      {activeTab === 'my-templates' && (
        <div className="space-y-4">
          {templates.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Templates Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first template to get started
                </p>
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => {
                const IconComponent = getTemplateIcon(template.template_style);
                return (
                  <Card key={template.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <Badge className={`text-xs ${getTemplateStyleColor(template.template_style)}`}>
                              {template.template_style}
                            </Badge>
                          </div>
                        </div>
                        {template.is_default && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <CardDescription className="mb-4 line-clamp-2">
                        {template.description || `Template with ${template.blocks?.length || 0} blocks`}
                      </CardDescription>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          <span>{template.blocks?.length || 0} blocks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(template.updated_at), 'MMM d')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEnhancedTemplate(template)}
                          className="flex-1"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicateTemplate.mutate(template)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTemplate.mutate(template.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Template Editor */}
      <EnhancedTemplateEditor
        isOpen={isEnhancedEditorOpen}
        onClose={() => setIsEnhancedEditorOpen(false)}
        template={selectedTemplate}
        onSave={handleSaveTemplate}
        projectId={projectId}
      />
    </div>
  );
};