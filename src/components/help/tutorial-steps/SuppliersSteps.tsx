import React from 'react';
import { MockCard, MockButton, MockInput, MockBadge, PulsingHighlight } from '../TutorialVisuals';
import { Lock, Search, ChevronDown, Check, Download, Package, ArrowRight, Settings, ExternalLink } from 'lucide-react';

export const SuppliersStep1: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <div className="flex items-center gap-2">
      <Lock className="h-5 w-5 text-muted-foreground" />
      <h3 className="font-semibold text-foreground">Integration Required</h3>
    </div>
    <PulsingHighlight>
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-4">
        <div className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
          Enable Supplier Integration First
        </div>
        <div className="text-xs text-amber-700 dark:text-amber-300 mb-3">
          Connect to supplier catalogs (e.g., The Window Covering) to import products automatically
        </div>
        <MockButton variant="outline" size="sm" className="w-full">
          <Settings className="h-3 w-3 mr-1" />
          Go to Settings → Integrations
        </MockButton>
      </div>
    </PulsingHighlight>
    <div className="text-sm text-muted-foreground">
      Once enabled, you can browse and import products from supplier catalogs
    </div>
  </MockCard>
);

export const SuppliersStep2: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <h3 className="font-semibold text-foreground">Browse Supplier Catalog</h3>
    <PulsingHighlight>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <MockInput className="pl-9 w-full">Search products...</MockInput>
        </div>
        <MockButton variant="outline" size="sm">
          <ChevronDown className="h-4 w-4" />
        </MockButton>
      </div>
    </PulsingHighlight>
    <div className="grid grid-cols-2 gap-2 opacity-60">
      <MockCard className="p-2">
        <div className="h-12 bg-muted rounded mb-2" />
        <div className="text-xs font-medium">Roller Blind A</div>
        <div className="text-xs text-muted-foreground">TWC-RB001</div>
      </MockCard>
      <MockCard className="p-2">
        <div className="h-12 bg-muted rounded mb-2" />
        <div className="text-xs font-medium">Roller Blind B</div>
        <div className="text-xs text-muted-foreground">TWC-RB002</div>
      </MockCard>
    </div>
  </MockCard>
);

export const SuppliersStep3: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <h3 className="font-semibold text-foreground">Filter by Product Type</h3>
    <div className="flex items-center gap-2">
      <MockInput className="flex-1 pl-9">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      </MockInput>
      <PulsingHighlight>
        <div className="border rounded-md p-2 flex items-center gap-2 bg-background min-w-[140px]">
          <span className="text-sm">All Types</span>
          <ChevronDown className="h-4 w-4 ml-auto" />
        </div>
      </PulsingHighlight>
    </div>
    <div className="border rounded-md bg-popover shadow-lg p-1 space-y-1">
      <div className="px-2 py-1.5 text-sm hover:bg-accent rounded">All Types</div>
      <div className="px-2 py-1.5 text-sm bg-accent rounded font-medium">Roller Blinds</div>
      <div className="px-2 py-1.5 text-sm hover:bg-accent rounded">Curtains</div>
      <div className="px-2 py-1.5 text-sm hover:bg-accent rounded">Roman Blinds</div>
      <div className="px-2 py-1.5 text-sm hover:bg-accent rounded">Venetian Blinds</div>
    </div>
  </MockCard>
);

export const SuppliersStep4: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <h3 className="font-semibold text-foreground">Select Products to Import</h3>
    <div className="text-sm text-muted-foreground mb-2">
      Click checkboxes to select products for import
    </div>
    <PulsingHighlight>
      <div className="space-y-2">
        <MockCard className="p-3 flex items-center gap-3 border-primary bg-primary/5">
          <div className="w-5 h-5 rounded border-2 border-primary bg-primary flex items-center justify-center">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
          <div className="h-10 w-10 bg-muted rounded" />
          <div className="flex-1">
            <div className="text-sm font-medium">Sunscreen Roller</div>
            <div className="text-xs text-muted-foreground">TWC-SR001</div>
          </div>
          <MockBadge variant="secondary">$85/sqm</MockBadge>
        </MockCard>
        <MockCard className="p-3 flex items-center gap-3 border-primary bg-primary/5">
          <div className="w-5 h-5 rounded border-2 border-primary bg-primary flex items-center justify-center">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
          <div className="h-10 w-10 bg-muted rounded" />
          <div className="flex-1">
            <div className="text-sm font-medium">Blockout Roller</div>
            <div className="text-xs text-muted-foreground">TWC-BR001</div>
          </div>
          <MockBadge variant="secondary">$95/sqm</MockBadge>
        </MockCard>
        <MockCard className="p-3 flex items-center gap-3 opacity-60">
          <div className="w-5 h-5 rounded border-2 border-muted-foreground" />
          <div className="h-10 w-10 bg-muted rounded" />
          <div className="flex-1">
            <div className="text-sm font-medium">Double Roller</div>
            <div className="text-xs text-muted-foreground">TWC-DR001</div>
          </div>
          <MockBadge variant="outline">$120/sqm</MockBadge>
        </MockCard>
      </div>
    </PulsingHighlight>
  </MockCard>
);

export const SuppliersStep5: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-foreground">Import Selected Products</h3>
      <MockBadge variant="default">2 selected</MockBadge>
    </div>
    <PulsingHighlight>
      <MockButton variant="default" className="w-full">
        <Download className="h-4 w-4 mr-2" />
        Import Selected Products
      </MockButton>
    </PulsingHighlight>
    <div className="text-sm text-muted-foreground">
      Importing will copy product details, options, and pricing to your account
    </div>
  </MockCard>
);

export const SuppliersStep6: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <div className="flex items-center gap-2">
      <Package className="h-4 w-4 text-muted-foreground" />
      <h3 className="font-semibold text-foreground">Your Imported Products</h3>
    </div>
    <PulsingHighlight>
      <div className="space-y-2">
        <MockCard className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted rounded" />
            <div>
              <div className="text-sm font-medium">Sunscreen Roller</div>
              <div className="text-xs text-muted-foreground">TWC-SR001 • Imported just now</div>
            </div>
          </div>
          <MockBadge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            <Check className="h-3 w-3 mr-1" />
            Synced
          </MockBadge>
        </MockCard>
        <MockCard className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted rounded" />
            <div>
              <div className="text-sm font-medium">Blockout Roller</div>
              <div className="text-xs text-muted-foreground">TWC-BR001 • Imported just now</div>
            </div>
          </div>
          <MockBadge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            <Check className="h-3 w-3 mr-1" />
            Synced
          </MockBadge>
        </MockCard>
      </div>
    </PulsingHighlight>
  </MockCard>
);

export const SuppliersStep7: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <h3 className="font-semibold text-foreground">Create Template from Import</h3>
    <div className="text-sm text-muted-foreground mb-2">
      Turn imported products into ready-to-use templates
    </div>
    <MockCard className="p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-muted rounded" />
        <div>
          <div className="text-sm font-medium">Sunscreen Roller</div>
          <div className="text-xs text-muted-foreground">TWC-SR001</div>
        </div>
      </div>
      <PulsingHighlight>
        <MockButton variant="outline" size="sm">
          <ExternalLink className="h-3 w-3 mr-1" />
          Create Template
        </MockButton>
      </PulsingHighlight>
    </MockCard>
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 flex items-center gap-2 text-sm">
      <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
      <span>Complete template setup in <strong>My Templates</strong></span>
    </div>
  </MockCard>
);
