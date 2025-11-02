import React, { useState, useEffect, useCallback } from 'react';
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
import { useTemplateData } from "@/hooks/useTemplateData";
import { ProjectDataSelector } from "./ProjectDataSelector";
import { useQueryClient } from "@tanstack/react-query";

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
    description: 'Clean, professional quote template with dynamic data support',
    category: 'quote',
    is_default: false, // Make it editable
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
  const queryClient = useQueryClient();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('quote');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [useRealData, setUseRealData] = useState(false);
  
  const { data: templateData } = useTemplateData(selectedProjectId, useRealData);
  
  // Create mock project data for template preview with comprehensive real data simulation
  const mockProjectData = {
    project: {
      id: 'sample-project-id',
      quote_number: 'QT-2024-001',
      job_number: 'JOB-2024-001',
      name: 'Living Room & Bedroom Window Treatments',
      created_at: new Date().toISOString(),
      status: 'quoted',
      client: {
        id: 'sample-client-id',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '(555) 987-6543',
        address: '456 Residential Street',
        city: 'Anytown',
        state: 'ST',
        zip_code: '12345',
        company_name: 'Smith Family Residence',
        country: 'United States'
      }
    },
    businessSettings: {
      company_name: 'Premium Window Treatments Co.',
      address: '123 Business Ave, Suite 100',
      city: 'Business City',
      state: 'BC',
      zip_code: '54321',
      business_phone: '(555) 123-4567',
      business_email: 'info@premiumwindowtreatments.com',
      website: 'www.premiumwindowtreatments.com',
      company_logo_url: null, // This will show the building icon placeholder
      abn: 'ABN 12 345 678 901',
      country: 'Australia'
    },
    treatments: [
      {
        id: 'treatment-1',
        room_name: 'Living Room',
        treatment_name: 'Motorized Roller Blinds',
        description: 'Premium blackout fabric with Somfy motor',
        quantity: 3,
        unit_price: 450.00,
        total: 1350.00,
        fabric_type: 'Blackout',
        color: 'Charcoal Grey',
        width: '1200mm',
        drop: '1800mm'
      },
      {
        id: 'treatment-2', 
        room_name: 'Master Bedroom',
        treatment_name: 'Roman Shades',
        description: 'Custom linen blend with chain operation',
        quantity: 2,
        unit_price: 320.00,
        total: 640.00,
        fabric_type: 'Linen Blend',
        color: 'Natural Beige',
        width: '900mm',
        drop: '1600mm'
      },
      {
        id: 'treatment-3',
        room_name: 'Kitchen',
        treatment_name: 'Venetian Blinds',
        description: '25mm aluminum slats with cord control',
        quantity: 2,
        unit_price: 180.00,
        total: 360.00,
        fabric_type: 'Aluminum',
        color: 'White',
        width: '600mm',
        drop: '1200mm'
      }
    ],
    items: [
      { id: 'item-1', description: 'Living Room - Motorized Roller Blinds (3 units)', quantity: 3, unit_price: 450.00, total: 1350.00, room: 'Living Room' },
      { id: 'item-2', description: 'Master Bedroom - Roman Shades (2 units)', quantity: 2, unit_price: 320.00, total: 640.00, room: 'Master Bedroom' },
      { id: 'item-3', description: 'Kitchen - Venetian Blinds (2 units)', quantity: 2, unit_price: 180.00, total: 360.00, room: 'Kitchen' }
    ],
    subtotal: 2350.00,
    taxRate: 0.10,
    taxAmount: 235.00,
    total: 2585.00,
    currency: 'AUD',
    terms: 'Payment due within 30 days. 50% deposit required upon acceptance.',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Installation scheduled within 2-3 weeks of order confirmation. Includes 5-year warranty on all motorized components.'
  };
  
  // Use template data for consistent preview experience
  const displayProjectData = templateData || mockProjectData;

  useEffect(() => {
    loadTemplates();
  }, []);

  const initializeDefaultTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if default templates already exist for this user
      const { data: existingTemplates } = await supabase
        .from('quote_templates')
        .select('id, name')
        .eq('user_id', user.id);

      const existingNames = existingTemplates?.map(t => t.name) || [];

      // Insert missing default templates
      for (const defaultTemplate of defaultTemplates) {
        if (!existingNames.includes(defaultTemplate.name)) {
          await supabase
            .from('quote_templates')
            .insert({
              name: defaultTemplate.name,
              description: defaultTemplate.description,
              blocks: defaultTemplate.blocks,
              template_style: defaultTemplate.category,
              user_id: user.id
            });
        }
      }
    } catch (error) {
      console.error('Error initializing default templates:', error);
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      // First, ensure default templates exist in database
      await initializeDefaultTemplates();

      // Then load all templates from database
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
        created_at: template.created_at,
        is_default: false // All templates from database are user-editable/deletable
      })) || [];

      setTemplates(userTemplates);
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
    try {
      const { error } = await supabase
        .from('quote_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      // Invalidate React Query cache to update QuotationTab immediately
      queryClient.invalidateQueries({ queryKey: ['quote-templates'] });
      
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

  const saveTemplateChanges = useCallback(async (updatedBlocks: any[]) => {
    if (!selectedTemplate) return;

    console.log('saveTemplateChanges called with blocks:', updatedBlocks);

    // Update local state immediately for responsive UI (without scroll disruption)
    setSelectedTemplate(prev => prev ? { ...prev, blocks: updatedBlocks } : null);

    try {
      // Check if this is a database record or a hardcoded template
      const isHardcodedTemplate = defaultTemplates.some(dt => dt.id === selectedTemplate.id);
      
      if (isHardcodedTemplate) {
        // For hardcoded templates, create a new database record
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('quote_templates')
          .insert({
            name: selectedTemplate.name,
            description: selectedTemplate.description,
            blocks: updatedBlocks,
            template_style: selectedTemplate.category,
            user_id: user.id
          })
          .select()
          .single();

        if (error) throw error;

        // Update local state with new database record
        const newTemplate: Template = {
          id: data.id,
          name: data.name,
          description: data.description,
          blocks: updatedBlocks,
          category: data.template_style,
          created_at: data.created_at,
          is_default: true
        };

        setTemplates(prev => 
          prev.map(t => 
            t.id === selectedTemplate.id 
              ? newTemplate
              : t
          )
        );
        setSelectedTemplate(newTemplate);
      } else {
        // For existing database records, update normally
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
      }

      console.log('Template saved successfully');
      // Only show toast for manual saves, not auto-saves
      // toast.success('Template saved!');
    } catch (error) {
      console.error('Error saving template:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast.error(`Failed to save template: ${error.message}`);
    }
  }, [selectedTemplate]);

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
          <p className="text-muted-foreground">Create and manage fully dynamic quote and invoice templates</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Project Data Selector */}
      <ProjectDataSelector
        useRealData={useRealData}
        onUseRealDataChange={setUseRealData}
        selectedProjectId={selectedProjectId}
        onProjectIdChange={setSelectedProjectId}
      />

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
                    {template.id === 'modern-quote' && (
                      <Badge variant="outline" className="ml-1">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Dynamic
                      </Badge>
                    )}
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
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateTemplate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteTemplate(template.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {selectedTemplate && (
              <LivePreview
                blocks={selectedTemplate.blocks}
                projectData={displayProjectData}
                isEditable={true}
                onBlocksChange={saveTemplateChanges}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};