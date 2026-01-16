import React from "react";
import { Building2, Upload, MapPin, Phone, Mail, Receipt, CreditCard, FileText, Save, Globe, Landmark, Calendar, AlertCircle, Shield, Info, Edit3 } from "lucide-react";

const MockCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card border border-border rounded-lg p-3 ${className}`}>{children}</div>
);

const MockInput = ({ label, value, placeholder, icon: Icon, highlight = false, tooltip }: { label: string; value?: string; placeholder?: string; icon?: React.ElementType; highlight?: boolean; tooltip?: string }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-1">
      <label className="text-xs text-muted-foreground">{label}</label>
      {tooltip && <Info className="h-3 w-3 text-muted-foreground" />}
    </div>
    <div className={`flex items-center gap-2 bg-background border rounded px-2 py-1.5 text-xs ${highlight ? "ring-2 ring-primary animate-pulse border-primary" : "border-border"}`}>
      {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
      <span className={value ? "text-foreground" : "text-muted-foreground"}>{value || placeholder}</span>
    </div>
  </div>
);

const MockButton = ({ children, highlight = false, variant = "primary", size = "default" }: { children: React.ReactNode; highlight?: boolean; variant?: "primary" | "secondary" | "outline"; size?: "default" | "sm" }) => (
  <div className={`inline-flex items-center gap-1.5 rounded text-xs font-medium ${
    size === "sm" ? "px-2 py-1" : "px-3 py-1.5"
  } ${
    variant === "primary" ? "bg-primary text-primary-foreground" : 
    variant === "outline" ? "border border-border bg-background text-foreground" :
    "bg-secondary text-secondary-foreground"
  } ${highlight ? "ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse" : ""}`}>
    {children}
  </div>
);

const MockSelect = ({ label, value, options, highlight = false }: { label: string; value: string; options: string[]; highlight?: boolean }) => (
  <div className="space-y-1">
    <label className="text-xs text-muted-foreground">{label}</label>
    <div className={`bg-background border rounded px-2 py-1.5 text-xs ${highlight ? "ring-2 ring-primary animate-pulse border-primary" : "border-border"}`}>
      {value}
    </div>
    {highlight && (
      <div className="border border-border rounded mt-1 bg-popover text-xs max-h-20 overflow-hidden">
        {options.slice(0, 3).map((opt) => (
          <div key={opt} className={`px-2 py-1 ${opt === value ? "bg-accent" : "hover:bg-accent"}`}>{opt}</div>
        ))}
      </div>
    )}
  </div>
);

const MockToggle = ({ label, description, checked = false, highlight = false }: { label: string; description?: string; checked?: boolean; highlight?: boolean }) => (
  <div className={`flex items-center justify-between py-2 ${highlight ? "bg-primary/10 rounded px-2 animate-pulse" : ""}`}>
    <div>
      <span className="text-xs font-medium">{label}</span>
      {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
    </div>
    <div className={`w-8 h-4 rounded-full ${checked ? "bg-primary" : "bg-muted"} relative`}>
      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${checked ? "right-0.5" : "left-0.5"}`} />
    </div>
  </div>
);

const MockFormSection = ({ title, icon: Icon, children, showEdit = false }: { title: string; icon: React.ElementType; children: React.ReactNode; showEdit?: boolean }) => (
  <MockCard>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{title}</span>
      </div>
      {showEdit && (
        <MockButton variant="outline" size="sm">
          <Edit3 className="h-3 w-3" />
          Edit
        </MockButton>
      )}
    </div>
    {children}
  </MockCard>
);

const MockLogoUpload = ({ highlight = false }: { highlight?: boolean }) => (
  <div className={`border-2 border-dashed rounded-lg p-4 text-center ${highlight ? "border-primary animate-pulse bg-primary/5" : "border-border"}`}>
    <div className="w-12 h-12 rounded bg-muted mx-auto mb-2 flex items-center justify-center">
      <Building2 className="h-6 w-6 text-muted-foreground" />
    </div>
    <p className="text-xs text-muted-foreground mb-2">Drop logo here or click to upload</p>
    <MockButton highlight={highlight} size="sm">
      <Upload className="h-3 w-3" />
      Upload Logo
    </MockButton>
  </div>
);

// Step 1: Enter Company Details
export const BusinessStep1 = () => (
  <div className="space-y-3">
    <MockFormSection title="Company Information" icon={Building2}>
      <div className="space-y-3">
        <MockInput label="Trading Name" value="Elegant Interiors" icon={Building2} highlight />
        <MockInput label="Legal Name" value="Elegant Interiors Pty Ltd" highlight />
        <p className="text-[10px] text-muted-foreground">Legal name appears on invoices and contracts</p>
      </div>
    </MockFormSection>
  </div>
);

