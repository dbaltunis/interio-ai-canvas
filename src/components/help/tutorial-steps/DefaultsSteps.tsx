import React from 'react';
import { MockCard, MockButton, MockInput, MockBadge, PulsingHighlight } from '../TutorialVisuals';
import { AlertTriangle, ArrowRight, Ruler, Percent, Save, Check } from 'lucide-react';

export const DefaultsStep1: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <div className="flex items-center gap-2">
      <h3 className="font-semibold text-foreground">Manufacturing Defaults</h3>
      <MockBadge variant="secondary">Curtains Only</MockBadge>
    </div>
    <PulsingHighlight>
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm">
          <div className="font-medium text-amber-800 dark:text-amber-200">Global Defaults</div>
          <div className="text-amber-700 dark:text-amber-300 text-xs mt-1">
            These values apply to all curtain templates unless overridden in the template's Manufacturing tab
          </div>
        </div>
      </div>
    </PulsingHighlight>
    <div className="text-sm text-muted-foreground">
      Set standard manufacturing allowances that will be used as starting values for new templates
    </div>
  </MockCard>
);

export const DefaultsStep2: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <h3 className="font-semibold text-foreground">Return & Overlap Values</h3>
    <div className="text-sm text-muted-foreground mb-2">
      These control how curtains wrap around tracks and meet in the center
    </div>
    <PulsingHighlight>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium mb-1 block">Left Return</label>
          <div className="flex items-center gap-1">
            <MockInput className="w-full text-center">12</MockInput>
            <span className="text-xs text-muted-foreground">cm</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Right Return</label>
          <div className="flex items-center gap-1">
            <MockInput className="w-full text-center">12</MockInput>
            <span className="text-xs text-muted-foreground">cm</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Center Overlap</label>
          <div className="flex items-center gap-1">
            <MockInput className="w-full text-center">8</MockInput>
            <span className="text-xs text-muted-foreground">cm</span>
          </div>
        </div>
      </div>
    </PulsingHighlight>
    <div className="bg-muted/50 rounded-md p-3 text-xs">
      <div className="font-medium mb-1">What these mean:</div>
      <div>• Returns: How far curtain wraps around track ends</div>
      <div>• Overlap: Extra width where curtains meet when closed</div>
    </div>
  </MockCard>
);

export const DefaultsStep3: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <div className="flex items-center gap-2">
      <Ruler className="h-4 w-4 text-muted-foreground" />
      <h3 className="font-semibold text-foreground">Hem Allowances</h3>
    </div>
    <div className="text-sm text-muted-foreground mb-2">
      Extra fabric needed for hems and headers
    </div>
    <PulsingHighlight>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium mb-1 block">Bottom Hem</label>
          <div className="flex items-center gap-1">
            <MockInput className="w-full text-center">15</MockInput>
            <span className="text-xs text-muted-foreground">cm</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Header Allowance</label>
          <div className="flex items-center gap-1">
            <MockInput className="w-full text-center">10</MockInput>
            <span className="text-xs text-muted-foreground">cm</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Side Hems (each)</label>
          <div className="flex items-center gap-1">
            <MockInput className="w-full text-center">3</MockInput>
            <span className="text-xs text-muted-foreground">cm</span>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block">Lining Hem</label>
          <div className="flex items-center gap-1">
            <MockInput className="w-full text-center">8</MockInput>
            <span className="text-xs text-muted-foreground">cm</span>
          </div>
        </div>
      </div>
    </PulsingHighlight>
  </MockCard>
);

export const DefaultsStep4: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <div className="flex items-center gap-2">
      <Percent className="h-4 w-4 text-muted-foreground" />
      <h3 className="font-semibold text-foreground">Waste Percentage</h3>
    </div>
    <div className="text-sm text-muted-foreground mb-2">
      Account for cutting waste and fabric defects
    </div>
    <PulsingHighlight>
      <div>
        <label className="text-sm font-medium mb-1 block">Waste Allowance</label>
        <div className="flex items-center gap-2">
          <MockInput className="w-24 text-center">5</MockInput>
          <span className="text-sm font-medium">%</span>
        </div>
      </div>
    </PulsingHighlight>
    <div className="bg-muted/50 rounded-md p-3 text-xs">
      <div className="font-medium mb-1">Example:</div>
      <div>Calculated fabric: 10m × 1.05 = <span className="font-semibold">10.5m ordered</span></div>
    </div>
  </MockCard>
);

export const DefaultsStep5: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <h3 className="font-semibold text-foreground">Measurement Unit</h3>
    <div className="text-sm text-muted-foreground mb-2">
      Choose your preferred unit for all manufacturing values
    </div>
    <PulsingHighlight>
      <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-md">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="font-medium">Centimeters (cm)</span>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
          <span>Inches (in)</span>
        </label>
      </div>
    </PulsingHighlight>
    <div className="text-xs text-muted-foreground">
      This affects how values are displayed in quotes and worksheets
    </div>
  </MockCard>
);

export const DefaultsStep6: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-foreground">Save Defaults</h3>
      <PulsingHighlight>
        <MockButton variant="default" size="sm">
          <Save className="h-4 w-4 mr-1" />
          Save Changes
        </MockButton>
      </PulsingHighlight>
    </div>
    <div className="border rounded-md p-3 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
        <Check className="h-4 w-4" />
        <span className="text-sm font-medium">Defaults saved successfully</span>
      </div>
    </div>
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 flex items-center gap-2 text-sm">
      <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
      <span>Override per template in <strong>Templates → Manufacturing tab</strong></span>
    </div>
  </MockCard>
);
