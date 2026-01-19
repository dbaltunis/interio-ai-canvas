/**
 * Demo Components for Library/Inventory Tutorial
 * Presentation-only versions with 100% visual accuracy
 */

import React from "react";
import { motion } from "framer-motion";
import { 
  Package, Search, Filter, Plus, Grid, List, QrCode, ScanLine,
  Check, X, ChevronDown, Image, Tag, DollarSign, Box, Truck,
  Upload, Download, Edit2, Trash2, MoreVertical, ExternalLink,
  Layers, CheckCircle, AlertCircle, Info
} from "lucide-react";
import { cn } from "@/lib/utils";

// ===========================================
// INVENTORY CARD COMPONENT
// ===========================================

export interface DemoInventoryItemData {
  name: string;
  sku: string;
  category: string;
  vendor?: string;
  price: string;
  stock?: number;
  imageUrl?: string;
  tags?: string[];
}

export const DemoInventoryCard: React.FC<{
  item: DemoInventoryItemData;
  highlight?: boolean;
  selected?: boolean;
  pulse?: boolean;
  showCheckbox?: boolean;
  checked?: boolean;
  className?: string;
}> = ({ item, highlight, selected, pulse, showCheckbox, checked, className }) => {
  return (
    <motion.div
      className={cn(
        "bg-card border rounded-lg p-3 flex gap-3",
        highlight && "ring-2 ring-primary ring-offset-1",
        selected && "border-primary bg-primary/5",
        className
      )}
      animate={pulse ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {showCheckbox && (
        <div className={cn(
          "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-1",
          checked ? "bg-primary border-primary" : "border-muted-foreground/30"
        )}>
          {checked && <Check className="w-3 h-3 text-primary-foreground" />}
        </div>
      )}
      
      {/* Image placeholder */}
      <div className="w-14 h-14 rounded bg-muted flex items-center justify-center shrink-0">
        {item.imageUrl ? (
          <div className="w-full h-full rounded bg-gradient-to-br from-primary/20 to-primary/5" />
        ) : (
          <Package className="w-6 h-6 text-muted-foreground" />
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-medium truncate">{item.name}</h4>
            <p className="text-xs text-muted-foreground">{item.sku}</p>
          </div>
          <span className="text-sm font-semibold text-primary shrink-0">{item.price}</span>
        </div>
        
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            {item.category}
          </span>
          {item.vendor && (
            <span className="text-[10px] text-muted-foreground truncate">
              {item.vendor}
            </span>
          )}
          {item.stock !== undefined && (
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded ml-auto",
              item.stock > 10 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
              item.stock > 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            )}>
              {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ===========================================
// INVENTORY TABS COMPONENT
// ===========================================

export const DemoInventoryTabs: React.FC<{
  activeTab?: string;
  highlightTab?: string;
  counts?: Record<string, number>;
}> = ({ activeTab = "fabrics", highlightTab, counts = {} }) => {
  const tabs = [
    { id: "categories", label: "Categories" },
    { id: "vendors", label: "Vendors", count: counts.vendors },
    { id: "fabrics", label: "Fabrics", count: counts.fabrics },
    { id: "hardware", label: "Hardware", count: counts.hardware },
    { id: "collections", label: "Collections", count: counts.collections },
  ];

  return (
    <div className="flex items-center gap-1 border-b overflow-x-auto">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          className={cn(
            "px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
            activeTab === tab.id 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground",
            highlightTab === tab.id && "ring-2 ring-primary ring-offset-1 rounded-t"
          )}
          animate={highlightTab === tab.id ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-xs text-muted-foreground">({tab.count})</span>
          )}
        </motion.button>
      ))}
    </div>
  );
};

// ===========================================
// LIBRARY HEADER COMPONENT
// ===========================================

export const DemoLibraryHeader: React.FC<{
  searchValue?: string;
  highlightSearch?: boolean;
  highlightFilter?: boolean;
  highlightViewToggle?: boolean;
  highlightQR?: boolean;
  highlightAdd?: boolean;
  viewMode?: "grid" | "list";
}> = ({ 
  searchValue = "", 
  highlightSearch, 
  highlightFilter,
  highlightViewToggle,
  highlightQR,
  highlightAdd,
  viewMode = "grid"
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <motion.div 
        className={cn(
          "relative flex-1 min-w-[160px]",
          highlightSearch && "ring-2 ring-primary ring-offset-1 rounded-md"
        )}
        animate={highlightSearch ? { scale: [1, 1.02, 1] } : {}}
      >
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <div className="w-full h-9 pl-8 pr-3 rounded-md border bg-background flex items-center text-sm text-muted-foreground">
          {searchValue || "Search inventory..."}
        </div>
      </motion.div>
      
      {/* Filter */}
      <motion.button
        className={cn(
          "h-9 px-3 border rounded-md flex items-center gap-2 text-sm",
          highlightFilter && "ring-2 ring-primary ring-offset-1"
        )}
        animate={highlightFilter ? { scale: [1, 1.1, 1] } : {}}
      >
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">Filter</span>
      </motion.button>
      
      {/* View Toggle */}
      <motion.div
        className={cn(
          "flex items-center border rounded-md overflow-hidden",
          highlightViewToggle && "ring-2 ring-primary ring-offset-1"
        )}
        animate={highlightViewToggle ? { scale: [1, 1.1, 1] } : {}}
      >
        <button className={cn(
          "h-9 w-9 flex items-center justify-center",
          viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-background"
        )}>
          <Grid className="w-4 h-4" />
        </button>
        <button className={cn(
          "h-9 w-9 flex items-center justify-center",
          viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-background"
        )}>
          <List className="w-4 h-4" />
        </button>
      </motion.div>
      
      {/* QR Scan */}
      <motion.button
        className={cn(
          "h-9 w-9 border rounded-md flex items-center justify-center",
          highlightQR && "ring-2 ring-primary ring-offset-1"
        )}
        animate={highlightQR ? { scale: [1, 1.1, 1] } : {}}
      >
        <QrCode className="w-4 h-4" />
      </motion.button>
      
      {/* Add Button */}
      <motion.button
        className={cn(
          "h-9 px-3 bg-primary text-primary-foreground rounded-md flex items-center gap-2 text-sm font-medium",
          highlightAdd && "ring-2 ring-primary ring-offset-2"
        )}
        animate={highlightAdd ? { scale: [1, 1.1, 1] } : {}}
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add Item</span>
      </motion.button>
    </div>
  );
};

// ===========================================
// ADD ITEM DIALOG COMPONENT
// ===========================================

export const DemoAddItemDialog: React.FC<{
  activeTab?: "basic" | "pricing" | "inventory" | "qr";
  highlightTab?: string;
  formData?: {
    name?: string;
    sku?: string;
    category?: string;
    vendor?: string;
    cost?: string;
    price?: string;
    stock?: string;
  };
  showQR?: boolean;
}> = ({ 
  activeTab = "basic", 
  highlightTab,
  formData = {},
  showQR
}) => {
  const tabs = [
    { id: "basic", label: "Basic Info", icon: Info },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "inventory", label: "Inventory", icon: Box },
    { id: "qr", label: "QR Code", icon: QrCode },
  ];

  return (
    <div className="bg-card border rounded-lg shadow-lg overflow-hidden w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold">Add New Item</h3>
        <button className="p-1 hover:bg-muted rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={cn(
              "flex-1 py-2 px-3 text-xs font-medium flex items-center justify-center gap-1.5",
              activeTab === tab.id 
                ? "border-b-2 border-primary text-primary" 
                : "text-muted-foreground",
              highlightTab === tab.id && "ring-2 ring-primary ring-inset"
            )}
            animate={highlightTab === tab.id ? { scale: [1, 1.05, 1] } : {}}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </motion.button>
        ))}
      </div>
      
      {/* Content based on active tab */}
      <div className="p-3 space-y-3">
        {activeTab === "basic" && (
          <>
            <div className="space-y-1">
              <label className="text-xs font-medium">Item Name</label>
              <div className="h-9 px-3 rounded-md border bg-background flex items-center text-sm">
                {formData.name || ""}
                <span className="animate-pulse">|</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">SKU</label>
                <div className="h-9 px-3 rounded-md border bg-background flex items-center text-sm text-muted-foreground">
                  {formData.sku || "Auto-generated"}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Category</label>
                <div className="h-9 px-3 rounded-md border bg-background flex items-center justify-between text-sm">
                  {formData.category || "Select..."}
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Vendor</label>
              <div className="h-9 px-3 rounded-md border bg-background flex items-center justify-between text-sm">
                {formData.vendor || "Select vendor..."}
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </>
        )}
        
        {activeTab === "pricing" && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Cost Price</label>
                <div className="h-9 px-3 rounded-md border bg-background flex items-center text-sm">
                  <DollarSign className="w-3 h-3 text-muted-foreground mr-1" />
                  {formData.cost || "0.00"}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Selling Price</label>
                <div className="h-9 px-3 rounded-md border bg-background flex items-center text-sm">
                  <DollarSign className="w-3 h-3 text-muted-foreground mr-1" />
                  {formData.price || "0.00"}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Pricing Method</label>
              <div className="h-9 px-3 rounded-md border bg-background flex items-center justify-between text-sm">
                Per Linear Meter
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </>
        )}
        
        {activeTab === "inventory" && (
          <>
            <div className="flex items-center justify-between p-2 rounded-md bg-muted/50">
              <span className="text-sm">Enable Stock Tracking</span>
              <div className="w-10 h-5 rounded-full bg-primary flex items-center justify-end p-0.5">
                <div className="w-4 h-4 rounded-full bg-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Current Stock</label>
                <div className="h-9 px-3 rounded-md border bg-background flex items-center text-sm">
                  {formData.stock || "0"}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Reorder Point</label>
                <div className="h-9 px-3 rounded-md border bg-background flex items-center text-sm">
                  10
                </div>
              </div>
            </div>
          </>
        )}
        
        {activeTab === "qr" && (
          <div className="flex flex-col items-center py-4">
            {showQR ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center"
              >
                <QrCode className="w-16 h-16 text-primary" />
              </motion.div>
            ) : (
              <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center">
                <QrCode className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">QR code will be generated on save</p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="flex justify-end gap-2 p-3 border-t bg-muted/30">
        <button className="px-3 py-1.5 text-sm border rounded-md">Cancel</button>
        <button className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md">
          Save Item
        </button>
      </div>
    </div>
  );
};

// ===========================================
// QR SCANNER COMPONENT
// ===========================================

export const DemoQRScanner: React.FC<{
  scanning?: boolean;
  found?: boolean;
  foundItem?: DemoInventoryItemData;
}> = ({ scanning, found, foundItem }) => {
  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="relative aspect-square bg-black/90 flex items-center justify-center max-h-48">
        {/* Scanner viewfinder */}
        <div className="absolute inset-4 border-2 border-white/30 rounded-lg">
          {/* Corner markers */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br" />
        </div>
        
        {/* Scanning line */}
        {scanning && (
          <motion.div
            className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
            animate={{ y: [0, 120, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}
        
        {/* Found indicator */}
        {found && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center"
            >
              <Check className="w-8 h-8 text-white" />
            </motion.div>
          </motion.div>
        )}
        
        <ScanLine className="w-8 h-8 text-white/50" />
      </div>
      
      {/* Found item display */}
      {found && foundItem && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 border-t"
        >
          <DemoInventoryCard item={foundItem} highlight />
        </motion.div>
      )}
    </div>
  );
};

// ===========================================
// VENDOR CARD COMPONENT
// ===========================================

export const DemoVendorCard: React.FC<{
  name: string;
  productCount: number;
  contact?: string;
  highlight?: boolean;
}> = ({ name, productCount, contact, highlight }) => {
  return (
    <motion.div
      className={cn(
        "bg-card border rounded-lg p-3 flex items-center gap-3",
        highlight && "ring-2 ring-primary ring-offset-1"
      )}
      animate={highlight ? { scale: [1, 1.02, 1] } : {}}
    >
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Truck className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium">{name}</h4>
        <p className="text-xs text-muted-foreground">
          {productCount} products
          {contact && ` • ${contact}`}
        </p>
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground" />
    </motion.div>
  );
};

// ===========================================
// BULK ACTIONS BAR COMPONENT
// ===========================================

export const DemoBulkActionsBar: React.FC<{
  selectedCount: number;
  highlight?: boolean;
}> = ({ selectedCount, highlight }) => {
  return (
    <motion.div
      className={cn(
        "flex items-center justify-between p-2 bg-primary/10 border border-primary/20 rounded-lg",
        highlight && "ring-2 ring-primary"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="text-sm font-medium">
        {selectedCount} items selected
      </span>
      <div className="flex items-center gap-1">
        <button className="px-2 py-1 text-xs border rounded flex items-center gap-1 hover:bg-background">
          <Edit2 className="w-3 h-3" />
          Edit
        </button>
        <button className="px-2 py-1 text-xs border rounded flex items-center gap-1 hover:bg-background">
          <Download className="w-3 h-3" />
          Export
        </button>
        <button className="px-2 py-1 text-xs border border-destructive/50 text-destructive rounded flex items-center gap-1 hover:bg-destructive/10">
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>
    </motion.div>
  );
};

// ===========================================
// IMPORT/EXPORT PANEL COMPONENT
// ===========================================

export const DemoImportExportPanel: React.FC<{
  mode?: "import" | "export";
  progress?: number;
  complete?: boolean;
}> = ({ mode = "import", progress = 0, complete }) => {
  return (
    <div className="bg-card border rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        {mode === "import" ? (
          <Upload className="w-5 h-5 text-primary" />
        ) : (
          <Download className="w-5 h-5 text-primary" />
        )}
        <h4 className="font-medium">
          {mode === "import" ? "Import from CSV" : "Export Catalog"}
        </h4>
      </div>
      
      {progress > 0 && !complete && (
        <div className="space-y-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Processing... {progress}%
          </p>
        </div>
      )}
      
      {complete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-green-600"
        >
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-medium">
            {mode === "import" ? "Import complete!" : "Export ready!"}
          </span>
        </motion.div>
      )}
      
      {!progress && !complete && (
        <div className="border-2 border-dashed rounded-lg p-4 text-center">
          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {mode === "import" 
              ? "Drop CSV file here or click to browse"
              : "Click to download your catalog"
            }
          </p>
        </div>
      )}
    </div>
  );
};

// Sample inventory data for demos
export const sampleInventoryItems: DemoInventoryItemData[] = [
  { name: "Premium Sheer", sku: "FAB-001", category: "Fabric", vendor: "TextileCo", price: "$45/m", stock: 125 },
  { name: "Blockout Lining", sku: "FAB-002", category: "Fabric", vendor: "FabricWorld", price: "$28/m", stock: 80 },
  { name: "S-Fold Track", sku: "HW-001", category: "Hardware", vendor: "TrackMaster", price: "$85/m", stock: 45 },
  { name: "Wave Tape", sku: "HW-002", category: "Hardware", vendor: "TrackMaster", price: "$12/m", stock: 200 },
  { name: "Motorized Motor", sku: "HW-003", category: "Hardware", vendor: "SmartHome", price: "$320", stock: 15 },
  { name: "Velvet Drape", sku: "FAB-003", category: "Fabric", vendor: "LuxuryFab", price: "$95/m", stock: 30 },
];
