
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  Plus, 
  Mail, 
  Phone, 
  Shield, 
  Edit, 
  Trash2,
  UserCheck,
  UserX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTeamMembers, useCreateTeamMember } from "@/hooks/useTeamMembers";

export const TeamManagementTab = () => {
  const { toast } = useToast();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const { data: teamMembers, isLoading } = useTeamMembers();
  const createTeamMember = useCreateTeamMember();

  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    skills: [] as string[],
    hourly_rate: 0
  });

  const roles = [
    { value: "admin", label: "Administrator", description: "Full access to all features" },
    { value: "manager", label: "Manager", description: "Manage quotes, orders, and team" },
    { value: "installer", label: "Installer", description: "Access to work orders and schedules" },
    { value: "sales", label: "Sales", description: "Create quotes and manage clients" },
    { value: "viewer", label: "Viewer", description: "Read-only access to reports" }
  ];

  const permissions = {
    admin: ["all"],
    manager: ["quotes", "orders", "clients", "reports", "team_view"],
    installer: ["work_orders", "schedules", "materials"],
    sales: ["quotes", "clients", "appointments"],
    viewer: ["reports_view"]
  };

  const handleInviteMember = () => {
    if (!newMember.name || !newMember.email || !newMember.role) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    createTeamMember.mutate(newMember, {
      onSuccess: () => {
        setNewMember({ name: "", email: "", phone: "", role: "", skills: [], hourly_rate: 0 });
        setShowInviteForm(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-brand-primary">Team Management</h3>
          <p className="text-sm text-brand-neutral">Invite team members and manage permissions</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Step 2 of 6
          </Badge>
          <Button 
            onClick={() => setShowInviteForm(true)}
            className="bg-brand-primary hover:bg-brand-accent"
          >
            <Plus className="h-4 w-4 mr-2" />
            Invite Team Member
          </Button>
        </div>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-brand-primary" />
              Invite New Team Member
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="memberName">Full Name *</Label>
                <Input 
                  id="memberName" 
                  value={newMember.name}
                  onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  placeholder="John Smith" 
                />
              </div>
              <div>
                <Label htmlFor="memberEmail">Email Address *</Label>
                <Input 
                  id="memberEmail" 
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  placeholder="john@company.com" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="memberPhone">Phone Number</Label>
                <Input 
                  id="memberPhone" 
                  value={newMember.phone}
                  onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                  placeholder="(555) 123-4567" 
                />
              </div>
              <div>
                <Label htmlFor="memberRole">Role *</Label>
                <Select value={newMember.role} onValueChange={(value) => setNewMember({...newMember, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-gray-500">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="hourlyRate">Hourly Rate (Optional)</Label>
              <Input 
                id="hourlyRate" 
                type="number"
                value={newMember.hourly_rate || ""}
                onChange={(e) => setNewMember({...newMember, hourly_rate: parseFloat(e.target.value) || 0})}
                placeholder="25.00" 
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleInviteMember}
                disabled={createTeamMember.isPending}
                className="bg-brand-primary hover:bg-brand-accent"
              >
                {createTeamMember.isPending ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-primary" />
            Team Members
          </CardTitle>
          <CardDescription>
            Manage your team and their access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading team members...</div>
          ) : teamMembers && teamMembers.length > 0 ? (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-gray-500">{member.email}</p>
                      {member.phone && (
                        <p className="text-xs text-gray-400">{member.phone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="capitalize">
                      {member.role}
                    </Badge>
                    {member.hourly_rate && (
                      <span className="text-sm text-gray-500">
                        ${member.hourly_rate}/hr
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      {member.active ? (
                        <UserCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <UserX className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
              <p className="text-gray-500 mb-4">
                Start by inviting your first team member to collaborate on projects
              </p>
              <Button 
                onClick={() => setShowInviteForm(true)}
                className="bg-brand-primary hover:bg-brand-accent"
              >
                <Plus className="h-4 w-4 mr-2" />
                Invite Your First Team Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-brand-primary" />
            Permission Levels
          </CardTitle>
          <CardDescription>
            Understanding what each role can access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {roles.map((role) => (
              <div key={role.value} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium capitalize">{role.label}</h4>
                  <Badge variant="outline">{role.value}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                <div className="flex flex-wrap gap-1">
                  {permissions[role.value as keyof typeof permissions]?.map((permission) => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {permission.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
