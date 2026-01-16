import { LucideIcon, User, Building2, CreditCard, Ruler, Package, Calculator, Users, FileText, Globe, MessageCircle, Zap, Layers, Truck, Sliders, Settings } from "lucide-react";
import { DemoStep } from "@/components/help/AnimatedDemoStep";

export interface SectionHelpContent {
  id: string;
  title: string;
  icon?: LucideIcon;
  briefDescription: string;
  keyPoints?: string[];
  demoSteps?: DemoStep[];
  relatedSections?: string[];
}

export const sectionHelpContent: Record<string, SectionHelpContent> = {
  // ===== SETTINGS TABS =====
  
  personal: {
    id: "personal",
    title: "Personal Settings",
    icon: User,
    briefDescription: "Manage your personal profile, notification preferences, and account details.",
    keyPoints: [
      "Update your display name and avatar",
      "Set your timezone and language preferences",
      "Configure how you receive notifications"
    ],
    relatedSections: ["Business", "Notifications"]
  },

  billing: {
    id: "billing",
    title: "Billing",
    icon: CreditCard,
    briefDescription: "View your subscription, manage payment methods, and access invoices.",
    keyPoints: [
      "View current plan and usage",
      "Update payment information",
      "Download past invoices"
    ]
  },

  business: {
    id: "business",
    title: "Business Settings",
    icon: Building2,
    briefDescription: "Configure your company information, logo, and contact details that appear on quotes and documents.",
    keyPoints: [
      "Upload your company logo for quotes and invoices",
      "Set business address and contact information",
      "Configure tax registration details (ABN/VAT)"
    ],
    demoSteps: [
      {
        id: "business-1",
        title: "Enter Company Details",
        description: "Fill in your business name and contact information",
        visual: { type: "form", highlight: "input-1" }
      },
      {
        id: "business-2",
        title: "Upload Logo",
        description: "Add your logo to appear on all documents",
        visual: { type: "action", highlight: "action" },
        cursor: { startX: 20, startY: 20, endX: 100, endY: 80, action: "click" }
      },
      {
        id: "business-3",
        title: "Save Changes",
        description: "Your branding will appear on all quotes",
        visual: { type: "result" }
      }
    ],
    relatedSections: ["Documents", "Pricing"]
  },

  units: {
    id: "units",
    title: "Measurement Units",
    icon: Ruler,
    briefDescription: "Choose between metric and imperial units for measurements in quotes and manufacturing.",
    keyPoints: [
      "Select metric (cm/m) or imperial (inches/feet)",
      "Settings apply to all quotes and calculations",
      "Currency formatting options"
    ]
  },

  pricing: {
    id: "pricing",
    title: "Pricing Settings",
    icon: Calculator,
    briefDescription: "Configure markup percentages, tax rates, and pricing grids that determine your selling prices.",
    keyPoints: [
      "Set default markup percentage for all products",
      "Configure category-specific markups",
      "Define minimum profit margins",
      "Set up tax rates and calculation methods"
    ],
    demoSteps: [
      {
        id: "pricing-1",
        title: "Set Default Markup",
        description: "This applies to all products without specific markups",
        visual: { type: "form", highlight: "input-1" }
      },
      {
        id: "pricing-2",
        title: "Category Markups",
        description: "Different product categories can have different margins",
        visual: { type: "list", highlight: "item-2" }
      },
      {
        id: "pricing-3",
        title: "Review Pricing Grid",
        description: "See how markups affect final prices",
        visual: { type: "grid", highlight: "grid-3" }
      }
    ],
    relatedSections: ["Products", "Business"]
  },

  team: {
    id: "team",
    title: "Team Management",
    icon: Users,
    briefDescription: "Invite team members, assign roles, and control what each person can access.",
    keyPoints: [
      "Invite new team members by email",
      "Assign roles: Admin, Staff, or Installer",
      "Control feature access with granular permissions",
      "Manage client and quote visibility per user"
    ],
    demoSteps: [
      {
        id: "team-1",
        title: "Invite Team Member",
        description: "Send an invitation email to add someone",
        visual: { type: "action", highlight: "action" },
        cursor: { startX: 50, startY: 20, endX: 120, endY: 60, action: "click" }
      },
      {
        id: "team-2",
        title: "Set Permissions",
        description: "Choose what they can view and edit",
        visual: { type: "list", highlight: "item-1" }
      },
      {
        id: "team-3",
        title: "Team Ready",
        description: "They'll receive an email to set up their account",
        visual: { type: "result" }
      }
    ],
    relatedSections: ["Personal", "Integrations"]
  },

  documents: {
    id: "documents",
    title: "Document Templates",
    icon: FileText,
    briefDescription: "Customize the layout, content, and styling of your quotes, invoices, and work orders.",
    keyPoints: [
      "Edit quote and invoice templates",
      "Add custom terms and conditions",
      "Configure what information appears on documents",
      "Set up email templates for client communications"
    ],
    demoSteps: [
      {
        id: "docs-1",
        title: "Select Template",
        description: "Choose which document type to customize",
        visual: { type: "grid", highlight: "grid-1" }
      },
      {
        id: "docs-2",
        title: "Edit Content",
        description: "Modify text, add your branding, adjust layout",
        visual: { type: "form", highlight: "input-2" }
      },
      {
        id: "docs-3",
        title: "Preview & Save",
        description: "See how it looks before applying changes",
        visual: { type: "result" }
      }
    ],
    relatedSections: ["Business", "Communications"]
  },

  system: {
    id: "system",
    title: "System Settings",
    icon: Globe,
    briefDescription: "Configure app-wide preferences, data management, and advanced options.",
    keyPoints: [
      "Set default quote validity period",
      "Configure automatic numbering formats",
      "Manage data export and backup options"
    ],
    relatedSections: ["Business", "Integrations"]
  },

  communications: {
    id: "communications",
    title: "Communications",
    icon: MessageCircle,
    briefDescription: "Set up email sending, configure notification templates, and manage client communication preferences.",
    keyPoints: [
      "Configure email sender settings",
      "Customize email signature",
      "Set up automated notifications",
      "Manage SMS settings (if enabled)"
    ],
    relatedSections: ["Documents", "Integrations"]
  },

  integrations: {
    id: "integrations",
    title: "Integrations",
    icon: Zap,
    briefDescription: "Connect external services like supplier catalogs, accounting software, and calendar sync.",
    keyPoints: [
      "Connect supplier product libraries",
      "Sync with accounting software",
      "Enable calendar integrations",
      "Set up payment gateway connections"
    ],
    demoSteps: [
      {
        id: "int-1",
        title: "Browse Integrations",
        description: "See available connections",
        visual: { type: "grid", highlight: "grid-2" }
      },
      {
        id: "int-2",
        title: "Connect Service",
        description: "Authorize the connection",
        visual: { type: "action", highlight: "action" },
        cursor: { startX: 30, startY: 40, endX: 100, endY: 70, action: "click" }
      },
      {
        id: "int-3",
        title: "Ready to Use",
        description: "Integration is now active",
        visual: { type: "result" }
      }
    ],
    relatedSections: ["Products", "Communications"]
  },

  // ===== PRODUCTS SUB-TABS =====

  "products-templates": {
    id: "products-templates",
    title: "My Templates",
    icon: Layers,
    briefDescription: "Create and manage reusable product templates that speed up quote creation.",
    keyPoints: [
      "Templates are pre-configured product setups",
      "Include default options, pricing, and specifications",
      "Clone from supplier library or create your own",
      "Templates appear in your quote builder for quick selection"
    ],
    demoSteps: [
      {
        id: "tmpl-1",
        title: "Create Template",
        description: "Start from scratch or clone from supplier",
        visual: { type: "action", highlight: "action" },
        cursor: { startX: 20, startY: 30, endX: 80, endY: 50, action: "click" }
      },
      {
        id: "tmpl-2",
        title: "Configure Options",
        description: "Set default values and available choices",
        visual: { type: "form", highlight: "input-2" }
      },
      {
        id: "tmpl-3",
        title: "Set Pricing",
        description: "Define base price and option adjustments",
        visual: { type: "list", highlight: "item-3" }
      },
      {
        id: "tmpl-4",
        title: "Template Ready",
        description: "Use in quotes with one click",
        visual: { type: "result" }
      }
    ],
    relatedSections: ["Suppliers", "Options", "Pricing"]
  },

  "products-suppliers": {
    id: "products-suppliers",
    title: "Suppliers",
    icon: Truck,
    briefDescription: "Browse and import products from connected supplier catalogs.",
    keyPoints: [
      "Requires supplier integration to be enabled",
      "Browse full product libraries from manufacturers",
      "Import products as templates with pricing",
      "Auto-sync for price updates"
    ],
    relatedSections: ["My Templates", "Integrations"]
  },

  "products-headings": {
    id: "products-headings",
    title: "Headings",
    icon: Layers,
    briefDescription: "Organize how product categories appear on quotes and in your product library.",
    keyPoints: [
      "Group products under custom headings",
      "Control display order on quotes",
      "Create sub-categories for better organization"
    ],
    relatedSections: ["My Templates", "Options"]
  },

  "products-options": {
    id: "products-options",
    title: "Options",
    icon: Sliders,
    briefDescription: "Define customizable attributes like fabrics, colors, and control types that apply across products.",
    keyPoints: [
      "Create option types (e.g., Fabric, Color, Control)",
      "Add values to each option type",
      "Set pricing adjustments per value",
      "Options can be shared across multiple templates"
    ],
    demoSteps: [
      {
        id: "opt-1",
        title: "Create Option Type",
        description: "e.g., 'Lining Type' for curtains",
        visual: { type: "action", highlight: "action" }
      },
      {
        id: "opt-2",
        title: "Add Values",
        description: "e.g., 'Unlined', 'Lined', 'Blackout'",
        visual: { type: "list", highlight: "item-2" }
      },
      {
        id: "opt-3",
        title: "Set Pricing",
        description: "Each value can adjust the product price",
        visual: { type: "form", highlight: "input-3" }
      }
    ],
    relatedSections: ["My Templates", "Pricing", "Defaults"]
  },

  "products-defaults": {
    id: "products-defaults",
    title: "Manufacturing Defaults",
    icon: Settings,
    briefDescription: "Set default values for manufacturing calculations like fullness ratios and fabric allowances.",
    keyPoints: [
      "Fullness ratios for different curtain styles",
      "Hem and heading allowances",
      "Pattern repeat calculations",
      "These defaults apply to new quotes automatically"
    ],
    relatedSections: ["Options", "Pricing"]
  }
};