// Step 2: Select Organization Type
export const BusinessStep2 = () => (
  <div className="space-y-3">
    <MockFormSection title="Company Information" icon={Building2}>
      <MockSelect
        label="Organization Type"
        value="Pty Ltd (Private Company)"
        options={["Sole Trader", "Partnership", "Pty Ltd (Private Company)", "Corporation", "Non-Profit"]}
        highlight
      />
      <p className="text-xs text-muted-foreground mt-2">Affects tax and registration requirements</p>
    </MockFormSection>
  </div>
);

// Step 3: Upload Company Logo
export const BusinessStep3 = () => (
  <div className="space-y-3">
    <MockFormSection title="Company Information" icon={Building2}>
      <MockLogoUpload highlight />
      <p className="text-xs text-muted-foreground mt-2">Recommended: 500×200px PNG with transparent background</p>
    </MockFormSection>
  </div>
);

// Step 4: Select Country First
export const BusinessStep4 = () => (
  <div className="space-y-3">
    <MockFormSection title="Registration Numbers" icon={Receipt}>
      <MockSelect
        label="Country"
        value="🇦🇺 Australia"
        options={["🇦🇺 Australia", "🇺🇸 United States", "🇬🇧 United Kingdom", "🇮🇳 India", "🇳🇿 New Zealand"]}
        highlight
      />
      <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
        <p className="text-blue-600 dark:text-blue-400">💡 Registration labels change based on country selection</p>
      </div>
    </MockFormSection>
  </div>
);

// Step 5: Enter Registration Numbers
export const BusinessStep5 = () => (
  <div className="space-y-3">
    <MockFormSection title="Registration Numbers" icon={Receipt}>
      <div className="space-y-3">
        <MockInput label="ABN (Australian Business Number)" value="12 345 678 901" highlight tooltip="Required for valid tax invoices" />
        <MockInput label="ACN (Australian Company Number)" value="123 456 789" highlight />
        <p className="text-xs text-muted-foreground">Labels shown are for Australia. Other countries show different fields (VAT, EIN, GST, etc.)</p>
      </div>
    </MockFormSection>
  </div>
);

// Step 6: Tax Identification
export const BusinessStep6 = () => (
  <div className="space-y-3">
    <MockFormSection title="Registration Numbers" icon={Receipt}>
      <MockInput label="Tax Number" value="GST123456789" highlight tooltip="Your tax registration number" />
      <p className="text-xs text-muted-foreground mt-2">Required for valid tax invoices in most jurisdictions</p>
    </MockFormSection>
  </div>
);

// Step 7: Contact Details
export const BusinessStep7 = () => (
  <div className="space-y-3">
    <MockFormSection title="Contact Details" icon={Phone}>
      <div className="space-y-3">
        <MockInput label="Business Email" value="info@elegantinteriors.com.au" icon={Mail} highlight />
        <MockInput label="Business Phone" value="+61 2 9876 5432" icon={Phone} highlight />
        <MockInput label="Website" value="www.elegantinteriors.com.au" icon={Globe} />
      </div>
    </MockFormSection>
  </div>
);

// Step 8: Business Address
export const BusinessStep8 = () => (
  <div className="space-y-3">
    <MockFormSection title="Business Address" icon={MapPin}>
      <div className="space-y-3">
        <MockInput label="Street Address" value="123 Design Street" icon={MapPin} highlight />
        <div className="grid grid-cols-2 gap-2">
          <MockInput label="City" value="Sydney" highlight />
          <MockInput label="State" value="NSW" highlight />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <MockInput label="Post Code" value="2000" highlight />
          <MockInput label="Country" value="Australia" />
        </div>
      </div>
    </MockFormSection>
  </div>
);

// Step 9: Payment Terms
export const BusinessStep9 = () => (
  <div className="space-y-3">
    <MockFormSection title="Financial Settings" icon={Calendar}>
      <MockSelect
        label="Default Payment Terms"
        value="14 days"
        options={["7 days", "14 days", "21 days", "30 days", "45 days", "60 days"]}
        highlight
      />
      <p className="text-xs text-muted-foreground mt-2">Applied to new quotes and invoices by default</p>
    </MockFormSection>
  </div>
);

