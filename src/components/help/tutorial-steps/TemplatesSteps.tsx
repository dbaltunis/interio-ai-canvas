import { motion } from "framer-motion";
import { Plus, Save, Check, Settings2, Layers, GripVertical, Eye, EyeOff, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { 
  HighlightRing, 
  HighlightedButton, 
  MockTableRow,
  MockHeader,
  TypingText,
} from "../TutorialVisuals";

// Mock tabs component for template form
const MockTabs = ({ activeTab, highlightTab }: { activeTab: string; highlightTab?: string }) => {
  const tabs = ["Basic", "Heading", "Options", "Pricing", "Manufacturing", "Rules"];
  return (
    <div className="flex border-b border-border mb-4 overflow-x-auto">
      {tabs.map((tab) => (
        <div key={tab} className="relative flex-shrink-0">
          {highlightTab === tab && (
            <motion.div
              className="absolute inset-0 bg-primary/20 rounded-t-md"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          <button
            className={`px-2.5 py-2 text-xs font-medium transition-colors relative ${
              activeTab === tab
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        </div>
      ))}
    </div>
  );
};

// Cross-reference component
export const CrossReference = ({ label }: { label: string }) => (
  <div className="flex items-center gap-2 mt-3 p-2 bg-muted/50 rounded-md border border-dashed border-border">
    <span className="text-xs text-muted-foreground">See:</span>
    <span className="text-xs font-medium text-primary">{label}</span>
  </div>
);

// ===========================================
// PART 1: BASIC TAB (Steps 1-4)
// ===========================================

// Step 1: Click Add Template
export const TemplatesStep1 = () => (
  <div className="space-y-3">
    <MockHeader 
      title="My Templates" 
      action={
        <HighlightedButton>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Template
        </HighlightedButton>
      }
    />
    <div className="space-y-2">
      <MockTableRow name="Premium Sheer Curtain" value="Curtain" />
      <MockTableRow name="Standard Roller Blind" value="Roller Blind" />
    </div>
  </div>
);

// Step 2: Form opens - Focus on name input
export const TemplatesStep2 = () => (
  <div className="space-y-3">
    <Card className="p-3 border-2 border-primary/30 shadow-lg">
      <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Create New Template</span>
      </div>
      <MockTabs activeTab="Basic" />
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Template Name *</Label>
          <HighlightRing className="w-full">
            <Input placeholder="Enter template name..." className="pointer-events-none" />
          </HighlightRing>
        </div>
        <div className="space-y-1.5 opacity-50">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
          </Select>
        </div>
      </div>
    </Card>
  </div>
);

// Step 3: Type template name
export const TemplatesStep3 = () => (
  <div className="space-y-3">
    <Card className="p-3 border-2 border-primary/30 shadow-lg">
      <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Create New Template</span>
      </div>
      <MockTabs activeTab="Basic" />
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Template Name *</Label>
          <HighlightRing className="w-full">
            <div className="flex items-center h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <TypingText text="Premium Sheer" />
            </div>
          </HighlightRing>
        </div>
        <div className="space-y-1.5 opacity-50">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
          </Select>
        </div>
      </div>
    </Card>
  </div>
);

// Step 4: Select category
export const TemplatesStep4 = () => (
  <div className="space-y-3">
    <Card className="p-3 border-2 border-primary/30 shadow-lg">
      <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Create New Template</span>
      </div>
      <MockTabs activeTab="Basic" />
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Template Name *</Label>
          <Input value="Premium Sheer" readOnly className="text-sm pointer-events-none" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Category *</Label>
          <HighlightRing className="w-full">
            <div className="h-9 rounded-md border border-primary bg-background px-3 py-2 text-sm flex items-center justify-between">
              <span>Curtain</span>
              <Check className="h-4 w-4 text-primary" />
            </div>
          </HighlightRing>
          <p className="text-[10px] text-muted-foreground">
            Category determines which tabs appear
          </p>
        </div>
      </div>
    </Card>
  </div>
);

// ===========================================
// PART 2: HEADING TAB (Steps 5-6)
// ===========================================

// Step 5: Switch to Heading tab
export const TemplatesStep5 = () => (
  <div className="space-y-3">
    <Card className="p-3 border-2 border-primary/30 shadow-lg">
      <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Create New Template</span>
      </div>
      <MockTabs activeTab="Basic" highlightTab="Heading" />
      <div className="space-y-3 opacity-50">
        <div className="space-y-1.5">
          <Label className="text-xs">Template Name</Label>
          <Input value="Premium Sheer" readOnly className="text-sm pointer-events-none" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Category</Label>
          <Input value="Curtain" readOnly className="text-sm pointer-events-none" />
        </div>
      </div>
    </Card>
    <p className="text-xs text-center text-muted-foreground">
      Click the Heading tab to configure heading styles
    </p>
  </div>
);

// Step 6: Select heading styles (CORRECTED: Checkbox grid for selecting EXISTING headings)
export const TemplatesStep6 = () => (
  <div className="space-y-3">
    <Card className="p-3 border-2 border-primary/30 shadow-lg">
      <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Create New Template</span>
      </div>
      <MockTabs activeTab="Heading" />
      <div className="space-y-2">
        <div>
          <Label className="text-xs font-medium">Available Heading Styles</Label>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Select which heading styles are available for this template
          </p>
        </div>
        {/* Checkbox grid matching real HeadingStyleSelector */}
        <div className="grid grid-cols-2 gap-2">
          <HighlightRing className="w-full">
            <div className="flex items-start gap-2 p-2 rounded-lg border border-primary bg-background">
              <div className="w-3.5 h-3.5 mt-0.5 rounded border-2 border-primary bg-primary flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-medium">Wave Fold</span>
                  <Badge className="text-[8px] h-3.5 bg-blue-100 text-blue-700">TWC</Badge>
                </div>
                <Badge variant="outline" className="text-[8px] h-3.5 mt-1">2.2x fullness</Badge>
              </div>
            </div>
          </HighlightRing>
          <div className="flex items-start gap-2 p-2 rounded-lg border border-border bg-background">
            <div className="w-3.5 h-3.5 mt-0.5 rounded border-2 border-muted-foreground/30" />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium">S-Fold</span>
              <div className="flex items-center gap-1 mt-1">
                <Badge variant="outline" className="text-[8px] h-3.5">2.0x fullness</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-lg border border-border bg-background">
            <div className="w-3.5 h-3.5 mt-0.5 rounded border-2 border-primary bg-primary flex items-center justify-center">
              <Check className="h-2.5 w-2.5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium">Pencil Pleat</span>
              <Badge variant="outline" className="text-[8px] h-3.5 mt-1">2.5x fullness</Badge>
            </div>
          </div>
          <div className="flex items-start gap-2 p-2 rounded-lg border border-border bg-muted/30 opacity-60">
            <div className="w-3.5 h-3.5 mt-0.5 rounded border-2 border-muted-foreground/30" />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-muted-foreground">Eyelet</span>
            </div>
          </div>
        </div>
        <p className="text-[9px] text-muted-foreground italic">
          ⚠️ Heading styles must be created first in Products → Headings
        </p>
      </div>
    </Card>
    <CrossReference label="Products → Headings" />
  </div>
);

// ===========================================
// PART 3: OPTIONS TAB (Steps 7-9)
// ===========================================

// Step 7: Switch to Options tab
export const TemplatesStep7 = () => (
  <div className="space-y-3">
    <Card className="p-3 border-2 border-primary/30 shadow-lg">
      <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Create New Template</span>
      </div>
      <MockTabs activeTab="Heading" highlightTab="Options" />
      <div className="space-y-3 opacity-50">
        <div className="space-y-1.5">
          <Label className="text-xs">Heading Style</Label>
          <Input value="Wave Fold (2.2x)" readOnly className="text-sm pointer-events-none" />
        </div>
      </div>
    </Card>
    <p className="text-xs text-center text-muted-foreground">
      Click the Options tab to configure options
    </p>
  </div>
);

// Step 8: Enable/disable options (CORRECTED: Accordion with drag handles)
export const TemplatesStep8 = () => (
  <div className="space-y-3">
    <Card className="p-3 border-2 border-primary/30 shadow-lg">
      <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Create New Template</span>
      </div>
      <MockTabs activeTab="Options" />
      <div className="space-y-2">
        <p className="text-[10px] text-muted-foreground">Drag to reorder, toggle to enable/disable:</p>
        
        {/* Accordion item - expanded */}
        <HighlightRing className="w-full">
          <div className="rounded-lg border border-primary bg-background">
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex items-center gap-2">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab" />
                <span className="text-xs font-medium">Lining</span>
                <Badge className="text-[8px] h-3.5 bg-blue-100 text-blue-700">TWC</Badge>
                <Badge variant="secondary" className="text-[8px] h-3.5">4 visible</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-muted-foreground">Enabled</span>
                <Switch checked={true} className="pointer-events-none scale-75" />
              </div>
            </div>
            {/* Expanded content - value visibility toggles */}
            <div className="px-2 pb-2 pt-1 border-t border-border bg-muted/20">
              <div className="flex items-center gap-1 mb-1.5">
                <span className="text-[9px] text-muted-foreground">Click to show/hide values:</span>
                <Button variant="ghost" size="sm" className="h-5 text-[8px] px-1.5">
                  <Eye className="h-2.5 w-2.5 mr-0.5" />
                  Show All
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-[8px] h-5 gap-1 cursor-pointer">
                  <Eye className="h-2.5 w-2.5" />
                  Standard Blockout
                </Badge>
                <Badge variant="secondary" className="text-[8px] h-5 gap-1 cursor-pointer">
                  <Eye className="h-2.5 w-2.5" />
                  Thermal
                </Badge>
                <Badge variant="outline" className="text-[8px] h-5 gap-1 cursor-pointer text-muted-foreground">
                  <EyeOff className="h-2.5 w-2.5" />
                  Unlined
                </Badge>
              </div>
            </div>
          </div>
        </HighlightRing>

        {/* Collapsed accordion items */}
        <div className="rounded-lg border border-border bg-background">
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2">
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">Control Type</span>
              <Badge variant="secondary" className="text-[8px] h-3.5">3 visible</Badge>
            </div>
            <Switch checked={true} className="pointer-events-none scale-75" />
          </div>
        </div>
        
        <div className="rounded-lg border border-border bg-muted/30">
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-2">
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Valance</span>
              <Badge variant="destructive" className="text-[8px] h-3.5">Disabled</Badge>
            </div>
            <Switch checked={false} className="pointer-events-none scale-75" />
          </div>
        </div>
      </div>
    </Card>
  </div>
);

// Step 9: Individual value visibility (CORRECTED: Eye/EyeOff toggles)
export const TemplatesStep9 = () => (
  <div className="space-y-3">
    <Card className="p-3 border-2 border-primary/30 shadow-lg">
      <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Create New Template</span>
      </div>
      <MockTabs activeTab="Options" />
      <div className="space-y-2">
        <div className="rounded-lg border border-border bg-background">
          <div className="flex items-center justify-between px-2 py-2 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Lining</span>
              <Badge variant="secondary" className="text-[8px] h-3.5">Enabled</Badge>
            </div>
          </div>
          <div className="p-2 space-y-2">
            <p className="text-[9px] text-muted-foreground">
              Click individual values to show/hide for this template:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <HighlightRing>
                <Badge variant="secondary" className="text-[9px] h-6 gap-1.5 cursor-pointer hover:bg-secondary/80">
                  <Eye className="h-3 w-3 text-green-600" />
                  Standard Blockout
                </Badge>
              </HighlightRing>
              <Badge variant="secondary" className="text-[9px] h-6 gap-1.5 cursor-pointer">
                <Eye className="h-3 w-3 text-green-600" />
                Thermal Lining
              </Badge>
              <Badge variant="outline" className="text-[9px] h-6 gap-1.5 cursor-pointer text-muted-foreground">
                <EyeOff className="h-3 w-3" />
                Premium Blackout
              </Badge>
              <Badge variant="outline" className="text-[9px] h-6 gap-1.5 cursor-pointer text-muted-foreground">
                <EyeOff className="h-3 w-3" />
                Unlined
              </Badge>
            </div>
            <p className="text-[8px] text-muted-foreground italic pt-1">
              Hidden values won't appear when quoting this product
            </p>
          </div>
        </div>
      </div>
    </Card>
    <CrossReference label="Products → Options" />
  </div>
);

// ===========================================
// PART 4: PRICING TAB (Steps 10-12)
// ===========================================

// Step 10: Switch to Pricing tab
export const TemplatesStep10 = () => (
  <div className="space-y-3">
    <Card className="p-3 border-2 border-primary/30 shadow-lg">
      <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Create New Template</span>
      </div>
      <MockTabs activeTab="Options" highlightTab="Pricing" />
      <div className="space-y-2 opacity-50">
        <div className="flex items-center justify-between p-2 rounded-md border bg-background">
          <span className="text-xs">Lining</span>
          <Switch checked={true} className="pointer-events-none" />
        </div>
        <div className="flex items-center justify-between p-2 rounded-md border bg-background">
          <span className="text-xs">Control Type</span>
          <Switch checked={true} className="pointer-events-none" />
        </div>
      </div>
    </Card>
    <p className="text-xs text-center text-muted-foreground">
      Click Pricing to configure prices
    </p>
  </div>
);

// Step 11: Select pricing method (CORRECTED: Shows actual methods)
export const TemplatesStep11 = () => (
  <div className="space-y-3">
    <Card className="p-3 border-2 border-primary/30 shadow-lg">
      <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Create New Template</span>
      </div>
      <MockTabs activeTab="Pricing" />
      <div className="space-y-2">
        <Label className="text-xs font-medium">Pricing Method</Label>
        <HighlightRing className="w-full">
          <Select defaultValue="pricing_grid">
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select method..." />
            </SelectTrigger>
          </Select>
        </HighlightRing>
        <div className="grid grid-cols-2 gap-1.5 text-[9px] text-muted-foreground">
          <div className="p-1.5 rounded border border-border bg-muted/30">
            <span className="font-medium">Per Running Metre</span>
            <p className="text-[8px]">Price per linear metre of fabric</p>
          </div>
          <div className="p-1.5 rounded border border-border bg-muted/30">
            <span className="font-medium">Per Panel</span>
            <p className="text-[8px]">Fixed price per curtain panel</p>
          </div>
          <div className="p-1.5 rounded border border-primary/50 bg-primary/5">
            <span className="font-medium text-primary">Pricing Grid</span>
            <p className="text-[8px]">Width × drop matrix lookup</p>
          </div>
          <div className="p-1.5 rounded border border-border bg-muted/30">
            <span className="font-medium">Per m²</span>
            <p className="text-[8px]">Square meter calculation</p>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

// Step 12: Assign pricing grid
export const TemplatesStep12 = () => (
  <div className="space-y-3">
    <Card className="p-3 border-2 border-primary/30 shadow-lg">
      <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Create New Template</span>
      </div>
      <MockTabs activeTab="Pricing" />
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">Pricing Grid</Badge>
          <span className="text-[10px] text-muted-foreground">selected</span>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium">Assign Grid</Label>
          <HighlightRing className="w-full">
            <div className="h-8 rounded-md border border-primary bg-background px-2 py-1.5 text-xs flex items-center justify-between">
              <span>TWC Premium Grid</span>
              <Check className="h-3 w-3 text-primary" />
            </div>
          </HighlightRing>
          <p className="text-[10px] text-muted-foreground">Includes fabric cost</p>
        </div>
      </div>
    </Card>
    <CrossReference label="Settings → Pricing" />
  </div>
);

// ===========================================
// PART 5: MANUFACTURING TAB (Steps 13-14)
// ===========================================

// Step 13: Switch to Manufacturing tab
export const TemplatesStep13 = () => (
  <div className="space-y-3">
    <Card className="p-3 border-2 border-primary/30 shadow-lg">
      <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Create New Template</span>
      </div>
      <MockTabs activeTab="Pricing" highlightTab="Manufacturing" />
      <div className="space-y-2 opacity-50">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px]">Pricing Grid</Badge>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Assigned Grid</Label>
          <Input value="TWC Premium Grid" readOnly className="text-xs h-8 pointer-events-none" />
        </div>
      </div>
    </Card>
    <p className="text-xs text-center text-muted-foreground">
      Click Manufacturing for fabric settings
    </p>
  </div>
);

// Step 14: Set manufacturing defaults
export const TemplatesStep14 = () => (
  <div className="space-y-3">
    <Card className="p-3 border-2 border-primary/30 shadow-lg">
      <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Create New Template</span>
      </div>
      <MockTabs activeTab="Manufacturing" />
      <div className="space-y-2">
        <p className="text-[10px] text-muted-foreground">Override global defaults:</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px]">Header (cm)</Label>
            <HighlightRing className="w-full">
              <Input value="15" readOnly className="text-xs h-7 pointer-events-none" />
            </HighlightRing>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px]">Bottom Hem</Label>
            <Input value="10" readOnly className="text-xs h-7 pointer-events-none" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px]">Side Allow.</Label>
            <Input value="3" readOnly className="text-xs h-7 pointer-events-none" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px]">Waste %</Label>
            <Input value="5" readOnly className="text-xs h-7 pointer-events-none" />
          </div>
        </div>
      </div>
    </Card>
    <CrossReference label="Products → Defaults" />
  </div>
);

// ===========================================
// PART 6: SAVE & COMPLETION (Steps 15-16)
// ===========================================

// Step 15: Save the template
export const TemplatesStep15 = () => (
  <div className="space-y-3">
    <Card className="p-3 border-2 border-primary/30 shadow-lg">
      <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Create New Template</span>
      </div>
      <MockTabs activeTab="Manufacturing" />
      <div className="space-y-2 opacity-50">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px]">Header (cm)</Label>
            <Input value="15" readOnly className="text-xs h-7 pointer-events-none" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px]">Bottom Hem</Label>
            <Input value="10" readOnly className="text-xs h-7 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
        <Button variant="outline" size="sm" className="h-7 text-xs pointer-events-none">Cancel</Button>
        <HighlightedButton>
          <Save className="h-3 w-3 mr-1" />
          Create
        </HighlightedButton>
      </div>
    </Card>
  </div>
);

// Step 16: Template created
export const TemplatesStep16 = () => (
  <div className="space-y-3">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="w-10 h-10 mx-auto mb-2 rounded-full bg-green-500/20 flex items-center justify-center"
      >
        <Check className="h-5 w-5 text-green-600" />
      </motion.div>
      <h4 className="text-sm font-semibold text-green-700 dark:text-green-400">Template Created!</h4>
      <p className="text-xs text-muted-foreground">Premium Sheer is ready to use</p>
    </motion.div>
    <div className="space-y-2">
      <HighlightRing className="w-full">
        <div className="flex items-center justify-between p-2 rounded-md border border-primary bg-primary/5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Premium Sheer</span>
            <Badge className="text-[10px] bg-green-500/20 text-green-700 h-4">New</Badge>
          </div>
          <Badge variant="secondary" className="text-[10px]">Curtain</Badge>
        </div>
      </HighlightRing>
      <MockTableRow name="Standard Roller Blind" value="Roller Blind" />
    </div>
  </div>
);

// ===========================================
// PART 7: RULES TAB - ADVANCED (Steps 17-18)
// ===========================================

// Step 17: Re-open template, access Rules
export const TemplatesStep17 = () => (
  <div className="space-y-3">
    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
      <div className="flex items-start gap-2">
        <Settings2 className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-xs font-medium text-amber-700 dark:text-amber-400">Advanced: Rules</h4>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Rules tab appears after saving. Re-open template to add logic.
          </p>
        </div>
      </div>
    </div>
    <Card className="p-3 border-2 border-primary/30 shadow-lg">
      <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Edit: Premium Sheer</span>
      </div>
      <MockTabs activeTab="Manufacturing" highlightTab="Rules" />
      <div className="space-y-2 opacity-50">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px]">Header (cm)</Label>
            <Input value="15" readOnly className="text-xs h-7 pointer-events-none" />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px]">Bottom Hem</Label>
            <Input value="10" readOnly className="text-xs h-7 pointer-events-none" />
          </div>
        </div>
      </div>
    </Card>
  </div>
);

// Step 18: Create a rule (CORRECTED: Matches real OptionRulesManager UI)
export const TemplatesStep18 = () => (
  <div className="space-y-3">
    <Card className="p-3 border-2 border-primary/30 shadow-lg">
      <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
        <Layers className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Edit: Premium Sheer</span>
      </div>
      <MockTabs activeTab="Rules" />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Conditional Rules</Label>
          <Button size="sm" variant="outline" className="h-6 text-[10px] pointer-events-none">
            <Plus className="h-2.5 w-2.5 mr-1" />
            Add Rule
          </Button>
        </div>
        
        {/* Rule card matching real OptionRulesManager */}
        <HighlightRing className="w-full">
          <div className="p-2 rounded-lg border border-primary bg-background">
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded bg-muted shrink-0">
                <Eye className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium">Show Motor Brand when motorized</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <Badge variant="outline" className="text-[8px] h-4">
                    When: Control Type
                  </Badge>
                  <Badge variant="outline" className="text-[8px] h-4">
                    equals: Motorized
                  </Badge>
                  <Badge variant="secondary" className="text-[8px] h-4">
                    Show: Motor Brand
                  </Badge>
                </div>
              </div>
              <div className="flex gap-0.5 shrink-0">
                <Button variant="ghost" size="icon" className="h-5 w-5 pointer-events-none">
                  <Edit className="h-2.5 w-2.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive pointer-events-none">
                  <Trash2 className="h-2.5 w-2.5" />
                </Button>
              </div>
            </div>
          </div>
        </HighlightRing>
        
        <p className="text-[9px] text-muted-foreground italic">
          Actions: Show/Hide option, Require option, Set default, Filter values
        </p>
      </div>
    </Card>
  </div>
);
