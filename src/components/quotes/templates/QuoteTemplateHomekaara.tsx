// ============================================
// QuoteTemplateHomekaara.tsx
// A new quote template style for InterioApp
// ============================================

import React, { useState, useRef } from 'react';

// ============================================
// TYPES
// ============================================

export interface BreakdownItem {
  label: string;
  value: string;
}

export interface QuoteLineItem {
  id: string;
  name: string;
  description?: string;
  quantity?: number;
  unit_price?: number;
  total: number;
  prate?: number;
  image_url?: string;
  breakdown?: BreakdownItem[];
  room_name?: string;
  room_id?: string;
  surface_name?: string;
  treatment_type?: string;
}

export interface BusinessInfo {
  name: string;
  logo_url?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface ClientInfo {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface QuoteMetadata {
  quote_number: string;
  date: string;
  status: string;
  validity_days?: number;
  services_required?: string;
  expected_purchase_date?: string;
  referral_source?: string;
}

export interface PaymentInfo {
  advance_paid: number;
  deposit_percentage?: number;
}

export interface QuoteTemplateHomekaaraProps {
  // Quote line items (from prepareQuoteData or similar)
  items: QuoteLineItem[];
  
  // Totals
  subtotal: number;
  taxAmount?: number;
  total: number;
  currency: string;
  
  // Business & Client
  businessInfo: BusinessInfo;
  clientInfo: ClientInfo;
  
  // Metadata
  metadata: QuoteMetadata;
  
  // Payment
  paymentInfo?: PaymentInfo;
  
  // Content
  introMessage?: string;
  termsAndConditions?: string[];
  
  // Callbacks
  onAcceptQuote?: () => void;
  onSaveChanges?: (data: QuoteTemplateUpdateData) => void;
  onImageUpload?: (itemId: string, file: File) => Promise<string>;
  
  // Mode
  isEditable?: boolean;
}

export interface QuoteTemplateUpdateData {
  metadata: QuoteMetadata;
  introMessage: string;
  items: QuoteLineItem[];
}

// ============================================
// HELPER: Currency Formatter (no line breaks)
// ============================================

const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    GBP: '£',
    USD: '$',
    EUR: '€',
    INR: '₹',
    AUD: 'A$',
    CAD: 'C$',
  };
  return symbols[currency] || currency;
};

const formatCurrency = (amount: number, currency: string, showDecimals = true): string => {
  const symbol = getCurrencySymbol(currency);
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  
  const formatted = showDecimals
    ? amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : Math.round(amount).toLocaleString(locale);
  
  // Use non-breaking space to prevent line breaks
  return `${symbol}\u00A0${formatted}`;
};

// ============================================
// HELPER: Editable Text Component
// ============================================

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  isEditable: boolean;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  isEditable,
  className = '',
  multiline = false,
  placeholder = '',
}) => {
  if (!isEditable) {
    return <span className={className}>{value || placeholder}</span>;
  }

  const baseClasses = 'border border-stone-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white';

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${className} ${baseClasses} resize-none w-full`}
        rows={3}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${className} ${baseClasses}`}
    />
  );
};

// ============================================
// HELPER: Image Uploader Component
// ============================================

