import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Layers, List, Settings, Store, Plus, Search, Filter, 
  Copy, Check, FileText, ArrowRight 
} from "lucide-react";
import {
  AnimatedMockButton,
  AnimatedMockInput,
  AnimatedMockToggle,
  AnimatedSuccessToast,
  AnimatedMockCard,
} from "../demo-components";

interface StepProps {
  phase?: number;
}

// ===========================================
// PRODUCTS TUTORIAL - 12 INTERACTIVE STEPS
// Multi-phase animations for engaging experience
// ===========================================

// Animated tab strip for products
const AnimatedProductTabStrip = ({ activeTab, phase }: { activeTab: string; phase: number }) => {
  const tabs = [
    { id: "templates", label: "My Templates", icon: Package },
    { id: "suppliers", label: "Suppliers", icon: Store },
    { id: "headings", label: "Headings", icon: Layers },
    { id: "options", label: "Options", icon: List },
    { id: "defaults", label: "Defaults", icon: Settings },
  ];

  return (
    <motion.div 
      className="border rounded-lg p-1 bg-muted/50 flex gap-1 overflow-x-auto"
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: phase > 0.1 ? 1 : 0, y: phase > 0.1 ? 0 : -5 }}
    >
      {tabs.map((tab, i) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: phase > 0.15 + i * 0.05 ? 1 : 0, scale: phase > 0.15 + i * 0.05 ? 1 : 0.9 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {tab.label}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// Animated template card
const AnimatedTemplateCard = ({ 
  name, 
  category, 
  synced,
  phase,
  revealPhase = 0.3,
  highlighted = false
}: { 
  name: string; 
  category: string; 
  synced?: boolean;
  phase: number;
  revealPhase?: number;
  highlighted?: boolean;
}) => {
  const isVisible = phase >= revealPhase;
  const isHighlighted = highlighted && phase >= revealPhase + 0.1;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        scale: isVisible ? 1 : 0.95,
        borderColor: isHighlighted ? "hsl(var(--primary))" : "hsl(var(--border))"
      }}
      whileHover={{ scale: 1.02 }}
      className={`border rounded-lg p-3 bg-background transition-colors ${
        isHighlighted ? "border-primary bg-primary/5" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{category}</p>
        </div>
        {synced && (
          <motion.span 
            className="flex items-center gap-1 px-1.5 py-0.5 border rounded text-[10px]"
            animate={isVisible ? { scale: [1, 1.1, 1] } : {}}
            transition={{ delay: 0.2 }}
          >
            <Check className="h-3 w-3" />
            Synced
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};

// Step 1: Navigate the 5 sub-tabs
export const ProductsStep1 = ({ phase = 0 }: StepProps) => {
  const items = [
    { label: "Templates", desc: "Product configs" },
    { label: "Suppliers", desc: "Catalog imports" },
    { label: "Headings", desc: "Curtain styles" },
    { label: "Options", desc: "Add-on choices" },
    { label: "Defaults", desc: "Manufacturing" },
  ];

  return (
    <div className="space-y-4">
      <motion.div 
        className="text-center mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: phase > 0.05 ? 1 : 0, y: phase > 0.05 ? 0 : -10 }}
      >
        <h4 className="font-semibold text-sm">Products Section Overview</h4>
        <p className="text-xs text-muted-foreground">5 tabs organize your product configuration</p>
      </motion.div>
      <motion.div
        animate={phase > 0.2 && phase < 0.5 ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <AnimatedProductTabStrip activeTab="templates" phase={phase} />
      </motion.div>
      <div className="grid grid-cols-5 gap-2 mt-4">
        {items.map((item, i) => (
          <motion.div 
            key={item.label}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: phase > 0.4 + i * 0.08 ? 1 : 0, y: phase > 0.4 + i * 0.08 ? 0 : 5 }}
            className="text-center p-2 border rounded bg-muted/30"
          >
            <p className="text-xs font-medium">{item.label}</p>
            <p className="text-[10px] text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Step 2: Browse your templates
export const ProductsStep2 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <AnimatedProductTabStrip activeTab="templates" phase={phase} />
      <motion.div 
        className="flex items-center gap-2 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0.3 ? 1 : 0 }}
      >
        <motion.div 
          className="flex-1 border rounded-lg px-3 py-2 flex items-center gap-2 bg-background"
          animate={phase > 0.35 && phase < 0.55 ? { 
            borderColor: ["hsl(var(--border))", "hsl(var(--primary))", "hsl(var(--border))"]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search templates...</span>
        </motion.div>
        <AnimatedMockButton phase={phase} variant="outline" size="sm" icon={Filter}>
          Filter
        </AnimatedMockButton>
      </motion.div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <AnimatedTemplateCard name="Premium Sheer" category="Curtains" phase={phase} revealPhase={0.45} />
        <AnimatedTemplateCard name="Standard Blockout" category="Roller Blinds" synced phase={phase} revealPhase={0.55} highlighted />
        <AnimatedTemplateCard name="Roman Classic" category="Roman Blinds" phase={phase} revealPhase={0.65} />
        <AnimatedTemplateCard name="Wave Fold Linen" category="Curtains" synced phase={phase} revealPhase={0.75} />
      </div>
    </div>
  );
};

// Step 3: Create a new template
export const ProductsStep3 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <motion.h4 
          className="font-medium text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.1 ? 1 : 0 }}
        >
          My Templates
        </motion.h4>
        <AnimatedMockButton 
          phase={phase} 
          clickPhase={0.4}
          highlight={phase > 0.25 && phase < 0.55}
          size="sm"
          icon={Plus}
        >
          Add Template
        </AnimatedMockButton>
      </div>
      <AnimatedMockCard phase={phase} revealPhase={0.35}>
        <div className="flex items-center gap-2 mb-3">
          <Package className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Create New Template</span>
        </div>
        <div className="space-y-3">
          <AnimatedMockInput 
            label="Template Name" 
            value="Premium Wave Fold" 
            phase={phase}
            startPhase={0.45}
            endPhase={0.65}
          />
          <motion.div 
            className="space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase > 0.65 ? 1 : 0 }}
          >
            <label className="text-xs font-medium">Category</label>
            <motion.div 
              className="border rounded px-3 py-2 text-sm flex items-center justify-between"
              animate={phase > 0.7 && phase < 0.9 ? { 
                borderColor: ["hsl(var(--border))", "hsl(var(--primary))", "hsl(var(--border))"]
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span>Curtains</span>
              <span className="text-muted-foreground">▾</span>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedMockCard>
    </div>
  );
};

// Step 4: Clone from supplier library
export const ProductsStep4 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <motion.div 
        className="text-center mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0.1 ? 1 : 0 }}
      >
        <motion.span 
          className="px-2 py-0.5 bg-secondary rounded text-xs mb-2 inline-block"
          animate={phase > 0.15 ? { scale: [1, 1.1, 1] } : {}}
        >
          Quick Start
        </motion.span>
        <p className="text-xs text-muted-foreground">Clone a supplier product to get started fast</p>
      </motion.div>
      <AnimatedMockCard phase={phase} revealPhase={0.2} className="bg-muted/30">
        <div className="flex items-center gap-3 mb-3">
          <motion.div 
            className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center"
            animate={phase > 0.3 ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Package className="h-6 w-6 text-primary" />
          </motion.div>
          <div className="flex-1">
            <p className="font-medium text-sm">TWC Roller System 42</p>
            <p className="text-xs text-muted-foreground">From: The Window Covering</p>
          </div>
        </div>
        <AnimatedMockButton 
          phase={phase} 
          clickPhase={0.7}
          highlight={phase > 0.5}
          icon={Copy}
        >
          Clone to My Templates
        </AnimatedMockButton>
      </AnimatedMockCard>
      <motion.div 
        className="flex items-center gap-2 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0.8 ? 1 : 0 }}
      >
        <ArrowRight className="h-3 w-3" />
        <span>Opens template editor with all settings pre-filled</span>
      </motion.div>
    </div>
  );
};

// Step 5: Browse supplier catalogs
export const ProductsStep5 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <AnimatedProductTabStrip activeTab="suppliers" phase={phase} />
      <AnimatedMockCard phase={phase} revealPhase={0.25} className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
        <div className="flex items-start gap-3">
          <Store className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-sm text-amber-900 dark:text-amber-100">Integration Required</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Connect TWC in Settings → Integrations to browse supplier catalogs
            </p>
          </div>
        </div>
      </AnimatedMockCard>
      <motion.div 
        className="border rounded-lg p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0.5 ? 0.5 : 0 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Search supplier products...</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["Roller", "Curtain", "Roman"].map((cat, i) => (
            <motion.div 
              key={cat}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase > 0.6 + i * 0.1 ? 0.5 : 0 }}
              className="border rounded p-2 text-center"
            >
              <p className="text-xs font-medium">{cat}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// Step 6: Clone supplier products
export const ProductsStep6 = ({ phase = 0 }: StepProps) => {
  const products = [
    { name: "System 42 Blockout", price: "$45/sqm", selected: true },
    { name: "Premium Light Filter", price: "$52/sqm", selected: false },
    { name: "Dual Shade System", price: "$85/sqm", selected: true },
  ];

  return (
    <div className="space-y-4">
      <motion.div 
        className="text-center mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0.1 ? 1 : 0 }}
      >
        <h4 className="font-semibold text-sm">Import from Supplier</h4>
      </motion.div>
      <div className="space-y-2">
        {products.map((product, i) => (
          <motion.div
            key={product.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: phase > 0.2 + i * 0.15 ? 1 : 0, x: phase > 0.2 + i * 0.15 ? 0 : -10 }}
            className={`border rounded-lg p-3 flex items-center gap-3 transition-colors ${
              product.selected ? "border-primary bg-primary/5" : ""
            }`}
          >
            <motion.div 
              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                product.selected ? "border-primary bg-primary" : "border-muted-foreground"
              }`}
              animate={product.selected && phase > 0.3 + i * 0.15 ? { scale: [1, 1.2, 1] } : {}}
            >
              {product.selected && <Check className="h-3 w-3 text-primary-foreground" />}
            </motion.div>
            <div className="flex-1">
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.price}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatedMockButton 
        phase={phase} 
        clickPhase={0.8}
        highlight={phase > 0.7}
        size="sm"
      >
        Import 2 Selected Products
      </AnimatedMockButton>
      <AnimatedSuccessToast message="Products imported!" phase={phase} showPhase={0.9} />
    </div>
  );
};

