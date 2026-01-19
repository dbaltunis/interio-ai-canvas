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
  OptionsStep1, OptionsStep2, OptionsStep3, OptionsStep4, OptionsStep5, OptionsStep6, OptionsStep7, OptionsStep8,
  OptionsStep9, OptionsStep10, OptionsStep11, OptionsStep12, OptionsStep13, OptionsStep14, OptionsStep15,
  OptionsStep16, OptionsStep17, OptionsStep18, OptionsStep19, OptionsStep20,
} from "@/components/help/tutorial-steps/OptionsSteps";
import {
  HeadingsStep1, HeadingsStep2, HeadingsStep3, HeadingsStep4, HeadingsStep5, HeadingsStep6, HeadingsStep7, HeadingsStep8,
} from "@/components/help/tutorial-steps/HeadingsSteps";
import {
  DefaultsStep1, DefaultsStep2, DefaultsStep3, DefaultsStep4, DefaultsStep5, DefaultsStep6,
} from "@/components/help/tutorial-steps/DefaultsSteps";
import {
  SuppliersStep1, SuppliersStep2, SuppliersStep3, SuppliersStep4, SuppliersStep5, SuppliersStep6, SuppliersStep7,
} from "@/components/help/tutorial-steps/SuppliersSteps";
import {
  PersonalStep1, PersonalStep2, PersonalStep3, PersonalStep4, PersonalStep5, PersonalStep6, PersonalStep7, PersonalStep8, PersonalStep9, PersonalStep10,
} from "@/components/help/tutorial-steps/PersonalSteps";
import {
  BusinessStep1, BusinessStep2, BusinessStep3, BusinessStep4, BusinessStep5, BusinessStep6, BusinessStep7, BusinessStep8, BusinessStep9, BusinessStep10, BusinessStep11, BusinessStep12, BusinessStep13, BusinessStep14, BusinessStep15, BusinessStep16,
} from "@/components/help/tutorial-steps/BusinessSteps";
import {
  UnitsStep1, UnitsStep2, UnitsStep3, UnitsStep4, UnitsStep5, UnitsStep6,
} from "@/components/help/tutorial-steps/UnitsSteps";
import {
  PricingStep1, PricingStep2, PricingStep3, PricingStep4, PricingStep5, PricingStep6, PricingStep7, PricingStep8, PricingStep9, PricingStep10, PricingStep11, PricingStep12,
} from "@/components/help/tutorial-steps/PricingSteps";
import {
  ProductsStep1, ProductsStep2, ProductsStep3, ProductsStep4, ProductsStep5, ProductsStep6, ProductsStep7, ProductsStep8, ProductsStep9, ProductsStep10, ProductsStep11, ProductsStep12,
} from "@/components/help/tutorial-steps/ProductsSteps";
import {
  TeamStep1, TeamStep2, TeamStep3, TeamStep4, TeamStep5, TeamStep6, TeamStep7, TeamStep8, TeamStep9, TeamStep10,
} from "@/components/help/tutorial-steps/TeamSteps";
import {
  DocumentsStep1, DocumentsStep2, DocumentsStep3, DocumentsStep4, DocumentsStep5, DocumentsStep6, DocumentsStep7, DocumentsStep8,
} from "@/components/help/tutorial-steps/DocumentsSteps";
import {
  SystemStep1, SystemStep2, SystemStep3, SystemStep4, SystemStep5, SystemStep6, SystemStep7, SystemStep8, SystemStep9, SystemStep10, SystemStep11, SystemStep12, SystemStep13, SystemStep14,
} from "@/components/help/tutorial-steps/SystemSteps";
import {
  CommunicationsStep1, CommunicationsStep2, CommunicationsStep3, CommunicationsStep4, CommunicationsStep5, CommunicationsStep6, CommunicationsStep7, CommunicationsStep8, CommunicationsStep9, CommunicationsStep10,
} from "@/components/help/tutorial-steps/CommunicationsSteps";
import {
  NotificationsStep1, NotificationsStep2, NotificationsStep3, NotificationsStep4, NotificationsStep5, NotificationsStep6, NotificationsStep7, NotificationsStep8,
} from "@/components/help/tutorial-steps/NotificationsSteps";
import {
  IntegrationsStep1, IntegrationsStep2, IntegrationsStep3, IntegrationsStep4, IntegrationsStep5, IntegrationsStep6, IntegrationsStep7, IntegrationsStep8, IntegrationsStep9, IntegrationsStep10, IntegrationsStep11, IntegrationsStep12,
} from "@/components/help/tutorial-steps/IntegrationsSteps";
import {
  ClientsStep1, ClientsStep2, ClientsStep3, ClientsStep4, ClientsStep5, ClientsStep6, ClientsStep7, ClientsStep8, ClientsStep9, ClientsStep10,
} from "@/components/help/tutorial-steps/ClientsSteps";
import {
  ClientDetailStep1, ClientDetailStep2, ClientDetailStep3, ClientDetailStep4, ClientDetailStep5, ClientDetailStep6, ClientDetailStep7, ClientDetailStep8, ClientDetailStep9, ClientDetailStep10, ClientDetailStep11, ClientDetailStep12, ClientDetailStep13, ClientDetailStep14, ClientDetailStep15, ClientDetailStep16, ClientDetailStep17,
} from "@/components/help/tutorial-steps/ClientDetailSteps";
import {
  JobsStep1, JobsStep2, JobsStep3, JobsStep4, JobsStep5, JobsStep6, JobsStep7,
  JobsStep8, JobsStep9, JobsStep10, JobsStep11, JobsStep12, JobsStep13, JobsStep14,
  JobsStep15, JobsStep16, JobsStep17, JobsStep18, JobsStep19, JobsStep20,
  JobsStep21, JobsStep22, JobsStep23, JobsStep24, JobsStep25, JobsStep26,
  JobsStep27, JobsStep28, JobsStep29, JobsStep30, JobsStep31, JobsStep32,
  JobsStep33, JobsStep34, JobsStep35, JobsStep36, JobsStep37,
} from "@/components/help/tutorial-steps/JobsSteps";
import {
  MessagesStep1, MessagesStep2, MessagesStep3, MessagesStep4, MessagesStep5,
  MessagesStep6, MessagesStep7, MessagesStep8, MessagesStep9, MessagesStep10,
  MessagesStep11, MessagesStep12, MessagesStep13, MessagesStep14, MessagesStep15,
  MessagesStep16, MessagesStep17, MessagesStep18, MessagesStep19, MessagesStep20,
} from "@/components/help/tutorial-steps/MessagesSteps";

