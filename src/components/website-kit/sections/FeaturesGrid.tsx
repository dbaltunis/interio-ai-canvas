import { motion } from 'framer-motion';
import { 
  Calculator, 
  Users, 
  Calendar, 
  FileText, 
  Ruler, 
  TrendingUp,
  Palette,
  Truck,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  highlight?: boolean;
}

const features: Feature[] = [
  {
    icon: Ruler,
    title: 'Smart Measurements',
    description: 'Take accurate measurements on-site with our visual worksheet. Auto-calculate fabric requirements and pricing instantly.',
    highlight: true
  },
  {
    icon: Calculator,
    title: 'Instant Pricing',
    description: 'Configure pricing grids once, get accurate quotes every time. Support for complex calculations and markups.'
  },
  {
    icon: FileText,
    title: 'Professional Quotes',
    description: 'Generate beautiful, branded quotes in seconds. Send directly via email with e-signature support.'
  },
  {
    icon: Users,
    title: 'Client Management',
    description: 'Track leads, manage contacts, and never miss a follow-up. Full CRM built for window covering pros.'
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Manage appointments, installations, and team schedules. Sync with Google Calendar and Outlook.'
  },
  {
    icon: TrendingUp,
    title: 'Business Analytics',
    description: 'Track revenue, conversion rates, and team performance. Make data-driven decisions.'
  },
  {
    icon: Palette,
    title: 'Product Catalog',
    description: 'Manage fabrics, materials, and treatments. Import from suppliers like TWC automatically.'
  },
  {
    icon: Truck,
    title: 'Order Management',
    description: 'Track orders from quote to installation. Manage suppliers and batch ordering.'
  },
  {
    icon: BarChart3,
    title: 'Work Orders',
    description: 'Generate detailed work orders for your workroom. All specifications in one place.'
  }
];

export const FeaturesGrid = ({ className }: { className?: string }) => {
  return (
    <section className={cn('py-24 px-6 bg-background', className)}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-4 mb-6">
            Everything You Need to Run Your Business
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From first measurement to final installation, InterioApp handles every step of your workflow.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(
                'group relative p-8 rounded-2xl border transition-all duration-300',
                feature.highlight
                  ? 'bg-primary/5 border-primary/30 hover:border-primary/50'
                  : 'bg-card border-border/50 hover:border-primary/30',
                'hover:shadow-xl hover:shadow-primary/5'
              )}
            >
              {/* Icon */}
              <div className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300',
                feature.highlight
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
              )}>
                <feature.icon className="w-7 h-7" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Hover gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              {/* Highlight badge */}
              {feature.highlight && (
                <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
