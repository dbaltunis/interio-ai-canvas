import { Settings, User, Building2, Ruler, Package, Percent, Users, FileText, Monitor, Bell, Plug, 
  LayoutDashboard, Briefcase, UserCircle, Warehouse, Calculator, Library, Columns, Moon, Mail, 
  Import, Filter, PieChart, Palette, Globe, Calendar, CreditCard, Shield, Sparkles } from 'lucide-react';

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
  sequence?: string; // Group related teachings
  sequenceOrder?: number;
}

// ============================================
// SETTINGS TEACHING POINTS
// ============================================

export const settingsTeachingPoints: TeachingPoint[] = [
  // Personal Section
  {
    id: 'settings-personal-profile-photo',
    title: 'Add Your Profile Photo',
    description: 'Upload a profile photo to personalize your account. Your photo appears in team views and client communications.',
    position: 'right',
    trigger: { type: 'first_visit', page: '/settings', section: 'personal' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-personal',
    sequenceOrder: 1,
  },
  {
    id: 'settings-personal-display-name',
    title: 'Set Your Display Name',
    description: 'This name appears on quotes, invoices, and client emails. Make it professional!',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'personal' },
    priority: 'high',
    category: 'settings',
    sequence: 'settings-personal',
    sequenceOrder: 2,
  },
  {
    id: 'settings-personal-timezone',
    title: 'Set Your Timezone',
    description: 'Ensure appointments and deadlines show the correct time by setting your local timezone.',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'personal' },
    priority: 'high',
    category: 'settings',
    sequence: 'settings-personal',
    sequenceOrder: 3,
  },

  // Business Section
  {
    id: 'settings-business-logo',
    title: 'Upload Your Company Logo',
    description: 'Your logo appears on quotes, invoices, and client documents. Drag and drop or click to upload.',
    position: 'right',
    trigger: { type: 'first_visit', page: '/settings', section: 'business' },
    priority: 'high',
    category: 'settings',
    sequence: 'settings-business',
    sequenceOrder: 1,
  },
  {
    id: 'settings-business-abn',
    title: 'Add Your Business Number',
    description: 'Enter your ABN/Tax ID for professional invoices and legal compliance.',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'business' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-business',
    sequenceOrder: 2,
  },
  {
    id: 'settings-business-contact',
    title: 'Business Contact Details',
    description: 'Add your business email and phone. These appear on client-facing documents.',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'business' },
    priority: 'high',
    category: 'settings',
    sequence: 'settings-business',
    sequenceOrder: 3,
  },

  // Units Section
  {
    id: 'settings-units-measurement',
    title: 'Choose Measurement Units',
    description: 'Select metric (cm/m) or imperial (inches/feet) based on your region. All calculations will use this system.',
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
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'units' },
    priority: 'high',
    category: 'settings',
    sequence: 'settings-units',
    sequenceOrder: 2,
  },
  {
    id: 'settings-units-date-format',
    title: 'Date Format Preference',
    description: 'Choose how dates appear throughout the app (DD/MM/YYYY or MM/DD/YYYY).',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'units' },
    priority: 'low',
    category: 'settings',
    sequence: 'settings-units',
    sequenceOrder: 3,
  },

  // Products Section
  {
    id: 'settings-products-templates',
    title: 'Create Product Templates',
    description: 'Templates define your window treatments with pricing, options, and manufacturing settings. Start by creating your first template.',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'products' },
    priority: 'high',
    category: 'settings',
    sequence: 'settings-products',
    sequenceOrder: 1,
  },
  {
    id: 'settings-products-pricing-grid',
    title: 'Upload Pricing Grids',
    description: 'Import CSV pricing grids from your suppliers. These automatically calculate prices based on width and drop.',
    position: 'right',
    trigger: { type: 'feature_unused', page: '/settings', section: 'products' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-products',
    sequenceOrder: 2,
  },
  {
    id: 'settings-products-options',
    title: 'Configure Treatment Options',
    description: 'Add options like lining types, controls, and finishes. Toggle which options appear for each template.',
    position: 'bottom',
    trigger: { type: 'feature_unused', page: '/settings', section: 'products' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-products',
    sequenceOrder: 3,
  },

  // Markup & Tax Section
  {
    id: 'settings-markup-global',
    title: 'Set Your Default Markup',
    description: 'Apply a global profit margin to all products. You can override this per product or quote.',
    position: 'right',
    trigger: { type: 'first_visit', page: '/settings', section: 'markup' },
    priority: 'high',
    category: 'settings',
    sequence: 'settings-markup',
    sequenceOrder: 1,
  },
  {
    id: 'settings-markup-tax',
    title: 'Configure Tax Settings',
    description: 'Set your tax rate (GST/VAT) and choose whether prices display inclusive or exclusive of tax.',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'markup' },
    priority: 'high',
    category: 'settings',
    sequence: 'settings-markup',
    sequenceOrder: 2,
  },

  // Team Section
  {
    id: 'settings-team-invite',
    title: 'Invite Team Members',
    description: 'Add your staff, installers, or contractors. Assign roles to control what they can access.',
    position: 'right',
    trigger: { type: 'first_visit', page: '/settings', section: 'team' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-team',
    sequenceOrder: 1,
  },
  {
    id: 'settings-team-roles',
    title: 'Understand Role Permissions',
    description: 'Admin: Full access. Manager: Most features. Staff: Limited to assigned work. Choose carefully!',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'team' },
    priority: 'low',
    category: 'settings',
    sequence: 'settings-team',
    sequenceOrder: 2,
  },

  // Documents Section
  {
    id: 'settings-documents-template',
    title: 'Customize Quote Templates',
    description: 'Design how your quotes look. Add your logo, adjust colors, and set default terms.',
    position: 'right',
    trigger: { type: 'first_visit', page: '/settings', section: 'documents' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-documents',
    sequenceOrder: 1,
  },
  {
    id: 'settings-documents-numbering',
    title: 'Set Document Numbering',
    description: 'Customize prefixes and starting numbers for quotes, invoices, and jobs (e.g., QT-001, INV-001).',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'documents' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-documents',
    sequenceOrder: 2,
  },

  // System Section
  {
    id: 'settings-system-theme',
    title: 'Switch to Dark Mode',
    description: 'Prefer working at night? Enable dark mode for easier viewing and reduced eye strain.',
    position: 'right',
    trigger: { type: 'first_visit', page: '/settings', section: 'system' },
    priority: 'low',
    category: 'settings',
    sequence: 'settings-system',
    sequenceOrder: 1,
  },
  {
    id: 'settings-system-compact',
    title: 'Try Compact Mode',
    description: 'See more data on screen with compact mode. Great for large inventories and long client lists.',
    position: 'bottom',
    trigger: { type: 'feature_unused', page: '/settings', section: 'system' },
    priority: 'low',
    category: 'settings',
    sequence: 'settings-system',
    sequenceOrder: 2,
  },

  // Alerts Section
  {
    id: 'settings-alerts-email',
    title: 'Email Notifications',
    description: 'Choose which events trigger email alerts: new quotes, overdue payments, appointment reminders.',
    position: 'right',
    trigger: { type: 'first_visit', page: '/settings', section: 'alerts' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-alerts',
    sequenceOrder: 1,
  },
  {
    id: 'settings-alerts-browser',
    title: 'Browser Notifications',
    description: 'Get instant notifications in your browser for urgent updates even when the app is minimized.',
    position: 'bottom',
    trigger: { type: 'feature_unused', page: '/settings', section: 'alerts' },
    priority: 'low',
    category: 'settings',
    sequence: 'settings-alerts',
    sequenceOrder: 2,
  },

  // Integrations Section
  {
    id: 'settings-integrations-calendar',
    title: 'Connect Your Calendar',
    description: 'Sync with Google Calendar to see appointments and block out busy times automatically.',
    position: 'right',
    trigger: { type: 'first_visit', page: '/settings', section: 'integrations' },
    priority: 'medium',
    category: 'settings',
    sequence: 'settings-integrations',
    sequenceOrder: 1,
  },
  {
    id: 'settings-integrations-email',
    title: 'Set Up Email Provider',
    description: 'Connect your email to send quotes and invoices directly from the app with your branding.',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/settings', section: 'integrations' },
    priority: 'high',
    category: 'settings',
    sequence: 'settings-integrations',
    sequenceOrder: 2,
  },
  {
    id: 'settings-integrations-shopify',
    title: 'Connect Shopify Store',
    description: 'Link your Shopify store to sync products, orders, and customer data automatically.',
    position: 'bottom',
    trigger: { type: 'feature_unused', page: '/settings', section: 'integrations' },
    priority: 'low',
    category: 'settings',
    sequence: 'settings-integrations',
    sequenceOrder: 3,
  },
];

// ============================================
// APP FEATURE TEACHING POINTS
// ============================================

export const appTeachingPoints: TeachingPoint[] = [
  // Dashboard
  {
    id: 'app-dashboard-kpis',
    title: 'Your Business at a Glance',
    description: 'These KPI cards show your key metrics: revenue, quotes sent, conversion rate. Click any card for details.',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/app', section: 'dashboard' },
    priority: 'high',
    category: 'app',
    sequence: 'dashboard-intro',
    sequenceOrder: 1,
  },
  {
    id: 'app-dashboard-quick-actions',
    title: 'Quick Actions',
    description: 'Start your most common tasks here: create a quote, add a client, or schedule an appointment.',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/app', section: 'dashboard' },
    priority: 'high',
    category: 'app',
    sequence: 'dashboard-intro',
    sequenceOrder: 2,
  },

  // Jobs/Projects
  {
    id: 'app-jobs-status-workflow',
    title: 'Track Job Progress',
    description: 'Jobs move through stages: Draft → Quoted → Ordered → In Production → Installed. Drag to update status.',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/app', section: 'jobs' },
    priority: 'high',
    category: 'app',
    sequence: 'jobs-intro',
    sequenceOrder: 1,
  },
  {
    id: 'app-jobs-column-customize',
    title: 'Customize Your Columns',
    description: 'Click the settings icon to choose which columns appear. Show or hide data that matters to you.',
    targetSelector: '[data-teaching="column-settings"]',
    position: 'left',
    trigger: { type: 'feature_unused', page: '/app', section: 'jobs' },
    priority: 'medium',
    category: 'app',
    sequence: 'jobs-intro',
    sequenceOrder: 2,
  },
  {
    id: 'app-jobs-filters',
    title: 'Filter Your Jobs',
    description: 'Use filters to find specific jobs by status, date, client, or installer. Save filters for quick access.',
    targetSelector: '[data-teaching="job-filters"]',
    position: 'bottom',
    trigger: { type: 'feature_unused', page: '/app', section: 'jobs' },
    priority: 'medium',
    category: 'app',
    sequence: 'jobs-intro',
    sequenceOrder: 3,
  },

  // Clients/CRM
  {
    id: 'app-clients-add-first',
    title: 'Add Your First Client',
    description: 'Click "Add Client" to create your first contact. Include their address for appointment scheduling.',
    position: 'bottom',
    trigger: { type: 'empty_state', page: '/app', section: 'clients' },
    priority: 'high',
    category: 'app',
    sequence: 'clients-intro',
    sequenceOrder: 1,
  },
  {
    id: 'app-clients-timeline',
    title: 'Client Activity Timeline',
    description: 'Every interaction is logged: quotes sent, calls made, appointments scheduled. Never lose context.',
    position: 'right',
    trigger: { type: 'after_action', action: 'view_client' },
    priority: 'medium',
    category: 'app',
    sequence: 'clients-intro',
    sequenceOrder: 2,
  },
  {
    id: 'app-clients-lead-scoring',
    title: 'Smart Lead Scoring',
    description: 'Clients are automatically scored based on engagement. Focus on hot leads first!',
    position: 'bottom',
    trigger: { type: 'feature_unused', page: '/app', section: 'crm' },
    priority: 'low',
    category: 'app',
  },

  // Inventory
  {
    id: 'app-inventory-create',
    title: 'Add Your First Product',
    description: 'Click "Add Product" to add fabrics, materials, or hardware. Set cost and selling prices.',
    position: 'bottom',
    trigger: { type: 'empty_state', page: '/app', section: 'inventory' },
    priority: 'high',
    category: 'app',
    sequence: 'inventory-intro',
    sequenceOrder: 1,
  },
  {
    id: 'app-inventory-csv-import',
    title: 'Bulk Import Products',
    description: 'Have a product list? Click "Import" to upload a CSV file and add hundreds of products at once.',
    targetSelector: '[data-teaching="inventory-import"]',
    position: 'left',
    trigger: { type: 'feature_unused', page: '/app', section: 'inventory' },
    priority: 'high',
    category: 'app',
    sequence: 'inventory-intro',
    sequenceOrder: 2,
  },
  {
    id: 'app-inventory-pricing-grid',
    title: 'Assign Pricing Grids',
    description: 'Link pricing grids to products for automatic width×drop price lookups. No more manual calculations!',
    position: 'bottom',
    trigger: { type: 'feature_unused', page: '/app', section: 'inventory' },
    priority: 'medium',
    category: 'app',
    sequence: 'inventory-intro',
    sequenceOrder: 3,
  },

  // Calculator/Quote Builder
  {
    id: 'app-calculator-select-treatment',
    title: 'Select a Treatment Type',
    description: 'Choose the window treatment for this quote: curtains, blinds, shutters, or custom options.',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/app', section: 'calculator' },
    priority: 'high',
    category: 'app',
    sequence: 'calculator-intro',
    sequenceOrder: 1,
  },
  {
    id: 'app-calculator-measurements',
    title: 'Enter Measurements',
    description: 'Add width and drop measurements. The system calculates fabric, pricing, and manufacturing automatically.',
    position: 'right',
    trigger: { type: 'after_action', action: 'select_treatment' },
    priority: 'high',
    category: 'app',
    sequence: 'calculator-intro',
    sequenceOrder: 2,
  },
  {
    id: 'app-calculator-options',
    title: 'Configure Options',
    description: 'Select lining, controls, finishes, and accessories. Each choice updates the price in real-time.',
    position: 'right',
    trigger: { type: 'after_action', action: 'enter_measurements' },
    priority: 'high',
    category: 'app',
    sequence: 'calculator-intro',
    sequenceOrder: 3,
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
    sequenceOrder: 4,
  },

  // Library
  {
    id: 'app-library-templates',
    title: 'Your Template Library',
    description: 'Manage all your product templates here. Edit pricing, options, and manufacturing settings.',
    position: 'bottom',
    trigger: { type: 'first_visit', page: '/app', section: 'library' },
    priority: 'medium',
    category: 'app',
  },

  // Hidden Features
  {
    id: 'app-feature-keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Press "?" anywhere to see keyboard shortcuts. Navigate faster with Cmd+K for quick search.',
    position: 'bottom',
    trigger: { type: 'time_on_page', delayMs: 60000 },
    priority: 'low',
    category: 'feature',
  },
  {
    id: 'app-feature-dark-mode-toggle',
    title: 'Quick Theme Toggle',
    description: 'Switch between light and dark mode anytime from the header menu.',
    targetSelector: '[data-teaching="theme-toggle"]',
    position: 'bottom',
    trigger: { type: 'time_on_page', delayMs: 120000 },
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
export const getTeachingPointsForPage = (page: string, section?: string): TeachingPoint[] => {
  return allTeachingPoints.filter(tp => {
    const pageMatch = tp.trigger.page === page || tp.trigger.page?.startsWith(page);
    const sectionMatch = section ? tp.trigger.section === section : true;
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
