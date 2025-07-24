
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Mail, Bell, TrendingUp } from 'lucide-react';
import { useUserPresence } from '@/hooks/useUserPresence';

export default function Index() {
  const location = useLocation();
  const { updatePresence } = useUserPresence(location.pathname);

  useEffect(() => {
    updatePresence(location.pathname);
  }, [location.pathname, updatePresence]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +2 new this week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                Next appointment in 2 hours
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Emails</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                3 urgent responses needed
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">New project created</span>
                  <Badge variant="secondary">2 hours ago</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Client meeting scheduled</span>
                  <Badge variant="secondary">4 hours ago</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Quote sent to client</span>
                  <Badge variant="secondary">1 day ago</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3 hover:bg-gray-50 cursor-pointer">
                  <div className="text-sm font-medium">New Project</div>
                  <div className="text-xs text-gray-500">Start a new project</div>
                </Card>
                <Card className="p-3 hover:bg-gray-50 cursor-pointer">
                  <div className="text-sm font-medium">Add Client</div>
                  <div className="text-xs text-gray-500">Add a new client</div>
                </Card>
                <Card className="p-3 hover:bg-gray-50 cursor-pointer">
                  <div className="text-sm font-medium">Schedule Meeting</div>
                  <div className="text-xs text-gray-500">Book an appointment</div>
                </Card>
                <Card className="p-3 hover:bg-gray-50 cursor-pointer">
                  <div className="text-sm font-medium">Send Quote</div>
                  <div className="text-xs text-gray-500">Create and send quote</div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
