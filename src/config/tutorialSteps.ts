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
import {
  PersonalStep1,
  PersonalStep2,
  PersonalStep3,
  PersonalStep4,
  PersonalStep5,
  PersonalStep6,
} from "@/components/help/tutorial-steps/PersonalSteps";
import {
  BusinessStep1,
  BusinessStep2,
  BusinessStep3,
  BusinessStep4,
  BusinessStep5,
  BusinessStep6,
  BusinessStep7,
} from "@/components/help/tutorial-steps/BusinessSteps";
import {
  UnitsStep1,
  UnitsStep2,
  UnitsStep3,
  UnitsStep4,
  UnitsStep5,
} from "@/components/help/tutorial-steps/UnitsSteps";
import {
  PricingStep1,
  PricingStep2,
  PricingStep3,
  PricingStep4,
  PricingStep5,
  PricingStep6,
} from "@/components/help/tutorial-steps/PricingSteps";

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
// PERSONAL SETTINGS TUTORIAL (10 Steps)
// ===========================================
export const personalTutorial: Tutorial = {
  id: "personal",
  steps: [
    { title: "Upload your profile picture", actionLabel: "Upload Photo", description: "Add a profile photo that appears on documents and in team views. Click the camera icon to upload.", Visual: PersonalStep1 },
    { title: "Enter your profile details", actionLabel: "Fill Form", description: "Enter your first name, last name, display name, and phone number. These appear on quotes and communications.", Visual: PersonalStep2 },
    { title: "Change email address", actionLabel: "Update Email", description: "Your current email is shown. Click 'Change Email' to update it - a verification email will be sent.", Visual: PersonalStep3 },
    { title: "Configure notifications", actionLabel: "Toggle Settings", description: "Enable email and SMS notifications. Use the test buttons to verify they work correctly.", Visual: PersonalStep4 },
    { title: "Update your password", actionLabel: "Change Password", description: "Enter your current password, then set a new one. Both new password fields must match.", Visual: PersonalStep5 },
    { title: "Password security", actionLabel: "Check Strength", description: "Passwords must be at least 6 characters. A strength indicator shows how secure your password is.", Visual: PersonalStep6 },
    { title: "Select date format", actionLabel: "Choose Format", description: "Choose how dates are displayed: MM/DD/YYYY (US), DD/MM/YYYY (UK/AU), YYYY-MM-DD (ISO), or DD-MMM-YYYY.", Visual: PersonalStep7 },
    { title: "Set your timezone", actionLabel: "Select Timezone", description: "Choose your timezone for accurate appointment scheduling and notification timing.", Visual: PersonalStep8 },
    { title: "Language settings", actionLabel: "View Options", description: "Currently English is the default language. Additional languages are coming soon.", Visual: PersonalStep9 },
    { title: "Save your profile", actionLabel: "Save", description: "Review your settings preview and click Save Profile to apply all changes.", Visual: PersonalStep10 },
  ],
};

// ===========================================
// BUSINESS SETTINGS TUTORIAL (16 Steps)
// ===========================================
export const businessTutorial: Tutorial = {
  id: "business",
  steps: [
    { title: "Enter company details", actionLabel: "Fill Details", description: "Add your trading name (shown to clients) and legal name (for contracts and invoices).", Visual: BusinessStep1 },
    { title: "Select organization type", actionLabel: "Choose Type", description: "Select your business structure: Sole Trader, Partnership, Pty Ltd, Corporation, or Non-Profit.", Visual: BusinessStep2 },
    { title: "Upload company logo", actionLabel: "Upload Logo", description: "Your logo appears on quotes, invoices, and documents. Use 500×200px PNG with transparent background.", Visual: BusinessStep3 },
    { title: "Select your country first", actionLabel: "Choose Country", description: "Select your country to automatically show the correct registration labels (ABN, VAT, EIN, etc.).", Visual: BusinessStep4 },
    { title: "Enter registration numbers", actionLabel: "Add Numbers", description: "Enter your business registration numbers. Labels adapt based on your country selection.", Visual: BusinessStep5 },
    { title: "Tax identification", actionLabel: "Enter Tax ID", description: "Add your tax registration number. Required for generating valid tax invoices.", Visual: BusinessStep6 },
    { title: "Add contact details", actionLabel: "Enter Contacts", description: "Add your business email, phone, and website. These appear on documents and client communications.", Visual: BusinessStep7 },
    { title: "Enter business address", actionLabel: "Fill Address", description: "Your complete business address appears on quotes, invoices, and contracts.", Visual: BusinessStep8 },
    { title: "Set payment terms", actionLabel: "Choose Terms", description: "Set default payment terms (7, 14, 21, 30 days, etc.) applied to new quotes and invoices.", Visual: BusinessStep9 },
    { title: "Financial year end", actionLabel: "Set Date", description: "Configure your financial year end date for reporting and tax calculations.", Visual: BusinessStep10 },
    { title: "Enter bank details", actionLabel: "Add Banking", description: "Add your bank name and account name. These appear on invoices for client payments.", Visual: BusinessStep11 },
    { title: "Country-specific banking", actionLabel: "Fill Fields", description: "Enter account details: BSB + Account (Australia), Sort Code (UK), or IBAN + SWIFT (Europe).", Visual: BusinessStep12 },
    { title: "Invoice reference prefix", actionLabel: "Set Prefix", description: "Set a prefix for payment references (e.g., 'INV') shown on invoices.", Visual: BusinessStep13 },
    { title: "Late payment policies", actionLabel: "Configure", description: "Set interest rate, late fees, and payment terms text for overdue invoices.", Visual: BusinessStep14 },
    { title: "Advanced settings (Admin)", actionLabel: "Toggle", description: "Admin-only settings like in-app template editing. Only visible to account administrators.", Visual: BusinessStep15 },
    { title: "Save each section", actionLabel: "Save", description: "Each section saves independently. Click Edit to modify, then Save or Cancel.", Visual: BusinessStep16 },
  ],
};

