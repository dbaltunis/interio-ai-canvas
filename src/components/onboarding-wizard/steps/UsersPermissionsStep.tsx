import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Trash2, UserPlus } from 'lucide-react';
import type { OnboardingData } from '@/hooks/useOnboardingWizard';

interface StepProps {
  data: OnboardingData;
  updateSection: (section: keyof OnboardingData, data: any) => void;
  isSaving: boolean;
}

const ROLES = [
  { value: 'admin', label: 'Admin', description: 'Full access to all features' },
  { value: 'manager', label: 'Manager', description: 'Can manage jobs, quotes, and team' },
  { value: 'staff', label: 'Staff', description: 'Basic access to assigned work' },
  { value: 'installer', label: 'Installer', description: 'Access to work orders and schedules' },
];

export const UsersPermissionsStep = ({ data, updateSection }: StepProps) => {
  const settings = data.users_permissions || { users: [] };
  const users = settings.users || [];

  const addUser = () => {
    const newUser = { name: '', email: '', role: 'staff' };
    updateSection('users_permissions', { users: [...users, newUser] });
  };

  const updateUser = (index: number, field: string, value: string) => {
    const updated = [...users];
    updated[index] = { ...updated[index], [field]: value };
    updateSection('users_permissions', { users: updated });
  };

  const removeUser = (index: number) => {
    const updated = users.filter((_: any, i: number) => i !== index);
    updateSection('users_permissions', { users: updated });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Team Members
        </CardTitle>
        <CardDescription>
          Add team members who will use the system. Invitations will be sent when you complete setup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role Descriptions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ROLES.map((role) => (
            <div key={role.value} className="p-3 border rounded-lg bg-muted/30">
              <div className="font-medium text-sm">{role.label}</div>
              <div className="text-xs text-muted-foreground">{role.description}</div>
            </div>
          ))}
        </div>

        {/* Users List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Team Members to Invite</Label>
            <Button variant="outline" size="sm" onClick={addUser}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <UserPlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No team members added yet</p>
              <Button variant="link" onClick={addUser} className="mt-2">
                Add your first team member
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <Input
                        placeholder="John Smith"
                        value={user.name}
                        onChange={(e) => updateUser(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <Input
                        type="email"
                        placeholder="john@company.com"
                        value={user.email}
                        onChange={(e) => updateUser(index, 'email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Role</Label>
                      <Select
                        value={user.role}
                        onValueChange={(value) => updateUser(index, 'role', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUser(index)}
                    className="text-destructive hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <strong>Note:</strong> Team members will receive email invitations to join your account.
          You can add more users later in Settings → Team.
        </div>
      </CardContent>
    </Card>
  );
};
