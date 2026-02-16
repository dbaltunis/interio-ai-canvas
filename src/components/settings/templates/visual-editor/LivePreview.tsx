import React, { Suspense, useState, useRef } from 'react';
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { formatCurrency, getCurrencySymbol } from "@/utils/formatCurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { InlinePaymentConfig } from "@/components/jobs/quotation/InlinePaymentConfig";
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
  Minus,
  Plus,
  Space,
  Info,
  CreditCard,
  CheckCircle2,
  SquareCheck
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SignatureCanvas } from './SignatureCanvas';
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { QuoteItemImage } from "@/components/quotes/QuoteItemImage";
import { ProductImageWithColorFallback } from "@/components/ui/ProductImageWithColorFallback";
import { QuoteItemImagePicker } from "@/components/quotes/QuoteItemImagePicker";
import { buildClientBreakdown } from "@/utils/quotes/buildClientBreakdown";
import { formatJobNumber } from "@/lib/format-job-number";
import { useQuoteCustomData } from "@/hooks/useQuoteCustomData";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { getRegistrationLabels } from '@/utils/businessRegistrationLabels';
import { t, getLocalizedTableHeaders, getLocalizedSectionTitles, getLocalizedTotalColumnHeader, getLocalizedTotalsLabels, type DocumentLanguage } from '@/utils/documentTranslations';
import { DocumentHeaderBlock, LineItemsBlock, TotalsBlock, PaymentDetailsBlock, RegistrationFooterBlock, InstallationDetailsBlock, InstallerSignoffBlock, InvoiceStatusBlock, LatePaymentTermsBlock, TaxBreakdownBlock } from './shared/BlockRenderer';
// Chunk rebuild: 2026-01-11T14:25
import { groupHardwareItems, filterMeaningfulHardwareItems } from '@/utils/quotes/groupHardwareItems';

import { lazyWithRetry } from '@/utils/lazyWithRetry';

// Lazy load the editable version with retry to avoid circular dependencies and reduce bundle size
const EditableLivePreview = lazyWithRetry(() => import('./EditableLivePreview'), "EditableLivePreview");

