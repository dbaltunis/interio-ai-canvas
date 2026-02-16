import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  FileText, 
  Edit3, 
  Trash2, 
  Copy,
  Star,
  GripVertical,
  MoreHorizontal,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LivePreview } from "./visual-editor/LivePreview";
import { useTemplateData } from "@/hooks/useTemplateData";
import { useQueryClient } from "@tanstack/react-query";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  description?: string;
  blocks: any[];
  category: string;
  is_default?: boolean;
  is_primary?: boolean;
  active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

// Default blank template blocks - document type specific
const getBlankTemplateBlocks = (category: string) => {
  const baseBlocks = [
    { id: 'header', type: 'document-header', content: { title: category.charAt(0).toUpperCase() + category.slice(1), showLogo: true } },
    { id: 'client', type: 'client-info', content: {} },
    { id: 'items', type: 'line-items', content: {} },
    { id: 'totals', type: 'totals', content: {} }
  ];
  
  // Add invoice-specific blocks
  if (category === 'invoice') {
    baseBlocks.push({ id: 'payment-details', type: 'payment-details', content: {} });
    baseBlocks.push({ id: 'registration', type: 'registration-footer', content: {} });
  }
  
  // Add work-order-specific blocks
  if (category === 'work-order') {
    baseBlocks.push({ id: 'installation', type: 'installation-details', content: {} });
    baseBlocks.push({ id: 'signoff', type: 'installer-signoff', content: {} });
  }
  
  // Add signature block for quotes/proposals/estimates
  if (['quote', 'proposal', 'estimate'].includes(category)) {
    baseBlocks.push({ id: 'signature', type: 'signature', content: {} });
  }

  // Curtain quote: pre-configured with images, room grouping, detailed layout
  if (category === 'curtain-quote') {
    return [
      { id: 'header', type: 'document-header', content: { title: 'Professional Curtain Quote', showLogo: true } },
      { id: 'client', type: 'client-info', content: {} },
      { id: 'items', type: 'line-items', content: { showImages: true, groupByRoom: true, layout: 'detailed', showDetailedBreakdown: true } },
      { id: 'totals', type: 'totals', content: {} },
      { id: 'signature', type: 'signature', content: {} }
    ];
  }
  
  return baseBlocks;
};