// Step 7: Manage heading inventory
export const ProductsStep7 = ({ phase = 0 }: StepProps) => {
  const headings = [
    { name: "Pinch Pleat", fullness: "2.5×", stock: 45 },
    { name: "Wave Fold", fullness: "2.2×", stock: 32 },
    { name: "Eyelet", fullness: "2.0×", stock: 28 },
  ];

  return (
    <div className="space-y-4">
      <AnimatedProductTabStrip activeTab="headings" phase={phase} />
      <div className="space-y-2 mt-4">
        {headings.map((heading, i) => (
          <motion.div 
            key={heading.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: phase > 0.3 + i * 0.15 ? 1 : 0, x: phase > 0.3 + i * 0.15 ? 0 : -10 }}
            className="border rounded-lg p-3 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium">{heading.name}</p>
              <p className="text-xs text-muted-foreground">Fullness: {heading.fullness}</p>
            </div>
            <motion.span 
              className="px-2 py-0.5 border rounded text-xs"
              animate={phase > 0.4 + i * 0.15 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ delay: 0.2 }}
            >
              {heading.stock} in stock
            </motion.span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Step 8: Add a new heading
export const ProductsStep8 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <motion.h4 
          className="font-medium text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.1 ? 1 : 0 }}
        >
          Headings
        </motion.h4>
        <AnimatedMockButton 
          phase={phase} 
          variant="outline"
          size="sm"
          clickPhase={0.35}
          highlight={phase > 0.2 && phase < 0.5}
          icon={Plus}
        >
          Add Heading
        </AnimatedMockButton>
      </div>
      <AnimatedMockCard phase={phase} revealPhase={0.3}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <AnimatedMockInput 
              label="Heading Name" 
              value="S-Fold" 
              phase={phase}
              startPhase={0.4}
              endPhase={0.55}
            />
            <AnimatedMockInput 
              label="Fullness Ratio" 
              value="2.3×" 
              phase={phase}
              startPhase={0.55}
              endPhase={0.7}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AnimatedMockInput 
              label="Stock Qty" 
              value="50" 
              phase={phase}
              startPhase={0.7}
              endPhase={0.8}
            />
            <AnimatedMockInput 
              label="Reorder Point" 
              value="10" 
              phase={phase}
              startPhase={0.8}
              endPhase={0.9}
            />
          </div>
        </div>
      </AnimatedMockCard>
      <AnimatedSuccessToast message="Heading added!" phase={phase} showPhase={0.92} />
    </div>
  );
};

// Step 9: Configure treatment options
export const ProductsStep9 = ({ phase = 0 }: StepProps) => {
  const categories = [
    { cat: "Linings", count: 8 },
    { cat: "Motors", count: 5 },
    { cat: "Controls", count: 12 },
  ];

  return (
    <div className="space-y-4">
      <AnimatedProductTabStrip activeTab="options" phase={phase} />
      <div className="grid grid-cols-3 gap-2 mt-4">
        {categories.map((category, i) => (
          <motion.div
            key={category.cat}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: phase > 0.3 + i * 0.12 ? 1 : 0, scale: phase > 0.3 + i * 0.12 ? 1 : 0.95 }}
            whileHover={{ scale: 1.02 }}
            className="border rounded-lg p-3 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <p className="text-sm font-medium">{category.cat}</p>
            <motion.span 
              className="px-1.5 py-0.5 bg-secondary rounded text-[10px] mt-1 inline-block"
              animate={phase > 0.4 + i * 0.12 ? { scale: [1, 1.1, 1] } : {}}
            >
              {category.count} options
            </motion.span>
          </motion.div>
        ))}
      </div>
      <motion.div 
        className="border rounded-lg p-3 bg-primary/5 border-primary/30"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: phase > 0.7 ? 1 : 0, y: phase > 0.7 ? 0 : 10 }}
      >
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-primary">📚 Deep Dive Available:</span> Options is a powerful system with inventory sync, pricing methods, and conditional rules. See the dedicated <span className="font-medium">Options Tutorial (20 steps)</span> for complete coverage.
        </p>
      </motion.div>
    </div>
  );
};

