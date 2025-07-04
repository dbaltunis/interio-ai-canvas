
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Mail,
  Loader2
} from "lucide-react";

interface EmailKPIsProps {
  kpis: {
    totalSent: number;
    delivered: number;
    bounced: number;
    openRate: number;
    clickRate: number;
    deliveryRate: number;
    avgTimeSpent: string;
    totalOpenCount: number;
    totalClickCount: number;
  } | undefined;
}

export const EmailKPIsDashboard = ({ kpis }: EmailKPIsProps) => {
  if (!kpis) return null;

  const kpiCards = [
    {
      title: "Total Sent",
      value: kpis.totalSent,
      icon: Send,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Total emails sent"
    },
    {
      title: "Delivered",
      value: kpis.delivered,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Successfully delivered"
    },
    {
      title: "Open Rate",
      value: `${kpis.openRate}%`,
      icon: Eye,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Emails opened"
    },
    {
      title: "Total Opens",
      value: kpis.totalOpenCount,
      icon: Mail,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      description: "Number of times opened"
    },
    {
      title: "Avg Reading Time",
      value: kpis.avgTimeSpent,
      icon: Clock,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "Time spent reading"
    },
    {
      title: "Issues",
      value: kpis.bounced,
      icon: AlertTriangle,
      color: kpis.bounced > 0 ? "text-red-600" : "text-gray-600",
      bgColor: kpis.bounced > 0 ? "bg-red-50" : "bg-gray-50",
      description: "Bounced or failed"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Main KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((kpi) => {
          const IconComponent = kpi.icon;
          const numericValue = typeof kpi.value === 'number' ? kpi.value : 0;
          return (
            <Card key={kpi.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                    <IconComponent className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                  {kpi.title === "Issues" && numericValue > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      Action Needed
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-xs font-medium text-gray-900">{kpi.title}</p>
                  <p className="text-xs text-gray-500">{kpi.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Email Performance Summary</h4>
              <p className="text-sm text-gray-600">
                {kpis.deliveryRate >= 95 ? "Excellent" : 
                 kpis.deliveryRate >= 85 ? "Good" : "Needs Improvement"} delivery rate • 
                {kpis.openRate >= 25 ? "Excellent" :
                 kpis.openRate >= 15 ? "Good" : 
                 kpis.openRate >= 10 ? "Average" : "Low"} engagement • 
                {kpis.bounced === 0 ? "No delivery issues" : `${kpis.bounced} emails need attention`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
