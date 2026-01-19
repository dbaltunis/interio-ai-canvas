import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Percent, Layers, Upload, Receipt, Calculator, Save, TrendingUp, 
  Grid3X3, Settings2, Info, ArrowRight, Check 
} from "lucide-react";
import {
  AnimatedFormSection,
  AnimatedMockInput,
  AnimatedMockButton,
  AnimatedMockToggle,
  AnimatedMockSelect,
  AnimatedSuccessToast,
  AnimatedMockCard,
} from "../demo-components";

interface StepProps {
  phase?: number;
}

// ===========================================
// PRICING SETTINGS TUTORIAL - 12 INTERACTIVE STEPS
// Multi-phase animations for engaging experience
// ===========================================

// Animated tab component
const AnimatedMockTabs = ({ 
  tabs, 
  activeTab, 
  phase,
  highlightPhase = 0.3 
}: { 
  tabs: { id: string; label: string; icon: React.ElementType }[]; 
  activeTab: string;
  phase: number;
  highlightPhase?: number;
}) => {
  const isHighlighting = phase >= highlightPhase && phase < highlightPhase + 0.2;
  
  return (
    <motion.div 
      className="flex bg-muted rounded-lg p-1 gap-1"
      animate={isHighlighting ? { scale: [1, 1.02, 1] } : {}}
    >
      {tabs.map((tab, i) => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTab;
        const shouldHighlight = isHighlighting && isActive;
        
        return (
          <motion.div
            key={tab.id}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              isActive ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
            }`}
            animate={shouldHighlight ? { scale: [1, 1.05, 1] } : {}}
            transition={{ delay: i * 0.1 }}
          >
            <Icon className="h-3.5 w-3.5" />
            {tab.label}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// Animated grid card
const AnimatedGridCard = ({ 
  name, 
  groups, 
  phase,
  highlightPhase = 0.3,
  highlighted = false 
}: { 
  name: string; 
  groups: number;
  phase: number;
  highlightPhase?: number;
  highlighted?: boolean;
}) => {
  const isHighlighted = highlighted && phase >= highlightPhase;
  
  return (
    <motion.div
      className={`border rounded-lg p-2 transition-colors ${
        isHighlighted ? "border-primary bg-primary/5" : "border-border"
      }`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
      }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div 
        className={`w-8 h-8 rounded mb-2 ${isHighlighted ? "bg-primary/20" : "bg-muted"}`}
        animate={isHighlighted ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: isHighlighted ? Infinity : 0 }}
      />
      <p className="text-xs font-medium">{name}</p>
      <p className="text-[10px] text-muted-foreground">{groups} price groups</p>
    </motion.div>
  );
};

// Step 1: Two-Tab Overview
export const PricingStep1 = ({ phase = 0 }: StepProps) => {
  const showSection = phase > 0.1;
  const showTabs = phase > 0.25;
  const showDescriptions = phase > 0.5;

  return (
    <div className="space-y-3">
      <AnimatedMockCard phase={phase} revealPhase={0.1}>
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={phase > 0.15 ? { rotate: [0, 360] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Settings2 className="h-4 w-4 text-primary" />
          </motion.div>
          <span className="text-sm font-medium">Pricing & Tax Tab Structure</span>
        </div>
        <motion.p 
          className="text-xs text-muted-foreground mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: showSection ? 1 : 0 }}
        >
          This section has two main tabs:
        </motion.p>
        <AnimatePresence>
          {showTabs && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AnimatedMockTabs
                tabs={[
                  { id: "grids", label: "Pricing Grids", icon: Grid3X3 },
                  { id: "settings", label: "Settings", icon: Settings2 }
                ]}
                activeTab="grids"
                phase={phase}
                highlightPhase={0.35}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showDescriptions && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 space-y-2 text-xs"
            >
              {[
                { icon: Grid3X3, label: "Pricing Grids", desc: "Upload and manage width×drop pricing matrices" },
                { icon: Settings2, label: "Settings", desc: "Tax, markup hierarchy, and category markups" },
              ].map((item, i) => (
                <motion.div 
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2"
                >
                  <item.icon className="h-3 w-3 text-primary" />
                  <span><strong>{item.label}:</strong> {item.desc}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedMockCard>
    </div>
  );
};

// Step 2: Pricing Grids Dashboard
export const PricingStep2 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-3">
      <AnimatedMockCard phase={phase} revealPhase={0.1}>
        <div className="flex items-center gap-2 mb-3">
          <Grid3X3 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Pricing Grids Tab</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <AnimatedGridCard 
            name="Roller Blinds" 
            groups={3} 
            phase={phase}
            highlightPhase={0.3}
            highlighted
          />
          <AnimatedGridCard 
            name="Curtains" 
            groups={2} 
            phase={phase}
            highlightPhase={0.5}
            highlighted={false}
          />
        </div>
        <motion.p 
          className="text-xs text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.7 ? 1 : 0 }}
        >
          Click a card to view or edit the pricing grid
        </motion.p>
      </AnimatedMockCard>
    </div>
  );
};

// Step 3: Upload Pricing Grid
export const PricingStep3 = ({ phase = 0 }: StepProps) => {
  const showUploadArea = phase > 0.2;
  const uploadHighlight = phase > 0.4 && phase < 0.75;
  const showFormats = phase > 0.75;

  return (
    <div className="space-y-3">
      <AnimatedMockCard phase={phase} revealPhase={0.1}>
        <div className="flex items-center gap-2 mb-3">
          <Upload className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Upload New Grid</span>
        </div>
        <AnimatePresence>
          {showUploadArea && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                uploadHighlight ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <motion.div
                animate={uploadHighlight ? { y: [0, -5, 0] } : {}}
                transition={{ duration: 0.5, repeat: uploadHighlight ? Infinity : 0 }}
              >
                <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              </motion.div>
              <p className="text-xs text-muted-foreground mb-2">Upload width × drop pricing matrix</p>
              <AnimatedMockButton 
                phase={phase} 
                clickPhase={0.6}
                highlight={uploadHighlight}
                size="sm"
                icon={Upload}
              >
                Upload CSV/Excel
              </AnimatedMockButton>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showFormats && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs text-muted-foreground"
            >
              <p className="font-medium text-foreground mb-1">Supported formats:</p>
              <p>• CSV with width columns, drop rows</p>
              <p>• Excel (.xlsx) pricing sheets</p>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedMockCard>
    </div>
  );
};

// Step 4: Grid-Specific Markup
export const PricingStep4 = ({ phase = 0 }: StepProps) => {
  const showCalculation = phase > 0.6;

  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Grid Markup" icon={Percent} phase={phase} revealPhase={0.1}>
        <motion.p 
          className="text-xs text-muted-foreground mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.15 ? 1 : 0 }}
        >
          Each pricing grid can have its own markup percentage:
        </motion.p>
        <AnimatedMockInput 
          label="Grid Markup %" 
          value="35" 
          phase={phase}
          startPhase={0.25}
          endPhase={0.5}
        />
        <AnimatePresence>
          {showCalculation && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 bg-muted rounded text-xs"
            >
              <span className="text-muted-foreground">Cost $100 → Sell </span>
              <motion.span 
                className="font-medium text-green-600"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                $135
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedFormSection>
    </div>
  );
};

// Step 5: Markup Hierarchy
export const PricingStep5 = ({ phase = 0 }: StepProps) => {
  const levels = [
    { id: "grid", label: "Pricing Grid", icon: Grid3X3, primary: true },
    { id: "category", label: "Category", icon: null },
    { id: "default", label: "Default", icon: null },
    { id: "floor", label: "Floor", icon: null, dashed: true },
  ];

  return (
    <div className="space-y-3">
      <AnimatedMockCard phase={phase} revealPhase={0.1} className="border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">How Markup is Applied</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {levels.map((level, i) => (
            <React.Fragment key={level.id}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: phase > 0.2 + i * 0.15 ? 1 : 0, x: phase > 0.2 + i * 0.15 ? 0 : -10 }}
                className={`px-2 py-1 rounded-full font-medium ${
                  level.primary 
                    ? "bg-primary/20 text-primary flex items-center gap-1" 
                    : level.dashed 
                      ? "bg-muted border-2 border-dashed border-muted-foreground/30"
                      : "bg-muted"
                }`}
              >
                {level.icon && <level.icon className="h-3 w-3" />}
                {level.label}
              </motion.div>
              {i < levels.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: phase > 0.3 + i * 0.15 ? 1 : 0 }}
                >
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </div>
        <motion.p 
          className="text-[10px] text-muted-foreground mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.8 ? 1 : 0 }}
        >
          System checks each level in order. If grid has markup, it uses that. Otherwise falls back to category, then default, with minimum floor as absolute lowest.
        </motion.p>
      </AnimatedMockCard>
    </div>
  );
};

// Step 6: Tax Type Selection
export const PricingStep6 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Tax Settings" icon={Receipt} phase={phase} revealPhase={0.1}>
        <AnimatedMockSelect
          label="Tax Type"
          value="GST (Goods & Services Tax)"
          options={["No Tax", "VAT (Value Added Tax)", "GST (Goods & Services Tax)", "Sales Tax"]}
          phase={phase}
          openPhase={0.3}
          selectPhase={0.65}
        />
      </AnimatedFormSection>
    </div>
  );
};

// Step 7: Tax Rate
export const PricingStep7 = ({ phase = 0 }: StepProps) => {
  const showCalculation = phase > 0.6;

  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Tax Settings" icon={Receipt} phase={phase} revealPhase={0.1}>
        <AnimatedMockInput 
          label="Tax Rate (%)" 
          value="10" 
          phase={phase}
          startPhase={0.2}
          endPhase={0.5}
        />
        <AnimatePresence>
          {showCalculation && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 bg-muted rounded text-xs space-y-1"
            >
              {[
                { label: "Subtotal:", value: "$1,000.00", primary: false },
                { label: "GST (10%):", value: "$100.00", primary: true },
                { label: "Total:", value: "$1,100.00", bold: true },
              ].map((row, i) => (
                <motion.div 
                  key={row.label}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex justify-between ${row.primary ? "text-primary" : ""} ${row.bold ? "font-medium border-t border-border pt-1 mt-1" : ""}`}
                >
                  <span className={row.bold ? "" : "text-muted-foreground"}>{row.label}</span>
                  <span>{row.value}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedFormSection>
    </div>
  );
};

// Step 8: Tax Inclusive Toggle
export const PricingStep8 = ({ phase = 0 }: StepProps) => {
  const showComparison = phase > 0.6;

  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Tax Settings" icon={Receipt} phase={phase} revealPhase={0.1}>
        <motion.div 
          className="border-2 border-primary rounded-lg p-3 bg-primary/5"
          animate={phase > 0.3 && phase < 0.6 ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.5, repeat: phase > 0.3 && phase < 0.6 ? Infinity : 0 }}
        >
          <AnimatedMockToggle
            label="Tax Inclusive Pricing"
            description="Prices already include tax"
            checked={false}
            phase={phase}
            flipPhase={0.4}
          />
        </motion.div>
        <AnimatePresence>
          {showComparison && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 grid grid-cols-2 gap-2 text-xs"
            >
              <motion.div 
                className="p-2 bg-muted rounded"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-medium text-green-600">✓ ON</p>
                <p className="text-muted-foreground">$110 = $100 + $10 tax</p>
              </motion.div>
              <div className="p-2 bg-muted rounded">
                <p className="font-medium">✗ OFF</p>
                <p className="text-muted-foreground">$100 + $10 tax = $110</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedFormSection>
      <AnimatedMockButton phase={phase} clickPhase={0.85} highlight={phase > 0.75} icon={Save}>
        Save Tax Settings
      </AnimatedMockButton>
    </div>
  );
};