// Sortable template row component
const SortableTemplateRow = ({ 
  template, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onToggleActive, 
  onSetPrimary,
  isPrimaryLoading
}: { 
  template: Template;
  onEdit: (template: Template) => void;
  onDuplicate: (template: Template) => void;
  onDelete: (templateId: string) => void;
  onToggleActive: (templateId: string, currentActive: boolean) => void;
  onSetPrimary: (templateId: string, category: string) => void;
  isPrimaryLoading: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: template.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'quote': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'invoice': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'estimate': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'proposal': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'curtain-quote': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 bg-card border border-border rounded-lg transition-all",
        isDragging && "opacity-50 shadow-lg",
        !template.active && "opacity-60"
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded text-muted-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Primary Star */}
      <button
        onClick={() => onSetPrimary(template.id, template.category)}
        disabled={isPrimaryLoading}
        className={cn(
          "p-1 rounded transition-colors",
          template.is_primary 
            ? "text-yellow-500 hover:text-yellow-600" 
            : "text-muted-foreground/40 hover:text-yellow-500"
        )}
        title={template.is_primary ? "Primary template" : "Set as primary"}
      >
        <Star className={cn("h-4 w-4", template.is_primary && "fill-current")} />
      </button>

      {/* Template Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{template.name}</span>
          {template.is_primary && (
            <span className="text-xs text-yellow-600 dark:text-yellow-500 font-medium">Primary</span>
          )}
        </div>
        {template.updated_at && (
          <span className="text-xs text-muted-foreground">
            Updated {new Date(template.updated_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Category Badge */}
      <Badge variant="secondary" className={cn("text-xs", getCategoryColor(template.category))}>
        {template.category}
      </Badge>

      {/* Active Switch */}
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-xs font-medium",
          template.active ? "text-green-600 dark:text-green-500" : "text-muted-foreground"
        )}>
          {template.active ? 'Active' : 'Inactive'}
        </span>
        <Switch
          checked={template.active ?? false}
          onCheckedChange={() => onToggleActive(template.id, template.active ?? false)}
          className="data-[state=checked]:bg-green-600"
        />
      </div>

      {/* Edit Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(template)}
        className="h-8"
      >
        <Edit3 className="h-3.5 w-3.5 mr-1" />
        Edit
      </Button>

      {/* More Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onDuplicate(template)}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onDelete(template.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const SimpleTemplateManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: businessSettings } = useBusinessSettings();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<string>('quote');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [isPrimaryLoading, setIsPrimaryLoading] = useState(false);
  
  // For template preview - use mock data
  const { data: templateData } = useTemplateData('', false);
  
  // Project data for template preview - uses real business settings
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
      company_name: businessSettings?.company_name || 'Your Company Name',
      address: businessSettings?.address || '123 Business Street',
      city: businessSettings?.city || 'Business City',
      state: businessSettings?.state || 'ST',
      zip_code: businessSettings?.zip_code || '12345',
      business_phone: businessSettings?.business_phone || '(555) 123-4567',
      business_email: businessSettings?.business_email || 'hello@yourcompany.com',
      website: businessSettings?.website || 'www.yourcompany.com',
      company_logo_url: businessSettings?.company_logo_url || null,
      abn: businessSettings?.abn || '',
      country: businessSettings?.country || 'Australia',
      // Bank details for invoice preview
      bank_name: businessSettings?.bank_name || 'Sample Bank',
      bank_account_name: businessSettings?.bank_account_name || 'Your Company Name',
      bank_bsb: businessSettings?.bank_bsb || '123-456',
      bank_account_number: businessSettings?.bank_account_number || '12345678',
      bank_iban: businessSettings?.bank_iban || '',
      bank_swift_bic: businessSettings?.bank_swift_bic || '',
      // Registration details for invoice footer
      registration_number: businessSettings?.registration_number || 'REG-12345',
      tax_number: businessSettings?.tax_number || 'TAX-67890',
      default_payment_terms_days: businessSettings?.default_payment_terms_days || 30
    },
    // Invoice-specific preview data
    paymentStatus: 'unpaid',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    treatments: [
      {
        id: 'treatment-1',
        room_name: 'Living Room',
        treatment_name: 'Motorized Roller Blinds',
        description: 'Premium blackout fabric with Somfy motor',
        quantity: 3,
        unit_price: 450.00,
        total: 1350.00
      },
      {
        id: 'treatment-2', 
        room_name: 'Master Bedroom',
        treatment_name: 'Roman Shades',
        description: 'Custom linen blend with chain operation',
        quantity: 2,
        unit_price: 320.00,
        total: 640.00
      }
    ],
    items: [
      { id: 'item-1', description: 'Living Room - Motorized Roller Blinds (3 units)', quantity: 3, unit_price: 450.00, total: 1350.00, room: 'Living Room' },
      { id: 'item-2', description: 'Master Bedroom - Roman Shades (2 units)', quantity: 2, unit_price: 320.00, total: 640.00, room: 'Master Bedroom' }
    ],
    subtotal: 1990.00,
    taxRate: 0.10,
    taxAmount: 199.00,
    total: 2189.00,
    currency: 'AUD',
    terms: 'Payment due within 30 days.',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Installation scheduled within 2-3 weeks of order confirmation.'
  };
  
  const displayProjectData = templateData || mockProjectData;

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('quote_templates')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userTemplates: Template[] = (data || []).map(t => ({
        id: t.id,
        name: t.name,
        description: t.description || '',
        blocks: t.blocks as any[],
        category: t.template_style || 'quote',
        is_default: false,
        is_primary: t.is_primary || false,
        active: t.active || false,
        display_order: t.display_order || 0,
        created_at: t.created_at,
        updated_at: t.updated_at || t.created_at
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = templates.findIndex(t => t.id === active.id);
      const newIndex = templates.findIndex(t => t.id === over.id);

      const reordered = arrayMove(templates, oldIndex, newIndex);
      setTemplates(reordered);

      // Update display_order in database
      try {
        const updates = reordered.map((template, index) => 
          supabase
            .from('quote_templates')
            .update({ display_order: index })
            .eq('id', template.id)
        );

        await Promise.all(updates);
        queryClient.invalidateQueries({ queryKey: ['quote-templates'] });
        toast.success('Template order updated');
      } catch (error) {
        console.error('Error updating template order:', error);
        toast.error('Failed to update template order');
        loadTemplates(); // Reload on error
      }
    }
  };

  const setAsPrimary = async (templateId: string, category: string) => {
    setIsPrimaryLoading(true);
    try {
      // First, unset primary for all templates of the same category
      const { error: unsetError } = await supabase
        .from('quote_templates')
        .update({ is_primary: false })
        .eq('template_style', category);

      if (unsetError) throw unsetError;

      // Then set the selected template as primary
      const { error: setError } = await supabase
        .from('quote_templates')
        .update({ is_primary: true })
        .eq('id', templateId);

      if (setError) throw setError;

      // Update local state
      setTemplates(prev => prev.map(t => ({
        ...t,
        is_primary: t.id === templateId ? true : (t.category === category ? false : t.is_primary)
      })));

      queryClient.invalidateQueries({ queryKey: ['quote-templates'] });
      toast.success('Primary template updated');
    } catch (error) {
      console.error('Error setting primary template:', error);
      toast.error('Failed to set primary template');
    } finally {
      setIsPrimaryLoading(false);
    }
  };

  const createFromTemplate = async (baseTemplate: Template) => {
    if (!newTemplateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    if (isSubmitting) return;

    const duplicateName = templates.some(t => 
      t.name.toLowerCase() === newTemplateName.trim().toLowerCase()
    );
    
    if (duplicateName) {
      toast.error('A template with this name already exists.');
      return;
    }

    setIsSubmitting(true);
    try {
      const maxOrder = Math.max(...templates.map(t => t.display_order || 0), -1);
      
      const { data, error } = await supabase
        .from('quote_templates')
        .insert({
          name: newTemplateName.trim(),
          description: `Based on ${baseTemplate.name}`,
          blocks: baseTemplate.blocks,
          template_style: newTemplateCategory,
          display_order: maxOrder + 1,
          active: true,
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
        is_primary: data.is_primary || false,
        active: data.active || false,
        display_order: data.display_order || 0,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setTemplates(prev => [...prev, newTemplate]);
      setNewTemplateName('');
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ['quote-templates'] });
      toast.success('Template created successfully!');
    } catch (error: any) {
      console.error('Error creating template:', error);
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
    if (isDuplicating === template.id) return;
    
    setIsDuplicating(template.id);
    try {
      let copyName = `${template.name} (Copy)`;
      let copyNum = 1;
      while (templates.some(t => t.name.toLowerCase() === copyName.toLowerCase())) {
        copyNum++;
        copyName = `${template.name} (Copy ${copyNum})`;
      }

      const maxOrder = Math.max(...templates.map(t => t.display_order || 0), -1);

      const { data, error } = await supabase
        .from('quote_templates')
        .insert({
          name: copyName,
          description: template.description,
          blocks: template.blocks,
          template_style: template.category,
          display_order: maxOrder + 1,
          active: false,
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
        is_primary: false,
        active: false,
        display_order: data.display_order || 0,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setTemplates(prev => [...prev, duplicatedTemplate]);
      queryClient.invalidateQueries({ queryKey: ['quote-templates'] });
      toast.success('Template duplicated successfully!');
    } catch (error: any) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
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

    setSelectedTemplate(prev => prev ? { ...prev, blocks: updatedBlocks } : null);

    try {
      const { error } = await supabase
        .from('quote_templates')
        .update({ blocks: updatedBlocks })
        .eq('id', selectedTemplate.id);

      if (error) throw error;

      setTemplates(prev => 
        prev.map(t => 
          t.id === selectedTemplate.id 
            ? { ...t, blocks: updatedBlocks }
            : t
        )
      );
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error(`Failed to save template: ${error.message}`);
    }
  }, [selectedTemplate]);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Document Templates</h2>
          <p className="text-sm text-muted-foreground">
            Drag to reorder • Star to set primary • All document types share the same features
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          New Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="quote">Quotes</SelectItem>
            <SelectItem value="invoice">Invoices</SelectItem>
            <SelectItem value="estimate">Estimates</SelectItem>
            <SelectItem value="proposal">Proposals</SelectItem>
            <SelectItem value="curtain-quote">Curtain Quotes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates List */}
      <Card className="border-border">
        <CardContent className="p-4">
          {loading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <h3 className="font-medium mb-1">No templates found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm || filterCategory !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Create your first template to get started'}
              </p>
              {!searchTerm && filterCategory === 'all' && (
                <Button onClick={() => setIsCreating(true)} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Create Template
                </Button>
              )}
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredTemplates.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {filteredTemplates.map((template) => (
                    <SortableTemplateRow
                      key={template.id}
                      template={template}
                      onEdit={openEditor}
                      onDuplicate={duplicateTemplate}
                      onDelete={deleteTemplate}
                      onToggleActive={toggleActive}
                      onSetPrimary={setAsPrimary}
                      isPrimaryLoading={isPrimaryLoading}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Create Template Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-md">
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
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Document Type</label>
              <Select value={newTemplateCategory} onValueChange={setNewTemplateCategory}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quote">Quote</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="estimate">Estimate</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="curtain-quote">Professional Curtain Quote</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1.5">
                Each type has specific labels and features optimized for that document type.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (newTemplateName.trim()) {
                  createFromTemplate({
                    id: 'blank',
                    name: 'Blank',
                    category: newTemplateCategory,
                    blocks: getBlankTemplateBlocks(newTemplateCategory)
                  });
                }
              }}
              disabled={!newTemplateName.trim() || isSubmitting}
            >
              Create Template
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
                documentType={selectedTemplate.category}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
