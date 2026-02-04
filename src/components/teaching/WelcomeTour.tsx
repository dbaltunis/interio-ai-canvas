import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, LayoutDashboard, Briefcase, Package, Settings, Sparkles, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  illustration: string;
  gradient: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    description: 'See all your projects, clients, and key metrics at a glance. Get a complete overview of your business in one place.',
    icon: LayoutDashboard,
    illustration: '📊',
    gradient: 'from-blue-500/20 via-primary/10 to-purple-500/20',
  },
  {
    id: 'projects',
    title: 'Projects & Jobs',
    description: 'Create quotes, manage work orders, and track progress from initial consultation to final installation.',
    icon: Briefcase,
    illustration: '📋',
    gradient: 'from-emerald-500/20 via-primary/10 to-teal-500/20',
  },
  {
    id: 'products',
    title: 'Product Library',
    description: 'Configure your products, pricing templates, and materials. Build quotes faster with your customized catalog.',
    icon: Package,
    illustration: '📦',
    gradient: 'from-orange-500/20 via-primary/10 to-amber-500/20',
  },
  {
    id: 'settings',
    title: 'Your Settings',
    description: 'Customize your business details, measurement units, team members, and integrations to match your workflow.',
    icon: Settings,
    illustration: '⚙️',
    gradient: 'from-purple-500/20 via-primary/10 to-pink-500/20',
  },
];

interface WelcomeTourProps {
  onComplete?: () => void;
}

export const WelcomeTour = ({ onComplete }: WelcomeTourProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCheckedFlag, setHasCheckedFlag] = useState(false);

  // Check if user has seen the tour
  useEffect(() => {
    if (!user || hasCheckedFlag) return;

    const checkTourStatus = async () => {
      const { data, error } = await supabase
        .from('app_user_flags')
        .select('enabled')
        .eq('user_id', user.id)
        .eq('flag', 'has_seen_product_tour')
        .single();

      // Auto-open disabled - cinematic WelcomeVideoAutoTrigger handles first-time users
      // Users can still access this tour from Tips & Guidance
      // if (error || !data?.enabled) {
      //   setTimeout(() => setIsOpen(true), 1500);
      // }
      setHasCheckedFlag(true);
    };

    checkTourStatus();
  }, [user, hasCheckedFlag]);

  const markTourComplete = useCallback(async () => {
    if (!user) return;

    await supabase.from('app_user_flags').upsert({
      user_id: user.id,
      flag: 'has_seen_product_tour',
      enabled: true,
    });
  }, [user]);

  const handleSkip = async () => {
    await markTourComplete();
    setIsOpen(false);
    onComplete?.();
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    await markTourComplete();
    setIsOpen(false);
    onComplete?.();
  };

  const step = tourSteps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="sm:max-w-md p-0 gap-0 overflow-hidden border-0 bg-card"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Welcome Tour</DialogTitle>
        
        {/* Step Indicators */}
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-2">
            {tourSteps.map((_, index) => (
              <motion.div
                key={index}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentStep 
                    ? "w-6 bg-primary" 
                    : index < currentStep 
                      ? "w-2 bg-primary/60"
                      : "w-2 bg-muted"
                )}
                animate={{ scale: index === currentStep ? 1.1 : 1 }}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground text-xs h-7"
          >
            Skip Tour
          </Button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="px-6 py-8"
          >
            {/* Illustration */}
            <div className={cn(
              "relative mx-auto mb-6 w-32 h-32 rounded-2xl flex items-center justify-center",
              "bg-gradient-to-br", step.gradient
            )}>
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 2, -2, 0],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-6xl"
              >
                {step.illustration}
              </motion.div>
              
              {/* Icon Badge */}
              <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-primary shadow-lg flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>

            {/* Text */}
            <div className="text-center space-y-3">
              <h2 className="text-xl font-semibold text-foreground">
                {step.title}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="px-6 pb-6 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            size="sm"
            className="gap-1.5 min-w-[100px]"
          >
            {isLastStep ? (
              <>
                <Play className="h-4 w-4" />
                Get Started
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Footer hint */}
        <div className="px-6 pb-4 text-center">
          <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3" />
            You can restart this tour anytime from Tips & Guidance
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Restarts the welcome tour by clearing the flag
 */
export const useRestartWelcomeTour = () => {
  const { user } = useAuth();

  return useCallback(async () => {
    if (!user) return;

    await supabase.from('app_user_flags').upsert({
      user_id: user.id,
      flag: 'has_seen_product_tour',
      enabled: false,
    });

    // Reload to trigger the tour
    window.location.reload();
  }, [user]);
};
