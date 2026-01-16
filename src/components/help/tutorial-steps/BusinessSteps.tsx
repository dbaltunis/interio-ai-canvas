import React from "react";
import { Building2, Upload, MapPin, Phone, Mail, Receipt, CreditCard, FileText, Save, Globe } from "lucide-react";

const MockCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card border border-border rounded-lg p-3 ${className}`}>{children}</div>
);

const MockInput = ({ label, value, placeholder, icon: Icon, highlight = false }: { label: string; value?: string; placeholder?: string; icon?: React.ElementType; highlight?: boolean }) => (
  <div className="space-y-1">
    <label className="text-xs text-muted-foreground">{label}</label>
    <div className={`flex items-center gap-2 bg-background border rounded px-2 py-1.5 text-xs ${highlight ? "ring-2 ring-primary animate-pulse" : "border-border"}`}>
      {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
      <span className={value ? "text-foreground" : "text-muted-foreground"}>{value || placeholder}</span>
    </div>
  </div>
);

const MockButton = ({ children, highlight = false, variant = "primary" }: { children: React.ReactNode; highlight?: boolean; variant?: "primary" | "secondary" }) => (
  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium ${
    variant === "primary" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
  } ${highlight ? "ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse" : ""}`}>
    {children}
  </div>
);

const MockLogoUpload = ({ highlight = false }: { highlight?: boolean }) => (
  <div className={`border-2 border-dashed rounded-lg p-4 text-center ${highlight ? "border-primary animate-pulse bg-primary/5" : "border-border"}`}>
    <div className="w-12 h-12 rounded bg-muted mx-auto mb-2 flex items-center justify-center">
      <Building2 className="h-6 w-6 text-muted-foreground" />
    </div>
    <p className="text-xs text-muted-foreground">Drop logo here or</p>
    <MockButton highlight={highlight}>
      <Upload className="h-3 w-3" />
      Upload Logo
    </MockButton>
  </div>
);

export const BusinessStep1 = () => (
  <div className="space-y-3">
    <MockLogoUpload highlight />
    <MockCard>
      <p className="text-xs text-muted-foreground">Your logo appears on quotes, invoices, and client communications. Recommended: 500x200px PNG with transparent background.</p>
    </MockCard>
  </div>
);

export const BusinessStep2 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="space-y-3">
        <MockInput label="Company Name" value="Elegant Interiors" icon={Building2} highlight />
        <MockInput label="Trading Name" value="Elegant Interiors Pty Ltd" highlight />
        <MockInput label="Address" value="123 Design Street" icon={MapPin} highlight />
        <div className="grid grid-cols-2 gap-2">
          <MockInput label="City" value="Sydney" />
          <MockInput label="Post Code" value="2000" />
        </div>
        <MockInput label="Phone" value="+61 2 9876 5432" icon={Phone} />
        <MockInput label="Email" value="info@elegantinteriors.com.au" icon={Mail} />
      </div>
    </MockCard>
  </div>
);

export const BusinessStep3 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Tax Registration</span>
      </div>
      <div className="space-y-3">
        <MockInput label="ABN / Tax ID" value="12 345 678 901" highlight />
        <MockInput label="GST Registration" value="GST123456" highlight />
        <p className="text-xs text-muted-foreground">Required for valid tax invoices</p>
      </div>
    </MockCard>
  </div>
);

export const BusinessStep4 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Globe className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Region & Currency</span>
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Country</label>
          <div className="bg-background border border-primary rounded px-2 py-1.5 text-xs animate-pulse ring-2 ring-primary">
            🇦🇺 Australia
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Currency</label>
          <div className="bg-background border border-primary rounded px-2 py-1.5 text-xs animate-pulse ring-2 ring-primary">
            AUD ($) - Australian Dollar
          </div>
        </div>
      </div>
    </MockCard>
  </div>
);

export const BusinessStep5 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <CreditCard className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Bank Details</span>
      </div>
      <div className="space-y-3">
        <MockInput label="Bank Name" value="Commonwealth Bank" highlight />
        <MockInput label="Account Name" value="Elegant Interiors Pty Ltd" highlight />
        <div className="grid grid-cols-2 gap-2">
          <MockInput label="BSB" value="062-000" highlight />
          <MockInput label="Account Number" value="1234 5678" highlight />
        </div>
        <p className="text-xs text-muted-foreground">Displayed on invoices for client payments</p>
      </div>
    </MockCard>
  </div>
);

export const BusinessStep6 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Document Preview</span>
      </div>
      <div className="bg-white border rounded p-2 text-xs">
        <div className="flex items-center justify-between border-b pb-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-6 bg-primary/20 rounded flex items-center justify-center">
              <Building2 className="h-3 w-3 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Elegant Interiors</p>
              <p className="text-[10px] text-muted-foreground">ABN: 12 345 678 901</p>
            </div>
          </div>
          <div className="text-right text-[10px] text-muted-foreground">
            <p>123 Design Street</p>
            <p>Sydney NSW 2000</p>
          </div>
        </div>
        <p className="text-muted-foreground">Your logo and details will appear like this on quotes...</p>
      </div>
    </MockCard>
  </div>
);

export const BusinessStep7 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Business settings saved</p>
          <p className="text-xs text-muted-foreground">All documents will use these details</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
          <Save className="h-4 w-4 text-green-500" />
        </div>
      </div>
    </MockCard>
    <div className="flex justify-end">
      <MockButton highlight>
        <Save className="h-3 w-3" />
        Save Settings
      </MockButton>
    </div>
  </div>
);
