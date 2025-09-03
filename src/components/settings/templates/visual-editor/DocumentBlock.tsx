import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GripVertical, X, Settings, Copy, Trash2 } from "lucide-react";
import { ImageUploadBlock } from './ImageUploadBlock';
import { SignatureCanvas } from './SignatureCanvas';
import { PaymentBlock } from './PaymentBlock';
import { EnhancedProductDisplay } from './EnhancedProductDisplay';
import { AdvancedSignatureSystem } from './AdvancedSignatureSystem';
import { DynamicContentBlock } from './DynamicContentBlocks';

interface DocumentBlockProps {
  block: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateContent: (content: any) => void;
  onRemove: () => void;
  isInEditor: boolean;
}

export const DocumentBlock = ({ 
  block, 
  isSelected, 
  onSelect, 
  onUpdateContent, 
  onRemove,
  isInEditor 
}: DocumentBlockProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const [isEditing, setIsEditing] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderPureContent = () => {
    switch (block.type) {
      case 'header':
        return <HeaderContent content={block.content} onUpdate={onUpdateContent} isEditing={isEditing} setIsEditing={setIsEditing} />;
      case 'client-info':
      case 'client':
        return <ClientInfoContent content={block.content} onUpdate={onUpdateContent} isEditing={isEditing} setIsEditing={setIsEditing} />;
      case 'text':
        return <TextContent content={block.content} onUpdate={onUpdateContent} isEditing={isEditing} setIsEditing={setIsEditing} />;
      case 'image':
        return <ImageUploadBlock content={block.content} onUpdate={onUpdateContent} />;
      case 'products':
        return <ProductsContent content={block.content} onUpdate={onUpdateContent} isEditing={isEditing} setIsEditing={setIsEditing} />;
      case 'product-showcase':
        return <EnhancedProductDisplay content={block.content} onUpdate={onUpdateContent} isEditable={isEditing} />;
      case 'totals':
        return <TotalsContent content={block.content} onUpdate={onUpdateContent} isEditing={isEditing} setIsEditing={setIsEditing} />;
      case 'signature':
        return <SignatureContent content={block.content} onUpdate={onUpdateContent} isEditing={isEditing} setIsEditing={setIsEditing} />;
      case 'advanced-signature':
        return <AdvancedSignatureSystem content={block.content} onUpdate={onUpdateContent} isEditable={isEditing} />;
      case 'payment':
        return <PaymentBlock content={block.content} onUpdate={onUpdateContent} />;
      case 'footer':
        return <FooterContent content={block.content} onUpdate={onUpdateContent} isEditing={isEditing} setIsEditing={setIsEditing} />;
      case 'spacer':
        return <SpacerContent content={block.content} onUpdate={onUpdateContent} />;
      case 'divider':
        return <DividerContent content={block.content} onUpdate={onUpdateContent} />;
      case 'qr-code':
        return <DynamicContentBlock type="qr-code" content={block.content} onUpdate={onUpdateContent} isEditable={isEditing} />;
      case 'auto-calculation':
        return <DynamicContentBlock type="auto-calculation" content={block.content} onUpdate={onUpdateContent} isEditable={isEditing} />;
      case 'conditional-content':
        return <DynamicContentBlock type="conditional-content" content={block.content} onUpdate={onUpdateContent} isEditable={isEditing} />;
      case 'progress-tracker':
        return <DynamicContentBlock type="progress-tracker" content={block.content} onUpdate={onUpdateContent} isEditable={isEditing} />;
      case 'interactive-cta':
        return <DynamicContentBlock type="interactive-cta" content={block.content} onUpdate={onUpdateContent} isEditable={isEditing} />;
      default:
        return <div>Unknown block type: {block.type}</div>;
    }
  };

  const getContentStyles = () => {
    const style = block.content?.style || {};
    const dynamicStyles: React.CSSProperties = {};

    // Apply all styling exactly as it will appear in the final document
    if (style.borderStyle && style.borderStyle !== 'none') {
      dynamicStyles.borderStyle = style.borderStyle;
      dynamicStyles.borderWidth = style.borderWidth || '1px';
      dynamicStyles.borderColor = style.borderColor || '#e2e8f0';
    }

    if (style.backgroundColor) dynamicStyles.backgroundColor = style.backgroundColor;
    if (style.color) dynamicStyles.color = style.color;
    if (style.fontSize) dynamicStyles.fontSize = style.fontSize;
    if (style.fontFamily) dynamicStyles.fontFamily = style.fontFamily;
    if (style.fontWeight) dynamicStyles.fontWeight = style.fontWeight;
    if (style.fontStyle) dynamicStyles.fontStyle = style.fontStyle;
    if (style.textAlign) dynamicStyles.textAlign = style.textAlign as any;
    if (style.textDecoration) dynamicStyles.textDecoration = style.textDecoration;
    if (style.padding) dynamicStyles.padding = style.padding;
    if (style.borderRadius) dynamicStyles.borderRadius = style.borderRadius;
    if (style.boxShadow) dynamicStyles.boxShadow = style.boxShadow;
    if (style.opacity) dynamicStyles.opacity = style.opacity;
    if (style.transform) dynamicStyles.transform = style.transform;

    return dynamicStyles;
  };

  // Hover controls overlay - only visible when hovering in editor mode
  const renderEditorControls = () => {
    if (!isInEditor || (!isSelected && !showControls)) return null;
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Selection indicator - thin blue outline */}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-blue-500 rounded pointer-events-none" />
        )}
        
        {/* Control buttons - positioned at top-right */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
          <Button
            variant="secondary"
            size="sm"
            {...attributes}
            {...listeners}
            className="h-6 w-6 p-0 cursor-move"
            title="Drag to reorder"
          >
            <GripVertical className="h-3 w-3" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="h-6 w-6 p-0"
            title="Edit content"
          >
            <Settings className="h-3 w-3" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onRemove}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            title="Delete block"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={`relative group ${isInEditor ? 'hover:bg-blue-50/20' : ''}`}
      onClick={isInEditor ? onSelect : undefined}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Pure document content - no UI wrapper */}
      <div style={getContentStyles()}>
        {renderPureContent()}
      </div>
      
      {/* Editor controls overlay */}
      {renderEditorControls()}
    </div>
  );
};

