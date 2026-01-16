import React from "react";
import { Percent, Layers, Upload, Receipt, Calculator, Save, TrendingUp } from "lucide-react";

const MockCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card border border-border rounded-lg p-3 ${className}`}>{children}</div>
);

const MockInput = ({ label, value, suffix, highlight = false }: { label: string; value?: string; suffix?: string; highlight?: boolean }) => (
  <div className="space-y-1">
    <label className="text-xs text-muted-foreground">{label}</label>
    <div className={`flex items-center gap-1 bg-background border rounded px-2 py-1.5 text-xs ${highlight ? "ring-2 ring-primary animate-pulse" : "border-border"}`}>
      <span className="text-foreground">{value}</span>
      {suffix && <span className="text-muted-foreground">{suffix}</span>}
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

export const PricingStep1 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Percent className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Default Markup</span>
      </div>
      <MockInput label="Default Markup Percentage" value="25" suffix="%" highlight />
      <p className="text-xs text-muted-foreground mt-2">Applied to all products unless overridden at category level</p>
      <div className="mt-3 p-2 bg-muted rounded">
        <div className="flex items-center gap-2 text-xs">
          <TrendingUp className="h-3 w-3 text-green-500" />
          <span>Cost $100 → Sell $125</span>
        </div>
      </div>
    </MockCard>
  </div>
);

export const PricingStep2 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Category Markups</span>
      </div>
      <div className="space-y-2">
        <div className={`flex items-center justify-between p-2 rounded bg-primary/10 animate-pulse`}>
          <span className="text-xs">Curtains</span>
          <div className="flex items-center gap-1">
            <input className="w-12 text-xs text-right border rounded px-1 py-0.5" value="30" readOnly />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </div>
        <div className="flex items-center justify-between p-2 rounded hover:bg-muted">
          <span className="text-xs">Blinds</span>
          <div className="flex items-center gap-1">
            <input className="w-12 text-xs text-right border rounded px-1 py-0.5" value="25" readOnly />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </div>
        <div className="flex items-center justify-between p-2 rounded hover:bg-muted">
          <span className="text-xs">Hardware</span>
          <div className="flex items-center gap-1">
            <input className="w-12 text-xs text-right border rounded px-1 py-0.5" value="40" readOnly />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">Override default markup for specific categories</p>
    </MockCard>
  </div>
);

export const PricingStep3 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Upload className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Pricing Grids</span>
      </div>
      <div className={`border-2 border-dashed rounded-lg p-4 text-center border-primary animate-pulse bg-primary/5`}>
        <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-xs text-muted-foreground mb-2">Upload width x drop pricing matrix</p>
        <MockButton highlight>Upload CSV/Excel</MockButton>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Supported formats:</p>
        <p>• CSV with width columns, drop rows</p>
        <p>• Excel (.xlsx) pricing sheets</p>
      </div>
    </MockCard>
  </div>
);

export const PricingStep4 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Tax Configuration</span>
      </div>
      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Tax Type</label>
          <div className={`space-y-1 bg-primary/10 rounded p-2 animate-pulse`}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-primary flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
              <span className="text-xs">GST (Australia)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-muted-foreground" />
              <span className="text-xs text-muted-foreground">VAT</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-muted-foreground" />
              <span className="text-xs text-muted-foreground">Sales Tax</span>
            </div>
          </div>
        </div>
        <MockInput label="Tax Rate" value="10" suffix="%" highlight />
      </div>
    </MockCard>
  </div>
);

export const PricingStep5 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Tax Display</span>
      </div>
      <div className="space-y-2">
        <MockToggle
          label="Prices include tax"
          description="Show tax-inclusive prices to clients"
          checked={true}
          highlight
        />
        <MockToggle
          label="Show tax breakdown"
          description="Display tax amount separately on quotes"
          checked={true}
        />
      </div>
      <div className="mt-3 p-2 bg-muted rounded text-xs">
        <p className="text-muted-foreground mb-1">Preview:</p>
        <div className="space-y-0.5">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>$1,000.00</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>GST (10%):</span>
            <span>$100.00</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total:</span>
            <span>$1,100.00</span>
          </div>
        </div>
      </div>
    </MockCard>
  </div>
);

export const PricingStep6 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Pricing rules saved</p>
          <p className="text-xs text-muted-foreground">Applied to all new quotes</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
          <Save className="h-4 w-4 text-green-500" />
        </div>
      </div>
    </MockCard>
    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
      <p className="text-blue-600 dark:text-blue-400">💡 Tip: Category markups can also be set per-template in Products → My Templates → Pricing tab</p>
    </div>
    <div className="flex justify-end">
      <MockButton highlight>
        <Save className="h-3 w-3" />
        Save Pricing Rules
      </MockButton>
    </div>
  </div>
);
