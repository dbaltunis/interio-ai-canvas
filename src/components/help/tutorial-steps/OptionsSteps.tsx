import { motion } from "framer-motion";
import { Plus, GripVertical, Eye, EyeOff, DollarSign, Layers, Save, Check, Upload, Search, Package, Link as LinkIcon, Zap, Filter, ArrowRight, Settings, RefreshCw, Grid3X3, Sparkles } from "lucide-react";
import { 
  MockCard, 
  MockButton, 
  MockInput, 
  MockBadge, 
  PulsingHighlight 
} from "@/components/help/TutorialVisuals";

// ============================================
// SECTION 1: OPTIONS OVERVIEW (Steps 1-3)
// ============================================

// Step 1: Navigate to Options tab
export const OptionsStep1 = () => (
  <div className="space-y-4">
    <div className="text-center mb-4">
      <h4 className="font-semibold text-sm text-foreground">Options Tab Overview</h4>
      <p className="text-xs text-muted-foreground">Configure add-ons, linings, motors, and more</p>
    </div>
    
    {/* Tab navigation */}
    <div className="border rounded-lg p-1 bg-muted/50 flex gap-1">
      {[
        { id: "templates", label: "My Templates" },
        { id: "suppliers", label: "Suppliers" },
        { id: "headings", label: "Headings" },
        { id: "options", label: "Options", active: true },
        { id: "defaults", label: "Defaults" },
      ].map((tab) => (
        <div
          key={tab.id}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            tab.active
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          {tab.label}
        </div>
      ))}
    </div>
    
    {/* Treatment categories */}
    <div className="grid grid-cols-4 gap-2 mt-4">
      {["Roller Blinds", "Curtains", "Romans", "Venetians"].map((cat, i) => (
        <motion.div
          key={cat}
          className={`border rounded-lg p-2 text-center cursor-pointer ${i === 0 ? "border-primary bg-primary/5" : ""}`}
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-xs font-medium">{cat}</p>
        </motion.div>
      ))}
    </div>
    
    <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
      💡 Options are organized by treatment category - each product type has its own option set
    </div>
  </div>
);

