import { useState, useCallback } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { DocumentBlock } from "./DocumentBlock";
import { ComponentLibrary } from "./ComponentLibrary";
import { EnhancedStyleControls } from "./EnhancedStyleControls";
import { ResponsiveToolbar } from "./ResponsiveToolbar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";

interface StreamlinedEditorProps {
  blocks: any[];
  onBlocksChange: (blocks: any[]) => void;
  onSave: () => void;
  templateName: string;
}

export const StreamlinedEditor = ({
  blocks,
  onBlocksChange,
  onSave,
  templateName
}: StreamlinedEditorProps) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showLibrary, setShowLibrary] = useState(false);
  const isMobile = useIsMobile();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
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

  const addNewBlock = useCallback((type: string, customContent?: any) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type,
      content: { ...getDefaultContentForType(type), ...customContent },
      editable: true
    };
    onBlocksChange([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    if (isMobile) setShowLibrary(false);
  }, [blocks, onBlocksChange, isMobile]);

  const removeBlock = useCallback((blockId: string) => {
    onBlocksChange(blocks.filter(block => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  }, [blocks, onBlocksChange, selectedBlockId]);

  const selectedBlock = blocks.find(block => block.id === selectedBlockId);

  // Toolbar handlers
  const handleInsertImage = () => {
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
  };

  const handleFormatting = (type: string) => {
    if (!selectedBlockId || !selectedBlock) return;
    
    const currentStyle = selectedBlock.content?.style || {};
    let updates = {};
    
    switch (type) {
      case 'bold':
        updates = {
          style: { 
            ...currentStyle, 
            fontWeight: currentStyle.fontWeight === 'bold' ? 'normal' : 'bold' 
          }
        };
        break;
      case 'italic':
        updates = {
          style: { 
            ...currentStyle, 
            fontStyle: currentStyle.fontStyle === 'italic' ? 'normal' : 'italic' 
          }
        };
        break;
      case 'underline':
        updates = {
          style: { 
            ...currentStyle, 
            textDecoration: currentStyle.textDecoration === 'underline' ? 'none' : 'underline' 
          }
        };
        break;
      case 'align-left':
        updates = { style: { ...currentStyle, textAlign: 'left' } };
        break;
      case 'align-center':
        updates = { style: { ...currentStyle, textAlign: 'center' } };
        break;
      case 'align-right':
        updates = { style: { ...currentStyle, textAlign: 'right' } };
        break;
    }
    
    updateBlockContent(selectedBlockId, updates);
  };

  // Component Library for mobile
  const MobileLibrary = () => (
    <Sheet open={showLibrary} onOpenChange={setShowLibrary}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[60vh]">
        <SheetHeader>
          <SheetTitle>Add Components</SheetTitle>
        </SheetHeader>
        <div className="mt-4 h-full overflow-auto">
          <ComponentLibrary onAddBlock={addNewBlock} />
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="flex h-full bg-gray-50">
      {/* Desktop Component Library */}
      {!isMobile && !showPreview && (
        <div className="w-72 bg-white border-r flex-shrink-0">
          <ComponentLibrary onAddBlock={addNewBlock} />
        </div>
      )}

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Responsive Toolbar */}
        <ResponsiveToolbar
          hasSelection={!!selectedBlockId}
          selectedBlock={selectedBlock}
          onUpdateBlock={(updates) => selectedBlockId && updateBlockContent(selectedBlockId, updates)}
          onSave={onSave}
          onInsertImage={handleInsertImage}
          onInsertTable={() => addNewBlock('table')}
          onInsertShape={(shape) => addNewBlock('shape', { shapeType: shape })}
          onToggleBold={() => handleFormatting('bold')}
          onToggleItalic={() => handleFormatting('italic')}
          onToggleUnderline={() => handleFormatting('underline')}
          onAlignLeft={() => handleFormatting('align-left')}
          onAlignCenter={() => handleFormatting('align-center')}
          onAlignRight={() => handleFormatting('align-right')}
          onCopy={() => selectedBlock && navigator.clipboard.writeText(JSON.stringify(selectedBlock))}
          onDelete={() => selectedBlockId && removeBlock(selectedBlockId)}
          onZoomIn={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
          onZoomOut={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onTogglePreview={() => setShowPreview(!showPreview)}
          showGrid={showGrid}
          showPreview={showPreview}
          zoomLevel={zoomLevel}
        />

        {/* Document Canvas */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8 min-h-full">
            <div 
              className="bg-white mx-auto shadow-lg print:shadow-none"
              style={{ 
                transform: `scale(${zoomLevel / 100})`, 
                transformOrigin: 'top center',
                maxWidth: '8.5in',
                minHeight: '11in',
                padding: isMobile ? '0.5in' : '1in'
              }}
            >
              {!showPreview && (
                <div className="mb-4 pb-2 border-b border-gray-200">
                  <h1 className="text-lg font-semibold text-gray-900">{templateName}</h1>
                  <p className="text-sm text-gray-500">{blocks.length} blocks loaded</p>
                </div>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {blocks.map((block) => (
                      <DocumentBlock
                        key={block.id}
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        onSelect={() => setSelectedBlockId(block.id)}
                        onUpdateContent={(content) => updateBlockContent(block.id, content)}
                        onRemove={() => removeBlock(block.id)}
                        isInEditor={!showPreview}
                      />
                    ))}
                    
                    {!showPreview && blocks.length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Plus className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">Start Building Your Template</h3>
                        <p className="text-sm">Add components to get started</p>
                        {isMobile && (
                          <Button 
                            onClick={() => setShowLibrary(true)} 
                            className="mt-4"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Component
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Properties Panel */}
      {!isMobile && !showPreview && selectedBlock && (
        <div className="w-80 bg-white border-l flex-shrink-0">
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

      {/* Mobile Properties Sheet */}
      {isMobile && selectedBlock && !showPreview && (
        <Sheet open={!!selectedBlock} onOpenChange={() => setSelectedBlockId(null)}>
          <SheetContent side="bottom" className="h-[70vh]">
            <SheetHeader>
              <SheetTitle>Block Properties</SheetTitle>
            </SheetHeader>
            <div className="mt-4 h-full overflow-auto">
              <EnhancedStyleControls
                block={selectedBlock}
                onUpdate={(content) => updateBlockContent(selectedBlockId!, content)}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Mobile Component Library */}
      {isMobile && !showPreview && <MobileLibrary />}
    </div>
  );
};

function getDefaultContentForType(type: string) {
  switch (type) {
    case 'text':
      return { text: 'Enter your text here...', style: {} };
    case 'header':
      return {
        showLogo: true,
        logoPosition: 'left',
        companyName: 'Company Name',
        companyAddress: 'Company Address',
        companyPhone: 'Phone Number',
        companyEmail: 'Email Address',
        customFields: [],
        style: { primaryColor: 'hsl(var(--primary))', textColor: 'hsl(var(--foreground))' }
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
    case 'table':
      return {
        rows: 3,
        columns: 3,
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
        height: '50px',
        backgroundColor: 'hsl(var(--primary))',
        borderRadius: '4px'
      };
    case 'footer':
      return {
        text: 'Thank you for your business!',
        includeTerms: true
      };
    case 'spacer':
      return { height: '20px' };
    case 'divider':
      return { thickness: '1px', color: 'hsl(var(--border))' };
    default:
      return {};
  }
}