// Interactive Image Gallery Component
const ImageGalleryBlock = ({ content, style, isEditable, isPrintMode, quoteId, blockId, onDataChange }: any) => {
  const [galleryImages, setGalleryImages] = useState(content.images || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const maxImages = content.maxImages || 5;
    if (galleryImages.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    try {
      const newImages = await Promise.all(
        Array.from(files).slice(0, maxImages - galleryImages.length).map(async (file) => {
          // If quoteId and blockId provided, upload to Supabase
          if (quoteId && blockId && onDataChange) {
            return await onDataChange.uploadImage({ file, blockId });
          }
          // Fallback to base64 for preview mode
          return new Promise<{url: string; caption: string}>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                url: reader.result as string,
                caption: file.name
              });
            };
            reader.readAsDataURL(file);
          });
        })
      );
      
      const updatedImages = [...galleryImages, ...newImages];
      setGalleryImages(updatedImages);
      
      // Save to database if in quote mode
      if (quoteId && blockId && onDataChange) {
        setSaving(true);
        onDataChange.saveBlockData({ blockId, data: { images: updatedImages } });
        setSaving(false);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (indexToRemove: number) => {
    const imageToRemove = galleryImages[indexToRemove];
    
    // Delete from storage if URL is from Supabase
    if (quoteId && blockId && onDataChange && imageToRemove.url.includes('supabase')) {
      try {
        await onDataChange.deleteImage(imageToRemove.url);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    
    const updatedImages = galleryImages.filter((_: any, i: number) => i !== indexToRemove);
    setGalleryImages(updatedImages);
    
    // Save to database if in quote mode
    if (quoteId && blockId && onDataChange) {
      setSaving(true);
      onDataChange.saveBlockData({ blockId, data: { images: updatedImages } });
      setSaving(false);
    }
  };
  
  // Load saved data on mount
  React.useEffect(() => {
    if (quoteId && blockId && onDataChange?.customData) {
      const savedData = onDataChange.customData[blockId];
      if (savedData?.images) {
        setGalleryImages(savedData.images);
      }
    }
  }, [quoteId, blockId, onDataChange?.customData]);
  
  return (
    <div style={{ marginTop: '24px', marginBottom: '24px', backgroundColor: '#ffffff !important', padding: '16px' }}>
      {content.title && (
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#000 !important' }}>
          {content.title}
        </h3>
      )}
      {content.caption && (
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
          {content.caption}
        </p>
      )}
      
      {!isPrintMode && isEditable && (
        <div style={{ marginBottom: '16px' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || saving || galleryImages.length >= (content.maxImages || 5)}
            style={{ marginBottom: '8px' }}
          >
            {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Upload Images'}
          </Button>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
            {galleryImages.length}/{content.maxImages || 5} images
            {saving && <span className="ml-2 text-blue-600">• Auto-saving...</span>}
          </p>
        </div>
      )}
      
      {galleryImages.length === 0 ? (
        <div style={{ 
          border: '2px dashed #d1d5db', 
          borderRadius: '8px', 
          padding: '32px', 
          backgroundColor: '#f9fafb',
          textAlign: 'center'
        }}>
          <ImageIcon className="h-12 w-12 mx-auto mb-2" style={{ color: '#9ca3af' }} />
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>No images uploaded yet</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '16px'
        }}>
          {galleryImages.map((image: any, index: number) => (
            <div key={index} style={{ backgroundColor: '#f9fafb', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
              {!isPrintMode && (
                <button
                  onClick={() => removeImage(index)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    zIndex: 10
                  }}
                >
                  ×
                </button>
              )}
              <img
                src={image.url}
                alt={image.caption || `Image ${index + 1}`}
                style={{ 
                  width: '100%', 
                  height: '200px', 
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              {image.caption && (
                <p style={{ 
                  padding: '8px', 
                  fontSize: '12px', 
                  color: '#6b7280',
                  textAlign: 'center'
                }}>
                  {image.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Interactive Editable Text Field Component
const EditableTextField = ({ content, style, isEditable, isPrintMode, quoteId, blockId, onDataChange }: any) => {
  const [fieldValue, setFieldValue] = useState(content.value || '');
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Load saved data on mount
  React.useEffect(() => {
    if (quoteId && blockId && onDataChange?.customData) {
      const savedData = onDataChange.customData[blockId];
      if (savedData?.text !== undefined) {
        setFieldValue(savedData.text);
      }
    }
  }, [quoteId, blockId, onDataChange?.customData]);
  
  // Auto-save with debounce
  const handleTextChange = (newValue: string) => {
    setFieldValue(newValue);
    
    if (quoteId && blockId && onDataChange) {
      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set saving indicator
      setSaving(true);
      
      // Debounce save for 1 second
      saveTimeoutRef.current = setTimeout(() => {
        onDataChange.saveBlockData({ blockId, data: { text: newValue } });
        setSaving(false);
      }, 1000);
    }
  };
  
  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div className="mb-6" style={{ 
      padding: content.theme === 'curtain-professional' ? '16px 0' : (style.padding || '16px'),
      margin: content.theme === 'curtain-professional' ? '0 0 16px 0' : (style.margin || '0 0 24px 0'),
      backgroundColor: content.theme === 'curtain-professional' ? 'transparent' : (style.backgroundColor || '#f8fafc'),
      borderRadius: content.theme === 'curtain-professional' ? '0' : (style.borderRadius || '8px')
    }}>
      {content.label && (
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '500', 
          color: '#6b7280',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {content.label}
          {saving && <span style={{ fontSize: '12px', color: '#3b82f6' }}>Auto-saving...</span>}
        </div>
      )}
      {!isPrintMode && isEditable ? (
        <Textarea
          value={fieldValue}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Enter text here..."
          className="w-full"
          style={{ 
            fontSize: '16px',
            fontWeight: content.isBold ? '700' : '400',
            minHeight: '100px'
          }}
        />
      ) : (
        <div style={{ 
          fontSize: '16px',
          fontWeight: content.isBold ? '700' : '400',
          color: fieldValue ? '#000' : '#9ca3af'
        }}>
          {fieldValue || 'No text entered yet'}
        </div>
      )}
    </div>
  );
};

interface LivePreviewBlockProps {
  block: any;
  projectData?: any;
  isEditable?: boolean;
  isPrintMode?: boolean;
  documentType?: string;
  userBusinessSettings?: any;
  userPreferences?: any;
  showDetailedBreakdown?: boolean;
  showImages?: boolean;
  groupByRoom?: boolean;
  layout?: 'simple' | 'detailed';
  onSettingsChange?: (settings: { showDetailedBreakdown?: boolean; showImages?: boolean; groupByRoom?: boolean }) => void;
  quoteId?: string;
  onDataChange?: any;
  // Item exclusion props
  excludedItems?: string[];
  onToggleExclusion?: (itemId: string) => void;
  isExclusionEditMode?: boolean;
  // Image override props
  onItemImageChange?: (itemId: string, imageUrl: string | null) => void;
  isImageEditMode?: boolean;
}

const LivePreviewBlock = ({
  block,
  projectData,
  isEditable,
  isPrintMode = false,
  documentType = 'quote',
  userBusinessSettings,
  userPreferences,
  showDetailedBreakdown: propsShowDetailed,
  showImages: propsShowImages,
  groupByRoom: propsGroupByRoom,
  layout: propsLayout,
  onSettingsChange,
  quoteId,
  onDataChange,
  excludedItems = [],
  onToggleExclusion,
  isExclusionEditMode = false,
  onItemImageChange,
  isImageEditMode = false
}: LivePreviewBlockProps) => {
  const content = block.content || {};
  const style = content.style || {};
  
  // State for products block - use props if provided, otherwise use internal state
  const [internalShowDetailed, setInternalShowDetailed] = React.useState(
    content.showDetailed !== undefined ? content.showDetailed : false
  );
  const [internalGroupByRoom, setInternalGroupByRoom] = React.useState(
    content.groupByRoom !== undefined ? content.groupByRoom : false
  );
  const [internalShowImages, setInternalShowImages] = React.useState(
    content.showImages !== undefined ? content.showImages : false
  );
  
  // Use props if provided, otherwise use internal state
  const showDetailedProducts = propsShowDetailed !== undefined ? propsShowDetailed : internalShowDetailed;
  const groupByRoom = propsGroupByRoom !== undefined ? propsGroupByRoom : internalGroupByRoom;
  const showImages = propsShowImages !== undefined ? propsShowImages : internalShowImages;
  
  // Helper to get default currency from business settings
  const getDefaultCurrency = () => {
    try {
      const measurementUnits = userBusinessSettings?.measurement_units 
        ? (typeof userBusinessSettings.measurement_units === 'string' 
            ? JSON.parse(userBusinessSettings.measurement_units)
            : userBusinessSettings.measurement_units)
        : null;
      return measurementUnits?.currency || 'EUR';
    } catch {
      return 'EUR';
    }
  };
  
  // Helper function to convert user date format to date-fns format
  const convertToDateFnsFormat = (userFormat: string): string => {
    const formatMap: Record<string, string> = {
      'MM/dd/yyyy': 'MM/dd/yyyy',
      'dd/MM/yyyy': 'dd/MM/yyyy', 
      'yyyy-MM-dd': 'yyyy-MM-dd',
      'dd-MMM-yyyy': 'dd-MMM-yyyy',
    };
    return formatMap[userFormat] || 'MM/dd/yyyy';
  };

  // Get user's preferred timezone and date format
  const businessSettings = projectData?.businessSettings || userBusinessSettings || {};
  const userTimezone = userPreferences?.timezone || businessSettings?.timezone || 'UTC';
  const userDateFormat = convertToDateFnsFormat(userPreferences?.date_format || 'MM/dd/yyyy');
  
  // Trim and normalize block type to prevent matching issues
  // Convert underscores to hyphens for consistency (client_info -> client-info)
  const blockType = (block.type || '').toString().trim().toLowerCase().replace(/_/g, '-');
  
  // Handle document-settings block (metadata block - don't render)
  if (blockType === 'document-settings') {
    return null;
  }
  
  // DEPLOYMENT TEST - Force cache bust v2.0
  console.log('🚀 [LivePreview v2.0] DEPLOYED - Block rendering:', { 
    blockId: block.id,
    originalType: block.type,
    normalizedType: blockType,
    timestamp: new Date().toISOString()
  });


  const renderTokenValue = (token: string) => {
    // Use real project data or fallback to defaults
    const project = projectData?.project || {};
    const client = project.client || projectData?.client || {};
    // Use projectData businessSettings first, then userBusinessSettings as fallback
    const businessSettings = projectData?.businessSettings || userBusinessSettings || {};
    
    console.log('🔍 Client Data Debug:', {
      token,
      projectData: projectData,
      project: project,
      client: client,
      hasClient: !!client,
      clientKeys: Object.keys(client),
      clientName: client?.name,
      projectClientId: project?.client_id
    });
    
    // Helper to format bank details based on country
    const formatBankDetails = () => {
      const country = businessSettings.country || 'Australia';
      const parts: string[] = [];
      
      if (businessSettings.bank_name) parts.push(`Bank: ${businessSettings.bank_name}`);
      if (businessSettings.bank_account_name) parts.push(`Account Name: ${businessSettings.bank_account_name}`);
      
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
      
      return parts.join(' | ');
    };

    // Helper to format registration footer with country-aware labels
    const formatRegistrationFooter = () => {
      const country = businessSettings.country || 'Australia';
      const parts: string[] = [];
      
      // Get country-specific labels
      const labels = getRegistrationLabels(country);
      
      // Only show ABN for Australia (the only country that uses ABN)
      if (country === 'Australia' && businessSettings.abn) {
        parts.push(`ABN: ${businessSettings.abn}`);
      }
      
      // Registration number with country-specific label
      if (businessSettings.registration_number) {
        parts.push(`${labels.registrationLabel}: ${businessSettings.registration_number}`);
      }
      
      // Tax number with country-specific label
      if (businessSettings.tax_number) {
        parts.push(`${labels.taxLabel}: ${businessSettings.tax_number}`);
      }
      return parts.join(' | ');
    };

    const tokens = {
      // Company information from business settings - no hardcoded fallbacks
      company_name: businessSettings.company_name || '',
      company_legal_name: businessSettings.legal_name || '',
      company_trading_name: businessSettings.trading_name || businessSettings.company_name || '',
      company_address: businessSettings.address ? 
        `${businessSettings.address}${businessSettings.city ? ', ' + businessSettings.city : ''}${businessSettings.state ? ', ' + businessSettings.state : ''}${businessSettings.zip_code ? ' ' + businessSettings.zip_code : ''}` 
        : '',
      company_phone: businessSettings.business_phone || '',
      company_email: businessSettings.business_email || '',
      company_website: businessSettings.website || '',
      company_abn: businessSettings.abn || '',
      company_registration_number: businessSettings.registration_number || '',
      company_tax_number: businessSettings.tax_number || '',
      company_organization_type: businessSettings.organization_type || '',
      company_country: businessSettings.country || '',
      // Bank details tokens
      company_bank_name: businessSettings.bank_name || '',
      company_bank_account_name: businessSettings.bank_account_name || '',
      company_bank_details: formatBankDetails(),
      company_registration_footer: formatRegistrationFooter(),
      
      // Client information from project
      client_name: client.name || '',
      client_email: client.email || '', 
      client_phone: client.phone || '',
      client_address: client.address ? 
        `${client.address}${client.city ? ', ' + client.city : ''}${client.state ? ', ' + client.state : ''}${client.zip_code ? ' ' + client.zip_code : ''}` 
        : '',
      client_company: client.company_name || '',
      client_type: client.client_type || 'B2C',
      client_abn: client.abn || '',
      client_business_email: client.business_email || '',
      client_business_phone: client.business_phone || '',
      
      // Project information
      quote_number: formatJobNumber(project.job_number || project.quote_number) || 'QT-2024-001',
      job_number: formatJobNumber(project.job_number || project.quote_number) || 'JOB-2024-001',
      project_name: project.name || 'Window Treatment Project',
      project_id: project.id || '',
      
      // Dates - formatted using user's timezone and date format preferences
      date: project.start_date 
        ? formatInTimeZone(new Date(project.start_date), userTimezone, userDateFormat)
        : (project.created_at 
          ? formatInTimeZone(new Date(project.created_at), userTimezone, userDateFormat)
          : formatInTimeZone(new Date(), userTimezone, userDateFormat)),
      quote_date: project.created_at 
        ? formatInTimeZone(new Date(project.created_at), userTimezone, userDateFormat)
        : formatInTimeZone(new Date(), userTimezone, userDateFormat),
      start_date: project.start_date 
        ? formatInTimeZone(new Date(project.start_date), userTimezone, userDateFormat)
        : '',
      due_date: project.due_date 
        ? formatInTimeZone(new Date(project.due_date), userTimezone, userDateFormat)
        : '',
      valid_until: project.due_date 
        ? formatInTimeZone(new Date(project.due_date), userTimezone, userDateFormat)
        : (projectData?.validUntil 
          ? formatInTimeZone(new Date(projectData.validUntil), userTimezone, userDateFormat)
          : formatInTimeZone(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), userTimezone, userDateFormat)),
      
      // Financial information with currency support
      currency: projectData?.currency || getDefaultCurrency(),
      currency_code: projectData?.currency || getDefaultCurrency(),
      currency_symbol: (() => {
        const curr = projectData?.currency || getDefaultCurrency();
        // Use centralized getCurrencySymbol from formatCurrency utility
        const symbols: Record<string, string> = {
          'GBP': '£',
          'EUR': '€',
          'AUD': 'A$',
          'NZD': 'NZ$',
          'USD': '$',
          'ZAR': 'R',
          'CAD': 'C$',
          'JPY': '¥',
          'INR': '₹'
        };
        return symbols[curr] || '$';
      })(),
      basetotal: (() => {
        const curr = projectData?.currency || getDefaultCurrency();
        if (!projectData?.subtotal) return formatCurrency(0, curr);
        const baseAmount = parseFloat(projectData.subtotal) + (!projectData?.discount?.amount ? 0 : parseFloat(projectData.discount.amount));
        return formatCurrency(baseAmount, curr);
      })(),
      subtotal: (() => {
        const curr = projectData?.currency || getDefaultCurrency();
        if (!projectData?.subtotal) return formatCurrency(0, curr);
        return formatCurrency(projectData.subtotal, curr);
      })(),
      discount: (() => {
        const curr = projectData?.currency || getDefaultCurrency();
        if (!projectData?.discount?.amount) return formatCurrency(0, curr);
        return formatCurrency(projectData.discount.amount, curr);
      })(),
      tax_amount: (() => {
        const curr = projectData?.currency || getDefaultCurrency();
        if (!projectData?.taxAmount) return formatCurrency(0, curr);
        return formatCurrency(projectData.taxAmount, curr);
      })(),
      tax_rate: projectData?.taxRate ? `${(projectData.taxRate * 100).toFixed(1)}%` : '0%',
      total: (() => {
        const curr = projectData?.currency || getDefaultCurrency();
        if (!projectData?.total) return formatCurrency(0, curr);
        return formatCurrency(projectData.total, curr);
      })(),
      
      // Additional project details
      terms: projectData?.terms || 'Payment due within 30 days of invoice date.',
      notes: projectData?.notes || '',
      project_status: project.status || 'draft'
    };
    return tokens[token as keyof typeof tokens] !== undefined && tokens[token as keyof typeof tokens] !== '' 
      ? tokens[token as keyof typeof tokens] 
      : '';
  };

  const replaceTokens = (text: string) => {
    if (!text) return '';
    return text.replace(/\{\{(\w+)\}\}/g, (match, token) => renderTokenValue(token));
  };

  switch (blockType) {
    case 'document-header':
    case 'quote-header':
      // Use shared renderer for document headers to ensure canvas/app consistency
      return (
        <DocumentHeaderBlock
          block={block}
          projectData={projectData}
          userTimezone={userTimezone}
          userDateFormat={userDateFormat}
          isPrintMode={isPrintMode}
          isEditable={false}
          documentType={documentType}
        />
      );

    case 'header':
      // Redirect legacy 'header' blocks to use DocumentHeaderBlock for document-type-aware rendering
      return (
        <DocumentHeaderBlock
          block={block}
          projectData={projectData}
          userTimezone={userTimezone}
          userDateFormat={userDateFormat}
          isPrintMode={isPrintMode}
          isEditable={false}
          documentType={documentType}
        />
      );

    case 'client-info':
    case 'client':
    case 'bill-to':
      const clientName = renderTokenValue('client_name');
      const clientCompany = renderTokenValue('client_company');
      const clientEmail = renderTokenValue('client_email');
      const clientPhone = renderTokenValue('client_phone');
      const clientAddress = renderTokenValue('client_address');
      const clientAbn = renderTokenValue('client_abn');
      const clientBusinessEmail = renderTokenValue('client_business_email');
      const clientBusinessPhone = renderTokenValue('client_business_phone');
      const clientType = renderTokenValue('client_type');
      
      console.log('📋 Client Info Block - Rendered Values:', {
        clientName,
        clientCompany,
        clientEmail,
        clientPhone,
        clientAddress,
        clientAbn,
        clientBusinessEmail,
        clientBusinessPhone,
        clientType,
        showCompany: content.showCompany,
        showClientEmail: content.showClientEmail,
        showClientPhone: content.showClientPhone,
        showClientAddress: content.showClientAddress
      });
      
      const isB2B = clientType === 'B2B';
      
      return (
        <div className="mb-6">
          <h3 className="flex items-center gap-2" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
            <User className="h-5 w-5" />
            {content.title || 'Bill To:'}
          </h3>
          <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
            <div className="space-y-1">
              {clientName && <p style={{ fontWeight: '500', color: '#000' }}>{clientName}</p>}
              {clientCompany && (
                <p style={{ color: '#4b5563', fontWeight: '500' }}>{clientCompany}</p>
              )}
              {isB2B && clientAbn && (
                <p style={{ color: '#4b5563', fontSize: '14px' }}>ABN: {clientAbn}</p>
              )}
              {isB2B && clientBusinessEmail && (
                <p style={{ color: '#4b5563', fontSize: '14px' }}>Business: {clientBusinessEmail}</p>
              )}
              {isB2B && clientBusinessPhone && (
                <p style={{ color: '#4b5563', fontSize: '14px' }}>Business Phone: {clientBusinessPhone}</p>
              )}
              {clientEmail && (
                <p style={{ color: '#4b5563' }}>{isB2B ? 'Contact: ' : ''}{clientEmail}</p>
              )}
              {clientPhone && (
                <p style={{ color: '#4b5563' }}>{isB2B ? 'Contact Phone: ' : 'Phone: '}{clientPhone}</p>
              )}
              {clientAddress && (
                <p style={{ color: '#4b5563' }}>{clientAddress}</p>
              )}
            </div>
          </div>
        </div>
      );

    case 'products':
    case 'product':
    case 'line-items':
    case 'items':
      // Get real data
      const workshopItems = projectData?.workshopItems || [];
      const surfaces = projectData?.surfaces || [];
      const rooms = projectData?.rooms || [];
      const windowSummaries = projectData?.windowSummaries?.windows || [];
      
      // Get layout mode - prioritize prop, then content, then default to 'detailed'
      const layoutMode = propsLayout || content.layout || 'detailed';
      const isSimpleLayout = layoutMode === 'simple';
      
      // For simple layout, we don't show the detailed breakdown
      const effectiveShowDetailed = isSimpleLayout ? false : showDetailedProducts;
      
      console.log('[PRODUCTS BLOCK] Layout mode:', {
        layoutMode,
        isSimpleLayout,
        effectiveShowDetailed,
        originalShowDetailed: showDetailedProducts
      });
      
      // Use projectData.items as PRIMARY source (this is the data from treatments)
      let projectItems = [];
      
      console.log('[PRODUCTS BLOCK] Data sources:', {
        hasItems: !!(projectData?.items && projectData.items.length > 0),
        itemsCount: projectData?.items?.length || 0,
        items: projectData?.items,
        itemsSample: projectData?.items?.[0],
        hasTreatments: !!(projectData?.treatments && projectData.treatments.length > 0),
        treatmentsCount: projectData?.treatments?.length || 0,
        treatmentsSample: projectData?.treatments?.[0],
        workshopItemsCount: workshopItems.length,
        surfacesCount: surfaces.length
      });
      
      if (projectData?.items && projectData.items.length > 0) {
        projectItems = projectData.items.filter((item: any) => !item.isHeader && item.type !== 'room_header');
        console.log('[PRODUCTS BLOCK] Using projectData.items:', projectItems);
      } else if (projectData?.treatments && projectData.treatments.length > 0) {
        // Fallback to treatments if items not present
        projectItems = projectData.treatments.filter((item: any) => !item.isHeader && item.type !== 'room_header');
        console.log('[PRODUCTS BLOCK] Using projectData.treatments:', projectItems);
      } else if (workshopItems.length > 0 || surfaces.length > 0) {
        const surfaceMap = new Map(surfaces.map((s: any) => [s.id, s]));
        projectItems = [...workshopItems];
        
        const workshopSurfaceIds = new Set(workshopItems.map((wi: any) => wi.window_id).filter(Boolean));
        surfaces.forEach((surface: any) => {
          if (!workshopSurfaceIds.has(surface.id)) {
            projectItems.push({
              id: surface.id,
              surface_name: surface.name,
              window_number: surface.name,
              room_name: 'Pending Configuration',
              description: 'No treatment configured yet',
              total_cost: 0,
              unit_price: 0,
              total: 0,
              quantity: 1,
              notes: `Window: ${surface.width || 0}cm x ${surface.height || 0}cm`,
              _isPending: true
            });
          }
        });
        console.log('[PRODUCTS BLOCK] Using workshop/surfaces fallback:', projectItems);
      }
      const hasRealData = projectItems.length > 0;

      const getItemizedBreakdown = (item: any) => {
        const breakdown: any[] = [];
        
        console.log('[BREAKDOWN] Processing item:', {
          name: item.name,
          has_children: !!item.children,
          children_count: item.children?.length || 0,
          sample_child: item.children?.[0]
        });
        
        // Children array has the breakdown with PRICES
        if (item.children && Array.isArray(item.children) && item.children.length > 0) {
          item.children.forEach((child: any, idx: number) => {
            // Skip if this is not a real breakdown item
            if (!child.isChild) return;
            
            let displayName = child.name || 'Item';
            let displayDescription = child.description || '';
            
            // ACCESSORY HANDLING: Detect hardware_accessory category for special formatting
            const isAccessory = child.category === 'hardware_accessory';
            const accessoryQuantity = child.quantity || 1;
            const accessoryUnitPrice = child.unit_price || 0;
            const pricingDetails = child.pricingDetails || '';
            
            if (isAccessory) {
              // For accessories, format description with quantity and pricing
              if (accessoryQuantity > 1 && accessoryUnitPrice > 0) {
                const currSymbol = getCurrencySymbol(projectData?.currency || getDefaultCurrency());
                displayDescription = `${accessoryQuantity} × ${currSymbol}${accessoryUnitPrice.toFixed(2)}`;
                if (pricingDetails) {
                  displayDescription += ` (${pricingDetails})`;
                }
              }
            } else if (child.category === 'option' || child.category === 'options') {
              // If this is an option, parse the name format "key: value"
              const colonIndex = displayName.indexOf(':');
              if (colonIndex > 0 && colonIndex < displayName.length - 1) {
                // Split "vane_width: 89mm" into name and description
                const optionKey = displayName.substring(0, colonIndex).trim();
                const optionValue = displayName.substring(colonIndex + 1).trim();
                
                // Format key: capitalize and replace underscores
                displayName = optionKey
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c: string) => c.toUpperCase());
                
                displayDescription = optionValue;
              }
            }
            
            // CRITICAL: For fabric/material rows, use ONLY fabric/material specific images
            // DO NOT inherit template images for fabric rows
            let childImageUrl = child.image_url;
            if ((child.category === 'fabric' || child.category === 'material') && !childImageUrl) {
              // Only use fabric-specific image, not template image
              childImageUrl = item.fabric_details?.image_url || item.material_details?.image_url || null;
            }
            
            breakdown.push({
              id: child.id || `${item.id}-child-${idx}`,
              name: isAccessory ? `└ ${displayName}` : displayName, // Indent accessory names
              category: child.category || 'Component',
              description: displayDescription,
              quantity: accessoryQuantity,
              unit: child.unit || '',
              unit_price: accessoryUnitPrice,
              total_cost: child.total || 0,
              image_url: childImageUrl,
              color: child.color,
              isAccessory: isAccessory // Flag for styling
            });
            
            console.log('[BREAKDOWN] Added child:', {
              name: displayName,
              description: displayDescription,
              unit_price: child.unit_price,
              total: child.total,
              quantity: child.quantity,
              isAccessory
            });
          });
        }
        
        // Apply smart grouping to merge related options (e.g., "Headrail Selection" + "Headrail Selection Colour")
        const groupedBreakdown = groupRelatedOptionsInBreakdown(breakdown);
        
        // Apply hardware grouping - consolidate hardware items into a single group
        const { hardwareGroup, otherItems } = groupHardwareItems(groupedBreakdown);
        
        if (hardwareGroup && hardwareGroup.items.length > 0) {
          // Filter out meaningless ₹0 category selections (e.g., "Hardware Type: Rod")
          const meaningfulHardware = filterMeaningfulHardwareItems(hardwareGroup.items);
          
          if (meaningfulHardware.length > 0) {
            // Create a hardware group summary row with image from option (NOT hardcoded emoji)
            const hardwareSummary = {
              id: hardwareGroup.id,
              name: hardwareGroup.name,  // Dynamic: "Track & Hardware", "Rod & Hardware", etc.
              image_url: hardwareGroup.image_url,  // Option's image (if configured)
              category: 'hardware_group',
              description: `${meaningfulHardware.length} item${meaningfulHardware.length > 1 ? 's' : ''}`,
              quantity: 1,
              unit: '',
              unit_price: hardwareGroup.total,
              total_cost: hardwareGroup.total,
              isHardwareGroup: true,
              hardwareItems: meaningfulHardware
            };
            
            console.log('[BREAKDOWN] Hardware grouped:', {
              item_name: item.name,
              hardware_name: hardwareGroup.name,
              hardware_image: hardwareGroup.image_url,
              hardware_total: hardwareGroup.total,
              hardware_items: meaningfulHardware.map((h: any) => ({ name: h.name, total: h.total_cost })),
              other_items: otherItems.length
            });
            
            return [hardwareSummary, ...otherItems];
          }
        }
        
        console.log('[BREAKDOWN] Final breakdown after grouping:', {
          item_name: item.name,
          original_count: breakdown.length,
          grouped_count: groupedBreakdown.length,
          breakdown_items: groupedBreakdown.map((b: any) => ({ name: b.name, desc: b.description, total: b.total_cost, color: b.color }))
        });
        
        return groupedBreakdown;
      };
      
      // Smart grouping function to merge related options
      const groupRelatedOptionsInBreakdown = (items: any[]) => {
        if (!items || items.length === 0) return [];
        
        // UNIVERSAL GROUPING: Apply to ALL items regardless of category (options, lining, hardware, etc.)
        // Any items following parent-child naming pattern will be grouped
        
        // Extract type key from name (e.g., "Lining Types: Blockout Lining" → "Lining Types")
        // This ensures we match on the TYPE, not the selected VALUE
        const extractTypeKey = (name: string): string => {
          if (!name) return '';
          const colonIndex = name.indexOf(':');
          if (colonIndex > 0) {
            return name.substring(0, colonIndex).trim();
          }
          return name; // No colon, use full name
        };
        
        // Normalize a name for matching (lowercase, replace spaces/dashes with underscores, collapse multiple underscores)
        const normalizeKey = (name: string) => {
          return (name || '')
            .toLowerCase()
            .replace(/[\s\-]+/g, '_')           // Replace spaces AND dashes with underscore
            .replace(/[^a-z0-9_]/g, '')         // Remove other special chars
            .replace(/_+/g, '_')                 // Collapse multiple underscores to single
            .replace(/^_|_$/g, '');              // Trim leading/trailing underscores
        };
        
        const parentMap = new Map<string, any>();
        const childMap = new Map<string, { parent: string; item: any }>();
        // Common child suffixes (MUST include both singular AND plural forms)
        const childSuffixes = [
          '_colour', '_colours', '_color', '_colors',     // Color variations
          '_size', '_sizes',                               // Size variations
          '_style', '_styles',                             // Style variations
          '_finish', '_finishes',                          // Finish variations
          '_material', '_materials',                       // Material variations
          '_track', '_tracks',                             // Hardware tracks
          '_rod', '_rods',                                 // Hardware rods
          '_width', '_length', '_height',                  // Dimension options
          '_chain', '_chains',                             // Chain side options
          '_slat', '_slats',                               // Slat options
          '_vane', '_vanes',                               // Vane options
          '_louvre', '_louvres',                           // Louvre options
        ];
        // NOTE: Removed _type/_types, _option/_options, _control/_controls, _mount/_mounts
        // because these are PARENT category name patterns (e.g., "Lining Types", "Mount Type"), NOT child indicators
        
        // Identify parent-child relationships
        items.forEach(item => {
          // Extract type key before colon, then normalize
          const typeKey = extractTypeKey(item.name || '');
          const normalizedName = normalizeKey(typeKey);
          let isChild = false;
          
          for (const suffix of childSuffixes) {
            if (normalizedName.endsWith(suffix)) {
              const parentKey = normalizedName.slice(0, -suffix.length);
              childMap.set(normalizedName, { parent: parentKey, item });
              isChild = true;
              break;
            }
          }
          
          if (!isChild) {
            parentMap.set(normalizedName, item);
          }
        });
        
        // Merge children into parents
        const result: any[] = [];
        const processedParents = new Set<string>();
        
        parentMap.forEach((parentItem, parentKey) => {
          if (processedParents.has(parentKey)) return;
          processedParents.add(parentKey);
          
          const children: { suffix: string; item: any }[] = [];
          childMap.forEach((childData, childKey) => {
            if (childData.parent === parentKey) {
              const suffix = childKey.slice(parentKey.length + 1);
              children.push({ suffix, item: childData.item });
            }
          });
          
          if (children.length === 0) {
            result.push(parentItem);
          } else {
            // Format: "STANDARD HEADRAIL; colour: dark" (parent value; child suffix: child value)
            let mergedDescription = parentItem.description || '';
            let mergedPrice = Number(parentItem.total_cost) || 0;
            
            children.forEach(({ suffix, item: childItem }) => {
              const formattedSuffix = suffix.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
              
              // Get ONLY the child's actual value, not its full name
              let childValue = childItem.description || '';
              
              // If child value contains the parent name or suffix name, extract just the value
              if (childValue.toLowerCase().includes(suffix.replace(/_/g, ' '))) {
                const colonIndex = childValue.lastIndexOf(':');
                if (colonIndex > -1) {
                  childValue = childValue.substring(colonIndex + 1).trim();
                }
              }
              
              if (!childValue) {
                childValue = childItem.name || '';
              }
              
              if (childValue) {
                // Use semicolon separator for cleaner look
                mergedDescription += mergedDescription ? `; ${formattedSuffix}: ${childValue}` : `${formattedSuffix}: ${childValue}`;
              }
              mergedPrice += Number(childItem.total_cost) || 0;
            });
            
            result.push({ ...parentItem, description: mergedDescription, total_cost: mergedPrice });
          }
        });
        
        // Add orphan children
        childMap.forEach((childData) => {
          if (!parentMap.has(childData.parent)) {
            result.push(childData.item);
          }
        });
        
        return result;
      };
      
      console.log('[PRODUCTS BLOCK] Rendering products:', {
        projectItemsCount: projectItems.length,
        windowSummariesCount: windowSummaries.length,
        rooms: rooms.map((r: any) => r.name),
        groupByRoom,
        showDetailedProducts: effectiveShowDetailed,
        layoutMode,
        isSimpleLayout,
        showImages,
        sampleItemChildren: projectItems[0]?.children?.map((c: any) => ({
          name: c.name,
          unit_price: c.unit_price,
          total: c.total
        }))
      });

      // Separate service/hardware items from regular products
      const isServiceItem = (item: any) => {
        const type = (item.treatment_type || item.name || '').toLowerCase();
        return type.includes('installation') || type.includes('measurement') || 
               type.includes('service') || item.category === 'service';
      };
      const isHardwareOnlyItem = (item: any) => {
        return item.category === 'hardware' && !item.treatment_type;
      };
      const regularItems = projectItems.filter((i: any) => !isServiceItem(i) && !isHardwareOnlyItem(i));
      const serviceHardwareItems = projectItems.filter((i: any) => isServiceItem(i) || isHardwareOnlyItem(i));

      // Group regular items by room if enabled
      const groupedItems = groupByRoom && hasRealData ? 
        regularItems.reduce((acc: any, item: any) => {
          const room = item.room_name || item.location || 'Unassigned Room';
          if (!acc[room]) acc[room] = [];
          acc[room].push(item);
          return acc;
        }, {}) : 
        { 'All Items': regularItems };

      // Get localization settings
      const docBusinessSettings = projectData?.businessSettings || {};
      const lang = (docBusinessSettings?.document_language as DocumentLanguage) || 'en';
      const pricingSettings = docBusinessSettings.pricing_settings || {};
      const taxInclusive = pricingSettings.tax_inclusive || false;
      const taxType = (docBusinessSettings.tax_type || 'VAT').toUpperCase();
      const tableHeaders = getLocalizedTableHeaders(lang);
      const sectionTitle = getLocalizedSectionTitles(documentType, lang);
      const totalColumnHeader = getLocalizedTotalColumnHeader(taxType, taxInclusive, lang);

      // ============= CURTAIN-PROFESSIONAL THEMED TABLE =============
      if (content.theme === 'curtain-professional') {
        const currencyCode = projectData?.currency || getDefaultCurrency();
        const colCount = 5;

        // Only top-level service items go to the bottom section (no hardware)
        const serviceOnlyItems = serviceHardwareItems.filter((i: any) => isServiceItem(i));

        return (
          <div className="mb-4 products-section" style={{ padding: '0', margin: '0' }}>
            <div style={{ overflow: 'visible', width: '100%' }}>
              <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%' }}>
                <colgroup>
                  <col style={{ width: '18%' }} />
                  <col style={{ width: 'auto' }} />
                  <col style={{ width: '50px' }} />
                  <col style={{ width: '90px' }} />
                  <col style={{ width: '100px' }} />
                </colgroup>
                <thead>
                  <tr style={{ backgroundColor: '#8b7355' }}>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '12px', fontWeight: '600', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Room / Window</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '12px', fontWeight: '600', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Details</th>
                    <th style={{ textAlign: 'center', padding: '10px 8px', fontSize: '12px', fontWeight: '600', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: '12px', fontWeight: '600', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit Price</th>
                    <th style={{ textAlign: 'right', padding: '10px 8px', fontSize: '12px', fontWeight: '600', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {!hasRealData && (
                    <tr>
                      <td colSpan={colCount} style={{ padding: '20px', textAlign: 'center', color: '#8b7355', fontStyle: 'italic', borderBottom: '1px solid #d4c5b0' }}>
                        No items yet. Add treatments to your project.
                      </td>
                    </tr>
                  )}
                  {Object.entries(groupedItems).map(([roomName, items]: [string, any]) => {
                    const visibleItems = (!isExclusionEditMode && excludedItems.length > 0)
                      ? (items as any[]).filter((item: any) => !excludedItems.includes(item.id))
                      : (items as any[]);
                    if (visibleItems.length === 0 && !isExclusionEditMode) return null;
                    const roomSubtotal = visibleItems.reduce((sum: number, item: any) => sum + (item.total_cost || item.total || 0), 0);
                    
                    return (
                      <React.Fragment key={roomName}>
                        {groupByRoom && hasRealData && (
                          <tr style={{ backgroundColor: '#f0ebe3' }}>
                            <td colSpan={colCount - 1} style={{ padding: '10px 8px', fontSize: '13px', fontWeight: '700', color: '#3d2e1f', borderBottom: '1px solid #d4c5b0' }}>
                              {roomName}
                            </td>
                            <td style={{ padding: '10px 8px', fontSize: '13px', fontWeight: '700', color: '#3d2e1f', borderBottom: '1px solid #d4c5b0', textAlign: 'right' }}>
                              {formatCurrency(roomSubtotal, currencyCode)}
                            </td>
                          </tr>
                        )}
                        {(isExclusionEditMode ? (items as any[]) : visibleItems).map((item: any, itemIndex: number) => {
                          const fullBreakdown = getItemizedBreakdown(item);
                          const nonHardwareBreakdown = fullBreakdown.filter((b: any) => !b.isHardwareGroup && b.category !== 'hardware' && b.category !== 'hardware_accessory');
                          const hardwareBreakdown = fullBreakdown.filter((b: any) => b.isHardwareGroup || b.category === 'hardware' || b.category === 'hardware_accessory');
                          const isItemExcluded = excludedItems.includes(item.id);
                          const itemImageUrl = item.image_url_override || item.image_url;
                          
                          return (
                            <React.Fragment key={`curtain-item-${roomName}-${itemIndex}`}>
                              <tr style={{ borderBottom: '1px solid #d4c5b0', opacity: isItemExcluded ? 0.5 : 1 }}>
                                {/* Room/Window name + Image below */}
                                <td style={{ padding: '8px', fontSize: '13px', fontWeight: '500', color: '#3d2e1f', verticalAlign: 'top' }}>
                                  <div style={{ fontWeight: '600', marginBottom: '6px' }}>
                                    {item.surface_name || item.window_number || item.name || 'Window'}
                                  </div>
                                  {showImages && itemImageUrl ? (
                                    <img src={itemImageUrl} alt={item.name || 'Product'} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #d4c5b0' }} />
                                  ) : showImages && !isPrintMode && isImageEditMode && onItemImageChange ? (
                                    <QuoteItemImagePicker
                                      currentImageUrl={null}
                                      itemId={item.id || `${roomName}-${itemIndex}`}
                                      itemName={item.name || 'Product'}
                                      onImageChange={(url) => onItemImageChange(item.id || `${roomName}-${itemIndex}`, url)}
                                      size={80}
                                    />
                                  ) : showImages ? (
                                    <div style={{ width: '100px', height: '70px', backgroundColor: '#f0ebe3', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <ImageIcon className="h-5 w-5" style={{ color: '#8b7355', opacity: 0.4 }} />
                                    </div>
                                  ) : null}
                                </td>
                                {/* Product Details */}
                                <td style={{ padding: '8px', fontSize: '13px', color: '#3d2e1f', verticalAlign: 'top' }}>
                                  <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px', textTransform: 'uppercase' }}>
                                    {item.treatment_type ? item.treatment_type.charAt(0).toUpperCase() + item.treatment_type.slice(1) : (item.name || 'Window Treatment')}
                                  </div>
                                  {effectiveShowDetailed && nonHardwareBreakdown.length > 0 && (
                                    <div style={{ fontSize: '11px', color: '#6b5c4c', lineHeight: '1.6' }}>
                                      {nonHardwareBreakdown.map((b: any, bi: number) => (
                                        <div key={bi} style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                                          <div style={{ display: 'flex', gap: '4px' }}>
                                            <span style={{ color: '#8b7355', minWidth: '100px' }}>{b.name}:</span>
                                            <span>{b.description || '—'}</span>
                                          </div>
                                          <div style={{ display: 'flex', gap: '8px', whiteSpace: 'nowrap' }}>
                                            <span>{formatCurrency(b.unit_price ?? 0, currencyCode)}</span>
                                            <span style={{ fontWeight: '500' }}>{formatCurrency(b.total_cost ?? 0, currencyCode)}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {effectiveShowDetailed && hardwareBreakdown.length > 0 && (
                                    <>
                                      <div style={{ borderTop: '1px dashed #c4b5a0', margin: '6px 0 4px 0', paddingTop: '4px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: '600', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hardware</span>
                                      </div>
                                      <div style={{ fontSize: '11px', color: '#6b5c4c', lineHeight: '1.6' }}>
                                        {hardwareBreakdown.map((b: any, bi: number) => {
                                          // If it's a hardware group with sub-items, render each sub-item
                                          if (b.hardwareItems && b.hardwareItems.length > 0) {
                                            return b.hardwareItems.map((hi: any, hii: number) => (
                                              <div key={`${bi}-${hii}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                  <span style={{ color: '#8b7355', minWidth: '100px' }}>{hi.name}:</span>
                                                  <span>{hi.description || '—'}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', whiteSpace: 'nowrap' }}>
                                                  <span>{formatCurrency(hi.unit_price ?? 0, currencyCode)}</span>
                                                  <span style={{ fontWeight: '500' }}>{formatCurrency(hi.total_cost ?? 0, currencyCode)}</span>
                                                </div>
                                              </div>
                                            ));
                                          }
                                          return (
                                            <div key={bi} style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                                              <div style={{ display: 'flex', gap: '4px' }}>
                                                <span style={{ color: '#8b7355', minWidth: '100px' }}>{b.name}:</span>
                                                <span>{b.description || '—'}</span>
                                              </div>
                                              <div style={{ display: 'flex', gap: '8px', whiteSpace: 'nowrap' }}>
                                                <span>{formatCurrency(b.unit_price ?? 0, currencyCode)}</span>
                                                <span style={{ fontWeight: '500' }}>{formatCurrency(b.total_cost ?? 0, currencyCode)}</span>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </>
                                  )}
                                </td>
                                <td style={{ padding: '8px', fontSize: '13px', fontWeight: '600', color: '#3d2e1f', textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                                  {formatCurrency(item.total_cost ?? item.total ?? 0, currencyCode)}
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                  {/* Services section - services only, no hardware */}
                  {(() => {
                    if (serviceOnlyItems.length === 0 || !hasRealData) return null;
                    return (
                      <>
                        <tr style={{ backgroundColor: '#8b7355' }}>
                          <td colSpan={colCount} style={{ padding: '10px 8px', fontSize: '12px', fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Services
                          </td>
                        </tr>
                        {serviceOnlyItems.map((item: any, itemIndex: number) => {
                          const isItemExcluded = excludedItems.includes(item.id);
                          if (!isExclusionEditMode && isItemExcluded) return null;
                          return (
                            <tr key={`service-${itemIndex}`} style={{ borderBottom: '1px solid #d4c5b0', opacity: isItemExcluded ? 0.5 : 1 }}>
                              <td style={{ padding: '8px', fontSize: '13px', fontWeight: '500', color: '#3d2e1f', verticalAlign: 'top' }}>
                                {item.surface_name || item.room_name || '—'}
                              </td>
                              <td style={{ padding: '8px', fontSize: '13px', color: '#3d2e1f', verticalAlign: 'top' }}>
                                <div style={{ fontWeight: '600' }}>
                                  {item.treatment_type ? item.treatment_type.charAt(0).toUpperCase() + item.treatment_type.slice(1) : (item.name || 'Service')}
                                </div>
                                {item.description && (
                                  <div style={{ fontSize: '11px', color: '#6b5c4c', marginTop: '2px' }}>{item.description}</div>
                                )}
                              </td>
                              <td style={{ padding: '8px', fontSize: '13px', color: '#3d2e1f', textAlign: 'center', verticalAlign: 'top' }}>
                                {item.quantity || 1}
                              </td>
                              <td style={{ padding: '8px', fontSize: '13px', color: '#3d2e1f', textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                                {formatCurrency((item.unit_price ?? item.total_cost ?? 0) / (item.quantity || 1), currencyCode)}
                              </td>
                              <td style={{ padding: '8px', fontSize: '13px', fontWeight: '600', color: '#3d2e1f', textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                                {formatCurrency(item.total_cost ?? item.total ?? 0, currencyCode)}
                              </td>
                            </tr>
                          );
                        })}
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      return (
        <div className="mb-4 products-section" style={{ backgroundColor: '#ffffff', padding: '8px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', backgroundColor: '#ffffff' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#000', backgroundColor: '#ffffff', padding: '4px 0' }}>
              {content.title || sectionTitle}
            </h3>
          </div>

          {!hasRealData && (
            <div style={{ backgroundColor: '#f3f4f6', borderLeft: '4px solid #9ca3af', padding: '12px', marginBottom: '12px' }}>
              <p style={{ color: '#1f2937', fontSize: '14px', fontWeight: '500' }}>
                {t('No project data available', lang)}. {t('Add treatments to your project to see itemized breakdown', lang)}.
              </p>
            </div>
          )}

          <div style={{ overflow: 'visible', width: '100%', backgroundColor: '#ffffff' }}>
            <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%', backgroundColor: '#ffffff' }}>
              <colgroup>
                {isExclusionEditMode && <col style={{ width: '40px' }} />}
                <col style={{ width: isExclusionEditMode ? '23%' : '25%' }} />
                <col style={{ width: 'auto' }} />
                <col style={{ width: '80px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '140px' }} />
              </colgroup>
              <thead style={{ backgroundColor: '#ffffff' }}>
                <tr style={{ borderBottom: isPrintMode ? 'none' : '1px solid #333', backgroundColor: '#ffffff' }}>
                  {isExclusionEditMode && (
                    <th style={{ textAlign: 'center', padding: '8px 4px', fontSize: '12px', fontWeight: '500', color: '#6b7280', backgroundColor: '#ffffff' }}>
                      <SquareCheck className="h-4 w-4 mx-auto text-muted-foreground" />
                    </th>
                  )}
                  <th style={{ textAlign: 'left', padding: '8px 6px', fontSize: '13px', fontWeight: '500', color: '#000', backgroundColor: '#ffffff' }}>{tableHeaders.productService}</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px', fontSize: '13px', fontWeight: '500', color: '#000', backgroundColor: '#ffffff' }}>{tableHeaders.description}</th>
                  <th style={{ textAlign: 'center', padding: '8px 6px', fontSize: '13px', fontWeight: '500', color: '#000', backgroundColor: '#ffffff' }}>{tableHeaders.quantity}</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px', fontSize: '13px', fontWeight: '500', color: '#000', backgroundColor: '#ffffff' }}>{tableHeaders.unitPrice}</th>
                  <th style={{ textAlign: 'right', padding: '8px 6px', fontSize: '13px', fontWeight: '500', color: '#000', backgroundColor: '#ffffff' }}>
                    {totalColumnHeader}
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: '#ffffff' }}>
                {Object.entries(groupedItems).map(([roomName, items]: [string, any]) => {
                  // Filter items based on exclusion mode - when printing/viewing, hide excluded items
                  const visibleItems = (!isExclusionEditMode && excludedItems.length > 0)
                    ? (items as any[]).filter((item: any) => !excludedItems.includes(item.id))
                    : (items as any[]);
                  
                  // Don't render room header if all items are excluded
                  if (visibleItems.length === 0 && !isExclusionEditMode) return null;
                  
                  // Calculate room subtotal from visible items
                  const roomSubtotal = visibleItems.reduce((sum: number, item: any) => {
                    return sum + (item.total_cost || item.total || item.unit_price || 0);
                  }, 0);
                  
                  return (
                  <React.Fragment key={roomName}>
                    {groupByRoom && hasRealData && (
                      <tr style={{ backgroundColor: '#ffffff' }}>
                        <td
                          colSpan={isExclusionEditMode ? 5 : 4}
                          style={{
                            padding: '10px 6px 6px 6px',
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#000',
                            borderTop: '1px solid rgba(0,0,0,0.2)',
                            backgroundColor: '#fff'
                          }}
                        >
                          {roomName}
                        </td>
                        <td
                          style={{
                            padding: '10px 6px 6px 6px',
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#000',
                            borderTop: '1px solid rgba(0,0,0,0.2)',
                            backgroundColor: '#fff',
                            textAlign: 'right',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {formatCurrency(roomSubtotal, projectData?.currency || getDefaultCurrency())}
                        </td>
                      </tr>
                    )}
                    {(isExclusionEditMode ? (items as any[]) : visibleItems).map((item: any, itemIndex: number) => {
                      const itemNumber = groupByRoom ? itemIndex + 1 : Object.values(groupedItems).flat().indexOf(item) + 1;
                      const breakdown = getItemizedBreakdown(item);
                      const isItemExcluded = excludedItems.includes(item.id);
                      console.log('[PRODUCT ROW]', {
                        itemNumber,
                        itemName: item.name || item.surface_name,
                        total_cost: item.total_cost,
                        unit_price: item.unit_price,
                        total: item.total,
                        breakdownCount: breakdown.length,
                        isExcluded: isItemExcluded,
                        allItemData: item
                      });
                      
                      return (
                        <React.Fragment key={`item-${roomName}-${itemIndex}`}>
                          {/* Main product row */}
                          <tr className="avoid-page-break" style={{ 
                            borderBottom: (breakdown.length > 0 && effectiveShowDetailed) || isPrintMode ? 'none' : '1px solid #ddd',
                            backgroundColor: isItemExcluded ? '#fef2f2' : '#fff',
                            opacity: isItemExcluded ? 0.6 : 1,
                            textDecoration: isItemExcluded ? 'line-through' : 'none'
                          }}>
                            {/* Checkbox column for exclusion */}
                            {isExclusionEditMode && (
                              <td style={{ padding: '5px 4px', verticalAlign: 'middle', textAlign: 'center', backgroundColor: isItemExcluded ? '#fef2f2' : '#ffffff' }}>
                                <Checkbox
                                  checked={!isItemExcluded}
                                  onCheckedChange={() => onToggleExclusion?.(item.id)}
                                  className="h-4 w-4"
                                />
                              </td>
                            )}
                            <td style={{ padding: '6px 6px', fontSize: '15px', fontWeight: '500', color: isItemExcluded ? '#9ca3af' : '#000', verticalAlign: 'middle', backgroundColor: isItemExcluded ? '#fef2f2' : '#ffffff' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {/* Image edit mode: show picker for all items (with or without existing image) */}
                                {showImages && !isPrintMode && isImageEditMode && onItemImageChange && (
                                  <QuoteItemImagePicker
                                    currentImageUrl={item.image_url_override || item.image_url || null}
                                    itemId={item.id || `${roomName}-${itemIndex}`}
                                    itemName={item.name || item.surface_name || 'Product'}
                                    onImageChange={(url) => onItemImageChange(item.id || `${roomName}-${itemIndex}`, url)}
                                    disabled={isItemExcluded}
                                    size={80}
                                  />
                                )}
                                {/* View mode (not editing): show static image if one exists */}
                                {showImages && !isPrintMode && !isImageEditMode && (item.image_url_override || item.image_url) && (
                                  <img
                                    src={item.image_url_override || item.image_url}
                                    alt={item.name || 'Product'}
                                    className="print-image"
                                    style={{
                                      width: '80px',
                                      height: '80px',
                                      objectFit: 'cover',
                                      borderRadius: '4px',
                                      border: '1px solid #ddd',
                                      flexShrink: 0,
                                      opacity: isItemExcluded ? 0.5 : 1
                                    }}
                                  />
                                )}
                                {/* Print mode: show static image if one exists */}
                                {showImages && isPrintMode && (item.image_url_override || item.image_url) && (
                                  <img
                                    src={item.image_url_override || item.image_url}
                                    alt={item.name || 'Product'}
                                    className="print-image"
                                    style={{
                                      width: '80px',
                                      height: '80px',
                                      objectFit: 'cover',
                                      borderRadius: '4px',
                                      flexShrink: 0
                                    }}
                                  />
                                )}
                                <span>
                                  {item.treatment_type ?
                                    item.treatment_type.charAt(0).toUpperCase() + item.treatment_type.slice(1) :
                                    (item.name || item.surface_name || 'Window Treatment')
                                  }
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '6px 6px', fontSize: '13px', color: isItemExcluded ? '#9ca3af' : '#000', fontWeight: '400', verticalAlign: 'middle', wordWrap: 'break-word', overflowWrap: 'break-word', backgroundColor: isItemExcluded ? '#fef2f2' : '#ffffff' }}>
                              {item.description && item.description !== '-' && item.description !== 'Custom' && item.description !== 'custom'
                                ? item.description
                                : (item.notes || '-')}
                            </td>
                            <td style={{ padding: '6px 6px', fontSize: '14px', fontWeight: '400', color: isItemExcluded ? '#9ca3af' : '#000', textAlign: 'center', verticalAlign: 'middle', backgroundColor: isItemExcluded ? '#fef2f2' : '#ffffff' }}>
                              {item.quantity || 1}
                            </td>
                            <td style={{ padding: '6px 6px', fontSize: '14px', fontWeight: '400', color: isItemExcluded ? '#9ca3af' : '#000', textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: isItemExcluded ? '#fef2f2' : '#ffffff' }}>
                              {formatCurrency(
                                item.isRoomProduct
                                  ? (item.unit_price || 0)
                                  : (item.unit_price || item.total_cost || item.total || 0) / (item.quantity || 1),
                                projectData?.currency || getDefaultCurrency()
                              )}
                            </td>
                            <td style={{ padding: '6px 6px', fontSize: '14px', fontWeight: '500', color: isItemExcluded ? '#9ca3af' : '#000', textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: isItemExcluded ? '#fef2f2' : '#ffffff' }}>
                              {formatCurrency(item.total_cost || item.total || 0, projectData?.currency || getDefaultCurrency())}
                            </td>
                          </tr>
                          
                          {/* Pricing unit breakdown row for services - only in detailed mode */}
                          {effectiveShowDetailed && item.unit && item.unit !== 'each' && item.isRoomProduct && (
                            <tr style={{
                              backgroundColor: '#fff',
                              borderBottom: '1px solid #e8e8e8'
                            }}>
                              <td style={{ padding: '3px 6px 3px 20px', fontSize: '12px', color: '#666', fontWeight: '400', backgroundColor: '#ffffff' }}></td>
                              <td style={{ padding: '3px 6px', fontSize: '12px', color: '#666', fontWeight: '400', backgroundColor: '#ffffff' }}>
                                {item.unit.replace('per-', 'Per ').replace(/^\w/, (c: string) => c.toUpperCase())}
                              </td>
                              <td colSpan={3} style={{ backgroundColor: '#ffffff' }}></td>
                            </tr>
                          )}

                          {/* Detailed breakdown rows - only show in detailed mode */}
                          {breakdown.length > 0 && effectiveShowDetailed && breakdown.map((breakdownItem: any, bidx: number) => (
                            breakdownItem.isHardwareGroup ? (
                              // Hardware Group - render each hardware item as a flat row matching regular breakdown style
                              <React.Fragment key={`hw-group-${bidx}`}>
                                {breakdownItem.hardwareItems?.map((hwItem: any, hIdx: number) => (
                                  <tr key={`hw-item-${hIdx}`} className="avoid-page-break" style={{
                                    backgroundColor: '#fff',
                                    borderBottom: isPrintMode ? 'none' : (hIdx === (breakdownItem.hardwareItems?.length || 0) - 1 && bidx === breakdown.length - 1 ? '1px solid #ddd' : '1px solid #e8e8e8')
                                  }}>
                                    <td style={{ padding: '3px 6px 3px 20px', fontSize: '12px', color: '#666', fontWeight: '400', backgroundColor: '#ffffff' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {showImages && hwItem.image_url && (
                                          <ProductImageWithColorFallback
                                            imageUrl={hwItem.image_url}
                                            productName={hwItem.name || 'Hardware'}
                                            size={30}
                                            rounded="sm"
                                            category="hardware"
                                          />
                                        )}
                                        <span>{(hwItem.name || '').replace(/^(Select Rod|Select Track|Hardware Type):\s*/i, '').replace(/^└\s*/, '')}</span>
                                      </div>
                                    </td>
                                    <td style={{ padding: '3px 6px', fontSize: '12px', color: '#666', fontWeight: '400', wordWrap: 'break-word', overflowWrap: 'break-word', backgroundColor: '#ffffff' }}>
                                      {hwItem.description || hwItem.pricingDetails || '-'}
                                    </td>
                                    <td style={{ padding: '3px 6px', fontSize: '12px', color: '#666', fontWeight: '400', textAlign: 'center', backgroundColor: '#ffffff' }}>
                                      {hwItem.quantity > 0 ? hwItem.quantity : '-'}
                                    </td>
                                    <td style={{ padding: '3px 6px', fontSize: '12px', fontWeight: '400', color: '#666', textAlign: 'right', whiteSpace: 'nowrap', backgroundColor: '#ffffff' }}>
                                      {hwItem.unit_price > 0 ? formatCurrency(hwItem.unit_price, projectData?.currency || getDefaultCurrency()) : '-'}
                                    </td>
                                    <td style={{ padding: '3px 6px', fontSize: '12px', fontWeight: '400', color: '#666', textAlign: 'right', whiteSpace: 'nowrap', backgroundColor: '#ffffff' }}>
                                      {formatCurrency(hwItem.total_cost || 0, projectData?.currency || getDefaultCurrency())}
                                    </td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            ) : (
                              // Regular breakdown row
                              <tr key={bidx} className="avoid-page-break" style={{ 
                                backgroundColor: '#fff',
                                borderBottom: isPrintMode ? 'none' : (bidx === breakdown.length - 1 ? '1px solid #ddd' : '1px solid #e8e8e8')
                              }}>
                                <td style={{ padding: '3px 6px 3px 20px', fontSize: '12px', color: '#666', fontWeight: '400', backgroundColor: '#ffffff' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    {showImages && (breakdownItem.image_url || breakdownItem.color) && (
                                      <ProductImageWithColorFallback
                                        imageUrl={breakdownItem.image_url}
                                        color={breakdownItem.color}
                                        productName={breakdownItem.name || 'Component'}
                                        size={30}
                                        rounded="sm"
                                        category={breakdownItem.category}
                                      />
                                    )}
                                    <span>{breakdownItem.name}</span>
                                  </div>
                                </td>
                                <td style={{ padding: '3px 6px', fontSize: '12px', color: '#666', fontWeight: '400', wordWrap: 'break-word', overflowWrap: 'break-word', backgroundColor: '#ffffff' }}>
                                  {breakdownItem.description || '-'}
                                </td>
                                <td style={{ padding: '3px 6px', fontSize: '12px', color: '#666', fontWeight: '400', textAlign: 'center', backgroundColor: '#ffffff' }}>
                                  {breakdownItem.quantity > 0 ? `${Number(breakdownItem.quantity).toFixed(2)} ${breakdownItem.unit || ''}`.trim() : '-'}
                                </td>
                                <td style={{ padding: '3px 6px', fontSize: '12px', fontWeight: '400', color: '#666', textAlign: 'right', whiteSpace: 'nowrap', backgroundColor: '#ffffff' }}>
                                  {breakdownItem.unit_price > 0 ? formatCurrency(breakdownItem.unit_price, projectData?.currency || getDefaultCurrency()) : '-'}
                                </td>
                                <td style={{ padding: '3px 6px', fontSize: '12px', fontWeight: '400', color: '#666', textAlign: 'right', whiteSpace: 'nowrap', backgroundColor: '#ffffff' }}>
                                  {formatCurrency(breakdownItem.total_cost || 0, projectData?.currency || getDefaultCurrency())}
                                </td>
                              </tr>
                            )
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'totals':
    case 'total':
    case 'pricing-summary':
    case 'pricing-totals':
    case 'summary':
      // ============= CURTAIN-PROFESSIONAL THEMED TOTALS =============
      if (content.theme === 'curtain-professional') {
        const curtainTotalsLang = (projectData?.businessSettings?.document_language as DocumentLanguage) || 'en';
        return (
          <div style={{ marginBottom: '24px', padding: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: '16px', borderTop: '2px solid #8b7355' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#3d2e1f' }}>
                Payment Summary
              </div>
              <div style={{ minWidth: '280px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px', color: '#3d2e1f' }}>
                  <span>Subtotal</span>
                  <span>{renderTokenValue('subtotal')}</span>
                </div>
                {content.showTax !== false && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px', color: '#3d2e1f' }}>
                    <span>{userBusinessSettings?.tax_type?.toUpperCase() || 'VAT'} ({renderTokenValue('tax_rate')})</span>
                    <span>{renderTokenValue('tax_amount')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '16px', fontWeight: '700', color: '#3d2e1f', borderTop: '1px solid #d4c5b0', marginTop: '4px' }}>
                  <span>Total Order Value</span>
                  <span>{renderTokenValue('total')}</span>
                </div>
                {projectData?.payment?.type === 'deposit' && projectData.payment.amount > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '14px', color: '#6b5c4c' }}>
                      <span>Advance Paid</span>
                      <span>{formatCurrency(projectData.payment.amount, projectData?.currency || getDefaultCurrency())}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '15px', fontWeight: '600', color: '#3d2e1f', borderTop: '1px solid #d4c5b0' }}>
                      <span>Balance Payable</span>
                      <span>{formatCurrency((projectData.total || 0) - projectData.payment.amount, projectData?.currency || getDefaultCurrency())}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      }
      // ============= STANDARD TOTALS =============
      // Get localization settings for totals
      const totalsBusinessSettings = projectData?.businessSettings || {};
      const totalsLang = (totalsBusinessSettings?.document_language as DocumentLanguage) || 'en';
      const totalsLabels = getLocalizedTotalsLabels(totalsLang);
      
      return (
        <div style={{ marginBottom: '32px', backgroundColor: '#ffffff !important' }}>
          <div className="flex justify-end">
            <div 
              style={{ 
                backgroundColor: '#ffffff !important',
                border: 'none',
                minWidth: '340px',
                padding: '16px 32px',
                color: '#000 !important'
              }}
            >


              {/* Discount (if applicable) */}
              {content.showDiscount !== false && projectData?.discount && projectData.discount.amount > 0 && (
                <>
                  <div className="flex justify-end py-1" style={{ backgroundColor: '#ffffff !important' }}>
                    <div className="text-right" style={{ minWidth: '200px', backgroundColor: '#ffffff !important' }}>
                      <span style={{ fontSize: '14px', color: '#111827 !important' }}>
                        {t('Subtotal (before discount)', totalsLang)}: {renderTokenValue('basetotal')}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end py-1" style={{ backgroundColor: '#ffffff !important' }}>
                    <div className="text-right" style={{ minWidth: '200px', backgroundColor: '#ffffff !important' }}>
                      <span style={{ fontSize: '14px', color: '#dc2626 !important' }}>
                        {t('Discount', totalsLang)} ({projectData.discount.type === 'percentage' ? `${projectData.discount.value}%` : 'Fixed'}): - {renderTokenValue('discount')}
                      </span>
                    </div>
                  </div>
                </>
              )}
              
              {/* Price excl. GST/Tax (Base Subtotal) */}
              {content.showSubtotal !== false && (
                <div className="flex justify-end py-1" style={{ backgroundColor: '#ffffff !important' }}>
                  <div className="text-right" style={{ minWidth: '200px', backgroundColor: '#ffffff !important' }}>
                    <span style={{ fontSize: '14px', color: '#111827 !important' }}>
                      {totalsLabels.subtotal}: {renderTokenValue('subtotal')}
                    </span>
                  </div>
                </div>
              )}
              
              {/* GST/Tax - show by default unless explicitly disabled */}
              {content.showTax !== false && (
                <div className="flex justify-end py-1" style={{ backgroundColor: '#ffffff !important' }}>
                  <div className="text-right" style={{ minWidth: '200px', backgroundColor: '#ffffff !important' }}>
                    <span style={{ fontSize: '14px', color: '#111827 !important' }}>
                      {userBusinessSettings?.tax_type && userBusinessSettings.tax_type !== 'none' 
                        ? t(userBusinessSettings.tax_type.toUpperCase(), totalsLang) 
                        : totalsLabels.tax} ({renderTokenValue('tax_rate')}): {renderTokenValue('tax_amount')}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Grand total */}
              <div className="flex justify-end py-3 mt-2 border-t" style={{ backgroundColor: '#ffffff !important', borderColor: '#e5e7eb !important' }}>
                <div className="text-right" style={{ minWidth: '200px', backgroundColor: '#ffffff !important' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827 !important' }}>{totalsLabels.total}: {renderTokenValue('total')}</span>
                </div>
              </div>

              {/* Deposit Payment Summary */}
              {projectData?.payment?.type === 'deposit' && projectData.payment.amount > 0 && (
                <div className="py-3 mt-2 border-t" style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff !important' }}>
                  <div className="flex justify-end py-1" style={{ backgroundColor: '#ffffff !important' }}>
                    <div className="text-right" style={{ minWidth: '200px', backgroundColor: '#ffffff !important' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827 !important' }}>
                        {t('Deposit Required', totalsLang)}{projectData.payment.percentage > 0 ? ` (${projectData.payment.percentage}%)` : ''}:
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#2563eb', marginLeft: '8px' }}>
                        {formatCurrency(projectData.payment.amount, projectData?.currency || getDefaultCurrency())}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end py-1" style={{ backgroundColor: '#ffffff !important' }}>
                    <div className="text-right" style={{ minWidth: '200px', backgroundColor: '#ffffff !important' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        {t('Balance Due After Deposit', totalsLang)}:
                      </span>
                      <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '8px' }}>
                        {formatCurrency((projectData.total || 0) - projectData.payment.amount, projectData?.currency || getDefaultCurrency())}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Payment Button - Always visible when quote exists, shows config prompt if not set up */}
              {!isPrintMode && projectData?.quoteId && (
                <div className="flex justify-end mt-6 no-print">
                  <div className="w-full max-w-md space-y-3">
                    {projectData.payment?.status === 'paid' || projectData.payment?.status === 'deposit_paid' ? (
                      <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="font-medium text-green-800">Payment Complete</p>
                        <p className="text-sm text-green-600">Thank you for your payment!</p>
                      </div>
                    ) : projectData.payment && projectData.payment.amount > 0 ? (
                      <Button
                        size="lg"
                        className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={async () => {
                          const { supabase } = await import("@/integrations/supabase/client");
                          const { data, error } = await supabase.functions.invoke("create-quote-payment", {
                            body: { quote_id: projectData.quoteId },
                          });
                          if (error) {
                            const { toast } = await import("sonner");
                            toast.error(`Payment failed: ${error.message}`);
                          } else if (data?.url) {
                            window.open(data.url, "_blank");
                          }
                        }}
                      >
                        <CreditCard className="h-5 w-5" />
                        {projectData.payment.type === 'deposit' 
                          ? `Pay Deposit${projectData.payment.percentage > 0 ? ` (${projectData.payment.percentage}%)` : ''} - ${formatCurrency(projectData.payment.amount, projectData?.currency || getDefaultCurrency())}`
                          : `Pay Full Amount - ${renderTokenValue('total')}`
                        }
                      </Button>
                    ) : (
                      <div className="text-center p-4 bg-muted border border-border rounded-lg">
                        <CreditCard className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="font-medium text-sm">Payment Not Configured</p>
                        <p className="text-xs text-muted-foreground">Configure payment options below to enable payments</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );


    case 'text':
      return (
        <div className="mb-6" style={style}>
          <div 
            className="whitespace-pre-wrap"
            style={{ 
              fontSize: style.fontSize || '16px',
              fontWeight: style.fontWeight || 'normal',
              fontStyle: style.fontStyle || 'normal',
              textDecoration: style.textDecoration || 'none',
              textAlign: style.textAlign || 'left',
              color: style.color || 'inherit',
              padding: style.padding || '16px',
              backgroundColor: style.backgroundColor || 'transparent'
            }}
          >
            {content.text || 'Enter your text here...'}
          </div>
        </div>
      );

    case 'editable-text-field':
      return <EditableTextField content={content} style={style} isEditable={isEditable} isPrintMode={isPrintMode} quoteId={quoteId} blockId={block.id} onDataChange={onDataChange} />;

    case 'image':
      return (
        <div className="mb-6 text-center">
          {content.src ? (
            <img 
              src={content.src} 
              alt={content.alt || 'Image'} 
              className="max-w-full h-auto mx-auto rounded-lg"
              style={{ width: content.width || 'auto' }}
            />
          ) : (
            <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '32px', backgroundColor: '#f9fafb' }}>
              <ImageIcon className="h-12 w-12 mx-auto mb-2" style={{ color: '#9ca3af' }} />
              <p style={{ color: '#6b7280' }}>Image placeholder</p>
            </div>
          )}
        </div>
      );

    case 'image-uploader':
      return <ImageGalleryBlock content={content} style={style} isEditable={isEditable} isPrintMode={isPrintMode} quoteId={quoteId} blockId={block.id} onDataChange={onDataChange} />;

    case 'spacer':
      return (
        <div 
          className="w-full" 
          style={{ height: content.height || '20px' }}
        />
      );

    case 'divider':
      return (
        <div className="mb-6">
          <hr 
            style={{ 
              borderColor: content.color || '#e5e7eb',
              borderWidth: content.thickness || '1px'
            }} 
          />
        </div>
      );

    case 'terms-conditions':
      // System T&C - pulls from Settings → System → Terms & Conditions
      const systemTerms = userBusinessSettings?.general_terms_and_conditions 
        || projectData?.businessSettings?.general_terms_and_conditions;
      return (
        <div style={{ marginBottom: '24px', backgroundColor: '#ffffff', padding: '16px', color: '#000' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#000' }}>
            {content.title || 'Terms & Conditions'}
          </h3>
          <div style={{ fontSize: '14px', color: '#000' }}>
            {systemTerms ? (
              <div style={{ whiteSpace: 'pre-wrap', color: '#000' }}>{systemTerms}</div>
            ) : (
              <div style={{ color: '#6b7280', fontStyle: 'italic' }}>No terms configured. Add them in Settings → System → Terms & Conditions.</div>
            )}
          </div>
        </div>
      );

    case 'terms-conditions-custom':
      // Custom T&C - fully editable block content (for PDF/preview, uses stored terms array)
      const customTermsArray = Array.isArray(content.terms) ? content.terms : [];
      const hasCustomTerms = customTermsArray.length > 0 || content.term1 || content.term2 || content.term3 || content.term4;
      return (
        <div style={{ marginBottom: '24px', backgroundColor: '#ffffff', padding: '16px', color: '#000' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#000' }}>
            {content.title || 'Terms & Conditions'}
          </h3>
          <div style={{ fontSize: '14px', color: '#000' }}>
            {customTermsArray.length > 0 ? (
              customTermsArray.map((term: string, idx: number) => (
                <div key={idx} style={{ marginBottom: '12px', color: '#000' }}>{term}</div>
              ))
            ) : hasCustomTerms ? (
              <>
                {content.term1 && <div style={{ marginBottom: '12px', color: '#000' }}>{content.term1}</div>}
                {content.term2 && <div style={{ marginBottom: '12px', color: '#000' }}>{content.term2}</div>}
                {content.term3 && <div style={{ marginBottom: '12px', color: '#000' }}>{content.term3}</div>}
                {content.term4 && <div style={{ marginBottom: '12px', color: '#000' }}>{content.term4}</div>}
              </>
            ) : (
              <div style={{ color: '#6b7280', fontStyle: 'italic' }}>No custom terms added yet. Edit this block to add your own terms.</div>
            )}
          </div>
        </div>
      );

    case 'privacy-policy':
      // Use system privacy policy from userBusinessSettings prop (global settings) - fallback to projectData
      const privacyPolicy = userBusinessSettings?.privacy_policy 
        || projectData?.businessSettings?.privacy_policy;
      return (
        <div style={{ marginBottom: '24px', backgroundColor: '#ffffff', padding: '16px', color: '#000' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#000' }}>
            {content.title || 'Privacy Policy'}
          </h3>
          <div style={{ fontSize: '14px', color: '#000', whiteSpace: 'pre-wrap' }}>
            {privacyPolicy || (
              <span style={{ color: '#6b7280', fontStyle: 'italic' }}>No privacy policy configured. Add it in Settings → System → Terms & Conditions.</span>
            )}
          </div>
        </div>
      );

    case 'payment-info':
      return (
        <div className="mb-6" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#000', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign className="h-5 w-5" style={{ color: '#000' }} />
            {content.title || 'Payment Information'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ backgroundColor: '#ffffff' }}>
              <h4 style={{ fontWeight: '500', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }}>
                <DollarSign className="h-4 w-4" style={{ color: '#000' }} />
                Payment Methods
              </h4>
              <div style={{ fontSize: '14px', color: '#000' }}>
                <div style={{ marginBottom: '4px', color: '#000' }}>• Cash, Check, or Credit Card</div>
                <div style={{ marginBottom: '4px', color: '#000' }}>• Bank Transfer (ACH)</div>
                <div style={{ color: '#000' }}>• Financing Available</div>
              </div>
            </div>
            <div style={{ backgroundColor: '#ffffff' }}>
              <h4 style={{ fontWeight: '500', marginBottom: '8px', color: '#000' }}>Payment Schedule</h4>
              <div style={{ fontSize: '14px', color: '#000' }}>
                <div style={{ marginBottom: '4px', color: '#000' }}>Deposit: 50% upon signing</div>
                <div style={{ marginBottom: '4px', color: '#000' }}>Progress: 25% at midpoint</div>
                <div style={{ color: '#000' }}>Final: 25% upon completion</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'project-scope':
      return (
        <div className="mb-6" style={{ backgroundColor: '#ffffff', padding: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#000' }}>
            {content.title || 'Project Scope'}
          </h3>
          <div style={{ backgroundColor: '#ffffff' }}>
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontWeight: '500', marginBottom: '8px', color: '#000' }}>Included:</h4>
              <div style={{ fontSize: '14px', paddingLeft: '16px' }}>
                <div style={{ marginBottom: '4px', color: '#000' }}>✓ Professional measurement and consultation</div>
                <div style={{ marginBottom: '4px', color: '#000' }}>✓ Custom fabrication of drapery</div>
                <div style={{ marginBottom: '4px', color: '#000' }}>✓ Hardware installation and mounting</div>
                <div style={{ color: '#000' }}>✓ Final styling and adjustments</div>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: '500', marginBottom: '8px', color: '#000' }}>Not Included:</h4>
              <div style={{ fontSize: '14px', paddingLeft: '16px' }}>
                <div style={{ marginBottom: '4px', color: '#000' }}>• Wall repairs or painting</div>
                <div style={{ marginBottom: '4px', color: '#000' }}>• Removal of existing treatments</div>
                <div style={{ color: '#000' }}>• Electrical work for motorization</div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'signature':
    case 'sign':
    case 'approval':
      return (
        <div style={{ marginTop: '32px', marginBottom: '24px', backgroundColor: '#ffffff !important', padding: '16px', color: '#000 !important' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: '#000 !important', backgroundColor: 'transparent !important' }}>
            {content.title || 'Authorization'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', backgroundColor: '#ffffff !important' }}>
            <div style={{ backgroundColor: '#ffffff !important' }}>
              <p style={{ fontSize: '14px', marginBottom: '16px', color: '#000 !important' }}>{content.authorizationText || "By signing below, you authorize us to proceed with this work as described:"}</p>
              <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '8px', marginTop: '48px', backgroundColor: '#ffffff !important' }}>
                <div style={{ fontSize: '14px', color: '#000 !important', backgroundColor: '#ffffff !important' }}>
                  <div style={{ fontWeight: '500', color: '#000 !important' }}>{content.clientSignatureLabel || "Client Signature"}</div>
                  <div style={{ color: '#000 !important' }}>{content.printNameLabel || "Print Name"}: {renderTokenValue('client_name')}</div>
                  <div style={{ color: '#000 !important' }}>{content.dateLabel || "Date"}: _________________</div>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: '#ffffff !important' }}>
              <p style={{ fontSize: '14px', marginBottom: '16px', color: '#000 !important' }}>{content.thankYouText || "Thank you for choosing us for your project!"}</p>
              <div style={{ borderTop: '1px solid #9ca3af', paddingTop: '8px', marginTop: '48px', backgroundColor: '#ffffff !important' }}>
                <div style={{ fontSize: '14px', color: '#000 !important', backgroundColor: '#ffffff !important' }}>
                  <div style={{ fontWeight: '500', color: '#000 !important' }}>{content.companySignatureLabel || "Company Representative"}</div>
                  <div style={{ color: '#000 !important' }}>{content.printNameLabel || "Print Name"}: _________________</div>
                  <div style={{ color: '#000 !important' }}>{content.dateLabel || "Date"}: _________________</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'curtain-footer': {
      const curtainBiz = projectData?.businessSettings || userBusinessSettings || {};
      const systemTermsForFooter = curtainBiz.general_terms_and_conditions;
      return (
        <div style={{ marginTop: '24px', padding: '0', borderTop: '2px solid #8b7355', paddingTop: '20px' }}>
          <div style={{ display: 'flex', gap: '32px' }}>
            {/* LEFT: Terms & Conditions */}
            <div style={{ flex: 1, fontSize: '12px', color: '#3d2e1f', lineHeight: '1.7' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#3d2e1f', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Terms & Conditions
              </div>
              {systemTermsForFooter ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>{systemTermsForFooter}</div>
              ) : (
                <div style={{ color: '#8b7355', fontStyle: 'italic' }}>No terms configured. Add them in Settings → System → Terms & Conditions.</div>
              )}
            </div>
            {/* RIGHT: Accept button area + company details */}
            <div style={{ width: '240px', flexShrink: 0 }}>
              {!isPrintMode && projectData?.quoteId && (
                <div style={{ marginBottom: '20px' }}>
                  <Button
                    size="sm"
                    className="w-full"
                    style={{ backgroundColor: '#8b7355', color: '#fff', fontWeight: '600', padding: '12px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                    onClick={async () => {
                      const { supabase } = await import("@/integrations/supabase/client");
                      const { data, error } = await supabase.functions.invoke("create-quote-payment", {
                        body: { quote_id: projectData.quoteId },
                      });
                      if (error) {
                        const { toast } = await import("sonner");
                        toast.error(`Payment failed: ${error.message}`);
                      } else if (data?.url) {
                        window.open(data.url, "_blank");
                      }
                    }}
                  >
                    View & Accept Quote
                  </Button>
                </div>
              )}
              <div style={{ fontSize: '12px', color: '#6b5c4c', lineHeight: '1.7', borderTop: '1px solid #d4c5b0', paddingTop: '12px' }}>
                <div style={{ fontWeight: '700', color: '#3d2e1f', marginBottom: '4px' }}>{curtainBiz.company_name || curtainBiz.trading_name || ''}</div>
                {curtainBiz.business_email && <div>{curtainBiz.business_email}</div>}
                {curtainBiz.business_phone && <div>{curtainBiz.business_phone}</div>}
                {curtainBiz.bank_name && (
                  <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #d4c5b0' }}>
                    <div style={{ fontWeight: '600', color: '#8b7355', marginBottom: '2px' }}>Bank Details</div>
                    <div>{curtainBiz.bank_name}</div>
                    {curtainBiz.bank_account_name && <div>A/C: {curtainBiz.bank_account_name}</div>}
                    {curtainBiz.bank_account_number && <div>No: {curtainBiz.bank_account_number}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case 'footer':
      const businessSettings = projectData?.businessSettings || {};
      return (
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #d1d5db', backgroundColor: '#ffffff', borderRadius: '8px', padding: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            {content.footerText && (
              <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic', marginBottom: '12px' }}>
                {content.footerText}
              </p>
            )}
            {content.showCompanyInfo !== false && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                <p style={{ fontWeight: '600', color: '#000', marginBottom: '4px' }}>{renderTokenValue('company_name')}</p>
                {businessSettings?.address && (
                  <p style={{ color: '#666', marginBottom: '4px' }}>{renderTokenValue('company_address')}</p>
                )}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {businessSettings?.business_phone && (
                    <span style={{ color: '#666' }}>📞 {renderTokenValue('company_phone')}</span>
                  )}
                  {businessSettings?.business_email && (
                    <span style={{ color: '#666' }}>✉️ {renderTokenValue('company_email')}</span>
                  )}
                  {businessSettings?.website && (
                    <span style={{ color: '#666' }}>🌐 {businessSettings.website}</span>
                  )}
                </div>
              </div>
            )}
            {content.additionalText && (
              <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                {content.additionalText}
              </p>
            )}
          </div>
        </div>
      );

    // Invoice-specific blocks
    case 'payment-details':
      return (
        <PaymentDetailsBlock
          block={block}
          projectData={projectData}
          userTimezone={userTimezone}
          userDateFormat={userDateFormat}
          isPrintMode={isPrintMode}
        />
      );
      
    case 'registration-footer':
      return (
        <RegistrationFooterBlock
          block={block}
          projectData={projectData}
          userTimezone={userTimezone}
          userDateFormat={userDateFormat}
          isPrintMode={isPrintMode}
        />
      );
    
    // Work order-specific blocks
    case 'installation-details':
      return (
        <InstallationDetailsBlock
          block={block}
          projectData={projectData}
          userTimezone={userTimezone}
          userDateFormat={userDateFormat}
          isPrintMode={isPrintMode}
        />
      );
      
    case 'installer-signoff':
      return (
        <InstallerSignoffBlock
          block={block}
          projectData={projectData}
          isPrintMode={isPrintMode}
        />
      );

    case 'invoice-status':
      return (
        <InvoiceStatusBlock
          block={block}
          projectData={projectData}
          userTimezone={userTimezone}
          userDateFormat={userDateFormat}
          isPrintMode={isPrintMode}
        />
      );

    case 'late-payment-terms':
      return (
        <LatePaymentTermsBlock
          block={block}
          projectData={projectData}
          userTimezone={userTimezone}
          userDateFormat={userDateFormat}
          isPrintMode={isPrintMode}
        />
      );

    case 'tax-breakdown':
      return (
        <TaxBreakdownBlock
          block={block}
          projectData={projectData}
          userTimezone={userTimezone}
          userDateFormat={userDateFormat}
          isPrintMode={isPrintMode}
        />
      );

    default:
      console.error('❌ [LivePreview] UNKNOWN BLOCK TYPE:', {
        originalType: block.type,
        originalTypeString: String(block.type),
        normalizedType: blockType,
        allAvailableCases: ['document-header', 'client-info', 'products', 'totals', 'terms', 'signature', 'payment', 'footer', 'payment-details', 'registration-footer', 'installation-details', 'installer-signoff', 'invoice-status', 'late-payment-terms', 'tax-breakdown'],
        blockData: block
      });
      return (
        <div className="mb-6 p-4 border-2 border-dashed border-red-300 bg-red-50 rounded-lg text-center">
          <FileText className="h-8 w-8 mx-auto mb-2 text-red-500" />
          <p className="font-bold text-red-700">Unknown block type: "{block.type}"</p>
          <p className="text-xs mt-2 text-red-600">Normalized: "{blockType}"</p>
          <p className="text-xs mt-1 text-red-600">Type: {typeof block.type}</p>
          <p className="text-xs mt-2 font-mono bg-white p-2 rounded">{JSON.stringify(block, null, 2).substring(0, 200)}...</p>
          <p className="text-xs mt-2 text-gray-600">Check browser console for full details</p>
        </div>
      );
  }
};

interface LivePreviewProps {
  blocks: any[];
  projectData?: any;
  isEditable?: boolean;
  isPrintMode?: boolean;
  documentType?: string;
  onBlocksChange?: (blocks: any[]) => void;
  containerStyles?: any;
  onContainerStylesChange?: (styles: any) => void;
  showDetailedBreakdown?: boolean;
  showImages?: boolean;
  groupByRoom?: boolean;
  layout?: 'simple' | 'detailed';
  onSettingsChange?: (settings: { showDetailedBreakdown?: boolean; showImages?: boolean; groupByRoom?: boolean }) => void;
  quoteId?: string;
  // Item exclusion props
  excludedItems?: string[];
  onToggleExclusion?: (itemId: string) => void;
  isExclusionEditMode?: boolean;
  // Image override props
  onItemImageChange?: (itemId: string, imageUrl: string | null) => void;
  isImageEditMode?: boolean;
}

export const LivePreview = ({
  blocks,
  projectData,
  isEditable = false,
  isPrintMode = false,
  documentType = 'quote',
  onBlocksChange,
  containerStyles,
  onContainerStylesChange,
  showDetailedBreakdown,
  showImages,
  groupByRoom,
  layout,
  onSettingsChange,
  quoteId,
  excludedItems = [],
  onToggleExclusion,
  isExclusionEditMode = false,
  onItemImageChange,
  isImageEditMode = false
}: LivePreviewProps) => {
  const { data: businessSettings } = useBusinessSettings();
  const { data: userPreferences } = useUserPreferences();
  const quoteCustomData = quoteId ? useQuoteCustomData(quoteId) : null;
  console.log('LivePreview rendering with blocks:', blocks?.length || 0);

  // If editable and we have update functions, use the editable version
  if (isEditable && onBlocksChange) {
    return (
      <Suspense fallback={<div className="p-8 text-center">Loading editor...</div>}>
        <EditableLivePreview
          blocks={blocks}
          projectData={projectData}
          onBlocksChange={onBlocksChange}
          containerStyles={containerStyles}
          onContainerStylesChange={onContainerStylesChange}
          documentType={documentType}
        />
      </Suspense>
    );
  }

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

  // Extract document-settings background color
  const docSettingsBlock = blocks.find((b: any) => b.type === 'document-settings');
  const docBgColor = docSettingsBlock?.content?.backgroundColor;

  // Print Mode: Clean rendering without wrappers, borders, or UI elements
  if (isPrintMode) {
    return (
      <div
        style={{
          backgroundColor: docBgColor || '#ffffff',
          color: '#000000 !important',
          padding: 0,
          margin: 0,
          width: '90%'
        }}
      >
        {blocks.map((block, index) => (
          <LivePreviewBlock
            key={block.id || index}
            block={block}
            projectData={projectData}
            isEditable={false}
            isPrintMode={true}
            documentType={documentType}
            userBusinessSettings={businessSettings}
            userPreferences={userPreferences}
            showDetailedBreakdown={showDetailedBreakdown}
            showImages={showImages}
            groupByRoom={groupByRoom}
            layout={layout}
            onSettingsChange={onSettingsChange}
            quoteId={quoteId}
            onDataChange={quoteCustomData}
            excludedItems={excludedItems}
            onToggleExclusion={onToggleExclusion}
            isExclusionEditMode={isExclusionEditMode}
            onItemImageChange={onItemImageChange}
            isImageEditMode={isImageEditMode}
          />
        ))}
      </div>
    );
  }

  // Editor Mode: Full UI with borders, scrolling, and indicators
  return (
    <ScrollArea className="h-full w-full bg-muted/20">
      <div className="flex justify-center py-8 px-4">
        {/* A4 Page Container with visible borders */}
        <div 
          className="relative bg-white shadow-lg"
          style={{
            width: '794px',
            minWidth: '794px',
            maxWidth: '794px',
            minHeight: '1123px',
            backgroundColor: docBgColor || containerStyles?.backgroundColor || '#ffffff',
            border: isPrintMode ? 'none' : '2px solid hsl(var(--border))',
            boxShadow: isPrintMode ? 'none' : '0 0 20px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Print cut line indicator at top - barely visible */}
          <div 
            className="no-print absolute top-0 left-0 right-0 h-px border-t border-dashed border-primary/5"
            style={{ borderTopWidth: '1px' }}
          />
          
          {/* Print cut line indicator at bottom - more visible for cutting reference */}
          <div 
            className="no-print absolute bottom-0 left-0 right-0 h-px border-b-2 border-dashed border-destructive/20"
            style={{ borderBottomWidth: '2px' }}
          />
          
          {/* Side cut lines - barely visible */}
          <div 
            className="no-print absolute top-0 bottom-0 left-0 w-px border-l border-dashed border-primary/5"
            style={{ borderLeftWidth: '1px', left: '15mm' }}
          />
          
          <div 
            className="no-print absolute top-0 bottom-0 right-0 w-px border-r border-dashed border-primary/5"
            style={{ borderRightWidth: '1px', right: '15mm' }}
          />
          
          {/* Content area */}
          <div 
            className="w-full print:!p-0 print:!m-0"
            style={{ 
              padding: '10mm',
              boxSizing: 'border-box',
              overflow: 'hidden',
              maxWidth: '794px'
            }}
          >
            {blocks.map((block, index) => (
              <LivePreviewBlock 
                key={block.id || index} 
                block={block} 
                projectData={projectData}
                isEditable={isEditable}
                isPrintMode={false}
                documentType={documentType}
                userBusinessSettings={businessSettings}
                showDetailedBreakdown={showDetailedBreakdown}
                showImages={showImages}
                groupByRoom={groupByRoom}
                layout={layout}
                onSettingsChange={onSettingsChange}
                quoteId={quoteId}
                onDataChange={quoteCustomData}
                excludedItems={excludedItems}
                onToggleExclusion={onToggleExclusion}
                isExclusionEditMode={isExclusionEditMode}
              />
            ))}
            
            {/* Payment Configuration Section - shown after all blocks */}
            {projectData?.quoteId && (
              <>
                {/* Separator between quote and payment section */}
                <div className="my-8 border-t-2 border-dashed border-border"></div>
                
                <div 
                  id="payment-section" 
                  className="mt-0 mb-8 transition-all duration-300 animate-in fade-in-50 slide-in-from-bottom-4"
                  style={{
                    scrollMarginTop: '100px'
                  }}
                >
                  {/* Payment Section Header */}
                  <div className="mb-6 p-4 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary rounded-lg">
                        <CreditCard className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Payment Configuration</h3>
                        <p className="text-sm text-muted-foreground">
                          Configure how you want to receive payment for this quote
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <InlinePaymentConfig
                    quoteId={projectData.quoteId}
                    total={projectData.total || 0}
                    currency={projectData.currency || 'USD'}
                    currentPayment={projectData.payment}
                  />
                </div>
              </>
            )}
          </div>
          
          {/* Page break indicator every 297mm - subtle */}
          <div 
            className="no-print absolute left-0 right-0 border-t border-dashed border-destructive/10 pointer-events-none"
            style={{ 
              top: '297mm',
              borderTopWidth: '1px'
            }}
          />
        </div>
      </div>
    </ScrollArea>
  );
};
