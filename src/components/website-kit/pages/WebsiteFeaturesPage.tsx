import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { MeasurementMockup } from '../mockups/MeasurementMockup';
import { QuotesMockup } from '../mockups/QuotesMockup';
import { CalendarMockup } from '../mockups/CalendarMockup';
import { ClientsMockup } from '../mockups/ClientsMockup';
import { JobsMockup } from '../mockups/JobsMockup';
import { DashboardMockup } from '../mockups/DashboardMockup';
import { CTASection } from '../sections/CTASection';

interface FeatureShowcase {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  mockup: React.ReactNode;
  reverse?: boolean;
}

const featureShowcases: FeatureShowcase[] = [
  {
    title: 'Smart Measurement Worksheets',
    subtitle: 'Your #1 Tool On-Site',
    description: 'Take accurate measurements with our visual worksheet. See real-time pricing as you configure treatments.',
    features: [
      'Visual window diagrams for accuracy',
      'Auto-calculate fabric requirements',
      'Configure all treatment options on-site',
      'Instant pricing with your pricing grids'
    ],
    mockup: <MeasurementMockup className="w-full" />
  },
  {
    title: 'Professional Quotes in Seconds',
    subtitle: 'Win More Business',
    description: 'Generate beautiful, branded quotes instantly. Send via email with e-signature support.',
    features: [
      'Professionally designed templates',
      'Your branding and logo',
      'E-signature integration',
      'Automatic follow-up reminders'
    ],
    mockup: <QuotesMockup className="w-full" />,
    reverse: true
  },
  {
    title: 'Smart Scheduling',
    subtitle: 'Never Miss an Appointment',
    description: 'Manage all your appointments, installations, and team schedules in one place.',
    features: [
      'Google & Outlook sync',
      'Team calendar management',
      'Automated reminders',
      'Customer booking links'
    ],
    mockup: <CalendarMockup className="w-full" />
  },
  {
    title: 'Complete CRM',
    subtitle: 'Know Your Customers',
    description: 'Track leads, manage contacts, and never miss a follow-up opportunity.',
    features: [
      'Lead scoring & tracking',
      'Contact management',
      'Activity history',
      'Automated follow-ups'
    ],
    mockup: <ClientsMockup className="w-full" />,
    reverse: true
  },
  {
    title: 'Visual Job Management',
    subtitle: 'From Quote to Install',
    description: 'Track every job through your workflow with our intuitive Kanban board.',
    features: [
      'Drag-and-drop workflow',
      'Custom status stages',
      'Team assignments',
      'Progress tracking'
    ],
    mockup: <JobsMockup className="w-full" />
  },
  {
    title: 'Business Dashboard',
    subtitle: 'Data-Driven Decisions',
    description: 'Track revenue, conversion rates, and team performance at a glance.',
    features: [
      'Real-time KPIs',
      'Revenue tracking',
      'Team performance',
      'Conversion analytics'
    ],
    mockup: <DashboardMockup className="w-full" />,
    reverse: true
  }
];

export const WebsiteFeaturesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Features
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mt-4 mb-6">
              Everything You Need to Grow
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              From first measurement to final installation, InterioApp handles every step of your window covering business.
            </p>
            <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold hover:bg-primary/90 transition-colors">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Feature Showcases */}
      {featureShowcases.map((feature, index) => (
        <section
          key={feature.title}
          className={`py-24 px-6 ${index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}`}
        >
          <div className="max-w-7xl mx-auto">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${feature.reverse ? 'lg:flex-row-reverse' : ''}`}>
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: feature.reverse ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={feature.reverse ? 'lg:order-2' : ''}
              >
                <span className="text-primary font-medium text-sm uppercase tracking-wider">
                  {feature.subtitle}
                </span>
                <h2 className="text-4xl font-bold text-foreground mt-4 mb-6">
                  {feature.title}
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                  {feature.description}
                </p>
                <ul className="space-y-4">
                  {feature.features.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Mockup */}
              <motion.div
                initial={{ opacity: 0, x: feature.reverse ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={feature.reverse ? 'lg:order-1' : ''}
              >
                {feature.mockup}
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <CTASection />
    </div>
  );
};
