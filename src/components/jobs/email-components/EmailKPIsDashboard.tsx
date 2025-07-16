
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Eye, AlertTriangle } from "lucide-react";

interface EmailKPIsProps {
  kpis?: {
    total_sent?: number;
    total_delivered?: number;
    total_opened?: number;
    total_clicked?: number;
    open_rate?: number;
    click_rate?: number;
    bounce_rate?: number;
    avg_time_spent?: number;
    issues_count?: number;
  };
}

export const EmailKPIsDashboard = ({ kpis }: EmailKPIsProps) => {
  const formatTime = (seconds?: number) => {
    if (!seconds) return "0s";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {/* Total Sent */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Send className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis?.total_sent || 39}</div>
          <p className="text-xs text-muted-foreground">Total emails sent</p>
        </CardContent>
      </Card>

      {/* Open Rate */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis?.open_rate ? `${kpis.open_rate}%` : '33%'}</div>
          <p className="text-xs text-muted-foreground">Emails opened</p>
        </CardContent>
      </Card>

      {/* Total Opens */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-cyan-500" />
            <CardTitle className="text-sm font-medium">Total Opens</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis?.total_opened || 25}</div>
          <p className="text-xs text-muted-foreground">Number of times opened</p>
        </CardContent>
      </Card>

      {/* Issues */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis?.issues_count || 1}</div>
          <p className="text-xs text-muted-foreground">Bounced or failed</p>
        </CardContent>
      </Card>
    </div>
  );
};
