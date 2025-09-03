import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnhancedTemplateEditor } from "./visual-editor/EnhancedTemplateEditor";
import { DocumentTypeSelector } from "./DocumentTypeSelector";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  FileText, 
  Calendar,
  Users,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";

interface QuoteTemplate {
  id: string;
  name: string;
  description: string;
  template_style: string;
  blocks: any[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}


export const SavedTemplatesManager = () => {
  const [isEnhancedEditorOpen, setIsEnhancedEditorOpen] = useState(false);
  const [isDocumentSelectorOpen, setIsDocumentSelectorOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<QuoteTemplate | null>(null);
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

  const getTemplateIcon = (style: string) => {
    switch (style) {
      case 'simple': return FileText;
      case 'detailed': return Users;
      case 'brochure': return DollarSign;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">Quote Templates</h3>
          <p className="text-gray-600 mt-1">Create and manage your quotation templates</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateTemplate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
            <p className="text-gray-500 mb-4">Create your first quote template to get started</p>
            <Button onClick={handleCreateTemplate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
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

      {/* Document Type Selector */}
      <DocumentTypeSelector
        isOpen={isDocumentSelectorOpen}
        onClose={() => setIsDocumentSelectorOpen(false)}
        onSelectTemplate={handleSelectDocumentTemplate}
      />

      {/* Enhanced Template Editor */}
      <EnhancedTemplateEditor
        isOpen={isEnhancedEditorOpen}
        onClose={() => setIsEnhancedEditorOpen(false)}
        template={selectedTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  );
};