// Step 9: Default Markup
export const PricingStep9 = ({ phase = 0 }: StepProps) => {
  const showCalculation = phase > 0.6;

  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Global Markup Settings" icon={Calculator} phase={phase} revealPhase={0.1}>
        <AnimatedMockInput 
          label="Default Markup (%)" 
          value="25" 
          phase={phase}
          startPhase={0.2}
          endPhase={0.5}
        />
        <AnimatePresence>
          {showCalculation && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 bg-muted rounded"
            >
              <div className="flex items-center gap-2 text-xs">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5 }}>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                </motion.div>
                <span>Cost $100 → Sell $125</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedFormSection>
    </div>
  );
};

// Step 10: Minimum Margin Floor
export const PricingStep10 = ({ phase = 0 }: StepProps) => {
  const showWarning = phase > 0.6;

  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Global Markup Settings" icon={Calculator} phase={phase} revealPhase={0.1}>
        <AnimatedMockInput 
          label="Minimum Margin (Floor) (%)" 
          value="15" 
          phase={phase}
          startPhase={0.2}
          endPhase={0.5}
        />
        <AnimatePresence>
          {showWarning && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs"
            >
              <p className="text-amber-600 dark:text-amber-400">
                ⚠️ Even if a grid or category has lower markup, this floor ensures minimum profitability
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedFormSection>
      <AnimatedMockButton phase={phase} clickPhase={0.85} highlight={phase > 0.75} icon={Save}>
        Save Global Settings
      </AnimatedMockButton>
      <AnimatedSuccessToast message="Global settings saved!" phase={phase} showPhase={0.9} />
    </div>
  );
};

