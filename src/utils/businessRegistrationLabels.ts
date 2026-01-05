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
  // Universal requirements that apply to all countries
  legalRequirements: string[];
  // Country-specific notes (only when genuinely unique)
  countrySpecificNotes?: string[];
  bankFields: {
    primary: string;
    primaryPlaceholder: string;
    secondary?: string;
    secondaryPlaceholder?: string;
  };
  // Short labels for document footers
  registrationLabel: string;
  taxLabel: string;
}

// Universal legal requirements that apply to ALL countries
const UNIVERSAL_REQUIREMENTS = [
  'Business registration number required on invoices',
  'Company name and registration for registered entities',
  'Tax/VAT amount shown separately if tax-registered',
  'Business name and address required'
];

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
        registrationLabel: 'ACN',
        taxNumber: 'GST Registration Number',
        taxNumberPlaceholder: 'Enter GST registration number',
        taxNumberHelpText: 'Only required if registered for GST (turnover over $75,000 AUD).',
        taxLabel: 'GST',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
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
        registrationLabel: 'NZBN',
        taxNumber: 'GST Number',
        taxNumberPlaceholder: '123-456-789',
        taxNumberHelpText: 'IRD GST number. Required if turnover exceeds $60,000 NZD.',
        taxLabel: 'GST',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
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
        registrationLabel: 'Company Reg',
        taxNumber: 'VAT Number',
        taxNumberPlaceholder: 'GB123456789',
        taxNumberHelpText: 'VAT registration number (starts with GB). Required if VAT-registered (turnover over £90,000).',
        taxLabel: 'VAT',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
        countrySpecificNotes: [
          'Place of registration required (England & Wales, Scotland, etc.)',
          'Registered office address if different from trading address'
        ],
        bankFields: {
          primary: 'Sort Code',
          primaryPlaceholder: '12-34-56',
          secondary: 'Account Number',
          secondaryPlaceholder: '12345678'
        }
      };
    case 'Ireland':
      return {
        abn: null,
        abnPlaceholder: null,
        abnHelpText: null,
        registration: 'CRO Number',
        registrationPlaceholder: '123456',
        registrationHelpText: 'Your Companies Registration Office number. Required for all registered companies in Ireland.',
        registrationLabel: 'CRO',
        taxNumber: 'VAT Number',
        taxNumberPlaceholder: 'IE1234567A',
        taxNumberHelpText: 'Irish VAT number (starts with IE). Required if VAT-registered.',
        taxLabel: 'VAT',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
        bankFields: {
          primary: 'IBAN',
          primaryPlaceholder: 'IE64 IRCE 9205 0112 3456 78',
          secondary: 'BIC/SWIFT',
          secondaryPlaceholder: 'AABORIEL'
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
        registrationLabel: 'State Reg',
        taxNumber: 'EIN (Employer Identification Number)',
        taxNumberPlaceholder: '12-3456789',
        taxNumberHelpText: 'Federal tax ID from the IRS. Required for businesses with employees or filing certain tax returns.',
        taxLabel: 'EIN',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
        countrySpecificNotes: [
          'State sales tax ID required if collecting sales tax'
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
        registrationLabel: 'BN',
        taxNumber: 'GST/HST Number',
        taxNumberPlaceholder: '123456789 RT0001',
        taxNumberHelpText: 'GST/HST registration number. Required if taxable supplies exceed $30,000 CAD.',
        taxLabel: 'GST/HST',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
        countrySpecificNotes: [
          'Provincial tax registration may be required (PST/QST)'
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
        registrationLabel: 'HRB',
        taxNumber: 'Umsatzsteuer-ID (VAT ID)',
        taxNumberPlaceholder: 'DE123456789',
        taxNumberHelpText: 'Your EU VAT identification number (starts with DE). Required for B2B EU transactions.',
        taxLabel: 'USt-ID',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
        countrySpecificNotes: [
          'Share capital must be stated for GmbH/AG',
          'Managing directors\' names required on stationery'
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
        registrationLabel: 'SIRET',
        taxNumber: 'TVA Intracommunautaire',
        taxNumberPlaceholder: 'FR12345678901',
        taxNumberHelpText: 'Intra-community VAT number (starts with FR). Required for EU B2B transactions.',
        taxLabel: 'TVA',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
        countrySpecificNotes: [
          'RCS registration and city required',
          'Share capital must be stated for SARL/SAS'
        ],
        bankFields: {
          primary: 'IBAN',
          primaryPlaceholder: 'FR76 3000 6000 0112 3456 7890 189',
          secondary: 'BIC/SWIFT',
          secondaryPlaceholder: 'BNPAFRPP'
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
        registrationLabel: 'KVK',
        taxNumber: 'BTW Number (VAT)',
        taxNumberPlaceholder: 'NL123456789B01',
        taxNumberHelpText: 'Dutch VAT number (starts with NL). Required for VAT-registered businesses.',
        taxLabel: 'BTW',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
        bankFields: {
          primary: 'IBAN',
          primaryPlaceholder: 'NL91 ABNA 0417 1643 00',
          secondary: 'BIC/SWIFT',
          secondaryPlaceholder: 'ABNANL2A'
        }
      };
    case 'Lithuania':
      return {
        abn: null,
        abnPlaceholder: null,
        abnHelpText: null,
        registration: 'Company Code (Įmonės kodas)',
        registrationPlaceholder: '123456789',
        registrationHelpText: 'Your 9-digit company code from the Register of Legal Entities.',
        registrationLabel: 'Įmonės kodas',
        taxNumber: 'PVM Number (VAT)',
        taxNumberPlaceholder: 'LT123456789012',
        taxNumberHelpText: 'Lithuanian VAT number (starts with LT). Required for VAT-registered businesses.',
        taxLabel: 'PVM',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
        bankFields: {
          primary: 'IBAN',
          primaryPlaceholder: 'LT12 1000 0111 0100 1000',
          secondary: 'BIC/SWIFT',
          secondaryPlaceholder: 'HABALT22'
        }
      };
    case 'Poland':
      return {
        abn: null,
        abnPlaceholder: null,
        abnHelpText: null,
        registration: 'KRS / REGON Number',
        registrationPlaceholder: '0000123456',
        registrationHelpText: 'KRS (National Court Register) for companies or REGON (statistical ID) for businesses.',
        registrationLabel: 'KRS',
        taxNumber: 'NIP (Tax ID)',
        taxNumberPlaceholder: 'PL1234567890',
        taxNumberHelpText: 'Polish tax identification number. VAT-EU number starts with PL.',
        taxLabel: 'NIP',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
        bankFields: {
          primary: 'IBAN',
          primaryPlaceholder: 'PL61 1090 1014 0000 0712 1981 2874',
          secondary: 'BIC/SWIFT',
          secondaryPlaceholder: 'WBKPPLPP'
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
        registrationLabel: 'Codice Fiscale',
        taxNumber: 'Partita IVA (VAT Number)',
        taxNumberPlaceholder: 'IT12345678901',
        taxNumberHelpText: 'Italian VAT number (starts with IT). Required for all businesses.',
        taxLabel: 'P.IVA',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
        countrySpecificNotes: [
          'REA number and registration required',
          'Share capital for S.r.l./S.p.A.'
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
        registrationLabel: 'CIF',
        taxNumber: 'NIF-IVA (VAT Number)',
        taxNumberPlaceholder: 'ESB12345678',
        taxNumberHelpText: 'Spanish VAT number (starts with ES). Required for intra-EU transactions.',
        taxLabel: 'NIF-IVA',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
        bankFields: {
          primary: 'IBAN',
          primaryPlaceholder: 'ES91 2100 0418 4502 0005 1332',
          secondary: 'BIC/SWIFT',
          secondaryPlaceholder: 'CAIXESBBXXX'
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
        registrationLabel: 'CIPC Reg',
        taxNumber: 'VAT Number',
        taxNumberPlaceholder: '4123456789',
        taxNumberHelpText: 'SARS VAT registration number. Required if turnover exceeds R1 million.',
        taxLabel: 'VAT',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
        countrySpecificNotes: [
          'B-BBEE status level required for government contracts'
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
        registrationLabel: 'CIN',
        taxNumber: 'GSTIN (GST Number)',
        taxNumberPlaceholder: '22AAAAA0000A1Z5',
        taxNumberHelpText: '15-digit GST Identification Number. Required if turnover exceeds ₹40 lakh (₹20 lakh for services).',
        taxLabel: 'GSTIN',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
        countrySpecificNotes: [
          'PAN of the business required',
          'HSN/SAC codes for goods/services on invoices'
        ],
        bankFields: {
          primary: 'IFSC Code',
          primaryPlaceholder: 'HDFC0001234',
          secondary: 'Account Number',
          secondaryPlaceholder: '12345678901234'
        }
      };
    case 'Indonesia':
      return {
        abn: null,
        abnPlaceholder: null,
        abnHelpText: null,
        registration: 'NIB (Nomor Induk Berusaha)',
        registrationPlaceholder: '1234567890123',
        registrationHelpText: 'Your Business Identification Number from OSS (Online Single Submission).',
        registrationLabel: 'NIB',
        taxNumber: 'NPWP (Tax ID)',
        taxNumberPlaceholder: '12.345.678.9-012.345',
        taxNumberHelpText: 'Taxpayer Identification Number from the Directorate General of Taxes.',
        taxLabel: 'NPWP',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
        bankFields: {
          primary: 'Bank Code',
          primaryPlaceholder: '014',
          secondary: 'Account Number',
          secondaryPlaceholder: '1234567890'
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
        registrationLabel: 'UEN',
        taxNumber: 'GST Registration Number',
        taxNumberPlaceholder: 'M12345678A',
        taxNumberHelpText: 'GST number from IRAS. Required if turnover exceeds S$1 million.',
        taxLabel: 'GST',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
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
        registrationLabel: 'CR No.',
        taxNumber: 'Business Registration Number',
        taxNumberPlaceholder: '12345678-000-00-00-0',
        taxNumberHelpText: 'IRD Business Registration Certificate number.',
        taxLabel: 'BR No.',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
        countrySpecificNotes: [
          'Company name in both English and Chinese if registered bilingually'
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
        registrationLabel: 'Company Reg',
        taxNumber: 'Tax ID / VAT Number',
        taxNumberPlaceholder: 'Enter tax identification number',
        taxNumberHelpText: 'Your tax identification or VAT registration number.',
        taxLabel: 'Tax ID',
        legalRequirements: UNIVERSAL_REQUIREMENTS,
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
  'Ireland',
  'United States',
  'Canada',
  'Germany',
  'France',
  'Netherlands',
  'Lithuania',
  'Poland',
  'Italy',
  'Spain',
  'South Africa',
  'India',
  'Indonesia',
  'Singapore',
  'Hong Kong',
  'Other'
];
