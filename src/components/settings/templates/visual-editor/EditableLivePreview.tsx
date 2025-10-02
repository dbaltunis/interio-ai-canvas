import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Hash,
  FileText,
  User,
  ShoppingCart,
  Calculator,
  PenTool,
  Type,
  Image as ImageIcon,
  Palette,
  Move,
  Edit3,
  Settings,
  Minus,
  Plus,
  Space,
  Eye,
  EyeOff,
  Layout,
  X
} from "lucide-react";
import { SignatureCanvas } from './SignatureCanvas';
import { cn } from "@/lib/utils";

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
  placeholder?: string;
}

const EditableText = ({ value, onChange, className, style, multiline, placeholder }: EditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  // Sync local state when value prop changes (important for reloaded templates)
  React.useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    console.log('EditableText saving:', editValue);
    // Call onChange first before changing state
    if (onChange && editValue !== value) {
      onChange(editValue);
    }
    // Use setTimeout to ensure onChange completes before state change
    setTimeout(() => {
      setIsEditing(false);
    }, 0);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="relative group">
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={cn("min-h-[60px]", className)}
            style={style}
            placeholder={placeholder}
            autoFocus
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancel();
              if (e.key === 'Enter' && e.ctrlKey) handleSave();
            }}
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className={className}
            style={style}
            placeholder={placeholder}
            autoFocus
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancel();
              if (e.key === 'Enter') handleSave();
            }}
          />
        )}
        <div className="absolute -top-8 left-0 flex gap-1 bg-white border rounded shadow-lg p-1 z-10">
          <Button size="sm" variant="ghost" onClick={handleSave} className="h-6 px-2">
            ✓
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 px-2">
            ✕
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("cursor-pointer hover:bg-blue-50 hover:ring-2 hover:ring-blue-200 rounded transition-all relative group", className)}
      style={style}
      onClick={() => setIsEditing(true)}
    >
      {value || placeholder}
      <Edit3 className="absolute -top-2 -right-2 h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

interface EditableContainerProps {
  children: React.ReactNode;
  onStyleChange: (styles: any) => void;
  currentStyles: any;
  className?: string;
}

