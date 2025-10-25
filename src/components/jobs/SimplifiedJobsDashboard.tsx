import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Users, 
  DollarSign, 
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Target
} from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useQuotes } from "@/hooks/useQuotes";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useClients } from "@/hooks/useClients";
import { formatJobNumber } from "@/lib/format-job-number";
import { useShopifyIntegrationReal } from "@/hooks/useShopifyIntegrationReal";
import { ShopifyConnectionCTA } from "@/components/dashboard/ShopifyConnectionCTA";
import { ShopifyAnalyticsCard } from "@/components/dashboard/ShopifyAnalyticsCard";
import { ShopifyIntegrationDialog } from "@/components/library/ShopifyIntegrationDialog";

export const SimplifiedJobsDashboard = () => {
  const [showShopifyDialog, setShowShopifyDialog] = useState(false);
  const { data: projects = [] } = useProjects();
  const { data: quotes = [] } = useQuotes();
  const { data: stats } = useDashboardStats();
  const { data: clients = [] } = useClients();
  const { integration, isLoading: isLoadingIntegration } = useShopifyIntegrationReal();

  // Calculate metrics based on projects (not quotes)
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const planningProjects = projects.filter(p => p.status === 'planning').length;

  // Quote-related metrics
  const totalQuoteVersions = quotes.length;
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;
  const sentQuotes = quotes.filter(q => q.status === 'sent').length;
  const totalRevenue = quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + (q.total_amount || 0), 0);

  // Recent projects and their quotes
  const recentProjects = projects.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Shopify Integration */}
      {!isLoadingIntegration && (
        integration?.shop_domain ? (
          <ShopifyAnalyticsCard />
        ) : (
          <ShopifyConnectionCTA onConnect={() => setShowShopifyDialog(true)} />
        )
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="w-4 h-4 mr-2 text-primary" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeProjects} in progress • {completedProjects} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <FileText className="w-4 h-4 mr-2 text-blue-600" />
              Quote Versions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalQuoteVersions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {sentQuotes} sent • {acceptedQuotes} accepted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              From accepted quotes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="w-4 h-4 mr-2 text-orange-600" />
              Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{clients.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active customer base
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentProjects.map((project) => {
              const projectQuotes = quotes.filter(q => q.project_id === project.id);
              const clientName = clients.find(c => c.id === project.client_id)?.name || 'No Client';
              
              return (
                <div key={project.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Target className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Job #{formatJobNumber(project.job_number || `JOB-${project.id}`)} • {clientName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {projectQuotes.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {projectQuotes.length} quote{projectQuotes.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                    
                    <Badge variant={
                      project.status === 'completed' ? 'default' : 
                      project.status === 'in_progress' ? 'secondary' : 'outline'
                    }>
                      {project.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              );
            })}
            
            {recentProjects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No projects found. Create your first project to see it here.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Planning</span>
              <span className="font-medium">{planningProjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">In Progress</span>
              <span className="font-medium">{activeProjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Completed</span>
              <span className="font-medium">{completedProjects}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quote Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Acceptance Rate</span>
              <span className="font-medium">
                {totalQuoteVersions > 0 ? `${Math.round((acceptedQuotes / totalQuoteVersions) * 100)}%` : '0%'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Avg Project Value</span>
              <span className="font-medium">
                ${acceptedQuotes > 0 ? Math.round(totalRevenue / acceptedQuotes).toLocaleString() : '0'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">New Projects</span>
              <span className="font-medium">{totalProjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Revenue Goal</span>
              <span className="font-medium text-green-600">
                ${Math.min(totalRevenue, 25000).toLocaleString()}/25k
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shopify Integration Dialog */}
      <ShopifyIntegrationDialog 
        open={showShopifyDialog} 
        onOpenChange={setShowShopifyDialog} 
      />
    </div>
  );
};