// Pure content components that render exactly as they will appear in the final document
const HeaderContent = ({ content, onUpdate, isEditing, setIsEditing }: any) => {
  const [editingField, setEditingField] = useState<string | null>(null);

  const updateField = (field: string, value: string) => {
    onUpdate({ ...content, [field]: value });
    setEditingField(null);
  };

  // Ensure content has default values
  const safeContent = {
    showLogo: true,
    logoPosition: 'left',
    companyName: 'Your Company Name',
    companyAddress: '123 Business Street, City, State 12345',
    companyPhone: '(555) 123-4567',
    companyEmail: 'contact@company.com',
    style: { primaryColor: '#1e40af', textColor: '#ffffff' },
    ...content
  };

  return (
    <div 
      className="p-6 rounded-lg shadow-sm"
      style={{ 
        backgroundColor: safeContent.style?.backgroundColor || '#1e293b',
        color: safeContent.style?.textColor || '#ffffff'
      }}
    >
      <div className={`flex items-start gap-4 ${
        safeContent.logoPosition === 'center' ? 'flex-col items-center' : 
        safeContent.logoPosition === 'right' ? 'flex-row-reverse' : 'flex-row'
      }`}>
        {safeContent.showLogo && (
          <div className="w-16 h-16 bg-white/20 flex items-center justify-center rounded flex-shrink-0">
            <span className="text-xs text-white/80">LOGO</span>
          </div>
        )}
        <div className="flex-1 space-y-2">
          {editingField === 'companyName' && isEditing ? (
            <Input
              value={safeContent.companyName || ''}
              onChange={(e) => updateField('companyName', e.target.value)}
              onBlur={() => setEditingField(null)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
              autoFocus
              className="text-xl font-bold border-none p-0 focus:ring-0 bg-transparent text-white"
            />
          ) : (
            <h2 
              className={`text-2xl font-bold ${isEditing ? 'cursor-pointer hover:bg-white/10 rounded px-2 py-1' : ''}`}
              onClick={() => isEditing && setEditingField('companyName')}
              style={{ color: safeContent.style?.primaryColor || '#ffffff' }}
            >
              {safeContent.companyName}
            </h2>
          )}

          <div className="text-sm space-y-1 opacity-90">
            {editingField === 'companyAddress' && isEditing ? (
              <Input
                value={safeContent.companyAddress || ''}
                onChange={(e) => updateField('companyAddress', e.target.value)}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                autoFocus
                className="border-none p-0 focus:ring-0 bg-transparent text-white"
              />
            ) : (
              <div 
                className={`${isEditing ? 'cursor-pointer hover:bg-white/10 rounded px-2 py-1' : ''}`}
                onClick={() => isEditing && setEditingField('companyAddress')}
              >
                {safeContent.companyAddress}
              </div>
            )}

            {editingField === 'companyPhone' && isEditing ? (
              <Input
                value={safeContent.companyPhone || ''}
                onChange={(e) => updateField('companyPhone', e.target.value)}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                autoFocus
                className="border-none p-0 focus:ring-0 bg-transparent text-white"
              />
            ) : (
              <div 
                className={`${isEditing ? 'cursor-pointer hover:bg-white/10 rounded px-2 py-1' : ''}`}
                onClick={() => isEditing && setEditingField('companyPhone')}
              >
                {safeContent.companyPhone}
              </div>
            )}

            {editingField === 'companyEmail' && isEditing ? (
              <Input
                value={safeContent.companyEmail || ''}
                onChange={(e) => updateField('companyEmail', e.target.value)}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                autoFocus
                className="border-none p-0 focus:ring-0 bg-transparent text-white"
              />
            ) : (
              <div 
                className={`${isEditing ? 'cursor-pointer hover:bg-white/10 rounded px-2 py-1' : ''}`}
                onClick={() => isEditing && setEditingField('companyEmail')}
              >
                {safeContent.companyEmail}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ClientInfoContent = ({ content, onUpdate, isEditing, setIsEditing }: any) => {
  const safeContent = {
    title: 'Bill To:',
    showClientName: true,
    showClientEmail: true,
    showClientAddress: true,
    showClientPhone: true,
    ...content
  };

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded border">
      <h3 className="font-semibold text-gray-900 text-lg">{safeContent.title}</h3>
      <div className="text-sm text-gray-700 space-y-2">
        {safeContent.showClientName && <div className="font-medium">John Doe</div>}
        {safeContent.showClientEmail && <div>john.doe@email.com</div>}
        {safeContent.showClientAddress && <div>456 Client Avenue<br />Client City, State 67890</div>}
        {safeContent.showClientPhone && <div>(555) 987-6543</div>}
      </div>
    </div>
  );
};

const TextContent = ({ content, onUpdate, isEditing, setIsEditing }: any) => {
  if (isEditing) {
    return (
      <Textarea
        value={content.text || ''}
        onChange={(e) => onUpdate({ ...content, text: e.target.value })}
        onBlur={() => setIsEditing(false)}
        className="border-none p-0 focus:ring-0 resize-none"
        autoFocus
      />
    );
  }

  return (
    <div 
      className={`${isEditing ? 'cursor-pointer hover:bg-yellow-100' : ''}`}
      onClick={() => setIsEditing(true)}
    >
      {content.text || 'Click to edit text'}
    </div>
  );
};

const ProductsContent = ({ content, onUpdate, isEditing, setIsEditing }: any) => {
  const safeContent = {
    title: 'Quote Items',
    layout: 'detailed',
    showProduct: true,
    showDescription: true,
    showQuantity: true,
    showUnitPrice: true,
    showTotal: true,
    tableStyle: 'modern',
    ...content
  };

  const mockQuoteItems = [
    { description: 'Premium Window Blinds', qty: 3, unit_price: 245.00, total: 735.00 },
    { description: 'Installation Service', qty: 1, unit_price: 150.00, total: 150.00 },
    { description: 'Hardware & Mounting', qty: 1, unit_price: 75.00, total: 75.00 }
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 text-lg border-b pb-2">{safeContent.title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 shadow-sm">
          <thead>
            <tr className="bg-gray-100">
              {safeContent.showProduct && <th className="border border-gray-300 p-3 text-left font-semibold">Product</th>}
              {safeContent.showDescription && <th className="border border-gray-300 p-3 text-left font-semibold">Description</th>}
              {safeContent.showQuantity && <th className="border border-gray-300 p-3 text-center font-semibold">Qty</th>}
              {safeContent.showUnitPrice && <th className="border border-gray-300 p-3 text-right font-semibold">Unit Price</th>}
              {safeContent.showTotal && <th className="border border-gray-300 p-3 text-right font-semibold">Total</th>}
            </tr>
          </thead>
          <tbody>
            {mockQuoteItems.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {safeContent.showProduct && <td className="border border-gray-300 p-3 font-medium">{item.description}</td>}
                {safeContent.showDescription && <td className="border border-gray-300 p-3 text-gray-600">High-quality materials and professional installation</td>}
                {safeContent.showQuantity && <td className="border border-gray-300 p-3 text-center">{item.qty}</td>}
                {safeContent.showUnitPrice && <td className="border border-gray-300 p-3 text-right">${item.unit_price.toFixed(2)}</td>}
                {safeContent.showTotal && <td className="border border-gray-300 p-3 text-right font-semibold">${item.total.toFixed(2)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TotalsContent = ({ content, onUpdate, isEditing, setIsEditing }: any) => {
  const safeContent = {
    showSubtotal: true,
    showTax: true,
    showTotal: true,
    style: {},
    ...content
  };

  return (
    <div className="max-w-sm ml-auto">
      <div 
        className="space-y-3 p-4 rounded border"
        style={{ 
          backgroundColor: safeContent.style?.backgroundColor || '#f8fafc',
          borderColor: safeContent.style?.borderColor || '#e2e8f0'
        }}
      >
        {safeContent.showSubtotal && (
          <div className="flex justify-between text-lg">
            <span className="text-gray-700">Subtotal:</span>
            <span className="font-medium">$960.00</span>
          </div>
        )}
        {safeContent.showTax && (
          <div className="flex justify-between text-lg">
            <span className="text-gray-700">Tax (10%):</span>
            <span className="font-medium">$96.00</span>
          </div>
        )}
        {safeContent.showTotal && (
          <div className="flex justify-between text-xl font-bold border-t-2 pt-3 border-gray-300">
            <span className="text-gray-900">Total:</span>
            <span className="text-blue-600">$1,056.00</span>
          </div>
        )}
      </div>
    </div>
  );
};

const FooterContent = ({ content, onUpdate, isEditing, setIsEditing }: any) => {
  if (isEditing) {
    return (
      <Textarea
        value={content.text || ''}
        onChange={(e) => onUpdate({ ...content, text: e.target.value })}
        onBlur={() => setIsEditing(false)}
        className="border-none p-0 focus:ring-0 resize-none"
        autoFocus
      />
    );
  }

  return (
    <div 
      className={`text-center text-sm text-gray-600 ${isEditing ? 'cursor-pointer hover:bg-yellow-100' : ''}`}
      onClick={() => setIsEditing(true)}
    >
      {content.text || 'Footer text'}
    </div>
  );
};

const SpacerContent = ({ content, onUpdate }: any) => (
  <div style={{ height: content.height || '20px' }} className="bg-transparent" />
);

const SignatureContent = ({ content, onUpdate, isEditing, setIsEditing }: any) => {
  const [showSignaturePopup, setShowSignaturePopup] = useState(false);
  const [signatureData, setSignatureData] = useState(content.signatureData || null);

  const handleSignatureSave = (dataUrl: string) => {
    setSignatureData(dataUrl);
    onUpdate({ ...content, signatureData: dataUrl });
    setShowSignaturePopup(false);
  };

  const openSignaturePopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSignaturePopup(true);
  };

  return (
    <>
      <div className="space-y-4 border border-gray-300 p-4 bg-gray-50">
        <div className="text-sm font-medium text-gray-700">
          {content.signatureLabel || 'Authorized Signature'}
        </div>
        <div 
          className="h-16 border-b border-gray-400 relative cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={(e) => openSignaturePopup(e)}
        >
          {signatureData ? (
            <img 
              src={signatureData} 
              alt="Signature" 
              className="h-full object-contain"
            />
          ) : (
            <div className="absolute bottom-0 left-0 text-xs text-gray-500">
              Click to sign
            </div>
          )}
        </div>
        {content.showDate && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">{content.dateLabel || 'Date'}:</span>
            <div className="border-b border-gray-400 w-32"></div>
          </div>
        )}
      </div>

      {showSignaturePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Digital Signature</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSignaturePopup(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  ✕
                </Button>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Please sign in the box below using your mouse or finger on touch devices.
                </p>
                <SignatureCanvas 
                  onSignatureSave={handleSignatureSave}
                  width={400}
                  height={200}
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowSignaturePopup(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setShowSignaturePopup(false)}
                    disabled={!signatureData}
                  >
                    Save Signature
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const DividerContent = ({ content, onUpdate }: any) => (
  <hr 
    className="border-gray-300" 
    style={{ 
      borderWidth: content.thickness || '1px',
      borderColor: content.color || '#d1d5db'
    }} 
  />
);