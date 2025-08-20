import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, UserX, Clock } from "lucide-react";

interface UserManagementStatsProps {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  pendingInvitations: number;
}

export const UserManagementStats = ({ 
  totalUsers, 
  activeUsers, 
  inactiveUsers, 
  pendingInvitations 
}: UserManagementStatsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <UserX className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-sm font-medium">Inactive</p>
              <p className="text-2xl font-bold text-red-600">{inactiveUsers}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{pendingInvitations}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};