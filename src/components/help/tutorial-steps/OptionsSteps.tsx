import { motion } from "framer-motion";
import { Plus, GripVertical, Eye, DollarSign, Layers, Save, Check } from "lucide-react";
import { 
  MockCard, 
  MockButton, 
  MockInput, 
  MockBadge, 
  PulsingHighlight 
} from "@/components/help/TutorialVisuals";

// Step 1: Click Add Option Type button
export const OptionsStep1 = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-foreground">Option Types</h3>
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

// Step 2: Enter option name
export const OptionsStep2 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <h3 className="font-semibold text-foreground">Create Option Type</h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Option Name *</label>
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
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
          <MockInput placeholder="Optional description..." className="w-full" />
        </div>
      </div>
    </MockCard>
  </div>
);

// Step 3: Select option category
export const OptionsStep3 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <h3 className="font-semibold text-foreground">Create Option Type</h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Option Name</label>
          <MockInput className="w-full">Motor Brand</MockInput>
        </div>
        
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Category *</label>
          <PulsingHighlight>
            <div className="border rounded-lg p-2 bg-background">
              <div className="flex items-center justify-between">
                <span className="text-sm">Select category...</span>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </div>
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-2 border-t pt-2 space-y-1"
              >
                {["Hardware", "Fabric Options", "Accessories", "Installation"].map((cat, i) => (
                  <div 
                    key={i} 
                    className={`text-sm p-1.5 rounded ${i === 0 ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                  >
                    {cat}
                  </div>
                ))}
              </motion.div>
            </div>
          </PulsingHighlight>
        </div>
      </div>
    </MockCard>
  </div>
);

// Step 4: Add option values
export const OptionsStep4 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Option Values</h3>
        <PulsingHighlight>
          <MockButton variant="outline" size="sm">
            <Plus className="h-3 w-3 mr-1" />
            Add Value
          </MockButton>
        </PulsingHighlight>
      </div>
      
      <div className="space-y-2">
        {["Somfy", "Coulisse", "Silent Gliss"].map((value, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
          >
            <MockCard className="p-3 flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{value}</span>
              </div>
              <div className="flex items-center gap-2">
                <MockBadge variant="secondary">₹{(i + 1) * 500}</MockBadge>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
            </MockCard>
          </motion.div>
        ))}
      </div>
    </MockCard>
  </div>
);

// Step 5: Set value prices
export const OptionsStep5 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <h3 className="font-semibold text-foreground">Set Value Prices</h3>
      
      <div className="space-y-3">
        {[
          { name: "Somfy", cost: 450, retail: 750 },
          { name: "Coulisse", cost: 380, retail: 600 },
          { name: "Silent Gliss", cost: 520, retail: 850 },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-sm w-24">{item.name}</span>
            <PulsingHighlight className={i === 0 ? "" : "opacity-50"}>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <MockInput className="w-20 text-center">{item.cost}</MockInput>
                  <span className="text-xs text-muted-foreground">cost</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  <MockInput className="w-20 text-center">{item.retail}</MockInput>
                  <span className="text-xs text-muted-foreground">retail</span>
                </div>
              </div>
            </PulsingHighlight>
          </div>
        ))}
      </div>
    </MockCard>
    
    <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
      💡 Cost price is your purchase cost. Retail price is shown to customers.
    </div>
  </div>
);

// Step 6: Configure pricing type
export const OptionsStep6 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <h3 className="font-semibold text-foreground">Pricing Configuration</h3>
      
      <div className="space-y-3">
        <label className="text-xs font-medium text-muted-foreground">How should this option be priced?</label>
        
        <PulsingHighlight>
          <div className="space-y-2">
            {[
              { label: "Fixed Price", desc: "Same price regardless of size", selected: false },
              { label: "Per Unit", desc: "Price multiplied by quantity", selected: true },
              { label: "Per Square Metre", desc: "Price based on treatment area", selected: false },
            ].map((option, i) => (
              <div 
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg border ${option.selected ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center ${option.selected ? "border-primary" : "border-muted-foreground"}`}>
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
      </div>
    </MockCard>
  </div>
);

// Step 7: Save option type
export const OptionsStep7 = () => (
  <div className="space-y-4">
    <MockCard className="p-4 space-y-4">
      <h3 className="font-semibold text-foreground">Review & Save</h3>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>
            <p className="font-medium">Motor Brand</p>
          </div>
          <div>
            <span className="text-muted-foreground">Category:</span>
            <p className="font-medium">Hardware</p>
          </div>
          <div>
            <span className="text-muted-foreground">Values:</span>
            <p className="font-medium">3 options</p>
          </div>
          <div>
            <span className="text-muted-foreground">Pricing:</span>
            <p className="font-medium">Per Unit</p>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <MockButton variant="outline" size="sm">Cancel</MockButton>
          <PulsingHighlight>
            <MockButton variant="primary" size="sm">
              <Save className="h-3 w-3 mr-1" />
              Save Option Type
            </MockButton>
          </PulsingHighlight>
        </div>
      </div>
    </MockCard>
  </div>
);

// Step 8: Option appears in list
export const OptionsStep8 = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-foreground">Option Types</h3>
        <p className="text-xs text-muted-foreground">Your option is now ready to use in templates</p>
      </div>
      <MockButton variant="primary" size="sm">
        <Plus className="h-3 w-3 mr-1" />
        Add Option Type
      </MockButton>
    </div>
    
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
      
      <PulsingHighlight>
        <MockCard className="p-3 flex items-center justify-between border-primary bg-primary/5">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Motor Brand</span>
            <MockBadge variant="primary">NEW</MockBadge>
            <MockBadge variant="secondary">3 values</MockBadge>
          </div>
          <Check className="h-4 w-4 text-primary" />
        </MockCard>
      </PulsingHighlight>
    </div>
    
    <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">
      ✨ This option is now available to enable in your templates via the Options tab.
    </div>
  </div>
);