// Step 10: Financial Year End
export const BusinessStep10 = () => (
  <div className="space-y-3">
    <MockFormSection title="Financial Settings" icon={Calendar}>
      <div className="grid grid-cols-2 gap-3">
        <MockSelect label="Month" value="June" options={["June", "December", "March"]} highlight />
        <MockSelect label="Day" value="30" options={["30", "31", "28"]} highlight />
      </div>
      <p className="text-xs text-muted-foreground mt-2">For reporting and tax calculations</p>
    </MockFormSection>
  </div>
);

// Step 11: Bank Details Header
export const BusinessStep11 = () => (
  <div className="space-y-3">
    <MockFormSection title="Payment Details" icon={Landmark}>
      <div className="space-y-3">
        <MockInput label="Bank Name" value="Commonwealth Bank" icon={Landmark} highlight />
        <MockInput label="Account Name" value="Elegant Interiors Pty Ltd" highlight />
      </div>
      <p className="text-xs text-muted-foreground mt-2">Displayed on invoices for client payments</p>
    </MockFormSection>
  </div>
);

// Step 12: Country-Specific Banking
export const BusinessStep12 = () => (
  <div className="space-y-3">
    <MockFormSection title="Payment Details" icon={Landmark}>
      <div className="p-2 bg-muted/50 rounded mb-3">
        <p className="text-[10px] text-muted-foreground font-medium">Fields shown based on country:</p>
      </div>
      <div className="space-y-2">
        <div className="p-2 border border-primary rounded bg-primary/5">
          <p className="text-xs font-medium mb-2">🇦🇺 Australia:</p>
          <div className="grid grid-cols-2 gap-2">
            <MockInput label="BSB" value="062-000" highlight />
            <MockInput label="Account Number" value="1234 5678" highlight />
          </div>
        </div>
        <div className="p-2 border border-border rounded opacity-60">
          <p className="text-xs font-medium mb-1">🇬🇧 UK: Sort Code + Account</p>
          <p className="text-xs font-medium">🇪🇺 EU: IBAN + SWIFT/BIC</p>
        </div>
      </div>
    </MockFormSection>
  </div>
);

// Step 13: Invoice Settings - Reference Prefix
export const BusinessStep13 = () => (
  <div className="space-y-3">
    <MockFormSection title="Invoice Settings" icon={FileText}>
      <MockInput label="Payment Reference Prefix" value="INV" highlight />
      <div className="mt-2 p-2 bg-muted rounded text-xs">
        <span className="text-muted-foreground">Preview: </span>
        <span className="font-medium">INV-2026-0001</span>
      </div>
    </MockFormSection>
  </div>
);

// Step 14: Late Payment Policies
export const BusinessStep14 = () => (
  <div className="space-y-3">
    <MockFormSection title="Invoice Settings" icon={FileText}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <MockInput label="Interest Rate (%)" value="2.0" highlight />
          <MockInput label="Late Fee ($)" value="25.00" highlight />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Late Payment Terms</label>
          <div className="bg-background border border-primary rounded px-2 py-2 text-xs ring-2 ring-primary animate-pulse">
            <p className="text-foreground">Payment due within terms. 2% monthly interest applies to overdue amounts.</p>
          </div>
        </div>
      </div>
    </MockFormSection>
  </div>
);

// Step 15: Advanced Settings (Admin Only)
export const BusinessStep15 = () => (
  <div className="space-y-3">
    <MockFormSection title="Advanced Settings" icon={Shield}>
      <div className="flex items-center gap-2 mb-2 text-xs text-amber-600 dark:text-amber-400">
        <Shield className="h-3 w-3" />
        <span className="font-medium">Admin Only</span>
      </div>
      <MockToggle
        label="Allow in-app template editing"
        description="Let users modify document templates within the app"
        checked={false}
        highlight
      />
    </MockFormSection>
  </div>
);

// Step 16: Save Pattern
export const BusinessStep16 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Section-Based Saving</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">Each section saves independently. Click Edit to modify, then Save or Cancel.</p>
      <div className="flex items-center gap-2">
        <MockButton variant="outline" size="sm">
          <Edit3 className="h-3 w-3" />
          Edit
        </MockButton>
        <span className="text-xs text-muted-foreground">→</span>
        <MockButton size="sm" highlight>
          <Save className="h-3 w-3" />
          Save
        </MockButton>
        <MockButton variant="outline" size="sm">Cancel</MockButton>
      </div>
    </MockCard>
    <div className="p-2 bg-green-500/10 border border-green-500/20 rounded flex items-center gap-2">
      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
        <Save className="h-3 w-3 text-green-500" />
      </div>
      <span className="text-xs text-green-600 dark:text-green-400">Settings saved successfully</span>
    </div>
  </div>
);
