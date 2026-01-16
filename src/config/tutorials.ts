export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  action: 'highlight' | 'click' | 'type' | 'scroll' | 'wait';
  animationType: 'pulse' | 'spotlight' | 'zoom' | 'arrow';
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  duration: number;
  autoAdvance?: boolean;
  typeText?: string;
  scrollDirection?: 'up' | 'down';
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  steps: TutorialStep[];
  category: 'getting-started' | 'calendar' | 'quotes' | 'settings' | 'inventory';
  icon: string;
  requiredRoute?: string;
}

export const tutorials: Tutorial[] = [
  {
    id: 'create-appointment',
    title: 'Create Your First Appointment',
    description: 'Learn how to quickly create and manage calendar appointments',
    estimatedTime: '2 min',
    category: 'calendar',
    icon: 'Calendar',
    requiredRoute: '/calendar',
    steps: [
      {
        id: 'step-1',
        title: 'Open the Calendar',
        description: 'First, let\'s navigate to your calendar where you can manage all your appointments.',
        targetSelector: '[data-tutorial="calendar-nav"]',
        action: 'click',
        animationType: 'spotlight',
        position: 'right',
        duration: 3000,
      },
      {
        id: 'step-2',
        title: 'Create New Appointment',
        description: 'Click the "Add Appointment" button to start creating a new event.',
        targetSelector: '[data-tutorial="add-appointment-btn"]',
        action: 'click',
        animationType: 'zoom',
        position: 'bottom',
        duration: 3000,
      },
      {
        id: 'step-3',
        title: 'Enter Appointment Title',
        description: 'Give your appointment a clear, descriptive title.',
        targetSelector: '[data-tutorial="appointment-title"]',
        action: 'type',
        typeText: 'Client Consultation',
        animationType: 'spotlight',
        position: 'right',
        duration: 4000,
      },
      {
        id: 'step-4',
        title: 'Select Date & Time',
        description: 'Choose when your appointment should take place.',
        targetSelector: '[data-tutorial="appointment-datetime"]',
        action: 'highlight',
        animationType: 'pulse',
        position: 'right',
        duration: 3000,
      },
      {
        id: 'step-5',
        title: 'Save Your Appointment',
        description: 'Click Save to add the appointment to your calendar.',
        targetSelector: '[data-tutorial="save-appointment-btn"]',
        action: 'click',
        animationType: 'zoom',
        position: 'top',
        duration: 3000,
      },
    ],
  },
  {
    id: 'calendar-views',
    title: 'Understanding Calendar Views',
    description: 'Master the different ways to view and organize your schedule',
    estimatedTime: '1.5 min',
    category: 'calendar',
    icon: 'LayoutGrid',
    requiredRoute: '/calendar',
    steps: [
      {
        id: 'step-1',
        title: 'Day View',
        description: 'See your entire day hour by hour. Perfect for detailed planning.',
        targetSelector: '[data-tutorial="view-day"]',
        action: 'click',
        animationType: 'spotlight',
        position: 'bottom',
        duration: 3000,
      },
      {
        id: 'step-2',
        title: 'Week View',
        description: 'Get an overview of your entire week at a glance.',
        targetSelector: '[data-tutorial="view-week"]',
        action: 'click',
        animationType: 'spotlight',
        position: 'bottom',
        duration: 3000,
      },
      {
        id: 'step-3',
        title: 'Month View',
        description: 'See the big picture with a full month overview.',
        targetSelector: '[data-tutorial="view-month"]',
        action: 'click',
        animationType: 'spotlight',
        position: 'bottom',
        duration: 3000,
      },
    ],
  },
  {
    id: 'create-quote',
    title: 'Creating Your First Quote',
    description: 'Step-by-step guide to creating professional quotes for clients',
    estimatedTime: '4 min',
    category: 'quotes',
    icon: 'FileText',
    requiredRoute: '/jobs',
    steps: [
      {
        id: 'step-1',
        title: 'Navigate to Jobs',
        description: 'Let\'s go to the Jobs section where quotes are managed.',
        targetSelector: '[data-tutorial="jobs-nav"]',
        action: 'click',
        animationType: 'spotlight',
        position: 'right',
        duration: 3000,
      },
      {
        id: 'step-2',
        title: 'Create New Job',
        description: 'Click "New Job" to start creating a quote.',
        targetSelector: '[data-tutorial="new-job-btn"]',
        action: 'click',
        animationType: 'zoom',
        position: 'bottom',
        duration: 3000,
      },
      {
        id: 'step-3',
        title: 'Select a Client',
        description: 'Choose an existing client or create a new one for this quote.',
        targetSelector: '[data-tutorial="select-client"]',
        action: 'highlight',
        animationType: 'spotlight',
        position: 'right',
        duration: 4000,
      },
      {
        id: 'step-4',
        title: 'Add Room/Location',
        description: 'Specify where the work will be done.',
        targetSelector: '[data-tutorial="add-room"]',
        action: 'click',
        animationType: 'spotlight',
        position: 'right',
        duration: 3000,
      },
      {
        id: 'step-5',
        title: 'Add Items',
        description: 'Add products or services to your quote.',
        targetSelector: '[data-tutorial="add-items"]',
        action: 'click',
        animationType: 'zoom',
        position: 'bottom',
        duration: 4000,
      },
      {
        id: 'step-6',
        title: 'Review & Save',
        description: 'Review your quote and save it.',
        targetSelector: '[data-tutorial="save-quote"]',
        action: 'click',
        animationType: 'zoom',
        position: 'top',
        duration: 3000,
      },
    ],
  },
  {
    id: 'essential-settings',
    title: 'Essential Settings Setup',
    description: 'Configure the most important settings for your business',
    estimatedTime: '3 min',
    category: 'settings',
    icon: 'Settings',
    requiredRoute: '/settings',
    steps: [
      {
        id: 'step-1',
        title: 'Open Settings',
        description: 'Navigate to your settings to customize the app.',
        targetSelector: '[data-tutorial="settings-nav"]',
        action: 'click',
        animationType: 'spotlight',
        position: 'right',
        duration: 3000,
      },
      {
        id: 'step-2',
        title: 'Business Details',
        description: 'Click on Business Settings to set up your company information.',
        targetSelector: '[data-tutorial="business-settings"]',
        action: 'click',
        animationType: 'spotlight',
        position: 'right',
        duration: 3000,
      },
      {
        id: 'step-3',
        title: 'Upload Logo',
        description: 'Add your company logo to personalize quotes and invoices.',
        targetSelector: '[data-tutorial="upload-logo"]',
        action: 'highlight',
        animationType: 'pulse',
        position: 'right',
        duration: 4000,
      },
      {
        id: 'step-4',
        title: 'Set Currency',
        description: 'Configure your preferred currency for pricing.',
        targetSelector: '[data-tutorial="currency-setting"]',
        action: 'highlight',
        animationType: 'spotlight',
        position: 'right',
        duration: 3000,
      },
      {
        id: 'step-5',
        title: 'Tax Rate',
        description: 'Set your default tax rate for accurate quotes.',
        targetSelector: '[data-tutorial="tax-rate"]',
        action: 'highlight',
        animationType: 'spotlight',
        position: 'right',
        duration: 3000,
      },
    ],
  },
  {
    id: 'quick-tour',
    title: 'Quick App Tour',
    description: 'Get familiar with the main features of the app',
    estimatedTime: '2 min',
    category: 'getting-started',
    icon: 'Compass',
    steps: [
      {
        id: 'step-1',
        title: 'Welcome to Your Dashboard',
        description: 'This is your home base. See your key metrics and quick actions here.',
        targetSelector: '[data-tutorial="dashboard"]',
        action: 'highlight',
        animationType: 'spotlight',
        position: 'center',
        duration: 4000,
      },
      {
        id: 'step-2',
        title: 'Navigation Menu',
        description: 'Use the sidebar to navigate between different sections of the app.',
        targetSelector: '[data-tutorial="sidebar"]',
        action: 'highlight',
        animationType: 'spotlight',
        position: 'right',
        duration: 3000,
      },
      {
        id: 'step-3',
        title: 'Quick Actions',
        description: 'Create new items quickly from this action bar.',
        targetSelector: '[data-tutorial="quick-actions"]',
        action: 'highlight',
        animationType: 'pulse',
        position: 'bottom',
        duration: 3000,
      },
      {
        id: 'step-4',
        title: 'Help & Support',
        description: 'Click here anytime you need help or want to watch more tutorials.',
        targetSelector: '[data-tutorial="help-button"]',
        action: 'click',
        animationType: 'zoom',
        position: 'left',
        duration: 3000,
      },
    ],
  },
];

export const getTutorialsByCategory = (category: Tutorial['category']) => {
  return tutorials.filter(t => t.category === category);
};

export const getTutorialById = (id: string) => {
  return tutorials.find(t => t.id === id);
};

export const tutorialCategories = [
  { id: 'getting-started', label: 'Getting Started', icon: 'Rocket' },
  { id: 'calendar', label: 'Calendar', icon: 'Calendar' },
  { id: 'quotes', label: 'Quotes & Jobs', icon: 'FileText' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
  { id: 'inventory', label: 'Inventory', icon: 'Package' },
] as const;
