import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUsers } from "@/hooks/useUsers";
import { useUserInvitations } from "@/hooks/useUserInvitations";
import { Users, UserPlus, Clock, CheckCircle } from "lucide-react";

export const TeamOverview = () => {
  const { data: users = [] } = useUsers();
  const { data: invitations = [] } = useUserInvitations();

  const roleStats = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending').length;
  const activeUsers = users.filter(user => user.status === 'Active').length;
  const totalUsers = users.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Overview
        </CardTitle>
        <CardDescription>
          Quick overview of your team structure and status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold">{activeUsers}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Invites</p>
              <p className="text-2xl font-bold">{pendingInvitations}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserPlus className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Roles</p>
              <p className="text-2xl font-bold">{Object.keys(roleStats).length}</p>
            </div>
          </div>
        </div>
        
        {Object.keys(roleStats).length > 0 && (
          <div className="mt-4 p-4 bg-background rounded-lg border">
            <p className="text-sm font-medium mb-2">Role Distribution:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(roleStats).map(([role, count]) => (
                <Badge key={role} variant="outline">
                  {role}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};