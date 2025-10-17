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
  Download,
  MoreHorizontal,
  Star
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
      changeType: "positive" as const,
      icon: Users,
      bgGradient: "from-blue-500/10 to-cyan-500/10",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600"
    },
    {
      title: "Hot Leads",
      value: hotLeads,
      subtitle: `${warmLeads} warm leads`,
      icon: TrendingUp,
      changeType: "neutral" as const,
      bgGradient: "from-green-500/10 to-emerald-500/10",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-600"
    },
    {
      title: "Activities This Week",
      value: totalActivities,
      change: "+23%",
      changeType: "positive" as const,
      icon: Activity,
      bgGradient: "from-purple-500/10 to-pink-500/10",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-600"
    },
    {
      title: "Follow-ups Due",
      value: clients.filter(c => c.follow_up_date).length,
      changeType: "neutral" as const,
      icon: Calendar,
      bgGradient: "from-orange-500/10 to-amber-500/10",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-600"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="p-8 space-y-8 animate-fade-in max-w-[1600px] mx-auto">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-1 bg-gradient-to-b from-primary to-accent rounded-full" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  CRM Dashboard
                </h1>
                <p className="text-muted-foreground mt-1 text-base">
                  Manage your clients and deals in one unified workspace
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2 hover:bg-muted/50 transition-all">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2 hover:bg-muted/50 transition-all">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </div>
        </div>

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, i) => (
            <Card 
              key={i} 
              className={cn(
                "group relative overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer",
                "bg-gradient-to-br", stat.bgGradient,
                "hover:scale-[1.02] animate-slide-up"
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "p-3 rounded-xl transition-all duration-300",
                    stat.iconBg,
                    "group-hover:scale-110 group-hover:rotate-3"
                  )}>
                    <stat.icon className={cn("h-5 w-5", stat.iconColor)} />
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background/50 rounded-lg">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-3">
                    <h3 className="text-4xl font-bold text-foreground tracking-tight">
                      {stat.value}
                    </h3>
                    {stat.change && (
                      <span className={cn(
                        "text-xs font-semibold px-2.5 py-1 rounded-full",
                        stat.changeType === "positive" && "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
                        stat.changeType === "neutral" && "bg-muted text-muted-foreground"
                      )}>
                        {stat.change}
                      </span>
                    )}
                  </div>
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {stat.subtitle}
                    </p>
                  )}
                </div>
              </CardContent>
              
              {/* Subtle hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-background/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* Interactive Table Section */}
        <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader className="border-b bg-gradient-to-r from-muted/30 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <CardTitle className="text-2xl font-bold">Client Pipeline</CardTitle>
              </div>
              <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-auto">
                <TabsList className="bg-muted/50 p-1">
                  <TabsTrigger value="table" className="text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    Table View
                  </TabsTrigger>
                  <TabsTrigger value="kanban" className="text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                    Kanban
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activeView === 'table' ? (
              <div className="animate-fade-in">
                <InteractiveCRMTable />
              </div>
            ) : (
              <div className="p-24 text-center animate-fade-in">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
                  <Activity className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Kanban View Coming Soon</h3>
                <p className="text-muted-foreground">We're working on bringing you a beautiful kanban board experience</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};