export interface TutorialStep {
  title: string;
  actionLabel: string;
  description: string;
  Visual: ComponentType<{ phase?: number }>;
  relatedSection?: string;
  prerequisiteNote?: string;
  duration?: number; // Custom duration per step in ms
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
// OPTIONS TUTORIAL - COMPREHENSIVE (20 Steps)
// Covers: Overview, Creating, Inventory Sync, Pricing, Rules
// ===========================================
export const optionsTutorial: Tutorial = {
  id: "products-options",
  steps: [
    // SECTION 1: OPTIONS OVERVIEW (Steps 1-3)
    {
      title: "Navigate to the Options tab",
      actionLabel: "Click Tab",
      description: "Access Settings → Products → Options to configure add-ons like linings, motors, and controls for each treatment category.",
      Visual: OptionsStep1,
    },
    {
      title: "Understand option types",
      actionLabel: "View Structure",
      description: "The left sidebar shows option types (Control, Lining, Motor). Click a type to see its values on the right.",
      Visual: OptionsStep2,
    },
    {
      title: "View option values and badges",
      actionLabel: "Review",
      description: "Each value shows pricing, method (Fixed, Per m²), and inventory link status. Linked options track stock automatically.",
      Visual: OptionsStep3,
    },
    // SECTION 2: CREATING OPTIONS MANUALLY (Steps 4-7)
    {
      title: "Click Add Option Type",
      actionLabel: "Click Button",
      description: "Start by clicking 'Add Option Type' to create a new configurable option for your products.",
      Visual: OptionsStep4,
    },
    {
      title: "Enter option name and key",
      actionLabel: "Type Name",
      description: "Give your option a descriptive label. The system auto-generates a key used for conditional rules.",
      Visual: OptionsStep5,
    },
    {
      title: "Add option values with prices",
      actionLabel: "Add Values",
      description: "Click 'Add Value' to create choices. Each value can have its own price and can be reordered via drag-and-drop.",
      Visual: OptionsStep6,
    },
    {
      title: "Configure pricing method",
      actionLabel: "Select Method",
      description: "Choose how price is calculated: Fixed, Per Linear Meter, Per Square Meter, Per Panel, or Grid-Based for complex pricing.",
      Visual: OptionsStep7,
    },
    // SECTION 3: SYNC FROM INVENTORY LIBRARY (Steps 8-11)
    {
      title: "Open inventory sync dialog",
      actionLabel: "Sync",
      description: "Click 'Sync from Library' to import options directly from your inventory - this is the game changer that saves hours!",
      Visual: OptionsStep8,
      relatedSection: "inventory",
      prerequisiteNote: "Add items to inventory first",
    },
    {
      title: "Select inventory category",
      actionLabel: "Choose Category",
      description: "Pick a category (Linings, Fabrics, Motors, Hardware) to browse available inventory items for import.",
      Visual: OptionsStep9,
    },
    {
      title: "Choose pricing mode",
      actionLabel: "Set Pricing",
      description: "Decide how prices are imported: Use Selling Price, Cost Price, or Cost + Markup %. Prices stay linked for auto-updates.",
      Visual: OptionsStep10,
    },
    {
      title: "Confirm bulk import",
      actionLabel: "Import",
      description: "Review selected items and click Import. Bulk importing entire catalogs saves hours of manual data entry!",
      Visual: OptionsStep11,
    },
    // SECTION 4: PRICING CONFIGURATION (Steps 12-14)
    {
      title: "Set up grid-based pricing",
      actionLabel: "Upload Grid",
      description: "For complex pricing, upload a CSV with width × drop matrix. The system looks up exact prices based on dimensions.",
      Visual: OptionsStep12,
    },
    {
      title: "Understand pricing hierarchy",
      actionLabel: "Learn",
      description: "Prices resolve in order: Grid → Category Markup → Default. First match wins. This gives you flexible price control.",
      Visual: OptionsStep13,
    },
    {
      title: "Test pricing calculation",
      actionLabel: "Preview",
      description: "Enter sample dimensions to preview the calculated price. Verify your grid and formulas are working correctly.",
      Visual: OptionsStep14,
    },
    // SECTION 5: CONDITIONAL RULES - THE GAME CHANGER (Steps 15-20)
    {
      title: "Navigate to Rules tab",
      actionLabel: "Open Rules",
      description: "Access the Rules tab in any template to create conditional logic. Rules automate option visibility - zero extra clicks!",
      Visual: OptionsStep15,
      relatedSection: "products-templates",
    },
    {
      title: "Understand rule actions",
      actionLabel: "Learn Actions",
      description: "Five powerful actions: Show Option, Hide Option, Require Option, Set Default, and Filter Values. Master these to automate everything.",
      Visual: OptionsStep16,
    },
    {
      title: "Create WHEN condition",
      actionLabel: "Set Condition",
      description: "Define when the rule triggers: WHEN [Source Option] [equals/contains/in_list] [Value]. This is your trigger condition.",
      Visual: OptionsStep17,
    },
    {
      title: "Define THEN effect",
      actionLabel: "Set Effect",
      description: "Define what happens: THEN [Show/Hide/Require/Set Default/Filter] [Target Option]. The rule summary shows readable output.",
      Visual: OptionsStep18,
    },
    {
      title: "Use quick templates",
      actionLabel: "Apply Template",
      description: "Start with pre-built rule patterns that cover 80% of common cases. Motorised→Remote, Width>3m→Support, and more.",
      Visual: OptionsStep19,
    },
    {
      title: "See rules in action!",
      actionLabel: "Test",
      description: "Rules run automatically during quote creation. Select 'Motorised' and watch 'Remote Control Type' appear instantly - no training needed!",
      Visual: OptionsStep20,
      relatedSection: "products-templates",
      prerequisiteNote: "Rules apply automatically in quotes",
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
// PRODUCTS OVERVIEW TUTORIAL (12 Steps)
// ===========================================
export const productsTutorial: Tutorial = {
  id: "products",
  steps: [
    { title: "Navigate the 5 sub-tabs", actionLabel: "View Tabs", description: "Products has 5 tabs: My Templates, Suppliers, Headings, Options, and Defaults. Each manages a different aspect of your product configuration.", Visual: ProductsStep1 },
    { title: "Browse your templates", actionLabel: "Search", description: "View all your product templates. Use search and filters to find specific templates quickly.", Visual: ProductsStep2 },
    { title: "Create a new template", actionLabel: "Create", description: "Click 'Add Template' to create a new product configuration from scratch.", Visual: ProductsStep3 },
    { title: "Clone from supplier library", actionLabel: "Clone", description: "Quickly start by cloning a supplier product. All settings and pricing are pre-configured.", Visual: ProductsStep4, relatedSection: "products-suppliers" },
    { title: "Browse supplier catalogs", actionLabel: "Browse", description: "Access supplier product catalogs. Requires TWC integration to be enabled.", Visual: ProductsStep5, relatedSection: "integrations", prerequisiteNote: "Enable TWC in Settings → Integrations" },
    { title: "Import supplier products", actionLabel: "Import", description: "Select and import products from supplier catalogs to your account.", Visual: ProductsStep6 },
    { title: "Manage heading inventory", actionLabel: "View", description: "View and manage your heading styles with stock levels and reorder points.", Visual: ProductsStep7, relatedSection: "products-headings" },
    { title: "Add a new heading", actionLabel: "Add", description: "Create new heading styles with name, fullness ratio, and inventory settings.", Visual: ProductsStep8 },
    { title: "Configure treatment options", actionLabel: "Configure", description: "Organize options by category: Linings, Motors, Controls, and more.", Visual: ProductsStep9, relatedSection: "products-options" },
    { title: "Add an option", actionLabel: "Add", description: "Create new options with name, category, and pricing.", Visual: ProductsStep10 },
    { title: "Set manufacturing defaults", actionLabel: "Configure", description: "Define global manufacturing settings like hem allowances and waste percentage.", Visual: ProductsStep11, relatedSection: "products-defaults" },
    { title: "Automation settings", actionLabel: "Toggle", description: "Control auto-calculation, rounding, and other automation preferences.", Visual: ProductsStep12 },
  ],
};

// ===========================================
// TEAM TUTORIAL (10 Steps)
// ===========================================
export const teamTutorial: Tutorial = {
  id: "team",
  steps: [
    { title: "Team Management overview", actionLabel: "View", description: "See your team at a glance: active members, pending invitations, and seat limits.", Visual: TeamStep1 },
    { title: "View your subscription", actionLabel: "Check Plan", description: "See your current plan, seats used, and monthly cost.", Visual: TeamStep2 },
    { title: "Manage billing", actionLabel: "Open Portal", description: "Access Stripe billing portal to update payment method or change plan.", Visual: TeamStep3 },
    { title: "Invite a new member", actionLabel: "Invite", description: "Click 'Invite Member' to add someone to your team.", Visual: TeamStep4 },
    { title: "Set member details", actionLabel: "Fill Form", description: "Enter email, name, and select a role for the new team member.", Visual: TeamStep5 },
    { title: "Configure permissions", actionLabel: "Set Access", description: "Customize what the team member can view and edit based on their role.", Visual: TeamStep6 },
    { title: "Review billing impact", actionLabel: "Confirm", description: "See how adding a new seat affects your monthly billing before confirming.", Visual: TeamStep7 },
    { title: "View pending invitations", actionLabel: "Review", description: "See who hasn't accepted their invitation yet. Resend or cancel as needed.", Visual: TeamStep8 },
    { title: "Edit existing members", actionLabel: "Edit", description: "Click a team member to change their role, permissions, or remove them.", Visual: TeamStep9 },
    { title: "Search and filter", actionLabel: "Search", description: "Quickly find team members by name, email, or filter by role/status.", Visual: TeamStep10 },
  ],
};

// ===========================================
// DOCUMENTS TUTORIAL (8 Steps)
// ===========================================
export const documentsTutorial: Tutorial = {
  id: "documents",
  steps: [
    { title: "Document template types", actionLabel: "View Types", description: "Choose from Quote, Invoice, Estimate, Proposal, Work Order, and Receipt templates.", Visual: DocumentsStep1 },
    { title: "Browse your templates", actionLabel: "Browse", description: "View all templates with primary indicator, active status, and drag to reorder.", Visual: DocumentsStep2 },
    { title: "Set primary template", actionLabel: "Star", description: "Click the star to make a template the default for that document type.", Visual: DocumentsStep3 },
    { title: "Create new template", actionLabel: "Create", description: "Start from scratch or copy an existing template to create a new one.", Visual: DocumentsStep4 },
    { title: "Edit template blocks", actionLabel: "Edit", description: "Use the block-based editor to drag and drop content sections.", Visual: DocumentsStep5 },
    { title: "Available block types", actionLabel: "Add Blocks", description: "Add Header, Client Info, Line Items, Totals, Signature, and Payment blocks.", Visual: DocumentsStep6 },
    { title: "Preview with sample data", actionLabel: "Preview", description: "See how your template looks with realistic sample data.", Visual: DocumentsStep7 },
    { title: "Duplicate or delete", actionLabel: "Actions", description: "Use the menu to duplicate templates or delete ones you no longer need.", Visual: DocumentsStep8 },
  ],
};

// ===========================================
// SYSTEM SETTINGS TUTORIAL (14 Steps)
// ===========================================
export const systemTutorial: Tutorial = {
  id: "system",
  steps: [
    { title: "System Settings sections", actionLabel: "Overview", description: "Configure features, numbers, inventory, statuses, appearance, and more.", Visual: SystemStep1 },
    { title: "Enable/disable features", actionLabel: "Toggle", description: "Turn features on or off for your account with feature flags.", Visual: SystemStep2 },
    { title: "Configure number sequences", actionLabel: "Set Numbers", description: "Set prefixes and starting numbers for quotes and jobs.", Visual: SystemStep3 },
    { title: "Reset counters", actionLabel: "Reset", description: "Start number sequences from a specific value if needed.", Visual: SystemStep4 },
    { title: "Inventory deduction settings", actionLabel: "Configure", description: "Choose when inventory is deducted: on quote, job creation, or installation.", Visual: SystemStep5 },
    { title: "Manage custom statuses", actionLabel: "Edit", description: "Create and customize job status labels and colors.", Visual: SystemStep6 },
    { title: "Select theme", actionLabel: "Choose", description: "Switch between Light, Dark, or System theme.", Visual: SystemStep7 },
    { title: "Accent color", actionLabel: "Pick Color", description: "Choose an accent color to brand your interface.", Visual: SystemStep8 },
    { title: "Compact mode", actionLabel: "Toggle", description: "Enable compact mode for a denser UI with less padding.", Visual: SystemStep9 },
    { title: "Configure email templates", actionLabel: "Edit", description: "Customize system email templates for various triggers.", Visual: SystemStep10 },
    { title: "Notification channels", actionLabel: "Configure", description: "Enable or disable email, SMS, desktop notifications, and digests.", Visual: SystemStep11 },
    { title: "Terms & Conditions", actionLabel: "Edit", description: "Add your business terms and conditions for quotes and invoices.", Visual: SystemStep12 },
    { title: "Privacy Policy", actionLabel: "Edit", description: "Manage your privacy policy text and export as PDF.", Visual: SystemStep13 },
    { title: "Maintenance tools", actionLabel: "Access", description: "Backup database, export data, and run security audits.", Visual: SystemStep14 },
  ],
};

// ===========================================
// COMMUNICATIONS TUTORIAL (10 Steps)
// ===========================================
export const communicationsTutorial: Tutorial = {
  id: "communications",
  steps: [
    { title: "Communication channels status", actionLabel: "View", description: "See which channels are active: Email (included), SMS, and WhatsApp (optional).", Visual: CommunicationsStep1 },
    { title: "Navigate 3 tabs", actionLabel: "Switch Tabs", description: "Access Email, SMS, and WhatsApp configuration tabs.", Visual: CommunicationsStep2 },
    { title: "Shared vs Custom email", actionLabel: "Choose", description: "Use shared email (included) or configure custom domain with SendGrid.", Visual: CommunicationsStep3, relatedSection: "integrations" },
    { title: "Configure sender details", actionLabel: "Edit", description: "Set your From Address, From Name, and Reply-To email.", Visual: CommunicationsStep4 },
    { title: "Email signature", actionLabel: "Edit", description: "Create a professional email signature for all outgoing messages.", Visual: CommunicationsStep5 },
    { title: "Connect Twilio for SMS", actionLabel: "Connect", description: "Enter your Twilio Account SID, Auth Token, and phone number.", Visual: CommunicationsStep6, prerequisiteNote: "Create Twilio account at twilio.com" },
    { title: "SMS status indicator", actionLabel: "Verify", description: "Check connection status and send test SMS messages.", Visual: CommunicationsStep7 },
    { title: "Connect WhatsApp via Twilio", actionLabel: "Setup", description: "Follow the wizard to connect WhatsApp Business through Twilio.", Visual: CommunicationsStep8 },
    { title: "Verify WhatsApp connection", actionLabel: "Verify", description: "Confirm your WhatsApp Business account is verified and active.", Visual: CommunicationsStep9 },
    { title: "Manage message templates", actionLabel: "Edit", description: "Create and manage WhatsApp message templates (requires approval).", Visual: CommunicationsStep10 },
  ],
};

// ===========================================
// NOTIFICATIONS TUTORIAL (8 Steps)
// ===========================================
export const notificationsTutorial: Tutorial = {
  id: "notifications",
  steps: [
    { title: "Notification capabilities", actionLabel: "Overview", description: "Manage templates, broadcasts (Pro), and automation settings.", Visual: NotificationsStep1 },
    { title: "Premium features", actionLabel: "Upgrade", description: "Broadcast messaging requires Professional or Enterprise plan.", Visual: NotificationsStep2 },
    { title: "Test notification delivery", actionLabel: "Test", description: "Send test notifications to verify email and SMS are working.", Visual: NotificationsStep3 },
    { title: "Browse message templates", actionLabel: "Browse", description: "View all notification templates organized by trigger event.", Visual: NotificationsStep4 },
    { title: "Edit a template", actionLabel: "Edit", description: "Customize subject line and message body for each notification.", Visual: NotificationsStep5 },
    { title: "Available variables", actionLabel: "Reference", description: "Use variables like {{client_name}} and {{quote_total}} in templates.", Visual: NotificationsStep6 },
    { title: "Send broadcast (Pro)", actionLabel: "Compose", description: "Send bulk messages to multiple clients at once.", Visual: NotificationsStep7, prerequisiteNote: "Requires Pro or Enterprise plan" },
    { title: "Schedule broadcasts", actionLabel: "Schedule", description: "Set a future date and time for broadcast delivery.", Visual: NotificationsStep8 },
  ],
};

// ===========================================
// INTEGRATIONS TUTORIAL (12 Steps)
// ===========================================
export const integrationsTutorial: Tutorial = {
  id: "integrations",
  steps: [
    { title: "Integration categories", actionLabel: "View", description: "See connected integrations and available options at a glance.", Visual: IntegrationsStep1 },
    { title: "Navigate integration tabs", actionLabel: "Browse", description: "Access 10 integration categories: Email, Calendar, PIM, ERP, and more.", Visual: IntegrationsStep2 },
    { title: "Configure SendGrid", actionLabel: "Setup", description: "Connect SendGrid for custom domain email sending.", Visual: IntegrationsStep3 },
    { title: "Connect Google Calendar", actionLabel: "Connect", description: "Sync appointments with Google Calendar using OAuth.", Visual: IntegrationsStep4 },
    { title: "Connect TIG PIM", actionLabel: "Configure", description: "Integrate with TIG Product Information Management.", Visual: IntegrationsStep5 },
    { title: "Connect MYOB Exo", actionLabel: "Setup", description: "Follow the wizard to connect MYOB accounting software.", Visual: IntegrationsStep6 },
    { title: "Connect RFMS", actionLabel: "Connect", description: "Integrate with RFMS furnishing software for orders.", Visual: IntegrationsStep7 },
    { title: "Automation (coming soon)", actionLabel: "Preview", description: "Zapier, Make, and n8n integration coming soon.", Visual: IntegrationsStep8 },
    { title: "Connect Stripe", actionLabel: "Configure", description: "Set up Stripe for payment processing.", Visual: IntegrationsStep9 },
    { title: "Website API settings", actionLabel: "Configure", description: "Generate API keys and configure webhooks for your website.", Visual: IntegrationsStep10 },
    { title: "Connect TWC", actionLabel: "Connect", description: "Access supplier catalogs from The Window Covering.", Visual: IntegrationsStep11 },
    { title: "Connect Shopify (gated)", actionLabel: "Request", description: "Shopify integration requires admin permission.", Visual: IntegrationsStep12, prerequisiteNote: "Contact admin for permission" },
  ],
};

// ===========================================
// CLIENTS TUTORIAL (10 Streamlined Steps)
// ===========================================
export const clientsTutorial: Tutorial = {
  id: "clients",
  steps: [
    { title: "Your Client Hub", actionLabel: "Overview", description: "See all clients with stats, search, and quick actions at a glance.", Visual: ClientsStep1, duration: 4000 },
    { title: "Find Anyone Instantly", actionLabel: "Search", description: "Type to search and apply filters - find any client in seconds.", Visual: ClientsStep2, duration: 5000 },
    { title: "Add New Clients", actionLabel: "Create", description: "One click to add clients with AI-powered lead intelligence.", Visual: ClientsStep3, duration: 5000 },
    { title: "Power Select", actionLabel: "Select", description: "Rapidly select multiple clients for bulk operations.", Visual: ClientsStep4, duration: 5000 },
    { title: "Bulk Actions Unleashed", actionLabel: "Actions", description: "Email campaigns, export data, or remove - all in one bar.", Visual: ClientsStep5, duration: 5000 },
    { title: "Open Client Details", actionLabel: "Click", description: "Click any row to open the full client profile drawer.", Visual: ClientsStep6, duration: 5000 },
    { title: "Quick Communication", actionLabel: "Actions", description: "Email, call, WhatsApp, log activity - one click away.", Visual: ClientsStep7, duration: 5000 },
    { title: "Pipeline Management", actionLabel: "Stage", description: "Move clients through your sales pipeline with a click.", Visual: ClientsStep8, duration: 5000 },
    { title: "Full Profile Access", actionLabel: "Tabs", description: "Switch between Activity, Emails, Files, and Projects.", Visual: ClientsStep9, duration: 5000 },
    { title: "Start a Project", actionLabel: "Create", description: "Launch new projects directly from client profiles.", Visual: ClientsStep10, duration: 5000 },
  ],
};

// ===========================================
// CLIENT DETAIL TUTORIAL (17 Steps)
// ===========================================
export const clientDetailTutorial: Tutorial = {
  id: "clients-detail",
  steps: [
    { title: "Click to open a client", actionLabel: "Click", description: "Click any row in the clients table to open the detail drawer.", Visual: ClientDetailStep1 },
    { title: "Client drawer opens", actionLabel: "View", description: "The drawer slides in from the right with full client details.", Visual: ClientDetailStep2 },
    { title: "Client header overview", actionLabel: "Header", description: "See the client's name, avatar, role, and current pipeline stage.", Visual: ClientDetailStep3 },
    { title: "Change pipeline stage", actionLabel: "Stage", description: "Click the stage badge to move the client through your sales pipeline.", Visual: ClientDetailStep4 },
    { title: "Quick actions bar", actionLabel: "Actions", description: "Use WhatsApp, Call, Email, and Log Activity buttons for fast communication.", Visual: ClientDetailStep5 },
    { title: "New project and edit", actionLabel: "Create", description: "Start a new project or edit the client profile from the action buttons.", Visual: ClientDetailStep6 },
    { title: "View contact details", actionLabel: "Details", description: "See email, phone, and address in the Details tab.", Visual: ClientDetailStep7 },
    { title: "Inline editing", actionLabel: "Edit", description: "Hover over any field and click the edit icon to modify it inline.", Visual: ClientDetailStep8 },
    { title: "Save or cancel changes", actionLabel: "Save", description: "Click the check to save or X to cancel your changes.", Visual: ClientDetailStep9 },
    { title: "Manage notes", actionLabel: "Notes", description: "Add and edit notes to track important client information.", Visual: ClientDetailStep10 },
    { title: "Navigate tabs", actionLabel: "Tabs", description: "Switch between Activity, Details, Emails, and Files tabs.", Visual: ClientDetailStep11 },
    { title: "Activity timeline", actionLabel: "Activity", description: "View all client interactions including calls, emails, and meetings.", Visual: ClientDetailStep12 },
    { title: "Email history", actionLabel: "Emails", description: "See all emails sent to and received from this client.", Visual: ClientDetailStep13 },
    { title: "Client files", actionLabel: "Files", description: "Upload and manage documents, images, and other files.", Visual: ClientDetailStep14 },
    { title: "View projects", actionLabel: "Projects", description: "See all projects associated with this client.", Visual: ClientDetailStep15 },
    { title: "Project details", actionLabel: "View", description: "Each project shows status, value, and quick actions.", Visual: ClientDetailStep16 },
    { title: "Create new project", actionLabel: "Create", description: "Click to start a new quote or project for this client.", Visual: ClientDetailStep17 },
  ],
};

// ===========================================
// JOBS TUTORIAL (8 Steps)
// ===========================================
export const jobsTutorial: Tutorial = {
  id: "jobs",
  steps: [
    // Part 1: Dashboard & Navigation
    { title: "Your Jobs Hub", actionLabel: "Overview", description: "See all jobs with status, client info, and totals at a glance.", Visual: JobsStep1, duration: 4000 },
    { title: "Search & Filter", actionLabel: "Search", description: "Find any job instantly by name, client, or status.", Visual: JobsStep2, duration: 4000 },
    { title: "Quick Actions", actionLabel: "Actions", description: "View, edit, duplicate, or archive from the actions menu.", Visual: JobsStep3, duration: 4000 },
    // Part 2: Job Creation
    { title: "Create New Job", actionLabel: "New", description: "Click 'New' to start creating a job for any client.", Visual: JobsStep4, duration: 4000 },
    { title: "Select Client", actionLabel: "Client", description: "Search and select the client for this job.", Visual: JobsStep5, duration: 4000 },
    { title: "Project Details", actionLabel: "Details", description: "Name your project and add optional description.", Visual: JobsStep6, duration: 4000 },
    { title: "Job Created!", actionLabel: "Success", description: "Your job is ready - now add rooms and windows.", Visual: JobsStep7, duration: 4000 },
    // Part 3: Room Management
    { title: "Job Detail View", actionLabel: "Tabs", description: "Navigate between Rooms, Quote, Work Order, and Workroom.", Visual: JobsStep8, duration: 4000 },
    { title: "Add Rooms", actionLabel: "Add", description: "Add rooms to organize windows by location.", Visual: JobsStep9, duration: 4000 },
    { title: "Room Templates", actionLabel: "Template", description: "Choose from preset templates or create custom rooms.", Visual: JobsStep10, duration: 4000 },
    { title: "Copy & Paste", actionLabel: "Copy", description: "Duplicate rooms to save time on similar spaces.", Visual: JobsStep11, duration: 4000 },
    // Part 4: Windows & Surfaces
    { title: "Add Windows", actionLabel: "Window", description: "Add windows or surfaces to each room.", Visual: JobsStep12, duration: 4000 },
    { title: "Window Types", actionLabel: "Type", description: "Select from Standard, Bay, French Door, and more.", Visual: JobsStep13, duration: 4000 },
    { title: "Surface Details", actionLabel: "Details", description: "View dimensions, treatment, and mount type.", Visual: JobsStep14, duration: 4000 },
    // Part 5: Treatment Selection
    { title: "Select Treatment", actionLabel: "Treatment", description: "Choose from curtains, blinds, shutters, and more.", Visual: JobsStep15, duration: 4000 },
    { title: "Treatment Categories", actionLabel: "Category", description: "Browse treatments organized by type.", Visual: JobsStep16, duration: 4000 },
    { title: "Treatment Applied", actionLabel: "Applied", description: "Treatment is now assigned to the window.", Visual: JobsStep17, duration: 4000 },
    // Part 6: Measurements
    { title: "Open Worksheet", actionLabel: "Measure", description: "Click a window to open the measurement worksheet.", Visual: JobsStep18, duration: 4000 },
    { title: "Enter Measurements", actionLabel: "Dims", description: "Enter width and drop with visual diagram guide.", Visual: JobsStep19, duration: 4000 },
    { title: "Measurement Options", actionLabel: "Options", description: "Configure hem, returns, stack position, and mount.", Visual: JobsStep20, duration: 4000 },
    // Part 7: Fabric & Materials
    { title: "Select Fabric", actionLabel: "Fabric", description: "Browse and search from your fabric library.", Visual: JobsStep21, duration: 4000 },
    { title: "Fabric Details", actionLabel: "Details", description: "View price, width, composition, and stock status.", Visual: JobsStep22, duration: 4000 },
    { title: "Hardware Options", actionLabel: "Hardware", description: "Choose heading type, track/rod, and lining.", Visual: JobsStep23, duration: 4000 },
    // Part 8: Quotation
    { title: "Quote Preview", actionLabel: "Quote", description: "Review line items with room-by-room breakdown.", Visual: JobsStep24, duration: 4000 },
    { title: "Add Discount", actionLabel: "Discount", description: "Apply percentage or fixed discounts easily.", Visual: JobsStep25, duration: 4000 },
    { title: "Payment Settings", actionLabel: "Payment", description: "Set deposit percentage and payment terms.", Visual: JobsStep26, duration: 4000 },
    { title: "PDF & Actions", actionLabel: "Export", description: "Download PDF, print, email, or share link.", Visual: JobsStep27, duration: 4000 },
    { title: "Email Quote", actionLabel: "Email", description: "Send quote directly to client with message.", Visual: JobsStep28, duration: 4000 },
    // Part 9: Payments & Export
    { title: "Record Payment", actionLabel: "Record", description: "Log payments with amount and method.", Visual: JobsStep29, duration: 4000 },
    { title: "Export Invoice", actionLabel: "Export", description: "Export to Xero, QuickBooks, MYOB, or CSV.", Visual: JobsStep30, duration: 4000 },
    { title: "Payment Complete", actionLabel: "Paid", description: "Invoice marked as paid with celebration!", Visual: JobsStep31, duration: 4000 },
    // Part 10: Work Orders & Sharing
    { title: "Work Order", actionLabel: "Order", description: "View detailed manufacturing specifications.", Visual: JobsStep32, duration: 4000 },
    { title: "Filter Items", actionLabel: "Filter", description: "Filter by treatment type for focused views.", Visual: JobsStep33, duration: 4000 },
    { title: "Share with Workroom", actionLabel: "Share", description: "Create secure links for external workrooms.", Visual: JobsStep34, duration: 4000 },
    { title: "Installation", actionLabel: "Install", description: "Track installation progress with checklist.", Visual: JobsStep35, duration: 4000 },
    // Part 11: Completion
    { title: "Job Pipeline", actionLabel: "Status", description: "Move through Draft → Sent → Approved → Complete.", Visual: JobsStep36, duration: 4000 },
    { title: "Job Complete!", actionLabel: "Done", description: "Celebrate completed jobs with your earnings!", Visual: JobsStep37, duration: 5000 },
  ],
};

// ===========================================
// MESSAGES TUTORIAL - 20 Steps
// ===========================================
export const messagesTutorial: Tutorial = {
  id: "messages",
  steps: [
    { title: "Welcome to Messages Hub", actionLabel: "View", description: "Your central hub for emails, campaigns, templates, and analytics.", Visual: MessagesStep1 },
    { title: "Navigate with Tabs", actionLabel: "Click", description: "Switch between Inbox, Campaigns, Templates, and Analytics views.", Visual: MessagesStep2 },
    { title: "Quick Compose Button", actionLabel: "Click", description: "Start a new email anytime with the floating Compose button.", Visual: MessagesStep3 },
    { title: "Split-Pane Inbox", actionLabel: "View", description: "Gmail-style layout: message list on left, details on right.", Visual: MessagesStep4 },
    { title: "Filter by Channel", actionLabel: "Filter", description: "Quickly filter by Email or WhatsApp messages.", Visual: MessagesStep5 },
    { title: "View Tracking Stats", actionLabel: "View", description: "See delivery status, open counts, and click tracking.", Visual: MessagesStep6 },
    { title: "Email Actions Menu", actionLabel: "Click", description: "Reply, Forward, Archive, or Delete with one click.", Visual: MessagesStep7 },
    { title: "Campaigns Dashboard", actionLabel: "View", description: "Manage bulk email campaigns with status tracking.", Visual: MessagesStep8 },
    { title: "Quick Start Templates", actionLabel: "Select", description: "Jump-start campaigns with pre-built templates.", Visual: MessagesStep9 },
    { title: "Campaign Wizard", actionLabel: "Create", description: "Step-by-step campaign creation with preview.", Visual: MessagesStep10 },
    { title: "Filter Campaigns", actionLabel: "Filter", description: "View drafts, scheduled, or sent campaigns.", Visual: MessagesStep11 },
    { title: "Template Library", actionLabel: "Browse", description: "Reusable email templates organized by category.", Visual: MessagesStep12 },
    { title: "AI-Powered Templates", actionLabel: "Generate", description: "Smart templates that personalize automatically.", Visual: MessagesStep13 },
    { title: "Use or Duplicate", actionLabel: "Action", description: "Apply templates directly or duplicate to customize.", Visual: MessagesStep14 },
    { title: "Analytics Dashboard", actionLabel: "View", description: "Track sent, delivered, opened, and clicked metrics.", Visual: MessagesStep15 },
    { title: "Activity Charts", actionLabel: "Analyze", description: "Visualize email performance over time.", Visual: MessagesStep16 },
    { title: "Compare Campaigns", actionLabel: "Compare", description: "Side-by-side campaign performance comparison.", Visual: MessagesStep17 },
    { title: "Personalization Tokens", actionLabel: "Insert", description: "Use {{client_name}} and other tokens for personalization.", Visual: MessagesStep18 },
    { title: "AI Writing Assistant", actionLabel: "Generate", description: "Let AI draft your email content.", Visual: MessagesStep19 },
    { title: "Spam Check", actionLabel: "Verify", description: "Pre-send deliverability check to avoid spam folders.", Visual: MessagesStep20 },
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
  "products": productsTutorial,
  "team": teamTutorial,
  "documents": documentsTutorial,
  "system": systemTutorial,
  "communications": communicationsTutorial,
  "notifications": notificationsTutorial,
  "integrations": integrationsTutorial,
  // Client pages
  "clients": clientsTutorial,
  "clients-detail": clientDetailTutorial,
  // Jobs pages
  "jobs": jobsTutorial,
  // Messages pages
  "messages": messagesTutorial,
};
