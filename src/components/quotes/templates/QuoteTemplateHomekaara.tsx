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

export interface DiscountInfo {
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
  scope?: 'all' | 'fabrics_only' | 'selected_items';
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

  // Discount
  discountInfo?: DiscountInfo;

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
// HELPER: Image Uploader Component (Enhanced)
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
      className={`w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 border border-stone-200 shadow-sm ${
        isEditable ? 'cursor-pointer hover:opacity-80 transition-opacity hover:border-amber-500' : ''
      }`}
      style={{ minWidth: '80px' }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Product"
          className="w-full h-full object-cover print-image"
          style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        />
      ) : (
        <div
          className={`w-full h-full bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center ${
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
  discountInfo,
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
  // Note: Use w-full instead of max-w-4xl to fit within PDF container (210mm A4 width)
  // Professional quote template with improved styling for print and digital viewing
  return (
    <div
      className="w-full bg-white quote-template-homekaara"
      style={{
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        WebkitPrintColorAdjust: 'exact',
        printColorAdjust: 'exact',
      }}
    >
      {/* ========== HEADER SECTION ========== */}
      {/* Note: p-6 padding to ensure content fits within A4 PDF bounds (210mm = ~794px) */}
      <div className="flex justify-between items-start p-6 pb-4 quote-header avoid-page-break">
        {/* Left: Business & Client Info */}
        <div className="flex-1 min-w-0 pr-6">
          {businessInfo.logo_url ? (
            <img
              src={businessInfo.logo_url}
              alt={businessInfo.name}
              className="h-12 mb-3 object-contain print-image"
              style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
            />
          ) : (
            <h1
              className="text-2xl font-bold mb-3"
              style={{ color: '#9C8B7A' }}
            >
              {businessInfo.name}
            </h1>
          )}

          <div className="text-sm text-stone-600 space-y-0.5">
            {!businessInfo.logo_url && (
              <p className="text-stone-800 font-medium">{businessInfo.name}</p>
            )}
            {businessInfo.email && <p>{businessInfo.email}</p>}
            {businessInfo.phone && <p>{businessInfo.phone}</p>}
          </div>

          <div
            className="mt-4 p-3 rounded-lg"
            style={{
              backgroundColor: '#F5F3F0',
              borderLeft: '3px solid #9C8B7A',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">
              Prepared For
            </p>
            <div className="text-sm text-stone-600 space-y-0.5">
              <p className="text-stone-800 font-semibold text-base">{clientInfo.name}</p>
              {clientInfo.email && <p>{clientInfo.email}</p>}
              {clientInfo.phone && <p>{clientInfo.phone}</p>}
              {clientInfo.address && (
                <p className="text-xs text-stone-500 mt-1">{clientInfo.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quote Metadata - Styled as a card */}
        <div
          className="w-64 max-w-[40%] flex-shrink rounded-lg overflow-hidden"
          style={{
            backgroundColor: '#F5F3F0',
            border: '1px solid #E7E5E4',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        >
          {/* Quote Number Header */}
          <div
            className="px-4 py-3 text-center"
            style={{
              backgroundColor: '#9C8B7A',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            <p className="text-white text-xs uppercase tracking-wide font-medium">Quote</p>
            <p className="text-white text-xl font-bold">{metadata.quote_number}</p>
          </div>

          {/* Metadata Fields */}
          <table className="text-sm w-full">
            <tbody>
              <tr className="border-b border-stone-200">
                <td className="text-stone-500 py-2 px-3 text-xs">Date</td>
                <td className="py-2 px-3 text-right font-medium text-stone-700">
                  <EditableText
                    value={metadata.date}
                    onChange={(v) => setMetadata((prev) => ({ ...prev, date: v }))}
                    isEditable={isEditable}
                  />
                </td>
              </tr>
              <tr className="border-b border-stone-200">
                <td className="text-stone-500 py-2 px-3 text-xs">Status</td>
                <td className="py-2 px-3 text-right">
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor:
                        metadata.status === 'Approved' || metadata.status === 'Accepted'
                          ? '#D1FAE5'
                          : metadata.status === 'Draft'
                          ? '#FEF3C7'
                          : '#E7E5E4',
                      color:
                        metadata.status === 'Approved' || metadata.status === 'Accepted'
                          ? '#047857'
                          : metadata.status === 'Draft'
                          ? '#92400E'
                          : '#57534E',
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact',
                    }}
                  >
                    {isEditable ? (
                      <EditableText
                        value={metadata.status}
                        onChange={(v) => setMetadata((prev) => ({ ...prev, status: v }))}
                        isEditable={isEditable}
                      />
                    ) : (
                      metadata.status
                    )}
                  </span>
                </td>
              </tr>
              {metadata.validity_days && (
                <tr className="border-b border-stone-200">
                  <td className="text-stone-500 py-2 px-3 text-xs">Valid For</td>
                  <td className="py-2 px-3 text-right font-medium text-stone-700 text-xs">
                    {metadata.validity_days} days
                  </td>
                </tr>
              )}
              {(metadata.services_required || isEditable) && (
                <tr className="border-b border-stone-200">
                  <td className="text-stone-500 py-2 px-3 text-xs align-top">Services</td>
                  <td className="py-2 px-3 text-right text-xs">
                    <EditableText
                      value={metadata.services_required || ''}
                      onChange={(v) => setMetadata((prev) => ({ ...prev, services_required: v }))}
                      isEditable={isEditable}
                      placeholder="—"
                    />
                  </td>
                </tr>
              )}
              {(metadata.expected_purchase_date || isEditable) && (
                <tr>
                  <td className="text-stone-500 py-2 px-3 text-xs align-top">Expected Date</td>
                  <td className="py-2 px-3 text-right text-xs">
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
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accent Line */}
      <div className="px-6 pb-3">
        <div
          className="h-1 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #9C8B7A 0%, #D4C4B5 50%, transparent 100%)',
            width: '120px',
          }}
        ></div>
      </div>

      {/* ========== INTRO MESSAGE ========== */}
      <div className="px-6 pb-5">
        {isEditable ? (
          <EditableText
            value={introMessage}
            onChange={setIntroMessage}
            isEditable={true}
            multiline
            className="text-stone-600 text-sm leading-relaxed w-full"
          />
        ) : (
          <p className="text-stone-600 text-sm leading-relaxed italic">"{introMessage}"</p>
        )}
      </div>

      {/* ========== ITEMS TABLE ========== */}
      <div className="px-6 avoid-page-break">
        <table className="w-full text-sm border-collapse quote-items-table" style={{ tableLayout: 'fixed' }}>
          <thead style={{ display: 'table-header-group' }}>
            <tr
              style={{
                backgroundColor: '#9C8B7A',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <th
                className="text-left py-3 px-3 font-semibold text-white text-xs uppercase tracking-wide"
                style={{ width: '100px' }}
              >
                Window
              </th>
              <th
                className="text-left py-3 px-3 font-semibold text-white text-xs uppercase tracking-wide"
                style={{ width: '90px' }}
              >
                Image
              </th>
              <th className="text-left py-3 px-3 font-semibold text-white text-xs uppercase tracking-wide">
                Product Details
              </th>
              <th
                className="text-center py-3 px-3 font-semibold text-white text-xs uppercase tracking-wide"
                style={{ width: '50px' }}
              >
                Qty
              </th>
              <th
                className="text-right py-3 px-3 font-semibold text-white text-xs uppercase tracking-wide"
                style={{ width: '90px' }}
              >
                Unit&nbsp;Price
              </th>
              <th
                className="text-right py-3 px-3 font-semibold text-white text-xs uppercase tracking-wide"
                style={{ width: '100px' }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(itemsByRoom).map(([roomName, roomItems]) => (
              <React.Fragment key={roomName}>
                {/* Room Header Row - Styled as section divider */}
                <tr
                  className="room-header-row"
                  style={{
                    backgroundColor: '#E8E4DF',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}
                >
                  <td
                    colSpan={6}
                    className="py-2.5 px-3 font-bold text-stone-800 text-sm border-l-4 border-amber-600"
                  >
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-600"></span>
                      {roomName}
                    </span>
                  </td>
                </tr>

                {/* Room Items - Alternating colors for readability */}
                {roomItems.map((item, itemIndex) => (
                  <tr
                    key={item.id}
                    className="quote-item-row align-top"
                    style={{
                      backgroundColor: itemIndex % 2 === 0 ? '#FFFFFF' : '#FAFAF9',
                      borderBottom: '1px solid #E7E5E4',
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid',
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact',
                    }}
                  >
                    {/* Surface/Window Name */}
                    <td className="py-4 px-3 text-stone-700 text-sm font-medium">
                      {item.surface_name || '—'}
                    </td>

                    {/* Product Image - Larger and better styled */}
                    <td className="py-4 px-3">
                      <ImageUploader
                        imageUrl={item.image_url}
                        onUpload={(file) => handleImageUpload(item.id, file)}
                        isEditable={isEditable}
                      />
                    </td>

                    {/* Product Details & Breakdown - Enhanced styling */}
                    <td className="py-4 px-3">
                      <div
                        className="font-bold text-stone-900 mb-2 text-sm"
                        style={{ color: '#44403C' }}
                      >
                        {item.name}
                      </div>
                      {item.breakdown && item.breakdown.length > 0 && (
                        <div
                          className="bg-stone-50 rounded-md p-2 mt-1"
                          style={{
                            backgroundColor: '#F5F5F4',
                            WebkitPrintColorAdjust: 'exact',
                            printColorAdjust: 'exact',
                          }}
                        >
                          <table className="text-xs w-full">
                            <tbody>
                              {item.breakdown.map((detail, idx) => (
                                <tr key={idx}>
                                  <td
                                    className="text-stone-500 pr-3 py-1 whitespace-nowrap align-top font-medium"
                                    style={{ width: '40%' }}
                                  >
                                    {detail.label}:
                                  </td>
                                  <td className="text-stone-700 py-1">{detail.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </td>

                    {/* Quantity */}
                    <td className="py-4 px-3 text-center text-stone-700 font-medium">
                      {item.quantity || 1}
                    </td>

                    {/* Unit Price */}
                    <td className="py-4 px-3 text-right text-stone-700 whitespace-nowrap font-medium">
                      {formatCurrency(item.unit_price || item.total, currency)}
                    </td>

                    {/* Total Price - Highlighted */}
                    <td className="py-4 px-3 text-right font-bold text-stone-900 whitespace-nowrap">
                      {formatCurrency(item.total, currency)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* ========== TOTALS SECTION ========== */}
      <div className="px-6 py-5 avoid-page-break">
        <div className="flex justify-end">
          <div
            className="w-72 rounded-lg overflow-hidden"
            style={{
              backgroundColor: '#F5F3F0',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            {/* Subtotal */}
            <div className="flex justify-between items-center px-4 py-2.5 border-b border-stone-200">
              <span className="text-stone-600 text-sm">Subtotal</span>
              <span className="font-semibold text-stone-800 whitespace-nowrap">
                {formatCurrency(subtotal, currency)}
              </span>
            </div>

            {/* Discount row - only show if discount applied */}
            {discountInfo && discountInfo.amount > 0 && (
              <div className="flex justify-between items-center px-4 py-2.5 border-b border-stone-200">
                <span className="text-stone-600 text-sm">
                  Discount{discountInfo.type === 'percentage' ? ` (${discountInfo.value}%${discountInfo.scope === 'selected_items' ? ' on selected items' : discountInfo.scope === 'fabrics_only' ? ' on fabrics' : ''})` : ''}
                </span>
                <span className="text-red-600 font-medium whitespace-nowrap">
                  -{formatCurrency(discountInfo.amount, currency)}
                </span>
              </div>
            )}

            {/* Tax row if applicable */}
            {taxAmount > 0 && (
              <div className="flex justify-between items-center px-4 py-2.5 border-b border-stone-200">
                <span className="text-stone-600 text-sm">Tax (GST/VAT)</span>
                <span className="text-stone-800 whitespace-nowrap">
                  {formatCurrency(taxAmount, currency)}
                </span>
              </div>
            )}

            {/* Grand Total */}
            <div
              className="flex justify-between items-center px-4 py-3"
              style={{
                backgroundColor: '#9C8B7A',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <span className="text-white font-bold">TOTAL</span>
              <span className="text-white font-bold text-lg whitespace-nowrap">
                {formatCurrency(total, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== PAYMENT SUMMARY ========== */}
      <div className="px-6 py-4 avoid-page-break">
        <div
          className="rounded-lg p-4 flex justify-between items-start"
          style={{
            backgroundColor: '#FAFAFA',
            border: '1px solid #E7E5E4',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        >
          <div>
            <h3 className="font-bold text-stone-800 mb-2 flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: '#9C8B7A' }}
              ></span>
              Payment Summary
            </h3>
            {paymentInfo.advance_paid > 0 && (
              <p className="text-sm text-stone-600">
                Advance Paid:{' '}
                <span className="text-green-700 font-semibold ml-2 whitespace-nowrap">
                  {formatCurrency(paymentInfo.advance_paid, currency, false)}
                </span>
              </p>
            )}
            {paymentInfo.deposit_percentage && (
              <p className="text-xs text-stone-500 mt-1">
                Required deposit: {paymentInfo.deposit_percentage}% to confirm order
              </p>
            )}
          </div>

          <div className="text-right">
            <div className="mb-1">
              <span className="text-sm text-stone-600">Total Order Value:</span>
              <span className="font-bold text-stone-800 ml-3 whitespace-nowrap text-lg">
                {formatCurrency(total, currency, false)}
              </span>
            </div>
            <div
              className="inline-block px-3 py-1.5 rounded-md mt-1"
              style={{
                backgroundColor: balancePayable > 0 ? '#FEF3C7' : '#D1FAE5',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <span className="text-sm font-medium">
                Balance Payable:{' '}
                <span
                  className="font-bold whitespace-nowrap"
                  style={{ color: balancePayable > 0 ? '#92400E' : '#047857' }}
                >
                  {formatCurrency(balancePayable, currency, false)}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="px-6 py-2">
        <div className="border-t-2 border-stone-200"></div>
      </div>

      {/* ========== TERMS & ACCEPT BUTTON ========== */}
      <div className="px-6 py-5 flex gap-8 avoid-page-break">
        {/* Terms */}
        <div className="flex-1">
          <h3
            className="font-bold text-stone-800 mb-3 pb-2 border-b flex items-center gap-2"
            style={{ borderColor: '#9C8B7A' }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#9C8B7A' }}
            ></span>
            Terms & Conditions
          </h3>
          <div className="text-xs text-stone-600 space-y-2 leading-relaxed">
            {terms.map((term, idx) => (
              <div key={idx} className="flex gap-2">
                <span
                  className="font-bold text-white text-center rounded flex-shrink-0"
                  style={{
                    backgroundColor: '#9C8B7A',
                    minWidth: '18px',
                    height: '18px',
                    lineHeight: '18px',
                    fontSize: '10px',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}
                >
                  {idx + 1}
                </span>
                <span className="text-stone-700">{term}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Accept Button & Contact */}
        <div className="w-52 flex-shrink-0">
          {onAcceptQuote && (
            <button
              onClick={onAcceptQuote}
              className="w-full text-white font-semibold py-3.5 px-4 rounded-lg text-sm mb-4 hover:opacity-90 transition-all shadow-md no-print"
              style={{
                backgroundColor: '#9C8B7A',
                background: 'linear-gradient(135deg, #9C8B7A 0%, #7A6A5A 100%)',
              }}
            >
              ✓ Accept Quote
            </button>
          )}

          <div
            className="p-3 rounded-lg text-xs"
            style={{
              backgroundColor: '#F5F3F0',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            <p className="font-bold text-stone-800 mb-1">{businessInfo.name}</p>
            {businessInfo.email && (
              <p className="text-stone-600 break-all">{businessInfo.email}</p>
            )}
            {businessInfo.phone && (
              <p className="text-stone-600 mt-0.5">{businessInfo.phone}</p>
            )}
            {businessInfo.address && (
              <p className="text-stone-500 mt-1 text-xs leading-tight">
                {businessInfo.address}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ========== SAVE BUTTON (Edit Mode) ========== */}
      {isEditable && onSaveChanges && (
        <div className="px-6 pb-6">
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