const EditableContainer = ({ children, onStyleChange, currentStyles, className }: EditableContainerProps) => {
  const [showControls, setShowControls] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('');

  const updateStyle = (property: string, value: any) => {
    onStyleChange({
      ...currentStyles,
      [property]: value
    });
  };

  return (
    <div className={cn("relative group", className)}>
      <div 
        className="relative hover:ring-2 hover:ring-purple-200 rounded transition-all"
        style={currentStyles}
      >
        {children}
        
        {/* Hover Controls */}
        <div className="absolute -top-10 left-0 opacity-0 group-hover:opacity-100 transition-all z-20">
          <div className="flex gap-1 bg-white border rounded shadow-lg p-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowControls(!showControls)}
              className="h-8 px-2"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedProperty('padding')}
              className="h-8 px-2"
            >
              <Space className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedProperty('background')}
              className="h-8 px-2"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Controls Overlay */}
        {selectedProperty === 'padding' && (
          <div className="absolute top-0 left-0 right-0 bg-white/95 border rounded p-2 z-30">
            <div className="flex items-center gap-2 text-sm">
              <span>Padding:</span>
              <Slider
                value={[parseInt(currentStyles.padding) || 16]}
                onValueChange={([value]) => updateStyle('padding', `${value}px`)}
                max={100}
                step={4}
                className="flex-1"
              />
              <span>{parseInt(currentStyles.padding) || 16}px</span>
              <Button size="sm" variant="ghost" onClick={() => setSelectedProperty('')}>
                ✕
              </Button>
            </div>
          </div>
        )}

        {selectedProperty === 'background' && (
          <div className="absolute top-0 left-0 right-0 bg-white/95 border rounded p-2 z-30">
            <div className="flex items-center gap-2 text-sm">
              <span>Background:</span>
              <Input
                type="color"
                value={currentStyles.backgroundColor || '#ffffff'}
                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                className="w-16 h-8"
              />
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => updateStyle('backgroundColor', 'transparent')}
              >
                Clear
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedProperty('')}>
                ✕
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Controls Panel */}
      {showControls && (
        <div className="absolute top-full left-0 w-80 bg-white border rounded-lg shadow-xl p-4 z-40 mt-2">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Style Controls</h4>
              <Button size="sm" variant="ghost" onClick={() => setShowControls(false)}>
                ✕
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Padding</label>
                <Slider
                  value={[parseInt(currentStyles.padding) || 16]}
                  onValueChange={([value]) => updateStyle('padding', `${value}px`)}
                  max={100}
                  step={4}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Margin</label>
                <Slider
                  value={[parseInt(currentStyles.margin) || 0]}
                  onValueChange={([value]) => updateStyle('margin', `${value}px`)}
                  max={100}
                  step={4}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Background Color</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={currentStyles.backgroundColor || '#ffffff'}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    className="w-16"
                  />
                  <Input
                    value={currentStyles.backgroundColor || ''}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Border Radius</label>
                <Slider
                  value={[parseInt(currentStyles.borderRadius) || 0]}
                  onValueChange={([value]) => updateStyle('borderRadius', `${value}px`)}
                  max={50}
                  step={2}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Border</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={currentStyles.borderWidth || '0'}
                    onChange={(e) => updateStyle('borderWidth', e.target.value)}
                    placeholder="1px"
                    className="w-20"
                  />
                  <Input
                    type="color"
                    value={currentStyles.borderColor || '#e5e7eb'}
                    onChange={(e) => updateStyle('borderColor', e.target.value)}
                    className="w-16"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface EditableLivePreviewBlockProps {
  block: any;
  projectData?: any;
  onBlockUpdate: (blockId: string, updates: any) => void;
  onBlockRemove: (blockId: string) => void;
}

const EditableLivePreviewBlock = ({ block, projectData, onBlockUpdate, onBlockRemove }: EditableLivePreviewBlockProps) => {
  const content = block.content || {};
  const style = content.style || {};

  const updateBlockContent = (updates: any) => {
    console.log('updateBlockContent called for block:', block.id, 'with updates:', updates);
    const updatedBlock = {
      ...block,
      content: {
        ...content,
        ...updates
      }
    };
    console.log('Updated block:', updatedBlock);
    onBlockUpdate(block.id, updatedBlock);
  };

  const updateBlockStyle = (styleUpdates: any) => {
    onBlockUpdate(block.id, {
      ...block,
      content: {
        ...content,
        style: {
          ...style,
          ...styleUpdates
        }
      }
    });
  };

  const renderTokenValue = (token: string) => {
    const project = projectData?.project || {};
    const client = project.client || {};
    const businessSettings = projectData?.businessSettings || {};
    
    const tokens = {
      company_name: businessSettings.company_name || 'Your Company Name',
      company_address: businessSettings.address ? 
        `${businessSettings.address}${businessSettings.city ? ', ' + businessSettings.city : ''}${businessSettings.state ? ', ' + businessSettings.state : ''}${businessSettings.zip_code ? ' ' + businessSettings.zip_code : ''}` 
        : '123 Business Ave, Suite 100',
      company_phone: businessSettings.business_phone || '(555) 123-4567',
      company_email: businessSettings.business_email || 'info@company.com',
      client_name: client.name || 'John Smith',
      client_email: client.email || 'client@example.com', 
      client_phone: client.phone || '(555) 987-6543',
      client_address: client.address ? 
        `${client.address}${client.city ? ', ' + client.city : ''}${client.state ? ', ' + client.state : ''}${client.zip_code ? ' ' + client.zip_code : ''}` 
        : '456 Residential Street, Anytown, ST 12345',
      client_company: client.company_name || '',
      quote_number: project.quote_number || project.job_number || 'QT-2024-001',
      project_name: project.name || 'Project',
      date: project.created_at ? new Date(project.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      subtotal: projectData?.subtotal ? `$${projectData.subtotal.toFixed(2)}` : '$0.00',
      tax_amount: projectData?.taxAmount ? `$${projectData.taxAmount.toFixed(2)}` : '$0.00',
      tax_rate: projectData?.taxRate ? `${(projectData.taxRate * 100).toFixed(1)}%` : '8.5%',
      total: projectData?.total ? `$${projectData.total.toFixed(2)}` : '$0.00',
    };
    return tokens[token as keyof typeof tokens] || token;
  };

  switch (block.type) {
    case 'header':
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            backgroundColor: style.backgroundColor || '#f8fafc',
            color: style.textColor || '#1e293b',
            padding: style.padding || '24px',
            borderRadius: style.borderRadius || '8px',
            margin: style.margin || '0 0 24px 0'
          }}
          className="mb-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {content.showLogo && (
                <div className={`mb-4 ${content.logoPosition === 'center' ? 'text-center' : ''}`}>
                  {projectData?.businessSettings?.company_logo_url ? (
                    <img 
                      src={projectData.businessSettings.company_logo_url} 
                      alt="Company Logo" 
                      className="h-16 w-auto object-contain"
                      style={{ maxWidth: '200px' }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
              )}
              <EditableText
                value={content.companyName || renderTokenValue('company_name')}
                onChange={(value) => updateBlockContent({ companyName: value })}
                className="text-3xl font-bold mb-2"
                placeholder="Company Name"
              />
              <div className="space-y-1 opacity-90 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <EditableText
                    value={content.companyAddress || renderTokenValue('company_address')}
                    onChange={(value) => updateBlockContent({ companyAddress: value })}
                    placeholder="Company Address"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <EditableText
                    value={content.companyPhone || renderTokenValue('company_phone')}
                    onChange={(value) => updateBlockContent({ companyPhone: value })}
                    placeholder="Company Phone"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <EditableText
                    value={content.companyEmail || renderTokenValue('company_email')}
                    onChange={(value) => updateBlockContent({ companyEmail: value })}
                    placeholder="Company Email"
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <EditableText
                value="Quote"
                onChange={(value) => updateBlockContent({ documentTitle: value })}
                className="text-2xl font-semibold mb-2"
                placeholder="Document Title"
              />
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <Hash className="h-3 w-3" />
                  <span>Quote #: {renderTokenValue('quote_number')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Date: {renderTokenValue('date')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Valid Until: {renderTokenValue('valid_until')}</span>
                </div>
              </div>
            </div>
          </div>
        </EditableContainer>
      );

    case 'client-info':
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            padding: style.padding || '16px',
            margin: style.margin || '0 0 24px 0',
            backgroundColor: style.backgroundColor || 'transparent'
          }}
          className="mb-6"
        >
          <EditableText
            value={content.title || 'Bill To:'}
            onChange={(value) => updateBlockContent({ title: value })}
            className="text-lg font-semibold mb-3 text-brand-primary flex items-center gap-2"
            placeholder="Section Title"
          />
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-1">
              <EditableText
                value={content.clientName || renderTokenValue('client_name')}
                onChange={(value) => updateBlockContent({ clientName: value })}
                className="font-medium"
                placeholder="Client Name"
              />
              {content.showCompany && (content.clientCompany || renderTokenValue('client_company')) && (
                <EditableText
                  value={content.clientCompany || renderTokenValue('client_company')}
                  onChange={(value) => updateBlockContent({ clientCompany: value })}
                  className="text-gray-600"
                  placeholder="Client Company"
                />
              )}
              {content.showClientEmail && (
                <EditableText
                  value={content.clientEmail || renderTokenValue('client_email')}
                  onChange={(value) => updateBlockContent({ clientEmail: value })}
                  className="text-gray-600"
                  placeholder="Client Email"
                />
              )}
              {content.showClientPhone && (
                <EditableText
                  value={content.clientPhone || renderTokenValue('client_phone')}
                  onChange={(value) => updateBlockContent({ clientPhone: value })}
                  className="text-gray-600"
                  placeholder="Client Phone"
                />
              )}
              {content.showClientAddress && (
                <EditableText
                  value={content.clientAddress || renderTokenValue('client_address')}
                  onChange={(value) => updateBlockContent({ clientAddress: value })}
                  className="text-gray-600"
                  placeholder="Client Address"
                  multiline
                />
              )}
            </div>
          </div>
        </EditableContainer>
      );

    case 'text':
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            fontSize: style.fontSize || '16px',
            fontWeight: style.fontWeight || 'normal',
            fontStyle: style.fontStyle || 'normal',
            textAlign: style.textAlign || 'left',
            color: style.color || 'inherit',
            padding: style.padding || '16px',
            margin: style.margin || '0 0 24px 0',
            backgroundColor: style.backgroundColor || 'transparent'
          }}
          className="mb-6"
        >
          <EditableText
            value={content.text || 'Enter your text here...'}
            onChange={(value) => updateBlockContent({ text: value })}
            multiline
            placeholder="Enter your text here..."
          />
        </EditableContainer>
      );

    case 'line-items':
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            padding: style.padding || '16px',
            margin: style.margin || '0 0 24px 0',
            backgroundColor: style.backgroundColor || 'transparent'
          }}
          className="mb-6"
        >
          <EditableText
            value={content.title || 'Line Items'}
            onChange={(value) => updateBlockContent({ title: value })}
            className="text-lg font-semibold mb-4 text-brand-primary flex items-center gap-2"
            placeholder="Section Title"
          />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-3 text-left">
                    <EditableText
                      value={content.headerDescription || "Description"}
                      onChange={(value) => updateBlockContent({ headerDescription: value })}
                      className="font-medium"
                      placeholder="Description"
                    />
                  </th>
                  <th className="border border-gray-300 p-3 text-center w-24">
                    <EditableText
                      value={content.headerQty || "Qty"}
                      onChange={(value) => updateBlockContent({ headerQty: value })}
                      className="font-medium"
                      placeholder="Qty"
                    />
                  </th>
                  <th className="border border-gray-300 p-3 text-right w-32">
                    <EditableText
                      value={content.headerUnitPrice || "Unit Price"}
                      onChange={(value) => updateBlockContent({ headerUnitPrice: value })}
                      className="font-medium"
                      placeholder="Unit Price"
                    />
                  </th>
                  <th className="border border-gray-300 p-3 text-right w-32">
                    <EditableText
                      value={content.headerTotal || "Total"}
                      onChange={(value) => updateBlockContent({ headerTotal: value })}
                      className="font-medium"
                      placeholder="Total"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-3">
                    <EditableText
                      value={content.item1Description || "Custom Drapery Installation"}
                      onChange={(value) => updateBlockContent({ item1Description: value })}
                      placeholder="Item description"
                    />
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    <EditableText
                      value={content.item1Qty || "1"}
                      onChange={(value) => updateBlockContent({ item1Qty: value })}
                      placeholder="1"
                    />
                  </td>
                  <td className="border border-gray-300 p-3 text-right">
                    <EditableText
                      value={content.item1UnitPrice || "$1,250.00"}
                      onChange={(value) => updateBlockContent({ item1UnitPrice: value })}
                      placeholder="$0.00"
                    />
                  </td>
                  <td className="border border-gray-300 p-3 text-right font-medium">
                    <EditableText
                      value={content.item1Total || "$1,250.00"}
                      onChange={(value) => updateBlockContent({ item1Total: value })}
                      placeholder="$0.00"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-end space-y-2">
              <div className="w-64">
                <div className="flex justify-between py-1">
                  <span>Subtotal:</span>
                  <span className="font-medium">{renderTokenValue('subtotal')}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Tax ({renderTokenValue('tax_rate')}):</span>
                  <span className="font-medium">{renderTokenValue('tax_amount')}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gray-300 font-bold text-lg">
                  <span>Total:</span>
                  <span>{renderTokenValue('total')}</span>
                </div>
              </div>
            </div>
          </div>
        </EditableContainer>
      );

    case 'terms-conditions':
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            padding: style.padding || '16px',
            margin: style.margin || '0 0 24px 0',
            backgroundColor: style.backgroundColor || 'transparent'
          }}
          className="mb-6"
        >
          <EditableText
            value={content.title || 'Terms & Conditions'}
            onChange={(value) => updateBlockContent({ title: value })}
            className="text-lg font-semibold mb-4 text-brand-primary"
            placeholder="Section Title"
          />
          <div className="text-sm space-y-3">
            <div>
              <EditableText
                value={content.term1 || "1. Payment Terms: 50% deposit required upon acceptance of this quote. Remaining balance due upon completion."}
                onChange={(value) => updateBlockContent({ term1: value })}
                multiline
                placeholder="Payment terms..."
              />
            </div>
            <div>
              <EditableText
                value={content.term2 || "2. Timeline: Project completion is estimated at 2-3 weeks from deposit receipt and final measurements."}
                onChange={(value) => updateBlockContent({ term2: value })}
                multiline
                placeholder="Timeline information..."
              />
            </div>
            <div>
              <EditableText
                value={content.term3 || "3. Warranty: All work comes with a 1-year warranty against defects in workmanship."}
                onChange={(value) => updateBlockContent({ term3: value })}
                multiline
                placeholder="Warranty details..."
              />
            </div>
            <div>
              <EditableText
                value={content.term4 || "4. Cancellation: This quote is valid for 30 days. Cancellation after work begins subject to materials and labor charges."}
                onChange={(value) => updateBlockContent({ term4: value })}
                multiline
                placeholder="Cancellation policy..."
              />
            </div>
          </div>
        </EditableContainer>
      );

    case 'payment-info':
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            padding: style.padding || '16px',
            margin: style.margin || '0 0 24px 0',
            backgroundColor: style.backgroundColor || '#f8fafc'
          }}
          className="mb-6"
        >
          <EditableText
            value={content.title || 'Payment Information'}
            onChange={(value) => updateBlockContent({ title: value })}
            className="text-lg font-semibold mb-4 text-brand-primary flex items-center gap-2"
            placeholder="Section Title"
          />
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Payment Methods
              </h4>
              <div className="text-sm space-y-1">
                <EditableText
                  value={content.paymentMethod1 || "• Cash, Check, or Credit Card"}
                  onChange={(value) => updateBlockContent({ paymentMethod1: value })}
                  placeholder="Payment method 1"
                />
                <EditableText
                  value={content.paymentMethod2 || "• Bank Transfer (ACH)"}
                  onChange={(value) => updateBlockContent({ paymentMethod2: value })}
                  placeholder="Payment method 2"
                />
                <EditableText
                  value={content.paymentMethod3 || "• Financing Available"}
                  onChange={(value) => updateBlockContent({ paymentMethod3: value })}
                  placeholder="Payment method 3"
                />
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Payment Schedule</h4>
              <div className="text-sm space-y-1">
                <EditableText
                  value={content.paymentSchedule1 || "Deposit: 50% upon signing"}
                  onChange={(value) => updateBlockContent({ paymentSchedule1: value })}
                  placeholder="Payment schedule item"
                />
                <EditableText
                  value={content.paymentSchedule2 || "Progress: 25% at midpoint"}
                  onChange={(value) => updateBlockContent({ paymentSchedule2: value })}
                  placeholder="Payment schedule item"
                />
                <EditableText
                  value={content.paymentSchedule3 || "Final: 25% upon completion"}
                  onChange={(value) => updateBlockContent({ paymentSchedule3: value })}
                  placeholder="Payment schedule item"
                />
              </div>
            </div>
          </div>
        </EditableContainer>
      );

    case 'project-scope':
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            padding: style.padding || '16px',
            margin: style.margin || '0 0 24px 0',
            backgroundColor: style.backgroundColor || 'transparent'
          }}
          className="mb-6"
        >
          <EditableText
            value={content.title || 'Project Scope'}
            onChange={(value) => updateBlockContent({ title: value })}
            className="text-lg font-semibold mb-4 text-brand-primary"
            placeholder="Section Title"
          />
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Included:</h4>
              <div className="text-sm space-y-1 pl-4">
                <EditableText
                  value={content.included1 || "✓ Professional measurement and consultation"}
                  onChange={(value) => updateBlockContent({ included1: value })}
                  placeholder="Included item"
                />
                <EditableText
                  value={content.included2 || "✓ Custom fabrication of drapery"}
                  onChange={(value) => updateBlockContent({ included2: value })}
                  placeholder="Included item"
                />
                <EditableText
                  value={content.included3 || "✓ Hardware installation and mounting"}
                  onChange={(value) => updateBlockContent({ included3: value })}
                  placeholder="Included item"
                />
                <EditableText
                  value={content.included4 || "✓ Final styling and adjustments"}
                  onChange={(value) => updateBlockContent({ included4: value })}
                  placeholder="Included item"
                />
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Not Included:</h4>
              <div className="text-sm space-y-1 pl-4">
                <EditableText
                  value={content.excluded1 || "• Wall repairs or painting"}
                  onChange={(value) => updateBlockContent({ excluded1: value })}
                  placeholder="Excluded item"
                />
                <EditableText
                  value={content.excluded2 || "• Removal of existing treatments"}
                  onChange={(value) => updateBlockContent({ excluded2: value })}
                  placeholder="Excluded item"
                />
                <EditableText
                  value={content.excluded3 || "• Electrical work for motorization"}
                  onChange={(value) => updateBlockContent({ excluded3: value })}
                  placeholder="Excluded item"
                />
              </div>
            </div>
          </div>
        </EditableContainer>
      );

    case 'signature':
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            padding: style.padding || '24px',
            margin: style.margin || '24px 0 0 0',
            backgroundColor: style.backgroundColor || 'transparent'
          }}
          className="mt-8"
        >
          <EditableText
            value={content.title || 'Authorization'}
            onChange={(value) => updateBlockContent({ title: value })}
            className="text-lg font-semibold mb-6 text-brand-primary"
            placeholder="Section Title"
          />
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <EditableText
                value={content.authorizationText || "By signing below, you authorize us to proceed with this work as described:"}
                onChange={(value) => updateBlockContent({ authorizationText: value })}
                className="text-sm mb-4"
                placeholder="Authorization text"
                multiline
              />
              <div className="border-t border-gray-400 pt-2 mt-12">
                <div className="text-sm">
                  <EditableText
                    value={content.clientSignatureLabel || "Client Signature"}
                    onChange={(value) => updateBlockContent({ clientSignatureLabel: value })}
                    className="font-medium"
                    placeholder="Client Signature Label"
                  />
                  <div className="text-gray-600">Print Name: {renderTokenValue('client_name')}</div>
                  <div className="text-gray-600">Date: _________________</div>
                </div>
              </div>
            </div>
            <div>
              <EditableText
                value={content.thankYouText || "Thank you for choosing us for your project!"}
                onChange={(value) => updateBlockContent({ thankYouText: value })}
                className="text-sm mb-4"
                placeholder="Thank you message"
                multiline
              />
              <div className="border-t border-gray-400 pt-2 mt-12">
                <div className="text-sm">
                  <EditableText
                    value={content.companySignatureLabel || "Company Representative"}
                    onChange={(value) => updateBlockContent({ companySignatureLabel: value })}
                    className="font-medium"
                    placeholder="Company Representative Label"
                  />
                  <div className="text-gray-600">Print Name: _________________</div>
                  <div className="text-gray-600">Date: _________________</div>
                </div>
              </div>
            </div>
          </div>
        </EditableContainer>
      );

    case 'spacer':
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            height: style.height || '24px',
            margin: style.margin || '0',
            backgroundColor: style.backgroundColor || 'transparent'
          }}
          className="relative"
        >
          <div 
            className="w-full border-2 border-dashed border-gray-200 rounded flex items-center justify-center text-gray-400 text-sm hover:border-gray-400 transition-colors"
            style={{ height: style.height || '24px' }}
          >
            <Space className="h-4 w-4 mr-2" />
            Spacer ({style.height || '24px'})
          </div>
        </EditableContainer>
      );

    case 'divider':
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            margin: style.margin || '24px 0',
            borderColor: style.borderColor || '#e5e7eb',
            borderWidth: style.borderWidth || '1px'
          }}
          className="my-6"
        >
          <hr 
            className="w-full"
            style={{
              borderColor: style.borderColor || '#e5e7eb',
              borderWidth: `${style.borderWidth || 1}px 0 0 0`,
              borderStyle: style.borderStyle || 'solid'
            }}
          />
        </EditableContainer>
      );
    default:
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={style}
          className="mb-6"
        >
          <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <EditableText
              value={`Unknown block type: ${block.type}`}
              onChange={() => {}}
              placeholder="Block content"
            />
          </div>
        </EditableContainer>
      );
  }
};

