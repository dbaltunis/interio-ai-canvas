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
import {
  HeadingsStep1,
  HeadingsStep2,
  HeadingsStep3,
  HeadingsStep4,
  HeadingsStep5,
  HeadingsStep6,
  HeadingsStep7,
  HeadingsStep8,
} from "@/components/help/tutorial-steps/HeadingsSteps";
import {
  DefaultsStep1,
  DefaultsStep2,
  DefaultsStep3,
  DefaultsStep4,
  DefaultsStep5,
  DefaultsStep6,
} from "@/components/help/tutorial-steps/DefaultsSteps";
import {
  SuppliersStep1,
  SuppliersStep2,
  SuppliersStep3,
  SuppliersStep4,
  SuppliersStep5,
  SuppliersStep6,
  SuppliersStep7,
} from "@/components/help/tutorial-steps/SuppliersSteps";

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
// SUPPLIERS TUTORIAL - COMPREHENSIVE (7 Steps)
// ===========================================
export const suppliersTutorial: Tutorial = {
  id: "products-suppliers",
  steps: [
    {
      title: "Integration required first",
      actionLabel: "Enable",
      description: "Supplier catalogs require integration. Enable The Window Covering (TWC) in Settings → Integrations.",
      Visual: SuppliersStep1,
      relatedSection: "settings-integrations",
      prerequisiteNote: "Enable in Settings → Integrations first",
    },
    {
      title: "Browse the supplier catalog",
      actionLabel: "Search",
      description: "Use the search bar to find specific products or browse the full catalog of available items.",
      Visual: SuppliersStep2,
    },
    {
      title: "Filter by product type",
      actionLabel: "Filter",
      description: "Narrow down results by selecting a product type like Roller Blinds, Curtains, or Roman Blinds.",
      Visual: SuppliersStep3,
    },
    {
      title: "Select products to import",
      actionLabel: "Select",
      description: "Click checkboxes to select one or more products. Selected products will show pricing and details.",
      Visual: SuppliersStep4,
    },
    {
      title: "Import selected products",
      actionLabel: "Import",
      description: "Click 'Import Selected' to copy products to your account with all options and pricing intact.",
      Visual: SuppliersStep5,
    },
    {
      title: "View your imported products",
      actionLabel: "Review",
      description: "Imported products appear in your list with a 'Synced' badge. Pricing updates automatically.",
      Visual: SuppliersStep6,
    },
    {
      title: "Create template from import",
      actionLabel: "Create",
      description: "Turn an imported product into a ready-to-use template with one click. Customize as needed.",
      Visual: SuppliersStep7,
      relatedSection: "products-templates",
      prerequisiteNote: "Complete template setup in My Templates",
    },
  ],
};

// ===========================================
// HEADINGS TUTORIAL - COMPREHENSIVE (8 Steps)
// ===========================================
export const headingsTutorial: Tutorial = {
  id: "products-headings",
  steps: [
    {
      title: "Click Add Heading Style",
      actionLabel: "Click Button",
      description: "Start by clicking 'Add Heading Style' to create a new heading for your curtain products.",
      Visual: HeadingsStep1,
    },
    {
      title: "Enter the heading name",
      actionLabel: "Type Name",
      description: "Give your heading a descriptive name like 'Pinch Pleat', 'Wave Fold', or 'Eyelet'.",
      Visual: HeadingsStep2,
    },
    {
      title: "Select heading type",
      actionLabel: "Choose Type",
      description: "Select the type of heading construction. This helps categorize and organize your headings.",
      Visual: HeadingsStep3,
    },
    {
      title: "Set the fullness ratio",
      actionLabel: "Enter Ratio",
      description: "Fullness determines how much fabric is used. 2.2× means 220cm of fabric per 100cm of track.",
      Visual: HeadingsStep4,
    },
    {
      title: "Add multiple fullness options",
      actionLabel: "Add Options",
      description: "Offer different fullness levels (Standard, Recommended, Luxury) for customer choice.",
      Visual: HeadingsStep5,
    },
    {
      title: "Set pricing (optional)",
      actionLabel: "Enter Price",
      description: "Add a cost price per linear metre for this heading style. Used in manufacturing calculations.",
      Visual: HeadingsStep6,
    },
    {
      title: "Configure extra fabric allowance",
      actionLabel: "Set Allowance",
      description: "Add extra centimeters per width for heading construction or pattern matching needs.",
      Visual: HeadingsStep7,
    },
    {
      title: "Save and use in templates",
      actionLabel: "Save",
      description: "Your heading is now available to enable in curtain templates via the Heading tab.",
      Visual: HeadingsStep8,
      relatedSection: "products-templates",
      prerequisiteNote: "Enable in Templates → Heading tab",
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
// DEFAULTS TUTORIAL - COMPREHENSIVE (6 Steps)
// ===========================================
export const defaultsTutorial: Tutorial = {
  id: "products-defaults",
  steps: [
    {
      title: "Understanding global defaults",
      actionLabel: "Learn",
      description: "These values apply to all curtain templates unless overridden. Changes affect all future quotes.",
      Visual: DefaultsStep1,
    },
    {
      title: "Set return & overlap values",
      actionLabel: "Configure",
      description: "Define how curtains wrap around track ends (returns) and meet in the center (overlap).",
      Visual: DefaultsStep2,
    },
    {
      title: "Configure hem allowances",
      actionLabel: "Set Hems",
      description: "Set the extra fabric needed for bottom hems, headers, side hems, and lining hems.",
      Visual: DefaultsStep3,
    },
    {
      title: "Set waste percentage",
      actionLabel: "Enter %",
      description: "Account for cutting waste and defects. 5% means ordering 10.5m when 10m is calculated.",
      Visual: DefaultsStep4,
    },
    {
      title: "Choose measurement unit",
      actionLabel: "Select Unit",
      description: "Pick centimeters or inches for all manufacturing values in quotes and worksheets.",
      Visual: DefaultsStep5,
    },
    {
      title: "Save your defaults",
      actionLabel: "Save",
      description: "Click save to apply. Override these per-template in Templates → Manufacturing tab.",
      Visual: DefaultsStep6,
      relatedSection: "products-templates",
      prerequisiteNote: "Override per template in Templates → Manufacturing tab",
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
