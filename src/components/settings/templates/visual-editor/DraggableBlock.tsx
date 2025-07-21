
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, X, Image, Type, FileText, PenTool } from "lucide-react";
import { useState } from 'react';

interface DraggableBlockProps {
  block: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateContent: (content: any) => void;
  onRemove: () => void;
}

export const DraggableBlock = ({ 
  block, 
  isSelected, 
  onSelect, 
  onUpdateContent, 
  onRemove 
}: DraggableBlockProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const [isEditing, setIsEditing] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'header':
        return <HeaderBlock content={block.content} onUpdate={onUpdateContent} />;
      case 'client-info':
        return <ClientInfoBlock content={block.content} onUpdate={onUpdateContent} />;
      case 'text':
        return <TextBlock content={block.content} onUpdate={onUpdateContent} isEditing={isEditing} setIsEditing={setIsEditing} />;
      case 'image':
        return <ImageBlock content={block.content} onUpdate={onUpdateContent} />;
      case 'products':
        return <ProductsBlock content={block.content} onUpdate={onUpdateContent} />;
      case 'totals':
        return <TotalsBlock content={block.content} onUpdate={onUpdateContent} />;
      case 'signature':
        return <SignatureBlock content={block.content} onUpdate={onUpdateContent} />;
      default:
        return <div>Unknown block type: {block.type}</div>;
    }
  };

  const getBlockIcon = () => {
    switch (block.type) {
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'products':
        return <FileText className="h-4 w-4" />;
      case 'signature':
        return <PenTool className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card 
        className={`relative group hover:shadow-md transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        onClick={onSelect}
      >
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {/* Block Type Indicator */}
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1">
            {getBlockIcon()}
            <span className="text-xs text-gray-500 capitalize">{block.type}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Block Content */}
        <div className="p-6 pt-8">
          {renderBlockContent()}
        </div>
      </Card>
    </div>
  );
};

// Individual Block Components
const HeaderBlock = ({ content, onUpdate }: { content: any; onUpdate: (content: any) => void }) => (
  <div className="space-y-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        {content.showLogo && (
          <div className="w-16 h-16 bg-gray-200 border-2 border-dashed flex items-center justify-center rounded">
            <Image className="h-6 w-6 text-gray-400" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-blue-600">
            {content.companyName || "{{company_name}}"}
          </h2>
          <div className="text-sm text-gray-600 space-y-1">
            <div>{content.companyAddress || "{{company_address}}"}</div>
            <div>{content.companyPhone || "{{company_phone}}"}</div>
            <div>{content.companyEmail || "{{company_email}}"}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ClientInfoBlock = ({ content, onUpdate }: { content: any; onUpdate: (content: any) => void }) => (
  <div className="bg-gray-50 p-4 rounded">
    <h3 className="font-semibold mb-2 text-blue-600">{content.title}</h3>
    <div className="text-sm space-y-1">
      {content.showClientName && <div>{'{{client_name}}'}</div>}
      {content.showClientEmail && <div>{'{{client_email}}'}</div>}
      {content.showClientAddress && <div>{'{{client_address}}'}</div>}
      {content.showClientPhone && <div>{'{{client_phone}}'}</div>}
    </div>
  </div>
);

const TextBlock = ({ 
  content, 
  onUpdate, 
  isEditing, 
  setIsEditing 
}: { 
  content: any; 
  onUpdate: (content: any) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}) => {
  if (isEditing) {
    return (
      <div className="space-y-2">
        <Textarea
          value={content.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          onBlur={() => setIsEditing(false)}
          autoFocus
          className="min-h-24"
        />
      </div>
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)}
      className={`cursor-text hover:bg-gray-50 p-2 rounded ${
        content.style === 'intro' ? 'text-lg' : 
        content.style === 'terms' ? 'text-sm text-gray-600' : 
        'text-base'
      }`}
    >
      {content.text || "Click to edit text..."}
    </div>
  );
};

const ImageBlock = ({ content, onUpdate }: { content: any; onUpdate: (content: any) => void }) => (
  <div className="text-center">
    <div className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center rounded">
      <div className="text-center">
        <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Click to add image</p>
      </div>
    </div>
  </div>
);

const ProductsBlock = ({ content, onUpdate }: { content: any; onUpdate: (content: any) => void }) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-blue-600">Quote Items</h3>
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-50">
          {content.showRoom && <th className="border border-gray-300 p-2 text-left">Room</th>}
          {content.showTreatment && <th className="border border-gray-300 p-2 text-left">Treatment</th>}
          {content.showQuantity && <th className="border border-gray-300 p-2 text-left">Qty</th>}
          {content.showUnitPrice && <th className="border border-gray-300 p-2 text-left">Unit Price</th>}
          {content.showTotal && <th className="border border-gray-300 p-2 text-left">Total</th>}
        </tr>
      </thead>
      <tbody>
        <tr>
          {content.showRoom && <td className="border border-gray-300 p-2">Living Room</td>}
          {content.showTreatment && <td className="border border-gray-300 p-2">Blackout Curtains</td>}
          {content.showQuantity && <td className="border border-gray-300 p-2">2</td>}
          {content.showUnitPrice && <td className="border border-gray-300 p-2">$150.00</td>}
          {content.showTotal && <td className="border border-gray-300 p-2">$300.00</td>}
        </tr>
        <tr>
          {content.showRoom && <td className="border border-gray-300 p-2">Bedroom</td>}
          {content.showTreatment && <td className="border border-gray-300 p-2">Roman Shades</td>}
          {content.showQuantity && <td className="border border-gray-300 p-2">3</td>}
          {content.showUnitPrice && <td className="border border-gray-300 p-2">$120.00</td>}
          {content.showTotal && <td className="border border-gray-300 p-2">$360.00</td>}
        </tr>
      </tbody>
    </table>
  </div>
);

const TotalsBlock = ({ content, onUpdate }: { content: any; onUpdate: (content: any) => void }) => (
  <div className="flex justify-end">
    <div className="w-64 space-y-2 border-t pt-4">
      {content.showSubtotal && (
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>$660.00</span>
        </div>
      )}
      {content.showTax && (
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>$52.80</span>
        </div>
      )}
      {content.showTotal && (
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total:</span>
          <span>$712.80</span>
        </div>
      )}
    </div>
  </div>
);

const SignatureBlock = ({ content, onUpdate }: { content: any; onUpdate: (content: any) => void }) => (
  <div className="grid grid-cols-2 gap-8 pt-8">
    {content.showSignature && (
      <div>
        <div className="border-b border-gray-400 mb-2 h-8"></div>
        <div className="text-sm">{content.signatureLabel}</div>
      </div>
    )}
    {content.showDate && (
      <div>
        <div className="border-b border-gray-400 mb-2 h-8"></div>
        <div className="text-sm">{content.dateLabel}</div>
      </div>
    )}
  </div>
);
