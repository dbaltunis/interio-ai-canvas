import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, UserPlus, Mail, Settings, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { EditUserDialog } from "./EditUserDialog";
import { useDeleteUser } from "@/hooks/useUpdateUser";

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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const deleteUser = useDeleteUser();

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Are you sure you want to remove this user? This action cannot be undone.")) {
      await deleteUser.mutateAsync(userId);
    }
  };
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
                <Badge variant={user.role === 'Admin' ? 'default' : user.role === 'Manager' ? 'secondary' : 'outline'}>
                  {user.role}
                </Badge>
                <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                  {user.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingUser(user)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            ))
          )}
        </div>
        
        <EditUserDialog 
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
        />
      </CardContent>
    </Card>
  );
};