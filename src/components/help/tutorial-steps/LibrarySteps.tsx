import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Search, Grid, List, QrCode, Plus, Filter,
  Check, ChevronDown, Truck, Upload, Download, Edit2,
  Trash2, Tag, DollarSign, Box, Layers, CheckCircle,
  ScanLine, ExternalLink, LayoutGrid, FolderOpen
} from "lucide-react";
import { MockCard } from "../TutorialVisuals";
import { inPhase, typingProgress, phaseProgress } from "@/lib/demoAnimations";
import { 
  DemoInventoryCard, 
  DemoInventoryTabs, 
  DemoLibraryHeader,
  DemoAddItemDialog,
  DemoQRScanner,
  DemoVendorCard,
  DemoBulkActionsBar,
  DemoImportExportPanel,
  sampleInventoryItems,
} from "../demo-components/DemoInventoryElements";

interface StepProps {
  phase?: number;
}

// ===========================================
// LIBRARY TUTORIAL - 12 Interactive Steps
// ===========================================

// Step 1: Library Overview - Dashboard with stats
export const LibraryStep1: React.FC<StepProps> = ({ phase = 0 }) => {
  return (
    <MockCard className="p-4 space-y-3 max-h-[380px] overflow-hidden">
      {/* Header */}
      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Package className="w-5 h-5 text-primary" />
        <h2 className="font-semibold">Library</h2>
      </motion.div>

      {/* Stats row */}
      <motion.div 
        className="grid grid-cols-4 gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: inPhase(phase, 0.1, 1) ? 1 : 0 }}
        transition={{ delay: 0.2 }}
      >
        {[
          { label: "Fabrics", count: 248, color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
          { label: "Hardware", count: 86, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
          { label: "Vendors", count: 12, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
          { label: "Low Stock", count: 5, color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            className={`rounded-lg p-2 text-center ${stat.color}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: inPhase(phase, 0.2 + i * 0.1, 1) ? 1 : 0.8,
              opacity: inPhase(phase, 0.2 + i * 0.1, 1) ? 1 : 0
            }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="text-lg font-bold">{stat.count}</div>
            <div className="text-[10px]">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: inPhase(phase, 0.4, 1) ? 1 : 0 }}
      >
        <DemoInventoryTabs 
          activeTab="fabrics" 
          counts={{ fabrics: 248, hardware: 86, vendors: 12, collections: 8 }}
        />
      </motion.div>

      {/* Sample items */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: inPhase(phase, 0.6, 1) ? 1 : 0 }}
      >
        {sampleInventoryItems.slice(0, 3).map((item, i) => (
          <motion.div
            key={item.sku}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: inPhase(phase, 0.6 + i * 0.1, 1) ? 1 : 0,
              x: inPhase(phase, 0.6 + i * 0.1, 1) ? 0 : -20
            }}
          >
            <DemoInventoryCard item={item} />
          </motion.div>
        ))}
      </motion.div>
    </MockCard>
  );
};

// Step 2: Browse Categories - Tab navigation
export const LibraryStep2: React.FC<StepProps> = ({ phase = 0 }) => {
  const activeTab = phase < 0.3 ? "fabrics" : phase < 0.6 ? "hardware" : "vendors";
  const highlightTab = phase < 0.3 ? "hardware" : phase < 0.6 ? "vendors" : undefined;

  return (
    <MockCard className="p-4 space-y-3 max-h-[380px] overflow-hidden">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" />
        <h2 className="font-semibold">Library</h2>
      </div>

      {/* Tabs with highlight */}
      <DemoInventoryTabs 
        activeTab={activeTab} 
        highlightTab={highlightTab}
        counts={{ fabrics: 248, hardware: 86, vendors: 12, collections: 8 }}
      />

      {/* Content changes based on tab */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-2"
        >
          {activeTab === "fabrics" && (
            <>
              {sampleInventoryItems.filter(i => i.category === "Fabric").slice(0, 3).map((item) => (
                <DemoInventoryCard key={item.sku} item={item} />
              ))}
            </>
          )}
          {activeTab === "hardware" && (
            <>
              {sampleInventoryItems.filter(i => i.category === "Hardware").map((item) => (
                <DemoInventoryCard key={item.sku} item={item} />
              ))}
            </>
          )}
          {activeTab === "vendors" && (
            <>
              <DemoVendorCard name="TextileCo" productCount={45} contact="sales@textileco.com" />
              <DemoVendorCard name="TrackMaster" productCount={28} contact="orders@trackmaster.com" />
              <DemoVendorCard name="SmartHome" productCount={15} />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </MockCard>
  );
};

// Step 3: Search & Filter
export const LibraryStep3: React.FC<StepProps> = ({ phase = 0 }) => {
  const searchText = typingProgress(phase, 0.1, 0.4, "Premium");
  const showResults = phase > 0.5;
  const highlightFilter = phase > 0.7 && phase < 0.9;

  return (
    <MockCard className="p-4 space-y-3 max-h-[380px] overflow-hidden">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" />
        <h2 className="font-semibold">Library</h2>
      </div>

      {/* Search bar with typing */}
      <DemoLibraryHeader 
        searchValue={searchText}
        highlightSearch={phase < 0.5}
        highlightFilter={highlightFilter}
      />

      {/* Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <p className="text-xs text-muted-foreground">
              Found 2 items matching "Premium"
            </p>
            <DemoInventoryCard 
              item={sampleInventoryItems[0]} 
              highlight={phase > 0.6}
            />
            <DemoInventoryCard 
              item={{ name: "Premium Velvet", sku: "FAB-004", category: "Fabric", vendor: "LuxuryFab", price: "$78/m", stock: 22 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </MockCard>
  );
};

// Step 4: View Modes - Grid/List toggle
export const LibraryStep4: React.FC<StepProps> = ({ phase = 0 }) => {
  const viewMode = phase < 0.5 ? "grid" : "list";

  return (
    <MockCard className="p-4 space-y-3 max-h-[380px] overflow-hidden">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" />
        <h2 className="font-semibold">Library</h2>
      </div>

      <DemoLibraryHeader 
        highlightViewToggle={phase > 0.3 && phase < 0.7}
        viewMode={viewMode}
      />

      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-2"
          >
            {sampleInventoryItems.slice(0, 4).map((item) => (
              <div key={item.sku} className="bg-card border rounded-lg p-2 text-center">
                <div className="w-full h-12 bg-muted rounded mb-1 flex items-center justify-center">
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs font-medium truncate">{item.name}</p>
                <p className="text-xs text-primary">{item.price}</p>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {sampleInventoryItems.slice(0, 4).map((item) => (
              <DemoInventoryCard key={item.sku} item={item} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </MockCard>
  );
};

// Step 5: Add New Item - Click Add button
export const LibraryStep5: React.FC<StepProps> = ({ phase = 0 }) => {
  const showDialog = phase > 0.5;

  return (
    <MockCard className="p-4 space-y-3 max-h-[380px] overflow-hidden">
      {!showDialog && (
        <>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Library</h2>
          </div>

          <DemoLibraryHeader highlightAdd={phase > 0.2 && phase < 0.5} />

          <div className="space-y-2">
            {sampleInventoryItems.slice(0, 2).map((item) => (
              <DemoInventoryCard key={item.sku} item={item} />
            ))}
          </div>
        </>
      )}

      {showDialog && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <DemoAddItemDialog activeTab="basic" />
        </motion.div>
      )}
    </MockCard>
  );
};

// Step 6: Enter Details - Form filling
export const LibraryStep6: React.FC<StepProps> = ({ phase = 0 }) => {
  const nameText = typingProgress(phase, 0.1, 0.4, "Silk Voile");
  const skuText = phase > 0.4 ? "FAB-007" : "";
  const categoryText = phase > 0.6 ? "Fabric" : "";
  const vendorText = phase > 0.8 ? "TextileCo" : "";

  return (
    <MockCard className="p-4 max-h-[380px] overflow-hidden">
      <DemoAddItemDialog 
        activeTab="basic"
        highlightTab={phase < 0.2 ? "basic" : undefined}
        formData={{
          name: nameText,
          sku: skuText,
          category: categoryText,
          vendor: vendorText,
        }}
      />
    </MockCard>
  );
};

// Step 7: Set Pricing
export const LibraryStep7: React.FC<StepProps> = ({ phase = 0 }) => {
  const costText = typingProgress(phase, 0.2, 0.4, "32.50");
  const priceText = typingProgress(phase, 0.5, 0.7, "65.00");

  return (
    <MockCard className="p-4 max-h-[380px] overflow-hidden">
      <DemoAddItemDialog 
        activeTab="pricing"
        highlightTab={phase < 0.2 ? "pricing" : undefined}
        formData={{
          cost: costText,
          price: priceText,
        }}
      />
    </MockCard>
  );
};

// Step 8: Track Inventory
export const LibraryStep8: React.FC<StepProps> = ({ phase = 0 }) => {
  const stockText = typingProgress(phase, 0.3, 0.5, "50");

  return (
    <MockCard className="p-4 max-h-[380px] overflow-hidden">
      <DemoAddItemDialog 
        activeTab="inventory"
        highlightTab={phase < 0.2 ? "inventory" : undefined}
        formData={{
          stock: stockText,
        }}
      />
    </MockCard>
  );
};

// Step 9: QR Code Scanner
export const LibraryStep9: React.FC<StepProps> = ({ phase = 0 }) => {
  const scanning = phase > 0.2 && phase < 0.7;
  const found = phase > 0.7;

  return (
    <MockCard className="p-4 space-y-3 max-h-[380px] overflow-hidden">
      <div className="flex items-center gap-2">
        <QrCode className="w-5 h-5 text-primary" />
        <h2 className="font-semibold">Scan Item</h2>
      </div>

      <DemoQRScanner 
        scanning={scanning}
        found={found}
        foundItem={found ? sampleInventoryItems[0] : undefined}
      />

      {found && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2"
        >
          <button className="flex-1 py-2 text-sm border rounded-md flex items-center justify-center gap-2">
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button className="flex-1 py-2 text-sm bg-primary text-primary-foreground rounded-md flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Add to Quote
          </button>
        </motion.div>
      )}
    </MockCard>
  );
};

// Step 10: Manage Vendors
export const LibraryStep10: React.FC<StepProps> = ({ phase = 0 }) => {
  return (
    <MockCard className="p-4 space-y-3 max-h-[380px] overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Vendors</h2>
        </div>
        <motion.button
          className="h-8 px-3 bg-primary text-primary-foreground rounded-md flex items-center gap-1 text-sm"
          animate={phase > 0.2 && phase < 0.4 ? { scale: [1, 1.1, 1] } : {}}
        >
          <Plus className="w-4 h-4" />
          Add
        </motion.button>
      </div>

      <div className="space-y-2">
        <DemoVendorCard 
          name="TextileCo" 
          productCount={45} 
          contact="sales@textileco.com"
          highlight={phase > 0.5 && phase < 0.7}
        />
        <DemoVendorCard 
          name="TrackMaster" 
          productCount={28} 
          contact="orders@trackmaster.com"
        />
        <DemoVendorCard 
          name="SmartHome" 
          productCount={15} 
        />
        <DemoVendorCard 
          name="FabricWorld" 
          productCount={62} 
          contact="hello@fabricworld.com"
        />
      </div>

      {phase > 0.7 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2 bg-green-100 dark:bg-green-900/30 rounded-md flex items-center gap-2 text-green-700 dark:text-green-400"
        >
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Catalog synced - 45 products imported</span>
        </motion.div>
      )}
    </MockCard>
  );
};

// Step 11: Bulk Actions
export const LibraryStep11: React.FC<StepProps> = ({ phase = 0 }) => {
  const selectedCount = phase < 0.3 ? 0 : phase < 0.5 ? 2 : 4;

  return (
    <MockCard className="p-4 space-y-3 max-h-[380px] overflow-hidden">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" />
        <h2 className="font-semibold">Library</h2>
      </div>

      {selectedCount > 0 && (
        <DemoBulkActionsBar 
          selectedCount={selectedCount} 
          highlight={phase > 0.6}
        />
      )}

      <div className="space-y-2">
        {sampleInventoryItems.slice(0, 4).map((item, i) => (
          <motion.div
            key={item.sku}
            animate={
              i < selectedCount && phase > 0.2 + i * 0.1 
                ? { scale: [1, 1.02, 1] } 
                : {}
            }
          >
            <DemoInventoryCard 
              item={item}
              showCheckbox
              checked={i < selectedCount}
              selected={i < selectedCount}
            />
          </motion.div>
        ))}
      </div>
    </MockCard>
  );
};

// Step 12: Import/Export
export const LibraryStep12: React.FC<StepProps> = ({ phase = 0 }) => {
  const mode = phase < 0.5 ? "import" : "export";
  const progress = phase < 0.3 ? 0 : phase < 0.5 ? Math.round(phaseProgress(phase, 0.3, 0.5) * 100) : 
                   phase < 0.8 ? 0 : Math.round(phaseProgress(phase, 0.8, 0.95) * 100);
  const complete = phase > 0.48 && phase < 0.52 || phase > 0.95;

  return (
    <MockCard className="p-4 space-y-3 max-h-[380px] overflow-hidden">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" />
        <h2 className="font-semibold">Library</h2>
      </div>

      {/* Mode toggle */}
      <div className="flex border rounded-md overflow-hidden">
        <button className={`flex-1 py-2 text-sm flex items-center justify-center gap-2 ${mode === "import" ? "bg-primary text-primary-foreground" : ""}`}>
          <Upload className="w-4 h-4" />
          Import
        </button>
        <button className={`flex-1 py-2 text-sm flex items-center justify-center gap-2 ${mode === "export" ? "bg-primary text-primary-foreground" : ""}`}>
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      <DemoImportExportPanel 
        mode={mode}
        progress={progress}
        complete={complete}
      />

      {complete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground">
            {mode === "import" 
              ? "24 items added to your inventory" 
              : "248 items exported to catalog.csv"
            }
          </p>
        </motion.div>
      )}
    </MockCard>
  );
};
