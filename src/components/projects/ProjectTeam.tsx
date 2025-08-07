
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Mail, Phone, Calendar } from "lucide-react";
import { useTeamMembers } from "@/hooks/useTeamMembers";

interface ProjectTeamProps {
  projectId: string;
}

interface ProjectTeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  assignedDate: string;
  skills: string[];
  status: 'active' | 'inactive';
}

export const ProjectTeam = ({ projectId }: ProjectTeamProps) => {
  const { data: allTeamMembers } = useTeamMembers();
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState("");

  // Mock assigned team members - in real implementation, this would come from project assignments
  const [assignedMembers, setAssignedMembers] = useState<ProjectTeamMember[]>([
    {
      id: '1',
      name: 'Sarah Wilson',
      role: 'Project Lead',
      email: 'sarah@company.com',
      phone: '+1 (555) 123-4567',
      assignedDate: new Date().toISOString(),
      skills: ['Project Management', 'Client Relations'],
      status: 'active'
    },
    {
      id: '2',
      name: 'Mike Johnson',
      role: 'Installer',
      email: 'mike@company.com',
      assignedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      skills: ['Installation', 'Measurements'],
      status: 'active'
    }
  ]);

  const handleAddMember = () => {
    if (selectedMember && allTeamMembers) {
      const member = allTeamMembers.find(m => m.id === selectedMember);
      if (member && !assignedMembers.find(am => am.id === member.id)) {
        const newAssignment: ProjectTeamMember = {
          id: member.id,
          name: member.name,
          role: member.role,
          email: member.email || undefined,
          phone: member.phone || undefined,
          assignedDate: new Date().toISOString(),
          skills: member.skills || [],
          status: 'active'
        };
        setAssignedMembers([...assignedMembers, newAssignment]);
        setSelectedMember("");
        setShowAddMember(false);
      }
    }
  };

  const handleRemoveMember = (memberId: string) => {
    setAssignedMembers(assignedMembers.filter(m => m.id !== memberId));
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'project lead': return 'bg-primary/10 text-primary';
      case 'installer': return 'bg-blue-100 text-blue-800';
      case 'measurer': return 'bg-green-100 text-green-800';
      case 'designer': return 'bg-secondary/20 text-secondary-foreground';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Project Team ({assignedMembers.length})
            </CardTitle>
            <Button onClick={() => setShowAddMember(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {assignedMembers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No team members assigned to this project</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignedMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{member.name}</h4>
                        <Badge className={getRoleColor(member.role)}>
                          {member.role}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                        {member.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{member.email}</span>
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Assigned {new Date(member.assignedDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {member.skills.length > 0 && (
                        <div className="flex items-center space-x-1 mt-2">
                          {member.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      {showAddMember && (
        <Card>
          <CardHeader>
            <CardTitle>Add Team Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Team Member</label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a team member..." />
                </SelectTrigger>
                <SelectContent>
                  {allTeamMembers?.filter(member => 
                    !assignedMembers.find(am => am.id === member.id)
                  ).map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleAddMember} disabled={!selectedMember}>
                Add Member
              </Button>
              <Button variant="outline" onClick={() => setShowAddMember(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
