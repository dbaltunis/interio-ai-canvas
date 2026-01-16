import { Plus, Save, Layers, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  HighlightedButton, 
  HighlightRing, 
  MockHeader, 
  MockTableRow,
  TypingText,
} from "../TutorialVisuals";

// Step 1: Click Add Template button
export const TemplatesStep1 = () => (
  <div className="space-y-4">
    <MockHeader 
      title="My Templates" 
      action={
        <HighlightedButton icon={Plus} size="sm">
          Add Template
        </HighlightedButton>
      }
    />
    <div className="space-y-2">
      <MockTableRow name="Standard Curtain" value="Curtain" />
      <MockTableRow name="Blockout Roller" value="Roller Blind" />
      <MockTableRow name="Sheer S-Fold" value="Curtain" />
    </div>
    <p className="text-xs text-muted-foreground text-center pt-2">
      Your existing templates appear here
    </p>
  </div>
);

// Step 2: Enter template name
export const TemplatesStep2 = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 pb-2 border-b border-border">
      <Layers className="h-4 w-4 text-primary" />
      <span className="text-sm font-semibold">New Template</span>
    </div>
    
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Template Name</Label>
        <HighlightRing className="w-full">
          <Input 
            value=""
            placeholder="Enter template name..."
            className="pointer-events-none"
          />
        </HighlightRing>
      </div>
      
      <div className="space-y-1.5 opacity-50">
        <Label className="text-xs">Category</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
        </Select>
      </div>
    </div>
  </div>
);

// Step 3: Type the template name
export const TemplatesStep3 = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 pb-2 border-b border-border">
      <Layers className="h-4 w-4 text-primary" />
      <span className="text-sm font-semibold">New Template</span>
    </div>
    
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Template Name</Label>
        <HighlightRing className="w-full">
          <div className="flex items-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <TypingText text="Premium Sheer" />
          </div>
        </HighlightRing>
      </div>
      
      <div className="space-y-1.5 opacity-50">
        <Label className="text-xs">Category</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
        </Select>
      </div>
    </div>
  </div>
);

// Step 4: Select category
export const TemplatesStep4 = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 pb-2 border-b border-border">
      <Layers className="h-4 w-4 text-primary" />
      <span className="text-sm font-semibold">New Template</span>
    </div>
    
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Template Name</Label>
        <Input 
          value="Premium Sheer"
          readOnly
          className="pointer-events-none"
        />
      </div>
      
      <div className="space-y-1.5">
        <Label className="text-xs">Category</Label>
        <HighlightRing className="w-full">
          <Select value="curtain">
            <SelectTrigger className="pointer-events-none">
              <SelectValue />
            </SelectTrigger>
          </Select>
        </HighlightRing>
        
        {/* Dropdown simulation */}
        <Card className="border shadow-lg">
          <CardContent className="p-1">
            <div className="space-y-0.5">
              <div className="px-2 py-1.5 text-sm rounded hover:bg-muted cursor-default bg-primary/10 text-primary font-medium">
                Curtain
              </div>
              <div className="px-2 py-1.5 text-sm rounded hover:bg-muted cursor-default">
                Roller Blind
              </div>
              <div className="px-2 py-1.5 text-sm rounded hover:bg-muted cursor-default">
                Roman Blind
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// Step 5: Save template
export const TemplatesStep5 = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 pb-2 border-b border-border">
      <Layers className="h-4 w-4 text-primary" />
      <span className="text-sm font-semibold">New Template</span>
    </div>
    
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Template Name</Label>
        <Input 
          value="Premium Sheer"
          readOnly
          className="pointer-events-none"
        />
      </div>
      
      <div className="space-y-1.5">
        <Label className="text-xs">Category</Label>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Curtain</Badge>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Default Options</Label>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline" className="text-xs">Heading: Pinch Pleat</Badge>
          <Badge variant="outline" className="text-xs">Lining: Standard</Badge>
        </div>
      </div>
    </div>

    <div className="flex justify-end pt-2">
      <HighlightedButton icon={Save} size="sm">
        Save Template
      </HighlightedButton>
    </div>
  </div>
);

// Step 6: Template saved confirmation
export const TemplatesStep6 = () => (
  <div className="space-y-4">
    <MockHeader 
      title="My Templates" 
      action={
        <Button size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Template
        </Button>
      }
    />
    <div className="space-y-2">
      <MockTableRow name="Standard Curtain" value="Curtain" />
      <MockTableRow name="Blockout Roller" value="Roller Blind" />
      <MockTableRow name="Sheer S-Fold" value="Curtain" />
      <MockTableRow name="Premium Sheer" value="Curtain" highlighted />
    </div>
    <div className="flex items-center justify-center gap-2 pt-2">
      <div className="w-2 h-2 rounded-full bg-green-500" />
      <span className="text-xs text-green-600 font-medium">Template saved successfully!</span>
    </div>
  </div>
);