// ===========================================
// UNITS SETTINGS TUTORIAL (6 Steps)
// ===========================================
export const unitsTutorial: Tutorial = {
  id: "units",
  steps: [
    { title: "Choose measurement system", actionLabel: "Select System", description: "Pick Metric (cm, m), Imperial (inches, feet), or Mixed to customize each unit type separately.", Visual: UnitsStep1 },
    { title: "Configure length units", actionLabel: "Set Length", description: "Choose your primary length unit (mm, cm, m, inches, feet) for window measurements and dimensions.", Visual: UnitsStep2 },
    { title: "Configure area units", actionLabel: "Set Area", description: "Choose units for area calculations: square meters, square feet, etc.", Visual: UnitsStep3 },
    { title: "Configure fabric units", actionLabel: "Set Fabric", description: "Choose units for fabric measurements: linear meters, yards, feet. Used for ordering quantities.", Visual: UnitsStep4 },
    { title: "Select your currency", actionLabel: "Choose Currency", description: "Set your currency (AUD, USD, GBP, EUR, etc.). This is used throughout all quotes and invoices.", Visual: UnitsStep5 },
    { title: "Preview and save", actionLabel: "Save", description: "Review your settings preview showing example measurements and pricing, then save.", Visual: UnitsStep6 },
  ],
};

// ===========================================
// PRICING SETTINGS TUTORIAL (12 Steps)
// ===========================================
export const pricingTutorial: Tutorial = {
  id: "pricing",
  steps: [
    { title: "Understanding the two tabs", actionLabel: "View Tabs", description: "Pricing has two tabs: 'Pricing Grids' for uploading price matrices, and 'Settings' for tax and markup configuration.", Visual: PricingStep1 },
    { title: "Browse pricing grids", actionLabel: "View Grids", description: "The Pricing Grids tab shows all your uploaded width×drop pricing matrices organized by product type.", Visual: PricingStep2 },
    { title: "Upload new pricing grid", actionLabel: "Upload", description: "Upload CSV or Excel files containing width×drop pricing matrices for quick template setup.", Visual: PricingStep3, relatedSection: "products-templates", prerequisiteNote: "Assign grids in Templates → Pricing tab" },
    { title: "Set grid-specific markup", actionLabel: "Set Markup", description: "Each pricing grid can have its own markup percentage that overrides category and default settings.", Visual: PricingStep4 },
    { title: "Markup hierarchy explained", actionLabel: "Learn", description: "Markup priority: Grid → Category → Default → Minimum Floor. System checks each level in order.", Visual: PricingStep5 },
    { title: "Select tax type", actionLabel: "Choose Type", description: "Choose your tax type: No Tax, VAT, GST, or Sales Tax. This affects how tax is calculated.", Visual: PricingStep6 },
    { title: "Set tax rate", actionLabel: "Enter Rate", description: "Enter your tax percentage (e.g., 10 for 10%, 20 for 20%). Preview shows example calculations.", Visual: PricingStep7 },
    { title: "Tax inclusive toggle", actionLabel: "Configure", description: "Toggle whether displayed prices include tax or if tax is added separately at checkout.", Visual: PricingStep8 },
    { title: "Set default markup", actionLabel: "Enter %", description: "Set your default profit margin percentage. Applied when no grid or category markup is set.", Visual: PricingStep9 },
    { title: "Set minimum margin floor", actionLabel: "Set Floor", description: "Set a minimum markup floor. No item will ever have markup below this percentage.", Visual: PricingStep10 },
    { title: "Configure category markups", actionLabel: "Set Categories", description: "Override default markup for specific categories: Curtains, Blinds, Hardware, Fabrics, Installation.", Visual: PricingStep11 },
    { title: "Save your settings", actionLabel: "Save", description: "Each section has its own save button. Save Tax, Global, and Category settings independently.", Visual: PricingStep12 },
  ],
};

// ===========================================
// TUTORIAL MAP
// ===========================================
export const tutorialMap: Record<string, Tutorial> = {
  // Products sub-tabs
  "products-templates": templatesTutorial,
  "products-suppliers": suppliersTutorial,
  "products-headings": headingsTutorial,
  "products-options": optionsTutorial,
  "products-defaults": defaultsTutorial,
  // Main Settings tabs
  "personal": personalTutorial,
  "business": businessTutorial,
  "units": unitsTutorial,
  "pricing": pricingTutorial,
};
