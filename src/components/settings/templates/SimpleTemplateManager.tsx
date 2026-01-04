import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  FileText, 
  Edit3, 
  Trash2, 
  Copy,
  Star,
  ToggleLeft,
  ToggleRight,
  GripVertical
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
  is_primary?: boolean;
  display_order?: number;
  active?: boolean;
  created_at?: string;
}

// Default blank template blocks - use hyphenated types for consistency
const getBlankTemplateBlocks = (category: string) => [
  { id: 'header', type: 'header', content: { title: category.charAt(0).toUpperCase() + category.slice(1), showLogo: true } },
  { id: 'client', type: 'client-info', content: {} },
  { id: 'items', type: 'line-items', content: {} },
  { id: 'totals', type: 'totals', content: {} }
];

export const SimpleTemplateManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [useRealData, setUseRealData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  
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

  // Function removed - no automatic template restoration
  const restoreDefaultTemplates = async () => {
    toast.info('This feature has been disabled. Please create templates manually.');
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      // Load all templates from database, ordered by display_order then created_at
      const { data, error } = await supabase
        .from('quote_templates')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userTemplates: Template[] = (data || []).map(t => ({
        id: t.id,
        name: t.name,
        description: t.description || '',
        blocks: t.blocks as any[],
        category: t.template_style || 'quote',
        is_default: false,
        is_primary: (t as any).is_primary || false,
        display_order: (t as any).display_order || 0,
        active: t.active || false,
        created_at: t.created_at
      }));

      setTemplates(userTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates([]);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const createFromTemplate = async (baseTemplate: Template) => {
    if (!newTemplateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    // Prevent double-click submissions
    if (isSubmitting) return;

    // Check for duplicate template name
    const duplicateName = templates.some(t => 
      t.name.toLowerCase() === newTemplateName.trim().toLowerCase()
    );
    
    if (duplicateName) {
      toast.error('A template with this name already exists. Please choose a different name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('quote_templates')
        .insert({
          name: newTemplateName.trim(),
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
    } catch (error: any) {
      console.error('Error creating template:', error);
      // Handle unique constraint violation
      if (error?.code === '23505') {
        toast.error('A template with this name already exists.');
      } else {
        toast.error('Failed to create template');
      }
    } finally {
      setIsSubmitting(false);
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

  const toggleActive = async (templateId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('quote_templates')
        .update({ active: !currentActive })
        .eq('id', templateId);

      if (error) throw error;

      // Invalidate React Query cache to update QuotationTab immediately
      queryClient.invalidateQueries({ queryKey: ['quote-templates'] });
      
      setTemplates(prev => prev.map(t => 
        t.id === templateId ? { ...t, active: !currentActive } : t
      ));
      toast.success(`Template ${!currentActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling template active status:', error);
      toast.error('Failed to update template');
    }
  };


  const duplicateTemplate = async (template: Template) => {
    // Prevent double-click
    if (isDuplicating === template.id) return;
    
    setIsDuplicating(template.id);
    try {
      // Generate unique name by checking existing copies
      let copyName = `${template.name} (Copy)`;
      let copyNum = 1;
      while (templates.some(t => t.name.toLowerCase() === copyName.toLowerCase())) {
        copyNum++;
        copyName = `${template.name} (Copy ${copyNum})`;
      }

      const { data, error } = await supabase
        .from('quote_templates')
        .insert({
          name: copyName,
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
    } catch (error: any) {
      console.error('Error duplicating template:', error);
      if (error?.code === '23505') {
        toast.error('A template with this name already exists.');
      } else {
        toast.error('Failed to duplicate template');
      }
    } finally {
      setIsDuplicating(null);
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
      // Update database record
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

  // Set template as primary
  const setPrimaryTemplate = async (templateId: string) => {
    try {
      // First, unset any existing primary for same category
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      await supabase
        .from('quote_templates')
        .update({ is_primary: false })
        .eq('template_style', template.category);

      // Then set this one as primary
      const { error } = await supabase
        .from('quote_templates')
        .update({ is_primary: true })
        .eq('id', templateId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['quote-templates'] });
      
      setTemplates(prev => prev.map(t => ({
        ...t,
        is_primary: t.id === templateId ? true : (t.category === template.category ? false : t.is_primary)
      })));
      toast.success('Template set as primary');
    } catch (error) {
      console.error('Error setting primary template:', error);
      toast.error('Failed to set primary template');
    }
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-[200px] h-9"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[130px] h-9">
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
        <div className="flex items-center gap-2">
          <ProjectDataSelector
            useRealData={useRealData}
            onUseRealDataChange={setUseRealData}
            selectedProjectId={selectedProjectId}
            onProjectIdChange={setSelectedProjectId}
          />
          <Button onClick={() => setIsCreating(true)} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </div>

      {/* Warning banner if no active templates */}
      {!loading && filteredTemplates.length > 0 && filteredTemplates.every(t => !t.active) && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            ⚠️ No active templates. Activate one below to generate quotes.
          </p>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Loading templates...
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-sm">
              {searchTerm || selectedCategory !== 'all' 
                ? 'No templates match your filters' 
                : 'Create your first template to get started'}
            </p>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className={`hover:shadow-md transition-all border-border/40 ${
                template.is_primary ? 'ring-2 ring-primary/30' : ''
              }`}
            >
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm truncate">{template.name}</h3>
                      {template.is_primary && (
                        <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
                      )}
                    </div>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab shrink-0" />
                </div>
                
                {/* Status Toggle */}
                <div className={`p-2.5 rounded-md border transition-all mb-3 ${
                  template.active 
                    ? 'bg-primary/5 border-primary/20' 
                    : 'bg-muted/50 border-border'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {template.active ? 'Active' : 'Inactive'}
                    </span>
                    <Button
                      variant={template.active ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleActive(template.id, template.active ?? false)}
                      className="h-7 text-xs"
                    >
                      {template.active ? (
                        <><ToggleRight className="h-3.5 w-3.5 mr-1" /> On</>
                      ) : (
                        <><ToggleLeft className="h-3.5 w-3.5 mr-1" /> Off</>
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditor(template)}
                    className="flex-1 h-8 text-xs"
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPrimaryTemplate(template.id)}
                    className="h-8 px-2"
                    disabled={template.is_primary}
                    title="Set as primary"
                  >
                    <Star className={`h-3.5 w-3.5 ${template.is_primary ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicateTemplate(template)}
                    className="h-8 px-2"
                    title="Duplicate"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteTemplate(template.id)}
                    className="h-8 px-2 text-destructive hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Template Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-md">
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
              <label className="text-sm font-medium">Type</label>
              <Select 
                value={selectedCategory === 'all' ? 'quote' : selectedCategory} 
                onValueChange={setSelectedCategory}
              >
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (newTemplateName.trim()) {
                  const category = selectedCategory === 'all' ? 'quote' : selectedCategory;
                  createFromTemplate({
                    id: 'blank',
                    name: 'Blank',
                    category,
                    blocks: getBlankTemplateBlocks(category)
                  });
                }
              }}
              disabled={!newTemplateName.trim()}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create
            </Button>
          </DialogFooter>
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