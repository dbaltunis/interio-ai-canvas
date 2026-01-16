import React from "react";
import { Percent, Layers, Upload, Receipt, Calculator, Save, TrendingUp, Grid3X3, Settings2, Info, ArrowRight } from "lucide-react";

const MockCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card border border-border rounded-lg p-3 ${className}`}>{children}</div>
);

const MockInput = ({ label, value, suffix, highlight = false, helperText }: { label: string; value?: string; suffix?: string; highlight?: boolean; helperText?: string }) => (
  <div className="space-y-1">
    <label className="text-xs text-muted-foreground">{label}</label>
    <div className={`flex items-center gap-1 bg-background border rounded px-2 py-1.5 text-xs ${highlight ? "ring-2 ring-primary animate-pulse border-primary" : "border-border"}`}>
      <span className="text-foreground">{value}</span>
      {suffix && <span className="text-muted-foreground">{suffix}</span>}
    </div>
    {helperText && <p className="text-[10px] text-muted-foreground">{helperText}</p>}
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

const MockToggle = ({ label, description, checked = false, highlight = false }: { label: string; description?: string; checked?: boolean; highlight?: boolean }) => (
  <div className={`flex items-center justify-between py-2 ${highlight ? "bg-primary/10 rounded px-2 animate-pulse" : ""}`}>
    <div>
      <span className="text-xs font-medium">{label}</span>
      {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground">{checked ? "ON" : "OFF"}</span>
      <div className={`w-8 h-4 rounded-full ${checked ? "bg-primary" : "bg-muted"} relative`}>
        <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${checked ? "right-0.5" : "left-0.5"}`} />
      </div>
    </div>
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

const MockTabs = ({ tabs, activeTab, highlight }: { tabs: { id: string; label: string; icon: React.ElementType }[]; activeTab: string; highlight?: string }) => (
  <div className="flex bg-muted rounded-lg p-1 gap-1">
    {tabs.map((tab) => {
      const Icon = tab.icon;
      const isActive = tab.id === activeTab;
      const isHighlighted = tab.id === highlight;
      return (
        <div
          key={tab.id}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
            isActive ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
          } ${isHighlighted ? "ring-2 ring-primary animate-pulse" : ""}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {tab.label}
        </div>
      );
    })}
  </div>
);

// Step 1: Two-Tab Overview
export const PricingStep1 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Settings2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Pricing & Tax Tab Structure</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">This section has two main tabs:</p>
      <MockTabs
        tabs={[
          { id: "grids", label: "Pricing Grids", icon: Grid3X3 },
          { id: "settings", label: "Settings", icon: Settings2 }
        ]}
        activeTab="grids"
        highlight="grids"
      />
      <div className="mt-3 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Grid3X3 className="h-3 w-3 text-primary" />
          <span><strong>Pricing Grids:</strong> Upload and manage width×drop pricing matrices</span>
        </div>
        <div className="flex items-center gap-2">
          <Settings2 className="h-3 w-3 text-primary" />
          <span><strong>Settings:</strong> Tax, markup hierarchy, and category markups</span>
        </div>
      </div>
    </MockCard>
  </div>
);

// Step 2: Pricing Grids Dashboard
export const PricingStep2 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Grid3X3 className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Pricing Grids Tab</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="border border-primary rounded-lg p-2 bg-primary/5 animate-pulse">
          <div className="w-8 h-8 bg-primary/20 rounded mb-2" />
          <p className="text-xs font-medium">Roller Blinds</p>
          <p className="text-[10px] text-muted-foreground">3 price groups</p>
        </div>
        <div className="border border-border rounded-lg p-2">
          <div className="w-8 h-8 bg-muted rounded mb-2" />
          <p className="text-xs font-medium">Curtains</p>
          <p className="text-[10px] text-muted-foreground">2 price groups</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2">Click a card to view or edit the pricing grid</p>
    </MockCard>
  </div>
);

// Step 3: Upload Pricing Grid
export const PricingStep3 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Upload className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Upload New Grid</span>
      </div>
      <div className="border-2 border-dashed border-primary rounded-lg p-4 text-center bg-primary/5 animate-pulse">
        <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-xs text-muted-foreground mb-2">Upload width × drop pricing matrix</p>
        <MockButton highlight size="sm">
          <Upload className="h-3 w-3" />
          Upload CSV/Excel
        </MockButton>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Supported formats:</p>
        <p>• CSV with width columns, drop rows</p>
        <p>• Excel (.xlsx) pricing sheets</p>
      </div>
    </MockCard>
  </div>
);

// Step 4: Grid-Specific Markup
export const PricingStep4 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Percent className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Grid Markup</span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">Each pricing grid can have its own markup percentage:</p>
      <MockInput label="Grid Markup %" value="35" suffix="%" highlight helperText="Overrides category and default markup" />
      <div className="mt-2 p-2 bg-muted rounded text-xs">
        <span className="text-muted-foreground">Cost $100 → Sell </span>
        <span className="font-medium text-green-600">$135</span>
      </div>
    </MockCard>
  </div>
);