// Step 10: Add an option
export const ProductsStep10 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <motion.h4 
          className="font-medium text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.1 ? 1 : 0 }}
        >
          Options
        </motion.h4>
        <AnimatedMockButton 
          phase={phase} 
          variant="outline"
          size="sm"
          clickPhase={0.35}
          highlight={phase > 0.2 && phase < 0.5}
          icon={Plus}
        >
          Add Option
        </AnimatedMockButton>
      </div>
      <AnimatedMockCard phase={phase} revealPhase={0.3}>
        <div className="space-y-3">
          <AnimatedMockInput 
            label="Option Name" 
            value="Motor Brand" 
            phase={phase}
            startPhase={0.4}
            endPhase={0.55}
          />
          <AnimatedMockInput 
            label="Category" 
            value="Motors" 
            phase={phase}
            startPhase={0.55}
            endPhase={0.7}
          />
          <AnimatedMockInput 
            label="Price per Unit" 
            value="$125.00" 
            phase={phase}
            startPhase={0.7}
            endPhase={0.85}
          />
        </div>
      </AnimatedMockCard>
      <motion.div 
        className="text-xs text-muted-foreground bg-muted/50 rounded p-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0.85 ? 1 : 0 }}
      >
        💡 Options can be synced from inventory, use grid pricing, and have conditional rules. See the full Options tutorial for details.
      </motion.div>
    </div>
  );
};

