import { LucideIcon, User, Building2, CreditCard, Ruler, Package, Calculator, Users, FileText, Globe, MessageCircle, Zap, Layers, Truck, Sliders, Settings, UserCircle, FolderOpen } from "lucide-react";

export interface SectionHelpContent {
  id: string;
  title: string;
  icon?: LucideIcon;
  briefDescription: string;
  keyPoints?: string[];
  relatedSections?: string[];
}

export const sectionHelpContent: Record<string, SectionHelpContent> = {
  // ===== MAIN SETTINGS TABS =====
  
  personal: {
    id: "personal",
    title: "Personal Settings",
    icon: User,
    briefDescription: "Manage your personal profile, notification preferences, and account security.",
    keyPoints: [
      "Update your display name, avatar, and contact details",
      "Set your timezone, language, and date format preferences",
      "Configure email and SMS notification settings",
      "Change your email address or password"
    ],
    relatedSections: ["Business", "Communications"]
  },

  billing: {
    id: "billing",
    title: "Billing & Subscription",
    icon: CreditCard,
    briefDescription: "View your subscription plan, manage payment methods, and access invoices.",
    keyPoints: [
      "View your current plan and billing cycle",
      "See active seats and monthly costs",
      "Access and download past invoices",
      "Manage subscription through Stripe portal"
    ],
    relatedSections: ["Team"]
  },

  business: {
    id: "business",
    title: "Business Settings",
    icon: Building2,
    briefDescription: "Configure your company details, branding, and contact information that appear on all documents.",
    keyPoints: [
      "Upload your company logo for quotes and invoices",
      "Set business name, address, and contact details",
      "Configure tax registration (ABN/VAT/GST)",
      "Set up bank details for invoice payment instructions"
    ],
    relatedSections: ["Documents", "Pricing"]
  },

  units: {
    id: "units",
    title: "Measurement Units",
    icon: Ruler,
    briefDescription: "Choose your preferred measurement system and currency for all quotes and calculations.",
    keyPoints: [
      "Select Metric, Imperial, or Mixed measurement system",
      "Configure length, area, and fabric units",
      "Set your default currency",
      "Preview how measurements will display"
    ],
    relatedSections: ["Business", "Products"]
  },

  products: {
    id: "products",
    title: "Products",
    icon: Package,
    briefDescription: "Manage your product templates, options, headings, and manufacturing defaults.",
    keyPoints: [
      "Create and edit product templates",
      "Browse and import from supplier catalogs",
      "Define customizable options (fabrics, colors, controls)",
      "Set manufacturing defaults for calculations"
    ],
    relatedSections: ["Pricing", "Integrations"]
  },

  pricing: {
    id: "pricing",
    title: "Pricing & Tax",
    icon: Calculator,
    briefDescription: "Configure pricing grids, markup percentages, and tax settings for accurate quoting.",
    keyPoints: [
      "Upload and manage pricing grids from suppliers",
      "Set default and category-specific markup percentages",
      "Configure tax type (VAT/GST) and rate",
      "Choose tax-inclusive or exclusive pricing"
    ],
    relatedSections: ["Products", "Business"]
  },

  team: {
    id: "team",
    title: "Team Management",
    icon: Users,
    briefDescription: "Invite team members, assign roles, and control access permissions.",
    keyPoints: [
      "Invite new team members by email",
      "Assign roles: Owner, Admin, Staff, or Installer",
      "Set granular permissions for each user",
      "View subscription seat usage"
    ],
    relatedSections: ["Billing", "Personal"]
  },

  documents: {
    id: "documents",
    title: "Document Templates",
    icon: FileText,
    briefDescription: "Customize the layout and content of your quotes, invoices, and work orders.",
    keyPoints: [
      "Edit quote and invoice templates",
      "Add custom terms and conditions",
      "Configure what information appears on documents",
      "Set up email templates for client communications"
    ],
    relatedSections: ["Business", "Communications"]
  },

  system: {
    id: "system",
    title: "System Settings",
    icon: Globe,
    briefDescription: "Configure app-wide preferences like job numbering, default values, and data management.",
    keyPoints: [
      "Set default quote validity period",
      "Configure automatic numbering formats (jobs, quotes)",
      "Manage backup and export options",
      "Control app-wide behavior settings"
    ],
    relatedSections: ["Business", "Documents"]
  },

  communications: {
    id: "communications",
    title: "Communications",
    icon: MessageCircle,
    briefDescription: "Set up email sending, configure notifications, and manage client communication settings.",
    keyPoints: [
      "Configure email sender settings (SendGrid)",
      "Customize your email signature",
      "Set up automated notifications",
      "Test email and SMS delivery"
    ],
    relatedSections: ["Documents", "Integrations"]
  },

  integrations: {
    id: "integrations",
    title: "Integrations",
    icon: Zap,
    briefDescription: "Connect external services like supplier catalogs, calendars, payments, and accounting software.",
    keyPoints: [
      "Connect supplier product libraries (TWC)",
      "Sync with Google Calendar",
      "Set up Stripe for payments",
      "Connect accounting/ERP systems"
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
    briefDescription: "Manage curtain and blind heading styles with their associated fullness ratios.",
    keyPoints: [
      "Create heading styles (Wave, Pinch Pleat, etc.)",
      "Set fullness ratios for fabric calculations",
      "Add cost prices for manufacturing",
      "Organize with images and descriptions"
    ],
    relatedSections: ["My Templates", "Options"]
  },

  "products-options": {
    id: "products-options",
    title: "Options",
    icon: Sliders,
    briefDescription: "Define customizable product attributes like fabrics, colors, and control types.",
    keyPoints: [
      "Create option types (e.g., Fabric, Color, Control)",
      "Add values to each option type",
      "Set pricing adjustments per value",
      "Options can be shared across multiple templates"
    ],
    relatedSections: ["My Templates", "Pricing", "Defaults"]
  },

  "products-defaults": {
    id: "products-defaults",
    title: "Manufacturing Defaults",
    icon: Settings,
    briefDescription: "Set default values for manufacturing calculations like allowances and waste percentages.",
    keyPoints: [
      "Hem, heading, and side allowances",
      "Pattern repeat calculations",
      "Waste percentage defaults",
      "These defaults apply to new quotes automatically"
    ],
    relatedSections: ["Options", "Headings"]
  },

  // ===== CLIENT PAGES =====

  clients: {
    id: "clients",
    title: "Client Management",
    icon: Users,
    briefDescription: "Manage your clients and leads with bulk actions, email campaigns, and detailed profiles.",
    keyPoints: [
      "View, search, and filter your client list",
      "Select multiple clients for bulk email, export, or delete",
      "Track client stages (Lead, Contacted, Qualified, etc.)",
      "Quick access to contact info and project history"
    ],
    relatedSections: ["Jobs", "Emails"]
  },

  "clients-detail": {
    id: "clients-detail",
    title: "Client Details",
    icon: UserCircle,
    briefDescription: "View and edit individual client profiles, track activity, and manage projects.",
    keyPoints: [
      "Edit contact information inline with one click",
      "Track communication history and log activities",
      "Create new projects directly from client profile",
      "Quick actions: Email, Call, WhatsApp, Log Activity"
    ],
    relatedSections: ["Clients", "Jobs"]
  },

  // ===== JOBS PAGE =====

  jobs: {
    id: "jobs",
    title: "Jobs & Projects",
    icon: FolderOpen,
    briefDescription: "Create and manage window treatment projects from quote to installation.",
    keyPoints: [
      "Create jobs with rooms, windows, and treatments",
      "Add measurements and select fabrics/materials",
      "Generate quotes with discounts and payment terms",
      "Send quotes via PDF or email to clients",
      "Export invoices to Xero, QuickBooks, or other ERP systems",
      "Create work orders and share with workrooms",
      "Track installation progress through completion"
    ],
    relatedSections: ["Clients", "Documents", "Products"]
  }
};
