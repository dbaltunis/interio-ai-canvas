
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { useJobStatuses } from "@/hooks/useJobStatuses";

interface JobsStatsCardsProps {
  quotes?: any[];
}

export const JobsStatsCards = ({ quotes }: JobsStatsCardsProps) => {
  const { data: jobStatuses = [] } = useJobStatuses();
  
  // Get dynamic status names by action type
  const approvedStatuses = jobStatuses.filter(s => s.action === 'approve').map(s => s.name.toLowerCase());
  const pendingStatuses = jobStatuses.filter(s => s.action === 'pending' || s.name.toLowerCase().includes('pending')).map(s => s.name.toLowerCase());
  const completedStatuses = jobStatuses.filter(s => s.action === 'complete').map(s => s.name.toLowerCase());
  
  const totalJobs = quotes?.length || 0;
  const activeJobs = quotes?.filter(q => approvedStatuses.includes(q.status?.toLowerCase())).length || 0;
  const pendingJobs = quotes?.filter(q => pendingStatuses.includes(q.status?.toLowerCase())).length || 0;
  const completedJobs = quotes?.filter(q => completedStatuses.includes(q.status?.toLowerCase())).length || 0;
  const thisMonthJobs = quotes?.filter(quote => {
    const createdAt = new Date(quote.created_at);
    const thisMonth = new Date();
    return createdAt.getMonth() === thisMonth.getMonth() && 
           createdAt.getFullYear() === thisMonth.getFullYear();
  }).length || 0;
  
  const totalValue = quotes?.reduce((sum, quote) => sum + (quote.total_amount || 0), 0) || 0;

  const stats = [
    {
      title: "Total Jobs",
      value: totalJobs,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "All time"
    },
    {
      title: "Active Jobs", 
      value: activeJobs,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Currently active"
    },
    {
      title: "Pending",
      value: pendingJobs,
      icon: Clock,
      color: "text-orange-600", 
      bgColor: "bg-orange-50",
      description: "Awaiting approval"
    },
    {
      title: "This Month",
      value: thisMonthJobs,
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/5",
      description: "New this month"
    },
    {
      title: "Total Value",
      value: `$${totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Combined value"
    },
    {
      title: "Completion Rate",
      value: totalJobs > 0 ? `${Math.round((completedJobs / totalJobs) * 100)}%` : "0%",
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      description: "Success rate"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
