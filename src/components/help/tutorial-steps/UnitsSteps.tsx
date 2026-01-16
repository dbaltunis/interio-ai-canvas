import React from "react";
import { Ruler, Square, DollarSign, Save, Check } from "lucide-react";

const MockCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card border border-border rounded-lg p-3 ${className}`}>{children}</div>
);

const MockButton = ({ children, highlight = false }: { children: React.ReactNode; highlight?: boolean }) => (
  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-primary text-primary-foreground ${highlight ? "ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse" : ""}`}>
    {children}
  </div>
);

const MockRadioGroup = ({ options, selected, highlight = false }: { options: string[]; selected: string; highlight?: boolean }) => (
  <div className={`space-y-2 ${highlight ? "bg-primary/10 rounded p-2 animate-pulse" : ""}`}>
    {options.map((option) => (
      <div key={option} className="flex items-center gap-2">
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${option === selected ? "border-primary" : "border-muted-foreground"}`}>
          {option === selected && <div className="w-2 h-2 rounded-full bg-primary" />}
        </div>
        <span className="text-xs">{option}</span>
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

export const UnitsStep1 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Ruler className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Measurement System</span>
      </div>
      <MockRadioGroup
        options={["Metric (cm, m)", "Imperial (inches, feet)", "Mixed (customize)"]}
        selected="Metric (cm, m)"
        highlight
      />
      <p className="text-xs text-muted-foreground mt-2">Choose your preferred measurement system for all calculations</p>
    </MockCard>
  </div>
);

export const UnitsStep2 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Ruler className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Length Units</span>
      </div>
      <div className="space-y-3">
        <MockSelect
          label="Primary Length Unit"
          value="Centimeters (cm)"
          options={["Millimeters (mm)", "Centimeters (cm)", "Meters (m)", "Inches (in)"]}
          highlight
        />
        <MockSelect
          label="Display Format"
          value="123.5 cm"
          options={["123.5 cm", "1235 mm", "1.235 m"]}
        />
      </div>
    </MockCard>
  </div>
);

export const UnitsStep3 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Square className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Area & Fabric Units</span>
      </div>
      <div className="space-y-3">
        <MockSelect
          label="Area Unit"
          value="Square Meters (m²)"
          options={["Square Meters (m²)", "Square Feet (ft²)"]}
          highlight
        />
        <MockSelect
          label="Fabric Unit"
          value="Linear Meters"
          options={["Linear Meters", "Yards", "Running Meters"]}
          highlight
        />
        <p className="text-xs text-muted-foreground">Used for fabric calculations and pricing</p>
      </div>
    </MockCard>
  </div>
);

export const UnitsStep4 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Currency Settings</span>
      </div>
      <MockSelect
        label="Currency"
        value="AUD ($) - Australian Dollar"
        options={["AUD ($) - Australian Dollar", "USD ($) - US Dollar", "GBP (£) - British Pound", "EUR (€) - Euro", "INR (₹) - Indian Rupee"]}
        highlight
      />
      <div className="mt-3 p-2 bg-muted rounded">
        <p className="text-xs text-muted-foreground">Preview: <span className="font-medium text-foreground">$1,234.56</span></p>
      </div>
    </MockCard>
  </div>
);

export const UnitsStep5 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Check className="h-4 w-4 text-green-500" />
        <span className="text-sm font-medium">Preview Your Settings</span>
      </div>
      <div className="bg-muted rounded p-3 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Width:</span>
          <span className="font-medium">150 cm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Drop:</span>
          <span className="font-medium">240 cm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Fabric:</span>
          <span className="font-medium">8.5 linear meters</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Price:</span>
          <span className="font-medium">$1,250.00 AUD</span>
        </div>
      </div>
    </MockCard>
    <div className="flex justify-end">
      <MockButton highlight>
        <Save className="h-3 w-3" />
        Save Units
      </MockButton>
    </div>
  </div>
);
