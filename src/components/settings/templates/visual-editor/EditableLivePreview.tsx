import React, { useState, useCallback, useRef, useMemo } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { 
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar as CalendarIcon,
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
  Upload,
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
  X,
  ChevronUp,
  ChevronDown,
  Loader2,
  CreditCard
} from "lucide-react";
import { SignatureCanvas } from './SignatureCanvas';
import { cn } from "@/lib/utils";
import { DocumentHeaderBlock } from './shared/BlockRenderer';
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { getAvailableBlocks, getDocumentTypeConfig } from '@/utils/documentTypeConfig';
import { useUserPreferences } from "@/hooks/useUserPreferences";

// Helper to convert user format to date-fns format
const convertToDateFnsFormat = (userFormat: string): string => {
  const formatMap: Record<string, string> = {
    'MM/dd/yyyy': 'MM/dd/yyyy',
    'dd/MM/yyyy': 'dd/MM/yyyy', 
    'yyyy-MM-dd': 'yyyy-MM-dd',
    'dd-MMM-yyyy': 'dd-MMM-yyyy',
  };
  return formatMap[userFormat] || 'MM/dd/yyyy';
};

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
    
    // Preserve scroll position before save
    const scrollContainer = document.querySelector('.overflow-auto');
    const scrollTop = scrollContainer?.scrollTop || 0;
    
    // Call onChange first before changing state
    if (onChange && editValue !== value) {
      onChange(editValue);
    }
    
    // Restore scroll and exit edit mode
    requestAnimationFrame(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollTop;
      }
      setIsEditing(false);
    });
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
  documentType?: string;
}

