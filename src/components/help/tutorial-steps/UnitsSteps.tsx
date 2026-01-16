import React from "react";
import { Ruler, Square, DollarSign, Save, Check, Settings } from "lucide-react";

const MockCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card border border-border rounded-lg p-3 ${className}`}>{children}</div>
);

const MockButton = ({ children, highlight = false }: { children: React.ReactNode; highlight?: boolean }) => (
  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-primary text-primary-foreground ${highlight ? "ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse" : ""}`}>
    {children}
  </div>
);

const MockRadioGroup = ({ options, selected, highlight = false }: { options: { value: string; label: string; description?: string }[]; selected: string; highlight?: boolean }) => (
  <div className={`space-y-2 ${highlight ? "bg-primary/10 rounded p-2 animate-pulse" : ""}`}>
    {options.map((option) => (
      <div key={option.value} className="flex items-start gap-2">
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 ${option.value === selected ? "border-primary" : "border-muted-foreground"}`}>
          {option.value === selected && <div className="w-2 h-2 rounded-full bg-primary" />}
        </div>
        <div>
          <span className="text-xs font-medium">{option.label}</span>
          {option.description && <p className="text-[10px] text-muted-foreground">{option.description}</p>}
        </div>
      </div>
    ))}
  </div>
);

const MockSelect = ({ label, value, options, highlight = false }: { label: string; value: string; options: string[]; highlight?: boolean }) => (
  <div className="space-y-1">
    <label className="text-xs text-muted-foreground">{label}</label>
    <div className={`bg-background border rounded px-2 py-1.5 text-xs ${highlight ? "ring-2 ring-primary animate-pulse border-primary" : "border-border"}`}>
      {value}
    </div>
    {highlight && (
      <div className="border border-border rounded mt-1 bg-popover text-xs">
        {options.map((opt) => (
          <div key={opt} className={`px-2 py-1 ${opt === value ? "bg-accent" : "hover:bg-accent"}`}>{opt}</div>
        ))}
      </div>
    )}
  </div>
);

const MockFormSection = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <MockCard>
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">{title}</span>
    </div>
    {children}
  </MockCard>
);

// Step 1: Choose Measurement System
export const UnitsStep1 = () => (
  <div className="space-y-3">
    <MockFormSection title="Measurement System" icon={Ruler}>
      <MockRadioGroup
        options={[
          { value: "metric", label: "Metric (cm, m)", description: "Centimeters, meters, square meters" },
          { value: "imperial", label: "Imperial (inches, feet)", description: "Inches, feet, square feet" },
          { value: "mixed", label: "Mixed (customize)", description: "Choose different units for each type" }
        ]}
        selected="metric"
        highlight
      />
      <p className="text-xs text-muted-foreground mt-3">This sets the default for all measurements. Mixed mode lets you customize each unit type.</p>
    </MockFormSection>
  </div>
);

// Step 2: Configure Length Units
export const UnitsStep2 = () => (
  <div className="space-y-3">
    <MockFormSection title="Length Units" icon={Ruler}>
      <MockSelect
        label="Primary Length Unit"
        value="Centimeters (cm)"
        options={["Millimeters (mm)", "Centimeters (cm)", "Meters (m)", "Inches (in)", "Feet (ft)"]}
        highlight
      />
      <div className="mt-3 p-2 bg-muted rounded text-xs">
        <span className="text-muted-foreground">Example: </span>
        <span className="font-medium">Width: 150 cm, Drop: 240 cm</span>
      </div>
      <p className="text-xs text-muted-foreground mt-2">Used for window widths, drops, and product dimensions</p>
    </MockFormSection>
  </div>
);

// Step 3: Configure Area Units
export const UnitsStep3 = () => (
  <div className="space-y-3">
    <MockFormSection title="Area Units" icon={Square}>
      <MockSelect
        label="Area Unit"
        value="Square Meters (m²)"
        options={["Square Meters (m²)", "Square Centimeters (cm²)", "Square Feet (ft²)", "Square Inches (in²)"]}
        highlight
      />
      <p className="text-xs text-muted-foreground mt-2">Used for room areas and coverage calculations</p>
    </MockFormSection>
  </div>
);

// Step 4: Configure Fabric Units
export const UnitsStep4 = () => (
  <div className="space-y-3">
    <MockFormSection title="Fabric Units" icon={Ruler}>
      <MockSelect
        label="Fabric Unit"
        value="Linear Meters (m)"
        options={["Linear Meters (m)", "Centimeters (cm)", "Yards (yd)", "Feet (ft)"]}
        highlight
      />
      <p className="text-xs text-muted-foreground mt-2">Used for fabric calculations and ordering quantities</p>
      <div className="mt-3 p-2 bg-muted rounded text-xs">
        <span className="text-muted-foreground">Example: </span>
        <span className="font-medium">8.5 linear meters required</span>
      </div>
    </MockFormSection>
  </div>
);

// Step 5: Select Currency
export const UnitsStep5 = () => (
  <div className="space-y-3">
    <MockFormSection title="Currency" icon={DollarSign}>
      <MockSelect
        label="Currency"
        value="AUD ($) - Australian Dollar"
        options={["AUD ($) - Australian Dollar", "USD ($) - US Dollar", "GBP (£) - British Pound", "EUR (€) - Euro", "INR (₹) - Indian Rupee", "NZD ($) - New Zealand Dollar"]}
        highlight
      />
      <div className="mt-3 p-2 bg-muted rounded text-xs">
        <span className="text-muted-foreground">Preview: </span>
        <span className="font-medium">$1,234.56 AUD</span>
      </div>
      <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
        <p className="text-blue-600 dark:text-blue-400">💡 Currency set here is used throughout all quotes, invoices, and pricing displays</p>
      </div>
    </MockFormSection>
  </div>
);

// Step 6: Preview and Save
export const UnitsStep6 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Check className="h-4 w-4 text-green-500" />
        <span className="text-sm font-medium">Settings Preview</span>
      </div>
      <div className="bg-muted rounded p-3 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">System:</span>
          <span className="font-medium">Metric</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Length:</span>
          <span className="font-medium">Centimeters (cm)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Area:</span>
          <span className="font-medium">Square Meters (m²)</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Fabric:</span>
          <span className="font-medium">Linear Meters</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2 mt-2">
          <span className="text-muted-foreground">Currency:</span>
          <span className="font-medium">AUD ($)</span>
        </div>
      </div>
    </MockCard>
    <div className="flex justify-end">
      <MockButton highlight>
        <Save className="h-3 w-3" />
        Save Units
      </MockButton>
    </div>
    <p className="text-xs text-muted-foreground">Changes apply to all new quotes and calculations</p>
  </div>
);
