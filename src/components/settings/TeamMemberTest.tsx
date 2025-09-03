import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useClients } from "@/hooks/useClients";
import { useQuotes } from "@/hooks/useQuotes";
import { useProjects } from "@/hooks/useProjects";
import { useUsers } from "@/hooks/useUsers";
import { useCurrentUserProfile } from "@/hooks/useUserProfile";
import { Users, Briefcase, FileText, Building } from "lucide-react";

export const TeamMemberTest = () => {
  const { data: profile } = useCurrentUserProfile();
  const { data: users = [] } = useUsers();
  const { data: clients = [] } = useClients();
  const { data: quotes = [] } = useQuotes();
  const { data: projects = [] } = useProjects();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Data Access Test
        </CardTitle>
        <CardDescription>
          This shows what data the current user can access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Team Members</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Building className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm font-medium">Clients</p>
              <p className="text-2xl font-bold">{clients.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <FileText className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm font-medium">Quotes</p>
              <p className="text-2xl font-bold">{quotes.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Briefcase className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm font-medium">Projects</p>
              <p className="text-2xl font-bold">{projects.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-background p-4 rounded-lg border">
          <h4 className="font-medium mb-2">Current User Info:</h4>
          <div className="space-y-1 text-sm">
            <p><strong>Name:</strong> {profile?.display_name || 'Unknown'}</p>
            <p><strong>Role:</strong> {profile?.role || 'Unknown'}</p>
            <p><strong>Status:</strong> {profile?.is_active ? 'Active' : 'Inactive'}</p>
            <p><strong>Account Type:</strong> {profile?.parent_account_id === profile?.user_id ? 'Account Owner' : 'Team Member'}</p>
          </div>
        </div>
        
        {users.length > 0 && (
          <div className="bg-background p-4 rounded-lg border">
            <h4 className="font-medium mb-2">Team Members:</h4>
            <div className="space-y-1 text-sm">
              {users.map((user) => (
                <p key={user.id}>
                  <strong>{user.name}</strong> - {user.role} ({user.status})
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};