import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Users, UserPlus, Mail, Settings, Edit, Trash2, MoreHorizontal, TrendingUp, Clock } from "lucide-react";
import { EditUserDialog } from "./EditUserDialog";
import { UserSearchFilter } from "./UserSearchFilter";
import { BulkUserActions } from "./BulkUserActions";
import { useDeleteUser } from "@/hooks/useUpdateUser";
import { useUserFilters } from "@/hooks/useUserFilters";
import { useBulkUserSelection } from "@/hooks/useBulkUserSelection";
import { ErrorBoundary } from "@/components/performance/ErrorBoundary";

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
  
  const {
    filteredUsers,
    activeFilters,
    stats,
    setSearchTerm,
    setRoleFilter,
    setStatusFilter,
  } = useUserFilters(users);

  const {
    selectedUsers,
    selectUser,
    selectAll,
    clearSelection,
    toggleUser,
    selectionStats,
  } = useBulkUserSelection(filteredUsers);

  const handleDeleteUser = async (userId: string) => {
    try {
      if (confirm("Are you sure you want to remove this user? This action cannot be undone.")) {
        await deleteUser.mutateAsync(userId);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };
  return (
    <ErrorBoundary>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5" />
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage your team members and their access levels
                </CardDescription>
              </div>
            </div>
            <Button onClick={onInviteUser} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Invite User
            </Button>
          </div>
          
          {/* User Stats */}
          <div className="flex gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <TrendingUp className="h-3 w-3" />
                Total: {stats.total}
              </Badge>
              <Badge variant="default">Active: {stats.active}</Badge>
              <Badge variant="secondary">Inactive: {stats.inactive}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <UserSearchFilter
            onSearchChange={setSearchTerm}
            onRoleFilter={setRoleFilter}
            onStatusFilter={setStatusFilter}
            activeFilters={activeFilters}
          />
          
          <BulkUserActions
            users={filteredUsers}
            selectedUsers={selectedUsers}
            onSelectUser={selectUser}
            onSelectAll={selectAll}
            onClearSelection={clearSelection}
          />
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">
                {stats.filtered !== stats.total 
                  ? `Showing ${stats.filtered} of ${stats.total} members`
                  : `Active Members (${stats.total})`
                }
              </h4>
              <p className="text-sm text-muted-foreground">Users with access to your workspace</p>
            </div>
          </div>
        
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-pulse">
                <div className="text-sm text-muted-foreground">Loading users...</div>
              </div>
            </div>
          ) : filteredUsers.length === 0 && users.length > 0 ? (
            <div className="flex items-center justify-center p-8 text-center">
              <div>
                <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No users match your filters</p>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
              </div>
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
            filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                selectedUsers.includes(user.id) ? 'bg-muted/30 border-primary/50' : ''
              }`}
            >
              <Checkbox
                checked={selectedUsers.includes(user.id)}
                onCheckedChange={(checked) => selectUser(user.id, !!checked)}
              />
              <div className="flex items-center justify-between flex-1">
                <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-sm font-medium">
                    {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                  <div>
                    <div className="font-medium">{user.name || 'Unknown User'}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      {user.phone && (
                        <span className="text-xs text-muted-foreground">{user.phone}</span>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Last seen: Recently</span>
                      </div>
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
                    <Button 
                      variant="ghost" 
                      size="sm"
                      disabled={deleteUser.isPending}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingUser(user);
                      }}
                      disabled={false}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(user.id);
                      }}
                      className="text-destructive"
                      disabled={deleteUser.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
    </ErrorBoundary>
  );
};