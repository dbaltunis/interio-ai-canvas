import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Space
} from "lucide-react";
import { SignatureCanvas } from './SignatureCanvas';

interface LivePreviewBlockProps {
  block: any;
  projectData?: any;
  isEditable?: boolean;
}

const LivePreviewBlock = ({ block, projectData, isEditable }: LivePreviewBlockProps) => {
  const content = block.content || {};
  const style = content.style || {};

  const renderTokenValue = (token: string) => {
    const tokens = {
      company_name: 'Acme Window Solutions',
      company_address: '123 Business Ave, Suite 100',
      company_phone: '(555) 123-4567',
      company_email: 'info@acmewindows.com',
      quote_number: 'QT-2024-001',
      date: new Date().toLocaleDateString(),
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    };
    return tokens[token as keyof typeof tokens] || token;
  };

  const replaceTokens = (text: string) => {
    if (!text) return '';
    return text.replace(/\{\{(\w+)\}\}/g, (match, token) => renderTokenValue(token));
  };

  switch (block.type) {
    case 'header':
      return (
        <div 
          className="p-6 rounded-lg mb-6" 
          style={{ 
            backgroundColor: style.backgroundColor || '#f8fafc',
            color: style.textColor || '#1e293b'
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {content.showLogo && (
                <div className={`mb-4 ${content.logoPosition === 'center' ? 'text-center' : ''}`}>
                  <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                </div>
              )}
              <h1 className="text-3xl font-bold mb-2">
                {replaceTokens(content.companyName) || 'Your Company Name'}
              </h1>
              <div className="space-y-1 opacity-90 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{replaceTokens(content.companyAddress) || 'Company Address'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{replaceTokens(content.companyPhone) || '(555) 123-4567'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{replaceTokens(content.companyEmail) || 'info@company.com'}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-semibold mb-2">Quote</h2>
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
        </div>
      );

    case 'client-info':
      return (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-brand-primary flex items-center gap-2">
            <User className="h-5 w-5" />
            {content.title || 'Bill To:'}
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">John Smith</p>
              {content.showCompany && <p className="text-gray-600">Smith Construction Co.</p>}
              {content.showClientEmail && <p className="text-gray-600">john@smithconstruction.com</p>}
              {content.showClientPhone && <p className="text-gray-600">(555) 987-6543</p>}
              {content.showClientAddress && (
                <p className="text-gray-600">456 Residential Street, Anytown, ST 12345</p>
              )}
            </div>
          </div>
        </div>
      );

    case 'products':
      return (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-brand-primary flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {content.title || 'Quote Items'}
          </h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Product/Service</th>
                  {content.showDescription && <th className="text-left p-3 text-sm font-medium">Description</th>}
                  {content.showQuantity !== false && <th className="text-center p-3 text-sm font-medium">Qty</th>}
                  {content.showUnitPrice !== false && <th className="text-right p-3 text-sm font-medium">Unit Price</th>}
                  {content.showTotal !== false && <th className="text-right p-3 text-sm font-medium">Total</th>}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3">Premium Blinds - White</td>
                  {content.showDescription && <td className="p-3 text-sm text-gray-600">2" Faux Wood Blinds with Cord Tilt</td>}
                  {content.showQuantity !== false && <td className="p-3 text-center">3</td>}
                  {content.showUnitPrice !== false && <td className="p-3 text-right">$125.00</td>}
                  {content.showTotal !== false && <td className="p-3 text-right font-medium">$375.00</td>}
                </tr>
                <tr className="border-t">
                  <td className="p-3">Installation Service</td>
                  {content.showDescription && <td className="p-3 text-sm text-gray-600">Professional Installation & Setup</td>}
                  {content.showQuantity !== false && <td className="p-3 text-center">1</td>}
                  {content.showUnitPrice !== false && <td className="p-3 text-right">$150.00</td>}
                  {content.showTotal !== false && <td className="p-3 text-right font-medium">$150.00</td>}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'totals':
      return (
        <div className="mb-8">
          <div className="flex justify-end">
            <div 
              className="w-80 space-y-2 p-4 rounded-lg"
              style={{ 
                backgroundColor: style.backgroundColor || '#f8fafc',
                borderColor: style.borderColor || '#e2e8f0'
              }}
            >
              {content.showSubtotal !== false && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">$525.00</span>
                </div>
              )}
              {content.showTax && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax (8.5%):</span>
                  <span className="font-medium">$44.63</span>
                </div>
              )}
              <div className="flex justify-between py-2 text-lg font-bold border-t border-gray-300 pt-3">
                <span>Total:</span>
                <span className="text-brand-primary">$569.63</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'signature':
      return (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-brand-primary flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            Signature
          </h3>
          <div className="grid grid-cols-2 gap-8 pt-8">
            <div className="space-y-2">
              <div className="border-b border-gray-300 h-12 flex items-end pb-2">
                {content.enableDigitalSignature ? (
                  <SignatureCanvas onSignatureSave={() => {}} width={200} height={50} />
                ) : (
                  <div className="w-full h-1 bg-gray-200 rounded"></div>
                )}
              </div>
              <p className="text-sm text-gray-600 text-center">
                {content.signatureLabel || 'Authorized Signature'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="border-b border-gray-300 h-12"></div>
              <p className="text-sm text-gray-600 text-center">
                {content.dateLabel || 'Date'}
              </p>
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
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Image placeholder</p>
            </div>
          )}
        </div>
      );

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

    default:
      return (
        <div className="mb-6 p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Unknown block type: {block.type}</p>
        </div>
      );
  }
};

interface LivePreviewProps {
  blocks: any[];
  projectData?: any;
  isEditable?: boolean;
}

export const LivePreview = ({ blocks, projectData, isEditable = false }: LivePreviewProps) => {
  console.log('LivePreview rendering with blocks:', blocks?.length || 0);

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
    <div className="bg-white min-h-full">
      <div className="max-w-4xl mx-auto p-8">
        {blocks.map((block, index) => (
          <LivePreviewBlock 
            key={block.id || index} 
            block={block} 
            projectData={projectData}
            isEditable={isEditable}
          />
        ))}
      </div>
    </div>
  );
};