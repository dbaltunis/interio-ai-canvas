import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, UserPlus, Mail, Settings } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
}

interface UserListProps {
  users: User[];
  onInviteUser: () => void;
  isLoading?: boolean;
}

export const UserList = ({ users, onInviteUser, isLoading = false }: UserListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Members
        </CardTitle>
        <CardDescription>
          Manage your team members and their access levels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">Active Members ({users.length})</h4>
            <p className="text-sm text-muted-foreground">Users with access to your workspace</p>
          </div>
          <Button onClick={onInviteUser} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite User
          </Button>
        </div>
        
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-sm text-muted-foreground">Loading users...</div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-center">
              <div>
                <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No team members found</p>
                <p className="text-xs text-muted-foreground mt-1">Invite your first team member to get started</p>
              </div>
            </div>
          ) : (
            users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm font-medium">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant={user.role === 'Admin' ? 'default' : 'outline'}>
                  {user.role}
                </Badge>
                <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                  {user.status}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};