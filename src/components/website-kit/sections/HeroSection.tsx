import { motion } from 'framer-motion';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardMockup } from '../mockups/DashboardMockup';

const benefits = ['No credit card required', '14-day free trial', 'Setup in 5 minutes'];

export const HeroSection = ({ className }: { className?: string }) => {
  return (
    <section className={cn('relative min-h-screen flex items-center py-20 px-6 overflow-hidden', 'bg-gradient-to-br from-background via-background to-primary/5', className)}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              #1 Software for Window Covering Pros
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Window Covering Software That{' '}
              <span className="text-primary">Just Works</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              From first measurement to final installation. Streamline your workflow, win more business, and grow your revenue.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold hover:bg-primary/90 transition-colors">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground px-8 py-4 rounded-full font-semibold hover:bg-muted transition-colors">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap gap-4">
              {benefits.map(benefit => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {benefit}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Mockup */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
            <DashboardMockup className="w-full max-w-md mx-auto lg:max-w-none" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