interface EditableLivePreviewProps {
  blocks: any[];
  projectData?: any;
  onBlocksChange: (blocks: any[]) => void;
  containerStyles?: any;
  onContainerStylesChange?: (styles: any) => void;
}

export const EditableLivePreview = ({ 
  blocks, 
  projectData, 
  onBlocksChange,
  containerStyles = {},
  onContainerStylesChange 
}: EditableLivePreviewProps) => {
  const [showPageControls, setShowPageControls] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);

  const availableBlocks = [
    { type: 'header', name: 'Company Header', icon: Building2, description: 'Company info & logo' },
    { type: 'client-info', name: 'Client Details', icon: User, description: 'Client information' },
    { type: 'text', name: 'Text Block', icon: Type, description: 'Add formatted text' },
    { type: 'line-items', name: 'Line Items Table', icon: ShoppingCart, description: 'Professional itemized list' },
    { type: 'terms-conditions', name: 'Terms & Conditions', icon: FileText, description: 'Legal terms and policies' },
    { type: 'payment-info', name: 'Payment Information', icon: DollarSign, description: 'Payment methods and schedule' },
    { type: 'project-scope', name: 'Project Scope', icon: Calculator, description: 'What\'s included and excluded' },
    { type: 'signature', name: 'Signature Block', icon: PenTool, description: 'Authorization signatures' },
    { type: 'spacer', name: 'Spacer', icon: Space, description: 'Add vertical space' },
    { type: 'divider', name: 'Divider', icon: Minus, description: 'Section separator' },
  ];

  const addBlock = (type: string) => {
    const newBlock = {
      id: `block_${Date.now()}`,
      type,
      content: getDefaultContentForType(type)
    };
    onBlocksChange([...blocks, newBlock]);
    setShowComponentLibrary(false);
  };

  const removeBlock = (blockId: string) => {
    const newBlocks = blocks.filter(block => block.id !== blockId);
    onBlocksChange(newBlocks);
  };

  const getDefaultContentForType = (type: string) => {
    switch (type) {
      case 'header':
        return {
          showLogo: true,
          logoPosition: 'left',
          style: {
            backgroundColor: '#f8fafc',
            textColor: '#1e293b',
            padding: '24px',
            borderRadius: '8px'
          }
        };
      case 'client-info':
        return {
          title: 'Bill To:',
          showCompany: true,
          showClientEmail: true,
          showClientPhone: true,
          showClientAddress: true
        };
      case 'text':
        return {
          text: 'Enter your text here...'
        };
      case 'line-items':
        return {
          title: 'Line Items'
        };
      case 'terms-conditions':
        return {
          title: 'Terms & Conditions'
        };
      case 'payment-info':
        return {
          title: 'Payment Information'
        };
      case 'project-scope':
        return {
          title: 'Project Scope'
        };
      case 'signature':
        return {
          title: 'Authorization'
        };
      case 'spacer':
        return {
          style: {
            height: '24px'
          }
        };
      case 'divider':
        return {
          style: {
            borderColor: '#e5e7eb',
            borderWidth: '1px'
          }
        };
      default:
        return {};
    }
  };

  const handleBlockUpdate = useCallback((blockId: string, updatedBlock: any) => {
    const newBlocks = blocks.map(block => 
      block.id === blockId ? updatedBlock : block
    );
    onBlocksChange(newBlocks);
  }, [blocks, onBlocksChange]);

  const updatePageStyles = (styleUpdates: any) => {
    if (onContainerStylesChange) {
      onContainerStylesChange({
        ...containerStyles,
        ...styleUpdates
      });
    }
  };

  if (!blocks || blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No blocks to preview</h3>
          <p className="text-sm">Add some blocks to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Floating Add Block Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShowComponentLibrary(true)}
          className="rounded-full w-14 h-14 shadow-lg"
          size="lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Component Library Modal */}
      {showComponentLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] overflow-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add Block</h3>
                <Button size="sm" variant="ghost" onClick={() => setShowComponentLibrary(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {availableBlocks.map((blockType) => (
                <Button
                  key={blockType.type}
                  variant="ghost"
                  onClick={() => addBlock(blockType.type)}
                  className="w-full justify-start h-auto p-3 text-left"
                >
                  <div className="flex items-start gap-3">
                    <blockType.icon className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <div className="font-medium">{blockType.name}</div>
                      <div className="text-sm text-gray-500">{blockType.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Page-level controls */}
      <div className="absolute -top-12 right-0 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowPageControls(!showPageControls)}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Page Settings
        </Button>
      </div>

      {showPageControls && (
        <div className="absolute -top-4 right-0 w-80 bg-white border rounded-lg shadow-xl p-4 z-50">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Page Settings</h4>
              <Button size="sm" variant="ghost" onClick={() => setShowPageControls(false)}>
                ✕
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Page Background</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={containerStyles.backgroundColor || '#ffffff'}
                    onChange={(e) => updatePageStyles({ backgroundColor: e.target.value })}
                    className="w-16"
                  />
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => updatePageStyles({ backgroundColor: '#ffffff' })}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Page Margins</label>
                <Slider
                  value={[parseInt(containerStyles.padding) || 32]}
                  onValueChange={([value]) => updatePageStyles({ padding: `${value}px` })}
                  max={100}
                  step={8}
                  className="mt-1"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {parseInt(containerStyles.padding) || 32}px
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Max Width</label>
                <Select 
                  value={containerStyles.maxWidth || '4xl'}
                  onValueChange={(value) => updatePageStyles({ maxWidth: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2xl">Small (672px)</SelectItem>
                    <SelectItem value="3xl">Medium (768px)</SelectItem>
                    <SelectItem value="4xl">Large (896px)</SelectItem>
                    <SelectItem value="5xl">Extra Large (1024px)</SelectItem>
                    <SelectItem value="full">Full Width</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      <div 
        className="bg-white min-h-full"
        style={{
          backgroundColor: containerStyles.backgroundColor || '#ffffff'
        }}
      >
        <div 
          className={`mx-auto ${containerStyles.maxWidth === 'full' ? 'w-full' : `max-w-${containerStyles.maxWidth || '4xl'}`}`}
          style={{
            padding: containerStyles.padding || '32px'
          }}
        >
          {blocks.map((block, index) => (
            <div key={block.id || index} className="relative group">
              {/* Block Delete Button */}
              <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeBlock(block.id)}
                  className="rounded-full w-8 h-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <EditableLivePreviewBlock 
                block={block} 
                projectData={projectData}
                onBlockUpdate={handleBlockUpdate}
                onBlockRemove={removeBlock}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};