// Step 2: Understand option categories
export const OptionsStep2 = () => (
  <div className="space-y-4">
    <div className="text-center mb-2">
      <h4 className="font-semibold text-sm text-foreground">Option Types</h4>
      <p className="text-xs text-muted-foreground">Left sidebar shows available option types</p>
    </div>
    
    <div className="grid grid-cols-3 gap-3">
      {/* Option types sidebar */}
      <div className="col-span-1 border rounded-lg p-2 bg-muted/30 space-y-1">
        {["Control", "Lining", "Motor", "Bracket", "Chain"].map((type, i) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`text-xs p-2 rounded cursor-pointer ${i === 0 ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            {type}
          </motion.div>
        ))}
      </div>
      
      {/* Option values */}
      <div className="col-span-2 border rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Control Options</span>
          <MockBadge variant="secondary">5 values</MockBadge>
        </div>
        {["Chain Drive", "Motorised", "Spring Assist", "Crank", "Cord"].map((val, i) => (
          <div key={i} className="flex items-center justify-between text-xs p-2 border rounded bg-background">
            <span>{val}</span>
            <MockBadge variant="outline">$0</MockBadge>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Step 3: View existing options with badges
export const OptionsStep3 = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-foreground text-sm">Option Values</h3>
        <p className="text-xs text-muted-foreground">Each value can have pricing and inventory links</p>
      </div>
    </div>
    
    <div className="space-y-2">
      {[
        { name: "Blockout Lining", price: 45, method: "Per m²", linked: true },
        { name: "Thermal Lining", price: 65, method: "Per m²", linked: true },
        { name: "Light Filter", price: 0, method: "Fixed", linked: false },
      ].map((val, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.15 }}
        >
          <MockCard className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{val.name}</span>
              {val.linked && (
                <MockBadge variant="secondary" className="text-[10px]">
                  <LinkIcon className="h-3 w-3 mr-1" />
                  Inventory
                </MockBadge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <MockBadge variant="outline">${val.price}</MockBadge>
              <MockBadge variant="secondary">{val.method}</MockBadge>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
          </MockCard>
        </motion.div>
      ))}
    </div>
    
    <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
      🔗 Options linked to inventory automatically track stock levels and costs
    </div>
  </div>
);

// ============================================
// SECTION 2: CREATING OPTIONS (Steps 4-7)
// ============================================

// Step 4: Click Add Option Type button
export const OptionsStep4 = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-foreground text-sm">Option Types</h3>
        <p className="text-xs text-muted-foreground">Manage configurable options for your templates</p>
      </div>
      <PulsingHighlight>
        <MockButton variant="primary" size="sm">
          <Plus className="h-3 w-3 mr-1" />
          Add Option Type
        </MockButton>
      </PulsingHighlight>
    </div>
    
    {/* Existing options list */}
    <div className="space-y-2">
      {["Lining Type", "Control Type", "Bracket Style"].map((name, i) => (
        <MockCard key={i} className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{name}</span>
            <MockBadge variant="secondary">{3 + i} values</MockBadge>
          </div>
        </MockCard>
      ))}
    </div>
  </div>
);

// Step 5: Enter option name and key
export const OptionsStep5 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <h3 className="font-semibold text-foreground text-sm">Create Option Type</h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Type Label *</label>
          <PulsingHighlight>
            <MockInput placeholder="e.g., Lining Type, Control Side..." className="w-full">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Motor Brand
              </motion.span>
            </MockInput>
          </PulsingHighlight>
        </div>
        
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Type Key (auto-generated)</label>
          <MockInput className="w-full text-muted-foreground">motor_brand</MockInput>
        </div>
      </div>
    </MockCard>
    
    <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
      🔑 The key is auto-generated from the label and used for rule conditions
    </div>
  </div>
);

// Step 6: Add option values with prices
export const OptionsStep6 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Option Values</h3>
        <PulsingHighlight>
          <MockButton variant="outline" size="sm">
            <Plus className="h-3 w-3 mr-1" />
            Add Value
          </MockButton>
        </PulsingHighlight>
      </div>
      
      <div className="space-y-2">
        {[
          { name: "Somfy", price: 450 },
          { name: "Coulisse", price: 380 },
          { name: "Silent Gliss", price: 520 },
        ].map((value, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
          >
            <MockCard className="p-3 flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{value.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <MockBadge variant="secondary">${value.price}</MockBadge>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
            </MockCard>
          </motion.div>
        ))}
      </div>
    </MockCard>
  </div>
);

// Step 7: Configure pricing method
export const OptionsStep7 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <h3 className="font-semibold text-foreground text-sm">Pricing Method</h3>
      
      <PulsingHighlight>
        <div className="space-y-2">
          {[
            { label: "Fixed Price", desc: "Same price regardless of size", icon: DollarSign },
            { label: "Per Linear Meter", desc: "Price × width in meters", icon: ArrowRight, selected: true },
            { label: "Per Square Meter", desc: "Price × (width × drop)", icon: Grid3X3 },
            { label: "Per Panel", desc: "Price × number of panels", icon: Layers },
            { label: "Grid-Based", desc: "Width × drop pricing matrix", icon: Settings },
          ].map((option, i) => (
            <div 
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg border ${option.selected ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${option.selected ? "border-primary" : "border-muted-foreground"}`}>
                {option.selected && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <option.icon className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <span className="text-sm font-medium">{option.label}</span>
                <p className="text-xs text-muted-foreground">{option.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </PulsingHighlight>
    </MockCard>
  </div>
);

// ============================================
// SECTION 3: SYNC FROM INVENTORY (Steps 8-11)
// ============================================

// Step 8: Open inventory sync dialog
export const OptionsStep8 = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-foreground text-sm">Lining Type</h3>
        <p className="text-xs text-muted-foreground">3 values configured</p>
      </div>
      <div className="flex gap-2">
        <MockButton variant="outline" size="sm">
          <Plus className="h-3 w-3 mr-1" />
          Add Value
        </MockButton>
        <PulsingHighlight>
          <MockButton variant="primary" size="sm">
            <Upload className="h-3 w-3 mr-1" />
            Sync from Library
          </MockButton>
        </PulsingHighlight>
      </div>
    </div>
    
    <div className="text-xs text-muted-foreground bg-primary/10 border border-primary/30 rounded p-3">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-medium text-primary">Time Saver</span>
      </div>
      Sync options directly from your inventory library - import hundreds of materials, fabrics, or hardware items in seconds with prices intact.
    </div>
  </div>
);

// Step 9: Select inventory category
export const OptionsStep9 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Sync from Inventory</h3>
        <MockBadge variant="outline">Step 1 of 3</MockBadge>
      </div>
      
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">Select Category</label>
        <PulsingHighlight>
          <div className="grid grid-cols-2 gap-2">
            {["Linings", "Fabrics", "Motors", "Hardware", "Tracks", "Accessories"].map((cat, i) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`p-3 border rounded-lg text-center cursor-pointer ${i === 0 ? "border-primary bg-primary/5" : "hover:border-muted-foreground"}`}
              >
                <Package className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <span className="text-xs font-medium">{cat}</span>
              </motion.div>
            ))}
          </div>
        </PulsingHighlight>
      </div>
      
      {/* Search bar */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <MockInput placeholder="Search items..." className="w-full pl-9" />
      </div>
    </MockCard>
  </div>
);

