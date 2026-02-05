// ============================================
// useQuoteTemplateData.ts
// Hook to transform existing data for the Homekaara template
// ============================================

import { useMemo } from 'react';
import { PreparedQuoteData, PreparedQuoteItem } from '@/utils/quotes/prepareQuoteData';
import { ClientBreakdownItem } from '@/utils/quotes/buildClientBreakdown';
import { 
  QuoteLineItem, 
  BusinessInfo, 
  ClientInfo, 
  QuoteMetadata,
  PaymentInfo,
  BreakdownItem 
} from '@/components/quotes/templates/QuoteTemplateHomekaara';

interface ProjectData {
  id: string;
  quote_number?: string;
  status?: string;
  created_at?: string;
  services_required?: string;
  expected_purchase_date?: string;
  referral_source?: string;
  validity_days?: number;
  advance_paid?: number;
  deposit_percentage?: number;
  intro_message?: string;
  terms_and_conditions?: string[];
}

interface BusinessSettings {
  company_name?: string;
  company_logo_url?: string;
  business_email?: string;
  business_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  currency?: string;
  tax_rate?: number;
}

interface Client {
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface UseQuoteTemplateDataProps {
  preparedQuoteData: PreparedQuoteData;
  projectData: ProjectData;
  businessSettings: BusinessSettings;
  client: Client;
}

interface QuoteTemplateData {
  items: QuoteLineItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  businessInfo: BusinessInfo;
  clientInfo: ClientInfo;
  metadata: QuoteMetadata;
  paymentInfo: PaymentInfo;
  introMessage?: string;
  termsAndConditions?: string[];
}

/**
 * Transforms ClientBreakdownItem to the template's BreakdownItem format
 */
const transformBreakdown = (breakdown?: ClientBreakdownItem[]): BreakdownItem[] | undefined => {
  if (!breakdown || breakdown.length === 0) return undefined;
  return breakdown.map(item => ({
    label: item.name || item.category || '',
    value: item.description || (item.total_cost ? `${item.total_cost}` : ''),
  })).filter(item => item.label || item.value);
};

/**
 * Transforms PreparedQuoteItem to QuoteLineItem for the template
 */
const transformItem = (item: PreparedQuoteItem): QuoteLineItem => {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.total,
    prate: item.quantity, // Default prate to quantity, adjust as needed
    image_url: item.image_url,
    breakdown: transformBreakdown(item.breakdown),
    room_name: item.room_name,
    room_id: item.room_id,
    surface_name: item.surface_name,
    treatment_type: item.treatment_type,
  };
};

/**
 * Format date for display
 */
const formatDate = (dateString?: string): string => {
  if (!dateString) return new Date().toLocaleDateString('en-GB');
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  } catch {
    return dateString;
  }
};

/**
 * Build full address string
 */
const buildAddress = (settings: BusinessSettings): string => {
  const parts = [
    settings.address,
    settings.city,
    settings.state,
    settings.zip_code,
    settings.country
  ].filter(Boolean);
  return parts.join(', ');
};

/**
 * Hook to transform existing app data into the format needed by QuoteTemplateHomekaara
 */
export const useQuoteTemplateData = ({
  preparedQuoteData,
  projectData,
  businessSettings,
  client,
}: UseQuoteTemplateDataProps): QuoteTemplateData => {
  return useMemo(() => {
    // Transform items
    const items: QuoteLineItem[] = preparedQuoteData.items.map(transformItem);

    // Build business info
    const businessInfo: BusinessInfo = {
      name: businessSettings.company_name || 'Your Business',
      logo_url: businessSettings.company_logo_url,
      email: businessSettings.business_email,
      phone: businessSettings.business_phone,
      address: buildAddress(businessSettings),
    };

    // Build client info
    const clientInfo: ClientInfo = {
      name: client.full_name || client.name || 'Client',
      email: client.email,
      phone: client.phone,
      address: client.address,
    };

    // Build metadata
    const metadata: QuoteMetadata = {
      quote_number: projectData.quote_number || projectData.id || 'N/A',
      date: formatDate(projectData.created_at),
      status: projectData.status || 'Draft',
      validity_days: projectData.validity_days || 14,
      services_required: projectData.services_required,
      expected_purchase_date: projectData.expected_purchase_date,
      referral_source: projectData.referral_source,
    };

    // Build payment info
    const paymentInfo: PaymentInfo = {
      advance_paid: projectData.advance_paid || 0,
      deposit_percentage: projectData.deposit_percentage || 50,
    };

    return {
      items,
      subtotal: preparedQuoteData.subtotal,
      taxAmount: preparedQuoteData.taxAmount,
      total: preparedQuoteData.total,
      currency: preparedQuoteData.currency,
      businessInfo,
      clientInfo,
      metadata,
      paymentInfo,
      introMessage: projectData.intro_message,
      termsAndConditions: projectData.terms_and_conditions,
    };
  }, [preparedQuoteData, projectData, businessSettings, client]);
};

export default useQuoteTemplateData;
