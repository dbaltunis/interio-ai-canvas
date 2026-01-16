import React from 'react';
import { MockCard, MockButton, MockInput, MockBadge, PulsingHighlight } from '../TutorialVisuals';
import { Plus, ChevronDown, Check, Percent, Ruler, DollarSign, Save, ArrowRight } from 'lucide-react';

export const HeadingsStep1: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-foreground">Heading Styles</h3>
      <PulsingHighlight>
        <MockButton variant="default" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Heading Style
        </MockButton>
      </PulsingHighlight>
    </div>
    <div className="text-sm text-muted-foreground">
      Create heading styles that define how curtains are gathered and hung
    </div>
    <div className="grid grid-cols-2 gap-2">
      <MockCard className="p-3 opacity-50">
        <div className="text-sm font-medium">Pencil Pleat</div>
        <div className="text-xs text-muted-foreground">2.5x fullness</div>
      </MockCard>
      <MockCard className="p-3 opacity-50">
        <div className="text-sm font-medium">Wave</div>
        <div className="text-xs text-muted-foreground">2.0x fullness</div>
      </MockCard>
    </div>
  </MockCard>
);

export const HeadingsStep2: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <h3 className="font-semibold text-foreground">New Heading Style</h3>
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-1 block">Heading Name *</label>
        <PulsingHighlight>
          <MockInput placeholder="e.g., Pinch Pleat" className="text-foreground">
            Pinch Pleat
          </MockInput>
        </PulsingHighlight>
      </div>
      <div className="text-xs text-muted-foreground">
        Choose a descriptive name that your team will recognize
      </div>
    </div>
  </MockCard>
);

export const HeadingsStep3: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <h3 className="font-semibold text-foreground">New Heading Style</h3>
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium mb-1 block">Heading Name</label>
        <MockInput>Pinch Pleat</MockInput>
      </div>
      <div>
        <label className="text-sm font-medium mb-1 block">Heading Type</label>
        <PulsingHighlight>
          <div className="flex items-center justify-between border rounded-md p-2 bg-background">
            <span className="text-sm">Select type...</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </PulsingHighlight>
        <div className="mt-1 border rounded-md bg-popover shadow-lg p-1 space-y-1">
          <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Standard</div>
          <div className="px-2 py-1.5 text-sm bg-accent rounded cursor-pointer font-medium">Pinch Pleat</div>
          <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Wave/Ripplefold</div>
          <div className="px-2 py-1.5 text-sm hover:bg-accent rounded cursor-pointer">Eyelet/Grommet</div>
        </div>
      </div>
    </div>
  </MockCard>
);

export const HeadingsStep4: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <h3 className="font-semibold text-foreground">Fullness Ratio</h3>
    <div className="text-sm text-muted-foreground mb-2">
      Fullness determines how much fabric is used relative to track width
    </div>
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <PulsingHighlight>
          <div className="flex items-center gap-2">
            <MockInput className="w-20 text-center">2.2</MockInput>
            <span className="text-sm font-medium">× fullness</span>
          </div>
        </PulsingHighlight>
      </div>
      <div className="bg-muted/50 rounded-md p-3 text-xs">
        <div className="font-medium mb-1">Example:</div>
        <div>Track width: 200cm × 2.2 = <span className="font-semibold">440cm fabric</span></div>
      </div>
    </div>
  </MockCard>
);

export const HeadingsStep5: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-foreground">Multiple Fullness Options</h3>
      <MockBadge variant="secondary">Optional</MockBadge>
    </div>
    <div className="text-sm text-muted-foreground">
      Offer multiple fullness choices for this heading style
    </div>
    <PulsingHighlight>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MockInput className="w-20 text-center">2.0</MockInput>
          <span className="text-sm">× Standard</span>
          <Check className="h-4 w-4 text-green-500 ml-auto" />
        </div>
        <div className="flex items-center gap-2">
          <MockInput className="w-20 text-center">2.2</MockInput>
          <span className="text-sm">× Recommended</span>
          <MockBadge variant="default" className="ml-auto text-xs">Default</MockBadge>
        </div>
        <div className="flex items-center gap-2">
          <MockInput className="w-20 text-center">2.5</MockInput>
          <span className="text-sm">× Luxury</span>
          <Check className="h-4 w-4 text-green-500 ml-auto" />
        </div>
        <MockButton variant="outline" size="sm" className="w-full mt-2">
          <Plus className="h-3 w-3 mr-1" />
          Add Fullness Option
        </MockButton>
      </div>
    </PulsingHighlight>
  </MockCard>
);

export const HeadingsStep6: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-foreground">Pricing</h3>
      <MockBadge variant="secondary">Optional</MockBadge>
    </div>
    <div className="text-sm text-muted-foreground">
      Set a price per linear metre for this heading style
    </div>
    <PulsingHighlight>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Price per Linear Metre</label>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <MockInput className="flex-1">45.00</MockInput>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded-full border-2 border-primary bg-primary" />
            Cost Price
          </label>
          <label className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
            Retail Price
          </label>
        </div>
      </div>
    </PulsingHighlight>
  </MockCard>
);

export const HeadingsStep7: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-foreground">Extra Fabric Allowance</h3>
      <MockBadge variant="secondary">Optional</MockBadge>
    </div>
    <div className="text-sm text-muted-foreground">
      Add extra fabric for pattern matching or heading construction
    </div>
    <PulsingHighlight>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-1 block">Additional Allowance</label>
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <MockInput className="w-24">15</MockInput>
            <span className="text-sm text-muted-foreground">cm per width</span>
          </div>
        </div>
        <div className="bg-muted/50 rounded-md p-3 text-xs">
          This is added to the cut length for each fabric width
        </div>
      </div>
    </PulsingHighlight>
  </MockCard>
);

export const HeadingsStep8: React.FC = () => (
  <MockCard className="p-4 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-foreground">Save & Use in Templates</h3>
      <PulsingHighlight>
        <MockButton variant="default" size="sm">
          <Save className="h-4 w-4 mr-1" />
          Save Heading
        </MockButton>
      </PulsingHighlight>
    </div>
    <div className="border-t pt-4 mt-2">
      <div className="text-sm font-medium mb-2">Your heading styles:</div>
      <div className="space-y-2">
        <MockCard className="p-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Pinch Pleat</div>
            <div className="text-xs text-muted-foreground">2.0x, 2.2x, 2.5x • $45/m</div>
          </div>
          <MockBadge variant="default">New</MockBadge>
        </MockCard>
        <MockCard className="p-3 flex items-center justify-between opacity-60">
          <div>
            <div className="text-sm font-medium">Pencil Pleat</div>
            <div className="text-xs text-muted-foreground">2.5x • $35/m</div>
          </div>
        </MockCard>
      </div>
    </div>
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md p-3 flex items-center gap-2 text-sm">
      <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
      <span>Enable this heading in <strong>My Templates → Heading tab</strong></span>
    </div>
  </MockCard>
);
