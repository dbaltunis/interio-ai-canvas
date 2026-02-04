import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, UserPlus, Settings, ArrowRight, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useUserDisplay } from '@/hooks/useUserDisplay';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useRestartWelcomeTour } from '@/components/teaching/WelcomeTour';

interface QuickTip {
  icon: React.ElementType;
  title: string;
  description: string;
}

const quickTips: QuickTip[] = [
  {
    icon: HelpCircle,
    title: 'Look for ? buttons',
    description: 'Every page has a help button with guides and tips',
  },
  {
    icon: UserPlus,
    title: 'Add your first client',
    description: 'Start by adding a client to create your first job',
  },
  {
    icon: Settings,
    title: 'Customize your business',
    description: 'Set up your company details and preferences in Settings',
  },
];

export const NewUserWelcome = () => {
  const { user } = useAuth();
  const { displayName } = useUserDisplay();
  const isMobile = useIsMobile();
  const restartTour = useRestartWelcomeTour();
  const [isOpen, setIsOpen] = useState(false);
  const [hasCheckedFlag, setHasCheckedFlag] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Check if user has seen the welcome modal
  useEffect(() => {
    if (!user || hasCheckedFlag) return;

    const checkWelcomeStatus = async () => {
      const { data, error } = await supabase
        .from('app_user_flags')
        .select('enabled')
        .eq('user_id', user.id)
        .eq('flag', 'has_seen_welcome')
        .single();

      if (error || !data?.enabled) {
        // User hasn't seen the welcome - show it after a small delay
        setTimeout(() => setIsOpen(true), 800);
      }
      setHasCheckedFlag(true);
    };

    checkWelcomeStatus();
  }, [user, hasCheckedFlag]);

  const markWelcomeSeen = useCallback(async () => {
    if (!user) return;

    await supabase.from('app_user_flags').upsert({
      user_id: user.id,
      flag: 'has_seen_welcome',
      enabled: true,
    });
  }, [user]);

  const handleGetStarted = async () => {
    setIsExiting(true);
    await markWelcomeSeen();
    setTimeout(() => {
      setIsOpen(false);
      setIsExiting(false);
    }, 300);
  };

  const handleTakeTour = async () => {
    await markWelcomeSeen();
    setIsOpen(false);
    // Trigger the existing WelcomeTour
    await supabase.from('app_user_flags').upsert({
      user_id: user?.id,
      flag: 'has_seen_product_tour',
      enabled: false,
    });
    window.location.reload();
  };

  const firstName = displayName.split(' ')[0];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleGetStarted}
          />

          {/* Modal */}
          <motion.div
            initial={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
            animate={isMobile 
              ? { y: isExiting ? '100%' : 0 } 
              : { scale: isExiting ? 0.9 : 1, opacity: isExiting ? 0 : 1 }
            }
            exit={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              "relative bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden",
              isMobile 
                ? "w-full max-h-[90vh]" 
                : "w-full max-w-md mx-4"
            )}
          >
            {/* Header gradient */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />

            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleGetStarted}
              className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-muted/50 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Content */}
            <div className="relative p-6 pt-8 sm:p-8">
              {/* Welcome Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg"
              >
                <Sparkles className="h-10 w-10 text-primary-foreground" />
              </motion.div>

              {/* Welcome Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
              >
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Welcome, {firstName}!
                </h1>
                <p className="text-muted-foreground">
                  Let's get you set up for success
                </p>
              </motion.div>

              {/* Quick Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3 mb-8"
              >
                {quickTips.map((tip, index) => (
                  <motion.div
                    key={tip.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <tip.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground">{tip.title}</p>
                      <p className="text-xs text-muted-foreground">{tip.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-3"
              >
                <Button
                  onClick={handleGetStarted}
                  size="lg"
                  className="w-full h-12 text-base gap-2"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  onClick={handleTakeTour}
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  Take a quick tour instead
                </Button>
              </motion.div>
            </div>

            {/* Mobile safe area padding */}
            {isMobile && <div className="h-6" />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
