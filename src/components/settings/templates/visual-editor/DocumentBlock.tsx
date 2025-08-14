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
        return <ClientInfoContent content={block.content} onUpdate={onUpdateContent} isEditing={isEditing} setIsEditing={setIsEditing} />;
      case 'text':
        return <TextContent content={block.content} onUpdate={onUpdateContent} isEditing={isEditing} setIsEditing={setIsEditing} />;
      case 'image':
        return <ImageUploadBlock content={block.content} onUpdate={onUpdateContent} />;
      case 'products':
        return <ProductsContent content={block.content} onUpdate={onUpdateContent} isEditing={isEditing} setIsEditing={setIsEditing} />;
      case 'totals':
        return <TotalsContent content={block.content} onUpdate={onUpdateContent} isEditing={isEditing} setIsEditing={setIsEditing} />;
      case 'signature':
        return <SignatureContent content={block.content} onUpdate={onUpdateContent} isEditing={isEditing} setIsEditing={setIsEditing} />;
      case 'payment':
        return <PaymentBlock content={block.content} onUpdate={onUpdateContent} />;
      case 'footer':
        return <FooterContent content={block.content} onUpdate={onUpdateContent} isEditing={isEditing} setIsEditing={setIsEditing} />;
      case 'spacer':
        return <SpacerContent content={block.content} onUpdate={onUpdateContent} />;
      case 'divider':
        return <DividerContent content={block.content} onUpdate={onUpdateContent} />;
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

  return (
    <div className="space-y-4">
      <div className={`flex items-start gap-4 ${
        content.logoPosition === 'center' ? 'flex-col items-center' : 
        content.logoPosition === 'right' ? 'flex-row-reverse' : 'flex-row'
      }`}>
        {content.showLogo && (
          <div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded flex-shrink-0">
            <span className="text-xs text-gray-500">LOGO</span>
          </div>
        )}
        <div className="flex-1 space-y-2">
          {editingField === 'companyName' && isEditing ? (
            <Input
              value={content.companyName || ''}
              onChange={(e) => updateField('companyName', e.target.value)}
              onBlur={() => setEditingField(null)}
              onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
              autoFocus
              className="text-xl font-bold border-none p-0 focus:ring-0"
            />
          ) : (
            <h2 
              className={`text-xl font-bold ${isEditing ? 'cursor-pointer hover:bg-yellow-100' : ''}`}
              onClick={() => isEditing && setEditingField('companyName')}
              style={{ color: content.style?.primaryColor || '#415e6b' }}
            >
              {content.companyName || "Company Name"}
            </h2>
          )}

          <div className="text-sm text-gray-600 space-y-1">
            {editingField === 'companyAddress' && isEditing ? (
              <Input
                value={content.companyAddress || ''}
                onChange={(e) => updateField('companyAddress', e.target.value)}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                autoFocus
                className="border-none p-0 focus:ring-0"
              />
            ) : (
              <div 
                className={`${isEditing ? 'cursor-pointer hover:bg-yellow-100' : ''}`}
                onClick={() => isEditing && setEditingField('companyAddress')}
              >
                {content.companyAddress || "Company Address"}
              </div>
            )}

            {editingField === 'companyPhone' && isEditing ? (
              <Input
                value={content.companyPhone || ''}
                onChange={(e) => updateField('companyPhone', e.target.value)}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                autoFocus
                className="border-none p-0 focus:ring-0"
              />
            ) : (
              <div 
                className={`${isEditing ? 'cursor-pointer hover:bg-yellow-100' : ''}`}
                onClick={() => isEditing && setEditingField('companyPhone')}
              >
                {content.companyPhone || "Phone Number"}
              </div>
            )}

            {editingField === 'companyEmail' && isEditing ? (
              <Input
                value={content.companyEmail || ''}
                onChange={(e) => updateField('companyEmail', e.target.value)}
                onBlur={() => setEditingField(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                autoFocus
                className="border-none p-0 focus:ring-0"
              />
            ) : (
              <div 
                className={`${isEditing ? 'cursor-pointer hover:bg-yellow-100' : ''}`}
                onClick={() => isEditing && setEditingField('companyEmail')}
              >
                {content.companyEmail || "Email Address"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ClientInfoContent = ({ content, onUpdate, isEditing, setIsEditing }: any) => (
  <div className="space-y-2">
    <h3 className="font-semibold text-gray-900">{content.title || 'Bill To:'}</h3>
    <div className="text-sm text-gray-600 space-y-1">
      {content.showClientName && <div>Client Name</div>}
      {content.showClientEmail && <div>client@email.com</div>}
      {content.showClientAddress && <div>Client Address</div>}
      {content.showClientPhone && <div>Client Phone</div>}
    </div>
  </div>
);

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

const ProductsContent = ({ content, onUpdate, isEditing, setIsEditing }: any) => (
  <div className="space-y-4">
    <h3 className="font-semibold text-gray-900">Products & Services</h3>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            {content.showProduct && <th className="border border-gray-300 p-2 text-left">Product</th>}
            {content.showDescription && <th className="border border-gray-300 p-2 text-left">Description</th>}
            {content.showQuantity && <th className="border border-gray-300 p-2 text-left">Qty</th>}
            {content.showUnitPrice && <th className="border border-gray-300 p-2 text-left">Unit Price</th>}
            {content.showTotal && <th className="border border-gray-300 p-2 text-left">Total</th>}
            {content.showTax && <th className="border border-gray-300 p-2 text-left">Tax</th>}
          </tr>
        </thead>
        <tbody>
          <tr>
            {content.showProduct && <td className="border border-gray-300 p-2">Sample Product</td>}
            {content.showDescription && <td className="border border-gray-300 p-2">Product description</td>}
            {content.showQuantity && <td className="border border-gray-300 p-2">1</td>}
            {content.showUnitPrice && <td className="border border-gray-300 p-2">$100.00</td>}
            {content.showTotal && <td className="border border-gray-300 p-2">$100.00</td>}
            {content.showTax && <td className="border border-gray-300 p-2">$10.00</td>}
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

const TotalsContent = ({ content, onUpdate, isEditing, setIsEditing }: any) => (
  <div className="space-y-2 max-w-xs ml-auto">
    {content.showSubtotal && (
      <div className="flex justify-between">
        <span>Subtotal:</span>
        <span>$100.00</span>
      </div>
    )}
    {content.showTax && (
      <div className="flex justify-between">
        <span>Tax:</span>
        <span>$10.00</span>
      </div>
    )}
    {content.showTotal && (
      <div className="flex justify-between font-bold border-t pt-2">
        <span>Total:</span>
        <span>$110.00</span>
      </div>
    )}
  </div>
);

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
  const [tempSignatureData, setTempSignatureData] = useState<string | null>(null);

  const handleSignatureSave = (dataUrl: string) => {
    setTempSignatureData(dataUrl);
  };

  const confirmSignature = () => {
    if (tempSignatureData) {
      setSignatureData(tempSignatureData);
      onUpdate({ ...content, signatureData: tempSignatureData });
      setShowSignaturePopup(false);
      setTempSignatureData(null);
    }
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
                    onClick={confirmSignature}
                    disabled={!tempSignatureData}
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