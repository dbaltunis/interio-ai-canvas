
import { useState, useCallback } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Plus, Eye, EyeOff, Palette } from "lucide-react";
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

  const addNewBlock = useCallback((type: string) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContentForType(type),
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

  const handleSave = useCallback(() => {
    const templateData = {
      id: template?.id || Date.now(),
      name: templateName,
      blocks,
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSave(templateData);
    onClose();
  }, [template, templateName, blocks, onSave, onClose]);

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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Template
              </Button>
            </div>
          </div>
        </div>

        {/* Canva-style Toolbar */}
        {!showPreview && (
          <CanvaToolbar
            onToggleGrid={() => setShowGrid(!showGrid)}
            showGrid={showGrid}
            zoomLevel={zoomLevel}
            selectedTool={selectedTool}
            onToolChange={setSelectedTool}
            hasSelection={!!selectedBlockId}
            onZoomIn={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
            onZoomOut={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
            onReset={() => setZoomLevel(100)}
            onDelete={() => selectedBlockId && removeBlock(selectedBlockId)}
          />
        )}

        <div className="flex h-full overflow-hidden">
          {!showPreview ? (
            <>
              {/* Component Library Sidebar */}
              <div className="w-72 border-r bg-white">
                <ComponentLibrary onAddBlock={addNewBlock} />
              </div>

              {/* Main Canvas Area */}
              <div className="flex-1 flex flex-col bg-gray-50">
                <CanvasGrid showGrid={showGrid}>
                  <div 
                    className="min-h-[800px] bg-white shadow-lg mx-8 my-8"
                    style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
                  >
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                      modifiers={[restrictToVerticalAxis]}
                    >
                      <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                        <div className="min-h-full">
                          {blocks.map((block) => (
                            <DraggableBlock
                              key={block.id}
                              block={block}
                              isSelected={selectedBlockId === block.id}
                              onSelect={() => setSelectedBlockId(block.id)}
                              onUpdateContent={(content) => updateBlockContent(block.id, content)}
                              onRemove={() => removeBlock(block.id)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </CanvasGrid>
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
