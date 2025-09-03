import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  FileText, 
  Edit3, 
  Trash2, 
  Eye,
  Copy,
  Download,
  Sparkles,
  Building2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LivePreview } from "./visual-editor/LivePreview";
import { useProjectData } from "@/hooks/useProjectData";

interface Template {
  id: string;
  name: string;
  description?: string;
  blocks: any[];
  category: string;
  is_default?: boolean;
  created_at?: string;
}

const defaultTemplates: Template[] = [
  {
    id: 'modern-quote',
    name: 'Modern Quote',
    description: 'Clean, professional quote template',
    category: 'quote',
    is_default: true,
    blocks: [
      {
        id: 'header-1',
        type: 'header',
        content: {
          showLogo: true,
          logoPosition: 'left',
          style: {
            backgroundColor: '#f8fafc',
            textColor: '#1e293b',
            padding: '24px',
            borderRadius: '8px'
          }
        }
      },
      {
        id: 'client-1',
        type: 'client-info',
        content: {
          title: 'Bill To:',
          showCompany: true,
          showClientEmail: true,
          showClientPhone: true,
          showClientAddress: true
        }
      },
      {
        id: 'products-1',
        type: 'products',
        content: {
          title: 'Quote Items',
          showDescription: true,
          showQuantity: true,
          showUnitPrice: true,
          showTotal: true
        }
      },
      {
        id: 'totals-1',
        type: 'totals',
        content: {
          showSubtotal: true,
          showTax: true,
          style: {
            backgroundColor: '#f8fafc',
            borderColor: '#e2e8f0'
          }
        }
      },
      {
        id: 'signature-1',
        type: 'signature',
        content: {
          enableDigitalSignature: false,
          signatureLabel: 'Authorized Signature',
          dateLabel: 'Date'
        }
      }
    ]
  },
  {
    id: 'simple-invoice',
    name: 'Simple Invoice',
    description: 'Basic invoice template',
    category: 'invoice',
    is_default: true,
    blocks: [
      {
        id: 'header-2',
        type: 'header',
        content: {
          showLogo: true,
          documentTitle: 'Invoice',
          style: {
            backgroundColor: '#1e40af',
            textColor: '#ffffff',
            padding: '32px'
          }
        }
      },
      {
        id: 'client-2',
        type: 'client-info',
        content: {
          title: 'Invoice To:',
          showCompany: true,
          showClientEmail: false,
          showClientPhone: false,
          showClientAddress: true
        }
      },
      {
        id: 'products-2',
        type: 'products',
        content: {
          title: 'Services',
          showDescription: true,
          showQuantity: true,
          showUnitPrice: true,
          showTotal: true
        }
      },
      {
        id: 'totals-2',
        type: 'totals',
        content: {
          showSubtotal: true,
          showTax: true
        }
      }
    ]
  }
];

export const SimpleTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('quote');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { data: projectData } = useProjectData();
  
  // Create mock project data for template preview
  const mockProjectData = {
    project: {
      quote_number: 'QT-2024-001',
      name: 'Sample Project',
      created_at: new Date().toISOString(),
      client: {
        name: 'John Smith',
        email: 'client@example.com',
        phone: '(555) 987-6543',
        address: '456 Residential Street',
        city: 'Anytown',
        state: 'ST',
        zip_code: '12345',
        company_name: 'Client Company LLC'
      }
    },
    businessSettings: {
      company_name: 'Your Company Name',
      address: '123 Business Ave, Suite 100',
      city: 'Business City',
      state: 'BC',
      zip_code: '54321',
      business_phone: '(555) 123-4567',
      business_email: 'info@company.com',
      company_logo_url: null // This will show the icon placeholder
    },
    subtotal: 1250.00,
    taxRate: 0.085,
    taxAmount: 106.25,
    total: 1356.25
  };
  
  // Use real project data if available, otherwise use mock data
  const displayProjectData = projectData || mockProjectData;

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quote_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userTemplates = data?.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        blocks: Array.isArray(template.blocks) ? template.blocks : [],
        category: template.template_style || 'quote',
        created_at: template.created_at
      })) || [];

      setTemplates([...defaultTemplates, ...userTemplates]);
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates(defaultTemplates);
      toast.error('Failed to load saved templates');
    } finally {
      setLoading(false);
    }
  };

  const createFromTemplate = async (baseTemplate: Template) => {
    if (!newTemplateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('quote_templates')
        .insert({
          name: newTemplateName,
          description: `Based on ${baseTemplate.name}`,
          blocks: baseTemplate.blocks,
          template_style: selectedCategory,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      const newTemplate: Template = {
        id: data.id,
        name: data.name,
        description: data.description,
        blocks: Array.isArray(data.blocks) ? data.blocks : [],
        category: data.template_style,
        created_at: data.created_at
      };

      setTemplates(prev => [newTemplate, ...prev]);
      setNewTemplateName('');
      setIsCreating(false);
      toast.success('Template created successfully!');
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (defaultTemplates.find(t => t.id === templateId)) {
      toast.error('Cannot delete default templates');
      return;
    }

    try {
      const { error } = await supabase
        .from('quote_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast.success('Template deleted');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const duplicateTemplate = async (template: Template) => {
    try {
      const { data, error } = await supabase
        .from('quote_templates')
        .insert({
          name: `${template.name} (Copy)`,
          description: template.description,
          blocks: template.blocks,
          template_style: template.category,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      const duplicatedTemplate: Template = {
        id: data.id,
        name: data.name,
        description: data.description,
        blocks: Array.isArray(data.blocks) ? data.blocks : [],
        category: data.template_style,
        created_at: data.created_at
      };

      setTemplates(prev => [duplicatedTemplate, ...prev]);
      toast.success('Template duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  const openEditor = (template: Template) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const saveTemplateChanges = async (updatedBlocks: any[]) => {
    if (!selectedTemplate || selectedTemplate.is_default) return;

    try {
      const { error } = await supabase
        .from('quote_templates')
        .update({
          blocks: updatedBlocks
        })
        .eq('id', selectedTemplate.id);

      if (error) throw error;

      setTemplates(prev => 
        prev.map(t => 
          t.id === selectedTemplate.id 
            ? { ...t, blocks: updatedBlocks }
            : t
        )
      );

      setSelectedTemplate(prev => prev ? { ...prev, blocks: updatedBlocks } : null);
      toast.success('Template saved!');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Document Templates</h2>
          <p className="text-muted-foreground">Create and manage your quote and invoice templates</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="quote">Quotes</SelectItem>
            <SelectItem value="invoice">Invoices</SelectItem>
            <SelectItem value="estimate">Estimates</SelectItem>
            <SelectItem value="proposal">Proposals</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Loading templates...
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No templates found
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={template.is_default ? "default" : "secondary"}>
                      {template.category}
                    </Badge>
                    {template.is_default && (
                      <Badge variant="outline" className="ml-1">
                        <Building2 className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditor(template)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {template.is_default ? 'Preview' : 'Edit'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateTemplate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {!template.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Template Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Template Name</label>
              <Input
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="My Custom Template"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quote">Quote</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="estimate">Estimate</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Start From</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {defaultTemplates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    onClick={() => createFromTemplate(template)}
                    className="h-auto p-3 text-left"
                  >
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {template.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Editor/Preview */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedTemplate?.name}
              {selectedTemplate?.is_default && (
                <Badge variant="outline">Read Only</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {selectedTemplate && (
              <LivePreview
                blocks={selectedTemplate.blocks}
                projectData={displayProjectData}
                isEditable={!selectedTemplate.is_default}
                onBlocksChange={selectedTemplate.is_default ? undefined : saveTemplateChanges}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};