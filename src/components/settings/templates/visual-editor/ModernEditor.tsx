import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  GripVertical, 
  Type, 
  Image as ImageIcon, 
  Table, 
  Calculator, 
  PenTool, 
  User, 
  Building2,
  Palette,
  Layout,
  Zap,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";

interface ModernEditorProps {
  blocks: any[];
  onBlocksChange: (blocks: any[]) => void;
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string | null) => void;
  showPreview: boolean;
  onTogglePreview: () => void;
}

const blockTypes = [
  {
    type: 'header',
    icon: Building2,
    label: 'Header',
    description: 'Company info and quote details',
    color: 'bg-blue-500'
  },
  {
    type: 'client-info',
    icon: User,
    label: 'Client Info',
    description: 'Bill to information',
    color: 'bg-green-500'
  },
  {
    type: 'products',
    icon: Table,
    label: 'Line Items',
    description: 'Products and services table',
    color: 'bg-purple-500'
  },
  {
    type: 'totals',
    icon: Calculator,
    label: 'Totals',
    description: 'Subtotal, tax, and total',
    color: 'bg-orange-500'
  },
  {
    type: 'signature',
    icon: PenTool,
    label: 'Signature',
    description: 'Signature and date fields',
    color: 'bg-red-500'
  },
  {
    type: 'text',
    icon: Type,
    label: 'Text Block',
    description: 'Custom text content',
    color: 'bg-gray-500'
  },
  {
    type: 'image',
    icon: ImageIcon,
    label: 'Image',
    description: 'Logo or photo',
    color: 'bg-indigo-500'
  }
];

const SortableBlock = ({ block, isSelected, onSelect }: any) => {
  const blockType = blockTypes.find(bt => bt.type === block.type);
  
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-brand-primary shadow-lg' : ''
      }`}
      onClick={() => onSelect(block.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-400 hover:text-gray-600">
            <GripVertical className="h-4 w-4" />
          </div>
          
          <div className={`p-2 rounded ${blockType?.color || 'bg-gray-500'} text-white`}>
            {blockType?.icon && <blockType.icon className="h-4 w-4" />}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{blockType?.label || block.type}</h4>
              <Badge variant="outline" className="text-xs">
                {block.type}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {blockType?.description || 'Custom block'}
            </p>
          </div>
          
          {isSelected && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
              <span className="text-xs text-brand-primary font-medium">Selected</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const ModernEditor = ({ 
  blocks, 
  onBlocksChange, 
  selectedBlockId, 
  onSelectBlock,
  showPreview,
  onTogglePreview 
}: ModernEditorProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addBlock = (type: string) => {
    const newBlock = {
      id: `block_${Date.now()}`,
      type,
      content: getDefaultContentForType(type)
    };
    
    onBlocksChange([...blocks, newBlock]);
    onSelectBlock(newBlock.id);
    toast.success(`${blockTypes.find(bt => bt.type === type)?.label} block added`);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex(block => block.id === active.id);
      const newIndex = blocks.findIndex(block => block.id === over.id);
      
      onBlocksChange(arrayMove(blocks, oldIndex, newIndex));
      toast.success('Block reordered');
    }
  };

  const removeBlock = (blockId: string) => {
    onBlocksChange(blocks.filter(block => block.id !== blockId));
    if (selectedBlockId === blockId) {
      onSelectBlock(null);
    }
    toast.success('Block removed');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Modern Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-2">
          <Layout className="h-5 w-5 text-brand-primary" />
          <h3 className="font-semibold text-gray-800">Document Builder</h3>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Zap className="h-3 w-3 mr-1" />
            Smart
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={showPreview ? "default" : "outline"}
            size="sm"
            onClick={onTogglePreview}
            className="gap-2"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {!showPreview ? (
        <div className="flex-1 overflow-hidden">
          {/* Component Library */}
          <div className="p-4 border-b bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Add Components</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {blockTypes.map((blockType) => (
                <Button
                  key={blockType.type}
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock(blockType.type)}
                  className="flex items-center gap-2 h-auto p-3 flex-col"
                >
                  <div className={`p-2 rounded ${blockType.color} text-white`}>
                    <blockType.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium">{blockType.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Block List */}
          <div className="flex-1 overflow-auto p-4">
            {blocks.length === 0 ? (
              <div className="text-center py-12">
                <Layout className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400 mb-2">No blocks yet</h3>
                <p className="text-gray-500 mb-4">Add components above to start building your document</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {blocks.map((block) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        onSelect={onSelectBlock}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
            <div className="text-center py-8 text-gray-500">
              Preview content would be rendered here
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getDefaultContentForType = (type: string) => {
  const defaults = {
    'header': {
      showLogo: true,
      companyName: '{{company_name}}',
      companyAddress: '{{company_address}}',
      companyPhone: '{{company_phone}}',
      companyEmail: '{{company_email}}',
      logoPosition: 'left'
    },
    'client-info': {
      title: 'Bill To:',
      showCompany: true,
      showClientEmail: true,
      showClientPhone: true,
      showClientAddress: true
    },
    'products': {
      title: 'Quote Items',
      showDescription: true,
      showQuantity: true,
      showUnitPrice: true,
      showTotal: true
    },
    'totals': {
      showSubtotal: true,
      showTax: true,
      showTotal: true
    },
    'signature': {
      signatureLabel: 'Authorized Signature',
      dateLabel: 'Date',
      enableDigitalSignature: false
    },
    'text': {
      text: 'Enter your text here...'
    },
    'image': {
      src: '',
      alt: 'Image',
      width: 'auto'
    }
  };
  
  return defaults[type as keyof typeof defaults] || {};
};