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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Team Members</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Invitations</p>
              <p className="text-2xl font-bold">{pendingInvitations}</p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold">{users.filter(u => u.status === 'available').length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Roles Distribution</p>
            <div className="space-y-1">
              {Object.entries(roleStats).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {role}
                  </Badge>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};