import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationCenter } from "@/components/ui/notification-center";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  Settings as SettingsIcon, 
  ChevronRight, 
  Star, 
  Clock,
  BookOpen,
  Lightbulb,
  Rocket,
  Target,
  Users,
  Zap
} from 'lucide-react';

interface SettingsSearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  path: string;
  relevance: number;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  category: 'profile' | 'security' | 'notifications' | 'preferences';
}

export const SettingsOverviewTab = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>(['profile', 'notifications', 'security']);

  const quickActions: QuickAction[] = [
    {
      id: 'update-profile',
      title: 'Update Profile Picture',
      description: 'Change your avatar and personal information',
      icon: <Users className="h-5 w-5" />,
      action: () => toast({ title: "Navigate to Profile", description: "Opening profile settings..." }),
      category: 'profile'
    },
    {
      id: 'enable-2fa',
      title: 'Enable Two-Factor Auth',
      description: 'Add extra security to your account',
      icon: <Zap className="h-5 w-5" />,
      action: () => toast({ title: "Navigate to Security", description: "Opening security settings..." }),
      category: 'security'
    },
    {
      id: 'notification-setup',
      title: 'Configure Notifications',
      description: 'Set up your notification preferences',
      icon: <BookOpen className="h-5 w-5" />,
      action: () => toast({ title: "Navigate to Notifications", description: "Opening notification settings..." }),
      category: 'notifications'
    },
    {
      id: 'theme-setup',
      title: 'Customize Theme',
      description: 'Personalize your interface appearance',
      icon: <Lightbulb className="h-5 w-5" />,
      action: () => toast({ title: "Navigate to Preferences", description: "Opening theme settings..." }),
      category: 'preferences'
    }
  ];

  const searchResults: SettingsSearchResult[] = [
    {
      id: 'profile-name',
      title: 'Display Name',
      description: 'Change how your name appears to other users',
      category: 'Profile',
      path: '/settings/personal',
      relevance: 0.9
    },
    {
      id: 'password-security',
      title: 'Password Settings',
      description: 'Update your account password and security options',
      category: 'Security',
      path: '/settings/security',
      relevance: 0.8
    },
    {
      id: 'email-notifications',
      title: 'Email Notifications',
      description: 'Control when you receive email notifications',
      category: 'Notifications',
      path: '/settings/notifications',
      relevance: 0.7
    }
  ].filter(result => 
    searchQuery === '' || 
    result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tips = [
    {
      icon: <Rocket className="h-5 w-5 text-blue-500" />,
      title: "Quick Setup",
      description: "Complete your profile setup in under 5 minutes with our guided tour."
    },
    {
      icon: <Target className="h-5 w-5 text-green-500" />,
      title: "Security Best Practices",
      description: "Enable two-factor authentication and use a strong, unique password."
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
      title: "Productivity Tip",
      description: "Customize your notification settings to reduce distractions during work hours."
    }
  ];

  const mockNotifications = [
    {
      id: '1',
      type: 'info' as const,
      title: 'Profile Incomplete',
      message: 'Add a profile picture and phone number to complete your setup',
      timestamp: new Date().toISOString(),
      actionLabel: 'Complete Now'
    },
    {
      id: '2', 
      type: 'warning' as const,
      title: 'Security Recommendation',
      message: 'Enable two-factor authentication for better account security',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      actionLabel: 'Enable 2FA'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enhanced Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings Overview</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      {/* Quick Search */}
      <Card className="hover:shadow-md transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Quick Settings Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {searchQuery && (
            <div className="mt-4 space-y-2">
              {searchResults.map((result) => (
                <div 
                  key={result.id}
                  className="flex items-center justify-between p-3 border border-border/50 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{result.title}</span>
                      <Badge variant="secondary" className="text-xs">{result.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{result.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="hover:shadow-md transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <div
                key={action.id}
                onClick={action.action}
                className="flex items-center gap-3 p-4 border border-border/50 rounded-lg hover:bg-muted/30 cursor-pointer transition-all duration-200 hover-lift"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{action.title}</h4>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recently Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentlyUsed.map((item) => (
                <div key={item} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium capitalize">{item} Settings</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">Recent</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Tips & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border border-border/50 rounded-lg">
                  <div className="p-1">
                    {tip.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{tip.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Notifications */}
      <Card className="hover:shadow-md transition-all duration-300">
        <CardHeader>
          <CardTitle>Settings Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationCenter
            notifications={mockNotifications}
            onDismiss={(id) => toast({ title: "Notification dismissed", description: `Notification ${id} was dismissed` })}
            onAction={(id) => toast({ title: "Action triggered", description: `Action for notification ${id} was triggered` })}
            onClick={(id) => toast({ title: "Notification clicked", description: `Notification ${id} was clicked` })}
          />
        </CardContent>
      </Card>
    </div>
  );
};