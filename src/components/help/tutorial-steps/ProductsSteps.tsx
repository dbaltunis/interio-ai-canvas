import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Layers, List, Settings, Store, Plus, Search, Filter, Copy, Check, FileText, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const MockTabStrip = ({ activeTab }: { activeTab: string }) => (
  <div className="border rounded-lg p-1 bg-muted/50 flex gap-1">
    {[
      { id: "templates", label: "My Templates", icon: Package },
      { id: "suppliers", label: "Suppliers", icon: Store },
      { id: "headings", label: "Headings", icon: Layers },
      { id: "options", label: "Options", icon: List },
      { id: "defaults", label: "Defaults", icon: Settings },
    ].map((tab) => (
      <div
        key={tab.id}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
          activeTab === tab.id
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground"
        }`}
      >
        <tab.icon className="h-3.5 w-3.5" />
        {tab.label}
      </div>
    ))}
  </div>
);

const MockTemplateCard = ({ name, category, synced }: { name: string; category: string; synced?: boolean }) => (
  <div className="border rounded-lg p-3 bg-background hover:border-primary/50 transition-colors">
    <div className="flex items-start justify-between mb-2">
      <div>
        <p className="font-medium text-sm">{name}</p>
        <p className="text-xs text-muted-foreground">{category}</p>
      </div>
      {synced && (
        <Badge variant="outline" className="text-[10px]">
          <Check className="h-3 w-3 mr-1" />
          Synced
        </Badge>
      )}
    </div>
  </div>
);

// Step 1: Navigate the 5 sub-tabs
export const ProductsStep1 = () => (
  <div className="space-y-4">
    <div className="text-center mb-4">
      <h4 className="font-semibold text-sm">Products Section Overview</h4>
      <p className="text-xs text-muted-foreground">5 tabs organize your product configuration</p>
    </div>
    <motion.div
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <MockTabStrip activeTab="templates" />
    </motion.div>
    <div className="grid grid-cols-5 gap-2 mt-4">
      {[
        { label: "Templates", desc: "Product configs" },
        { label: "Suppliers", desc: "Catalog imports" },
        { label: "Headings", desc: "Curtain styles" },
        { label: "Options", desc: "Add-on choices" },
        { label: "Defaults", desc: "Manufacturing" },
      ].map((item, i) => (
        <div key={i} className="text-center p-2 border rounded bg-muted/30">
          <p className="text-xs font-medium">{item.label}</p>
          <p className="text-[10px] text-muted-foreground">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

// Step 2: Browse your templates
export const ProductsStep2 = () => (
  <div className="space-y-4">
    <MockTabStrip activeTab="templates" />
    <div className="flex items-center gap-2 mt-4">
      <div className="flex-1 border rounded-lg px-3 py-2 flex items-center gap-2 bg-background">
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Search templates...</span>
      </div>
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4 mr-1" />
        Filter
      </Button>
    </div>
    <div className="grid grid-cols-2 gap-3 mt-3">
      <MockTemplateCard name="Premium Sheer" category="Curtains" />
      <MockTemplateCard name="Standard Blockout" category="Roller Blinds" synced />
      <MockTemplateCard name="Roman Classic" category="Roman Blinds" />
      <MockTemplateCard name="Wave Fold Linen" category="Curtains" synced />
    </div>
  </div>
);

// Step 3: Create a new template
export const ProductsStep3 = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-sm">My Templates</h4>
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Template
        </Button>
      </motion.div>
    </div>
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Create New Template</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Template Name</label>
          <div className="border rounded px-3 py-2 text-sm">Premium Wave Fold</div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Category</label>
          <div className="border rounded px-3 py-2 text-sm flex items-center justify-between">
            <span>Curtains</span>
            <span className="text-muted-foreground">▾</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Step 4: Clone from supplier library
export const ProductsStep4 = () => (
  <div className="space-y-4">
    <div className="text-center mb-2">
      <Badge variant="secondary" className="mb-2">Quick Start</Badge>
      <p className="text-xs text-muted-foreground">Clone a supplier product to get started fast</p>
    </div>
    <div className="border rounded-lg p-4 bg-muted/30">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">TWC Roller System 42</p>
          <p className="text-xs text-muted-foreground">From: The Window Covering</p>
        </div>
      </div>
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Button size="sm" className="w-full gap-1">
          <Copy className="h-4 w-4" />
          Clone to My Templates
        </Button>
      </motion.div>
    </div>
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <ArrowRight className="h-3 w-3" />
      <span>Opens template editor with all settings pre-filled</span>
    </div>
  </div>
);

// Step 5: Browse supplier catalogs
export const ProductsStep5 = () => (
  <div className="space-y-4">
    <MockTabStrip activeTab="suppliers" />
    <Card className="border-amber-200 bg-amber-50/50">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Store className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-sm text-amber-900">Integration Required</p>
            <p className="text-xs text-amber-700 mt-1">
              Connect TWC in Settings → Integrations to browse supplier catalogs
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Search supplier products...</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["Roller", "Curtain", "Roman"].map((cat) => (
          <div key={cat} className="border rounded p-2 text-center opacity-50">
            <p className="text-xs font-medium">{cat}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Step 6: Clone supplier products
export const ProductsStep6 = () => (
  <div className="space-y-4">
    <div className="text-center mb-2">
      <h4 className="font-semibold text-sm">Import from Supplier</h4>
    </div>
    <div className="space-y-2">
      {[
        { name: "System 42 Blockout", price: "$45/sqm", selected: true },
        { name: "Premium Light Filter", price: "$52/sqm", selected: false },
        { name: "Dual Shade System", price: "$85/sqm", selected: true },
      ].map((product, i) => (
        <div
          key={i}
          className={`border rounded-lg p-3 flex items-center gap-3 ${
            product.selected ? "border-primary bg-primary/5" : ""
          }`}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            product.selected ? "border-primary bg-primary" : "border-muted-foreground"
          }`}>
            {product.selected && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.price}</p>
          </div>
        </div>
      ))}
    </div>
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <Button size="sm" className="w-full">Import 2 Selected Products</Button>
    </motion.div>
  </div>
);

