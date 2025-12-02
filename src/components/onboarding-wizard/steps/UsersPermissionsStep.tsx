import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
  { value: 'installer', label: 'Installer' },
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
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Team Members</Label>
            <Button variant="outline" size="sm" onClick={addUser}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <UserPlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No team members added</p>
              <Button variant="link" onClick={addUser} className="mt-2">
                Add team member
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      placeholder="Name"
                      value={user.name}
                      onChange={(e) => updateUser(index, 'name', e.target.value)}
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={user.email}
                      onChange={(e) => updateUser(index, 'email', e.target.value)}
                    />
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
      </CardContent>
    </Card>
  );
};
