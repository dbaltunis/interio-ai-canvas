import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Send, TestTube, CheckCircle, AlertCircle, Users, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNotificationUsage } from "@/hooks/useNotificationAnalytics";

export const NotificationTestPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testSubject, setTestSubject] = useState("Test Email from Notification System");
  const [testMessage, setTestMessage] = useState("This is a test email to verify your notification system is working correctly.");
  const [lastTestResult, setLastTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [userRole, setUserRole] = useState<string>("User");
  const [isAccountOwner, setIsAccountOwner] = useState(false);

  const { data: usage, refetch: refetchUsage } = useNotificationUsage();

  // Check user role and account status
  React.useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, parent_account_id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setUserRole(profile.role || 'User');
        setIsAccountOwner(profile.parent_account_id === user.id || !profile.parent_account_id);
      }
    };

    checkUserStatus();
  }, []);

  const handleSendTestEmail = async () => {
    if (!testEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    setLastTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-client-email', {
        body: {
          to: testEmail,
          clientName: "Test User",
          subject: testSubject,
          message: testMessage
        }
      });

      if (error) throw error;

      setLastTestResult({
        success: true,
        message: "Test email sent successfully! Check your inbox."
      });
      
      toast.success("Test email sent successfully!");
      
      // Refresh usage data
      await refetchUsage();
      
    } catch (error: any) {
      console.error("Test email error:", error);
      setLastTestResult({
        success: false,
        message: `Failed to send test email: ${error.message || 'Unknown error'}`
      });
      toast.error("Failed to send test email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Test Notification System
        </CardTitle>
        <CardDescription>
          Send a test email to verify your notification system is working correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Status & Current Usage Display */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Account Status</span>
              {isAccountOwner ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Account Owner
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Team Member ({userRole})
                </Badge>
              )}
            </div>
            <Badge variant="outline">
              {usage?.email_count || 0} emails sent
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {isAccountOwner 
              ? "You can configure notification settings for your team"
              : "Using account owner's notification settings"
            }
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Period: {usage?.period_start ? new Date(usage.period_start).toLocaleDateString() : 'N/A'} - {usage?.period_end ? new Date(usage.period_end).toLocaleDateString() : 'N/A'}
          </div>
        </div>

        {/* Test Form */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="test-email">Test Email Address</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="Enter your email address"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="test-subject">Subject</Label>
            <Input
              id="test-subject"
              value={testSubject}
              onChange={(e) => setTestSubject(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="test-message">Message</Label>
            <Textarea
              id="test-message"
              rows={4}
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
            />
          </div>
        </div>

        {/* Test Result */}
        {lastTestResult && (
          <div className={`p-3 rounded-lg flex items-start gap-2 ${
            lastTestResult.success 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {lastTestResult.success ? (
              <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            )}
            <div className="text-sm">
              {lastTestResult.message}
            </div>
          </div>
        )}

        {/* Send Button */}
        <Button 
          onClick={handleSendTestEmail} 
          disabled={isLoading || !testEmail.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              Sending Test Email...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Test Email
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          This will send a real email and count towards your monthly usage
        </div>
      </CardContent>
    </Card>
  );
};