interface ImageUploaderProps {
  imageUrl?: string;
  onUpload: (file: File) => void;
  isEditable: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ imageUrl, onUpload, isEditable }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (isEditable && inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`w-16 h-20 rounded overflow-hidden flex-shrink-0 ${
        isEditable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
      }`}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="Product" className="w-full h-full object-cover" />
      ) : (
        <div
          className={`w-full h-full bg-stone-100 flex items-center justify-center ${
            isEditable ? 'border-2 border-dashed border-stone-300 hover:border-amber-500' : ''
          }`}
        >
          <span className="text-xs text-stone-400 text-center px-1">
            {isEditable ? 'Upload' : '—'}
          </span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const QuoteTemplateHomekaara: React.FC<QuoteTemplateHomekaaraProps> = ({
  items: initialItems,
  subtotal,
  taxAmount = 0,
  total,
  currency,
  businessInfo,
  clientInfo,
  metadata: initialMetadata,
  paymentInfo = { advance_paid: 0 },
  introMessage: initialIntro,
  termsAndConditions,
  onAcceptQuote,
  onSaveChanges,
  onImageUpload,
  isEditable = false,
}) => {
  // ===== STATE =====
  const [metadata, setMetadata] = useState<QuoteMetadata>(initialMetadata);
  const [introMessage, setIntroMessage] = useState<string>(
    initialIntro ||
      `Thank you for considering ${businessInfo.name}. We've carefully prepared this quote to align with your specific needs. Please review the details, and if everything looks good, feel free to reach us.`
  );
  const [items, setItems] = useState<QuoteLineItem[]>(initialItems);

  // ===== GROUP ITEMS BY ROOM =====
  const itemsByRoom = items.reduce((acc, item) => {
    const roomName = item.room_name || 'Other';
    if (!acc[roomName]) acc[roomName] = [];
    acc[roomName].push(item);
    return acc;
  }, {} as Record<string, QuoteLineItem[]>);

  // ===== HANDLERS =====
  const handleImageUpload = async (itemId: string, file: File) => {
    if (onImageUpload) {
      try {
        const newUrl = await onImageUpload(itemId, file);
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, image_url: newUrl } : item))
        );
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    } else {
      // Local preview fallback
      const url = URL.createObjectURL(file);
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, image_url: url } : item))
      );
    }
  };

  const handleSave = () => {
    if (onSaveChanges) {
      onSaveChanges({ metadata, introMessage, items });
    }
  };

  // ===== DEFAULT TERMS =====
  const defaultTerms = [
    `Validity: This quote is valid for ${metadata.validity_days || 14} days from the date of issuance.`,
    `Payment Terms: A ${paymentInfo.deposit_percentage || 50}% deposit is required to confirm the order. The remaining payment is due before delivery.`,
    'Lead Time: Expected delivery and installation within 2-4 weeks, depending on material availability.',
    'Cancellations: Orders can be cancelled within 2-4 weeks. After this period, a cancellation fee may apply.',
    'Contact: For any questions or changes, please contact us using the details above.',
  ];
  const terms = termsAndConditions || defaultTerms;

  const balancePayable = total - paymentInfo.advance_paid;

  // ===== RENDER =====
  return (
    <div
      className="max-w-4xl mx-auto bg-white"
      style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      {/* ========== HEADER SECTION ========== */}
      <div className="flex justify-between items-start p-8 pb-4">
        {/* Left: Business & Client Info */}
        <div className="flex-1 min-w-0 pr-6">
          {businessInfo.logo_url ? (
            <img
              src={businessInfo.logo_url}
              alt={businessInfo.name}
              className="h-10 mb-3 object-contain"
            />
          ) : (
            <h1 className="text-2xl font-bold text-stone-800 mb-3">{businessInfo.name}</h1>
          )}

          <div className="text-sm text-stone-600 space-y-0.5">
            <p className="text-stone-800">{businessInfo.name}</p>
            {businessInfo.email && <p>{businessInfo.email}</p>}
            {businessInfo.phone && <p>{businessInfo.phone}</p>}
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold text-stone-800">Prepared For:</p>
            <div className="text-sm text-stone-600 mt-1 space-y-0.5">
              <p className="text-stone-800">{clientInfo.name}</p>
              {clientInfo.email && <p>{clientInfo.email}</p>}
              {clientInfo.phone && <p>{clientInfo.phone}</p>}
            </div>
          </div>
        </div>

        {/* Right: Quote Metadata */}
        <div className="w-72 flex-shrink-0">
          <table className="text-sm w-full">
            <tbody>
              <tr>
                <td className="text-stone-500 py-1 pr-3 whitespace-nowrap">Quote#</td>
                <td className="font-bold text-stone-800 text-xl text-right">
                  {metadata.quote_number}
                </td>
              </tr>
              <tr>
                <td className="text-stone-500 py-1 pr-3 whitespace-nowrap">Date</td>
                <td className="text-right">
                  <EditableText
                    value={metadata.date}
                    onChange={(v) => setMetadata((prev) => ({ ...prev, date: v }))}
                    isEditable={isEditable}
                  />
                </td>
              </tr>
              <tr>
                <td className="text-stone-500 py-1 pr-3 whitespace-nowrap">Status</td>
                <td className="text-right">
                  <EditableText
                    value={metadata.status}
                    onChange={(v) => setMetadata((prev) => ({ ...prev, status: v }))}
                    isEditable={isEditable}
                  />
                </td>
              </tr>
              <tr>
                <td className="text-stone-500 py-1 pr-3 whitespace-nowrap">Services required?</td>
                <td className="text-right">
                  <EditableText
                    value={metadata.services_required || ''}
                    onChange={(v) => setMetadata((prev) => ({ ...prev, services_required: v }))}
                    isEditable={isEditable}
                    placeholder="—"
                  />
                </td>
              </tr>
              <tr>
                <td className="text-stone-500 py-1 pr-3 align-top whitespace-nowrap">
                  Expected Purchase &<br />
                  Installation date?
                </td>
                <td className="text-right align-top">
                  <EditableText
                    value={metadata.expected_purchase_date || ''}
                    onChange={(v) =>
                      setMetadata((prev) => ({ ...prev, expected_purchase_date: v }))
                    }
                    isEditable={isEditable}
                    placeholder="—"
                  />
                </td>
              </tr>
              <tr>
                <td className="text-stone-500 py-1 pr-3 align-top whitespace-nowrap">
                  How did you hear
                  <br />
                  about {businessInfo.name}?
                </td>
                <td className="text-right align-top">
                  <EditableText
                    value={metadata.referral_source || ''}
                    onChange={(v) => setMetadata((prev) => ({ ...prev, referral_source: v }))}
                    isEditable={isEditable}
                    placeholder="—"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Accent Line */}
      <div className="px-8 pb-3">
        <div className="w-2 h-1 rounded-full bg-amber-700"></div>
      </div>

      {/* ========== INTRO MESSAGE ========== */}
      <div className="px-8 pb-5">
        {isEditable ? (
          <EditableText
            value={introMessage}
            onChange={setIntroMessage}
            isEditable={true}
            multiline
            className="text-stone-600 text-sm leading-relaxed w-full"
          />
        ) : (
          <p className="text-stone-600 text-sm leading-relaxed">{introMessage}</p>
        )}
      </div>

      {/* ========== ITEMS TABLE ========== */}
      <div className="px-8">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ backgroundColor: '#E8E4DF' }}>
              <th className="text-left py-3 px-3 font-medium text-stone-700 text-xs w-24">
                Room / Window
              </th>
              <th className="text-left py-3 px-3 font-medium text-stone-700 text-xs w-20">
                Product Image
              </th>
              <th className="text-left py-3 px-3 font-medium text-stone-700 text-xs">
                Product Details
              </th>
              <th className="text-center py-3 px-3 font-medium text-stone-700 text-xs w-12">
                Qty
              </th>
              <th className="text-right py-3 px-3 font-medium text-stone-700 text-xs w-24 whitespace-nowrap">
                Unit Price
              </th>
              <th className="text-center py-3 px-3 font-medium text-stone-700 text-xs w-12">
                Prate
              </th>
              <th className="text-right py-3 px-3 font-medium text-stone-700 text-xs w-24">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(itemsByRoom).map(([roomName, roomItems]) => (
              <React.Fragment key={roomName}>
                {/* Room Header Row */}
                <tr style={{ backgroundColor: '#F5F3F0' }}>
                  <td colSpan={7} className="py-2 px-3 font-semibold text-stone-700">
                    {roomName}
                  </td>
                </tr>

                {/* Room Items */}
                {roomItems.map((item) => (
                  <tr key={item.id} className="border-b border-stone-200 align-top">
                    {/* Room/Window Name */}
                    <td className="py-3 px-3 text-stone-700 text-sm">{item.surface_name || ''}</td>

                    {/* Product Image */}
                    <td className="py-3 px-3">
                      <ImageUploader
                        imageUrl={item.image_url}
                        onUpload={(file) => handleImageUpload(item.id, file)}
                        isEditable={isEditable}
                      />
                    </td>

                    {/* Product Details & Breakdown */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-stone-800 mb-2">{item.name}</div>
                      {item.breakdown && item.breakdown.length > 0 && (
                        <table className="text-xs">
                          <tbody>
                            {item.breakdown.map((detail, idx) => (
                              <tr key={idx}>
                                <td className="text-stone-500 pr-3 py-0.5 whitespace-nowrap align-top">
                                  {detail.label}:
                                </td>
                                <td className="text-stone-700 py-0.5">{detail.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-3 text-center text-stone-700">{item.quantity || ''}</td>

                    {/* Unit Price */}
                    <td className="py-3 px-3 text-right text-stone-700 whitespace-nowrap">
                      {formatCurrency(item.unit_price || item.total, currency)}
                    </td>

                    {/* Prate */}
                    <td className="py-3 px-3 text-center text-stone-700">
                      {item.prate || item.quantity || ''}
                    </td>

                    {/* Total Price */}
                    <td className="py-3 px-3 text-right font-medium text-stone-800 whitespace-nowrap">
                      {formatCurrency(item.total, currency)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========== SUBTOTAL ========== */}
      <div className="px-8 py-4 flex justify-end gap-6">
        <span className="font-semibold text-stone-700">Subtotal:</span>
        <span className="font-bold text-stone-800 text-lg whitespace-nowrap">
          {formatCurrency(subtotal, currency)}
        </span>
      </div>

      <div className="px-8">
        <div className="border-t border-stone-200"></div>
      </div>

      {/* ========== PAYMENT SUMMARY ========== */}
      <div className="px-8 py-4 flex justify-between items-start">
        <div>
          <h3 className="font-bold text-stone-800 mb-2">Payment Summary</h3>
          <p className="text-sm text-stone-600">
            Advance Paid:{' '}
            <span className="text-stone-800 ml-4 whitespace-nowrap">
              {formatCurrency(paymentInfo.advance_paid, currency, false)}
            </span>
          </p>
        </div>

        <div className="text-sm text-right">
          <p className="mb-1">
            Total Order Value:{' '}
            <span className="font-bold text-stone-800 ml-2 whitespace-nowrap">
              {formatCurrency(total, currency, false)}
            </span>
          </p>
          <p>
            Balance Payable:{' '}
            <span className="font-bold text-stone-800 ml-2 whitespace-nowrap">
              {formatCurrency(balancePayable, currency, false)}
            </span>
          </p>
        </div>
      </div>

      <div className="px-8">
        <div className="border-t border-stone-200"></div>
      </div>

      {/* ========== TERMS & ACCEPT BUTTON ========== */}
      <div className="px-8 py-5 flex gap-6">
        {/* Terms */}
        <div className="flex-1">
          <h3 className="font-bold text-stone-800 mb-3">
            {businessInfo.name} Terms & Conditions:
          </h3>
          <div className="text-xs text-stone-600 space-y-1.5 leading-relaxed">
            {terms.map((term, idx) => (
              <p key={idx}>
                <span className="font-semibold">{idx + 1}.</span> {term}
              </p>
            ))}
          </div>
        </div>

        {/* Accept Button & Contact */}
        <div className="w-48 flex-shrink-0">
          {onAcceptQuote && (
            <button
              onClick={onAcceptQuote}
              className="w-full text-white font-medium py-3 px-4 rounded text-sm mb-4 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#9C8B7A' }}
            >
              View and Accept Quote
            </button>
          )}

          <div className="text-xs text-stone-600">
            <p className="font-semibold text-stone-800">{businessInfo.name}</p>
            {businessInfo.email && <p className="mt-1">{businessInfo.email}</p>}
            {businessInfo.phone && <p>{businessInfo.phone}</p>}
          </div>
        </div>
      </div>

      {/* ========== SAVE BUTTON (Edit Mode) ========== */}
      {isEditable && onSaveChanges && (
        <div className="px-8 pb-6">
          <button
            onClick={handleSave}
            className="w-full bg-amber-700 hover:bg-amber-800 text-white font-medium py-3 rounded transition-colors"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default QuoteTemplateHomekaara;
