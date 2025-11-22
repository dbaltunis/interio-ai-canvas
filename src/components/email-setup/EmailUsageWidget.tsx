import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const EMAIL_LIMIT = 500;

export const EmailUsageWidget = () => {
  const { data: usage, isLoading } = useQuery({
    queryKey: ['email-usage'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from('notification_usage')
        .select('email_count')
        .eq('user_id', user.id)
        .gte('period_start', startOfMonth.toISOString())
        .single();

      return data?.email_count || 0;
    },
  });

  const emailCount = usage || 0;
  const percentage = (emailCount / EMAIL_LIMIT) * 100;
  const resetDate = new Date();
  resetDate.setMonth(resetDate.getMonth() + 1);
  resetDate.setDate(1);

  const getColorClass = () => {
    if (percentage >= 95) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getTextColorClass = () => {
    if (percentage >= 95) return "text-red-700";
    if (percentage >= 80) return "text-yellow-700";
    return "text-green-700";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">Email Usage This Month</span>
          </div>
          {percentage >= 80 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.href = '/settings?section=integrations'}
              className="text-xs"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Upgrade
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={getTextColorClass()}>
              {emailCount} of {EMAIL_LIMIT} emails
            </span>
            <span className="text-muted-foreground">
              {percentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`${getColorClass()} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Resets on: {resetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          {percentage >= 95 && (
            <span className="text-red-600 font-medium">Limit nearly reached!</span>
          )}
        </div>

        {percentage >= 80 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Need unlimited emails? Configure your own SendGrid account for unlimited sending with custom branding.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
