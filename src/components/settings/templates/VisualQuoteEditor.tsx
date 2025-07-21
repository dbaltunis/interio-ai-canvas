
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
import { BlockStyleControls } from "./visual-editor/BlockStyleControls";

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
      <DialogContent className="max-w-7xl h-[95vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Visual Quote Editor
            </DialogTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowStyling(!showStyling)}
                className="flex items-center gap-2"
              >
                <Palette className="h-4 w-4" />
                Style
              </Button>
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
          
          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1">
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
                className="text-lg font-medium"
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex h-full overflow-hidden">
          {!showPreview ? (
            <>
              {/* Editor Area */}
              <div className="flex-1 overflow-auto p-6 bg-gray-50">
                <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis]}
                  >
                    <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2 p-6">
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

                  {/* Add Block Button */}
                  <div className="border-t p-4 bg-gray-50">
                    <BlockToolbar onAddBlock={addNewBlock} />
                  </div>
                </div>
              </div>

              {/* Right Sidebar for Block Settings */}
              {(selectedBlockId && showStyling) && (
                <div className="w-80 border-l bg-white overflow-auto">
                  <div className="p-4">
                    <h3 className="font-medium mb-4">Block Settings</h3>
                    {selectedBlock && (
                      <BlockStyleControls
                        block={selectedBlock}
                        onUpdate={(content) => updateBlockContent(selectedBlockId, content)}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <LivePreview blocks={blocks} templateName={templateName} />
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
    default:
      return {};
  }
}
