import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, X, ChevronDown, ChevronUp, Sparkles, AlertCircle } from "lucide-react";
import { useShopifyIntegrationReal } from "@/hooks/useShopifyIntegrationReal";
import { useShopifyAnalytics, useSyncShopifyAnalytics } from "@/hooks/useShopifyAnalytics";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
  priority: 'high' | 'medium' | 'low';
}

export const ContextAwareAdvisor = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const { integration: shopifyIntegration } = useShopifyIntegrationReal();
  const { data: analytics } = useShopifyAnalytics();
  const { mutate: syncAnalytics } = useSyncShopifyAnalytics();

  // Generate context-aware suggestions
  const getSuggestions = (): Suggestion[] => {
    const suggestions: Suggestion[] = [];

    // Check Shopify connection
    if (!shopifyIntegration?.is_connected) {
      suggestions.push({
        id: 'connect-shopify',
        title: 'Connect Your Shopify Store',
        description: 'Start selling online by connecting your Shopify store to unlock e-commerce features.',
        priority: 'high',
        actionLabel: 'Connect Now'
      });
    }

    // Check analytics sync
    if (shopifyIntegration?.is_connected && !analytics) {
      suggestions.push({
        id: 'sync-analytics',
        title: 'Sync Your Store Analytics',
        description: 'Get insights into your store performance. This is your first step after connecting!',
        priority: 'high',
        actionLabel: 'Sync Analytics',
        action: () => syncAnalytics()
      });
    }

    // Check for zero orders
    if (analytics && analytics.total_orders === 0) {
      suggestions.push({
        id: 'first-sale',
        title: 'Ready to Get Your First Sale?',
        description: 'I can help you with proven marketing strategies to drive traffic and convert visitors.',
        priority: 'medium',
        actionLabel: 'Show Me How'
      });
    }

    // Check for good performance
    if (analytics && analytics.total_orders > 0 && analytics.orders_this_month > 0) {
      suggestions.push({
        id: 'optimize-sales',
        title: `Great! You Have ${analytics.total_orders} Orders`,
        description: 'Let me analyze your best-selling products and suggest ways to increase your average order value.',
        priority: 'low',
        actionLabel: 'Analyze Now'
      });
    }

    // Filter out dismissed suggestions
    return suggestions.filter(s => !dismissedSuggestions.includes(s.id));
  };

  const suggestions = getSuggestions();
  const activeSuggestions = suggestions.filter(s => !dismissedSuggestions.includes(s.id));
  const hasActiveSuggestions = activeSuggestions.length > 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted';
    }
  };

  if (!hasActiveSuggestions) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50 max-w-sm"
    >
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-card to-card/95 backdrop-blur">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">AI Advisor</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activeSuggestions.length} suggestion{activeSuggestions.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setIsExpanded(false)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {activeSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", getPriorityColor(suggestion.priority))}
                          >
                            {suggestion.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {suggestion.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 shrink-0"
                        onClick={() => setDismissedSuggestions(prev => [...prev, suggestion.id])}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    {suggestion.actionLabel && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={suggestion.action}
                      >
                        {suggestion.actionLabel}
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Button
              size="lg"
              className={cn(
                "rounded-full shadow-2xl h-14 px-6 gap-3",
                "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
                "animate-pulse-subtle"
              )}
              onClick={() => setIsExpanded(true)}
            >
              <div className="relative">
                <Brain className="h-5 w-5" />
                {activeSuggestions.some(s => s.priority === 'high') && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                  </span>
                )}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold">AI Advisor</span>
                <span className="text-xs opacity-90">
                  {activeSuggestions.length} tip{activeSuggestions.length !== 1 ? 's' : ''} for you
                </span>
              </div>
              <Badge variant="secondary" className="ml-2">
                {activeSuggestions.length}
              </Badge>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