// Step 7: Manage heading inventory
export const ProductsStep7 = () => (
  <div className="space-y-4">
    <MockTabStrip activeTab="headings" />
    <div className="space-y-2 mt-4">
      {[
        { name: "Pinch Pleat", fullness: "2.5×", stock: 45 },
        { name: "Wave Fold", fullness: "2.2×", stock: 32 },
        { name: "Eyelet", fullness: "2.0×", stock: 28 },
      ].map((heading, i) => (
        <div key={i} className="border rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{heading.name}</p>
            <p className="text-xs text-muted-foreground">Fullness: {heading.fullness}</p>
          </div>
          <Badge variant="outline">{heading.stock} in stock</Badge>
        </div>
      ))}
    </div>
  </div>
);

// Step 8: Add a new heading
export const ProductsStep8 = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-sm">Headings</h4>
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Button size="sm" variant="outline" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Heading
        </Button>
      </motion.div>
    </div>
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">Heading Name</label>
            <div className="border rounded px-3 py-2 text-sm">S-Fold</div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Fullness Ratio</label>
            <div className="border rounded px-3 py-2 text-sm">2.3×</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">Stock Qty</label>
            <div className="border rounded px-3 py-2 text-sm">50</div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Reorder Point</label>
            <div className="border rounded px-3 py-2 text-sm">10</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Step 9: Configure treatment options
export const ProductsStep9 = () => (
  <div className="space-y-4">
    <MockTabStrip activeTab="options" />
    <div className="grid grid-cols-3 gap-2 mt-4">
      {[
        { cat: "Linings", count: 8 },
        { cat: "Motors", count: 5 },
        { cat: "Controls", count: 12 },
      ].map((category, i) => (
        <motion.div
          key={i}
          className="border rounded-lg p-3 text-center cursor-pointer hover:border-primary/50"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-sm font-medium">{category.cat}</p>
          <Badge variant="secondary" className="mt-1">{category.count} options</Badge>
        </motion.div>
      ))}
    </div>
    <div className="border rounded-lg p-3 bg-muted/30">
      <p className="text-xs text-muted-foreground">
        Options are grouped by category and can be enabled per template
      </p>
    </div>
  </div>
);

// Step 10: Add an option
export const ProductsStep10 = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-sm">Options</h4>
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Button size="sm" variant="outline" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Option
        </Button>
      </motion.div>
    </div>
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Option Name</label>
          <div className="border rounded px-3 py-2 text-sm">Motor Brand</div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Category</label>
          <div className="border rounded px-3 py-2 text-sm">Motors</div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Price per Unit</label>
          <div className="border rounded px-3 py-2 text-sm">$125.00</div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Step 11: Set manufacturing defaults
export const ProductsStep11 = () => (
  <div className="space-y-4">
    <MockTabStrip activeTab="defaults" />
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Manufacturing Defaults</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">Header Allowance</label>
            <div className="border rounded px-3 py-2 text-sm">15 cm</div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Bottom Hem</label>
            <div className="border rounded px-3 py-2 text-sm">12 cm</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">Side Allowance</label>
            <div className="border rounded px-3 py-2 text-sm">5 cm</div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Waste %</label>
            <div className="border rounded px-3 py-2 text-sm">5%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Step 12: Automation settings
export const ProductsStep12 = () => (
  <div className="space-y-4">
    <div className="text-center mb-2">
      <h4 className="font-semibold text-sm">Automation Settings</h4>
      <p className="text-xs text-muted-foreground">Control how calculations are applied</p>
    </div>
    <div className="space-y-3">
      {[
        { label: "Auto-calculate fabric", desc: "Based on dimensions + fullness", enabled: true },
        { label: "Auto-round quantities", desc: "Round up to nearest 0.5m", enabled: true },
        { label: "Auto-deduct allowances", desc: "Subtract from finished size", enabled: false },
      ].map((setting, i) => (
        <div key={i} className="border rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{setting.label}</p>
            <p className="text-xs text-muted-foreground">{setting.desc}</p>
          </div>
          <div className={`w-10 h-5 rounded-full ${setting.enabled ? "bg-primary" : "bg-muted"} relative`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow ${
              setting.enabled ? "right-0.5" : "left-0.5"
            }`} />
          </div>
        </div>
      ))}
    </div>
  </div>
);
