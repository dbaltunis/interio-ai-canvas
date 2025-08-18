import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, UserPlus, Lock, Unlock } from "lucide-react";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useUpdateProject } from "@/hooks/useProjects";
import { useToast } from "@/hooks/use-toast";

interface TeamAssignmentProps {
  project: any;
}

const ROLE_OPTIONS = [
  "Project Manager",
  "Curtain Maker", 
  "Installer",
  "Measurer",
  "Designer",
  "Admin"
];

export const TeamAssignment = ({ project }: TeamAssignmentProps) => {
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isLocked, setIsLocked] = useState(JSON.parse(project.description || '{}').is_locked || false);
  
  const { data: teamMembers = [] } = useTeamMembers();
  const updateProject = useUpdateProject();
  const { toast } = useToast();

  // Parse team assignments from project description
  const projectData = JSON.parse(project.description || '{}');
  const teamAssignments = projectData.team_assignments || {};
  
  const assignedMemberIds = Object.keys(teamAssignments);
  const assignedMembers = teamMembers.filter(member => 
    assignedMemberIds.includes(member.id)
  );

  const availableMembers = teamMembers.filter(member => 
    !assignedMemberIds.includes(member.id)
  );

  const handleAssignMember = async () => {
    if (!selectedMember || !selectedRole) {
      toast({
        title: "Missing Information",
        description: "Please select both a team member and role",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedMemberIds = [...assignedMemberIds, selectedMember];
      
      await updateProject.mutateAsync({
        id: project.id,
        // For now, we'll store team assignments in the notes field as JSON
        description: JSON.stringify({
          ...JSON.parse(project.description || '{}'),
          team_assignments: {
            ...(JSON.parse(project.description || '{}').team_assignments || {}),
            [selectedMember]: selectedRole
          }
        })
      });

      setSelectedMember("");
      setSelectedRole("");
      
      toast({
        title: "Success",
        description: "Team member assigned successfully"
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to assign team member",
        variant: "destructive"
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const updatedMemberIds = assignedMemberIds.filter(id => id !== memberId);
      const updatedRoles = { ...project.team_roles };
      delete updatedRoles[memberId];
      
      await updateProject.mutateAsync({
        id: project.id,
        description: JSON.stringify({
          ...JSON.parse(project.description || '{}'),
          team_assignments: Object.fromEntries(
            Object.entries(JSON.parse(project.description || '{}').team_assignments || {})
              .filter(([key]) => key !== memberId)
          )
        })
      });

      toast({
        title: "Success",
        description: "Team member removed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove team member", 
        variant: "destructive"
      });
    }
  };

  const handleToggleLock = async () => {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        description: JSON.stringify({
          ...JSON.parse(project.description || '{}'),
          is_locked: !isLocked
        })
      });

      setIsLocked(!isLocked);
      
      toast({
        title: "Success",
        description: `Job ${isLocked ? 'unlocked' : 'locked'} successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update job lock status",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Assigned Team Members */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Assigned Team</Label>
          {assignedMembers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No team members assigned
            </div>
          ) : (
            <div className="space-y-2">
              {assignedMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar_url} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {teamAssignments[member.id] || member.role}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Team Member */}
        {availableMembers.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <Label className="text-sm font-medium">Add Team Member</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={member.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map(role => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                onClick={handleAssignMember}
                disabled={!selectedMember || !selectedRole}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign
              </Button>
            </div>
          </div>
        )}

        {/* Job Lock Toggle */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-2">
            {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            <Label htmlFor="job-lock">Lock job for assigned team only</Label>
          </div>
          <Switch
            id="job-lock"
            checked={isLocked}
            onCheckedChange={handleToggleLock}
          />
        </div>
        {isLocked && (
          <p className="text-xs text-muted-foreground">
            Only assigned team members and admins can edit this job
          </p>
        )}
      </CardContent>
    </Card>
  );
};