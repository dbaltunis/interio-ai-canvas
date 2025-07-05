import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Send, CheckCircle, Eye, MousePointer, AlertCircle } from "lucide-react";

interface EmailTimelineProps {
  email: {
    sent_at?: string;
    delivered_at?: string;
    opened_at?: string;
    clicked_at?: string;
    open_count: number;
    click_count: number;
    status: string;
    bounce_reason?: string;
  };
}

export const EmailTimeline = ({ email }: EmailTimelineProps) => {
  // Create timeline events
  const timelineEvents = [];

  if (email.sent_at) {
    timelineEvents.push({
      timestamp: email.sent_at,
      label: "Email Sent",
      icon: Send,
      color: "bg-blue-500"
    });
  }

  if (email.delivered_at) {
    timelineEvents.push({
      timestamp: email.delivered_at,
      label: "Delivered",
      icon: CheckCircle,
      color: "bg-green-500"
    });
  }

  if (email.opened_at) {
    timelineEvents.push({
      timestamp: email.opened_at,
      label: "First Opened",
      icon: Eye,
      color: "bg-purple-500",
      badge: email.open_count > 1 ? `${email.open_count} total opens` : undefined
    });
  }

  if (email.clicked_at) {
    timelineEvents.push({
      timestamp: email.clicked_at,
      label: "First Clicked",
      icon: MousePointer,
      color: "bg-orange-500",
      badge: email.click_count > 1 ? `${email.click_count} total clicks` : undefined
    });
  }

  if (email.bounce_reason) {
    timelineEvents.push({
      timestamp: email.sent_at || new Date().toISOString(),
      label: email.bounce_reason.includes('temporarily deferred') ? "Delivery Delayed" : "Delivery Failed",
      icon: AlertCircle,
      color: email.bounce_reason.includes('temporarily deferred') ? "bg-yellow-500" : "bg-red-500",
      description: email.bounce_reason
    });
  }

  // Sort by timestamp
  timelineEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (timelineEvents.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Email Timeline
      </h4>
      
      <div className="relative">
        {timelineEvents.map((event, index) => {
          const Icon = event.icon;
          const isLast = index === timelineEvents.length - 1;
          
          return (
            <div key={index} className="relative flex items-start gap-4 pb-4">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-2 top-8 w-0.5 h-8 bg-gray-200"></div>
              )}
              
              {/* Icon */}
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${event.color} flex-shrink-0 mt-0.5`}>
                <Icon className="h-2.5 w-2.5 text-white" />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{event.label}</span>
                  {event.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {event.badge}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-600">
                  {new Date(event.timestamp).toLocaleString()}
                </div>
                {event.description && (
                  <div className="text-xs text-gray-700 mt-1 p-2 bg-gray-50 rounded">
                    {event.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Open Tracking */}
      {email.open_count > 1 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800">Multiple Opens Detected</span>
          </div>
          <p className="text-sm text-blue-700">
            This email has been opened <strong>{email.open_count} times</strong>. 
            This suggests strong recipient engagement with your content.
          </p>
        </div>
      )}
    </div>
  );
};