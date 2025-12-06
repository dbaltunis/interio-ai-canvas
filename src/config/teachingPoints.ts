import { Settings, User, Building2, Ruler, Package, Percent, Users, FileText, Monitor, Bell, Plug, 
  LayoutDashboard, Briefcase, UserCircle, Warehouse, Calculator, Library, Columns, Moon, Mail, 
  Import, Filter, PieChart, Palette, Globe, Calendar, CreditCard, Shield, Sparkles, Move, Download, Wifi, ShoppingBag, FileCheck, ToggleLeft } from 'lucide-react';

export type TeachingTriggerType = 
  | 'first_visit'
  | 'feature_unused'
  | 'after_action'
  | 'time_on_page'
  | 'empty_state';

export type TeachingPriority = 'high' | 'medium' | 'low';

export interface TeachingPoint {
  id: string;
  title: string;
  description: string;
  icon?: string;
  targetSelector?: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  trigger: {
    type: TeachingTriggerType;
    page?: string;
    section?: string;
    action?: string;
    delayMs?: number;
  };
  priority: TeachingPriority;
  category: 'settings' | 'app' | 'feature';
  sequence?: string;
  sequenceOrder?: number;
}

// ============================================
// SETTINGS TEACHING POINTS (1-3 per section)
// ============================================