// Step 11: Set manufacturing defaults
export const ProductsStep11 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <AnimatedProductTabStrip activeTab="defaults" phase={phase} />
      <AnimatedMockCard phase={phase} revealPhase={0.25}>
        <div className="flex items-center gap-2 mb-3">
          <Settings className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Manufacturing Defaults</span>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <AnimatedMockInput 
              label="Header Allowance" 
              value="15 cm" 
              phase={phase}
              startPhase={0.35}
              endPhase={0.5}
            />
            <AnimatedMockInput 
              label="Bottom Hem" 
              value="12 cm" 
              phase={phase}
              startPhase={0.5}
              endPhase={0.65}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AnimatedMockInput 
              label="Side Allowance" 
              value="5 cm" 
              phase={phase}
              startPhase={0.65}
              endPhase={0.8}
            />
            <AnimatedMockInput 
              label="Waste %" 
              value="5%" 
              phase={phase}
              startPhase={0.8}
              endPhase={0.9}
            />
          </div>
        </div>
      </AnimatedMockCard>
      <AnimatedSuccessToast message="Defaults saved!" phase={phase} showPhase={0.92} />
    </div>
  );
};

// Step 12: Automation settings
export const ProductsStep12 = ({ phase = 0 }: StepProps) => {
  const settings = [
    { label: "Auto-calculate fabric", desc: "Based on dimensions + fullness", enabled: true },
    { label: "Auto-round quantities", desc: "Round up to nearest 0.5m", enabled: true },
    { label: "Auto-deduct allowances", desc: "Subtract from finished size", enabled: false },
  ];

  return (
    <div className="space-y-4">
      <motion.div 
        className="text-center mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0.1 ? 1 : 0 }}
      >
        <h4 className="font-semibold text-sm">Automation Settings</h4>
        <p className="text-xs text-muted-foreground">Control how calculations are applied</p>
      </motion.div>
      <div className="space-y-3">
        {settings.map((setting, i) => (
          <motion.div 
            key={setting.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: phase > 0.2 + i * 0.15 ? 1 : 0, x: phase > 0.2 + i * 0.15 ? 0 : -10 }}
            className="border rounded-lg p-3 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium">{setting.label}</p>
              <p className="text-xs text-muted-foreground">{setting.desc}</p>
            </div>
            <motion.div 
              className={`w-10 h-5 rounded-full ${setting.enabled ? "bg-primary" : "bg-muted"} relative`}
              animate={phase > 0.3 + i * 0.15 ? { scale: [1, 1.1, 1] } : {}}
            >
              <motion.div 
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                animate={{ left: setting.enabled ? "calc(100% - 18px)" : "2px" }}
              />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