// Step 11: Category Markups
export const PricingStep11 = ({ phase = 0 }: StepProps) => {
  const categories = [
    { name: "Curtains", value: "30", highlighted: true },
    { name: "Blinds", value: "25", highlighted: false },
    { name: "Hardware", value: "40", highlighted: false },
    { name: "Installation", value: "0", isDefault: true, highlighted: false },
  ];

  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Category Markup" icon={Layers} phase={phase} revealPhase={0.1}>
        <motion.p 
          className="text-xs text-muted-foreground mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.15 ? 1 : 0 }}
        >
          Override default markup for specific categories (0 = use default)
        </motion.p>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ 
                opacity: phase > 0.2 + i * 0.1 ? 1 : 0, 
                scale: phase > 0.2 + i * 0.1 ? 1 : 0.95 
              }}
              className={`p-2 rounded transition-colors ${
                cat.highlighted && phase > 0.5 ? "bg-primary/10" : "hover:bg-muted"
              }`}
            >
              <label className="text-[10px] text-muted-foreground">{cat.name}</label>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-medium">{cat.value}</span>
                <span className="text-xs text-muted-foreground">
                  {cat.isDefault ? "→ Default" : "%"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatedFormSection>
    </div>
  );
};

// Step 12: Save All Settings
export const PricingStep12 = ({ phase = 0 }: StepProps) => {
  const sections = [
    { name: "Tax Settings", delay: 0 },
    { name: "Global Markup", delay: 0.1 },
    { name: "Category Markup", delay: 0.2, highlighted: true },
  ];

  return (
    <div className="space-y-3">
      <AnimatedMockCard phase={phase} revealPhase={0.1}>
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={phase > 0.15 ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <Save className="h-4 w-4 text-green-500" />
          </motion.div>
          <span className="text-sm font-medium">Save Your Settings</span>
        </div>
        <motion.p 
          className="text-xs text-muted-foreground mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.2 ? 1 : 0 }}
        >
          Each section has its own save button:
        </motion.p>
        <div className="space-y-2">
          {sections.map((section, i) => (
            <motion.div
              key={section.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: phase > 0.3 + section.delay ? 1 : 0, x: phase > 0.3 + section.delay ? 0 : -10 }}
              className={`flex items-center justify-between p-2 rounded transition-colors ${
                section.highlighted && phase > 0.6 ? "bg-primary/10" : "bg-muted"
              }`}
            >
              <span className="text-xs">{section.name}</span>
              <AnimatedMockButton 
                phase={phase} 
                size="sm"
                clickPhase={section.highlighted ? 0.75 : 1}
                highlight={section.highlighted && phase > 0.6}
              >
                Save {section.name.split(" ")[0]}
              </AnimatedMockButton>
            </motion.div>
          ))}
        </div>
      </AnimatedMockCard>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: phase > 0.8 ? 1 : 0, y: phase > 0.8 ? 0 : 10 }}
        className="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs"
      >
        <p className="text-blue-600 dark:text-blue-400">
          💡 Tip: Category markups can also be set per-template in Products → My Templates
        </p>
      </motion.div>
      <AnimatedSuccessToast message="All pricing settings saved!" phase={phase} showPhase={0.9} />
    </div>
  );
};
