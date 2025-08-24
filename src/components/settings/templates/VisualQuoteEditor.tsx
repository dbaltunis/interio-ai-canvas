
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Plus, Eye, EyeOff, Palette, FileText } from "lucide-react";
import { DraggableBlock } from "./visual-editor/DraggableBlock";
import { BlockToolbar } from "./visual-editor/BlockToolbar";
import { LivePreview } from "./visual-editor/LivePreview";
import { EnhancedLivePreview } from "./visual-editor/EnhancedLivePreview";
import { BlockStyleControls } from "./visual-editor/BlockStyleControls";
import { BrochureStyleControls } from "./visual-editor/BrochureStyleControls";
import { TemplateStylesSidebar } from "./visual-editor/TemplateStylesSidebar";
import { QuoteTemplateSelector } from "./visual-editor/QuoteTemplateSelector";
import { ComponentLibrary } from "./visual-editor/ComponentLibrary";
import { CanvasGrid } from "./visual-editor/CanvasGrid";
import { CanvaToolbar } from "./visual-editor/CanvaToolbar";
import { EnhancedStyleControls } from "./visual-editor/EnhancedStyleControls";
import { TrueWYSIWYGEditor } from "./visual-editor/TrueWYSIWYGEditor";

interface VisualQuoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  template?: any;
  onSave: (template: any) => void;
}

const defaultBlocks = [
  {
    id: 'header',
    type: 'header',
    content: {
      showLogo: true,
      logoPosition: 'left',
      companyName: '{{company_name}}',
      companyAddress: '{{company_address}}',
      companyPhone: '{{company_phone}}',
      companyEmail: '{{company_email}}',
      customFields: [],
      style: { primaryColor: '#415e6b', textColor: '#575656' }
    },
    editable: true
  },
  {
    id: 'client-info',
    type: 'client-info',
    content: {
      title: 'Bill To:',
      showClientName: true,
      showClientEmail: true,
      showClientAddress: true,
      showClientPhone: true
    },
    editable: true
  },
  {
    id: 'intro-text',
    type: 'text',
    content: {
      text: 'Thank you for choosing our services. Please review the quote details below.',
      style: 'intro'
    },
    editable: true
  },
  {
    id: 'products-table',
    type: 'products',
    content: {
      layout: 'detailed',
      showProduct: true,
      showDescription: false,
      showQuantity: true,
      showUnitPrice: true,
      showTotal: true,
      showTax: false,
      tableStyle: 'bordered'
    },
    editable: true
  },
  {
    id: 'totals',
    type: 'totals',
    content: {
      showSubtotal: true,
      showTax: true,
      showTotal: true
    },
    editable: true
  },
  {
    id: 'terms',
    type: 'text',
    content: {
      text: 'Payment terms: Net 30 days. Quote valid for 30 days.',
      style: 'terms'
    },
    editable: true
  },
  {
    id: 'footer',
    type: 'footer',
    content: {
      text: 'Thank you for your business!',
      includeTerms: true
    },
    editable: true
  },
  {
    id: 'signature',
    type: 'signature',
    content: {
      showSignature: true,
      signatureLabel: 'Authorized Signature',
      showDate: true,
      dateLabel: 'Date',
      enableDigitalSignature: false
    },
    editable: true
  }
];