// Step 10: Choose pricing mode
export const OptionsStep10 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Pricing Mode</h3>
        <MockBadge variant="outline">Step 2 of 3</MockBadge>
      </div>
      
      <div className="text-xs text-muted-foreground mb-2">
        How should prices be imported from inventory?
      </div>
      
      <PulsingHighlight>
        <div className="space-y-2">
          {[
            { label: "Use Selling Price", desc: "Import the retail selling price", selected: true },
            { label: "Use Cost Price", desc: "Import your cost price" },
            { label: "Cost + Markup %", desc: "Cost price plus your markup" },
          ].map((option, i) => (
            <div 
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg border ${option.selected ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${option.selected ? "border-primary" : "border-muted-foreground"}`}>
                {option.selected && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <div>
                <span className="text-sm font-medium">{option.label}</span>
                <p className="text-xs text-muted-foreground">{option.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </PulsingHighlight>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <RefreshCw className="h-3 w-3" />
        <span>Prices stay linked - inventory updates sync automatically</span>
      </div>
    </MockCard>
  </div>
);

// Step 11: Confirm bulk import
export const OptionsStep11 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Confirm Import</h3>
        <MockBadge variant="outline">Step 3 of 3</MockBadge>
      </div>
      
      <div className="space-y-2">
        {[
          { name: "Premium Blockout", price: 85, qty: 45 },
          { name: "Thermal Blackout", price: 95, qty: 32 },
          { name: "Light Filter White", price: 55, qty: 120 },
          { name: "Sheer Voile", price: 45, qty: 80 },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between p-2 border rounded bg-muted/30"
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <MockBadge variant="outline">${item.price}/m²</MockBadge>
              <span className="text-muted-foreground">{item.qty} in stock</span>
            </div>
          </motion.div>
        ))}
      </div>
      
      <PulsingHighlight>
        <MockButton variant="primary" size="sm" className="w-full">
          <Upload className="h-4 w-4 mr-2" />
          Import 4 Items
        </MockButton>
      </PulsingHighlight>
    </MockCard>
    
    <div className="text-xs text-muted-foreground bg-green-50 border border-green-200 rounded p-2 text-green-700">
      ✨ Bulk importing saves hours of manual data entry - sync entire catalogs in seconds!
    </div>
  </div>
);

// ============================================
// SECTION 4: PRICING CONFIGURATION (Steps 12-14)
// ============================================

// Step 12: Set up grid-based pricing
export const OptionsStep12 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Grid-Based Pricing</h3>
        <MockBadge variant="secondary">Advanced</MockBadge>
      </div>
      
      <div className="text-xs text-muted-foreground mb-2">
        Upload a width × drop pricing matrix for complex pricing rules
      </div>
      
      <PulsingHighlight>
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Drop CSV file here</p>
          <p className="text-xs text-muted-foreground">or click to browse</p>
        </div>
      </PulsingHighlight>
      
      {/* Sample grid preview */}
      <div className="border rounded overflow-hidden">
        <div className="grid grid-cols-5 text-xs">
          <div className="p-2 bg-muted font-medium">Width ↓</div>
          <div className="p-2 bg-muted text-center font-medium">1000</div>
          <div className="p-2 bg-muted text-center font-medium">1500</div>
          <div className="p-2 bg-muted text-center font-medium">2000</div>
          <div className="p-2 bg-muted text-center font-medium">2500</div>
          <div className="p-2 bg-muted font-medium">1500</div>
          <div className="p-2 text-center">$120</div>
          <div className="p-2 text-center">$145</div>
          <div className="p-2 text-center">$180</div>
          <div className="p-2 text-center">$210</div>
          <div className="p-2 bg-muted font-medium">2000</div>
          <div className="p-2 text-center">$150</div>
          <div className="p-2 text-center">$185</div>
          <div className="p-2 text-center">$220</div>
          <div className="p-2 text-center">$260</div>
        </div>
      </div>
    </MockCard>
  </div>
);

// Step 13: Configure pricing hierarchy
export const OptionsStep13 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <h3 className="font-semibold text-foreground text-sm">Pricing Hierarchy</h3>
      
      <div className="text-xs text-muted-foreground mb-2">
        Prices are resolved in this order - first match wins:
      </div>
      
      <div className="space-y-2">
        {[
          { level: 1, name: "Grid Price", desc: "Width × Drop matrix lookup", badge: "Highest Priority", active: true },
          { level: 2, name: "Category Markup", desc: "Category-level % override" },
          { level: 3, name: "Default Price", desc: "Fallback base price" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`flex items-center gap-3 p-3 rounded-lg border ${item.active ? "border-primary bg-primary/5" : "border-border"}`}
          >
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
              {item.level}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">{item.name}</span>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            {item.badge && <MockBadge variant="primary">{item.badge}</MockBadge>}
          </motion.div>
        ))}
      </div>
    </MockCard>
  </div>
);

// Step 14: Test pricing calculation
export const OptionsStep14 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <h3 className="font-semibold text-foreground text-sm">Preview Calculation</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Width (mm)</label>
          <MockInput className="w-full">1800</MockInput>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Drop (mm)</label>
          <MockInput className="w-full">2200</MockInput>
        </div>
      </div>
      
      <PulsingHighlight>
        <MockCard className="p-3 bg-primary/5 border-primary">
          <div className="flex items-center justify-between">
            <span className="text-sm">Calculated Price:</span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold text-primary"
            >
              $245.00
            </motion.span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Grid lookup: 1800mm × 2200mm → Price bracket $245
          </div>
        </MockCard>
      </PulsingHighlight>
    </MockCard>
  </div>
);

// ============================================
// SECTION 5: CONDITIONAL RULES (Steps 15-20)
// ============================================

// Step 15: Navigate to Rules tab
export const OptionsStep15 = () => (
  <div className="space-y-4">
    <div className="text-center mb-2">
      <MockBadge variant="primary" className="mb-2">
        <Sparkles className="h-3 w-3 mr-1" />
        Powerful Feature
      </MockBadge>
      <h4 className="font-semibold text-sm text-foreground">Conditional Rules</h4>
      <p className="text-xs text-muted-foreground">Automate option visibility based on selections</p>
    </div>
    
    {/* Template tabs */}
    <div className="border rounded-lg p-1 bg-muted/50 flex gap-1">
      {["Basic", "Heading", "Options", "Pricing", "Manufacturing", "Rules"].map((tab, i) => (
        <div
          key={tab}
          className={`px-3 py-1.5 rounded text-xs font-medium ${
            i === 5 ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          {tab}
        </div>
      ))}
    </div>
    
    <MockCard className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">Option Rules</h3>
        <PulsingHighlight>
          <MockButton variant="primary" size="sm">
            <Plus className="h-3 w-3 mr-1" />
            Add Rule
          </MockButton>
        </PulsingHighlight>
      </div>
      
      <div className="text-xs text-muted-foreground bg-muted/50 rounded p-3">
        Rules run automatically during quote creation - zero extra clicks needed!
      </div>
    </MockCard>
  </div>
);

// Step 16: Understand rule actions
export const OptionsStep16 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <h3 className="font-semibold text-foreground text-sm">Rule Actions</h3>
      <p className="text-xs text-muted-foreground">What should happen when a condition is met?</p>
      
      <div className="space-y-2">
        {[
          { action: "Show Option", desc: "Make a hidden option visible", icon: Eye, color: "text-green-600" },
          { action: "Hide Option", desc: "Hide an option from view", icon: EyeOff, color: "text-red-600" },
          { action: "Require Option", desc: "Make selection mandatory", icon: Check, color: "text-amber-600" },
          { action: "Set Default", desc: "Pre-select a specific value", icon: Settings, color: "text-blue-600" },
          { action: "Filter Values", desc: "Limit available choices", icon: Filter, color: "text-purple-600" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 p-2 border rounded"
          >
            <item.icon className={`h-4 w-4 ${item.color}`} />
            <div>
              <span className="text-sm font-medium">{item.action}</span>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </MockCard>
  </div>
);

// Step 17: Create WHEN condition
export const OptionsStep17 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Create Rule - Step 1</h3>
        <MockBadge variant="outline">WHEN</MockBadge>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-amber-800 text-xs">
        <span className="font-medium">WHEN</span> this condition is true...
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Source Option</label>
          <PulsingHighlight>
            <div className="border rounded p-2 flex items-center justify-between bg-background">
              <span className="text-sm">Control Type</span>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </div>
          </PulsingHighlight>
        </div>
        
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Operator</label>
          <div className="border rounded p-2 flex items-center justify-between bg-background">
            <span className="text-sm">equals</span>
          </div>
        </div>
        
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Value</label>
          <div className="border rounded p-2 flex items-center justify-between bg-background">
            <span className="text-sm">Motorised</span>
          </div>
        </div>
      </div>
    </MockCard>
  </div>
);

// Step 18: Define THEN effect
export const OptionsStep18 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Create Rule - Step 2</h3>
        <MockBadge variant="outline">THEN</MockBadge>
      </div>
      
      <div className="bg-green-50 border border-green-200 rounded p-3 text-green-800 text-xs">
        <span className="font-medium">THEN</span> apply this effect...
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Action</label>
          <PulsingHighlight>
            <div className="border rounded p-2 flex items-center justify-between bg-primary/5 border-primary">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Show Option</span>
              </div>
            </div>
          </PulsingHighlight>
        </div>
        
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Target Option</label>
          <div className="border rounded p-2 bg-background">
            <span className="text-sm">Remote Control Type</span>
          </div>
        </div>
      </div>
      
      {/* Rule preview */}
      <div className="bg-muted/50 rounded p-3 border">
        <span className="text-xs text-muted-foreground">Rule Summary:</span>
        <p className="text-sm mt-1">
          <span className="font-medium">WHEN</span> Control Type <span className="text-primary">equals</span> "Motorised"
          <br />
          <span className="font-medium">THEN</span> <span className="text-green-600">show</span> Remote Control Type
        </p>
      </div>
    </MockCard>
  </div>
);

// Step 19: Use quick templates
export const OptionsStep19 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">Quick Templates</h3>
        <MockBadge variant="secondary">4 templates</MockBadge>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Start with a common rule pattern - covers 80% of use cases
      </p>
      
      <PulsingHighlight>
        <div className="space-y-2">
          {[
            { name: "Motorised → Show Remote", desc: "When motorised, show remote options" },
            { name: "Chain Drive → Hide Motor", desc: "When chain drive, hide motor options" },
            { name: "Width > 3m → Require Support", desc: "Large blinds need center support" },
            { name: "Fabric → Filter Linings", desc: "Match lining to fabric type" },
          ].map((template, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 p-3 border rounded hover:border-primary cursor-pointer group"
            >
              <Zap className="h-4 w-4 text-amber-500" />
              <div className="flex-1">
                <span className="text-sm font-medium group-hover:text-primary">{template.name}</span>
                <p className="text-xs text-muted-foreground">{template.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </motion.div>
          ))}
        </div>
      </PulsingHighlight>
    </MockCard>
  </div>
);

// Step 20: Test rules in job creation
export const OptionsStep20 = () => (
  <div className="space-y-4">
    <div className="text-center mb-2">
      <MockBadge variant="secondary" className="mb-2">Live Preview</MockBadge>
      <h4 className="font-semibold text-sm text-foreground">Rules in Action</h4>
    </div>
    
    <MockCard className="p-4 space-y-4">
      <h3 className="font-medium text-sm">Creating Quote...</h3>
      
      <div className="space-y-3">
        {/* Control type selection */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Control Type</label>
          <PulsingHighlight>
            <div className="border-2 border-primary rounded p-2 bg-primary/5">
              <span className="text-sm font-medium">Motorised</span>
            </div>
          </PulsingHighlight>
        </div>
        
        {/* Revealed option */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ delay: 0.5 }}
        >
          <div className="border-l-4 border-green-500 pl-3 py-2">
            <div className="flex items-center gap-2 text-xs text-green-600 mb-1">
              <Sparkles className="h-3 w-3" />
              <span>Auto-shown by rule</span>
            </div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Remote Control Type</label>
            <div className="border rounded p-2 bg-background">
              <span className="text-sm">15-Channel Remote</span>
            </div>
          </div>
        </motion.div>
      </div>
    </MockCard>
    
    <div className="text-xs text-muted-foreground bg-green-50 border border-green-200 rounded p-3 text-green-700">
      <div className="flex items-center gap-2 font-medium mb-1">
        <Check className="h-4 w-4" />
        Rules = Zero Extra Clicks
      </div>
      Set rules once, use forever. They run automatically on every quote - no staff training needed!
    </div>
  </div>
);