const EditableLivePreviewBlock = ({ block, projectData, onBlockUpdate, onBlockRemove, documentType = 'quote' }: EditableLivePreviewBlockProps) => {
  const { data: userBusinessSettings } = useBusinessSettings();
  const { data: userPreferences } = useUserPreferences();
  const content = block.content || {};
  const style = content.style || {};

  // Get user's date format
  const userTimezone = userPreferences?.timezone || 'UTC';
  const userDateFormat = useMemo(() => 
    convertToDateFnsFormat(userPreferences?.date_format || 'MM/dd/yyyy'),
    [userPreferences?.date_format]
  );

  // Helper to format dates using user's preference
  const formatDate = useCallback((dateStr: string | null | undefined): string => {
    if (!dateStr) return format(new Date(), userDateFormat);
    try {
      return formatInTimeZone(new Date(dateStr), userTimezone, userDateFormat);
    } catch {
      return format(new Date(), userDateFormat);
    }
  }, [userDateFormat, userTimezone]);

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
    // Use projectData businessSettings first, then userBusinessSettings as fallback
    const businessSettings = projectData?.businessSettings || userBusinessSettings || {};
    const country = businessSettings?.country || 'Australia';
    
    // Helper to format bank details based on country
    const formatBankDetails = () => {
      if (!businessSettings) return 'Bank details not configured';
      const parts: string[] = [];
      
      if (businessSettings.bank_name) parts.push(`Bank: ${businessSettings.bank_name}`);
      if (businessSettings.bank_account_name) parts.push(`Account Name: ${businessSettings.bank_account_name}`);
      
      // Country-specific formatting
      if (country === 'Australia' && businessSettings.bank_bsb) {
        parts.push(`BSB: ${businessSettings.bank_bsb}`);
        if (businessSettings.bank_account_number) parts.push(`Account: ${businessSettings.bank_account_number}`);
      } else if (country === 'United Kingdom' && businessSettings.bank_sort_code) {
        parts.push(`Sort Code: ${businessSettings.bank_sort_code}`);
        if (businessSettings.bank_account_number) parts.push(`Account: ${businessSettings.bank_account_number}`);
      } else if ((country === 'United States' || country === 'Canada') && businessSettings.bank_routing_number) {
        parts.push(`Routing: ${businessSettings.bank_routing_number}`);
        if (businessSettings.bank_account_number) parts.push(`Account: ${businessSettings.bank_account_number}`);
      } else if (businessSettings.bank_iban) {
        parts.push(`IBAN: ${businessSettings.bank_iban}`);
        if (businessSettings.bank_swift_bic) parts.push(`BIC/SWIFT: ${businessSettings.bank_swift_bic}`);
      } else if (businessSettings.bank_account_number) {
        parts.push(`Account: ${businessSettings.bank_account_number}`);
      }
      
      return parts.length > 0 ? parts.join(' | ') : 'Bank details not configured';
    };

    // Helper to format registration footer based on country
    const formatRegistrationFooter = () => {
      if (!businessSettings) return '';
      const parts: string[] = [];
      
      // Country-specific registration labels
      if (country === 'Australia' && businessSettings.abn) {
        parts.push(`ABN: ${businessSettings.abn}`);
      }
      if (businessSettings.registration_number) {
        const regLabel = country === 'Lithuania' ? 'Įmonės kodas' : 
                        country === 'United Kingdom' ? 'Company Reg' :
                        country === 'France' ? 'SIRET' :
                        country === 'Germany' ? 'HRB' :
                        country === 'Poland' ? 'KRS' :
                        country === 'Ireland' ? 'CRO' :
                        country === 'New Zealand' ? 'NZBN' :
                        'Reg';
        parts.push(`${regLabel}: ${businessSettings.registration_number}`);
      }
      if (businessSettings.tax_number) {
        const taxLabel = country === 'Australia' ? 'GST' :
                        country === 'Lithuania' ? 'PVM' :
                        country === 'United Kingdom' || country === 'Ireland' ? 'VAT' :
                        country === 'France' ? 'TVA' :
                        country === 'Germany' ? 'USt-ID' :
                        country === 'Poland' ? 'NIP' :
                        country === 'United States' ? 'EIN' :
                        country === 'Canada' ? 'GST/HST' :
                        'Tax';
        parts.push(`${taxLabel}: ${businessSettings.tax_number}`);
      }
      
      return parts.length > 0 ? parts.join(' | ') : '';
    };
    
    const tokens: Record<string, string> = {
      // Company information - no hardcoded fallbacks
      company_name: businessSettings.company_name || '',
      company_legal_name: businessSettings.legal_name || '',
      company_trading_name: businessSettings.trading_name || businessSettings.company_name || '',
      company_address: businessSettings.address ? 
        `${businessSettings.address}${businessSettings.city ? ', ' + businessSettings.city : ''}${businessSettings.state ? ', ' + businessSettings.state : ''}${businessSettings.zip_code ? ' ' + businessSettings.zip_code : ''}` 
        : '',
      company_phone: businessSettings.business_phone || '',
      company_email: businessSettings.business_email || '',
      company_abn: businessSettings.abn || '',
      company_registration_number: businessSettings.registration_number || '',
      company_tax_number: businessSettings.tax_number || '',
      company_organization_type: businessSettings.organization_type || '',
      // NEW: Bank and registration tokens
      company_bank_details: formatBankDetails(),
      company_registration_footer: formatRegistrationFooter(),
      // Client information - sample data for preview only
      client_name: client.name || 'John Smith',
      client_email: client.email || 'client@example.com', 
      client_phone: client.phone || '(555) 987-6543',
      client_address: client.address ? 
        `${client.address}${client.city ? ', ' + client.city : ''}${client.state ? ', ' + client.state : ''}${client.zip_code ? ' ' + client.zip_code : ''}` 
        : '456 Residential Street, Anytown, ST 12345',
      client_company: client.company_name || '',
      quote_number: project.quote_number || project.job_number || 'QT-2024-001',
      invoice_number: project.invoice_number || `INV-${project.job_number || '001'}`,
      project_name: project.name || 'Project',
      date: formatDate(project.created_at),
      valid_until: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
      due_date: formatDate(project.due_date) || formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
      subtotal: projectData?.subtotal ? `$${projectData.subtotal.toFixed(2)}` : '$0.00',
      tax_amount: projectData?.taxAmount ? `$${projectData.taxAmount.toFixed(2)}` : '$0.00',
      tax_rate: projectData?.taxRate ? `${(projectData.taxRate * 100).toFixed(1)}%` : '8.5%',
      total: projectData?.total ? `$${projectData.total.toFixed(2)}` : '$0.00',
    };
    return tokens[token] || token;
  };

  // Custom EditableText renderer for editable mode - defined outside switch for scope access
  const renderEditableText = ({ value, onChange, className, placeholder, multiline }: {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    placeholder?: string;
    multiline?: boolean;
  }) => (
    <EditableText
      value={value}
      onChange={onChange}
      className={className}
      placeholder={placeholder}
      multiline={multiline}
    />
  );

  switch (block.type) {
    case 'document-header':
      const docConfig = getDocumentTypeConfig(documentType);
      const headerLayout = content.layout || 'centered';

      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            backgroundColor: style.backgroundColor || '#ffffff',
            color: style.textColor || '#1e293b',
            padding: style.padding || '32px',
            borderRadius: style.borderRadius || '0px',
            borderBottom: style.borderBottom || '2px solid #e5e7eb',
            margin: style.margin || '0 0 32px 0'
          }}
          className="mb-8"
        >
          {/* Layout Selector */}
          <div className="absolute top-2 right-2 z-10">
            <Select value={headerLayout} onValueChange={(value) => updateBlockContent({ layout: value })}>
              <SelectTrigger className="w-40 text-xs">
                <SelectValue placeholder="Layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="centered">Centered</SelectItem>
                <SelectItem value="left-right">Left-Right</SelectItem>
                <SelectItem value="stacked">Stacked</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Use shared renderer with editable mode */}
          <DocumentHeaderBlock
            block={block}
            projectData={projectData}
            isEditable={true}
            renderEditableText={renderEditableText}
            onContentChange={updateBlockContent}
            documentType={documentType}
          />
        </EditableContainer>
      );

    case 'header':
      // Redirect legacy 'header' blocks to use DocumentHeaderBlock for document-type-aware rendering
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
          <DocumentHeaderBlock
            block={block}
            projectData={projectData}
            isEditable={true}
            renderEditableText={renderEditableText}
            onContentChange={updateBlockContent}
            documentType={documentType}
          />
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

    case 'editable-text-field':
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            padding: style.padding || '16px',
            margin: style.margin || '0 0 24px 0',
            backgroundColor: style.backgroundColor || '#f8fafc',
            borderRadius: style.borderRadius || '8px'
          }}
          className="mb-6"
        >
          <div className="space-y-3">
            <EditableText
              value={content.label || 'Enter your label'}
              onChange={(value) => updateBlockContent({ label: value })}
              className="text-sm font-medium text-muted-foreground"
              placeholder="Field label"
            />
            
            <div className="flex items-center gap-2 mb-2">
              <Button
                type="button"
                size="sm"
                variant={content.isBold ? "default" : "outline"}
                onClick={() => updateBlockContent({ isBold: !content.isBold })}
                className="gap-2"
              >
                <Type className="h-4 w-4" />
                {content.isBold ? 'Bold' : 'Regular'}
              </Button>
            </div>

            <Input
              value={content.value || ''}
              onChange={(e) => updateBlockContent({ value: e.target.value })}
              placeholder="Enter text here..."
              className={content.isBold ? 'font-bold' : 'font-normal'}
            />
          </div>
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
        </EditableContainer>
      );

    case 'terms-conditions': {
      // Convert legacy format (term1, term2, term3, term4) to array format
      const getTermsArray = (): string[] => {
        if (content.terms && Array.isArray(content.terms)) {
          return content.terms;
        }
        // Legacy format - convert to array
        const legacyTerms: string[] = [];
        if (content.term1) legacyTerms.push(content.term1);
        if (content.term2) legacyTerms.push(content.term2);
        if (content.term3) legacyTerms.push(content.term3);
        if (content.term4) legacyTerms.push(content.term4);
        // If no terms, provide defaults
        if (legacyTerms.length === 0) {
          return [
            "1. Payment Terms: 50% deposit required upon acceptance of this quote. Remaining balance due upon completion.",
            "2. Timeline: Project completion is estimated at 2-3 weeks from deposit receipt and final measurements.",
            "3. Warranty: All work comes with a 1-year warranty against defects in workmanship.",
            "4. Cancellation: This quote is valid for 30 days. Cancellation after work begins subject to materials and labor charges."
          ];
        }
        return legacyTerms;
      };

      const termsArray = getTermsArray();

      const handleTermChange = (index: number, value: string) => {
        const newTerms = [...termsArray];
        newTerms[index] = value;
        // Save as array format, clear legacy fields
        updateBlockContent({ 
          terms: newTerms,
          term1: undefined,
          term2: undefined,
          term3: undefined,
          term4: undefined
        });
      };

      const handleAddTerm = () => {
        const newTerms = [...termsArray, `${termsArray.length + 1}. New term...`];
        updateBlockContent({ 
          terms: newTerms,
          term1: undefined,
          term2: undefined,
          term3: undefined,
          term4: undefined
        });
      };

      const handleDeleteTerm = (index: number) => {
        const newTerms = termsArray.filter((_, i) => i !== index);
        updateBlockContent({ 
          terms: newTerms,
          term1: undefined,
          term2: undefined,
          term3: undefined,
          term4: undefined
        });
      };

      // System T&C - always pulls from Settings, not editable in template
      const systemTerms = userBusinessSettings?.general_terms_and_conditions;
      
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
          {systemTerms ? (
            <>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs mb-3">
                ✓ Using system-wide Terms & Conditions from Settings → System → Terms & Conditions
              </div>
              <div className="text-sm whitespace-pre-wrap text-gray-700">
                {systemTerms}
              </div>
            </>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
              ⚠ No system T&C configured. Add them in Settings → System → Terms & Conditions.
            </div>
          )}
        </EditableContainer>
      );
    }

    case 'terms-conditions-custom': {
      // Custom T&C - fully editable in template
      // Convert legacy term1-4 to terms array
      const customTermsArray = Array.isArray(content.terms) 
        ? content.terms 
        : [content.term1, content.term2, content.term3, content.term4].filter(Boolean);
      
      if (customTermsArray.length === 0) {
        customTermsArray.push('');
      }
      
      const handleCustomTermChange = (index: number, value: string) => {
        const newTerms = [...customTermsArray];
        newTerms[index] = value;
        updateBlockContent({ terms: newTerms });
      };
      
      const handleAddCustomTerm = () => {
        updateBlockContent({ terms: [...customTermsArray, ''] });
      };
      
      const handleDeleteCustomTerm = (index: number) => {
        const newTerms = customTermsArray.filter((_, i) => i !== index);
        updateBlockContent({ terms: newTerms.length > 0 ? newTerms : [''] });
      };
      
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
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 text-xs mb-3">
            ✎ Custom Terms - Edit below to add your own terms & conditions
          </div>
          <div className="text-sm space-y-3">
            {customTermsArray.map((term, index) => (
              <div key={index} className="flex items-start gap-2 group">
                <div className="flex-1">
                  <EditableText
                    value={term}
                    onChange={(value) => handleCustomTermChange(index, value)}
                    multiline
                    placeholder={`Term ${index + 1}...`}
                  />
                </div>
                <button
                  onClick={() => handleDeleteCustomTerm(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-destructive hover:bg-destructive/10 rounded mt-1"
                  title="Delete term"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleAddCustomTerm}
            className="mt-3 text-sm text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14"/><path d="M5 12h14"/>
            </svg>
            Add Term
          </button>
        </EditableContainer>
      );
    }

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
                  <div className="text-gray-600">
                    <EditableText
                      value={content.printNameLabel || "Print Name"}
                      onChange={(value) => updateBlockContent({ printNameLabel: value })}
                      className="inline"
                      placeholder="Print Name Label"
                    />
                    : {renderTokenValue('client_name')}
                  </div>
                  <div className="text-gray-600">
                    <EditableText
                      value={content.signatureDateLabel || "Date"}
                      onChange={(value) => updateBlockContent({ signatureDateLabel: value })}
                      className="inline"
                      placeholder="Date Label"
                    />
                    : _________________
                  </div>
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
                  <div className="text-gray-600">
                    <EditableText
                      value={content.printNameLabel || "Print Name"}
                      onChange={(value) => updateBlockContent({ printNameLabel: value })}
                      className="inline"
                      placeholder="Print Name Label"
                    />
                    : _________________
                  </div>
                  <div className="text-gray-600">
                    <EditableText
                      value={content.signatureDateLabel || "Date"}
                      onChange={(value) => updateBlockContent({ signatureDateLabel: value })}
                      className="inline"
                      placeholder="Date Label"
                    />
                    : _________________
                  </div>
                </div>
              </div>
            </div>
          </div>
        </EditableContainer>
      );

    case 'image-uploader':
      const [uploading, setUploading] = useState(false);
      const fileInputRef = useRef<HTMLInputElement>(null);
      
      const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const currentImages = content.images || [];
        const maxImages = content.maxImages || 5;
        
        if (currentImages.length >= maxImages) {
          toast.error(`Maximum ${maxImages} images allowed`);
          return;
        }

        setUploading(true);
        const newImages = [];

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          for (let i = 0; i < Math.min(files.length, maxImages - currentImages.length); i++) {
            const file = files[i];
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
              toast.error(`${file.name} is not an image file`);
              continue;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
              toast.error(`${file.name} is too large (max 5MB)`);
              continue;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;

            const { error: uploadError, data } = await supabase.storage
              .from('quote-images')
              .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('quote-images')
              .getPublicUrl(filePath);

            newImages.push({
              url: publicUrl,
              path: filePath,
              name: file.name,
              caption: ''
            });
          }

          updateBlockContent({
            images: [...currentImages, ...newImages]
          });
          
          toast.success(`${newImages.length} image(s) uploaded successfully`);
        } catch (error: any) {
          console.error('Upload error:', error);
          toast.error(error.message || 'Failed to upload images');
        } finally {
          setUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };

      const handleImageDelete = async (index: number) => {
        const imageToDelete = (content.images || [])[index];
        if (!imageToDelete) return;

        try {
          // Delete from storage
          const { error } = await supabase.storage
            .from('quote-images')
            .remove([imageToDelete.path]);

          if (error) throw error;

          const newImages = [...(content.images || [])];
          newImages.splice(index, 1);
          updateBlockContent({ images: newImages });
          
          toast.success('Image deleted');
        } catch (error: any) {
          console.error('Delete error:', error);
          toast.error('Failed to delete image');
        }
      };

      const handleCaptionChange = (index: number, caption: string) => {
        const newImages = [...(content.images || [])];
        newImages[index] = { ...newImages[index], caption };
        updateBlockContent({ images: newImages });
      };

      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            padding: style.padding || '24px',
            margin: style.margin || '24px 0',
            backgroundColor: style.backgroundColor || '#f8fafc',
            borderRadius: style.borderRadius || '8px'
          }}
        >
          <div className="space-y-4">
            <EditableText
              value={content.title || 'Image Gallery'}
              onChange={(value) => updateBlockContent({ title: value })}
              className="text-xl font-bold"
              placeholder="Section Title"
            />
            
            <EditableText
              value={content.caption || 'Add images to your proposal'}
              onChange={(value) => updateBlockContent({ caption: value })}
              className="text-sm text-muted-foreground"
              placeholder="Click to edit caption"
            />

            {/* Upload Button */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || (content.images || []).length >= (content.maxImages || 5)}
                className="gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Images ({(content.images || []).length}/{content.maxImages || 5})
                  </>
                )}
              </Button>
              <span className="text-xs text-muted-foreground">
                Max 5MB per image, JPG/PNG/WebP/GIF
              </span>
            </div>

            {/* Image Grid */}
            {(content.images || []).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {(content.images || []).map((image: any, index: number) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={image.url}
                        alt={image.caption || `Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleImageDelete(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <Input
                      value={image.caption || ''}
                      onChange={(e) => handleCaptionChange(index, e.target.value)}
                      placeholder="Add caption (optional)"
                      className="mt-2 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}

            {(content.images || []).length === 0 && (
              <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No images uploaded yet</p>
                <p className="text-xs mt-1">Click "Upload Images" to add photos to your proposal</p>
              </div>
            )}
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

    case 'footer': {
      const footerBusinessSettings = projectData?.businessSettings || {};
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={style}
          className="mb-6"
        >
          <div className="mt-8 pt-6 border-t border-gray-300 bg-muted/30 rounded-lg p-6">
            <div className="text-center space-y-3">
              <EditableText
                value={content.footerText || "Thank you for choosing us for your project!"}
                onChange={(value) => updateBlockContent({ footerText: value })}
                className="text-sm text-muted-foreground italic"
                placeholder="Footer message"
                multiline
              />
              
              <div className="flex items-center justify-center gap-2 my-3">
                <input
                  type="checkbox"
                  checked={content.showCompanyInfo !== false}
                  onChange={(e) => updateBlockContent({ showCompanyInfo: e.target.checked })}
                  className="rounded"
                />
                <label className="text-xs text-muted-foreground">Show company information</label>
              </div>

              {content.showCompanyInfo !== false && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold">{renderTokenValue('company_name')}</p>
                  {footerBusinessSettings?.address && (
                    <p>{renderTokenValue('company_address')}</p>
                  )}
                  <div className="flex justify-center gap-4 flex-wrap">
                    {footerBusinessSettings?.business_phone && (
                      <span>📞 {renderTokenValue('company_phone')}</span>
                    )}
                    {footerBusinessSettings?.business_email && (
                      <span>✉️ {renderTokenValue('company_email')}</span>
                    )}
                    {footerBusinessSettings?.website && (
                      <span>🌐 {footerBusinessSettings.website}</span>
                    )}
                  </div>
                </div>
              )}

              <EditableText
                value={content.additionalText || ""}
                onChange={(value) => updateBlockContent({ additionalText: value })}
                className="text-xs text-muted-foreground mt-2"
                placeholder="Additional footer text (optional)"
                multiline
              />
            </div>
          </div>
        </EditableContainer>
      );
    }

    // Invoice-specific blocks
    case 'payment-details':
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            padding: style.padding || '16px',
            margin: style.margin || '24px 0',
            backgroundColor: style.backgroundColor || '#eff6ff',
            borderColor: style.borderColor || '#dbeafe',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: style.borderRadius || '8px'
          }}
          className="mb-6"
        >
          <div className="space-y-3">
            <EditableText
              value={content.title || 'Payment Details'}
              onChange={(value) => updateBlockContent({ title: value })}
              className="text-lg font-semibold flex items-center gap-2"
              placeholder="Section Title"
            />
            <div className="text-sm text-gray-600">
              {renderTokenValue('company_bank_details') || 'Bank details not configured. Go to Settings → Business.'}
            </div>
            <EditableText
              value={content.paymentInstructions || 'Please transfer the amount to the bank account above.'}
              onChange={(value) => updateBlockContent({ paymentInstructions: value })}
              className="text-sm text-gray-500"
              placeholder="Add payment instructions..."
              multiline
            />
          </div>
        </EditableContainer>
      );

    case 'registration-footer':
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            padding: style.padding || '16px 0',
            margin: style.margin || '0',
            textAlign: 'center'
          }}
          className="mb-6"
        >
          <div className="text-center text-xs text-gray-500 py-4 border-t">
            {renderTokenValue('company_registration_footer') || 'Registration details not configured. Go to Settings → Business.'}
          </div>
        </EditableContainer>
      );

    case 'invoice-status': {
      const paymentStatus = projectData?.quote?.payment_status || 'unpaid';
      const amountPaid = projectData?.quote?.amount_paid || 0;
      const total = projectData?.quote?.total || projectData?.totals?.grandTotal || 0;
      const balanceDue = total - amountPaid;
      const dueDate = projectData?.quote?.due_date ? new Date(projectData.quote.due_date) : null;
      const isOverdue = dueDate && new Date() > dueDate && paymentStatus !== 'paid';
      const effectiveStatus = isOverdue ? 'overdue' : paymentStatus;
      
      const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
        paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'PAID' },
        partial: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'PARTIAL PAYMENT' },
        unpaid: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'UNPAID' },
        overdue: { bg: 'bg-red-100', text: 'text-red-800', label: 'OVERDUE' }
      };
      const config = statusConfig[effectiveStatus] || statusConfig.unpaid;
      
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            padding: style.padding || '16px',
            margin: style.margin || '24px 0',
            borderRadius: style.borderRadius || '8px'
          }}
          className="mb-6"
        >
          <div className="flex items-center justify-between p-4 rounded-lg border" style={{ backgroundColor: style.backgroundColor || '#f9fafb' }}>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                {config.label}
              </span>
              {effectiveStatus === 'overdue' && dueDate && (
                <span className="text-sm text-red-600">
                  Due: {format(dueDate, 'dd MMM yyyy')}
                </span>
              )}
            </div>
            <div className="text-right">
              {effectiveStatus === 'partial' && (
                <div className="text-sm text-gray-600 mb-1">
                  Paid: {renderTokenValue('currency_symbol')}{amountPaid.toFixed(2)}
                </div>
              )}
              {effectiveStatus !== 'paid' && (
                <div className="font-semibold">
                  Balance Due: {renderTokenValue('currency_symbol')}{balanceDue.toFixed(2)}
                </div>
              )}
            </div>
          </div>
        </EditableContainer>
      );
    }

    case 'late-payment-terms':
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            padding: style.padding || '12px',
            margin: style.margin || '16px 0',
            backgroundColor: style.backgroundColor || '#fef3c7',
            borderRadius: style.borderRadius || '6px'
          }}
          className="mb-6"
        >
          <div className="text-sm text-amber-800">
            <EditableText
              value={content.termsText || renderTokenValue('late_payment_terms') || 'Late payment may incur interest charges as per our payment terms.'}
              onChange={(value) => updateBlockContent({ termsText: value })}
              className="text-sm"
              placeholder="Late payment terms..."
              multiline
            />
          </div>
        </EditableContainer>
      );

    case 'tax-breakdown': {
      const businessSettings = projectData?.businessSettings || userBusinessSettings || {};
      const taxType = (businessSettings.tax_type || 'GST').toUpperCase();
      const taxRate = businessSettings.tax_rate || 10;
      const subtotal = projectData?.subtotal || 1250;
      const taxAmount = projectData?.taxAmount || (subtotal * taxRate / 100);
      const total = subtotal + taxAmount;
      const currency = projectData?.currency || businessSettings?.currency || 'AUD';
      
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            padding: style.padding || '16px',
            margin: style.margin || '16px 0',
            backgroundColor: style.backgroundColor || '#f9fafb',
            borderRadius: style.borderRadius || '8px'
          }}
          className="mb-6"
        >
          <div className="border rounded-lg p-4" style={{ borderColor: style.borderColor || '#e5e7eb' }}>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{taxType} Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal (excl. {taxType})</span>
                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{taxType} @ {taxRate}%</span>
                <span className="font-medium text-gray-900">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-gray-300 pt-2 mt-2">
                <span className="text-gray-800">Total (incl. {taxType})</span>
                <span className="text-gray-900">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </EditableContainer>
      );
    }

    case 'totals':
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            padding: style.padding || '16px',
            margin: style.margin || '24px 0',
            backgroundColor: style.backgroundColor || '#f9fafb',
            borderRadius: style.borderRadius || '8px'
          }}
          className="mb-6"
        >
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
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
        </EditableContainer>
      );

    // Work order-specific blocks
    case 'installation-details':
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            padding: style.padding || '16px',
            margin: style.margin || '24px 0',
            backgroundColor: style.backgroundColor || '#fffbeb',
            borderColor: style.borderColor || '#fef3c7',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: style.borderRadius || '8px'
          }}
          className="mb-6"
        >
          <EditableText
            value={content.title || 'Installation Details'}
            onChange={(value) => updateBlockContent({ title: value })}
            className="text-lg font-semibold mb-3"
            placeholder="Section Title"
          />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Installation Date:</span>
              <div className="font-medium">{renderTokenValue('due_date') || 'TBD'}</div>
            </div>
            <div>
              <span className="text-gray-500">Installer:</span>
              <EditableText
                value={content.installerName || 'TBD'}
                onChange={(value) => updateBlockContent({ installerName: value })}
                className="font-medium"
                placeholder="Installer name"
              />
            </div>
          </div>
        </EditableContainer>
      );

    case 'installer-signoff':
      return (
        <EditableContainer 
          onStyleChange={updateBlockStyle}
          currentStyles={{
            padding: style.padding || '16px',
            margin: style.margin || '24px 0',
            borderRadius: style.borderRadius || '8px'
          }}
          className="mb-6"
        >
          <div className="border rounded-lg p-4">
            <EditableText
              value={content.title || 'Completion Sign-off'}
              onChange={(value) => updateBlockContent({ title: value })}
              className="text-lg font-semibold mb-4"
              placeholder="Section Title"
            />
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="border-t border-gray-400 pt-2 mt-12">
                  <span className="text-sm font-medium">Installer Signature</span>
                </div>
              </div>
              <div>
                <div className="border-t border-gray-400 pt-2 mt-12">
                  <span className="text-sm font-medium">Client Confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </EditableContainer>
      );

    case 'privacy-policy': {
      const systemPrivacyPolicy = userBusinessSettings?.privacy_policy;
      
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
            value={content.title || 'Privacy Policy'}
            onChange={(value) => updateBlockContent({ title: value })}
            className="text-lg font-semibold mb-4 text-brand-primary"
            placeholder="Section Title"
          />
          {systemPrivacyPolicy ? (
            <>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs mb-3">
                ✓ Using system-wide Privacy Policy from Settings → System → Terms & Conditions
              </div>
              <div className="text-sm whitespace-pre-wrap text-gray-700">
                {systemPrivacyPolicy}
              </div>
            </>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
              ⚠ No Privacy Policy configured. Add it in Settings → System → Terms & Conditions.
            </div>
          )}
        </EditableContainer>
      );
    }

    case 'document-settings': {
      const bgColor = content.backgroundColor || '#ffffff';
      const presetColors = [
        { name: 'White', value: '#ffffff' },
        { name: 'Warm Sand', value: '#faf6f1' },
        { name: 'Cream', value: '#fdf8f0' },
        { name: 'Ivory', value: '#fffff0' },
        { name: 'Pearl', value: '#f5f5f0' },
        { name: 'Soft Grey', value: '#f5f5f5' },
        { name: 'Light Sage', value: '#f2f5f0' },
        { name: 'Pale Blue', value: '#f0f4f8' },
        { name: 'Blush', value: '#fdf2f2' },
        { name: 'Lavender', value: '#f5f0fa' },
      ];
      return (
        <div className="mb-4 p-3 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Background:</span>
            <div className="flex gap-1.5 flex-wrap">
              {presetColors.map((color) => (
                <button
                  key={color.value}
                  title={color.name}
                  onClick={() => updateBlockContent({ backgroundColor: color.value })}
                  className="w-6 h-6 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color.value,
                    borderColor: bgColor === color.value ? 'hsl(var(--primary))' : '#d1d5db',
                    boxShadow: bgColor === color.value ? '0 0 0 2px hsl(var(--primary) / 0.3)' : 'none'
                  }}
                />
              ))}
              <label className="w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground/40 cursor-pointer flex items-center justify-center hover:scale-110 transition-all overflow-hidden" title="Custom color">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => updateBlockContent({ backgroundColor: e.target.value })}
                  className="absolute opacity-0 w-0 h-0"
                />
                <span className="text-[8px] text-muted-foreground">+</span>
              </label>
            </div>
            {bgColor !== '#ffffff' && (
              <button
                onClick={() => updateBlockContent({ backgroundColor: '#ffffff' })}
                className="text-xs text-muted-foreground hover:text-foreground ml-1"
              >
                Clear✕
              </button>
            )}
          </div>
        </div>
      );
    }

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
  documentType?: string;
}

export const EditableLivePreview = ({ 
  blocks, 
  projectData, 
  onBlocksChange,
  containerStyles = {},
  onContainerStylesChange,
  documentType = 'quote'
}: EditableLivePreviewProps) => {
  const [showPageControls, setShowPageControls] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);

  // Get available blocks from document type config
  const allowedBlockTypes = getAvailableBlocks(documentType);

  const allBlocks = [
    // ===== UNIVERSAL BLOCKS =====
    { type: 'document-header', name: 'Document Header', icon: ImageIcon, description: 'Logo, company details, document title', badge: null, badgeColor: null },
    { type: 'header', name: 'Company Header', icon: Building2, description: 'Company info & logo', badge: null, badgeColor: null },
    { type: 'client-info', name: 'Client Details', icon: User, description: '"Bill To" section with client info', badge: null, badgeColor: null },
    { type: 'text', name: 'Text Block', icon: Type, description: 'Add formatted text', badge: null, badgeColor: null },
    { type: 'line-items', name: 'Line Items Table', icon: ShoppingCart, description: 'Products and services table', badge: null, badgeColor: null },
    { type: 'totals', name: 'Totals Section', icon: Calculator, description: 'Subtotal, tax, total', badge: null, badgeColor: null },
    { type: 'spacer', name: 'Spacer', icon: Space, description: 'Add vertical space', badge: null, badgeColor: null },
    { type: 'divider', name: 'Divider', icon: Minus, description: 'Section separator', badge: null, badgeColor: null },
    { type: 'footer', name: 'Footer', icon: FileText, description: 'Document footer', badge: null, badgeColor: null },
    
    // ===== QUOTE/PROPOSAL BLOCKS =====
    { type: 'terms-conditions', name: 'System Terms & Conditions', icon: FileText, description: 'Pulls T&C from Settings → System', badge: 'Quote', badgeColor: 'blue' },
    { type: 'terms-conditions-custom', name: 'Custom Terms & Conditions', icon: Edit3, description: 'Write your own editable terms', badge: 'Quote', badgeColor: 'blue' },
    { type: 'privacy-policy', name: 'Privacy Policy', icon: FileText, description: 'Pulls privacy policy from Settings', badge: 'Quote', badgeColor: 'blue' },
    { type: 'signature', name: 'Signature Block', icon: PenTool, description: 'Client acceptance signature', badge: 'Quote', badgeColor: 'blue' },
    { type: 'project-scope', name: 'Project Scope', icon: Calculator, description: 'What\'s included and excluded', badge: 'Quote', badgeColor: 'blue' },
    { type: 'payment-info', name: 'Payment Information', icon: DollarSign, description: 'Payment methods and schedule', badge: 'Quote', badgeColor: 'blue' },
    { type: 'editable-text-field', name: 'Editable Text Field', icon: Edit3, description: 'User input with bold/regular options', badge: 'Quote', badgeColor: 'blue' },
    { type: 'image-uploader', name: 'Image Uploader', icon: Upload, description: 'Upload images for proposals', badge: 'Quote', badgeColor: 'blue' },
    
    // ===== INVOICE BLOCKS =====
    { type: 'invoice-status', name: 'Payment Status', icon: DollarSign, description: 'Paid/Unpaid/Overdue status', badge: 'Invoice', badgeColor: 'green' },
    { type: 'tax-breakdown', name: 'Tax Breakdown', icon: Calculator, description: 'Detailed tax/VAT summary', badge: 'Invoice', badgeColor: 'green' },
    { type: 'payment-details', name: 'Bank/Payment Details', icon: CreditCard, description: 'Bank account and payment info', badge: 'Invoice', badgeColor: 'green' },
    { type: 'late-payment-terms', name: 'Late Payment Terms', icon: FileText, description: 'Interest and fee policies', badge: 'Invoice', badgeColor: 'green' },
    { type: 'registration-footer', name: 'Business Registration', icon: Building2, description: 'ABN/VAT/Tax registration', badge: 'Invoice', badgeColor: 'green' },
    
    // ===== WORK ORDER BLOCKS =====
    { type: 'installation-details', name: 'Installation Details', icon: Calendar, description: 'Install date and team info', badge: 'Work Order', badgeColor: 'amber' },
    { type: 'installer-signoff', name: 'Installer Sign-off', icon: PenTool, description: 'Completion confirmation', badge: 'Work Order', badgeColor: 'amber' },
  ];

  // Filter blocks based on document type
  const availableBlocks = allBlocks.filter(block => 
    allowedBlockTypes.includes(block.type) || 
    ['text', 'spacer', 'divider', 'header', 'client-info', 'editable-text-field'].includes(block.type)
  );

  const addBlock = (type: string) => {
    // Preserve scroll position
    const scrollContainer = document.querySelector('.overflow-auto');
    const scrollTop = scrollContainer?.scrollTop || 0;
    
    const newBlock = {
      id: `block_${Date.now()}`,
      type,
      content: getDefaultContentForType(type)
    };
    onBlocksChange([...blocks, newBlock]);
    setShowComponentLibrary(false);
    
    // Restore scroll position
    requestAnimationFrame(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollTop;
      }
    });
  };

  const removeBlock = (blockId: string) => {
    // Preserve scroll position
    const scrollContainer = document.querySelector('.overflow-auto');
    const scrollTop = scrollContainer?.scrollTop || 0;
    
    const newBlocks = blocks.filter(block => block.id !== blockId);
    onBlocksChange(newBlocks);
    
    // Restore scroll position
    requestAnimationFrame(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollTop;
      }
    });
  };

  const moveBlockUp = (index: number) => {
    if (index === 0) return; // Can't move first block up
    
    // Preserve scroll position
    const scrollContainer = document.querySelector('.overflow-auto');
    const scrollTop = scrollContainer?.scrollTop || 0;
    
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    onBlocksChange(newBlocks);
    
    // Restore scroll position
    requestAnimationFrame(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollTop;
      }
    });
  };

  const moveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return; // Can't move last block down
    
    // Preserve scroll position
    const scrollContainer = document.querySelector('.overflow-auto');
    const scrollTop = scrollContainer?.scrollTop || 0;
    
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    onBlocksChange(newBlocks);
    
    // Restore scroll position
    requestAnimationFrame(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollTop;
      }
    });
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
      case 'privacy-policy':
        return {
          title: 'Privacy Policy'
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
      case 'image-uploader':
        return {
          title: 'Image Gallery',
          caption: 'Add images to your proposal',
          images: [],
          maxImages: 5
        };
      case 'editable-text-field':
        return {
          label: 'Enter your label',
          value: '',
          isBold: false
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
      // Invoice-specific blocks
      case 'payment-details':
        return {
          title: 'Payment Details',
          paymentInstructions: 'Please transfer the amount to the bank account above.',
          style: {
            backgroundColor: '#eff6ff',
            borderColor: '#dbeafe',
            padding: '16px',
            borderRadius: '8px'
          }
        };
      case 'registration-footer':
        return {
          style: {
            padding: '16px 0',
            textAlign: 'center'
          }
        };
      case 'invoice-status':
        return {
          style: {
            backgroundColor: '#f9fafb',
            padding: '16px',
            borderRadius: '8px'
          }
        };
      case 'late-payment-terms':
        return {
          termsText: '',
          style: {
            backgroundColor: '#fef3c7',
            padding: '12px',
            borderRadius: '6px'
          }
        };
      case 'tax-breakdown':
        return {
          title: 'Tax Summary',
          style: {
            backgroundColor: '#f9fafb',
            borderColor: '#e5e7eb',
            padding: '16px',
            borderRadius: '8px'
          }
        };
      case 'totals':
        return {
          style: {
            backgroundColor: '#f9fafb',
            padding: '16px',
            borderRadius: '8px'
          }
        };
      // Work order-specific blocks
      case 'installation-details':
        return {
          title: 'Installation Details',
          installerName: '',
          style: {
            backgroundColor: '#fffbeb',
            borderColor: '#fef3c7',
            padding: '16px',
            borderRadius: '8px'
          }
        };
      case 'installer-signoff':
        return {
          title: 'Completion Sign-off',
          style: {
            padding: '16px',
            borderRadius: '8px'
          }
        };
      default:
        return {};
    }
  };

  const handleBlockUpdate = useCallback((blockId: string, updatedBlock: any) => {
    // Preserve scroll position
    const scrollContainer = document.querySelector('.overflow-auto');
    const scrollTop = scrollContainer?.scrollTop || 0;
    
    const newBlocks = blocks.map(block => 
      block.id === blockId ? updatedBlock : block
    );
    onBlocksChange(newBlocks);
    
    // Restore scroll position after state update
    requestAnimationFrame(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollTop;
      }
    });
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
      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-auto">
        <Button
          onClick={() => setShowComponentLibrary(true)}
          className="rounded-full w-14 h-14 shadow-2xl bg-primary hover:bg-primary/90 hover:scale-110 transition-all"
          size="lg"
          title="Add Block"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Component Library Modal */}
      {showComponentLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9998]">
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
                  <div className="flex items-start gap-3 w-full">
                    <blockType.icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{blockType.name}</span>
                        {blockType.badge && (
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded",
                            blockType.badgeColor === 'blue' && "bg-blue-100 text-blue-700",
                            blockType.badgeColor === 'green' && "bg-green-100 text-green-700",
                            blockType.badgeColor === 'amber' && "bg-amber-100 text-amber-700"
                          )}>
                            {blockType.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{blockType.description}</div>
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
              {/* Block Controls */}
              <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[100] flex gap-1 pointer-events-auto">
                {/* Move Up Button */}
                {index > 0 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => moveBlockUp(index)}
                    className="rounded-full w-8 h-8 p-0 shadow-lg"
                    title="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                )}
                {/* Move Down Button */}
                {index < blocks.length - 1 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => moveBlockDown(index)}
                    className="rounded-full w-8 h-8 p-0 shadow-lg"
                    title="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                )}
                {/* Delete Button */}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeBlock(block.id)}
                  className="rounded-full w-8 h-8 p-0 shadow-lg"
                  title="Delete block"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <EditableLivePreviewBlock 
                block={block} 
                projectData={projectData}
                onBlockUpdate={handleBlockUpdate}
                onBlockRemove={removeBlock}
                documentType={documentType}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditableLivePreview;