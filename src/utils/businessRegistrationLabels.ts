// Dynamic field labels based on country for business registration numbers

export interface RegistrationLabels {
  abn: string | null;
  abnPlaceholder: string | null;
  registration: string;
  registrationPlaceholder: string;
  taxNumber: string;
  taxNumberPlaceholder: string;
}

export const getRegistrationLabels = (country: string): RegistrationLabels => {
  switch (country) {
    case 'Australia':
      return {
        abn: 'ABN (Australian Business Number)',
        abnPlaceholder: '11 222 333 444',
        registration: 'ACN (Australian Company Number)',
        registrationPlaceholder: '123 456 789',
        taxNumber: 'GST Registration Number',
        taxNumberPlaceholder: 'Enter GST registration number'
      };
    case 'New Zealand':
      return {
        abn: null,
        abnPlaceholder: null,
        registration: 'NZBN (NZ Business Number)',
        registrationPlaceholder: '9429000000000',
        taxNumber: 'GST Number',
        taxNumberPlaceholder: '123-456-789'
      };
    case 'United Kingdom':
      return {
        abn: null,
        abnPlaceholder: null,
        registration: 'Company Registration Number',
        registrationPlaceholder: '12345678',
        taxNumber: 'VAT Number',
        taxNumberPlaceholder: 'GB123456789'
      };
    case 'United States':
      return {
        abn: null,
        abnPlaceholder: null,
        registration: 'State Registration Number',
        registrationPlaceholder: 'Enter state registration',
        taxNumber: 'EIN (Employer Identification Number)',
        taxNumberPlaceholder: '12-3456789'
      };
    case 'Germany':
    case 'France':
    case 'Italy':
    case 'Spain':
    case 'Netherlands':
      return {
        abn: null,
        abnPlaceholder: null,
        registration: 'Company Registration Number',
        registrationPlaceholder: 'Enter company registration',
        taxNumber: 'VAT ID Number',
        taxNumberPlaceholder: 'Enter VAT ID (e.g., DE123456789)'
      };
    case 'South Africa':
      return {
        abn: null,
        abnPlaceholder: null,
        registration: 'Company Registration Number (CIPC)',
        registrationPlaceholder: 'Enter CIPC registration',
        taxNumber: 'VAT Number',
        taxNumberPlaceholder: '4123456789'
      };
    case 'India':
      return {
        abn: null,
        abnPlaceholder: null,
        registration: 'CIN (Corporate Identity Number)',
        registrationPlaceholder: 'Enter CIN',
        taxNumber: 'GST Number (GSTIN)',
        taxNumberPlaceholder: '22AAAAA0000A1Z5'
      };
    default:
      return {
        abn: null,
        abnPlaceholder: null,
        registration: 'Company Registration Number',
        registrationPlaceholder: 'Enter company registration',
        taxNumber: 'Tax ID / VAT Number',
        taxNumberPlaceholder: 'Enter tax identification number'
      };
  }
};

export const ORGANIZATION_TYPES = [
  { value: 'sole_trader', label: 'Sole Trader / Sole Proprietor' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'company', label: 'Company / Corporation' },
  { value: 'trust', label: 'Trust' },
  { value: 'llc', label: 'LLC (Limited Liability Company)' },
  { value: 'nonprofit', label: 'Non-Profit Organization' },
  { value: 'other', label: 'Other' }
];

export const PAYMENT_TERMS_OPTIONS = [
  { value: 0, label: 'Due on Receipt' },
  { value: 7, label: 'Net 7 (7 days)' },
  { value: 14, label: 'Net 14 (14 days)' },
  { value: 30, label: 'Net 30 (30 days)' },
  { value: 45, label: 'Net 45 (45 days)' },
  { value: 60, label: 'Net 60 (60 days)' },
  { value: 90, label: 'Net 90 (90 days)' }
];

export const COUNTRIES = [
  'Australia',
  'New Zealand',
  'United Kingdom',
  'United States',
  'Canada',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'Netherlands',
  'South Africa',
  'India',
  'Singapore',
  'Hong Kong',
  'Other'
];
