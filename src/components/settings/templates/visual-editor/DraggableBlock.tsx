
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, X, Image, Type, FileText, PenTool, CreditCard, Upload, Plus, Minus, ImageIcon } from "lucide-react";
import { useState } from 'react';
import { ImageUploadBlock } from './ImageUploadBlock';
import { SignatureCanvas } from './SignatureCanvas';
import { PaymentBlock } from './PaymentBlock';
import { ProductImageUpload } from './ProductImageUpload';

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
        return <ImageUploadBlock content={block.content} onUpdate={onUpdateContent} />;
      case 'products':
        return <ProductsBlock content={block.content} onUpdate={onUpdateContent} />;
      case 'totals':
        return <TotalsBlock content={block.content} onUpdate={onUpdateContent} />;
      case 'signature':
        return <SignatureBlock content={block.content} onUpdate={onUpdateContent} />;
      case 'payment':
        return <PaymentBlock content={block.content} onUpdate={onUpdateContent} />;
      case 'footer':
        return <FooterBlock content={block.content} onUpdate={onUpdateContent} />;
      case 'spacer':
        return <SpacerBlock content={block.content} onUpdate={onUpdateContent} />;
      case 'divider':
        return <DividerBlock content={block.content} onUpdate={onUpdateContent} />;
      default:
        return <div>Unknown block type: {block.type}</div>;
    }
  };

  const getBlockIcon = () => {
    switch (block.type) {
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'image':
        return <Upload className="h-4 w-4" />;
      case 'products':
        return <FileText className="h-4 w-4" />;
      case 'signature':
        return <PenTool className="h-4 w-4" />;
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'footer':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card 
        className={`relative group hover:shadow-md transition-all duration-200 ${
          isSelected ? 'ring-2 ring-brand-primary' : ''
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
const HeaderBlock = ({ content, onUpdate }: { content: any; onUpdate: (content: any) => void }) => {
  const [editingField, setEditingField] = useState<string | null>(null);

  const updateField = (field: string, value: string) => {
    onUpdate({ ...content, [field]: value });
    setEditingField(null);
  };

  const addCustomField = () => {
    const customFields = content.customFields || [];
    const newField = { 
      id: `custom_${Date.now()}`, 
      label: 'New Field', 
      value: '{{new_field}}' 
    };
    onUpdate({ 
      ...content, 
      customFields: [...customFields, newField] 
    });
  };

  const removeCustomField = (id: string) => {
    const customFields = content.customFields || [];
    onUpdate({
      ...content,
      customFields: customFields.filter((field: any) => field.id !== id)
    });
  };

  const updateCustomField = (id: string, key: string, value: string) => {
    const customFields = content.customFields || [];
    onUpdate({
      ...content,
      customFields: customFields.map((field: any) => 
        field.id === id ? { ...field, [key]: value } : field
      )
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Label>Logo Position:</Label>
        <Select 
          value={content.logoPosition || 'left'} 
          onValueChange={(value) => onUpdate({ ...content, logoPosition: value })}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2 ml-4">
          <Switch
            checked={content.showLogo}
            onCheckedChange={(checked) => onUpdate({ ...content, showLogo: checked })}
          />
          <Label>Show Logo</Label>
        </div>
      </div>

      <div className={`flex items-start gap-4 ${
        content.logoPosition === 'center' ? 'flex-col items-center' : 
        content.logoPosition === 'right' ? 'flex-row-reverse' : 'flex-row'
      }`}>
        {content.showLogo && (
          <div className="w-16 h-16 bg-gray-200 border-2 border-dashed flex items-center justify-center rounded flex-shrink-0">
            <Image className="h-6 w-6 text-gray-400" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          {/* Company Name */}
          <div>
            {editingField === 'companyName' ? (
              <Input
                value={content.companyName || ''}
                onChange={(e) => updateField('companyName', e.target.value)}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                autoFocus
                className="text-xl font-bold"
              />
            ) : (
              <h2 
                className="text-xl font-bold text-brand-primary cursor-pointer hover:bg-gray-50 p-1 rounded"
                onClick={() => setEditingField('companyName')}
              >
                {content.companyName || "{{company_name}}"}
              </h2>
            )}
          </div>

          {/* Company Info Fields */}
          <div className="text-sm text-gray-600 space-y-1">
            {/* Address */}
            {editingField === 'companyAddress' ? (
              <Input
                value={content.companyAddress || ''}
                onChange={(e) => updateField('companyAddress', e.target.value)}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                autoFocus
              />
            ) : (
              <div 
                className="cursor-pointer hover:bg-gray-50 p-1 rounded"
                onClick={() => setEditingField('companyAddress')}
              >
                {content.companyAddress || "{{company_address}}"}
              </div>
            )}

            {/* Phone */}
            {editingField === 'companyPhone' ? (
              <Input
                value={content.companyPhone || ''}
                onChange={(e) => updateField('companyPhone', e.target.value)}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                autoFocus
              />
            ) : (
              <div 
                className="cursor-pointer hover:bg-gray-50 p-1 rounded"
                onClick={() => setEditingField('companyPhone')}
              >
                {content.companyPhone || "{{company_phone}}"}
              </div>
            )}

            {/* Email */}
            {editingField === 'companyEmail' ? (
              <Input
                value={content.companyEmail || ''}
                onChange={(e) => updateField('companyEmail', e.target.value)}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                autoFocus
              />
            ) : (
              <div 
                className="cursor-pointer hover:bg-gray-50 p-1 rounded"
                onClick={() => setEditingField('companyEmail')}
              >
                {content.companyEmail || "{{company_email}}"}
              </div>
            )}

            {/* Custom Fields */}
            {(content.customFields || []).map((field: any) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input
                  value={field.value}
                  onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                  className="flex-1"
                  placeholder="Field value"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomField(field.id)}
                  className="h-8 w-8 p-0 text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Add Custom Field Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={addCustomField}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Field
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClientInfoBlock = ({ content, onUpdate }: { content: any; onUpdate: (content: any) => void }) => (
  <div className="bg-gray-50 p-4 rounded">
    <h3 className="font-semibold mb-2 text-brand-primary">{content.title}</h3>
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
      style={{ 
        color: content.style?.textColor || 'inherit',
        fontSize: content.style?.fontSize === 'small' ? '0.875rem' : 
                 content.style?.fontSize === 'large' ? '1.125rem' : '1rem'
      }}
    >
      {content.text || "Click to edit text..."}
    </div>
  );
};

const ProductsBlock = ({ content, onUpdate }: { content: any; onUpdate: (content: any) => void }) => {
  const isSimpleView = content.layout === 'simple';
  const isItemizedView = content.layout === 'itemized';
  const isVisualView = content.layout === 'visual';
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-brand-primary">Quote Items</h3>
        <div className="flex items-center gap-2">
          <Label className="text-sm">View:</Label>
          <Select 
            value={content.layout || 'detailed'} 
            onValueChange={(value) => onUpdate({ ...content, layout: value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 bg-background shadow-md">
              <SelectItem value="simple">Simple</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="itemized">Itemized</SelectItem>
              <SelectItem value="visual">Visual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product Images Configuration */}
      {isVisualView && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <ProductImageUpload
            productImages={content.productImages || []}
            onUpdate={(images) => onUpdate({ ...content, productImages: images })}
          />
        </div>
      )}

      {isVisualView ? (
        // Visual View with Product Images
        <div className="space-y-6">
          {(content.productImages || []).length > 0 ? (
            content.productImages.map((productImage: any, index: number) => (
              <div key={productImage.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={productImage.imageUrl}
                      alt={productImage.productName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="p-6 flex flex-col justify-center">
                    <h4 className="text-lg font-semibold text-brand-primary mb-4">
                      {productImage.productName}
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">2 panels</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Fabric:</span>
                        <span className="font-medium">Premium Blackout</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Dimensions:</span>
                        <span className="font-medium">150cm × 200cm</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Installation:</span>
                        <span className="font-medium">Included</span>
                      </div>
                      
                      <div className="border-t pt-3 mt-4">
                        <div className="flex justify-between items-center text-lg">
                          <span className="font-semibold">Total:</span>
                          <span className="font-bold text-brand-primary">
                            ${(450 + index * 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products added yet. Upload images or select from inventory above.</p>
            </div>
          )}
        </div>
      ) : isSimpleView ? (
        // Simple View
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-medium">Blackout Curtains - Living Room</span>
            <span className="font-semibold">$300.00</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="font-medium">Roman Shades - Bedroom</span>
            <span className="font-semibold">$360.00</span>
          </div>
        </div>
      ) : isItemizedView ? (
        // Itemized View (like the example image)
        <div className="space-y-6">
          {/* Room Section 1 */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-brand-primary mb-3">Dining Room</h4>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left text-sm font-medium">#</th>
                  <th className="p-2 text-left text-sm font-medium">Product/Service</th>
                  <th className="p-2 text-left text-sm font-medium">Description</th>
                  <th className="p-2 text-left text-sm font-medium">Quantity</th>
                  <th className="p-2 text-left text-sm font-medium">Price rate</th>
                  <th className="p-2 text-left text-sm font-medium">Total without GST</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 text-sm font-medium">1</td>
                  <td className="p-2 text-sm font-medium">Roman Blinds</td>
                  <td className="p-2 text-sm">Above Kitchen Sink</td>
                  <td className="p-2 text-sm">2</td>
                  <td className="p-2 text-sm">£484.54</td>
                  <td className="p-2 text-sm font-medium">£969.08</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-2 text-sm"></td>
                  <td className="p-2 text-sm">Fabric</td>
                  <td className="p-2 text-sm">OSL/01 Pepper | 1.44 m</td>
                  <td className="p-2 text-sm">7.88 m</td>
                  <td className="p-2 text-sm">£91.00</td>
                  <td className="p-2 text-sm">£717.08</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-2 text-sm"></td>
                  <td className="p-2 text-sm">Manufacturing price</td>
                  <td className="p-2 text-sm">-</td>
                  <td className="p-2 text-sm">2</td>
                  <td className="p-2 text-sm">£90.00</td>
                  <td className="p-2 text-sm">£180.00</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-2 text-sm"></td>
                  <td className="p-2 text-sm">Lining</td>
                  <td className="p-2 text-sm">Blackout</td>
                  <td className="p-2 text-sm">7.88 m</td>
                  <td className="p-2 text-sm">£10.00</td>
                  <td className="p-2 text-sm">£72.00</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-2 text-sm"></td>
                  <td className="p-2 text-sm">Heading</td>
                  <td className="p-2 text-sm">Regular Headrail</td>
                  <td className="p-2 text-sm">410 cm</td>
                  <td className="p-2 text-sm">£0.00</td>
                  <td className="p-2 text-sm">£0.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Room Section 2 */}
          <div className="border-b pb-4">
            <h4 className="font-semibold text-brand-primary mb-3">Bobby's Bedroom Window</h4>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left text-sm font-medium">#</th>
                  <th className="p-2 text-left text-sm font-medium">Product/Service</th>
                  <th className="p-2 text-left text-sm font-medium">Description</th>
                  <th className="p-2 text-left text-sm font-medium">Quantity</th>
                  <th className="p-2 text-left text-sm font-medium">Price rate</th>
                  <th className="p-2 text-left text-sm font-medium">Total without GST</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 text-sm font-medium">1</td>
                  <td className="p-2 text-sm font-medium">Curtains</td>
                  <td className="p-2 text-sm">Curtains</td>
                  <td className="p-2 text-sm">1</td>
                  <td className="p-2 text-sm">£891.67</td>
                  <td className="p-2 text-sm font-medium">£891.67</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-2 text-sm"></td>
                  <td className="p-2 text-sm">Fabric</td>
                  <td className="p-2 text-sm">Sky Gray 01 | 3 m</td>
                  <td className="p-2 text-sm">4.1 m</td>
                  <td className="p-2 text-sm">£18.70</td>
                  <td className="p-2 text-sm">£76.67</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-2 text-sm"></td>
                  <td className="p-2 text-sm">Manufacturing price</td>
                  <td className="p-2 text-sm">-</td>
                  <td className="p-2 text-sm">1</td>
                  <td className="p-2 text-sm">£774.00</td>
                  <td className="p-2 text-sm">£774.00</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-2 text-sm"></td>
                  <td className="p-2 text-sm">Lining</td>
                  <td className="p-2 text-sm">Blackout</td>
                  <td className="p-2 text-sm">4.1 m</td>
                  <td className="p-2 text-sm">£10.00</td>
                  <td className="p-2 text-sm">£41.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Detailed/Standard View
        <table className={`w-full border-collapse ${
          content.tableStyle === 'minimal' ? '' : 
          content.tableStyle === 'striped' ? '' : 'border border-gray-300'
        }`}>
          <thead>
            <tr className={`${
              content.tableStyle === 'striped' ? 'bg-gray-50' : 
              content.tableStyle === 'minimal' ? 'border-b' : 'bg-gray-50'
            }`}>
              {(content.showProduct !== false) && (
                <th className={`p-2 text-left font-semibold text-brand-primary ${
                  content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                }`}>
                  Product/Service
                </th>
              )}
              {content.showDescription && (
                <th className={`p-2 text-left font-semibold text-brand-primary ${
                  content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                }`}>
                  Description
                </th>
              )}
              {(content.showQuantity !== false) && (
                <th className={`p-2 text-left font-semibold text-brand-primary ${
                  content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                }`}>
                  Qty
                </th>
              )}
              {(content.showUnitPrice !== false) && (
                <th className={`p-2 text-left font-semibold text-brand-primary ${
                  content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                }`}>
                  Unit Price
                </th>
              )}
              {content.showTax && (
                <th className={`p-2 text-left font-semibold text-brand-primary ${
                  content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                }`}>
                  Tax/VAT
                </th>
              )}
              {(content.showTotal !== false) && (
                <th className={`p-2 text-left font-semibold text-brand-primary ${
                  content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                }`}>
                  Total
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            <tr className={content.tableStyle === 'striped' ? 'even:bg-gray-50' : ''}>
              {(content.showProduct !== false) && (
                <td className={`p-2 ${
                  content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                }`}>
                  Blackout Curtains
                </td>
              )}
              {content.showDescription && (
                <td className={`p-2 ${
                  content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                }`}>
                  High-quality blackout curtains for living room
                </td>
              )}
              {(content.showQuantity !== false) && (
                <td className={`p-2 ${
                  content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                }`}>
                  2
                </td>
              )}
              {(content.showUnitPrice !== false) && (
                <td className={`p-2 ${
                  content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                }`}>
                  $150.00
                </td>
              )}
              {content.showTax && (
                <td className={`p-2 ${
                  content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                }`}>
                  $24.00
                </td>
              )}
              {(content.showTotal !== false) && (
                <td className={`p-2 ${
                  content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                }`}>
                  $300.00
                </td>
              )}
            </tr>
            <tr className={content.tableStyle === 'striped' ? 'even:bg-gray-50' : ''}>
              {(content.showProduct !== false) && (
                <td className={`p-2 ${
                  content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                }`}>
                  Roman Shades
                </td>
              )}
              {content.showDescription && (
                <td className={`p-2 ${
                  content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                }`}>
                  Custom roman shades for bedroom windows
                </td>
              )}
              {(content.showQuantity !== false) && (
                <td className={`p-2 ${
                  content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                }`}>
                  3
                </td>
              )}
              {(content.showUnitPrice !== false) && (
                <td className={`p-2 ${
                  content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                }`}>
                  $120.00
                </td>
              )}
              {content.showTax && (
                <td className={`p-2 ${
                  content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                }`}>
                  $28.80
                </td>
              )}
              {(content.showTotal !== false) && (
                <td className={`p-2 ${
                  content.tableStyle === 'minimal' ? 'border-b' : 'border border-gray-300'
                }`}>
                  $360.00
                </td>
              )}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

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
          <span>Tax/VAT:</span>
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
  <div className="space-y-4">
    {content.enableDigitalSignature ? (
      <SignatureCanvas onSignatureSave={(dataUrl) => onUpdate({ ...content, signatureData: dataUrl })} />
    ) : (
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
    )}
    
    <div className="flex items-center space-x-2">
      <Switch
        checked={content.enableDigitalSignature || false}
        onCheckedChange={(checked) => onUpdate({ ...content, enableDigitalSignature: checked })}
      />
      <Label>Enable digital signature canvas</Label>
    </div>
  </div>
);

const FooterBlock = ({ content, onUpdate }: { content: any; onUpdate: (content: any) => void }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-brand-primary">Footer Content</h4>
        <div className="flex items-center space-x-2">
          <Switch
            checked={content.includeTerms || false}
            onCheckedChange={(checked) => onUpdate({ ...content, includeTerms: checked })}
          />
          <Label>Include T&C from Settings</Label>
        </div>
      </div>
      
      {isEditing ? (
        <Textarea
          value={content.text || ''}
          onChange={(e) => onUpdate({ ...content, text: e.target.value })}
          onBlur={() => setIsEditing(false)}
          autoFocus
          placeholder="Add footer content..."
          className="min-h-20"
        />
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className="cursor-text hover:bg-gray-50 p-2 rounded text-sm text-gray-600 min-h-20 border-2 border-dashed border-gray-200"
        >
          {content.text || "Click to add footer content..."}
        </div>
      )}

      {content.includeTerms && (
        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
          💡 Terms & Conditions from Settings will be automatically included
        </div>
      )}
    </div>
  );
};

const SpacerBlock = ({ content, onUpdate }: { content: any; onUpdate: (content: any) => void }) => (
  <div className="space-y-4">
    <h4 className="font-medium text-brand-primary">Spacer</h4>
    <div className="space-y-2">
      <Label>Height</Label>
      <Input
        type="number"
        value={parseInt(content.height?.replace('px', '') || '40')}
        onChange={(e) => onUpdate({ ...content, height: `${e.target.value}px` })}
        min={10}
        max={200}
      />
    </div>
    <div 
      className="border-2 border-dashed border-gray-300 bg-gray-50 rounded flex items-center justify-center text-sm text-gray-500"
      style={{ height: content.height || '40px' }}
    >
      Spacer ({content.height || '40px'})
    </div>
  </div>
);

const DividerBlock = ({ content, onUpdate }: { content: any; onUpdate: (content: any) => void }) => (
  <div className="space-y-4">
    <h4 className="font-medium text-brand-primary">Divider</h4>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label>Style</Label>
        <Select 
          value={content.style || 'solid'} 
          onValueChange={(value) => onUpdate({ ...content, style: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Color</Label>
        <Input
          type="color"
          value={content.color || '#e2e8f0'}
          onChange={(e) => onUpdate({ ...content, color: e.target.value })}
        />
      </div>
    </div>
    <div 
      className="w-full"
      style={{ 
        borderTop: `${content.thickness || '1px'} ${content.style || 'solid'} ${content.color || '#e2e8f0'}`,
        margin: content.margin || '20px 0'
      }}
    />
  </div>
);