export const VisualQuoteEditor = ({ isOpen, onClose, template, onSave }: VisualQuoteEditorProps) => {
  const [templateName, setTemplateName] = useState(template?.name || "New Quote Template");
  const [blocks, setBlocks] = useState(template?.blocks || defaultBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showStyling, setShowStyling] = useState(false);
  const [templateStyle, setTemplateStyle] = useState<'simple' | 'detailed' | 'brochure'>('detailed');
  const [showGrid, setShowGrid] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [selectedTool, setSelectedTool] = useState<'select' | 'move' | 'text' | 'shape'>('select');
  const [useWYSIWYG, setUseWYSIWYG] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const updateBlockContent = useCallback((blockId: string, newContent: any) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, content: { ...block.content, ...newContent } }
        : block
    ));
  }, []);

  const addNewBlock = useCallback((type: string, customContent?: any) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type,
      content: { ...getDefaultContentForType(type), ...customContent },
      editable: true
    };
    setBlocks(prev => [...prev, newBlock]);
  }, []);

  const removeBlock = useCallback((blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  }, [selectedBlockId]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    setIsSaving(true);
    try {
      // Try to get session first as it's more reliable
      const { data: { session } } = await supabase.auth.getSession();
      
      let userId = null;
      if (session?.user) {
        userId = session.user.id;
      } else {
        // Fallback to getUser
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('Please log in to save templates');
        }
        userId = user.id;
      }

      const templateData = {
        name: templateName,
        description: `Template with ${blocks.length} blocks`,
        template_style: templateStyle,
        blocks,
        user_id: userId
      };

      console.log('Saving template with blocks:', blocks.length, blocks.map(b => ({ id: b.id, type: b.type })));

      if (template?.id) {
        // Update existing template
        const { error } = await supabase
          .from('quote_templates')
          .update(templateData)
          .eq('id', template.id);
        
        if (error) throw error;
        alert('Template updated successfully!');
      } else {
        // Create new template
        const { error } = await supabase
          .from('quote_templates')
          .insert([templateData]);
        
        if (error) throw error;
        alert('Template saved successfully!');
      }

      onSave(templateData);
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
      alert(`Failed to save template: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [templateName, blocks, templateStyle, template, onSave, onClose]);

  const selectedBlock = blocks.find(block => block.id === selectedBlockId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] h-[98vh] overflow-hidden p-0">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Visual Quote Editor
              </DialogTitle>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
                className="w-64 h-9"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-wrap">
              <Button
                variant={useWYSIWYG ? "default" : "outline"}
                onClick={() => setUseWYSIWYG(!useWYSIWYG)}
                className="flex items-center gap-2 text-xs sm:text-sm"
                size="sm"
                title={useWYSIWYG ? "Switch to Legacy Editor mode" : "Switch to True WYSIWYG Editor mode for better visual editing"}
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">{useWYSIWYG ? 'True WYSIWYG' : 'Legacy Editor'}</span>
                <span className="sm:hidden">{useWYSIWYG ? 'WYSIWYG' : 'Legacy'}</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 text-xs sm:text-sm"
                size="sm"
                title={showPreview ? "Switch to Edit mode" : "Switch to Preview mode to see how your template will look"}
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex items-center gap-2 text-xs sm:text-sm bg-brand-primary hover:bg-brand-accent text-white"
                size="sm"
                title="Save the current template configuration"
              >
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Template'}
              </Button>
            </div>
          </div>
        </div>

        {/* Canva-style Toolbar */}
        {!showPreview && (
          <CanvaToolbar
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
            zoomLevel={zoomLevel}
            onZoomIn={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
            onZoomOut={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
            onReset={() => setZoomLevel(100)}
            selectedTool={selectedTool}
            onToolChange={setSelectedTool}
            hasSelection={!!selectedBlockId}
            selectedBlock={selectedBlock}
            onUpdateBlock={(updates) => selectedBlockId && updateBlockContent(selectedBlockId, updates)}
            onSave={handleSave}
            onCopy={() => selectedBlock && navigator.clipboard.writeText(JSON.stringify(selectedBlock))}
            onDelete={() => selectedBlockId && removeBlock(selectedBlockId)}
            onAlignLeft={() => selectedBlockId && updateBlockContent(selectedBlockId, { 
              style: { ...selectedBlock?.content?.style, textAlign: 'left' } 
            })}
            onAlignCenter={() => selectedBlockId && updateBlockContent(selectedBlockId, { 
              style: { ...selectedBlock?.content?.style, textAlign: 'center' } 
            })}
            onAlignRight={() => selectedBlockId && updateBlockContent(selectedBlockId, { 
              style: { ...selectedBlock?.content?.style, textAlign: 'right' } 
            })}
            onInsertImage={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    addNewBlock('image', { src: event.target?.result, alt: file.name });
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
            onInsertTable={() => addNewBlock('table')}
            onInsertShape={(shape) => addNewBlock('shape', { shapeType: shape })}
            onApplyHeading={(level) => {
              if (!selectedBlockId) return;
              const fontSize = level === 1 ? '32px' : level === 2 ? '24px' : level === 3 ? '20px' : '16px';
              const fontWeight = level > 0 ? 'bold' : 'normal';
              updateBlockContent(selectedBlockId, {
                style: { 
                  ...selectedBlock?.content?.style, 
                  fontSize, 
                  fontWeight 
                }
              });
            }}
            onToggleBold={() => {
              if (!selectedBlockId) return;
              const currentWeight = selectedBlock?.content?.style?.fontWeight;
              updateBlockContent(selectedBlockId, {
                style: { 
                  ...selectedBlock?.content?.style, 
                  fontWeight: currentWeight === 'bold' ? 'normal' : 'bold' 
                }
              });
            }}
            onToggleItalic={() => {
              if (!selectedBlockId) return;
              const currentStyle = selectedBlock?.content?.style?.fontStyle;
              updateBlockContent(selectedBlockId, {
                style: { 
                  ...selectedBlock?.content?.style, 
                  fontStyle: currentStyle === 'italic' ? 'normal' : 'italic' 
                }
              });
            }}
            onToggleUnderline={() => {
              if (!selectedBlockId) return;
              const currentDecoration = selectedBlock?.content?.style?.textDecoration;
              updateBlockContent(selectedBlockId, {
                style: { 
                  ...selectedBlock?.content?.style, 
                  textDecoration: currentDecoration === 'underline' ? 'none' : 'underline' 
                }
              });
            }}
            onToggleStrikethrough={() => {
              if (!selectedBlockId) return;
              const currentDecoration = selectedBlock?.content?.style?.textDecoration;
              updateBlockContent(selectedBlockId, {
                style: { 
                  ...selectedBlock?.content?.style, 
                  textDecoration: currentDecoration === 'line-through' ? 'none' : 'line-through' 
                }
              });
            }}
          />
        )}

        <div className="flex h-full overflow-hidden">
          {useWYSIWYG ? (
            <TrueWYSIWYGEditor
              blocks={blocks}
              onBlocksChange={setBlocks}
              templateName={templateName}
              onTemplateNameChange={setTemplateName}
              selectedBlockId={selectedBlockId}
              onSelectBlock={setSelectedBlockId}
            />
          ) : !showPreview ? (
            <>
              {/* Component Library Sidebar */}
              <div className="w-72 border-r bg-white">
                <ComponentLibrary onAddBlock={addNewBlock} />
              </div>

              {/* Main Canvas Area */}
              <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
                <div className="flex-1 overflow-auto">
                  <CanvasGrid showGrid={showGrid}>
                    <div className="p-8 min-h-full">
                      <div 
                        className="bg-white shadow-xl mx-auto max-w-4xl rounded-lg border border-gray-200 overflow-hidden relative"
                        style={{ 
                          transform: `scale(${zoomLevel / 100})`, 
                          transformOrigin: 'top center',
                          minHeight: '800px'
                        }}
                      >
                        {/* Document Header with Template Name */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-700">{templateName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{blocks.length} blocks</span>
                              <span>•</span>
                              <span>{zoomLevel}% zoom</span>
                            </div>
                          </div>
                        </div>

                        {/* Document Content */}
                        <div className="p-6">
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                            modifiers={[restrictToVerticalAxis]}
                          >
                            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                              <div className="space-y-1">
                                {blocks.map((block, index) => (
                                  <div key={block.id} className="relative group">
                                    {/* Block Order Indicator */}
                                    <div className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                                        {index + 1}
                                      </div>
                                    </div>
                                    <DraggableBlock
                                      block={block}
                                      isSelected={selectedBlockId === block.id}
                                      onSelect={() => setSelectedBlockId(block.id)}
                                      onUpdateContent={(content) => updateBlockContent(block.id, content)}
                                      onRemove={() => removeBlock(block.id)}
                                    />
                                  </div>
                                ))}
                                
                                {/* Add Block Prompt */}
                                {blocks.length === 0 && (
                                  <div className="text-center py-12 text-gray-500">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                      <Plus className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium mb-2">Start Building Your Template</h3>
                                    <p className="text-sm">Add components from the library on the left to get started</p>
                                  </div>
                                )}
                              </div>
                            </SortableContext>
                          </DndContext>
                        </div>
                      </div>
                    </div>
                  </CanvasGrid>
                </div>
              </div>

              {/* Properties Panel */}
              <div className="w-80 border-l bg-white flex flex-col">
                {/* Template Styles */}
                <div className="border-b">
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Templates</h3>
                    <QuoteTemplateSelector onSelectTemplate={setBlocks} />
                  </div>
                </div>

                {/* Block Properties */}
                {selectedBlockId && (
                  <div className="flex-1 overflow-auto p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Properties</h3>
                    {selectedBlock && (
                      <EnhancedStyleControls
                        block={selectedBlock}
                        onUpdate={(content) => updateBlockContent(selectedBlockId, content)}
                      />
                    )}
                  </div>
                )}
                
                {!selectedBlockId && (
                  <div className="flex-1 overflow-auto">
                    <TemplateStylesSidebar 
                      onSelectTemplate={(selectedBlocks) => {
                        setBlocks(selectedBlocks);
                        const hasGradients = selectedBlocks.some(block => 
                          block.styles?.background?.includes('gradient') || 
                          block.content?.style?.backgroundColor?.includes('gradient')
                        );
                        const hasImages = selectedBlocks.some(block => block.type === 'image');
                        const hasPayment = selectedBlocks.some(block => block.type === 'payment');
                        
                        if (hasGradients && hasImages && hasPayment) {
                          setTemplateStyle('brochure');
                        } else if (selectedBlocks.length > 6) {
                          setTemplateStyle('detailed');
                        } else {
                          setTemplateStyle('simple');
                        }
                      }}
                      currentBlocks={blocks}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <EnhancedLivePreview 
                blocks={blocks} 
                templateStyle={templateStyle}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

function getDefaultContentForType(type: string) {
  switch (type) {
    case 'text':
      return { text: 'Enter your text here...', style: 'normal' };
    case 'image':
      return { src: '', alt: '', width: '100%', alignment: 'center' };
    case 'table':
      return { 
        rows: 3, 
        cols: 3, 
        headers: ['Column 1', 'Column 2', 'Column 3'],
        data: [
          ['Row 1, Col 1', 'Row 1, Col 2', 'Row 1, Col 3'],
          ['Row 2, Col 1', 'Row 2, Col 2', 'Row 2, Col 3']
        ]
      };
    case 'shape':
      return { 
        shapeType: 'rectangle', 
        width: '100px', 
        height: '100px', 
        fillColor: '#e2e8f0', 
        borderColor: '#64748b',
        borderWidth: '1px'
      };
    case 'products':
      return {
        layout: 'detailed',
        showProduct: true,
        showDescription: false,
        showQuantity: true,
        showUnitPrice: true,
        showTotal: true,
        showTax: false,
        tableStyle: 'bordered'
      };
    case 'signature':
      return {
        showSignature: true,
        signatureLabel: 'Authorized Signature',
        showDate: true,
        dateLabel: 'Date',
        enableDigitalSignature: false
      };
    case 'payment':
      return {
        paymentType: 'full',
        currency: '$',
        amount: '0.00',
        buttonText: 'Pay Now',
        description: 'Secure payment processing',
        showInstallments: false,
        securityText: '🔒 Secure SSL encrypted payment'
      };
    case 'footer':
      return {
        text: 'Thank you for your business!',
        includeTerms: true
      };
    case 'spacer':
      return {
        height: '40px',
        backgroundColor: 'transparent'
      };
    case 'divider':
      return {
        style: 'solid',
        color: '#e2e8f0',
        thickness: '1px',
        margin: '20px 0'
      };
    default:
      return {};
  }
}
