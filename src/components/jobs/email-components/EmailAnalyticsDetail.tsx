import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MousePointer, Clock, Camera, Activity, LogOut, Circle, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import type { EmailAnalyticsEvent } from "@/hooks/useEmailAnalytics";

interface EmailAnalyticsDetailProps {
  analytics: EmailAnalyticsEvent[];
}

export const EmailAnalyticsDetail = ({ analytics }: EmailAnalyticsDetailProps) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'open': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'click': return <MousePointer className="h-4 w-4 text-green-500" />;
      case 'screenshot': return <Camera className="h-4 w-4 text-orange-500" />;
      case 'time_spent': return <Clock className="h-4 w-4 text-primary" />;
      case 'engagement': return <Activity className="h-4 w-4 text-indigo-500" />;
      case 'session_end': return <LogOut className="h-4 w-4 text-gray-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'bounced': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'delete': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getEventDescription = (event: EmailAnalyticsEvent) => {
    switch (event.event_type) {
      case 'open':
        const openCount = analytics.filter(e => e.event_type === 'open' && new Date(e.created_at) <= new Date(event.created_at)).length;
        return `Email Opened #${openCount}`;
      case 'click':
        const clickCount = analytics.filter(e => e.event_type === 'click' && new Date(e.created_at) <= new Date(event.created_at)).length;
        return `Link Clicked #${clickCount}`;
      case 'screenshot':
        const screenshotCount = analytics.filter(e => e.event_type === 'screenshot' && new Date(e.created_at) <= new Date(event.created_at)).length;
        return `Screenshot Taken #${screenshotCount}`;
      case 'time_spent':
        return 'Time Tracking';
      case 'engagement':
        return 'Engagement Activity';
      case 'session_end':
        return 'Session Ended';
      case 'delete':
        return 'Email Deleted';
      default:
        return event.event_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const sortedAnalytics = analytics.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Detailed Email Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedAnalytics.length > 0 ? (
            <div className="space-y-3">
              {sortedAnalytics.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg bg-card/50 hover:bg-card/80 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getEventIcon(event.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">
                        {getEventDescription(event)}
                      </p>
                      <time className="text-xs text-muted-foreground">
                        {format(new Date(event.created_at), 'MMM dd, HH:mm:ss')}
                      </time>
                    </div>
                    
                    {event.event_data && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        <div className="flex flex-wrap gap-3">
                          {event.event_data.screenResolution && (
                            <span className="inline-flex items-center gap-1">
                              📺 {event.event_data.screenResolution}
                            </span>
                          )}
                          {event.event_data.platform && (
                            <span className="inline-flex items-center gap-1">
                              💻 {event.event_data.platform}
                            </span>
                          )}
                          {event.event_data.language && (
                            <span className="inline-flex items-center gap-1">
                              🌐 {event.event_data.language}
                            </span>
                          )}
                          {event.event_data.scrollPercent && (
                            <span className="inline-flex items-center gap-1">
                              📜 {event.event_data.scrollPercent}% scrolled
                            </span>
                          )}
                          {event.event_data.timeSpent && (
                            <span className="inline-flex items-center gap-1">
                              ⏱️ {event.event_data.timeSpent}s
                            </span>
                          )}
                          {event.event_data.attempt && (
                            <span className="inline-flex items-center gap-1">
                              🔢 Attempt #{event.event_data.attempt}
                            </span>
                          )}
                          {event.event_data.mobile && (
                            <span className="inline-flex items-center gap-1">
                              📱 Mobile
                            </span>
                          )}
                          {event.event_data.targetUrl && (
                            <span className="inline-flex items-center gap-1 max-w-xs truncate">
                              🔗 {event.event_data.targetUrl}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {event.user_agent && (
                      <div className="mt-1 text-xs text-muted-foreground truncate">
                        User Agent: {event.user_agent}
                      </div>
                    )}
                    
                    {event.ip_address && event.ip_address !== 'unknown' && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        IP: {event.ip_address}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No tracking events recorded yet</p>
              <p className="text-sm mt-1">Events will appear here when recipients interact with the email</p>
              <div className="mt-4 text-xs">
                <p>Tracked events include:</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  <span className="px-2 py-1 bg-muted rounded">Opens</span>
                  <span className="px-2 py-1 bg-muted rounded">Clicks</span>
                  <span className="px-2 py-1 bg-muted rounded">Screenshots</span>
                  <span className="px-2 py-1 bg-muted rounded">Time Spent</span>
                  <span className="px-2 py-1 bg-muted rounded">Engagement</span>
                  <span className="px-2 py-1 bg-muted rounded">Deletes</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};