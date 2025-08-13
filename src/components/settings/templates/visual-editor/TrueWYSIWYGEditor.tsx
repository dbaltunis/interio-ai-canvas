import { useState, useCallback } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Plus, Settings, FileText, Printer, Download, Share2 } from "lucide-react";
import { DocumentBlock } from "./DocumentBlock";
import { ComponentLibrary } from "./ComponentLibrary";
import { EnhancedStyleControls } from "./EnhancedStyleControls";

interface TrueWYSIWYGEditorProps {
  blocks: any[];
  onBlocksChange: (blocks: any[]) => void;
  templateName: string;
  onTemplateNameChange: (name: string) => void;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
}

export const TrueWYSIWYGEditor = ({
  blocks,
  onBlocksChange,
  templateName,
  onTemplateNameChange,
  selectedBlockId,
  onSelectBlock
}: TrueWYSIWYGEditorProps) => {
  const [previewMode, setPreviewMode] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex((item) => item.id === active.id);
      const newIndex = blocks.findIndex((item) => item.id === over.id);
      onBlocksChange(arrayMove(blocks, oldIndex, newIndex));
    }
  }, [blocks, onBlocksChange]);

  const updateBlockContent = useCallback((blockId: string, newContent: any) => {
    const updatedBlocks = blocks.map(block => 
      block.id === blockId 
        ? { ...block, content: { ...block.content, ...newContent } }
        : block
    );
    onBlocksChange(updatedBlocks);
  }, [blocks, onBlocksChange]);

  const addNewBlock = useCallback((type: string) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContentForType(type),
      editable: true
    };
    onBlocksChange([...blocks, newBlock]);
  }, [blocks, onBlocksChange]);

  const removeBlock = useCallback((blockId: string) => {
    onBlocksChange(blocks.filter(block => block.id !== blockId));
    if (selectedBlockId === blockId) {
      onSelectBlock(null);
    }
  }, [blocks, onBlocksChange, selectedBlockId, onSelectBlock]);

  const selectedBlock = blocks.find(block => block.id === selectedBlockId);

  // Document preview/print controls
  const renderDocumentControls = () => (
    <div className="flex items-center gap-2 mb-4 p-3 bg-white border rounded-lg shadow-sm">
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.print()}
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        Print
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>
      
      <div className="ml-auto flex items-center gap-2">
        <Label className="text-sm">Preview Mode</Label>
        <Switch
          checked={previewMode}
          onCheckedChange={setPreviewMode}
        />
      </div>
    </div>
  );

  return (
    <div className="flex h-full">
      {/* Component Library - only visible in edit mode */}
      {!previewMode && (
        <div className="w-72 border-r bg-white flex-shrink-0">
          <ComponentLibrary onAddBlock={addNewBlock} />
        </div>
      )}

      {/* Main Document Area */}
      <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        {/* Document Controls */}
        <div className="p-4 border-b bg-white">
          {renderDocumentControls()}
        </div>

        {/* Document Canvas */}
        <div className="flex-1 overflow-auto">
          <div className="p-8 min-h-full">
            {/* Document Surface - exactly as it will appear in final output */}
            <div 
              className="bg-white mx-auto max-w-4xl min-h-[11in] shadow-lg print:shadow-none print:max-w-none"
              style={{ 
                transform: `scale(${zoomLevel / 100})`, 
                transformOrigin: 'top center',
                width: '8.5in', // Standard letter size
                minHeight: '11in',
                padding: '1in' // Standard margins
              }}
            >
              {/* Pure Document Content */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-6">
                    {blocks.map((block) => (
                      <DocumentBlock
                        key={block.id}
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        onSelect={() => onSelectBlock(block.id)}
                        onUpdateContent={(content) => updateBlockContent(block.id, content)}
                        onRemove={() => removeBlock(block.id)}
                        isInEditor={!previewMode}
                      />
                    ))}
                    
                    {/* Add Block Prompt - only in edit mode */}
                    {!previewMode && blocks.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Plus className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Start Building Your Document</h3>
                        <p className="text-sm">Add components from the library to get started</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Panel - only visible in edit mode when block is selected */}
      {!previewMode && selectedBlock && (
        <div className="w-80 border-l bg-white flex-shrink-0">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Block Properties
            </h3>
            <EnhancedStyleControls
              block={selectedBlock}
              onUpdate={(content) => updateBlockContent(selectedBlockId!, content)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

function getDefaultContentForType(type: string) {
  switch (type) {
    case 'text':
      return { text: 'Enter your text here...', style: 'normal' };
    case 'header':
      return {
        showLogo: true,
        logoPosition: 'left',
        companyName: 'Company Name',
        companyAddress: 'Company Address',
        companyPhone: 'Phone Number',
        companyEmail: 'Email Address',
        customFields: [],
        style: { primaryColor: '#415e6b', textColor: '#575656' }
      };
    case 'client-info':
      return {
        title: 'Bill To:',
        showClientName: true,
        showClientEmail: true,
        showClientAddress: true,
        showClientPhone: true
      };
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
    case 'totals':
      return {
        showSubtotal: true,
        showTax: true,
        showTotal: true
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
      return { height: '20px' };
    case 'divider':
      return { thickness: '1px', color: '#d1d5db' };
    default:
      return {};
  }
}