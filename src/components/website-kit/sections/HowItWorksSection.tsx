import { motion } from 'framer-motion';
import { Settings, Ruler, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  icon: React.ElementType;
  number: string;
  title: string;
  description: string;
  features: string[];
}

const steps: Step[] = [
  {
    icon: Settings,
    number: '01',
    title: 'Set Up Your Products',
    description: 'Configure your treatments, fabrics, and pricing grids once. Import from suppliers or create custom products.',
    features: [
      'Import from TWC and other suppliers',
      'Configure pricing grids',
      'Set up treatment options'
    ]
  },
  {
    icon: Ruler,
    number: '02',
    title: 'Take Measurements On-Site',
    description: 'Use our visual measurement worksheet to capture accurate dimensions. Select treatments and see prices instantly.',
    features: [
      'Visual window diagrams',
      'Auto-calculate fabric requirements',
      'Real-time pricing'
    ]
  },
  {
    icon: FileText,
    number: '03',
    title: 'Generate & Send Quotes',
    description: 'Create professional, branded quotes in seconds. Send via email with e-signature support and track status.',
    features: [
      'Beautiful PDF quotes',
      'E-signature integration',
      'Automatic follow-ups'
    ]
  }
];

export const HowItWorksSection = ({ className }: { className?: string }) => {
  return (
    <section className={cn('py-24 px-6 bg-background', className)}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mt-4 mb-6">
            From Setup to Quote in 3 Simple Steps
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get started in minutes, not days. Our intuitive workflow matches how you already work.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                {/* Step Card */}
                <div className="relative z-10 p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                  {/* Number Badge */}
                  <div className="absolute -top-4 left-8 bg-primary text-primary-foreground text-sm font-bold px-4 py-1 rounded-full">
                    Step {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 mt-2">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {step.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-3">
                    {step.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Arrow - Mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-6">
                    <ArrowRight className="w-8 h-8 text-primary/50 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-6">
            Ready to streamline your workflow?
          </p>
          <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold hover:bg-primary/90 transition-colors">
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