export const settingsTeachingPoints: TeachingPoint[] = [
  // Personal Section (3 tips)
  {
    id: 'settings-personal-timezone',
    title: 'Set Your Timezone',
    description: 'Ensure appointments and deadlines show the correct time by setting your local timezone.',
    targetSelector: '[data-teaching="timezone-select"]',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'personal' },
    priority: 'high',
    category: 'settings',
    sequence: 'settings-personal',
    sequenceOrder: 1,
  },
  {
    id: 'settings-personal-date-format',
    title: 'Date & Time Formats',
    description: 'Choose how dates appear throughout the app. Match your regional preferences.',
    targetSelector: '[data-teaching="date-format"]',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'personal' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-personal',
    sequenceOrder: 2,
  },

  // Business Section (3 tips)
  {
    id: 'settings-business-logo',
    title: 'Upload Your Company Logo',
    description: 'Your logo appears on quotes, invoices, and client documents. Drag and drop or click to upload.',
    targetSelector: '[data-teaching="company-logo"]',
    position: 'right',
    trigger: { type: 'first_visit', page: '/settings', section: 'business' },
    priority: 'high',
    category: 'settings',
    sequence: 'settings-business',
    sequenceOrder: 1,
  },
  {
    id: 'settings-business-abn',
    title: 'Tax Registration Number',
    description: 'Add your ABN, VAT, or tax ID. This appears on invoices for your clients\' records.',
    targetSelector: '[data-teaching="abn-field"]',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'business' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-business',
    sequenceOrder: 2,
  },

  // Units Section (2 tips)
  {
    id: 'settings-units-measurement',
    title: 'Choose Measurement Units',
    description: 'Select metric (cm/m) or imperial (inches/feet). All calculations use this system.',
    targetSelector: '[data-teaching="measurement-units"]',
    position: 'right',
    trigger: { type: 'first_visit', page: '/settings', section: 'units' },
    priority: 'high',
    category: 'settings',
    sequence: 'settings-units',
    sequenceOrder: 1,
  },
  {
    id: 'settings-units-currency',
    title: 'Set Your Currency',
    description: 'Choose your currency for pricing. This affects quotes, invoices, and all financial displays.',
    targetSelector: '[data-teaching="currency-select"]',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'units' },
    priority: 'high',
    category: 'settings',
    sequence: 'settings-units',
    sequenceOrder: 2,
  },

  // Products Section (3 tips)
  {
    id: 'settings-products-pricing-grid',
    title: 'Upload Pricing Grids',
    description: 'Import CSV pricing grids from your suppliers. These automatically calculate prices based on width and drop.',
    targetSelector: '[data-teaching="pricing-grid"]',
    position: 'right',
    trigger: { type: 'feature_unused', page: '/settings', section: 'products' },
    priority: 'high',
    category: 'settings',
    sequence: 'settings-products',
    sequenceOrder: 1,
  },
  {
    id: 'settings-products-options',
    title: 'Configure Treatment Options',
    description: 'Add options like lining types, controls, and finishes. Toggle which options appear for each template.',
    targetSelector: '[data-teaching="treatment-options"]',
    position: 'bottom',
    trigger: { type: 'feature_unused', page: '/settings', section: 'products' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-products',
    sequenceOrder: 2,
  },
  {
    id: 'settings-products-templates',
    title: 'Create Product Templates',
    description: 'Templates define how treatments are priced and what options are available. One template per treatment type.',
    targetSelector: '[data-teaching="product-templates"]',
    position: 'bottom',
    trigger: { type: 'feature_unused', page: '/settings', section: 'products' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-products',
    sequenceOrder: 3,
  },

  // Markup & Tax Section (2 tips)
  {
    id: 'settings-markup-calculation',
    title: 'Margin vs Markup',
    description: 'Markup adds percentage to cost. Margin is percentage of selling price. Choose your preferred method.',
    targetSelector: '[data-teaching="markup-method"]',
    position: 'right',
    trigger: { type: 'first_visit', page: '/settings', section: 'markup' },
    priority: 'high',
    category: 'settings',
    sequence: 'settings-markup',
    sequenceOrder: 1,
  },
  {
    id: 'settings-markup-tax',
    title: 'Tax Settings',
    description: 'Configure your tax rate (GST, VAT). Choose whether to display prices inclusive or exclusive of tax.',
    targetSelector: '[data-teaching="tax-settings"]',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'markup' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-markup',
    sequenceOrder: 2,
  },

  // Team Section (2 tips)
  {
    id: 'settings-team-invite',
    title: 'Invite Team Members',
    description: 'Add staff with different permission levels. Managers see costs, staff see only what they need.',
    targetSelector: '[data-teaching="invite-team"]',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'team' },
    priority: 'high',
    category: 'settings',
    sequence: 'settings-team',
    sequenceOrder: 1,
  },
  {
    id: 'settings-team-permissions',
    title: 'Role-Based Access',
    description: 'Each role has specific permissions. Admins see everything, staff see limited data for their work.',
    targetSelector: '[data-teaching="team-roles"]',
    position: 'bottom',
    trigger: { type: 'feature_unused', page: '/settings', section: 'team' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-team',
    sequenceOrder: 2,
  },

  // Documents Section (2 tips)
  {
    id: 'settings-documents-numbering',
    title: 'Custom Document Numbers',
    description: 'Set your own prefixes like QT-001, INV-500. Starting numbers pick up from your existing system.',
    targetSelector: '[data-teaching="doc-numbering"]',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'documents' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-documents',
    sequenceOrder: 1,
  },
  {
    id: 'settings-documents-templates',
    title: 'Customize Document Templates',
    description: 'Edit quote and invoice layouts in the visual editor. Add your branding and custom fields.',
    targetSelector: '[data-teaching="doc-templates"]',
    position: 'bottom',
    trigger: { type: 'feature_unused', page: '/settings', section: 'documents' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-documents',
    sequenceOrder: 2,
  },

  // System Section (2 tips)
  {
    id: 'settings-system-theme',
    title: 'Dark Mode Available',
    description: 'Enable dark mode for reduced eye strain. Perfect for evening work sessions.',
    targetSelector: '[data-teaching="theme-toggle"]',
    position: 'right',
    trigger: { type: 'first_visit', page: '/settings', section: 'system' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-system',
    sequenceOrder: 1,
  },
  {
    id: 'settings-system-data',
    title: 'Export Your Data',
    description: 'Download all your data anytime. Export clients, quotes, and inventory as CSV files.',
    targetSelector: '[data-teaching="data-export"]',
    position: 'bottom',
    trigger: { type: 'feature_unused', page: '/settings', section: 'system' },
    priority: 'low',
    category: 'settings',
    sequence: 'settings-system',
    sequenceOrder: 2,
  },

  // Alerts Section (2 tips)
  {
    id: 'settings-alerts-notifications',
    title: 'Configure Notifications',
    description: 'Choose which events trigger alerts. Get notified about new quotes, overdue invoices, and more.',
    targetSelector: '[data-teaching="notifications"]',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'alerts' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-alerts',
    sequenceOrder: 1,
  },
  {
    id: 'settings-alerts-reminders',
    title: 'Automatic Reminders',
    description: 'Set up follow-up reminders for quotes and appointments. Never miss a client touchpoint.',
    targetSelector: '[data-teaching="reminders"]',
    position: 'bottom',
    trigger: { type: 'feature_unused', page: '/settings', section: 'alerts' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-alerts',
    sequenceOrder: 2,
  },

  // Integrations Section (3 tips)
  {
    id: 'settings-integrations-email',
    title: 'Send Quotes from App',
    description: 'Connect your email provider to send quotes and invoices directly without leaving the app.',
    targetSelector: '[data-teaching="email-integration"]',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'integrations' },
    priority: 'high',
    category: 'settings',
    sequence: 'settings-integrations',
    sequenceOrder: 1,
  },
  {
    id: 'settings-integrations-shopify',
    title: 'Sync with Shopify',
    description: 'Connect your Shopify store to automatically sync products, orders, and customer data.',
    targetSelector: '[data-teaching="shopify-integration"]',
    position: 'bottom',
    trigger: { type: 'feature_unused', page: '/settings', section: 'integrations' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-integrations',
    sequenceOrder: 2,
  },
  {
    id: 'settings-integrations-twc',
    title: 'TWC Manufacturing',
    description: 'Connect to TWC to import their product catalog and submit orders directly for manufacturing.',
    targetSelector: '[data-teaching="twc-integration"]',
    position: 'bottom',
    trigger: { type: 'feature_unused', page: '/settings', section: 'integrations' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-integrations',
    sequenceOrder: 3,
  },
];

// ============================================
// APP FEATURE TEACHING POINTS (Hidden Gems Only)
// ============================================

export const appTeachingPoints: TeachingPoint[] = [
  // Dashboard - NEW: Drag widgets (hidden feature)
  {
    id: 'hidden-dashboard-drag-widgets',
    title: 'Rearrange Your Dashboard',
    description: 'Drag and drop dashboard widgets to customize your layout. Put your most-used data first.',
    position: 'bottom',
    trigger: { type: 'time_on_page', page: '/app', section: 'dashboard', delayMs: 30000 },
    priority: 'medium',
    category: 'feature',
  },

  // Jobs/Projects - Keep column customize (hidden icon)
  {
    id: 'app-jobs-column-customize',
    title: 'Show/Hide Table Columns',
    description: 'Click the settings icon to choose which columns appear. Show or hide data that matters to you.',
    targetSelector: '[data-teaching="column-settings"]',
    position: 'left',
    trigger: { type: 'feature_unused', page: '/app', section: 'projects' },
    priority: 'medium',
    category: 'app',
    sequence: 'jobs-intro',
    sequenceOrder: 1,
  },
  // Jobs - NEW: Export CSV (hidden feature)
  {
    id: 'hidden-jobs-export-csv',
    title: 'Export Jobs to CSV',
    description: 'Download your job list as a spreadsheet for reporting, backup, or sharing with your accountant.',
    position: 'bottom',
    trigger: { type: 'feature_unused', page: '/app', section: 'projects' },
    priority: 'low',
    category: 'feature',
  },

  // Clients - Keep timeline (powerful feature)
  {
    id: 'app-clients-timeline',
    title: 'Client Activity Timeline',
    description: 'Every interaction is logged: quotes sent, calls made, appointments scheduled. Never lose context.',
    position: 'right',
    trigger: { type: 'after_action', action: 'view_client' },
    priority: 'medium',
    category: 'app',
  },
  // Clients - Keep lead scoring (hidden intelligence)
  {
    id: 'app-clients-lead-scoring',
    title: 'Smart Lead Scoring',
    description: 'Clients are automatically scored based on engagement. Focus on hot leads first!',
    position: 'bottom',
    trigger: { type: 'feature_unused', page: '/app', section: 'crm' },
    priority: 'low',
    category: 'app',
  },

  // Inventory - Keep CSV import (huge time saver)
  {
    id: 'app-inventory-csv-import',
    title: 'Import Hundreds of Products',
    description: 'Upload a CSV file to bulk import fabrics, materials, or hardware in one go. Saves hours of data entry.',
    targetSelector: '[data-teaching="inventory-import"]',
    position: 'left',
    trigger: { type: 'feature_unused', page: '/app', section: 'inventory' },
    priority: 'high',
    category: 'app',
    sequence: 'inventory-intro',
    sequenceOrder: 1,
  },
  // Inventory - Keep pricing grid (powerful automation)
  {
    id: 'app-inventory-pricing-grid',
    title: 'Auto-Price with Grids',
    description: 'Link pricing grids to products - prices calculate automatically based on width and drop dimensions.',
    position: 'bottom',
    trigger: { type: 'feature_unused', page: '/app', section: 'inventory' },
    priority: 'high',
    category: 'app',
    sequence: 'inventory-intro',
    sequenceOrder: 2,
  },
  // Inventory - NEW: Colors flow to quotes (hidden connection)
  {
    id: 'hidden-inventory-colors-flow',
    title: 'Colors Flow to Quotes',
    description: 'Colors you add to fabrics automatically appear for selection in the calculator and show on client quotes.',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/app', section: 'inventory' },
    priority: 'medium',
    category: 'feature',
  },
  // Inventory - NEW: TWC import (powerful integration)
  {
    id: 'hidden-inventory-twc-import',
    title: 'Import TWC Blinds Catalog',
    description: 'Import from TWC\'s 400+ product catalog and create templates with pricing grids in one click.',
    position: 'bottom',
    trigger: { type: 'empty_state', page: '/app', section: 'inventory' },
    priority: 'medium',
    category: 'feature',
  },

  // Calculator - Keep options and preview (key workflow)
  {
    id: 'app-calculator-options',
    title: 'Configure Options',
    description: 'Select lining, controls, finishes, and accessories. Each choice updates the price in real-time.',
    position: 'right',
    trigger: { type: 'after_action', action: 'enter_measurements' },
    priority: 'high',
    category: 'app',
    sequence: 'calculator-intro',
    sequenceOrder: 1,
  },
  {
    id: 'app-calculator-preview',
    title: 'Live Quote Preview',
    description: 'See exactly what your client will receive. Review line items and totals before sending.',
    position: 'left',
    trigger: { type: 'after_action', action: 'configure_options' },
    priority: 'medium',
    category: 'app',
    sequence: 'calculator-intro',
    sequenceOrder: 2,
  },
  // Calculator - NEW: Option toggles (hidden power)
  {
    id: 'hidden-calculator-option-toggles',
    title: 'Enable/Disable Options per Template',
    description: 'In Settings → Products, toggle which options appear for each treatment type. Simplify your workflow.',
    position: 'bottom',
    trigger: { type: 'time_on_page', page: '/app', section: 'calculator', delayMs: 45000 },
    priority: 'medium',
    category: 'feature',
  },

  // Library - NEW: Quote templates (hidden feature)
  {
    id: 'hidden-library-quote-templates',
    title: 'Save Quote Templates',
    description: 'Save your quote layouts as templates for consistent client presentations across all jobs.',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/app', section: 'library' },
    priority: 'medium',
    category: 'feature',
  },

  // Global Features - Keep keyboard shortcuts (power user feature)
  {
    id: 'app-feature-keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Press "?" anywhere to see keyboard shortcuts. Navigate faster with Cmd+K for quick search.',
    position: 'bottom',
    trigger: { type: 'time_on_page', delayMs: 60000 },
    priority: 'low',
    category: 'feature',
  },

  // NEW: Offline support (hidden resilience)
  {
    id: 'hidden-offline-support',
    title: 'Works Offline Too',
    description: 'The app caches your data so you can keep working even with poor internet. Changes sync when you\'re back online.',
    position: 'bottom',
    trigger: { type: 'time_on_page', page: '/app', section: 'dashboard', delayMs: 90000 },
    priority: 'low',
    category: 'feature',
  },
];

// ============================================
// COMBINED TEACHING POINTS
// ============================================

export const allTeachingPoints: TeachingPoint[] = [
  ...settingsTeachingPoints,
  ...appTeachingPoints,
];

// Helper to get teaching points by page/section
// FIXED: Strict exact matching to prevent tips appearing on wrong pages
export const getTeachingPointsForPage = (page: string, section?: string): TeachingPoint[] => {
  return allTeachingPoints.filter(tp => {
    // Normalize page paths
    const normalizedPage = page === '/' ? '/app' : page;
    const triggerPage = tp.trigger.page === '/' ? '/app' : tp.trigger.page;
    
    // STRICT page match - exact match only, no prefix matching
    const pageMatch = !triggerPage || triggerPage === normalizedPage;
    
    // STRICT section match - if teaching point defines a section, it must match exactly
    // If no section is provided to this function, only show tips without section requirement
    const sectionMatch = !tp.trigger.section || (section && tp.trigger.section === section);
    
    return pageMatch && sectionMatch;
  });
};

// Helper to get teaching points by sequence
export const getTeachingSequence = (sequenceId: string): TeachingPoint[] => {
  return allTeachingPoints
    .filter(tp => tp.sequence === sequenceId)
    .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));
};

// Helper to get next teaching point in sequence
export const getNextInSequence = (currentId: string): TeachingPoint | null => {
  const current = allTeachingPoints.find(tp => tp.id === currentId);
  if (!current?.sequence) return null;
  
  const sequence = getTeachingSequence(current.sequence);
  const currentIndex = sequence.findIndex(tp => tp.id === currentId);
  
  if (currentIndex === -1 || currentIndex >= sequence.length - 1) return null;
  return sequence[currentIndex + 1];
};
