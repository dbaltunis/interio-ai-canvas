
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Users, UserPlus, Shield, Mail, Settings, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export const UserManagementTab = () => {
  const [users] = useState([
    { id: 1, name: "John Smith", email: "john@company.com", role: "Admin", status: "Active", phone: "+1 234 567 8900" },
    { id: 2, name: "Sarah Johnson", email: "sarah@company.com", role: "Manager", status: "Active", phone: "+1 234 567 8901" },
    { id: 3, name: "Mike Wilson", email: "mike@company.com", role: "Staff", status: "Inactive", phone: "+1 234 567 8902" },
  ]);

  const [statuses, setStatuses] = useState([
    { id: 1, name: "Draft", color: "gray", category: "Quote", action: "editable", description: "Initial quote creation" },
    { id: 2, name: "Quote", color: "blue", category: "Quote", action: "editable", description: "Quote ready to send" },
    { id: 3, name: "Sent", color: "yellow", category: "Quote", action: "view_only", description: "Quote sent to client" },
    { id: 4, name: "Order", color: "green", category: "Project", action: "locked", description: "Quote accepted, job locked" },
    { id: 5, name: "In Progress", color: "orange", category: "Project", action: "progress_only", description: "Work in progress" },
    { id: 6, name: "Completed", color: "green", category: "Project", action: "completed", description: "Job completed" },
    { id: 7, name: "Lost Order", color: "red", category: "Quote", action: "requires_reason", description: "Quote lost, reason required" },
  ]);

  const [editingStatus, setEditingStatus] = useState<any>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const handleEditStatus = (status: any) => {
    setEditingStatus({ ...status });
    setIsStatusDialogOpen(true);
  };

  const handleSaveStatus = () => {
    if (editingStatus) {
      setStatuses(prev => prev.map(s => s.id === editingStatus.id ? editingStatus : s));
      setIsStatusDialogOpen(false);
      setEditingStatus(null);
    }
  };

  const handleAddStatus = () => {
    const newStatus = {
      id: Date.now(),
      name: "New Status",
      color: "blue",
      category: "Quote",
      action: "editable",
      description: ""
    };
    setEditingStatus(newStatus);
    setIsStatusDialogOpen(true);
  };

  const colorOptions = [
    { value: "gray", label: "Gray", class: "bg-gray-500" },
    { value: "blue", label: "Blue", class: "bg-blue-500" },
    { value: "green", label: "Green", class: "bg-green-500" },
    { value: "yellow", label: "Yellow", class: "bg-yellow-500" },
    { value: "orange", label: "Orange", class: "bg-orange-500" },
    { value: "red", label: "Red", class: "bg-red-500" },
    { value: "purple", label: "Purple", class: "bg-purple-500" },
  ];

  const actionOptions = [
    { value: "editable", label: "Editable", description: "Job can be fully edited" },
    { value: "view_only", label: "View Only", description: "Job can only be viewed" },
    { value: "locked", label: "Locked", description: "Job is locked, requires status change to edit" },
    { value: "progress_only", label: "Progress Only", description: "Only progress updates allowed" },
    { value: "completed", label: "Completed", description: "Job is completed" },
    { value: "requires_reason", label: "Requires Reason", description: "Status change requires reason input" },
  ];

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
              Configure project and quote statuses with actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">System Statuses</h4>
              <Button size="sm" onClick={handleAddStatus}>
                <Plus className="h-4 w-4 mr-2" />
                Add Status
              </Button>
            </div>
            
            <div className="space-y-3">
              {statuses.map((status) => (
                <div key={status.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full bg-${status.color}-500`} />
                    <div>
                      <div className="font-medium text-sm">{status.name}</div>
                      <div className="text-xs text-muted-foreground">{status.category}</div>
                      <div className="text-xs text-muted-foreground">Action: {status.action.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditStatus(status)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Edit Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingStatus?.id && statuses.find(s => s.id === editingStatus.id) ? 'Edit Status' : 'Add New Status'}
            </DialogTitle>
            <DialogDescription>
              Configure the status name, color, and behavior in the application
            </DialogDescription>
          </DialogHeader>
          
          {editingStatus && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status Name</Label>
                <Input 
                  value={editingStatus.name}
                  onChange={(e) => setEditingStatus({...editingStatus, name: e.target.value})}
                  placeholder="Enter status name"
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <Select value={editingStatus.color} onValueChange={(value) => setEditingStatus({...editingStatus, color: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${color.class}`} />
                          <span>{color.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editingStatus.category} onValueChange={(value) => setEditingStatus({...editingStatus, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quote">Quote</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Action Behavior</Label>
                <Select value={editingStatus.action} onValueChange={(value) => setEditingStatus({...editingStatus, action: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionOptions.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        <div>
                          <div className="font-medium">{action.label}</div>
                          <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={editingStatus.description}
                  onChange={(e) => setEditingStatus({...editingStatus, description: e.target.value})}
                  placeholder="Describe when this status is used"
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveStatus}>
                  Save Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
