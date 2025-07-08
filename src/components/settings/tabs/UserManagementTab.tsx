
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar";
import { Users, UserPlus, Shield, Mail, Phone, Settings } from "lucide-react";
import { useState } from "react";

export const UserManagementTab = () => {
  const [users] = useState([
    { id: 1, name: "John Smith", email: "john@company.com", role: "Admin", status: "Active", phone: "+1 234 567 8900" },
    { id: 2, name: "Sarah Johnson", email: "sarah@company.com", role: "Manager", status: "Active", phone: "+1 234 567 8901" },
    { id: 3, name: "Mike Wilson", email: "mike@company.com", role: "Staff", status: "Inactive", phone: "+1 234 567 8902" },
  ]);

  const [statuses] = useState([
    { id: 1, name: "Draft", color: "gray", category: "Quote" },
    { id: 2, name: "Pending", color: "yellow", category: "Quote" },
    { id: 3, name: "Approved", color: "green", category: "Quote" },
    { id: 4, name: "Planning", color: "blue", category: "Project" },
    { id: 5, name: "In Progress", color: "orange", category: "Project" },
    { id: 6, name: "Completed", color: "green", category: "Project" },
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage team members and their permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Team Members</h4>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
            
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.role === 'Admin' ? 'default' : 'outline'} className="text-xs">
                      {user.role}
                    </Badge>
                    <Badge variant={user.status === 'Active' ? 'default' : 'secondary'} className="text-xs">
                      {user.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Status Management
            </CardTitle>
            <CardDescription>
              Configure project and quote statuses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">System Statuses</h4>
              <Button size="sm" variant="outline">
                Add Status
              </Button>
            </div>
            
            <div className="space-y-3">
              {statuses.map((status) => (
                <div key={status.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full bg-${status.color}-500`} />
                    <div>
                      <div className="font-medium text-sm">{status.name}</div>
                      <div className="text-xs text-muted-foreground">{status.category}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Management */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Configure what each role can access and modify
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Admin Permissions</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Manage Users</span>
                  <Badge variant="default">Full Access</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Business Settings</span>
                  <Badge variant="default">Full Access</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>View Reports</span>
                  <Badge variant="default">Full Access</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Manager Permissions</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Manage Projects</span>
                  <Badge variant="default">Full Access</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>View Reports</span>
                  <Badge variant="outline">Read Only</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Business Settings</span>
                  <Badge variant="secondary">No Access</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm">Staff Permissions</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>View Projects</span>
                  <Badge variant="outline">Read Only</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Update Tasks</span>
                  <Badge variant="default">Full Access</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>View Reports</span>
                  <Badge variant="secondary">No Access</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
