import { motion } from 'framer-motion';
import { Check, ArrowRight, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CTASection } from '../sections/CTASection';

interface PricingPlan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const plans: PricingPlan[] = [
  {
    name: 'Starter',
    description: 'Perfect for solo operators getting started',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      '1 user',
      'Unlimited quotes',
      'Measurement worksheets',
      'Basic pricing grids',
      'Email support',
      'Client management'
    ],
    cta: 'Start Free Trial'
  },
  {
    name: 'Professional',
    description: 'For growing businesses with a team',
    monthlyPrice: 99,
    yearlyPrice: 79,
    features: [
      'Up to 5 users',
      'Everything in Starter',
      'Advanced pricing grids',
      'Calendar & scheduling',
      'Work orders',
      'Supplier integrations',
      'Priority support'
    ],
    highlighted: true,
    cta: 'Start Free Trial'
  },
  {
    name: 'Enterprise',
    description: 'For larger operations needing more',
    monthlyPrice: 199,
    yearlyPrice: 159,
    features: [
      'Unlimited users',
      'Everything in Professional',
      'Custom integrations',
      'API access',
      'Dedicated account manager',
      'Custom training',
      'SLA guarantee'
    ],
    cta: 'Contact Sales'
  }
];

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'Can I try InterioApp before committing?',
    answer: 'Yes! We offer a 14-day free trial with full access to all features. No credit card required.'
  },
  {
    question: 'Can I change plans later?',
    answer: 'Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We use bank-level encryption and store your data in secure, SOC 2 compliant data centers.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes. If you\'re not satisfied within the first 30 days, we\'ll give you a full refund, no questions asked.'
  },
  {
    question: 'Can I import my existing data?',
    answer: 'Yes. We support importing clients, products, and pricing from Excel/CSV files. Our team can help with migration.'
  },
  {
    question: 'What support is included?',
    answer: 'All plans include email support. Professional and Enterprise plans get priority support with faster response times.'
  }
];

export const WebsitePricingPage = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
              Pricing
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mt-4 mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
              Start free for 14 days. No credit card required. Choose the plan that fits your business.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={cn('font-medium', !isYearly ? 'text-foreground' : 'text-muted-foreground')}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={cn(
                  'relative w-14 h-7 rounded-full transition-colors',
                  isYearly ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-5 h-5 rounded-full bg-white transition-transform',
                    isYearly ? 'left-8' : 'left-1'
                  )}
                />
              </button>
              <span className={cn('font-medium', isYearly ? 'text-foreground' : 'text-muted-foreground')}>
                Yearly
              </span>
              {isYearly && (
                <span className="bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
                  Save 20%
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-6 -mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  'relative p-8 rounded-2xl border transition-all duration-300',
                  plan.highlighted
                    ? 'bg-primary/5 border-primary shadow-xl shadow-primary/10 scale-105'
                    : 'bg-card border-border/50 hover:border-primary/30'
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {plan.description}
                </p>

                <div className="mb-8">
                  <span className="text-5xl font-bold text-foreground">
                    €{isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                  {isYearly && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Billed annually (€{plan.yearlyPrice * 12}/year)
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={cn(
                    'w-full py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors',
                    plan.highlighted
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  )}
                >
                  {plan.cta}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              FAQ
            </span>
            <h2 className="text-4xl font-bold text-foreground mt-4 mb-6">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-card border border-border/50 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-foreground">{faq.question}</span>
                  <HelpCircle className={cn(
                    'w-5 h-5 text-muted-foreground transition-transform',
                    openFaq === index && 'rotate-180'
                  )} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection />
    </div>
  );
};