// Step 5: Markup Hierarchy
export const PricingStep5 = () => (
  <div className="space-y-3">
    <MockCard className="border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2 mb-3">
        <Info className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">How Markup is Applied</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1 bg-primary/20 px-2 py-1 rounded-full font-medium text-primary">
          <Grid3X3 className="h-3 w-3" />
          Pricing Grid
        </div>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <div className="bg-muted px-2 py-1 rounded-full font-medium">Category</div>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <div className="bg-muted px-2 py-1 rounded-full font-medium">Default</div>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <div className="bg-muted px-2 py-1 rounded-full border-2 border-dashed border-muted-foreground/30">Floor</div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-3">System checks each level in order. If grid has markup, it uses that. Otherwise falls back to category, then default, with minimum floor as absolute lowest.</p>
    </MockCard>
  </div>
);

// Step 6: Tax Type Selection
export const PricingStep6 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Tax Settings</span>
      </div>
      <MockSelect
        label="Tax Type"
        value="GST (Goods & Services Tax)"
        options={["No Tax", "VAT (Value Added Tax)", "GST (Goods & Services Tax)", "Sales Tax"]}
        highlight
      />
    </MockCard>
  </div>
);

// Step 7: Tax Rate
export const PricingStep7 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Tax Settings</span>
      </div>
      <MockInput label="Tax Rate (%)" value="10" suffix="%" highlight helperText="e.g., 10 for 10%, 20 for 20%" />
      <div className="mt-2 p-2 bg-muted rounded text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal:</span>
          <span>$1,000.00</span>
        </div>
        <div className="flex justify-between text-primary">
          <span>GST (10%):</span>
          <span>$100.00</span>
        </div>
        <div className="flex justify-between font-medium border-t border-border pt-1 mt-1">
          <span>Total:</span>
          <span>$1,100.00</span>
        </div>
      </div>
    </MockCard>
  </div>
);

// Step 8: Tax Inclusive Toggle
export const PricingStep8 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Tax Settings</span>
      </div>
      <div className="border-2 border-primary rounded-lg p-3 bg-primary/5">
        <MockToggle
          label="Tax Inclusive Pricing"
          description="Prices already include tax"
          checked={true}
          highlight
        />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-muted rounded">
          <p className="font-medium text-green-600">✓ ON</p>
          <p className="text-muted-foreground">$110 = $100 + $10 tax</p>
        </div>
        <div className="p-2 bg-muted rounded">
          <p className="font-medium">✗ OFF</p>
          <p className="text-muted-foreground">$100 + $10 tax = $110</p>
        </div>
      </div>
    </MockCard>
    <MockButton highlight>Save Tax Settings</MockButton>
  </div>
);

// Step 9: Default Markup
export const PricingStep9 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Global Markup Settings</span>
      </div>
      <MockInput label="Default Markup (%)" value="25" suffix="%" highlight helperText="Applied when no grid or category markup is set" />
      <div className="mt-2 p-2 bg-muted rounded">
        <div className="flex items-center gap-2 text-xs">
          <TrendingUp className="h-3 w-3 text-green-500" />
          <span>Cost $100 → Sell $125</span>
        </div>
      </div>
    </MockCard>
  </div>
);

// Step 10: Minimum Margin Floor
export const PricingStep10 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Global Markup Settings</span>
      </div>
      <MockInput label="Minimum Margin (Floor) (%)" value="15" suffix="%" highlight helperText="No item will ever have markup below this" />
      <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs">
        <p className="text-amber-600 dark:text-amber-400">⚠️ Even if a grid or category has lower markup, this floor ensures minimum profitability</p>
      </div>
    </MockCard>
    <MockButton highlight>Save Global Settings</MockButton>
  </div>
);

// Step 11: Category Markups
export const PricingStep11 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Category Markup</span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">Override default markup for specific categories (0 = use default)</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded bg-primary/10 animate-pulse">
          <label className="text-[10px] text-muted-foreground">Curtains</label>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs font-medium">30</span>
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </div>
        <div className="p-2 rounded hover:bg-muted">
          <label className="text-[10px] text-muted-foreground">Blinds</label>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs">25</span>
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </div>
        <div className="p-2 rounded hover:bg-muted">
          <label className="text-[10px] text-muted-foreground">Hardware</label>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs">40</span>
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        </div>
        <div className="p-2 rounded hover:bg-muted">
          <label className="text-[10px] text-muted-foreground">Installation</label>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs">0</span>
            <span className="text-xs text-muted-foreground">→ Default</span>
          </div>
        </div>
      </div>
    </MockCard>
  </div>
);

// Step 12: Save All Settings
export const PricingStep12 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Save className="h-4 w-4 text-green-500" />
        <span className="text-sm font-medium">Save Your Settings</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">Each section has its own save button:</p>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 bg-muted rounded">
          <span className="text-xs">Tax Settings</span>
          <MockButton size="sm">Save Tax</MockButton>
        </div>
        <div className="flex items-center justify-between p-2 bg-muted rounded">
          <span className="text-xs">Global Markup</span>
          <MockButton size="sm">Save Global</MockButton>
        </div>
        <div className="flex items-center justify-between p-2 bg-primary/10 rounded animate-pulse">
          <span className="text-xs">Category Markup</span>
          <MockButton size="sm" highlight>Save Category</MockButton>
        </div>
      </div>
    </MockCard>
    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
      <p className="text-blue-600 dark:text-blue-400">💡 Tip: Category markups can also be set per-template in Products → My Templates</p>
    </div>
  </div>
);
