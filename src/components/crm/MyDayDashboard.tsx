import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useClients } from "@/hooks/useClients";
import { useFormattedCurrency } from "@/hooks/useFormattedCurrency";
import { formatDistanceToNow, isToday, isPast, isFuture, addDays } from "date-fns";
import { 
  Star, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Mail, 
  Phone, 
  MessageSquare,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Building2,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FUNNEL_STAGES } from "@/constants/clientConstants";

interface MyDayDashboardProps {
  onClientClick?: (clientId: string) => void;
}

export const MyDayDashboard = ({ onClientClick }: MyDayDashboardProps) => {
  const { data: clients } = useClients();
  const { formatCurrency } = useFormattedCurrency();

  // Calculate different client categories
  const { hotLeads, overdueFollowUps, todaysTasks, thisWeekTasks, recentActivity, stats } = useMemo(() => {
    if (!clients) return { 
      hotLeads: [], 
      overdueFollowUps: [], 
      todaysTasks: [], 
      thisWeekTasks: [],
      recentActivity: [],
      stats: { pipelineValue: 0, newLeadsThisWeek: 0, conversionRate: 0 }
    };

    const now = new Date();
    const weekAgo = addDays(now, -7);
    const weekAhead = addDays(now, 7);

    // Hot leads (score >= 70)
    const hot = clients
      .filter(c => c.lead_score && c.lead_score >= 70 && c.funnel_stage !== 'client' && c.funnel_stage !== 'lost')
      .sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0))
      .slice(0, 5);

    // Overdue follow-ups
    const overdue = clients
      .filter(c => c.follow_up_date && isPast(new Date(c.follow_up_date)) && !isToday(new Date(c.follow_up_date)))
      .sort((a, b) => new Date(a.follow_up_date!).getTime() - new Date(b.follow_up_date!).getTime())
      .slice(0, 5);

    // Today's tasks
    const today = clients
      .filter(c => c.follow_up_date && isToday(new Date(c.follow_up_date)))
      .slice(0, 5);

    // This week's upcoming
    const thisWeek = clients
      .filter(c => {
        if (!c.follow_up_date) return false;
        const date = new Date(c.follow_up_date);
        return isFuture(date) && date <= weekAhead && !isToday(date);
      })
      .sort((a, b) => new Date(a.follow_up_date!).getTime() - new Date(b.follow_up_date!).getTime())
      .slice(0, 5);

    // Recent activity
    const recent = clients
      .filter(c => c.last_activity_date)
      .sort((a, b) => new Date(b.last_activity_date!).getTime() - new Date(a.last_activity_date!).getTime())
      .slice(0, 5);

    // Stats
    const pipelineValue = clients
      .filter(c => c.funnel_stage !== 'client' && c.funnel_stage !== 'lost')
      .reduce((sum, c) => sum + (c.deal_value || 0), 0);
    
    const newLeadsThisWeek = clients.filter(c => 
      c.created_at && new Date(c.created_at) >= weekAgo
    ).length;

    const totalClients = clients.filter(c => c.funnel_stage === 'client').length;
    const totalLeads = clients.filter(c => c.funnel_stage !== 'client' && c.funnel_stage !== 'lost').length;
    const conversionRate = totalLeads > 0 ? Math.round((totalClients / (totalClients + totalLeads)) * 100) : 0;

    return {
      hotLeads: hot,
      overdueFollowUps: overdue,
      todaysTasks: today,
      thisWeekTasks: thisWeek,
      recentActivity: recent,
      stats: { pipelineValue, newLeadsThisWeek, conversionRate }
    };
  }, [clients]);

  const ClientRow = ({ client, showAction = true }: { client: any; showAction?: boolean }) => {
    const displayName = client.client_type === 'B2B' ? client.company_name : client.name;
    const initials = displayName?.substring(0, 2).toUpperCase() || 'CL';
    const stage = FUNNEL_STAGES.find(s => s.value === client.funnel_stage);

    return (
      <div 
        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
        onClick={() => onClientClick?.(client.id)}
      >
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {client.client_type === 'B2B' ? (
              <Building2 className="h-3 w-3 text-blue-600 flex-shrink-0" />
            ) : (
              <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-sm font-medium truncate">{displayName}</span>
            {client.lead_score && client.lead_score >= 70 && (
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {stage && (
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", stage.color)}>
                {stage.label}
              </Badge>
            )}
            {client.deal_value && client.deal_value > 0 && (
              <span className="flex items-center gap-0.5">
                <DollarSign className="h-2.5 w-2.5" />
                {formatCurrency(client.deal_value)}
              </span>
            )}
          </div>
        </div>

        {showAction && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {client.email && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `mailto:${client.email}`;
                }}
              >
                <Mail className="h-3.5 w-3.5" />
              </Button>
            )}
            {client.phone && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}`, '_blank');
                }}
              >
                <MessageSquare className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pipeline Value</p>
                <p className="text-lg font-bold">{formatCurrency(stats.pipelineValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">New This Week</p>
                <p className="text-lg font-bold">{stats.newLeadsThisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
                <p className="text-lg font-bold">{stats.conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left column */}
        <div className="space-y-4">
          {/* Overdue Follow-ups */}
          {overdueFollowUps.length > 0 && (
            <Card className="border-destructive/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  Overdue Follow-ups ({overdueFollowUps.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {overdueFollowUps.map(client => (
                    <ClientRow key={client.id} client={client} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Today's Tasks */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-yellow-600" />
                Today's Tasks ({todaysTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {todaysTasks.length > 0 ? (
                <div className="space-y-1">
                  {todaysTasks.map(client => (
                    <ClientRow key={client.id} client={client} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No tasks scheduled for today
                </p>
              )}
            </CardContent>
          </Card>

          {/* This Week */}
          {thisWeekTasks.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Coming Up This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {thisWeekTasks.map(client => (
                    <ClientRow key={client.id} client={client} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Hot Leads */}
          <Card className="border-yellow-200 bg-yellow-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                Hot Leads ({hotLeads.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {hotLeads.length > 0 ? (
                <div className="space-y-1">
                  {hotLeads.map(client => (
                    <ClientRow key={client.id} client={client} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No hot leads at the moment
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {recentActivity.length > 0 ? (
                <div className="space-y-1">
                  {recentActivity.map(client => (
                    <div key={client.id} className="flex items-center justify-between">
                      <ClientRow client={client} showAction={false} />
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(client.last_activity_date!), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No recent activity
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
