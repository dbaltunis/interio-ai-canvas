import { ComponentType } from "react";
import { 
  TemplatesStep1, 
  TemplatesStep2, 
  TemplatesStep3, 
  TemplatesStep4, 
  TemplatesStep5,
  TemplatesStep6,
  TemplatesStep7,
  TemplatesStep8,
  TemplatesStep9,
  TemplatesStep10,
  TemplatesStep11,
  TemplatesStep12,
  TemplatesStep13,
  TemplatesStep14,
  TemplatesStep15,
  TemplatesStep16,
  TemplatesStep17,
  TemplatesStep18,
} from "@/components/help/tutorial-steps/TemplatesSteps";
import {
  OptionsStep1,
  OptionsStep2,
  OptionsStep3,
  OptionsStep4,
  OptionsStep5,
  OptionsStep6,
  OptionsStep7,
  OptionsStep8,
} from "@/components/help/tutorial-steps/OptionsSteps";

export interface TutorialStep {
  title: string;
  actionLabel: string;
  description: string;
  Visual: ComponentType;
  relatedSection?: string;
  prerequisiteNote?: string;
}

export interface Tutorial {
  id: string;
  steps: TutorialStep[];
}

// ===========================================
// TEMPLATES TUTORIAL - COMPREHENSIVE (18 Steps)
// ===========================================
export const templatesTutorial: Tutorial = {
  id: "products-templates",
  steps: [
    // PART 1: BASIC TAB (Steps 1-4)
    {
      title: "Start by clicking Add Template",
      actionLabel: "Click Button",
      description: "The Add Template button is located in the top right of the templates section. This opens the template creation form.",
      Visual: TemplatesStep1,
    },
    {
      title: "Enter a name for your template",
      actionLabel: "Focus Input",
      description: "Give your template a descriptive name that helps you identify it quickly when creating quotes.",
      Visual: TemplatesStep2,
    },
    {
      title: "Type your template name",
      actionLabel: "Type Name",
      description: "Choose a clear name like 'Premium Sheer' or 'Standard Blockout' that describes the product configuration.",
      Visual: TemplatesStep3,
    },
    {
      title: "Select the product category",
      actionLabel: "Select Category",
      description: "Choose which product type this template is for. The category determines which tabs appear (e.g., curtains show Heading tab).",
      Visual: TemplatesStep4,
    },
    // PART 2: HEADING TAB (Steps 5-6)
    {
      title: "Navigate to the Heading tab",
      actionLabel: "Click Tab",
      description: "For curtain products, click the Heading tab to configure heading styles and fullness ratios.",
      Visual: TemplatesStep5,
    },
    {
      title: "Select a heading style",
      actionLabel: "Select Heading",
      description: "Choose a heading style like Wave Fold, Pinch Pleat, or S-Fold. Each has a different fullness ratio that affects fabric calculation.",
      Visual: TemplatesStep6,
      relatedSection: "products-headings",
      prerequisiteNote: "Create heading styles in Products → Headings first",
    },
    // PART 3: OPTIONS TAB (Steps 7-9)
    {
      title: "Navigate to the Options tab",
      actionLabel: "Click Tab",
      description: "Click the Options tab to configure which options appear when quoting this product.",
      Visual: TemplatesStep7,
    },
    {
      title: "Enable options for this template",
      actionLabel: "Toggle Options",
      description: "Use the switches to enable or disable specific options. Only enabled options will appear when creating quotes with this template.",
      Visual: TemplatesStep8,
      relatedSection: "products-options",
      prerequisiteNote: "Options must first be created in Products → Options",
    },
    {
      title: "Set default option values",
      actionLabel: "Select Default",
      description: "For each enabled option, you can set a default value that will be pre-selected when creating new quotes.",
      Visual: TemplatesStep9,
    },
    // PART 4: PRICING TAB (Steps 10-12)
    {
      title: "Navigate to the Pricing tab",
      actionLabel: "Click Tab",
      description: "Click the Pricing tab to configure how prices are calculated for this template.",
      Visual: TemplatesStep10,
    },
    {
      title: "Select a pricing method",
      actionLabel: "Select Method",
      description: "Choose how prices are calculated: Pricing Grid (width × drop matrix), Per Square Meter, or Per Linear Meter.",
      Visual: TemplatesStep11,
    },
    {
      title: "Assign a pricing grid",
      actionLabel: "Select Grid",
      description: "If using Pricing Grid method, select which grid to use. Grids from suppliers like TWC include fabric cost in the price.",
      Visual: TemplatesStep12,
      relatedSection: "settings-pricing",
      prerequisiteNote: "Set up pricing grids in Settings → Pricing",
    },
    // PART 5: MANUFACTURING TAB (Steps 13-14)
    {
      title: "Navigate to the Manufacturing tab",
      actionLabel: "Click Tab",
      description: "Click Manufacturing to set fabric allowances and waste percentages specific to this template.",
      Visual: TemplatesStep13,
    },
    {
      title: "Set manufacturing defaults",
      actionLabel: "Enter Values",
      description: "Configure header allowance, bottom hem, side allowance, and waste percentage. These override global defaults for this template only.",
      Visual: TemplatesStep14,
      relatedSection: "products-defaults",
      prerequisiteNote: "Global defaults are set in Products → Defaults",
    },
    // PART 6: SAVE & COMPLETION (Steps 15-16)
    {
      title: "Save your new template",
      actionLabel: "Click Save",
      description: "Once you've configured all tabs, click 'Create Template' to save. You can edit the template later to make changes.",
      Visual: TemplatesStep15,
    },
    {
      title: "Template created successfully!",
      actionLabel: "Done",
      description: "Your new template now appears in the list and is ready to use when creating quotes. Notice the 'New' badge on recently created templates.",
      Visual: TemplatesStep16,
    },
    // PART 7: RULES TAB - ADVANCED (Steps 17-18)
    {
      title: "Access the Rules tab (Advanced)",
      actionLabel: "Re-open Template",
      description: "The Rules tab appears after saving. Re-open your template to add conditional logic that enforces business rules.",
      Visual: TemplatesStep17,
    },
    {
      title: "Create conditional rules",
      actionLabel: "Add Rule",
      description: "Rules automatically apply conditions like 'If width > 3000mm, require motorized control'. Great for enforcing product constraints.",
      Visual: TemplatesStep18,
    },
  ],
};

