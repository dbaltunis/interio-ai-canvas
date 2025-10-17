import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  Calendar,
  Activity,
  Plus,
  Filter,
  Download
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { InteractiveCRMTable } from "../crm/InteractiveCRMTable";
import { useClients } from "@/hooks/useClients";
import { cn } from "@/lib/utils";

export const EnhancedDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: clients = [] } = useClients();
  const [activeView, setActiveView] = useState<'table' | 'kanban'>('table');

  // Calculate activity stats
  const totalActivities = clients.reduce((sum, client) => {
    return sum + (client.last_activity_date ? 1 : 0);
  }, 0);

  const hotLeads = clients.filter(c => (c.lead_score || 0) >= 70).length;
  const warmLeads = clients.filter(c => (c.lead_score || 0) >= 40 && (c.lead_score || 0) < 70).length;

  const quickStats = [
    {
      title: "Total Clients",
      value: clients.length,
      change: "+12%",
      changeType: "positive",
      icon: Users,
    },
    {
      title: "Hot Leads",
      value: hotLeads,
      subtitle: `${warmLeads} warm leads`,
      icon: TrendingUp,
      changeType: "neutral",
    },
    {
      title: "Activities This Week",
      value: totalActivities,
      change: "+23%",
      changeType: "positive",
      icon: Activity,
    },
    {
      title: "Follow-ups Due",
      value: clients.filter(c => c.follow_up_date).length,
      changeType: "neutral",
      icon: Calendar,
    },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Enhanced Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your clients, deals, and activities in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Quick Stats - Compact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => (
          <Card key={i} className="group hover:shadow-md transition-all duration-300 overflow-hidden relative">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </h3>
                    {stat.change && (
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        stat.changeType === "positive" && "bg-green-100 text-green-700",
                        stat.changeType === "negative" && "bg-red-100 text-red-700",
                        stat.changeType === "neutral" && "bg-gray-100 text-gray-700"
                      )}>
                        {stat.change}
                      </span>
                    )}
                  </div>
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                  )}
                </div>
                <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
          </Card>
        ))}
      </div>

      {/* Main Content - Interactive Table */}
      <Card>
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Client Pipeline</CardTitle>
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-auto">
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="table" className="text-xs">Table View</TabsTrigger>
                <TabsTrigger value="kanban" className="text-xs">Kanban</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {activeView === 'table' ? (
            <InteractiveCRMTable />
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              Kanban view coming soon...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};