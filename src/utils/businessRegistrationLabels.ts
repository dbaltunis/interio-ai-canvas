// Dynamic field labels based on country for business registration numbers

export interface RegistrationLabels {
  abn: string | null;
  abnPlaceholder: string | null;
  abnHelpText: string | null;
  registration: string;
  registrationPlaceholder: string;
  registrationHelpText: string;
  taxNumber: string;
  taxNumberPlaceholder: string;
  taxNumberHelpText: string;
  legalRequirements: string[];
  bankFields: {
    primary: string;
    primaryPlaceholder: string;
    secondary?: string;
    secondaryPlaceholder?: string;
  };
}

export const getRegistrationLabels = (country: string): RegistrationLabels => {
  switch (country) {
    case 'Australia':
      return {
        abn: 'ABN (Australian Business Number)',
        abnPlaceholder: '11 222 333 444',
        abnHelpText: 'Your 11-digit ABN from the Australian Business Register. Required on all invoices for GST-registered businesses.',
        registration: 'ACN (Australian Company Number)',
        registrationPlaceholder: '123 456 789',
        registrationHelpText: 'Your 9-digit company number from ASIC. Required for companies (Pty Ltd, Ltd).',
        taxNumber: 'GST Registration Number',
        taxNumberPlaceholder: 'Enter GST registration number',
        taxNumberHelpText: 'Only required if registered for GST (turnover over $75,000 AUD).',
        legalRequirements: [
          'ABN must appear on all tax invoices',
          'Company name and ACN for registered companies',
          'GST amount must be shown separately if GST-registered',
          'Business address required'
        ],
        bankFields: {
          primary: 'BSB',
          primaryPlaceholder: '123-456',
          secondary: 'Account Number',
          secondaryPlaceholder: '12345678'
        }
      };
    case 'New Zealand':
      return {
        abn: null,
        abnPlaceholder: null,
        abnHelpText: null,
        registration: 'NZBN (NZ Business Number)',
        registrationPlaceholder: '9429000000000',
        registrationHelpText: 'Your 13-digit NZBN from the Companies Office. Unique identifier for your business.',
        taxNumber: 'GST Number',
        taxNumberPlaceholder: '123-456-789',
        taxNumberHelpText: 'IRD GST number. Required if turnover exceeds $60,000 NZD.',
        legalRequirements: [
          'GST number on tax invoices if GST-registered',
          'Business name and address',
          'Date of invoice and description of goods/services',
          'GST amount shown separately'
        ],
        bankFields: {
          primary: 'Bank Account Number',
          primaryPlaceholder: '12-3456-7890123-00'
        }
      };
    case 'United Kingdom':
      return {
        abn: null,
        abnPlaceholder: null,
        abnHelpText: null,
        registration: 'Company Registration Number',
        registrationPlaceholder: '12345678',
        registrationHelpText: 'Your 8-digit Companies House registration number. Required on all business correspondence for limited companies.',
        taxNumber: 'VAT Number',
        taxNumberPlaceholder: 'GB123456789',
        taxNumberHelpText: 'VAT registration number (starts with GB). Required if VAT-registered (turnover over £90,000).',
        legalRequirements: [
          'Company name and registration number',
          'Registered office address (if different from trading address)',
          'VAT number (if VAT-registered)',
          'Place of registration (England & Wales, Scotland, etc.)',
          'Directors\' names for stationery (optional)'
        ],
        bankFields: {
          primary: 'Sort Code',
          primaryPlaceholder: '12-34-56',
          secondary: 'Account Number',
          secondaryPlaceholder: '12345678'
        }
      };
    case 'United States':
      return {
        abn: null,
        abnPlaceholder: null,
        abnHelpText: null,
        registration: 'State Registration Number',
        registrationPlaceholder: 'Enter state registration',
        registrationHelpText: 'Your state business registration or Secretary of State filing number.',
        taxNumber: 'EIN (Employer Identification Number)',
        taxNumberPlaceholder: '12-3456789',
        taxNumberHelpText: 'Federal tax ID from the IRS. Required for businesses with employees or filing certain tax returns.',
        legalRequirements: [
          'Business name and address',
          'EIN or SSN for tax purposes',
          'State sales tax ID (if collecting sales tax)',
          'Invoice date and payment terms'
        ],
        bankFields: {
          primary: 'Routing Number (ABA)',
          primaryPlaceholder: '123456789',
          secondary: 'Account Number',
          secondaryPlaceholder: '1234567890'
        }
      };
    case 'Canada':
      return {
        abn: null,
        abnPlaceholder: null,
        abnHelpText: null,
        registration: 'Business Number (BN)',
        registrationPlaceholder: '123456789',
        registrationHelpText: 'Your 9-digit CRA Business Number. Used for all CRA program accounts.',
        taxNumber: 'GST/HST Number',
        taxNumberPlaceholder: '123456789 RT0001',
        taxNumberHelpText: 'GST/HST registration number. Required if taxable supplies exceed $30,000 CAD.',
        legalRequirements: [
          'GST/HST registration number on invoices',
          'Business legal name and address',
          'Provincial tax registration if applicable',
          'Date and payment terms'
        ],
        bankFields: {
          primary: 'Institution/Transit Number',
          primaryPlaceholder: '12345-678',
          secondary: 'Account Number',
          secondaryPlaceholder: '1234567'
        }
      };
    case 'Germany':
      return {
        abn: null,
        abnPlaceholder: null,
        abnHelpText: null,
        registration: 'Handelsregisternummer (HRB)',
        registrationPlaceholder: 'HRB 12345',
        registrationHelpText: 'Commercial register number from your local Amtsgericht.',
        taxNumber: 'Umsatzsteuer-ID (VAT ID)',
        taxNumberPlaceholder: 'DE123456789',
        taxNumberHelpText: 'Your EU VAT identification number (starts with DE). Required for B2B EU transactions.',
        legalRequirements: [
          'Full company name and legal form (GmbH, AG, etc.)',
          'Registered office address',
          'Commercial register number and court',
          'VAT-ID for intra-community supplies',
          'Managing directors\' names'
        ],
        bankFields: {
          primary: 'IBAN',
          primaryPlaceholder: 'DE89 3704 0044 0532 0130 00',
          secondary: 'BIC/SWIFT',
          secondaryPlaceholder: 'COBADEFFXXX'
        }
      };
    case 'France':
      return {
        abn: null,
        abnPlaceholder: null,
        abnHelpText: null,
        registration: 'SIRET Number',
        registrationPlaceholder: '123 456 789 00012',
        registrationHelpText: 'Your 14-digit SIRET from INSEE. Identifies your business establishment.',
        taxNumber: 'TVA Intracommunautaire',
        taxNumberPlaceholder: 'FR12345678901',
        taxNumberHelpText: 'Intra-community VAT number (starts with FR). Required for EU B2B transactions.',
        legalRequirements: [
          'Company name and legal form (SARL, SAS, etc.)',
          'SIRET number',
          'RCS registration and city',
          'Share capital amount',
          'TVA number for VAT-registered businesses'
        ],
        bankFields: {
          primary: 'IBAN',
          primaryPlaceholder: 'FR76 3000 6000 0112 3456 7890 189',
          secondary: 'BIC/SWIFT',
          secondaryPlaceholder: 'BNPAFRPP'
        }
      };
    case 'Italy':
      return {
        abn: null,
        abnPlaceholder: null,
        abnHelpText: null,
        registration: 'Codice Fiscale / Partita IVA',
        registrationPlaceholder: '12345678901',
        registrationHelpText: 'Your 11-digit fiscal code or VAT number from Agenzia delle Entrate.',
        taxNumber: 'Partita IVA (VAT Number)',
        taxNumberPlaceholder: 'IT12345678901',
        taxNumberHelpText: 'Italian VAT number (starts with IT). Required for all businesses.',
        legalRequirements: [
          'Company name and legal form (S.r.l., S.p.A., etc.)',
          'Registered office address',
          'Partita IVA and Codice Fiscale',
          'REA number and registration',
          'Share capital for companies'
        ],
        bankFields: {
          primary: 'IBAN',
          primaryPlaceholder: 'IT60 X054 2811 1010 0000 0123 456',
          secondary: 'BIC/SWIFT',
          secondaryPlaceholder: 'BLOPIT22'
        }
      };
    case 'Spain':
      return {
        abn: null,
        abnPlaceholder: null,
        abnHelpText: null,
        registration: 'CIF (Tax ID)',
        registrationPlaceholder: 'B12345678',
        registrationHelpText: 'Tax identification code from Agencia Tributaria.',
        taxNumber: 'NIF-IVA (VAT Number)',
        taxNumberPlaceholder: 'ESB12345678',
        taxNumberHelpText: 'Spanish VAT number (starts with ES). Required for intra-EU transactions.',
        legalRequirements: [
          'Company name and legal form (S.L., S.A., etc.)',
          'CIF/NIF number',
          'Registered address',
          'Commercial Registry data',
          'VAT number for EU transactions'
        ],
        bankFields: {
          primary: 'IBAN',
          primaryPlaceholder: 'ES91 2100 0418 4502 0005 1332',
          secondary: 'BIC/SWIFT',
          secondaryPlaceholder: 'CAIXESBBXXX'
        }
      };
    case 'Netherlands':
      return {
        abn: null,
        abnPlaceholder: null,
        abnHelpText: null,
        registration: 'KVK Number',
        registrationPlaceholder: '12345678',
        registrationHelpText: 'Your 8-digit Chamber of Commerce (KVK) registration number.',
        taxNumber: 'BTW Number (VAT)',
        taxNumberPlaceholder: 'NL123456789B01',
        taxNumberHelpText: 'Dutch VAT number (starts with NL). Required for VAT-registered businesses.',
        legalRequirements: [
          'Trade name and legal form (B.V., N.V., etc.)',
          'KVK number',
          'Registered office',
          'BTW number if VAT-registered',
          'Managing directors for BV/NV'
        ],
        bankFields: {
          primary: 'IBAN',
          primaryPlaceholder: 'NL91 ABNA 0417 1643 00',
          secondary: 'BIC/SWIFT',
          secondaryPlaceholder: 'ABNANL2A'
        }
      };
    case 'South Africa':
      return {
        abn: null,
        abnPlaceholder: null,
        abnHelpText: null,
        registration: 'Company Registration Number (CIPC)',
        registrationPlaceholder: '2020/123456/07',
        registrationHelpText: 'CIPC registration number. Format: YYYY/NNNNNN/NN for companies.',
        taxNumber: 'VAT Number',
        taxNumberPlaceholder: '4123456789',
        taxNumberHelpText: 'SARS VAT registration number. Required if turnover exceeds R1 million.',
        legalRequirements: [
          'Registered company name and number',
          'Physical and postal address',
          'VAT number if VAT-registered',
          'B-BBEE status level (for government work)',
          'Director details for Pty Ltd'
        ],
        bankFields: {
          primary: 'Branch Code',
          primaryPlaceholder: '123456',
          secondary: 'Account Number',
          secondaryPlaceholder: '1234567890'
        }
      };
    case 'India':
      return {
        abn: null,
        abnPlaceholder: null,
        abnHelpText: null,
        registration: 'CIN (Corporate Identity Number)',
        registrationPlaceholder: 'U12345MH2020PTC123456',
        registrationHelpText: 'MCA Corporate Identity Number for registered companies.',
        taxNumber: 'GSTIN (GST Number)',
        taxNumberPlaceholder: '22AAAAA0000A1Z5',
        taxNumberHelpText: '15-digit GST Identification Number. Required if turnover exceeds ₹40 lakh (₹20 lakh for services).',
        legalRequirements: [
          'Legal name and trade name',
          'GSTIN for GST-registered businesses',
          'PAN of the business',
          'Registered address with state code',
          'HSN/SAC codes for goods/services',
          'CIN for companies'
        ],
        bankFields: {
          primary: 'IFSC Code',
          primaryPlaceholder: 'HDFC0001234',
          secondary: 'Account Number',
          secondaryPlaceholder: '12345678901234'
        }
      };
    case 'Singapore':
      return {
        abn: null,
        abnPlaceholder: null,
        abnHelpText: null,
        registration: 'UEN (Unique Entity Number)',
        registrationPlaceholder: '202012345A',
        registrationHelpText: 'ACRA Unique Entity Number. Standard identifier for all Singapore entities.',
        taxNumber: 'GST Registration Number',
        taxNumberPlaceholder: 'M12345678A',
        taxNumberHelpText: 'GST number from IRAS. Required if turnover exceeds S$1 million.',
        legalRequirements: [
          'Registered company name',
          'UEN number',
          'GST number if registered',
          'Registered address in Singapore'
        ],
        bankFields: {
          primary: 'Bank Code/Branch Code',
          primaryPlaceholder: '7171-001',
          secondary: 'Account Number',
          secondaryPlaceholder: '1234567890'
        }
      };
    case 'Hong Kong':
      return {
        abn: null,
        abnPlaceholder: null,
        abnHelpText: null,
        registration: 'Company Registration Number',
        registrationPlaceholder: '1234567',
        registrationHelpText: 'CR number from Companies Registry. 7 or 8 digits.',
        taxNumber: 'Business Registration Number',
        taxNumberPlaceholder: '12345678-000-00-00-0',
        taxNumberHelpText: 'IRD Business Registration Certificate number.',
        legalRequirements: [
          'Company name in English and Chinese',
          'Business Registration Certificate number',
          'Registered office address',
          'CR number for limited companies'
        ],
        bankFields: {
          primary: 'Bank Code/Branch Code',
          primaryPlaceholder: '012-345',
          secondary: 'Account Number',
          secondaryPlaceholder: '123-456789-001'
        }
      };
    default:
      return {
        abn: null,
        abnPlaceholder: null,
        abnHelpText: null,
        registration: 'Company Registration Number',
        registrationPlaceholder: 'Enter company registration',
        registrationHelpText: 'Your official business registration number from the relevant authority.',
        taxNumber: 'Tax ID / VAT Number',
        taxNumberPlaceholder: 'Enter tax identification number',
        taxNumberHelpText: 'Your tax identification or VAT registration number.',
        legalRequirements: [
          'Business name and registration details',
          'Business address',
          'Tax registration if applicable'
        ],
        bankFields: {
          primary: 'IBAN / Account Number',
          primaryPlaceholder: 'Enter account details',
          secondary: 'SWIFT/BIC Code',
          secondaryPlaceholder: 'Enter SWIFT code'
        }
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
