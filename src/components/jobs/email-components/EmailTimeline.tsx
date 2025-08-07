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
  // Generate dynamic engagement recommendations based on open count
  const getEngagementInsight = (openCount: number) => {
    if (openCount === 0) {
      return {
        message: "Email hasn't been opened yet.",
        recommendation: "Consider sending a follow-up email or checking if the email address is correct.",
        level: "none",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        textColor: "text-gray-700",
        iconColor: "text-gray-500"
      };
    } else if (openCount === 1) {
      return {
        message: "Email was opened once.",
        recommendation: "Client showed initial interest. Consider a gentle follow-up in a few days.",
        level: "initial",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200", 
        textColor: "text-blue-700",
        iconColor: "text-blue-600"
      };
    } else if (openCount === 2) {
      return {
        message: "Email was opened 2 times.",
        recommendation: "Client is interested! This is a good time for a follow-up call or email.",
        level: "interested", 
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-700",
        iconColor: "text-green-600"
      };
    } else if (openCount >= 3 && openCount <= 5) {
      return {
        message: `Email was opened ${openCount} times.`,
        recommendation: "Strong interest detected! Client is actively engaged. Follow up immediately if deal isn't closed yet.",
        level: "strong",
        bgColor: "bg-orange-50", 
        borderColor: "border-orange-200",
        textColor: "text-orange-700",
        iconColor: "text-orange-600"
      };
    } else if (openCount >= 6 && openCount <= 10) {
      return {
        message: `Email was opened ${openCount} times.`,
        recommendation: "Very high interest! Client is highly engaged. This is an excellent opportunity - reach out now!",
        level: "very-high",
        bgColor: "bg-primary/5",
        borderColor: "border-primary/20", 
        textColor: "text-primary",
        iconColor: "text-primary"
      };
    } else {
      return {
        message: `Email was opened ${openCount} times.`,
        recommendation: "Exceptional engagement! Client is extremely interested. This is a hot lead - contact immediately!",
        level: "exceptional",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-700", 
        iconColor: "text-red-600"
      };
    }
  };

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
      color: "bg-primary",
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

      {/* Dynamic Engagement Insights */}
      {(() => {
        const insight = getEngagementInsight(email.open_count);
        return (
          <div className={`mt-4 p-4 rounded-lg border ${insight.bgColor} ${insight.borderColor}`}>
            <div className="flex items-center gap-2 mb-3">
              <Eye className={`h-4 w-4 ${insight.iconColor}`} />
              <span className={`font-medium ${insight.textColor}`}>Engagement Analysis</span>
            </div>
            <div className="space-y-2">
              <p className={`text-sm font-medium ${insight.textColor}`}>
                {insight.message}
              </p>
              <p className={`text-sm ${insight.textColor}`}>
                <strong>Recommendation:</strong> {insight.recommendation}
              </p>
            </div>
          </div>
        );
      })()}
    </div>
  );
};