// ===========================================
// SUPPLIERS TUTORIAL (placeholder)
// ===========================================
export const suppliersTutorial: Tutorial = {
  id: "products-suppliers",
  steps: [
    {
      title: "Browse the supplier catalog",
      actionLabel: "Navigate",
      description: "Access the TWC supplier catalog to find pre-configured products you can import as templates.",
      Visual: () => null, // Placeholder
    },
  ],
};

// ===========================================
// HEADINGS TUTORIAL (placeholder)
// ===========================================
export const headingsTutorial: Tutorial = {
  id: "products-headings",
  steps: [
    {
      title: "Create a new heading style",
      actionLabel: "Click Add",
      description: "Add custom heading styles with specific fullness ratios and pricing for your curtain products.",
      Visual: () => null, // Placeholder
    },
  ],
};

// ===========================================
// OPTIONS TUTORIAL - COMPREHENSIVE (8 Steps)
// ===========================================
export const optionsTutorial: Tutorial = {
  id: "products-options",
  steps: [
    {
      title: "Click Add Option Type",
      actionLabel: "Click Button",
      description: "Start by clicking the 'Add Option Type' button to create a new configurable option for your products.",
      Visual: OptionsStep1,
    },
    {
      title: "Enter the option name",
      actionLabel: "Type Name",
      description: "Give your option a clear, descriptive name like 'Lining Type', 'Control Side', or 'Motor Brand'.",
      Visual: OptionsStep2,
    },
    {
      title: "Select a category",
      actionLabel: "Choose Category",
      description: "Categorize your option (Hardware, Fabric Options, Accessories) to keep things organized.",
      Visual: OptionsStep3,
    },
    {
      title: "Add option values",
      actionLabel: "Add Values",
      description: "Click 'Add Value' to create the choices for this option. Each value can have its own pricing.",
      Visual: OptionsStep4,
    },
    {
      title: "Set prices for each value",
      actionLabel: "Enter Prices",
      description: "Enter the cost price (your cost) and retail price (customer sees) for each option value.",
      Visual: OptionsStep5,
    },
    {
      title: "Configure pricing type",
      actionLabel: "Select Type",
      description: "Choose how the option price is calculated: fixed amount, per unit, or based on treatment area.",
      Visual: OptionsStep6,
    },
    {
      title: "Save your option type",
      actionLabel: "Click Save",
      description: "Review your settings and click 'Save Option Type' to add it to your library.",
      Visual: OptionsStep7,
    },
    {
      title: "Option ready to use!",
      actionLabel: "Done",
      description: "Your new option appears in the list and can now be enabled in any template via the Options tab.",
      Visual: OptionsStep8,
      relatedSection: "products-templates",
      prerequisiteNote: "Enable this option in Templates → Options tab",
    },
  ],
};

// ===========================================
// DEFAULTS TUTORIAL (placeholder)
// ===========================================
export const defaultsTutorial: Tutorial = {
  id: "products-defaults",
  steps: [
    {
      title: "Configure manufacturing defaults",
      actionLabel: "Edit Settings",
      description: "Set default values for hem allowance, side allowance, and fabric waste percentages.",
      Visual: () => null, // Placeholder
    },
  ],
};

// ===========================================
// TUTORIAL MAP
// ===========================================
export const tutorialMap: Record<string, Tutorial> = {
  "products-templates": templatesTutorial,
  "products-suppliers": suppliersTutorial,
  "products-headings": headingsTutorial,
  "products-options": optionsTutorial,
  "products-defaults": defaultsTutorial,
};
